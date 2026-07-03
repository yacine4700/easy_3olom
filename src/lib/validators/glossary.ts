import { z } from "zod";

import { CONTENT_STATUSES, EDUCATION_LEVELS } from "@/lib/constants/education";

/**
 * Zod schemas for the Glossary module.
 * Single source of truth shared by the API and the react-hook-form client.
 *
 * Bilingual: French fields are required, Arabic fields are required too — a
 * glossary entry is only useful to the bilingual RAG assistant when both
 * languages are present.
 */

const levelValues = EDUCATION_LEVELS.map((l) => l.value) as [
  string,
  ...string[],
];
const statusValues = CONTENT_STATUSES.map((s) => s.value) as [
  string,
  ...string[],
];

/** French text field with a sensible length cap. */
const frText = (minMsg: string) =>
  z
    .string()
    .min(2, minMsg)
    .max(2000, "Text is too long (max 2000 characters)");

/** Arabic text field — same constraints, Arabic-specific messages. */
const arText = (minMsg: string) =>
  z
    .string()
    .min(2, minMsg)
    .max(2000, "النص طويل جداً (الحد الأقصى 2000 حرف)");

export const createGlossaryTermSchema = z.object({
  term: frText("Term (FR) must be at least 2 characters"),
  termAr: arText("المصطلح (ع) يجب أن يحتوي على حرفين على الأقل"),
  definition: frText("Definition (FR) must be at least 2 characters"),
  definitionAr: arText("التعريف (ع) يجب أن يحتوي على حرفين على الأقل"),
  level: z.enum(levelValues, {
    errorMap: () => ({ message: "Select an education level" }),
  }),
  status: z.enum(statusValues, {
    errorMap: () => ({ message: "Select a status" }),
  }),
});

export const updateGlossaryTermSchema = createGlossaryTermSchema.partial();

export const listGlossaryTermsQuerySchema = z.object({
  search: z.string().trim().optional(),
  level: z.enum(levelValues).optional(),
  status: z.enum(statusValues).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateGlossaryTermInput = z.infer<typeof createGlossaryTermSchema>;
export type UpdateGlossaryTermInput = z.infer<typeof updateGlossaryTermSchema>;
export type ListGlossaryTermsQuery = z.infer<
  typeof listGlossaryTermsQuerySchema
>;
