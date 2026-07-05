"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchJson, ApiError } from "@/lib/fetch";
import type { TaxonomyData } from "@/lib/constants/taxonomy";

export function useTaxonomy() {
  return useQuery({
    queryKey: ["taxonomy"],
    queryFn: () => fetchJson<TaxonomyData>("/api/taxonomy"),
    staleTime: 60 * 1000,
  });
}

export function useUpdateTaxonomy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taxonomy: TaxonomyData) =>
      fetchJson<TaxonomyData>("/api/taxonomy", {
        method: "PUT",
        body: JSON.stringify(taxonomy),
      }),
    onSuccess: (data) => {
      qc.setQueryData(["taxonomy"], data);
      toast.success("تم حفظ التصنيف");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
