import type { QuestionStatus } from "@/types/domain";

/**
 * Display labels + metadata for the QuestionStatus lifecycle (Arabic).
 *
 * Status is DERIVED from the `user_questions.answer` column on the
 * `user_questions` Supabase table: "new" while the answer is null,
 * "answered" once an answer exists. No "flagged" status anymore.
 */
export const QUESTION_STATUSES: {
  value: QuestionStatus;
  label: string;
}[] = [
  { value: "new", label: "جديد" },
  { value: "answered", label: "تمت الإجابة" },
];

/** Map a question status value to its display label. */
export function questionStatusLabel(
  value: QuestionStatus | string,
): string {
  return (
    QUESTION_STATUSES.find((s) => s.value === value)?.label ?? value
  );
}
