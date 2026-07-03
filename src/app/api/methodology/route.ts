import { NextResponse } from "next/server";

import {
  createMethodology,
  listMethodologies,
} from "@/lib/services/methodology";
import {
  createMethodologySchema,
  listMethodologiesQuerySchema,
} from "@/lib/validators/methodology";
import { created, ok, validate, serverError } from "@/lib/api";

/** GET /api/methodology — list teaching sequences with filters + pagination. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const [parsed, errorResponse] = validate(
      listMethodologiesQuerySchema,
      query,
    );
    if (errorResponse) return errorResponse;

    const result = await listMethodologies(parsed);
    return ok(result);
  } catch (error) {
    console.error("[API] GET /api/methodology failed:", error);
    return serverError();
  }
}

/** POST /api/methodology — create a teaching sequence. */
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

    const [parsed, errorResponse] = validate(createMethodologySchema, body);
    if (errorResponse) return errorResponse;

    const methodology = await createMethodology(parsed);
    return created(methodology);
  } catch (error) {
    console.error("[API] POST /api/methodology failed:", error);
    return serverError();
  }
}
