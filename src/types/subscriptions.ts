/**
 * Domain types for the Subscriptions & Users module.
 *
 * Mirrors the Supabase tables `users`, `plans`, `subscriptions`, and `payments`
 * (READ-ONLY admin view — no create/update/delete shapes are defined here).
 *
 * Joined shapes (`SubscriptionWithRelations`, `PaymentWithRelations`,
 * `SubscriptionDetail`, `PaymentDetail`) model the nested-select payloads the
 * service requests from Supabase (`*, user:users(*), plan:plans(*)`).
 */

// ── users ────────────────────────────────────────────────────────────────────
export type UserStatus = "active" | "blocked";

export interface User {
  id: string;
  telegramUserId: number | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  languageCode: string | null;
  status: UserStatus;
  createdAt: string | null;
  updatedAt: string | null;
  lastSeenAt: string | null;
}

// ── plans ────────────────────────────────────────────────────────────────────
export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  durationDays: number;
  active: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

// ── subscriptions ────────────────────────────────────────────────────────────
export type SubscriptionStatus =
  | "pending"
  | "active"
  | "expired"
  | "cancelled"
  | "suspended";

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Subscription row joined with its `user` and `plan` (Supabase nested select). */
export interface SubscriptionWithRelations extends Subscription {
  user: User | null;
  plan: Plan | null;
}

/** Full detail: subscription + user + plan + the subscription's payments. */
export interface SubscriptionDetail extends Subscription {
  user: User | null;
  plan: Plan | null;
  payments: Payment[];
}

// ── payments ──────────────────────────────────────────────────────────────────
export type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type PaymentMethod = "ccp";

export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string | null;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  telegramFileId: string | null;
  transactionReference: string | null;
  notes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Payment row joined with its `user` (Supabase nested select). */
export interface PaymentWithRelations extends Payment {
  user: User | null;
}

/** Full detail: payment + user + subscription + the subscription's plan. */
export interface PaymentDetail extends Payment {
  user: User | null;
  subscription: (Subscription & { plan: Plan | null }) | null;
}

// ── stats ────────────────────────────────────────────────────────────────────
export interface SubscriptionStats {
  totalUsers: number;
  activeSubscriptions: number;
  pendingSubscriptions: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  suspendedSubscriptions: number;
  pendingPayments: number;
  approvedPayments: number;
  rejectedPayments: number;
  /** Sum of approved payments.amount (in DZD). */
  totalRevenue: number;
}
