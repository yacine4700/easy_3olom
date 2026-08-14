import { z } from "zod";

/**
 * Zod schemas for the Subscriptions & Users module.
 *
 * READ-ONLY for `users`, `plans`, `subscriptions`, and `payments`. The only
 * write-style actions are the payment review (`approve`/`reject`) requests,
 * which go through the webhook — not the database.
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

const userStatuses = ["active", "blocked"] as const;

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

export const listPlansQuerySchema = z.object({
  search: z.string().trim().optional(),
  // `active` arrives as a query-string "true"/"false"; coerce to a boolean.
  active: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  sort: z.enum(sortOrders).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListPlansQuery = z.infer<typeof listPlansQuerySchema>;

export const listUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(userStatuses).optional(),
  sort: z.enum(sortOrders).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

/** Body for POST /api/payments/[id]/review — picks the only two allowed actions. */
export const reviewPaymentSchema = z.object({
  action: z.enum(["approve", "reject"]),
});
export type ReviewPaymentInput = z.infer<typeof reviewPaymentSchema>;
