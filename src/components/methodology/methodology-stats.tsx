import { Route } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface MethodologyStatsProps {
  stats: { total: number };
}

/** Compact stat card shown above the methodology table. */
export function MethodologyStats({ stats }: MethodologyStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Card className="py-0 sm:col-span-1">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="bg-brand/10 text-brand flex size-9 items-center justify-center rounded-md">
            <Route className="size-4.5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-xs">إجمالي القواعد</p>
            <p className="text-2xl font-semibold tabular-nums">{stats.total}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
