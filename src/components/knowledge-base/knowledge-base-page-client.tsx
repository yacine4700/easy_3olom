"use client";

import { Library } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { KnowledgeBaseView } from "@/components/knowledge-base/knowledge-base-view";

export function KnowledgeBasePageClient() {
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

      <KnowledgeBaseView />
    </div>
  );
}
