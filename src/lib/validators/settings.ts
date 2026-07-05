import { z } from "zod";

export const updateSettingsSchema = z.object({
  settings: z
    .record(z.string(), z.string().max(2000))
    .refine((obj) => Object.keys(obj).length > 0, { message: "Provide at least one setting" }),
});
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
