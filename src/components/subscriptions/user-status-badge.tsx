import { CircleCheck, Ban } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserStatus } from "@/types/subscriptions";

const STATUS_STYLES: Record<
  UserStatus,
  { className: string; label: string; icon: typeof CircleCheck }
> = {
  active: {
    label: "نشط",
    icon: CircleCheck,
    className:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  blocked: {
    label: "محظور",
    icon: Ban,
    className:
      "border-transparent bg-red-500/15 text-red-700 dark:text-red-400",
  },
};

/**
 * Colored status badge for the `users.status` column.
 * active → أخضر "نشط", blocked → أحمر "محظور".
 */
export function UserStatusBadge({ status }: { status: UserStatus }) {
  const config = STATUS_STYLES[status] ?? STATUS_STYLES.active;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-medium", config.className)}
    >
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}
