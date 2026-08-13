import {
  getSubscriptionStats,
  listSubscriptions,
} from "@/lib/services/subscriptions";
import { listSubscriptionsQuerySchema } from "@/lib/validators/subscriptions";
import { ok, serverError, validate } from "@/lib/api";

/**
 * GET /api/subscriptions
 *
 * READ-ONLY. Supports `search`, `status`, `sort`, `page`, `pageSize` query
 * params. Pass `?stats=1` to fetch the dashboard KPI counts instead of the
 * paginated list — keeps the dashboard fetch to a single round-trip.
 *
 * No POST/PATCH/DELETE — the admin UI never writes to `subscriptions`.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    if (searchParams.get("stats") === "1") {
      const stats = await getSubscriptionStats();
      return ok(stats);
    }

    const query = Object.fromEntries(searchParams.entries());
    const [parsed, errorResponse] = validate(
      listSubscriptionsQuerySchema,
      query,
    );
    if (errorResponse) return errorResponse;

    return ok(await listSubscriptions(parsed));
  } catch (error) {
    console.error("[API] GET /api/subscriptions failed:", error);
    return serverError();
  }
}
