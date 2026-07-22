import { z } from "zod";

// Exercise Collections
export const createExerciseCollectionSchema = z.object({
  title: z.string().min(2, "العنوان مطلوب").max(200),
  collectionType: z.string().max(100).nullable().default(null),
  year: z.number().int().min(2000).max(2100).nullable().default(null),
  unit: z.string().max(200).nullable().default(null),
  pdfFileId: z.string().max(500).nullable().default(null),
});
export const updateExerciseCollectionSchema = createExerciseCollectionSchema.partial();
export const listExerciseCollectionsQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// Exercises
export const createExerciseSchema = z.object({
  title: z.string().min(2, "العنوان مطلوب").max(200),
  exerciseNature: z.string().max(200).nullable().default(null),
  collectionId: z.string().nullable().default(null),
  exerciseNumber: z.number().int().min(1).max(3).nullable().default(null),
  concept: z.string().max(500).nullable().default(null),
  exerciseJson: z.any().default({ context: "", parts: [] }),
});
export const updateExerciseSchema = createExerciseSchema.partial();
export const listExercisesQuerySchema = z.object({
  search: z.string().trim().optional(),
  collectionId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateExerciseCollectionInput = z.infer<typeof createExerciseCollectionSchema>;
export type UpdateExerciseCollectionInput = z.infer<typeof updateExerciseCollectionSchema>;
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
export type ListExerciseCollectionsQuery = z.infer<typeof listExerciseCollectionsQuerySchema>;
export type ListExercisesQuery = z.infer<typeof listExercisesQuerySchema>;
