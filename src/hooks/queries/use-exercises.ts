"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchJson, ApiError } from "@/lib/fetch";
import type { Exercise, ExerciseCollection } from "@/types/exercises";
import type {
  CollectionListResult,
  ExerciseListResult,
} from "@/lib/services/exercises";
import type {
  CreateExerciseCollectionInput,
  UpdateExerciseCollectionInput,
  ListExerciseCollectionsQuery,
  CreateExerciseInput,
  UpdateExerciseInput,
  ListExercisesQuery,
} from "@/lib/validators/exercises";

// ─── Exercise Collections ──────────────────────────────────────

/** Query keys for exercise collections. */
export const exerciseCollectionKeys = {
  all: ["exercise-collections"] as const,
  lists: () => [...exerciseCollectionKeys.all, "list"] as const,
  list: (query: ListExerciseCollectionsQuery) =>
    [...exerciseCollectionKeys.lists(), query] as const,
  details: () => [...exerciseCollectionKeys.all, "detail"] as const,
  detail: (id: string) => [...exerciseCollectionKeys.details(), id] as const,
};

function buildCollectionsQueryString(query: ListExerciseCollectionsQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

/** Read the list of exercise collections. */
export function useExerciseCollections(query: ListExerciseCollectionsQuery) {
  return useQuery({
    queryKey: exerciseCollectionKeys.list(query),
    queryFn: () =>
      fetchJson<CollectionListResult>(
        `/api/exercise-collections?${buildCollectionsQueryString(query)}`,
      ),
    placeholderData: (prev) => prev,
  });
}

/** Create an exercise collection. */
export function useCreateExerciseCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExerciseCollectionInput) =>
      fetchJson<ExerciseCollection>("/api/exercise-collections", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: exerciseCollectionKeys.lists() });
      toast.success("تم إنشاء السلسلة");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

/** Update an exercise collection. */
export function useUpdateExerciseCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateExerciseCollectionInput;
    }) =>
      fetchJson<ExerciseCollection>(`/api/exercise-collections/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: exerciseCollectionKeys.lists() });
      qc.invalidateQueries({
        queryKey: exerciseCollectionKeys.detail(data.id),
      });
      toast.success("تم تحديث السلسلة");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

/** Delete an exercise collection. */
export function useDeleteExerciseCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<void>(`/api/exercise-collections/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: exerciseCollectionKeys.lists() });
      toast.success("تم حذف السلسلة");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

// ─── Exercises ─────────────────────────────────────────────────

/** Query keys for exercises. */
export const exerciseKeys = {
  all: ["exercises"] as const,
  lists: () => [...exerciseKeys.all, "list"] as const,
  list: (query: ListExercisesQuery) =>
    [...exerciseKeys.lists(), query] as const,
  details: () => [...exerciseKeys.all, "detail"] as const,
  detail: (id: string) => [...exerciseKeys.details(), id] as const,
};

function buildExercisesQueryString(query: ListExercisesQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.collectionId) params.set("collectionId", query.collectionId);
  if (query.difficulty) params.set("difficulty", query.difficulty);
  if (query.isBacBased) params.set("isBacBased", query.isBacBased);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

/** Read the list of exercises. */
export function useExercises(query: ListExercisesQuery) {
  return useQuery({
    queryKey: exerciseKeys.list(query),
    queryFn: () =>
      fetchJson<ExerciseListResult>(
        `/api/exercises?${buildExercisesQueryString(query)}`,
      ),
    placeholderData: (prev) => prev,
  });
}

/** Create an exercise. */
export function useCreateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExerciseInput) =>
      fetchJson<Exercise>("/api/exercises", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: exerciseKeys.lists() });
      toast.success("تم إنشاء التمرين");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

/** Update an exercise. */
export function useUpdateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateExerciseInput;
    }) =>
      fetchJson<Exercise>(`/api/exercises/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: exerciseKeys.lists() });
      qc.invalidateQueries({ queryKey: exerciseKeys.detail(data.id) });
      toast.success("تم تحديث التمرين");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}

/** Delete an exercise. */
export function useDeleteExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<void>(`/api/exercises/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: exerciseKeys.lists() });
      toast.success("تم حذف التمرين");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
