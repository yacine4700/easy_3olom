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

/**
 * Update a plan via the webhook (NOT direct DB write).
 * Sends: { entity: "plan", action: "update", data: { id, ...fields } }
 */
export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdatePlanInput;
    }) =>
      fetchJson<Plan>(`/api/plans/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: planKeys.lists() });
      toast.success("تم إرسال التعديل إلى Webhook");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
