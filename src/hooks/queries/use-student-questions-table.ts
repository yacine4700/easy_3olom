"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchJson, ApiError } from "@/lib/fetch";
import type {
  StudentQuestionsListResult,
  ListStudentQuestionsParams,
} from "@/lib/services/student-questions-table";

export function useStudentQuestionsTable(params: ListStudentQuestionsParams) {
  return useQuery({
    queryKey: ["student-questions-table", params],
    queryFn: () => {
      const p = new URLSearchParams();
      if (params.search) p.set("search", params.search);
      if (params.questionType) p.set("questionType", params.questionType);
      if (params.topic) p.set("topic", params.topic);
      if (params.studentIntent) p.set("studentIntent", params.studentIntent);
      if (params.sort) p.set("sort", params.sort);
      p.set("page", String(params.page ?? 1));
      p.set("pageSize", String(params.pageSize ?? 20));
      return fetchJson<StudentQuestionsListResult>(
        `/api/student-questions-table?${p.toString()}`,
      );
    },
    placeholderData: (prev) => prev,
  });
}

export function useDeleteStudentQuestionTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<void>(`/api/student-questions-table/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student-questions-table"] });
      toast.success("تم حذف السؤال");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
