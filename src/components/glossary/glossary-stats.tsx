import { BookText, Layers } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Stats {
  total: number;
  domains: number;
}

/** Compact stat cards shown above the glossary table. */
export function GlossaryStats({ stats }: { stats: Stats }) {
  const items = [
    {
      key: "total",
      label: "إجمالي المصطلحات",
      value: stats.total,
      icon: BookText,
      tone: "default" as const,
    },
    {
      key: "domains",
      label: "المجالات",
      value: stats.domains,
      icon: Layers,
      tone: "brand" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
