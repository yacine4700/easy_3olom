import type { Metadata } from "next";
import { BookText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { GlossaryStats } from "@/components/glossary/glossary-stats";
import { GlossaryView } from "@/components/glossary/glossary-view";
import { getGlossaryStats, listGlossaryTerms } from "@/lib/services/glossary";

export const metadata: Metadata = {
  title: "Glossary",
};

/**
 * /glossary — Glossary module (Phase 3).
 *
 * Server Component: fetches the first page + stats directly from the service
 * layer (instant first paint), then hands off to the client `GlossaryView`.
 * Bilingual (FR + AR) terms feed the RAG assistant that answers in Arabic.
 */
export default async function GlossaryPage() {
  const [initial, stats] = await Promise.all([
    listGlossaryTerms({ page: 1, pageSize: 50 }),
    getGlossaryStats(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="bg-brand/10 text-brand flex size-7 items-center justify-center rounded-md">
            <BookText className="size-4" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Glossary</h1>
          <Badge variant="secondary" className="font-medium">
            FR · AR
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Bilingual terminology powering the assistant&apos;s scientific
          vocabulary (علوم الطبيعة والحياة).
        </p>
      </div>

      <GlossaryStats stats={stats} />

      <GlossaryView initialItems={initial.items} />
    </div>
  );
}
