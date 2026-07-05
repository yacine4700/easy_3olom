import { NextResponse } from "next/server";

import {
  createKnowledgeDocument,
  listKnowledgeDocuments,
} from "@/lib/services/knowledge-base";
import {
  createKnowledgeDocumentSchema,
  listKnowledgeDocumentsQuerySchema,
} from "@/lib/validators/knowledge-base";
import { created, ok, validate, serverError } from "@/lib/api";

/**
 * GET /api/knowledge-base
 * List documents with optional search/domain/unit filters + pagination.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const [parsed, errorResponse] = validate(
      listKnowledgeDocumentsQuerySchema,
      query,
    );
    if (errorResponse) return errorResponse;

    return ok(await listKnowledgeDocuments(parsed));
  } catch (error) {
    console.error("[API] GET /api/knowledge-base failed:", error);
    return serverError();
  }
}

/**
 * POST /api/knowledge-base
 * Create a new knowledge document (writes go through the webhook).
 */
export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const [parsed, errorResponse] = validate(createKnowledgeDocumentSchema, body);
    if (errorResponse) return errorResponse;

    return created(await createKnowledgeDocument(parsed));
  } catch (error) {
    // The service throws Error with an Arabic message when the webhook fails.
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
