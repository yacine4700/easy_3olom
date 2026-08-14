"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchJson, ApiError } from "@/lib/fetch";
import { planKeys } from "@/hooks/queries/use-subscriptions";
import type { Plan } from "@/types/subscriptions";

interface UpdatePlanInput {
  name: string;
  code: string;
  description: string | null;
  price: number;
  durationDays: number;
  active: boolean;
}

interface CreatePlanInput {
  name: string;
  code: string;
  description: string | null;
  price: number;
  durationDays: number;
  active: boolean;
}

/** Create a plan — direct DB insert via API */
export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlanInput) =>
      fetchJson<Plan>("/api/plans", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: planKeys.lists() });
      toast.success("تم إنشاء الخطة");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

/** Update a plan — direct DB update via API */
export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePlanInput }) =>
      fetchJson<Plan>(`/api/plans/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: planKeys.lists() });
      toast.success("تم حفظ التغييرات");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

/** Delete a plan — direct DB delete via API */
export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<void>(`/api/plans/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: planKeys.lists() });
      toast.success("تم حذف الخطة");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
