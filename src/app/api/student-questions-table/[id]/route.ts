import { NextResponse } from "next/server";
import { deleteStudentQuestionRecord } from "@/lib/services/student-questions-table";
import { noContent, badRequest, serverError } from "@/lib/api";

function isValidId(id: string) {
  return typeof id === "string" && id.length > 0 && id.length < 64;
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) return badRequest("Invalid id");

    const deleted = await deleteStudentQuestionRecord(id);
    if (!deleted) return badRequest("Delete failed");
    return noContent();
  } catch (error) {
    console.error("[API] DELETE /api/student-questions-table/[id] failed:", error);
    return serverError();
  }
}
