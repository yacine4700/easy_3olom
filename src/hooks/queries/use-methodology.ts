"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchJson, ApiError } from "@/lib/fetch";
import type { Methodology } from "@/types/domain";
import type {
  CreateMethodologyInput,
  ListMethodologiesQuery,
  UpdateMethodologyInput,
} from "@/lib/validators/methodology";

/** Query keys colocated with the hook. */
export const methodologyKeys = {
  all: ["methodology"] as const,
  lists: () => [...methodologyKeys.all, "list"] as const,
  list: (query: ListMethodologiesQuery) =>
    [...methodologyKeys.lists(), query] as const,
  details: () => [...methodologyKeys.all, "detail"] as const,
  detail: (id: string) => [...methodologyKeys.details(), id] as const,
};

export interface MethodologyListResult {
  items: Methodology[];
  total: number;
  page: number;
  pageSize: number;
}

function buildQueryString(query: ListMethodologiesQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

/** Read a list of teaching sequences with filters. */
export function useMethodologies(query: ListMethodologiesQuery) {
  return useQuery({
    queryKey: methodologyKeys.list(query),
    queryFn: () =>
      fetchJson<MethodologyListResult>(
        `/api/methodology?${buildQueryString(query)}`,
      ),
    placeholderData: (prev) => prev,
  });
}

/** Create a teaching sequence (writes through the webhook). */
export function useCreateMethodology() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMethodologyInput) =>
      fetchJson<Methodology>("/api/methodology", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: methodologyKeys.lists() });
      toast.success("تم الإرسال إلى Webhook");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

/** Update a teaching sequence (writes through the webhook). */
export function useUpdateMethodology() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateMethodologyInput;
    }) =>
      fetchJson<Methodology>(`/api/methodology/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: methodologyKeys.lists() });
      qc.invalidateQueries({ queryKey: methodologyKeys.detail(data.id) });
      toast.success("تم الإرسال إلى Webhook");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

/** Delete a teaching sequence (writes through the webhook). */
export function useDeleteMethodology() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<void>(`/api/methodology/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: methodologyKeys.lists() });
      toast.success("تم الإرسال إلى Webhook");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
