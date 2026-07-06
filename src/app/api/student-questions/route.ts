import { listStudentQuestions } from "@/lib/services/student-question";
import { listStudentQuestionsQuerySchema } from "@/lib/validators/student-question";
import { ok, validate, serverError } from "@/lib/api";

/**
 * GET /api/student-questions
 * List student questions with optional search/status filters + pagination.
 *
 * NOTE: there is no POST here. Student questions arrive via Telegram and are
 * written to the DB by an external pipeline; the admin can only answer or
 * delete them.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const [parsed, errorResponse] = validate(
      listStudentQuestionsQuerySchema,
      query,
    );
    if (errorResponse) return errorResponse;

    return ok(await listStudentQuestions(parsed));
  } catch (error) {
    console.error("[API] GET /api/student-questions failed:", error);
    return serverError();
  }
}
