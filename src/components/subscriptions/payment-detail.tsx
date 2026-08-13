"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Hash,
  Image as ImageIcon,
  Receipt,
  Stamp,
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
import { usePaymentDetail } from "@/hooks/queries/use-subscriptions";

interface PaymentDetailSheetProps {
  paymentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Sheet (drawer) showing the full detail of a single payment:
 * user info, linked subscription + plan, payment amount/status/method, and
 * reviewer / notes / file metadata.
 *
 * Fetches on demand when opened.
 */
export function PaymentDetailSheet({
  paymentId,
  open,
  onOpenChange,
}: PaymentDetailSheetProps) {
  const { data, isLoading } = usePaymentDetail(
    open ? paymentId : null,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="end"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg"
      >
        <SheetHeader className="space-y-1 border-b p-6">
          <SheetTitle className="text-lg">تفاصيل المدفوعة</SheetTitle>
          <SheetDescription>
            بيانات المستخدم والاشتراك والمراجعة.
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
            {/* Amount + status banner */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-muted-foreground text-xs">المبلغ</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {formatPrice(data.amount, data.currency)}
                </p>
              </div>
              <PaymentStatusBadge status={data.status} />
            </div>

            {/* Payment block */}
            <DetailSection title="المدفوعة" icon={CreditCard}>
              <DetailRow
                label="طريقة الدفع"
                value={
                  <Badge
                    variant="outline"
                    className="text-muted-foreground font-mono text-[10px] uppercase"
                  >
                    {data.method}
                  </Badge>
                }
              />
              <DetailRow
                label="المرجع"
                value={data.transactionReference ?? DASH}
                icon={Hash}
              />
              <DetailRow
                label="أُنشئت في"
                value={formatDateTime(data.createdAt)}
                icon={Clock}
              />
              <DetailRow
                label="آخر تحديث"
                value={formatDateTime(data.updatedAt)}
                icon={Clock}
              />
            </DetailSection>

            {/* Reviewer block */}
            <DetailSection title="المراجعة" icon={Stamp}>
              <DetailRow
                label="المراجِع"
                value={data.reviewedBy ?? "لم تُراجع بعد"}
              />
              <DetailRow
                label="تاريخ المراجعة"
                value={formatDateTime(data.reviewedAt)}
                icon={Calendar}
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
                label="حالة المستخدم"
                value={
                  data.user ? (
                    <UserStatusBadge status={data.user.status} />
                  ) : (
                    DASH
                  )
                }
              />
            </DetailSection>

            {/* Subscription block (optional) */}
            {data.subscription ? (
              <DetailSection title="الاشتراك المرتبط" icon={Receipt}>
                <DetailRow
                  label="الحالة"
                  value={
                    <SubscriptionStatusBadge
                      status={data.subscription.status}
                    />
                  }
                />
                <DetailRow
                  label="تاريخ البدء"
                  value={formatDate(data.subscription.startsAt)}
                  icon={Calendar}
                />
                <DetailRow
                  label="تاريخ الانتهاء"
                  value={formatDate(data.subscription.expiresAt)}
                  icon={Calendar}
                />
                {data.subscription.plan && (
                  <>
                    <DetailRow
                      label="الخطة"
                      value={data.subscription.plan.name}
                      icon={Wallet}
                    />
                    <DetailRow
                      label="سعر الخطة"
                      value={formatPrice(
                        data.subscription.plan.price,
                        data.subscription.plan.currency,
                      )}
                    />
                  </>
                )}
              </DetailSection>
            ) : (
              <p className="text-muted-foreground text-sm">
                لا يوجد اشتراك مرتبط بهذه المدفوعة.
              </p>
            )}

            {/* Notes */}
            <DetailSection title="ملاحظات" icon={FileText}>
              {data.notes ? (
                <p className="text-sm whitespace-pre-wrap">{data.notes}</p>
              ) : (
                <p className="text-muted-foreground text-sm">لا توجد ملاحظات.</p>
              )}
            </DetailSection>

            {/* Telegram file */}
            <DetailSection title="ملف الإيصال" icon={ImageIcon}>
              {data.telegramFileId ? (
                <p className="text-muted-foreground font-mono text-xs break-all">
                  {data.telegramFileId}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  لا يوجد ملف إيصال مرتبط.
                </p>
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
