import { z } from "zod";

export const createMethodologySchema = z.object({
  title: z.string().min(2, "العنوان يجب أن يحتوي على حرفين على الأقل").max(200),
  explanation: z.string().max(5000).nullable().default(null),
  keywords: z.array(z.string()).nullable().default(null),
});
export const updateMethodologySchema = createMethodologySchema.partial();
export const listMethodologiesQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type CreateMethodologyInput = z.infer<typeof createMethodologySchema>;
export type UpdateMethodologyInput = z.infer<typeof updateMethodologySchema>;
export type ListMethodologiesQuery = z.infer<typeof listMethodologiesQuerySchema>;
