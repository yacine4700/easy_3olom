import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EducationLevel } from "@/types/domain";

const LEVEL_STYLES: Record<EducationLevel, string> = {
  "1AS": "border-transparent bg-sky-500/10 text-sky-700 dark:text-sky-400",
  "2AS":
    "border-transparent bg-violet-500/10 text-violet-700 dark:text-violet-400",
  "3AS":
    "border-transparent bg-rose-500/10 text-rose-700 dark:text-rose-400",
  AS: "border-transparent bg-teal-500/10 text-teal-700 dark:text-teal-400",
};

/** Education-level badge. Color helps quick scanning across levels. */
export function LevelBadge({ level }: { level: EducationLevel }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium tabular-nums", LEVEL_STYLES[level])}
    >
      {level}
    </Badge>
  );
}
