import {
  CircleCheck,
  Clock,
  CircleX,
  Ban,
  Pause,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SubscriptionStatus } from "@/types/subscriptions";

const STATUS_STYLES: Record<
  SubscriptionStatus,
  { className: string; label: string; icon: LucideIcon }
> = {
  pending: {
    label: "معلق",
    icon: Clock,
    className:
      "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  active: {
    label: "نشط",
    icon: CircleCheck,
    className:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  expired: {
    label: "منتهي",
    icon: CircleX,
    className:
      "border-transparent bg-zinc-500/15 text-zinc-600 dark:text-zinc-300",
  },
  cancelled: {
    label: "ملغي",
    icon: Ban,
    className:
      "border-transparent bg-red-500/15 text-red-700 dark:text-red-400",
  },
  suspended: {
    label: "موقوف",
    icon: Pause,
    className:
      "border-transparent bg-orange-500/15 text-orange-700 dark:text-orange-400",
  },
};

/**
 * Colored status badge for the `subscriptions.status` column.
 *
 * pending → أصفر "معلق", active → أخضر "نشط", expired → رمادي "منتهي",
 * cancelled → أحمر "ملغي", suspended → برتقالي "موقوف".
 */
export function SubscriptionStatusBadge({
  status,
}: {
  status: SubscriptionStatus;
}) {
  const config = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
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

/** Dropdown / Select options for filtering subscriptions by status. */
export const SUBSCRIPTION_STATUS_FILTER_OPTIONS: {
  value: "all" | SubscriptionStatus;
  label: string;
}[] = [
  { value: "all", label: "كل الحالات" },
  { value: "pending", label: "معلق" },
  { value: "active", label: "نشط" },
  { value: "expired", label: "منتهي" },
  { value: "cancelled", label: "ملغي" },
  { value: "suspended", label: "موقوف" },
];
