import { z } from "zod";
import { QUESTION_STATUSES } from "@/lib/constants/education";

const statusValues = QUESTION_STATUSES.map((s) => s.value) as [string, ...string[]];

export const updateStudentQuestionSchema = z.object({
  answer: z.string().max(5000).nullable().default(null),
});
export const listStudentQuestionsQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(statusValues).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type UpdateStudentQuestionInput = z.infer<typeof updateStudentQuestionSchema>;
export type ListStudentQuestionsQuery = z.infer<typeof listStudentQuestionsQuerySchema>;
