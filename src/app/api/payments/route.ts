import { listPayments } from "@/lib/services/subscriptions";
import { listPaymentsQuerySchema } from "@/lib/validators/subscriptions";
import { ok, serverError, validate } from "@/lib/api";

/**
 * GET /api/payments
 *
 * READ-ONLY. Supports `search`, `status`, `sort`, `page`, `pageSize` query
 * params. No POST/PATCH/DELETE — payments are reviewed/approved through the
 * Telegram bot + n8n flow, not from this admin UI.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const [parsed, errorResponse] = validate(
      listPaymentsQuerySchema,
      query,
    );
    if (errorResponse) return errorResponse;

    return ok(await listPayments(parsed));
  } catch (error) {
    console.error("[API] GET /api/payments failed:", error);
    return serverError();
  }
}
