import { NextResponse } from "next/server";

import {
  deleteGlossaryTerm,
  getGlossaryTerm,
  updateGlossaryTerm,
} from "@/lib/services/glossary";
import { updateGlossaryTermSchema } from "@/lib/validators/glossary";
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

/** GET /api/glossary/[id] */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    const term = await getGlossaryTerm(id);
    if (!term) return notFound("Term not found");
    return ok(term);
  } catch (error) {
    console.error("[API] GET /api/glossary/[id] failed:", error);
    return serverError();
  }
}

/** PATCH /api/glossary/[id] */
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

    const [parsed, errorResponse] = validate(updateGlossaryTermSchema, body);
    if (errorResponse) return errorResponse;

    const term = await updateGlossaryTerm(id, parsed);
    if (!term) return notFound("Term not found");
    return ok(term);
  } catch (error) {
    console.error("[API] PATCH /api/glossary/[id] failed:", error);
    return serverError();
  }
}

/** DELETE /api/glossary/[id] */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    const deleted = await deleteGlossaryTerm(id);
    if (!deleted) return notFound("Term not found");
    return noContent();
  } catch (error) {
    console.error("[API] DELETE /api/glossary/[id] failed:", error);
    return serverError();
  }
}
