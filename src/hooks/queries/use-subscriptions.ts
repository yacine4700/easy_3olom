"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/lib/fetch";
import type {
  PaymentDetail,
  PaymentWithRelations,
  SubscriptionDetail,
  SubscriptionStats,
  SubscriptionWithRelations,
} from "@/types/subscriptions";
import type {
  ListPaymentsQuery,
  ListSubscriptionsQuery,
} from "@/lib/validators/subscriptions";
import type {
  PaymentListResult,
  SubscriptionListResult,
} from "@/lib/services/subscriptions";

/**
 * TanStack Query hooks for the Subscriptions & Users module.
 *
 * READ-ONLY — no mutation hooks. The admin UI cannot create, update, or
 * delete subscriptions/payments; it only reads them for review.
 *
 * Query keys are colocated with the hook so cache invalidation is local.
 */

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

// ── Payments hooks ───────────────────────────────────────────────────────────────

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

// Re-export the joined types for convenience so callers don't need to reach
// into the service file.
export type {
  SubscriptionWithRelations,
  PaymentWithRelations,
  SubscriptionDetail,
  PaymentDetail,
};
