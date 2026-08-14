import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { notifyWebhookAction } from "@/lib/webhook";
import { badRequest, notFound, ok, serverError } from "@/lib/api";
import { z } from "zod";

function isValidId(id: string) {
  return typeof id === "string" && id.length > 0 && id.length < 64;
}

const updatePlanSchema = z.object({
  name: z.string().min(2).max(200),
  code: z.string().min(1).max(50),
  description: z.string().max(500).nullable().optional(),
  price: z.number().min(0),
  durationDays: z.number().int().min(1),
  active: z.boolean(),
});

/**
 * GET /api/plans/[id]
 * READ-ONLY — fetches a single plan.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return notFound("Plan not found");
    return ok(data);
  } catch (error) {
    console.error("[API] GET /api/plans/[id] failed:", error);
    return serverError();
  }
}

/**
 * PATCH /api/plans/[id]
 *
 * Does NOT write to the database directly. Instead:
 * 1. Reads the existing plan (SELECT — for the webhook payload context)
 * 2. Sends the update via the webhook: { entity: "plan", action: "update", data }
 * 3. Returns the submitted data (not the DB record — the webhook hasn't
 *    processed yet; the UI refreshes via query invalidation)
 */
export async function PATCH(
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
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const [parsed, errorResponse] = validateBody(updatePlanSchema, body);
    if (errorResponse) return errorResponse;

    // Send to webhook — NO direct DB write
    const result = await notifyWebhookAction("plan", "update", {
      id,
      ...parsed,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return ok({ id, ...parsed });
  } catch (error) {
    console.error("[API] PATCH /api/plans/[id] failed:", error);
    return serverError();
  }
}

function validateBody<T>(schema: z.ZodType<T>, input: unknown): [T, null] | [null, NextResponse] {
  const result = schema.safeParse(input);
  if (result.success) return [result.data, null];
  return [null, NextResponse.json({ error: "Validation failed" }, { status: 400 })];
}
