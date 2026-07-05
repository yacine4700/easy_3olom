import { z } from "zod";

export const createKnowledgeDocumentSchema = z.object({
  level: z.string().min(1, "اختر المستوى الدراسي").default("3AS"),
  title: z.string().min(2, "النشاط يجب أن يحتوي على حرفين على الأقل").max(200),
  content: z.string().max(10000).nullable().default(null),
  domain: z.string().max(100).nullable().default(null),
  unit: z.string().max(200).nullable().default(null),
  keywords: z.array(z.string()).nullable().default(null),
  botInstructions: z.string().max(2000).nullable().default(null),
});
export const updateKnowledgeDocumentSchema = createKnowledgeDocumentSchema.partial();
export const listKnowledgeDocumentsQuerySchema = z.object({
  search: z.string().trim().optional(),
  domain: z.string().optional(),
  unit: z.string().optional(),
  level: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type CreateKnowledgeDocumentInput = z.infer<typeof createKnowledgeDocumentSchema>;
export type UpdateKnowledgeDocumentInput = z.infer<typeof updateKnowledgeDocumentSchema>;
export type ListKnowledgeDocumentsQuery = z.infer<typeof listKnowledgeDocumentsQuerySchema>;
