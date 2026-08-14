import { NextResponse } from "next/server";

import { reviewPayment } from "@/lib/services/subscriptions";
import { reviewPaymentSchema } from "@/lib/validators/subscriptions";
import { badRequest, noContent, serverError, validate } from "@/lib/api";

function isValidId(id: string) {
  return typeof id === "string" && id.length > 0 && id.length < 64;
}

/**
 * POST /api/payments/[id]/review
 *
 * Body: `{ "action": "approve" | "reject" }`.
 *
 * Forwards the request to the configured webhook (entity = "payment") with
 * the payment's full row as `data`. The webhook (Telegram bot / n8n) is the
 * only writer — the admin UI never updates the `payments` table directly.
 *
 * Returns 204 on success; the client refetches the lists/details itself.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const [parsed, errorResponse] = validate(reviewPaymentSchema, body);
    if (errorResponse) return errorResponse;

    await reviewPayment(id, parsed.action);
    return noContent();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    if (
      message.includes("Webhook") ||
      message.includes("غير موجودة") ||
      message.includes("فشل")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("[API] POST /api/payments/[id]/review failed:", error);
    return serverError();
  }
}
