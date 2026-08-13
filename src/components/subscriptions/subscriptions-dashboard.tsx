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

import { KpiCard, type KpiTone } from "@/components/analytics/kpi-card";
import { getSubscriptionStats } from "@/lib/services/subscriptions";
import { formatPrice } from "@/components/subscriptions/format";

/**
 * Subscriptions dashboard — Server Component that fetches the KPI counts.
 *
 * Reuses the analytics `KpiCard` primitive so the visual language matches the
 * global Analytics page. The grid is 1→2→4 columns responsive.
 *
 * Stats are fetched server-side; failures fall back to zeros so the rest of
 * the page still renders.
 */
export async function SubscriptionsDashboard() {
  let stats;
  try {
    stats = await getSubscriptionStats();
  } catch (error) {
    console.error("[SubscriptionsDashboard] stats failed:", error);
    stats = {
      totalUsers: 0,
      activeSubscriptions: 0,
      pendingSubscriptions: 0,
      expiredSubscriptions: 0,
      pendingPayments: 0,
      approvedPayments: 0,
      totalRevenue: 0,
    };
  }

  const cards: Array<{
    key: string;
    title: string;
    value: number | string;
    subtitle?: string;
    icon: LucideIcon;
    href: string;
    tone: KpiTone;
  }> = [
    {
      key: "users",
      title: "إجمالي المستخدمين",
      value: stats.totalUsers,
      subtitle: "مشترك في البوت",
      icon: Users,
      href: "/subscriptions?tab=subscriptions",
      tone: "brand",
    },
    {
      key: "active-subs",
      title: "اشتراكات نشطة",
      value: stats.activeSubscriptions,
      subtitle: "حالية الاستخدام",
      icon: CircleCheck,
      href: "/subscriptions?tab=subscriptions&status=active",
      tone: "default",
    },
    {
      key: "pending-subs",
      title: "اشتراكات معلقة",
      value: stats.pendingSubscriptions,
      subtitle: "بانتظار التفعيل",
      icon: Clock,
      href: "/subscriptions?tab=subscriptions&status=pending",
      tone: "warn",
    },
    {
      key: "expired-subs",
      title: "اشتراكات منتهية",
      value: stats.expiredSubscriptions,
      subtitle: "انتهت صلاحيتها",
      icon: CircleX,
      href: "/subscriptions?tab=subscriptions&status=expired",
      tone: "muted",
    },
    {
      key: "pending-payments",
      title: "مدفوعات معلقة",
      value: stats.pendingPayments,
      subtitle: "بانتظار المراجعة",
      icon: Wallet,
      href: "/subscriptions?tab=payments&status=pending",
      tone: "warn",
    },
    {
      key: "approved-payments",
      title: "مدفوعات مقبولة",
      value: stats.approvedPayments,
      subtitle: "تمت الموافقة",
      icon: Banknote,
      href: "/subscriptions?tab=payments&status=approved",
      tone: "default",
    },
    {
      key: "revenue",
      title: "الإيرادات",
      value: formatPrice(stats.totalRevenue),
      subtitle: "إجمالي المقبوض",
      icon: TrendingUp,
      href: "/subscriptions?tab=payments&status=approved",
      tone: "brand",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <KpiCard
          key={card.key}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
          icon={card.icon}
          href={card.href}
          tone={card.tone}
        />
      ))}
    </section>
  );
}
