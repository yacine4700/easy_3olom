import { getPaymentDetail } from "@/lib/services/subscriptions";
import { badRequest, notFound, ok, serverError } from "@/lib/api";

function isValidId(id: string) {
  return typeof id === "string" && id.length > 0 && id.length < 64;
}

/**
 * GET /api/payments/[id]
 *
 * READ-ONLY detail endpoint. Returns the payment joined with its user and
 * subscription (which itself includes its plan). No PATCH/DELETE — payment
 * review happens through the Telegram bot + n8n flow.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    const payment = await getPaymentDetail(id);
    if (!payment) return notFound("Payment not found");
    return ok(payment);
  } catch (error) {
    console.error("[API] GET /api/payments/[id] failed:", error);
    return serverError();
  }
}
