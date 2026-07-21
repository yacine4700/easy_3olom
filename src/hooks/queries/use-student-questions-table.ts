"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchJson, ApiError } from "@/lib/fetch";
import type { StudentQuestionsListResult } from "@/lib/services/student-questions-table";

export function useStudentQuestionsTable(search: string, page: number, pageSize: number) {
  return useQuery({
    queryKey: ["student-questions-table", search, page, pageSize],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      return fetchJson<StudentQuestionsListResult>(
        `/api/student-questions-table?${params.toString()}`,
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
