import type { Metadata } from "next";
import { Library } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { KnowledgeBaseStats } from "@/components/knowledge-base/knowledge-base-stats";
import { KnowledgeBaseView } from "@/components/knowledge-base/knowledge-base-view";
import {
  getKnowledgeBaseStats,
  listKnowledgeDocuments,
} from "@/lib/services/knowledge-base";

export const metadata: Metadata = {
  title: "قاعدة المعرفة",
};

/**
 * /knowledge-base — Knowledge Base module.
 *
 * Server Component: fetches the first page + aggregate stats directly from
 * the service layer (no client round-trip on first paint), then hands off to
 * the client `KnowledgeBaseView` which keeps data fresh via TanStack Query.
 */
export default async function KnowledgeBasePage() {
  // Run both reads in parallel to keep the server response fast.
  const [initial, stats] = await Promise.all([
    listKnowledgeDocuments({ page: 1, pageSize: 50 }),
    getKnowledgeBaseStats(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="bg-brand/10 text-brand flex size-7 items-center justify-center rounded-md">
            <Library className="size-4" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            قاعدة المعرفة
          </h1>
          <Badge variant="secondary" className="font-medium">
            RAG
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          إدارة الوثائق المصدرية التي تُغذّي مساعد RAG في مادة علوم الطبيعة
          والحياة.
        </p>
      </div>

      <KnowledgeBaseStats stats={stats} />

      <KnowledgeBaseView initialItems={initial.items} />
    </div>
  );
}
