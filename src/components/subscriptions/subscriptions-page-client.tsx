"use client";

import * as React from "react";
import { CreditCard } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { SubscriptionsList } from "@/components/subscriptions/subscriptions-list";
import { PaymentsList } from "@/components/subscriptions/payments-list";

type TabValue = "overview" | "subscriptions" | "payments";

/**
 * Client page wrapper for the Subscriptions & Users module.
 *
 * Owns the active-tab state so deep links from the dashboard KPI cards
 * (`?tab=…`) can pre-select the right tab. The dashboard itself is a Server
 * Component (rendered server-side in `page.tsx` and passed through as React
 * children); the list + payments tabs are interactive client components.
 *
 * NOTE: the dashboard KPI cards link here with `?tab=subscriptions` or
 * `?tab=payments` (and an optional `?status=…` query). The deep link lands
 * users on the right tab; the status filter itself is NOT auto-applied to
 * the list — users get a clean filter UI to apply themselves.
 */
export function SubscriptionsPageClient({
  dashboard,
  initialTab = "overview",
}: {
  dashboard: React.ReactNode;
  initialTab?: TabValue;
}) {
  const [tab, setTab] = React.useState<TabValue>(initialTab);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="bg-brand/10 text-brand flex size-7 items-center justify-center rounded-md">
            <CreditCard className="size-4" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            الاشتراكات والمستخدمين
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          إدارة المستخدمين والاشتراكات والمدفوعات.
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TabValue)}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="subscriptions">الاشتراكات</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          {dashboard}
        </TabsContent>
        <TabsContent value="subscriptions" className="mt-4">
          <SubscriptionsList />
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <PaymentsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
