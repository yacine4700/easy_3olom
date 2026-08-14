import { listPlans } from "@/lib/services/subscriptions";
import { listPlansQuerySchema } from "@/lib/validators/subscriptions";
import { ok, serverError, validate } from "@/lib/api";

/**
 * GET /api/plans
 *
 * READ-ONLY. Supports `search`, `active` (`"true"`/`"false"`), `sort`, `page`,
 * `pageSize` query params. No POST/PATCH/DELETE — plans are managed from the
 * Telegram bot / n8n flow.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const [parsed, errorResponse] = validate(listPlansQuerySchema, query);
    if (errorResponse) return errorResponse;

    return ok(await listPlans(parsed));
  } catch (error) {
    console.error("[API] GET /api/plans failed:", error);
    return serverError();
  }
}
