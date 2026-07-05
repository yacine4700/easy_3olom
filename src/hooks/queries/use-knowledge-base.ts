"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchJson, ApiError } from "@/lib/fetch";
import type { KnowledgeDocument } from "@/types/domain";
import type {
  CreateKnowledgeDocumentInput,
  ListKnowledgeDocumentsQuery,
  UpdateKnowledgeDocumentInput,
} from "@/lib/validators/knowledge-base";

/** Query keys are colocated with the hook to keep cache invalidation tidy. */
export const knowledgeBaseKeys = {
  all: ["knowledge-base"] as const,
  lists: () => [...knowledgeBaseKeys.all, "list"] as const,
  list: (query: ListKnowledgeDocumentsQuery) =>
    [...knowledgeBaseKeys.lists(), query] as const,
  details: () => [...knowledgeBaseKeys.all, "detail"] as const,
  detail: (id: string) => [...knowledgeBaseKeys.details(), id] as const,
};

export interface ListResult {
  items: KnowledgeDocument[];
  total: number;
  page: number;
  pageSize: number;
}

function buildQueryString(query: ListKnowledgeDocumentsQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.domain) params.set("domain", query.domain);
  if (query.unit) params.set("unit", query.unit);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

/** Read a list of documents with filters. */
export function useKnowledgeDocuments(query: ListKnowledgeDocumentsQuery) {
  return useQuery({
    queryKey: knowledgeBaseKeys.list(query),
    queryFn: () =>
      fetchJson<ListResult>(`/api/knowledge-base?${buildQueryString(query)}`),
    placeholderData: (prev) => prev, // keep previous data while refetching
  });
}

/** Create a document (writes through the webhook). */
export function useCreateKnowledgeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateKnowledgeDocumentInput) =>
      fetchJson<KnowledgeDocument>("/api/knowledge-base", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: knowledgeBaseKeys.lists() });
      toast.success("تم الإرسال إلى Webhook");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

/** Update a document (writes through the webhook). */
export function useUpdateKnowledgeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateKnowledgeDocumentInput;
    }) =>
      fetchJson<KnowledgeDocument>(`/api/knowledge-base/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: knowledgeBaseKeys.lists() });
      qc.invalidateQueries({
        queryKey: knowledgeBaseKeys.detail(data.id),
      });
      toast.success("تم الإرسال إلى Webhook");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

/** Delete a document (writes through the webhook). */
export function useDeleteKnowledgeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<void>(`/api/knowledge-base/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: knowledgeBaseKeys.lists() });
      toast.success("تم الإرسال إلى Webhook");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
