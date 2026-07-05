import type { Metadata } from "next";
import { Route } from "lucide-react";

import { MethodologyStats } from "@/components/methodology/methodology-stats";
import { MethodologyView } from "@/components/methodology/methodology-view";
import {
  getMethodologyStats,
  listMethodologies,
} from "@/lib/services/methodology";

export const metadata: Metadata = {
  title: "القواعد المنهاجية",
};

/**
 * /methodology — Methodology rules module.
 *
 * Server Component: fetches the first page + total count directly from the
 * service layer (instant first paint), then hands off to the client
 * `MethodologyView` which keeps data fresh via TanStack Query.
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
          <h1 className="text-2xl font-semibold tracking-tight">
            القواعد المنهاجية
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          القواعد التوجيهية لمساعد الذكاء الاصطناعي.
        </p>
      </div>

      <MethodologyStats stats={stats} />

      <MethodologyView initialItems={initial.items} />
    </div>
  );
}
