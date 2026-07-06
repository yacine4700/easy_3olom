import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase env vars");
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase
      .from("settings")
      .select("id")
      .limit(1);
    if (error && (error.code === "PGRST205" || error.code === "42P01")) {
      return { connected: false, error: "جدول الإعدادات غير موجود" };
    }
    if (error) return { connected: false, error: error.message };
    return { connected: true };
  } catch (err) {
    return { connected: false, error: err instanceof Error ? err.message : "خطأ" };
  }
}
