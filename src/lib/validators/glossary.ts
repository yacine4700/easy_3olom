import { z } from "zod";

export const createGlossaryTermSchema = z.object({
  term: z.string().min(2, "المصطلح يجب أن يحتوي على حرفين على الأقل").max(200),
  definition: z.string().max(2000).nullable().default(null),
  unit: z.string().max(200).nullable().default(null),
  domain: z.string().max(100).nullable().default(null),
});
export const updateGlossaryTermSchema = createGlossaryTermSchema.partial();
export const listGlossaryTermsQuerySchema = z.object({
  search: z.string().trim().optional(),
  domain: z.string().optional(),
  unit: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type CreateGlossaryTermInput = z.infer<typeof createGlossaryTermSchema>;
export type UpdateGlossaryTermInput = z.infer<typeof updateGlossaryTermSchema>;
export type ListGlossaryTermsQuery = z.infer<typeof listGlossaryTermsQuerySchema>;
