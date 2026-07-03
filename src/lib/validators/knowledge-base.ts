import { z } from "zod";

import { CONTENT_STATUSES, EDUCATION_LEVELS } from "@/lib/constants/education";

/**
 * Zod schemas for the Knowledge Base module.
 *
 * These are the single source of truth for validation on both the
 * server (API routes / service layer) and the client (react-hook-form).
 * Keeping them here means the contract is defined exactly once.
 */

const levelValues = EDUCATION_LEVELS.map((l) => l.value) as [
  string,
  ...string[],
];
const statusValues = CONTENT_STATUSES.map((s) => s.value) as [
  string,
  ...string[],
];

/** Schema used when creating a new document. */
export const createKnowledgeDocumentSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title is too long"),
  source: z
    .string()
    .min(2, "Source must be at least 2 characters")
    .max(300, "Source is too long"),
  level: z.enum(levelValues, {
    errorMap: () => ({ message: "Select an education level" }),
  }),
  status: z.enum(statusValues, {
    errorMap: () => ({ message: "Select a status" }),
  }),
  chunkCount: z
    .number()
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .max(100000, "Value is too large")
    .default(0),
  embeddingReady: z.boolean().default(false),
});

/** Schema used when updating an existing document (all fields optional). */
export const updateKnowledgeDocumentSchema = createKnowledgeDocumentSchema
  .partial()
  .extend({
    // id is carried in the URL, never in the body — kept out intentionally.
  });

/** Query-string schema for the list endpoint (filters + pagination). */
export const listKnowledgeDocumentsQuerySchema = z.object({
  search: z.string().trim().optional(),
  level: z.enum(levelValues).optional(),
  status: z.enum(statusValues).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateKnowledgeDocumentInput = z.infer<
  typeof createKnowledgeDocumentSchema
>;
export type UpdateKnowledgeDocumentInput = z.infer<
  typeof updateKnowledgeDocumentSchema
>;
export type ListKnowledgeDocumentsQuery = z.infer<
  typeof listKnowledgeDocumentsQuerySchema
>;
