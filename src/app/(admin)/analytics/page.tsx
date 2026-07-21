import type { Metadata } from "next";
import {
  BookText,
  ChartNoAxesColumn,
  Library,
  Route,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { KpiCard, type KpiTone } from "@/components/analytics/kpi-card";
import { ReadinessBarChart } from "@/components/analytics/readiness-bar-chart";
import { getGlossaryStats } from "@/lib/services/glossary";
import { getKnowledgeBaseStats } from "@/lib/services/knowledge-base";
import { getMethodologyStats } from "@/lib/services/methodology";

export const metadata: Metadata = { title: "التحليلات" };

export default async function AnalyticsPage() {
  const [kbRes, glossaryRes, methodologyRes] = await Promise.allSettled([
    getKnowledgeBaseStats(),
    getGlossaryStats(),
    getMethodologyStats(),
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

  const readinessData = [
    { module: "قاعدة المعرفة", total: kbStats.total },
    { module: "المعجم", total: glossaryStats.total },
    { module: "قواعد المنهجية", total: methodologyStats.total },
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
      title: "قواعد المنهجية",
      value: methodologyStats.total,
      subtitle: "قواعد المنهجية",
      icon: Route,
      href: "/methodology",
      tone: "default",
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
          نظرة شاملة على قاعدة المعرفة والمعجم والقواعد المنهجية.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

      <ReadinessBarChart data={readinessData} />
    </div>
  );
}
