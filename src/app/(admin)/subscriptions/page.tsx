import type { Metadata } from "next";

import { SubscriptionsPageClient } from "@/components/subscriptions/subscriptions-page-client";

export const metadata: Metadata = { title: "الاشتراكات والمستخدمين" };

/**
 * Subscriptions & Users page — Server Component.
 *
 * Previously rendered the dashboard server-side and honored `?tab=…&status=…`
 * deep links. That URL coupling is gone now: the page is a thin wrapper that
 * renders the client component, which owns the tab + filter state locally
 * (so KPI cards can switch tabs and preset filters without touching the URL).
 *
 * The dashboard fetches its KPI counts client-side via the
 * `useSubscriptionStats()` hook (one round-trip — same shape, just one fewer
 * server boundary).
 */
export default function SubscriptionsPage() {
  return <SubscriptionsPageClient />;
}
