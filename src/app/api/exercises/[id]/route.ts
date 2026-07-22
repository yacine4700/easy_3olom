import { NextResponse } from "next/server";

import {
  deleteExercise,
  getExercise,
  updateExercise,
} from "@/lib/services/exercises";
import { updateExerciseSchema } from "@/lib/validators/exercises";
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

/** GET /api/exercises/[id] */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    const exercise = await getExercise(id);
    if (!exercise) return notFound("Exercise not found");
    return ok(exercise);
  } catch (error) {
    console.error("[API] GET /api/exercises/[id] failed:", error);
    return serverError();
  }
}

/** PATCH /api/exercises/[id] */
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

    const [parsed, errorResponse] = validate(updateExerciseSchema, body);
    if (errorResponse) return errorResponse;

    const exercise = await updateExercise(id, parsed);
    if (!exercise) return notFound("Exercise not found");
    return ok(exercise);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** DELETE /api/exercises/[id] */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    await deleteExercise(id);
    return noContent();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
