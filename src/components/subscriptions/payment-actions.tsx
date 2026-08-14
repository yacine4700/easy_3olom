"use client";

import * as React from "react";
import { Check, X as XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useReviewPayment, type ReviewAction } from "@/hooks/queries/use-subscriptions";
import type { PaymentWithRelations } from "@/types/subscriptions";
import { formatPrice, getUserDisplayName } from "@/components/subscriptions/format";

/**
 * Approve / Reject action buttons for a `pending` payment.
 *
 * Both buttons open an AlertDialog; on confirm, the `useReviewPayment`
 * mutation POSTs to `/api/payments/[id]/review` which forwards to the
 * webhook (the only writer to the `payments` table). On success the mutation
 * invalidates the payments lists + the payment detail + the dashboard stats
 * so the UI refreshes. On failure, an error toast is shown.
 *
 * For `approved` / `rejected` / `cancelled` payments nothing renders.
 */
export function PaymentActions({
  payment,
  variant = "inline",
  onDone,
}: {
  payment: PaymentWithRelations;
  /** `inline` = small buttons in a table cell; `block` = full-width buttons
   *  in the Sheet footer. */
  variant?: "inline" | "block";
  /** Called after a successful review (used by the Sheet to close itself). */
  onDone?: () => void;
}) {
  if (payment.status !== "pending") return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        variant === "block" ? "w-full" : "",
      )}
    >
      <ReviewButton
        payment={payment}
        action="approve"
        tone="approve"
        label="قبول"
        variant={variant === "block" ? "default" : "outline"}
        onDone={onDone}
      />
      <ReviewButton
        payment={payment}
        action="reject"
        tone="reject"
        label="رفض"
        variant="outline"
        onDone={onDone}
      />
    </div>
  );
}

// ── ReviewButton (single action with AlertDialog confirm) ──────────────────────

function ReviewButton({
  payment,
  action,
  tone,
  label,
  variant,
  onDone,
}: {
  payment: PaymentWithRelations;
  action: ReviewAction;
  tone: "approve" | "reject";
  label: string;
  variant: "default" | "outline";
  onDone?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const review = useReviewPayment();

  const amount = formatPrice(payment.amount, payment.currency);
  const userName = getUserDisplayName(payment.user);
  const verb =
    action === "approve" ? "قبول" : "رفض";

  async function handleConfirm() {
    setOpen(false);
    const tid = toast.loading(`جارٍ إرسال ${verb} المدفوعة…`);
    try {
      await review.mutateAsync({ id: payment.id, action });
      toast.success(
        action === "approve"
          ? `تم إرسال القبول إلى Webhook`
          : `تم إرسال الرفض إلى Webhook`,
        { id: tid },
      );
      onDone?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "فشل الإجراء";
      toast.error(message, { id: tid });
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={cn(
            "h-8 gap-1.5",
            variant === "default" &&
              tone === "approve" &&
              "bg-emerald-600 text-white hover:bg-emerald-700",
            variant === "outline" &&
              tone === "reject" &&
              "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40",
            variant === "outline" &&
              tone === "approve" &&
              "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950/40",
          )}
          disabled={review.isPending}
        >
          {tone === "approve" ? (
            <Check className="size-3.5" />
          ) : (
            <XIcon className="size-3.5" />
          )}
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{verb} المدفوعة</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <span className="block space-y-1">
              <span>
                سيتم إرسال طلب {verb} هذه المدفوعة إلى Webhook. تأكد قبل
                المتابعة.
              </span>
              <span className="text-foreground block text-sm font-medium">
                {userName} — {amount}
              </span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
            className={cn(
              tone === "approve" &&
                "bg-emerald-600 text-white hover:bg-emerald-700",
              tone === "reject" &&
                "bg-red-600 text-white hover:bg-red-700",
            )}
          >
            {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
