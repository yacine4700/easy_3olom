"use client";

import * as React from "react";
import { CreditCard } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  SubscriptionsDashboard,
  type DashboardNavigateIntent,
  type SubscriptionsTab,
} from "@/components/subscriptions/subscriptions-dashboard";
import { SubscriptionsTable } from "@/components/subscriptions/subscriptions-list";
import { PaymentsTable } from "@/components/subscriptions/payments-list";
import { PlansList } from "@/components/subscriptions/plans-list";
import { UsersList } from "@/components/subscriptions/users-list";
import type {
  PaymentStatus,
  SubscriptionStatus,
} from "@/types/subscriptions";

/**
 * Client page wrapper for the Subscriptions & Users module.
 *
 * Owns:
 *   - the active tab (local React state; no URL coupling),
 *   - the subscriptions tab's status filter (lifted here so KPI cards can
 *     preset it),
 *   - the payments tab's status filter (same reason).
 *
 * KPI cards in the dashboard call `onNavigate({ tab, status? })` which sets
 * both the tab and the appropriate filter — entirely in state, never touching
 * the URL.
 *
 * Tabs: نظرة عامة | المستخدمون | الاشتراكات | المدفوعات | الخطط
 */
export function SubscriptionsPageClient() {
  const [tab, setTab] = React.useState<SubscriptionsTab>("overview");
  const [subscriptionStatus, setSubscriptionStatus] =
    React.useState<"all" | SubscriptionStatus>("all");
  const [paymentStatus, setPaymentStatus] =
    React.useState<"all" | PaymentStatus>("all");

  function handleNavigate(intent: DashboardNavigateIntent) {
    setTab(intent.tab);
    if (intent.tab === "subscriptions") {
      setSubscriptionStatus(intent.status);
    } else if (intent.tab === "payments") {
      setPaymentStatus(intent.status);
    }
  }

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
        onValueChange={(v) => setTab(v as SubscriptionsTab)}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="subscriptions">الاشتراكات</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="plans">الخطط</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <SubscriptionsDashboard onNavigate={handleNavigate} />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <UsersList />
        </TabsContent>
        <TabsContent value="subscriptions" className="mt-4">
          <SubscriptionsTable
            statusFilter={subscriptionStatus}
            onStatusFilterChange={setSubscriptionStatus}
          />
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <PaymentsTable
            statusFilter={paymentStatus}
            onStatusFilterChange={setPaymentStatus}
          />
        </TabsContent>
        <TabsContent value="plans" className="mt-4">
          <PlansList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
