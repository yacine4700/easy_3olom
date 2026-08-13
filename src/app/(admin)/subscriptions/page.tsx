import type { Metadata } from "next";

import { SubscriptionsDashboard } from "@/components/subscriptions/subscriptions-dashboard";
import { SubscriptionsPageClient } from "@/components/subscriptions/subscriptions-page-client";

export const metadata: Metadata = { title: "الاشتراكات والمستخدمين" };

/**
 * Subscriptions & Users page — Server Component.
 *
 * Renders the dashboard server-side (KPI cards from real Supabase counts) and
 * passes it as React children to the client wrapper, which owns the tab state.
 *
 * Honors `?tab=…` deep links from the dashboard KPI cards so users land on
 * the relevant tab.
 */
export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const allowedTabs = ["overview", "subscriptions", "payments"] as const;
  const initialTab = allowedTabs.includes(tab as (typeof allowedTabs)[number])
    ? (tab as (typeof allowedTabs)[number])
    : "overview";

  const dashboard = await SubscriptionsDashboard();

  return (
    <SubscriptionsPageClient
      dashboard={dashboard}
      initialTab={initialTab}
    />
  );
}
