import { CircleHelp, CheckCircle2, Flag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuestionStatus } from "@/types/domain";

const STATUS_STYLES: Record<
  QuestionStatus,
  { className: string; label: string; icon: typeof CheckCircle2 }
> = {
  new: {
    label: "جديد",
    icon: CircleHelp,
    className:
      "border-transparent bg-sky-500/15 text-sky-700 dark:text-sky-400",
  },
  answered: {
    label: "تمت الإجابة",
    icon: CheckCircle2,
    className:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  flagged: {
    label: "مُعلّم",
    icon: Flag,
    className:
      "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
};

/**
 * Colored status badge for the student-question lifecycle (Arabic labels).
 */
export function QuestionStatusBadge({ status }: { status: QuestionStatus }) {
  const config = STATUS_STYLES[status] ?? STATUS_STYLES.new;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", config.className)}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}
