"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchJson, ApiError } from "@/lib/fetch";
import { SECRET_MASK } from "@/lib/constants/settings";
import type {
  SettingItem,
  SettingsByGroup,
} from "@/lib/services/settings";
import type { UpdateSettingsInput } from "@/lib/validators/settings";

/** Query keys colocated with the hook. */
export const settingsKeys = {
  all: ["settings"] as const,
  list: () => [...settingsKeys.all, "list"] as const,
};

/** Apply the user's input optimistically to the cached settings. */
function applyOptimistic(
  current: SettingsByGroup[],
  input: UpdateSettingsInput,
): SettingsByGroup[] {
  return current.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      const next = input.settings[item.key];
      if (next === undefined) return item;
      // Secret fields show the mask when a real value is being set.
      const value = item.secret ? SECRET_MASK : next;
      const updated: SettingItem = { ...item, value, hasValue: item.secret ? true : Boolean(next) };
      return updated;
    }),
  }));
}

/** Read all settings, grouped. staleTime 60s — settings rarely change. */
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.list(),
    queryFn: () => fetchJson<SettingsByGroup[]>("/api/settings"),
    staleTime: 60_000,
  });
}

/** Update multiple settings at once with an optimistic cache update. */
export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) =>
      fetchJson<SettingsByGroup[]>("/api/settings", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: settingsKeys.list() });
      const previous = qc.getQueryData<SettingsByGroup[]>(settingsKeys.list());
      if (previous) {
        qc.setQueryData<SettingsByGroup[]>(settingsKeys.list(), applyOptimistic(previous, input));
      }
      return { previous };
    },
    onSuccess: (data) => {
      qc.setQueryData(settingsKeys.list(), data);
      toast.success("تم حفظ الإعدادات");
    },
    onError: (err: ApiError, _input, context) => {
      if (context?.previous) {
        qc.setQueryData(settingsKeys.list(), context.previous);
      }
      toast.error(err.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.list() });
    },
  });
}
