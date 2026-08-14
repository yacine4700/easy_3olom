import { supabase } from "@/lib/supabase";

export type WebhookEntity =
  | "knowledge"
  | "methodology"
  | "glossary"
  | "payment"
  | "plan"
  | "subscription"
  | "user";

export type WebhookAction =
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "activate"
  | "suspend"
  | "cancel"
  | "renew";

export interface WebhookResult {
  success: boolean;
  error?: string;
}

let cachedUrl: string | null | undefined = undefined;
let cachedAt = 0;
const CACHE_TTL = 30_000;

async function getWebhookUrl(): Promise<string | null> {
  if (Date.now() - cachedAt < CACHE_TTL && cachedUrl !== undefined) {
    return cachedUrl;
  }
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "webhook.url")
      .single();
    cachedUrl = error || !data ? null : (data as { value: string }).value || null;
  } catch {
    cachedUrl = null;
  }
  cachedAt = Date.now();
  return cachedUrl;
}

export async function notifyWebhook(
  entity: WebhookEntity,
  action: WebhookAction,
  payload: Record<string, unknown> | string | number,
): Promise<WebhookResult> {
  const url = await getWebhookUrl();
  if (!url) {
    return { success: false, error: "رابط Webhook غير مُضبوط. اذهب إلى الإعدادات وأدخل الرابط." };
  }

  const body =
    action === "delete"
      ? JSON.stringify({ entity, action: "delete", id: payload as string | number })
      : JSON.stringify({ entity, action, data: payload as Record<string, unknown> });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return { success: false, error: `Webhook أعاد ${res.status} ${res.statusText}` };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: `فشل إرسال Webhook: ${error instanceof Error ? error.message : "خطأ"}` };
  }
}

/**
 * Convenience wrapper that always sends the payload as `data`.
 *
 * Used for domain actions that aren't CRUD (e.g. payment.approve,
 * subscription.suspend). The body shape mirrors `notifyWebhook` for non-delete
 * actions so the receiving end can use a single parser:
 *
 *   { entity: "payment", action: "approve", data: { id, ...fields } }
 *
 * Provided as a separate export so call sites read more naturally:
 *
 *   await notifyWebhookAction("payment", "approve", { id, ... });
 */
export async function notifyWebhookAction(
  entity: WebhookEntity,
  action: WebhookAction,
  data: Record<string, unknown>,
): Promise<WebhookResult> {
  return notifyWebhook(entity, action, data);
}
