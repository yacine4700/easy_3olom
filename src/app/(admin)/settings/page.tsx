import type { Metadata } from "next";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Settings as SettingsIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsForm } from "@/components/settings/settings-form";
import { getAllSettings, type SettingsByGroup } from "@/lib/services/settings";
import { checkSupabaseConnection } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "الإعدادات" };

/** SQL a fresh Supabase project needs before this page can persist changes. */
const SETTINGS_TABLE_SQL = `create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null default '',
  secret boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "Service role full access"
  on public.settings
  for all
  using (auth.role() = 'service_role');`;

/** Marker returned by checkSupabaseConnection when the settings table is missing. */
const SETTINGS_MISSING_ERROR = "جدول الإعدادات غير موجود";

type SettingsResult =
  | { ok: true; data: SettingsByGroup[] }
  | { ok: false; error: string };

/**
 * /settings — workspace configuration.
 *
 * Server Component: runs the Supabase connection probe + settings read in
 * parallel. The settings read is wrapped in try/catch so a missing table or
 * any other unexpected failure doesn't crash the page — instead we surface
 * the SQL setup card or an inline error and let the connection banner tell
 * the admin whether Supabase itself is reachable.
 */
export default async function SettingsPage() {
  const [connection, settingsResult] = await Promise.all([
    checkSupabaseConnection(),
    getAllSettings()
      .then((data) => ({ ok: true, data }) as SettingsResult)
      .catch(
        (err: unknown) =>
          ({
            ok: false,
            error: err instanceof Error ? err.message : "خطأ غير معروف",
          }) as SettingsResult,
      ),
  ]);

  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  let supabaseHost = "";
  try {
    supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : "";
  } catch {
    supabaseHost = "";
  }

  const settingsTableMissing =
    !connection.connected && connection.error === SETTINGS_MISSING_ERROR;
  const groups: SettingsByGroup[] = settingsResult.ok ? settingsResult.data : [];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="bg-brand/10 text-brand flex size-7 items-center justify-center rounded-md">
            <SettingsIcon className="size-4" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">الإعدادات</h1>
          <Badge variant="secondary" className="font-medium">
            مساحة العمل
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          إعدادات عامة وتكامل Webhook للمساعد.
        </p>
      </div>

      {/* Supabase connection banner */}
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border p-4",
          connection.connected
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-destructive/30 bg-destructive/5",
        )}
      >
        {connection.connected ? (
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <AlertTriangle className="text-destructive size-5 shrink-0" />
        )}
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium">
            {connection.connected
              ? "متصل بقاعدة البيانات"
              : "غير متصل بقاعدة البيانات"}
          </p>
          <p className="text-muted-foreground text-xs" dir="ltr">
            {connection.connected
              ? supabaseHost || supabaseUrl || "—"
              : (connection.error ?? "خطأ غير معروف")}
          </p>
        </div>
      </div>

      {/* SQL setup instructions — only when the settings table itself is missing */}
      {settingsTableMissing ? (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-4" />
              جدول الإعدادات غير موجود
            </CardTitle>
            <CardDescription>
              أنشئ الجدول في Supabase لتتمكن من حفظ التغييرات.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre
              dir="ltr"
              className="bg-muted/70 overflow-x-auto rounded-md p-4 text-xs leading-relaxed"
            >
              <code className="font-mono">{SETTINGS_TABLE_SQL}</code>
            </pre>
          </CardContent>
        </Card>
      ) : null}

      {/* Inline load error — connected but getAllSettings threw for another reason */}
      {!settingsResult.ok && !settingsTableMissing ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="size-4" />
              تعذّر تحميل الإعدادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm" dir="ltr">
              {settingsResult.error}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {groups.length > 0 ? <SettingsForm groups={groups} /> : null}
    </div>
  );
}
