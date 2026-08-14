"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { fetchJson } from "@/lib/fetch";
import type {
  PaymentDetail,
  PaymentWithRelations,
  Plan,
  SubscriptionDetail,
  SubscriptionStats,
  SubscriptionWithRelations,
  User,
} from "@/types/subscriptions";
import type {
  ListPaymentsQuery,
  ListPlansQuery,
  ListSubscriptionsQuery,
  ListUsersQuery,
} from "@/lib/validators/subscriptions";
import type {
  PaymentListResult,
  PlanListResult,
  SubscriptionListResult,
  UserListResult,
} from "@/lib/services/subscriptions";

/**
 * TanStack Query hooks for the Subscriptions & Users module.
 *
 * Reads go through the API routes (`/api/subscriptions`, `/api/payments`,
 * `/api/plans`, `/api/users-list`). The only writes are payment reviews
 * (approve/reject), which are forwarded to the webhook via
 * `POST /api/payments/[id]/review` — the admin UI never touches the
 * `payments` table directly.
 */

// ── Query keys ─────────────────────────────────────────────────────────────────

export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  stats: () => [...subscriptionKeys.all, "stats"] as const,
  lists: () => [...subscriptionKeys.all, "list"] as const,
  list: (query: ListSubscriptionsQuery) =>
    [...subscriptionKeys.lists(), query] as const,
  details: () => [...subscriptionKeys.all, "detail"] as const,
  detail: (id: string) => [...subscriptionKeys.details(), id] as const,
} as const;

export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (query: ListPaymentsQuery) =>
    [...paymentKeys.lists(), query] as const,
  details: () => [...paymentKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
} as const;

export const planKeys = {
  all: ["plans"] as const,
  lists: () => [...planKeys.all, "list"] as const,
  list: (query: ListPlansQuery) => [...planKeys.lists(), query] as const,
} as const;

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (query: ListUsersQuery) => [...userKeys.lists(), query] as const,
} as const;

// ── Query-string builders ──────────────────────────────────────────────────────

function buildSubscriptionsQueryString(query: ListSubscriptionsQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.sort) params.set("sort", query.sort);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

function buildPaymentsQueryString(query: ListPaymentsQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.sort) params.set("sort", query.sort);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

function buildPlansQueryString(query: ListPlansQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (typeof query.active === "boolean") {
    params.set("active", String(query.active));
  }
  if (query.sort) params.set("sort", query.sort);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

function buildUsersQueryString(query: ListUsersQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.sort) params.set("sort", query.sort);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

// ── Subscriptions hooks ─────────────────────────────────────────────────────────

/** Dashboard KPI counts (users, subscriptions by status, payments, revenue). */
export function useSubscriptionStats() {
  return useQuery({
    queryKey: subscriptionKeys.stats(),
    queryFn: () =>
      fetchJson<SubscriptionStats>(`/api/subscriptions?stats=1`),
    staleTime: 60_000,
  });
}

/** Paginated subscriptions list with search/status/sort. */
export function useSubscriptions(query: ListSubscriptionsQuery) {
  return useQuery({
    queryKey: subscriptionKeys.list(query),
    queryFn: () =>
      fetchJson<SubscriptionListResult>(
        `/api/subscriptions?${buildSubscriptionsQueryString(query)}`,
      ),
    placeholderData: (prev) => prev,
  });
}

/** Full detail (user + plan + payments) for a single subscription. */
export function useSubscriptionDetail(id: string | null | undefined) {
  return useQuery({
    queryKey: subscriptionKeys.detail(id ?? ""),
    queryFn: () =>
      fetchJson<SubscriptionDetail>(`/api/subscriptions/${id}`),
    enabled: Boolean(id),
  });
}

// ── Payments hooks ───────────────────────────────────────────────────────────

/** Paginated payments list with search/status/sort. */
export function usePayments(query: ListPaymentsQuery) {
  return useQuery({
    queryKey: paymentKeys.list(query),
    queryFn: () =>
      fetchJson<PaymentListResult>(
        `/api/payments?${buildPaymentsQueryString(query)}`,
      ),
    placeholderData: (prev) => prev,
  });
}

/** Full detail (user + subscription+plan) for a single payment. */
export function usePaymentDetail(id: string | null | undefined) {
  return useQuery({
    queryKey: paymentKeys.detail(id ?? ""),
    queryFn: () => fetchJson<PaymentDetail>(`/api/payments/${id}`),
    enabled: Boolean(id),
  });
}

export type ReviewAction = "approve" | "reject";

/**
 * Approve or reject a payment. Posts to `/api/payments/[id]/review` which
 * forwards the request to the webhook (the only writer).
 *
 * On success: invalidates every `payments.list` query (so the table refreshes),
 * the open payment detail (so the sheet shows the new state), and the
 * dashboard stats. Callers should use `mutateAsync` and wrap in a try/catch
 * to surface a toast on failure (the ApiError's `message` is user-ready
 * Arabic).
 */
export function useReviewPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: ReviewAction }) =>
      fetchJson<void>(`/api/payments/${id}/review`, {
        method: "POST",
        body: JSON.stringify({ action }),
      }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: paymentKeys.lists() });
      qc.invalidateQueries({ queryKey: paymentKeys.detail(id) });
      qc.invalidateQueries({ queryKey: subscriptionKeys.stats() });
    },
  });
}

// ── Plans hooks ───────────────────────────────────────────────────────────────

/** Paginated plans list with search/active/sort. READ-ONLY. */
export function usePlans(query: ListPlansQuery) {
  return useQuery({
    queryKey: planKeys.list(query),
    queryFn: () =>
      fetchJson<PlanListResult>(`/api/plans?${buildPlansQueryString(query)}`),
    placeholderData: (prev) => prev,
  });
}

// ── Users hooks ──────────────────────────────────────────────────────────────

/** Paginated users list with search/status/sort. READ-ONLY. */
export function useUsers(query: ListUsersQuery) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: () =>
      fetchJson<UserListResult>(`/api/users-list?${buildUsersQueryString(query)}`),
    placeholderData: (prev) => prev,
  });
}

// Re-export the joined types for convenience so callers don't need to reach
// into the service file.
export type {
  SubscriptionWithRelations,
  PaymentWithRelations,
  SubscriptionDetail,
  PaymentDetail,
  Plan,
  User,
};
