import {
  Clock,
  CircleCheck,
  CircleX,
  Ban,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/types/subscriptions";

const STATUS_STYLES: Record<
  PaymentStatus,
  { className: string; label: string; icon: LucideIcon }
> = {
  pending: {
    label: "معلق",
    icon: Clock,
    className:
      "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  approved: {
    label: "مقبول",
    icon: CircleCheck,
    className:
      "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  rejected: {
    label: "مرفوض",
    icon: CircleX,
    className:
      "border-transparent bg-red-500/15 text-red-700 dark:text-red-400",
  },
  cancelled: {
    label: "ملغي",
    icon: Ban,
    className:
      "border-transparent bg-zinc-500/15 text-zinc-600 dark:text-zinc-300",
  },
};

/**
 * Colored status badge for the `payments.status` column.
 *
 * pending → أصفر "معلق", approved → أخضر "مقبول",
 * rejected → أحمر "مرفوض", cancelled → رمادي "ملغي".
 */
export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
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

/** Dropdown / Select options for filtering payments by status. */
export const PAYMENT_STATUS_FILTER_OPTIONS: {
  value: "all" | PaymentStatus;
  label: string;
}[] = [
  { value: "all", label: "كل الحالات" },
  { value: "pending", label: "معلق" },
  { value: "approved", label: "مقبول" },
  { value: "rejected", label: "مرفوض" },
  { value: "cancelled", label: "ملغي" },
];
