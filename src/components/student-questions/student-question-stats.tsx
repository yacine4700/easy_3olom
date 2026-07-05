import { MessageCircleQuestion, Sparkles, CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StudentQuestionStatsProps {
  stats: { total: number; new: number; answered: number };
}

/** Three compact stat cards shown above the questions table. */
export function StudentQuestionStats({
  stats,
}: StudentQuestionStatsProps) {
  const items = [
    {
      key: "total",
      label: "إجمالي الأسئلة",
      value: stats.total,
      icon: MessageCircleQuestion,
      tone: "default" as const,
    },
    {
      key: "new",
      label: "جديد",
      value: stats.new,
      icon: Sparkles,
      tone: "brand" as const,
    },
    {
      key: "answered",
      label: "تمت الإجابة",
      value: stats.answered,
      icon: CheckCircle2,
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
