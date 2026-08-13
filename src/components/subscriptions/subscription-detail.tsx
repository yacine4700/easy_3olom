"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  CreditCard,
  Hash,
  Hourglass,
  User as UserIcon,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PaymentStatusBadge } from "@/components/subscriptions/payment-status-badge";
import { SubscriptionStatusBadge } from "@/components/subscriptions/subscription-status-badge";
import { UserStatusBadge } from "@/components/subscriptions/user-status-badge";
import {
  DASH,
  formatDate,
  formatDateTime,
  formatPrice,
  getUserDisplayName,
} from "@/components/subscriptions/format";
import { useSubscriptionDetail } from "@/hooks/queries/use-subscriptions";

interface SubscriptionDetailSheetProps {
  subscriptionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Sheet (drawer) showing the full detail of a single subscription:
 * user info, plan info, subscription status + dates, and the related
 * payments list.
 *
 * Fetches on demand when opened — keeps the list query cheap.
 */
export function SubscriptionDetailSheet({
  subscriptionId,
  open,
  onOpenChange,
}: SubscriptionDetailSheetProps) {
  const { data, isLoading } = useSubscriptionDetail(
    open ? subscriptionId : null,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="end"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg"
      >
        <SheetHeader className="space-y-1 border-b p-6">
          <SheetTitle className="text-lg">
            تفاصيل الاشتراك
          </SheetTitle>
          <SheetDescription>
            بيانات المستخدم والخطة والمدفوعات المرتبطة.
          </SheetDescription>
        </SheetHeader>

        {isLoading || !data ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 p-6">
            {/* Status banner */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-sm">الحالة</span>
              <SubscriptionStatusBadge status={data.status} />
            </div>

            {/* Subscription block */}
            <DetailSection title="الاشتراك" icon={CreditCard}>
              <DetailRow
                label="تاريخ البدء"
                value={formatDate(data.startsAt)}
                icon={Calendar}
              />
              <DetailRow
                label="تاريخ الانتهاء"
                value={formatDate(data.expiresAt)}
                icon={Hourglass}
              />
              <DetailRow
                label="أُنشئ في"
                value={formatDateTime(data.createdAt)}
                icon={Clock}
              />
            </DetailSection>

            {/* User block */}
            <DetailSection title="المستخدم" icon={UserIcon}>
              <DetailRow
                label="الاسم"
                value={getUserDisplayName(data.user)}
              />
              <DetailRow
                label="معرّف تيليجرام"
                value={
                  data.user?.telegramUserId != null
                    ? String(data.user.telegramUserId)
                    : DASH
                }
                icon={Hash}
              />
              <DetailRow
                label="اسم المستخدم"
                value={
                  data.user?.username ? `@${data.user.username}` : DASH
                }
              />
              <DetailRow
                label="حالة المستخدم"
                value={
                  data.user ? (
                    <UserStatusBadge status={data.user.status} />
                  ) : (
                    DASH
                  )
                }
              />
              <DetailRow
                label="آخر ظهور"
                value={formatDateTime(data.user?.lastSeenAt)}
                icon={Clock}
              />
            </DetailSection>

            {/* Plan block */}
            <DetailSection title="الخطة" icon={Wallet}>
              <DetailRow label="الاسم" value={data.plan?.name ?? DASH} />
              <DetailRow label="الرمز" value={data.plan?.code ?? DASH} />
              <DetailRow
                label="السعر"
                value={
                  data.plan
                    ? formatPrice(data.plan.price, data.plan.currency)
                    : DASH
                }
              />
              <DetailRow
                label="المدة"
                value={
                  data.plan
                    ? `${data.plan.durationDays} يومًا`
                    : DASH
                }
              />
            </DetailSection>

            {/* Payments block */}
            <DetailSection title="المدفوعات المرتبطة" icon={Wallet}>
              {data.payments.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  لا توجد مدفوعات مرتبطة بهذا الاشتراك.
                </p>
              ) : (
                <ul className="divide-y">
                  {data.payments.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <span>
                            {formatPrice(p.amount, p.currency)}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-muted-foreground font-mono text-[10px]"
                          >
                            {p.method.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {formatDateTime(p.createdAt)}
                        </p>
                      </div>
                      <PaymentStatusBadge status={p.status} />
                    </li>
                  ))}
                </ul>
              )}
            </DetailSection>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── Local helpers ───────────────────────────────────────────────────────────────

function DetailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="text-muted-foreground size-4" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="bg-muted/30 space-y-2 rounded-md border p-3">
        {children}
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground flex items-center gap-1.5">
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </span>
      <span className="text-end font-medium tabular-nums">{value}</span>
    </div>
  );
}
