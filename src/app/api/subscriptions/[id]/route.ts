import { getSubscriptionDetail } from "@/lib/services/subscriptions";
import { badRequest, notFound, ok, serverError } from "@/lib/api";

function isValidId(id: string) {
  return typeof id === "string" && id.length > 0 && id.length < 64;
}

/**
 * GET /api/subscriptions/[id]
 *
 * READ-ONLY detail endpoint. Returns the subscription joined with its user,
 * plan, and the subscription's own payments. No PATCH/DELETE — the admin UI
 * never mutates subscriptions.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    const subscription = await getSubscriptionDetail(id);
    if (!subscription) return notFound("Subscription not found");
    return ok(subscription);
  } catch (error) {
    console.error("[API] GET /api/subscriptions/[id] failed:", error);
    return serverError();
  }
}
