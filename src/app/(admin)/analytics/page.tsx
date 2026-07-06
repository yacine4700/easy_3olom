import type { Metadata } from "next";
import {
  BookText,
  ChartNoAxesColumn,
  Library,
  MessageCircleQuestion,
  Route,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { KpiCard, type KpiTone } from "@/components/analytics/kpi-card";
import { ReadinessBarChart } from "@/components/analytics/readiness-bar-chart";
import { RecentQuestionsFeed } from "@/components/analytics/recent-questions-feed";
import { StatusDonutChart, type StatusSlice } from "@/components/analytics/status-donut-chart";
import { getGlossaryStats } from "@/lib/services/glossary";
import { getKnowledgeBaseStats } from "@/lib/services/knowledge-base";
import { getMethodologyStats } from "@/lib/services/methodology";
import {
  getRecentUnansweredQuestions,
  getStudentQuestionStats,
} from "@/lib/services/student-question";

export const metadata: Metadata = { title: "التحليلات" };

const SKY_FILL = "var(--color-new)";
const BRAND_FILL = "var(--color-answered)";

/**
 * /analytics — high-level overview across every content module.
 *
 * Server Component: parallel-fetches five read endpoints via Promise.allSettled
 * so that a single failing service (e.g. a missing table on a fresh DB) doesn't
 * take the whole page down — each KPI / chart falls back to a zero value.
 */
export default async function AnalyticsPage() {
  const [kbRes, glossaryRes, methodologyRes, sqRes, recentRes] =
    await Promise.allSettled([
      getKnowledgeBaseStats(),
      getGlossaryStats(),
      getMethodologyStats(),
      getStudentQuestionStats(),
      getRecentUnansweredQuestions(5),
    ]);

  const kbStats =
    kbRes.status === "fulfilled" ? kbRes.value : { total: 0, domains: 0 };
  const glossaryStats =
    glossaryRes.status === "fulfilled"
      ? glossaryRes.value
      : { total: 0, domains: 0 };
  const methodologyStats =
    methodologyRes.status === "fulfilled"
      ? methodologyRes.value
      : { total: 0 };
  const sqStats =
    sqRes.status === "fulfilled"
      ? sqRes.value
      : { total: 0, new: 0, answered: 0 };
  const recent =
    recentRes.status === "fulfilled" ? recentRes.value : [];

  const statusData: StatusSlice[] = [
    { status: "new", label: "جديد", count: sqStats.new, fill: SKY_FILL },
    {
      status: "answered",
      label: "تمت الإجابة",
      count: sqStats.answered,
      fill: BRAND_FILL,
    },
  ];

  const readinessData = [
    { module: "قاعدة المعرفة", total: kbStats.total },
    { module: "المعجم", total: glossaryStats.total },
    { module: "القواعد المنهاجية", total: methodologyStats.total },
  ];

  const kpiCards: Array<{
    key: string;
    title: string;
    value: number | string;
    subtitle: string;
    icon: typeof Library;
    href: string;
    tone: KpiTone;
  }> = [
    {
      key: "kb",
      title: "قاعدة المعرفة",
      value: kbStats.total,
      subtitle: `${kbStats.domains} مجالات`,
      icon: Library,
      href: "/knowledge-base",
      tone: "brand",
    },
    {
      key: "glossary",
      title: "المعجم",
      value: glossaryStats.total,
      subtitle: `${glossaryStats.domains} مجالات`,
      icon: BookText,
      href: "/glossary",
      tone: "muted",
    },
    {
      key: "methodology",
      title: "القواعد المنهاجية",
      value: methodologyStats.total,
      subtitle: "قواعد التوجيه",
      icon: Route,
      href: "/methodology",
      tone: "default",
    },
    {
      key: "questions",
      title: "أسئلة الطلاب",
      value: sqStats.total,
      subtitle: `${sqStats.new} جديدة · ${sqStats.answered} مُجابة`,
      icon: MessageCircleQuestion,
      href: "/student-questions",
      tone: "warn",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="bg-brand/10 text-brand flex size-7 items-center justify-center rounded-md">
            <ChartNoAxesColumn className="size-4" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">التحليلات</h1>
          <Badge variant="secondary" className="font-medium">
            نظرة عامة
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          نظرة شاملة على نشاط قاعدة المعرفة وأسئلة الطلاب.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
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

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatusDonutChart data={statusData} />
        <ReadinessBarChart data={readinessData} />
      </section>

      <RecentQuestionsFeed questions={recent} />
    </div>
  );
}
