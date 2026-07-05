"use client";

import * as React from "react";
import { RotateCcw, Save } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUpdateSettings } from "@/hooks/queries/use-settings";
import type { SettingItem, SettingsByGroup } from "@/lib/services/settings";
import { SettingField } from "./setting-field";

export interface SettingsFormProps {
  groups: SettingsByGroup[];
}

/**
 * Client-side settings editor.
 *
 * State model: `groups` mirrors the server snapshot, `overrides` is a map of
 * dirty keys → pending values. Only keys present in `overrides` are sent on
 * save, so masked or untouched secret fields are never re-submitted. After a
 * successful save the local `groups` snapshot is replaced with the server
 * response (which re-masks secrets and recomputes `hasValue`).
 */
export function SettingsForm({ groups: initialGroups }: SettingsFormProps) {
  const [groups, setGroups] = React.useState<SettingsByGroup[]>(initialGroups);
  const [overrides, setOverrides] = React.useState<Record<string, string>>({});
  const updateMutation = useUpdateSettings();

  // Re-sync from the server prop if the parent ever hands us a new snapshot
  // (e.g., after a manual router refresh). Does not clobber post-save local
  // state because the prop reference is stable across client-side mutations.
  React.useEffect(() => {
    setGroups(initialGroups);
    setOverrides({});
  }, [initialGroups]);

  const dirtyCount = Object.keys(overrides).length;
  const isDirty = dirtyCount > 0;
  const isSaving = updateMutation.isPending;

  function handleChange(key: string, value: string) {
    setOverrides((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    setOverrides({});
  }

  async function handleSave() {
    if (!isDirty || isSaving) return;
    const result = await updateMutation.mutateAsync({
      settings: overrides,
    });
    setGroups(result);
    setOverrides({});
  }

  function getEffectiveValue(item: SettingItem): string {
    return item.key in overrides ? overrides[item.key] : item.value;
  }

  function getEffectiveHasValue(item: SettingItem): boolean {
    if (item.key in overrides) return Boolean(overrides[item.key]);
    return item.hasValue;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <Card key={group.group}>
            <CardHeader>
              <CardTitle>{group.label}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.items.map((item) => (
                <SettingField
                  key={item.key}
                  label={item.label}
                  value={getEffectiveValue(item)}
                  onChange={(v) => handleChange(item.key, v)}
                  secret={item.secret}
                  placeholder={item.placeholder}
                  help={item.help}
                  hasValue={getEffectiveHasValue(item)}
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-4 z-20">
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-xl border p-3 shadow-lg backdrop-blur",
            "bg-card/95 supports-[backdrop-filter]:bg-card/80",
            isDirty
              ? "border-amber-500/40"
              : "border-emerald-500/30",
          )}
        >
          <div className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                isDirty ? "bg-amber-500" : "bg-emerald-500",
              )}
            />
            {isDirty ? (
              <span className="font-medium">
                {dirtyCount} تغيير غير محفوظ
              </span>
            ) : (
              <span className="text-muted-foreground">
                تم حفظ جميع التغييرات
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isDirty ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
              >
                <RotateCcw className="size-4" />
                تراجع
              </Button>
            ) : null}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
            >
              <Save className="size-4" />
              {isSaving ? "جارٍ الحفظ…" : "حفظ التغييرات"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
