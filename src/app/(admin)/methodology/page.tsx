import type { Metadata } from "next";
import { Route } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MethodologyStats } from "@/components/methodology/methodology-stats";
import { MethodologyView } from "@/components/methodology/methodology-view";
import {
  getMethodologyStats,
  listMethodologies,
} from "@/lib/services/methodology";

export const metadata: Metadata = {
  title: "Methodology",
};

/**
 * /methodology — Methodology module (Phase 4).
 *
 * Teaching sequences (démarches) per level, bilingual (FR + AR). Parent of
 * Learning Objectives (Phase 5). Server Component: fetches initial list +
 * stats in parallel, then hands off to the client `MethodologyView`.
 */
export default async function MethodologyPage() {
  const [initial, stats] = await Promise.all([
    listMethodologies({ page: 1, pageSize: 50 }),
    getMethodologyStats(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="bg-brand/10 text-brand flex size-7 items-center justify-center rounded-md">
            <Route className="size-4" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Methodology</h1>
          <Badge variant="secondary" className="font-medium">
            FR · AR
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Bilingual teaching sequences (démarches) per level. Ordered units that
          structure the curriculum&apos;s pedagogical progression.
        </p>
      </div>

      <MethodologyStats stats={stats} />

      <MethodologyView initialItems={initial.items} />
    </div>
  );
}
