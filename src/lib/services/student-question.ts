import { supabase } from "@/lib/supabase";
import type { StudentQuestion, QuestionStatus } from "@/types/domain";
import type { ListStudentQuestionsQuery, UpdateStudentQuestionInput } from "@/lib/validators/student-question";

const TABLE = "user_questions";

type Row = {
  id: number | string; question: string; answer: string | null;
  session_id: string | null; user_id: string | null; created_at: string | null;
};

function toDomain(r: Row): StudentQuestion {
  return { id: String(r.id), question: r.question, answer: r.answer, sessionId: r.session_id, userId: r.user_id, createdAt: r.created_at ?? undefined };
}

export interface StudentQuestionListResult { items: StudentQuestion[]; total: number; page: number; pageSize: number; }

export async function listStudentQuestions(query: ListStudentQuestionsQuery): Promise<StudentQuestionListResult> {
  const { search, status, page, pageSize } = query;
  let req = supabase.from(TABLE).select("*", { count: "exact" });
  if (search) req = req.or(`question.ilike.%${search}%,answer.ilike.%${search}%`);
  if (status === "new") req = req.is("answer", null);
  else if (status === "answered") req = req.not("answer", "is", null);
  req = req.order("created_at", { ascending: false, nullsFirst: false }).range((page - 1) * pageSize, page * pageSize - 1);
  const { data, error, count } = await req;
  if (error) throw error;
  return { items: (data as Row[]).map(toDomain), total: count ?? 0, page, pageSize };
}

export async function getStudentQuestion(id: string): Promise<StudentQuestion | null> {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error || !data) return null;
  return toDomain(data as Row);
}

export async function updateStudentQuestion(id: string, input: UpdateStudentQuestionInput): Promise<StudentQuestion | null> {
  const update: Record<string, unknown> = {};
  if (input.answer !== undefined) update.answer = input.answer;
  const { data, error } = await supabase.from(TABLE).update(update).eq("id", id).select().single();
  if (error || !data) return null;
  return toDomain(data as Row);
}

export async function deleteStudentQuestion(id: string): Promise<boolean> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  return !error;
}

export async function getStudentQuestionStats() {
  const [totalRes, newRes, answeredRes] = await Promise.all([
    supabase.from(TABLE).select("*", { count: "exact", head: true }),
    supabase.from(TABLE).select("*", { count: "exact", head: true }).is("answer", null),
    supabase.from(TABLE).select("*", { count: "exact", head: true }).not("answer", "is", null),
  ]);
  return { total: totalRes.count ?? 0, new: newRes.count ?? 0, answered: answeredRes.count ?? 0 };
}

export async function getRecentUnansweredQuestions(limit = 5): Promise<StudentQuestion[]> {
  const { data, error } = await supabase.from(TABLE).select("*").is("answer", null).order("created_at", { ascending: false, nullsFirst: false }).limit(limit);
  if (error) throw error;
  return (data as Row[]).map(toDomain);
}
