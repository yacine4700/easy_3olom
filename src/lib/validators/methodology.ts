import { z } from "zod";

import { CONTENT_STATUSES, EDUCATION_LEVELS } from "@/lib/constants/education";

/**
 * Zod schemas for the Methodology module.
 * Single source of truth shared by the API and the react-hook-form client.
 * Bilingual (FR + AR) to match the curriculum, same pattern as Glossary.
 */

const levelValues = EDUCATION_LEVELS.map((l) => l.value) as [
  string,
  ...string[],
];
const statusValues = CONTENT_STATUSES.map((s) => s.value) as [
  string,
  ...string[],
];

const frText = (minMsg: string) =>
  z.string().min(2, minMsg).max(2000, "Text is too long (max 2000 characters)");
const arText = (minMsg: string) =>
  z
    .string()
    .min(2, minMsg)
    .max(2000, "النص طويل جداً (الحد الأقصى 2000 حرف)");

export const createMethodologySchema = z.object({
  title: frText("Title (FR) must be at least 2 characters"),
  titleAr: arText("العنوان (ع) يجب أن يحتوي على حرفين على الأقل"),
  description: frText("Description (FR) must be at least 2 characters"),
  descriptionAr: arText("الوصف (ع) يجب أن يحتوي على حرفين على الأقل"),
  level: z.enum(levelValues, {
    errorMap: () => ({ message: "Select an education level" }),
  }),
  status: z.enum(statusValues, {
    errorMap: () => ({ message: "Select a status" }),
  }),
  order: z
    .number()
    .int("Order must be a whole number")
    .min(0, "Order cannot be negative")
    .max(9999, "Order is too large")
    .default(0),
});

export const updateMethodologySchema = createMethodologySchema.partial();

export const listMethodologiesQuerySchema = z.object({
  search: z.string().trim().optional(),
  level: z.enum(levelValues).optional(),
  status: z.enum(statusValues).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateMethodologyInput = z.infer<typeof createMethodologySchema>;
export type UpdateMethodologyInput = z.infer<typeof updateMethodologySchema>;
export type ListMethodologiesQuery = z.infer<
  typeof listMethodologiesQuerySchema
>;
