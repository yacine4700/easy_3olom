import { NextResponse } from "next/server";

import {
  createExerciseCollection,
  listExerciseCollections,
} from "@/lib/services/exercises";
import {
  createExerciseCollectionSchema,
  listExerciseCollectionsQuerySchema,
} from "@/lib/validators/exercises";
import { created, ok, validate, serverError } from "@/lib/api";

/** GET /api/exercise-collections — list exercise collections with filters + pagination. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const [parsed, errorResponse] = validate(
      listExerciseCollectionsQuerySchema,
      query,
    );
    if (errorResponse) return errorResponse;

    return ok(await listExerciseCollections(parsed));
  } catch (error) {
    console.error("[API] GET /api/exercise-collections failed:", error);
    return serverError();
  }
}

/** POST /api/exercise-collections — create a new exercise collection. */
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

    const [parsed, errorResponse] = validate(createExerciseCollectionSchema, body);
    if (errorResponse) return errorResponse;

    return created(await createExerciseCollection(parsed));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
