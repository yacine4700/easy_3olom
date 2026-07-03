import { CheckCircle2, FileEdit, Archive, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ContentStatus } from "@/types/domain";

const STATUS_STYLES: Record<
  ContentStatus,
  { className: string; label: string; icon: typeof CheckCircle2 }
> = {
  draft: {
    label: "Draft",
    icon: FileEdit,
    className: "border-transparent bg-muted text-muted-foreground",
  },
  review: {
    label: "In review",
    icon: Clock,
    className:
      "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  published: {
    label: "Published",
    icon: CheckCircle2,
    className:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  archived: {
    label: "Archived",
    icon: Archive,
    className:
      "border-transparent bg-zinc-500/15 text-zinc-600 dark:text-zinc-300",
  },
};

/**
 * Colored status badge with an icon.
 * Shared across modules (Knowledge Base, Glossary, …) — anything that
 * uses the ContentStatus lifecycle.
 */
export function StatusBadge({ status }: { status: ContentStatus }) {
  const config = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", config.className)}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}
