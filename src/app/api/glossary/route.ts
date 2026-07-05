import { NextResponse } from "next/server";

import {
  createGlossaryTerm,
  listGlossaryTerms,
} from "@/lib/services/glossary";
import {
  createGlossaryTermSchema,
  listGlossaryTermsQuerySchema,
} from "@/lib/validators/glossary";
import { created, ok, validate, serverError } from "@/lib/api";

/**
 * GET /api/glossary
 * List glossary terms with optional search/domain/unit filters + pagination.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const [parsed, errorResponse] = validate(
      listGlossaryTermsQuerySchema,
      query,
    );
    if (errorResponse) return errorResponse;

    return ok(await listGlossaryTerms(parsed));
  } catch (error) {
    console.error("[API] GET /api/glossary failed:", error);
    return serverError();
  }
}

/**
 * POST /api/glossary
 * Create a new glossary term (writes go through the webhook).
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

    const [parsed, errorResponse] = validate(createGlossaryTermSchema, body);
    if (errorResponse) return errorResponse;

    return created(await createGlossaryTerm(parsed));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
