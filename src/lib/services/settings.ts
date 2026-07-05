import { supabase } from "@/lib/supabase";
import { SETTING_DEFINITIONS, SETTING_GROUPS, SETTING_MAP, SECRET_MASK, isMaskedValue } from "@/lib/constants/settings";
import type { UpdateSettingsInput } from "@/lib/validators/settings";

export interface SettingItem {
  key: string; group: string; label: string; secret: boolean;
  value: string; placeholder?: string; help?: string; hasValue: boolean;
}

export interface SettingsByGroup {
  group: string; label: string; description: string; items: SettingItem[];
}

type SettingRow = { id: string; key: string; value: string; secret: boolean };

function maskSecret(value: string): string { return value ? SECRET_MASK : ""; }

async function ensureDefaults(): Promise<void> {
  const { data, error } = await supabase.from("settings").select("key");
  if (error && (error.code === "PGRST205" || error.code === "42P01")) return;
  if (error) throw error;
  const existingKeys = new Set((data ?? []).map((r: { key: string }) => r.key));
  const missing = SETTING_DEFINITIONS.filter((def) => !existingKeys.has(def.key));
  if (missing.length > 0) {
    const { error: insertError } = await supabase.from("settings").insert(missing.map((def) => ({ key: def.key, value: def.defaultValue, secret: def.secret })));
    if (insertError && insertError.code !== "23505") throw insertError;
  }
}

export async function getAllSettings(): Promise<SettingsByGroup[]> {
  await ensureDefaults();
  const { data, error } = await supabase.from("settings").select("*");
  if (error) throw error;
  const valueMap = new Map((data as SettingRow[]).map((r) => [r.key, r.value]));
  return SETTING_GROUPS.map((groupMeta) => ({
    group: groupMeta.key, label: groupMeta.label, description: groupMeta.description,
    items: SETTING_DEFINITIONS.filter((d) => d.group === groupMeta.key).map((def) => {
      const rawValue = valueMap.get(def.key) ?? def.defaultValue;
      return { key: def.key, group: def.group, label: def.label, secret: def.secret,
        value: def.secret ? maskSecret(rawValue) : rawValue, placeholder: def.placeholder, help: def.help, hasValue: Boolean(rawValue) };
    }),
  }));
}

export async function updateSettings(input: UpdateSettingsInput): Promise<SettingsByGroup[]> {
  await ensureDefaults();
  for (const [key, value] of Object.entries(input.settings)) {
    const def = SETTING_MAP.get(key);
    if (!def) continue;
    if (def.secret && (isMaskedValue(value) || value === "")) continue;
    const { error } = await supabase.from("settings").upsert({ key, value, secret: def.secret }, { onConflict: "key" });
    if (error) throw error;
  }
  return getAllSettings();
}
