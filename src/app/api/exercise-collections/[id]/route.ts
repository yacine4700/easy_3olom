import { NextResponse } from "next/server";

import {
  deleteExerciseCollection,
  getExerciseCollection,
  updateExerciseCollection,
} from "@/lib/services/exercises";
import { updateExerciseCollectionSchema } from "@/lib/validators/exercises";
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

/** GET /api/exercise-collections/[id] */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    const collection = await getExerciseCollection(id);
    if (!collection) return notFound("Collection not found");
    return ok(collection);
  } catch (error) {
    console.error("[API] GET /api/exercise-collections/[id] failed:", error);
    return serverError();
  }
}

/** PATCH /api/exercise-collections/[id] */
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

    const [parsed, errorResponse] = validate(updateExerciseCollectionSchema, body);
    if (errorResponse) return errorResponse;

    const collection = await updateExerciseCollection(id, parsed);
    if (!collection) return notFound("Collection not found");
    return ok(collection);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** DELETE /api/exercise-collections/[id] */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    await deleteExerciseCollection(id);
    return noContent();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
