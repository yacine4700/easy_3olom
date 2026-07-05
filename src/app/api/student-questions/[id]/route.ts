import { NextResponse } from "next/server";

import {
  deleteStudentQuestion,
  getStudentQuestion,
  updateStudentQuestion,
} from "@/lib/services/student-question";
import { updateStudentQuestionSchema } from "@/lib/validators/student-question";
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

/** GET /api/student-questions/[id] */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    const question = await getStudentQuestion(id);
    if (!question) return notFound("Question not found");
    return ok(question);
  } catch (error) {
    console.error("[API] GET /api/student-questions/[id] failed:", error);
    return serverError();
  }
}

/**
 * PATCH /api/student-questions/[id]
 * Update the answer on a student question. Writes directly to the DB
 * (no webhook) so the answer is immediately visible to the bot.
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

    const [parsed, errorResponse] = validate(updateStudentQuestionSchema, body);
    if (errorResponse) return errorResponse;

    const question = await updateStudentQuestion(id, parsed);
    if (!question) return notFound("Question not found");
    return ok(question);
  } catch (error) {
    console.error("[API] PATCH /api/student-questions/[id] failed:", error);
    return serverError();
  }
}

/** DELETE /api/student-questions/[id] (direct DB delete, no webhook). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    const deleted = await deleteStudentQuestion(id);
    if (!deleted) return notFound("Question not found");
    return noContent();
  } catch (error) {
    console.error("[API] DELETE /api/student-questions/[id] failed:", error);
    return serverError();
  }
}
