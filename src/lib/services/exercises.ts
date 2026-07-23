import { supabase } from "@/lib/supabase";
import type { ExerciseCollection, Exercise, ExerciseJson } from "@/types/exercises";
import type {
  CreateExerciseCollectionInput,
  UpdateExerciseCollectionInput,
  ListExerciseCollectionsQuery,
  CreateExerciseInput,
  UpdateExerciseInput,
  ListExercisesQuery,
} from "@/lib/validators/exercises";

// ─── Exercise Collections ──────────────────────────────────────

const COLLECTIONS_TABLE = "exercise_collections";

type CollectionRow = {
  id: number | string;
  title: string;
  collection_type: string | null;
  year: number | null;
  unit: string | null;
  pdf_file_id: string | null;
  created_at: string | null;
};

function collectionToDomain(r: CollectionRow): ExerciseCollection {
  return {
    id: String(r.id),
    title: r.title,
    collectionType: r.collection_type,
    year: r.year,
    unit: r.unit,
    pdfFileId: r.pdf_file_id,
    createdAt: r.created_at,
  };
}

export interface CollectionListResult {
  items: ExerciseCollection[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listExerciseCollections(
  query: ListExerciseCollectionsQuery,
): Promise<CollectionListResult> {
  const { search, page, pageSize } = query;
  let req = supabase.from(COLLECTIONS_TABLE).select("*", { count: "exact" });
  if (search) req = req.ilike("title", `%${search}%`);
  req = req.order("created_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  const { data, error, count } = await req;
  if (error) throw error;
  return { items: (data as CollectionRow[]).map(collectionToDomain), total: count ?? 0, page, pageSize };
}

export async function getExerciseCollection(id: string): Promise<ExerciseCollection | null> {
  const { data, error } = await supabase.from(COLLECTIONS_TABLE).select("*").eq("id", id).single();
  if (error || !data) return null;
  return collectionToDomain(data as CollectionRow);
}

export async function createExerciseCollection(input: CreateExerciseCollectionInput): Promise<ExerciseCollection> {
  const { data, error } = await supabase
    .from(COLLECTIONS_TABLE)
    .insert({
      title: input.title,
      collection_type: input.collectionType,
      year: input.year ?? null,
      unit: input.unit ?? null,
      pdf_file_id: input.pdfFileId ?? "",
    })
    .select().single();
  if (error || !data) throw error ?? new Error("Create failed");
  return collectionToDomain(data as CollectionRow);
}

export async function updateExerciseCollection(id: string, input: UpdateExerciseCollectionInput): Promise<ExerciseCollection | null> {
  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.collectionType !== undefined) update.collection_type = input.collectionType;
  if (input.year !== undefined) update.year = input.year;
  if (input.unit !== undefined) update.unit = input.unit;
  if (input.pdfFileId !== undefined) update.pdf_file_id = input.pdfFileId;
  const { data, error } = await supabase.from(COLLECTIONS_TABLE).update(update).eq("id", id).select().single();
  if (error || !data) return null;
  return collectionToDomain(data as CollectionRow);
}

export async function deleteExerciseCollection(id: string): Promise<boolean> {
  const { error } = await supabase.from(COLLECTIONS_TABLE).delete().eq("id", id);
  if (error) throw error;
  return true;
}

// ─── Exercises ─────────────────────────────────────────────────

const EXERCISES_TABLE = "exercises";

type ExerciseRow = {
  id: number | string;
  exercise_mode: string | null;
  exercise_json: ExerciseJson | null;
  collection_id: number | string | null;
  exercise_number: number | null;
  main_concept: string | null;
  difficulty: string | null;
  is_bac_based: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

function exerciseToDomain(r: ExerciseRow): Exercise {
  return {
    id: String(r.id),
    exerciseMode: r.exercise_mode,
    exerciseJson: r.exercise_json,
    collectionId: r.collection_id != null ? String(r.collection_id) : null,
    exerciseNumber: r.exercise_number,
    mainConcept: r.main_concept,
    difficulty: r.difficulty,
    isBacBased: r.is_bac_based,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export interface ExerciseListResult {
  items: Exercise[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listExercises(query: ListExercisesQuery): Promise<ExerciseListResult> {
  const { search, collectionId, difficulty, isBacBased, page, pageSize } = query;
  let req = supabase.from(EXERCISES_TABLE).select("*", { count: "exact" });
  if (collectionId) req = req.eq("collection_id", collectionId);
  if (difficulty) req = req.eq("difficulty", difficulty);
  if (isBacBased === "true") req = req.eq("is_bac_based", true);
  else if (isBacBased === "false") req = req.eq("is_bac_based", false);
  if (search) req = req.ilike("main_concept", `%${search}%`);
  req = req.order("created_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  const { data, error, count } = await req;
  if (error) throw error;
  return { items: (data as ExerciseRow[]).map(exerciseToDomain), total: count ?? 0, page, pageSize };
}

export async function getExercise(id: string): Promise<Exercise | null> {
  const { data, error } = await supabase.from(EXERCISES_TABLE).select("*").eq("id", id).single();
  if (error || !data) return null;
  return exerciseToDomain(data as ExerciseRow);
}

export async function createExercise(input: CreateExerciseInput): Promise<Exercise> {
  const { data, error } = await supabase
    .from(EXERCISES_TABLE)
    .insert({
      exercise_mode: input.exerciseMode,
      exercise_json: input.exerciseJson,
      collection_id: input.collectionId ? Number(input.collectionId) : null,
      exercise_number: input.exerciseNumber ?? null,
      main_concept: input.mainConcept ?? null,
      difficulty: input.difficulty,
      is_bac_based: input.isBacBased ?? false,
    })
    .select().single();
  if (error || !data) throw error ?? new Error("Create failed");
  return exerciseToDomain(data as ExerciseRow);
}

export async function updateExercise(id: string, input: UpdateExerciseInput): Promise<Exercise | null> {
  const update: Record<string, unknown> = {};
  if (input.exerciseMode !== undefined) update.exercise_mode = input.exerciseMode;
  if (input.exerciseJson !== undefined) update.exercise_json = input.exerciseJson;
  if (input.collectionId !== undefined) update.collection_id = input.collectionId ? Number(input.collectionId) : null;
  if (input.exerciseNumber !== undefined) update.exercise_number = input.exerciseNumber;
  if (input.mainConcept !== undefined) update.main_concept = input.mainConcept;
  if (input.difficulty !== undefined) update.difficulty = input.difficulty;
  if (input.isBacBased !== undefined) update.is_bac_based = input.isBacBased;
  const { data, error } = await supabase.from(EXERCISES_TABLE).update(update).eq("id", id).select().single();
  if (error || !data) return null;
  return exerciseToDomain(data as ExerciseRow);
}

export async function deleteExercise(id: string): Promise<boolean> {
  const { error } = await supabase.from(EXERCISES_TABLE).delete().eq("id", id);
  if (error) throw error;
  return true;
}
