"use client";

import * as React from "react";
import {
  Users,
  CircleCheck,
  Clock,
  CircleX,
  Wallet,
  Banknote,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSubscriptionStats } from "@/hooks/queries/use-subscriptions";
import type {
  PaymentStatus,
  SubscriptionStatus,
} from "@/types/subscriptions";
import { formatPrice } from "@/components/subscriptions/format";

export type SubscriptionsTab =
  | "overview"
  | "users"
  | "subscriptions"
  | "payments"
  | "plans";

export type DashboardNavigateIntent =
  | { tab: "overview" | "users" | "plans" }
  | { tab: "subscriptions"; status: SubscriptionStatus }
  | { tab: "payments"; status: PaymentStatus };

interface KpiCardConfig {
  key: string;
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  intent: DashboardNavigateIntent;
  tone: KpiTone;
}

type KpiTone = "brand" | "muted" | "warn" | "default";

const TONE_STYLES: Record<KpiTone, string> = {
  brand: "bg-brand/10 text-brand",
  muted: "bg-muted text-muted-foreground",
  warn: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  default: "bg-foreground/5 text-foreground",
};

interface SubscriptionsDashboardProps {
  /** Called when a KPI card is clicked — switches the tab + (optionally) the
   *  status filter of the destination list. All via local state in the page
   *  client; no URL change. */
  onNavigate: (intent: DashboardNavigateIntent) => void;
}

/**
 * Subscriptions dashboard — Client Component.
 *
 * Was previously a Server Component that rendered `<Link>` cards with
 * `?tab=…&status=…` query params. To remove URL coupling (the page no longer
 * reads searchParams), it now fetches the stats via the
 * `useSubscriptionStats()` hook and renders the cards as buttons whose
 * `onClick` calls `onNavigate({ tab, status? })`.
 *
 * The grid is 1→2→4 columns responsive and mirrors the analytics `KpiCard`
 * visual language so the dashboard reads consistently across modules.
 */
export function SubscriptionsDashboard({
  onNavigate,
}: SubscriptionsDashboardProps) {
  const { data, isLoading } = useSubscriptionStats();

  if (isLoading || !data) {
    return (
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </section>
    );
  }

  const cards: KpiCardConfig[] = [
    {
      key: "users",
      title: "إجمالي المستخدمين",
      value: data.totalUsers,
      subtitle: "مشترك في البوت",
      icon: Users,
      intent: { tab: "users" },
      tone: "brand",
    },
    {
      key: "active-subs",
      title: "اشتراكات نشطة",
      value: data.activeSubscriptions,
      subtitle: "حالية الاستخدام",
      icon: CircleCheck,
      intent: { tab: "subscriptions", status: "active" },
      tone: "default",
    },
    {
      key: "pending-subs",
      title: "اشتراكات معلقة",
      value: data.pendingSubscriptions,
      subtitle: "بانتظار التفعيل",
      icon: Clock,
      intent: { tab: "subscriptions", status: "pending" },
      tone: "warn",
    },
    {
      key: "expired-subs",
      title: "اشتراكات منتهية",
      value: data.expiredSubscriptions,
      subtitle: "انتهت صلاحيتها",
      icon: CircleX,
      intent: { tab: "subscriptions", status: "expired" },
      tone: "muted",
    },
    {
      key: "pending-payments",
      title: "مدفوعات معلقة",
      value: data.pendingPayments,
      subtitle: "بانتظار المراجعة",
      icon: Wallet,
      intent: { tab: "payments", status: "pending" },
      tone: "warn",
    },
    {
      key: "approved-payments",
      title: "مدفوعات مقبولة",
      value: data.approvedPayments,
      subtitle: "تمت الموافقة",
      icon: Banknote,
      intent: { tab: "payments", status: "approved" },
      tone: "default",
    },
    {
      key: "revenue",
      title: "الإيرادات",
      value: formatPrice(data.totalRevenue),
      subtitle: "إجمالي المقبوض",
      icon: TrendingUp,
      intent: { tab: "payments", status: "approved" },
      tone: "brand",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <KpiButton key={card.key} config={card} onClick={() => onNavigate(card.intent)} />
      ))}
    </section>
  );
}

// ── Card (button, not link) ─────────────────────────────────────────────────────

function KpiButton({
  config,
  onClick,
}: {
  config: KpiCardConfig;
  onClick: () => void;
}) {
  const Icon = config.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-start focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
      aria-label={`${config.title} — افتح القائمة`}
    >
      <Card className="h-full cursor-pointer py-0 transition-colors hover:border-border/80 hover:bg-muted/30">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-md",
                TONE_STYLES[config.tone],
              )}
            >
              <Icon className="size-4.5" />
            </div>
            <span className="text-muted-foreground/60 text-xs">↗</span>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">{config.title}</p>
            <p className="text-2xl font-semibold tabular-nums">
              {config.value}
            </p>
            {config.subtitle ? (
              <p className="text-muted-foreground text-xs">
                {config.subtitle}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
