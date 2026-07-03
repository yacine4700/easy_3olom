import { NextResponse } from "next/server";

import {
  deleteKnowledgeDocument,
  getKnowledgeDocument,
  updateKnowledgeDocument,
} from "@/lib/services/knowledge-base";
import { updateKnowledgeDocumentSchema } from "@/lib/validators/knowledge-base";
import { badRequest, ok, notFound, serverError, validate, noContent } from "@/lib/api";

/** Helper: validate the id segment shape (cuid). */
function isValidId(id: string) {
  return typeof id === "string" && id.length > 0 && id.length < 64;
}

/**
 * GET /api/knowledge-base/[id]
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    const document = await getKnowledgeDocument(id);
    if (!document) return notFound("Document not found");
    return ok(document);
  } catch (error) {
    console.error("[API] GET /api/knowledge-base/[id] failed:", error);
    return serverError();
  }
}

/**
 * PATCH /api/knowledge-base/[id]
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
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const [parsed, errorResponse] = validate(updateKnowledgeDocumentSchema, body);
    if (errorResponse) return errorResponse;

    const document = await updateKnowledgeDocument(id, parsed);
    if (!document) return notFound("Document not found");
    return ok(document);
  } catch (error) {
    console.error("[API] PATCH /api/knowledge-base/[id] failed:", error);
    return serverError();
  }
}

/**
 * DELETE /api/knowledge-base/[id]
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    const deleted = await deleteKnowledgeDocument(id);
    if (!deleted) return notFound("Document not found");
    return noContent();
  } catch (error) {
    console.error("[API] DELETE /api/knowledge-base/[id] failed:", error);
    return serverError();
  }
}
