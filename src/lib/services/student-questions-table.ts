import { supabase } from "@/lib/supabase";

/**
 * Student Questions (student_questions table) service — read + delete only.
 *
 * This table is populated by the n8n/Telegram pipeline. The admin can view
 * and delete records but not create or edit them.
 *
 * Columns: id, session_id, user_id, question, topic, question_type, answer,
 *          student_intent, created_at
 */

const TABLE = "student_questions";

export interface StudentQuestionRecord {
  id: string;
  sessionId: string | null;
  userId: string | null;
  question: string;
  topic: string | null;
  questionType: string | null;
  answer: string | null;
  studentIntent: string | null;
  createdAt: string | null;
}

type Row = {
  id: number | string;
  session_id: string | null;
  user_id: string | null;
  question: string;
  topic: string | null;
  question_type: string | null;
  answer: string | null;
  student_intent: string | null;
  created_at: string | null;
};

function toDomain(r: Row): StudentQuestionRecord {
  return {
    id: String(r.id),
    sessionId: r.session_id,
    userId: r.user_id,
    question: r.question,
    topic: r.topic,
    questionType: r.question_type,
    answer: r.answer,
    studentIntent: r.student_intent,
    createdAt: r.created_at,
  };
}

export interface StudentQuestionsListResult {
  items: StudentQuestionRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListStudentQuestionsParams {
  search?: string;
  questionType?: string;
  topic?: string;
  studentIntent?: string;
  sort?: "newest" | "oldest";
  page?: number;
  pageSize?: number;
}

export async function listStudentQuestionsRecords(
  params: ListStudentQuestionsParams = {},
): Promise<StudentQuestionsListResult> {
  const {
    search,
    questionType,
    topic,
    studentIntent,
    sort = "newest",
    page = 1,
    pageSize = 20,
  } = params;

  let req = supabase.from(TABLE).select("*", { count: "exact" });

  if (search) {
    req = req.or(
      `question.ilike.%${search}%,answer.ilike.%${search}%,topic.ilike.%${search}%`,
    );
  }
  if (questionType) req = req.eq("question_type", questionType);
  if (topic) req = req.eq("topic", topic);
  if (studentIntent) req = req.eq("student_intent", studentIntent);

  req = req
    .order("created_at", { ascending: sort === "oldest", nullsFirst: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await req;
  if (error) throw error;

  return {
    items: (data as Row[]).map(toDomain),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function deleteStudentQuestionRecord(id: string): Promise<boolean> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function getStudentQuestionsStats(): Promise<{
  total: number;
  answered: number;
  new: number;
}> {
  const [totalRes, answeredRes] = await Promise.all([
    supabase.from(TABLE).select("*", { count: "exact", head: true }),
    supabase
      .from(TABLE)
      .select("*", { count: "exact", head: true })
      .not("answer", "is", null),
  ]);
  const total = totalRes.count ?? 0;
  const answered = answeredRes.count ?? 0;
  return { total, answered, new: total - answered };
}

export async function getRecentStudentQuestions(
  limit = 5,
): Promise<StudentQuestionRecord[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data as Row[]).map(toDomain);
}
