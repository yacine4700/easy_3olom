"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchJson, ApiError } from "@/lib/fetch";
import type { GlossaryTerm } from "@/types/domain";
import type {
  CreateGlossaryTermInput,
  ListGlossaryTermsQuery,
  UpdateGlossaryTermInput,
} from "@/lib/validators/glossary";

/** Query keys colocated with the hook. */
export const glossaryKeys = {
  all: ["glossary"] as const,
  lists: () => [...glossaryKeys.all, "list"] as const,
  list: (query: ListGlossaryTermsQuery) =>
    [...glossaryKeys.lists(), query] as const,
  details: () => [...glossaryKeys.all, "detail"] as const,
  detail: (id: string) => [...glossaryKeys.details(), id] as const,
};

export interface GlossaryListResult {
  items: GlossaryTerm[];
  total: number;
  page: number;
  pageSize: number;
}

function buildQueryString(query: ListGlossaryTermsQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.domain) params.set("domain", query.domain);
  if (query.unit) params.set("unit", query.unit);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

/** Read a list of glossary terms with filters. */
export function useGlossaryTerms(query: ListGlossaryTermsQuery) {
  return useQuery({
    queryKey: glossaryKeys.list(query),
    queryFn: () =>
      fetchJson<GlossaryListResult>(`/api/glossary?${buildQueryString(query)}`),
    placeholderData: (prev) => prev,
  });
}

/** Create a glossary term (writes through the webhook). */
export function useCreateGlossaryTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGlossaryTermInput) =>
      fetchJson<GlossaryTerm>("/api/glossary", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: glossaryKeys.lists() });
      toast.success("تم الإرسال إلى Webhook");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

/** Update a glossary term (writes through the webhook). */
export function useUpdateGlossaryTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateGlossaryTermInput;
    }) =>
      fetchJson<GlossaryTerm>(`/api/glossary/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: glossaryKeys.lists() });
      qc.invalidateQueries({ queryKey: glossaryKeys.detail(data.id) });
      toast.success("تم الإرسال إلى Webhook");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

/** Delete a glossary term (writes through the webhook). */
export function useDeleteGlossaryTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<void>(`/api/glossary/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: glossaryKeys.lists() });
      toast.success("تم الإرسال إلى Webhook");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
