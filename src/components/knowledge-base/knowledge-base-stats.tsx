import { Database, FileCheck2, Layers } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Stats {
  total: number;
  published: number;
  embeddingReady: number;
}

/** Compact stat cards shown above the documents table. */
export function KnowledgeBaseStats({ stats }: { stats: Stats }) {
  const items = [
    {
      key: "total",
      label: "Total documents",
      value: stats.total,
      icon: Layers,
      tone: "default" as const,
    },
    {
      key: "published",
      label: "Published",
      value: stats.published,
      icon: FileCheck2,
      tone: "brand" as const,
    },
    {
      key: "embeddingReady",
      label: "Embeddings ready",
      value: stats.embeddingReady,
      icon: Database,
      tone: "muted" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.key} className="py-0">
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-md",
                  item.tone === "brand"
                    ? "bg-brand/10 text-brand"
                    : item.tone === "muted"
                      ? "bg-muted text-muted-foreground"
                      : "bg-foreground/5 text-foreground",
                )}
              >
                <Icon className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-muted-foreground text-xs">{item.label}</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {item.value}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
