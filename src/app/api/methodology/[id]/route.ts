import { NextResponse } from "next/server";

import {
  deleteMethodology,
  getMethodology,
  updateMethodology,
} from "@/lib/services/methodology";
import { updateMethodologySchema } from "@/lib/validators/methodology";
import {
  badRequest,
  ok,
  notFound,
  serverError,
  validate,
  noContent,
} from "@/lib/api";

function isValidId(id: string) {
  return typeof id === "string" && id.length > 0 && id.length < 64;
}

/** GET /api/methodology/[id] */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    const methodology = await getMethodology(id);
    if (!methodology) return notFound("Methodology not found");
    return ok(methodology);
  } catch (error) {
    console.error("[API] GET /api/methodology/[id] failed:", error);
    return serverError();
  }
}

/** PATCH /api/methodology/[id] (writes go through the webhook). */
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
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const [parsed, errorResponse] = validate(updateMethodologySchema, body);
    if (errorResponse) return errorResponse;

    const methodology = await updateMethodology(id, parsed);
    if (!methodology) return notFound("Methodology not found");
    return ok(methodology);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** DELETE /api/methodology/[id] (writes go through the webhook). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    await deleteMethodology(id);
    return noContent();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
