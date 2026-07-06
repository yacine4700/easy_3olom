import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type KpiTone = "brand" | "muted" | "warn" | "default";

export interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  href: string;
  tone?: KpiTone;
}

const TONE_STYLES: Record<KpiTone, string> = {
  brand: "bg-brand/10 text-brand",
  muted: "bg-muted text-muted-foreground",
  warn: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  default: "bg-foreground/5 text-foreground",
};

/**
 * KPI card for the analytics dashboard.
 *
 * Server Component — purely presentational. Renders as a clickable card that
 * deep-links into the related module. Tone controls the icon chip color so the
 * grid stays readable at a glance while still differentiating the four KPIs.
 */
export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  tone = "default",
}: KpiCardProps) {
  return (
    <Link href={href} className="block">
      <Card className="h-full py-0 transition-colors hover:border-border/80 hover:bg-muted/30">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-md",
                TONE_STYLES[tone],
              )}
            >
              <Icon className="size-4.5" />
            </div>
            <ArrowUpRight className="text-muted-foreground/60 size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">{title}</p>
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
            {subtitle ? (
              <p className="text-muted-foreground text-xs">{subtitle}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
