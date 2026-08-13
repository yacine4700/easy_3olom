import { z } from "zod";

/**
 * Zod schemas for the Subscriptions & Users module.
 *
 * READ-ONLY — only the list-query schemas are defined here (no create/update
 * shapes). The admin UI never writes to `users`, `plans`, `subscriptions`, or
 * `payments` tables.
 */

const subscriptionStatuses = [
  "pending",
  "active",
  "expired",
  "cancelled",
  "suspended",
] as const;

const paymentStatuses = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
] as const;

const sortOrders = ["newest", "oldest"] as const;

export const listSubscriptionsQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(subscriptionStatuses).optional(),
  sort: z.enum(sortOrders).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListSubscriptionsQuery = z.infer<
  typeof listSubscriptionsQuerySchema
>;

export const listPaymentsQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(paymentStatuses).optional(),
  sort: z.enum(sortOrders).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;
