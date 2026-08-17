import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (client) {
    return client;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase env vars");
  }

  client = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return client;
}

export const supabase =
  new Proxy({} as SupabaseClient, {
    get(_target, property) {
      const currentClient = getSupabaseClient();
      const value =
        currentClient[property as keyof SupabaseClient];

      if (typeof value === "function") {
        return value.bind(currentClient);
      }

      return value;
    },
  });

export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase
      .from("settings")
      .select("id")
      .limit(1);

    if (!error) {
      return {
        connected: true,
        error: null,
      };
    }

    if (
      error.code === "PGRST205" ||
      error.code === "42P01"
    ) {
      return {
        connected: false,
        error: "جدول الإعدادات غير موجود",
      };
    }

    return {
      connected: false,
      error: error.message,
    };
  } catch (err) {
    return {
      connected: false,
      error:
        err instanceof Error
          ? err.message
          : "خطأ غير معروف في الاتصال بقاعدة البيانات",
    };
  }
}
