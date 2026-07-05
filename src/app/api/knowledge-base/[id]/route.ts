import { NextResponse } from "next/server";

import {
  deleteKnowledgeDocument,
  getKnowledgeDocument,
  updateKnowledgeDocument,
} from "@/lib/services/knowledge-base";
import { updateKnowledgeDocumentSchema } from "@/lib/validators/knowledge-base";
import {
  badRequest,
  ok,
  notFound,
  serverError,
  validate,
  noContent,
} from "@/lib/api";

/** Validate the id segment shape (Supabase UUID or numeric string, 1-63 chars). */
function isValidId(id: string) {
  return typeof id === "string" && id.length > 0 && id.length < 64;
}

/** GET /api/knowledge-base/[id] */
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

/** PATCH /api/knowledge-base/[id] (writes go through the webhook). */
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
    // Webhook failure surfaces as Error with an Arabic message.
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** DELETE /api/knowledge-base/[id] (writes go through the webhook). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    await deleteKnowledgeDocument(id);
    return noContent();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
