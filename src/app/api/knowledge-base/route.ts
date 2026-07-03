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
 * List documents with optional search/level/status filters + pagination.
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

    const result = await listKnowledgeDocuments(parsed);
    return ok(result);
  } catch (error) {
    console.error("[API] GET /api/knowledge-base failed:", error);
    return serverError();
  }
}

/**
 * POST /api/knowledge-base
 * Create a new knowledge document.
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

    const document = await createKnowledgeDocument(parsed);
    return created(document);
  } catch (error) {
    console.error("[API] POST /api/knowledge-base failed:", error);
    return serverError();
  }
}
