import { NextResponse } from "next/server";

import {
  createExercise,
  listExercises,
} from "@/lib/services/exercises";
import {
  createExerciseSchema,
  listExercisesQuerySchema,
} from "@/lib/validators/exercises";
import { created, ok, validate, serverError } from "@/lib/api";

/** GET /api/exercises — list exercises with filters + pagination. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const [parsed, errorResponse] = validate(
      listExercisesQuerySchema,
      query,
    );
    if (errorResponse) return errorResponse;

    return ok(await listExercises(parsed));
  } catch (error) {
    console.error("[API] GET /api/exercises failed:", error);
    return serverError();
  }
}

/** POST /api/exercises — create a new exercise. */
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

    const [parsed, errorResponse] = validate(createExerciseSchema, body);
    if (errorResponse) return errorResponse;

    return created(await createExercise(parsed));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
