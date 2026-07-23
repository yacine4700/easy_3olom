import { NextResponse } from "next/server";
import { listStudentQuestionsRecords } from "@/lib/services/student-questions-table";
import { ok, serverError } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const questionType = searchParams.get("questionType") || undefined;
    const topic = searchParams.get("topic") || undefined;
    const studentIntent = searchParams.get("studentIntent") || undefined;
    const sort = (searchParams.get("sort") as "newest" | "oldest") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    const result = await listStudentQuestionsRecords({
      search,
      questionType,
      topic,
      studentIntent,
      sort,
      page,
      pageSize,
    });
    return ok(result);
  } catch (error) {
    console.error("[API] GET /api/student-questions-table failed:", error);
    return serverError();
  }
}
