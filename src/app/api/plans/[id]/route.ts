import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { ok, badRequest, notFound, serverError, noContent } from "@/lib/api";
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

/** GET /api/plans/[id] */
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

/** PATCH /api/plans/[id] — direct DB update */
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

    const { data, error } = await supabase
      .from("plans")
      .update({
        name: parsed.name,
        code: parsed.code,
        description: parsed.description ?? null,
        price: parsed.price,
        duration_days: parsed.durationDays,
        active: parsed.active,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) return notFound("Plan not found");

    return ok(data);
  } catch (error) {
    console.error("[API] PATCH /api/plans/[id] failed:", error);
    return serverError();
  }
}

/** DELETE /api/plans/[id] — direct DB delete */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    const { error } = await supabase.from("plans").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return noContent();
  } catch (error) {
    console.error("[API] DELETE /api/plans/[id] failed:", error);
    return serverError();
  }
}

function validateBody<T>(schema: z.ZodType<T>, input: unknown): [T, null] | [null, NextResponse] {
  const result = schema.safeParse(input);
  if (result.success) return [result.data, null];
  return [null, NextResponse.json({ error: "Validation failed" }, { status: 400 })];
}
