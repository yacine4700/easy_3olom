"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchJson, ApiError } from "@/lib/fetch";
import type { StudentQuestion } from "@/types/domain";
import type {
  ListStudentQuestionsQuery,
  UpdateStudentQuestionInput,
} from "@/lib/validators/student-question";

/** Query keys colocated with the hook. */
export const studentQuestionKeys = {
  all: ["student-questions"] as const,
  lists: () => [...studentQuestionKeys.all, "list"] as const,
  list: (query: ListStudentQuestionsQuery) =>
    [...studentQuestionKeys.lists(), query] as const,
  details: () => [...studentQuestionKeys.all, "detail"] as const,
  detail: (id: string) => [...studentQuestionKeys.details(), id] as const,
};

export interface StudentQuestionListResult {
  items: StudentQuestion[];
  total: number;
  page: number;
  pageSize: number;
}

function buildQueryString(query: ListStudentQuestionsQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

/** Read a list of student questions with filters. */
export function useStudentQuestions(query: ListStudentQuestionsQuery) {
  return useQuery({
    queryKey: studentQuestionKeys.list(query),
    queryFn: () =>
      fetchJson<StudentQuestionListResult>(
        `/api/student-questions?${buildQueryString(query)}`,
      ),
    placeholderData: (prev) => prev,
  });
}

/**
 * Update (answer) a student question. Writes directly to the DB — no webhook —
 * so the answer is immediately visible to the bot.
 */
export function useUpdateStudentQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateStudentQuestionInput;
    }) =>
      fetchJson<StudentQuestion>(`/api/student-questions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: studentQuestionKeys.lists() });
      qc.invalidateQueries({
        queryKey: studentQuestionKeys.detail(data.id),
      });
      toast.success("تم حفظ الإجابة");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

/** Delete a student question (direct DB delete, no webhook). */
export function useDeleteStudentQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<void>(`/api/student-questions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studentQuestionKeys.lists() });
      toast.success("تم حذف السؤال");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
