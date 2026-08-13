"use client";

import * as React from "react";
import {
  ArrowDownUp,
  Calendar,
  Inbox,
  Search,
  User as UserIcon,
  Wallet,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ListPagination } from "@/components/subscriptions/list-pagination";
import {
  PAYMENT_STATUS_FILTER_OPTIONS,
  PaymentStatusBadge,
} from "@/components/subscriptions/payment-status-badge";
import { PaymentDetailSheet } from "@/components/subscriptions/payment-detail";
import { formatDateTime, formatPrice, getUserDisplayName } from "@/components/subscriptions/format";
import { usePayments } from "@/hooks/queries/use-subscriptions";
import type { PaymentStatus, PaymentWithRelations } from "@/types/subscriptions";

type StatusFilter = "all" | PaymentStatus;
type SortOrder = "newest" | "oldest";

interface PaymentsListFilters {
  search: string;
  status: StatusFilter;
  sort: SortOrder;
}

const DEFAULT_FILTERS: PaymentsListFilters = {
  search: "",
  status: "all",
  sort: "newest",
};

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "الأحدث أولًا" },
  { value: "oldest", label: "الأقدم أولًا" },
];

/**
 * Payments list — card-based (not a table).
 *
 * Each card shows the user's display name, the payment amount (large),
 * a colored status badge, the method (CCP), and the creation date. Clicking
 * a card opens a Sheet (drawer) with the full payment detail.
 *
 * READ-ONLY — no create/edit/delete affordances. Payment approval happens
 * through the Telegram bot + n8n flow.
 */
export function PaymentsList() {
  const [filters, setFilters] =
    React.useState<PaymentsListFilters>(DEFAULT_FILTERS);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE);

  // Debounce search.
  const [debouncedSearch, setDebouncedSearch] = React.useState(filters.search);
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  // Reset to first page whenever filters change.
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.status, filters.sort, pageSize]);

  const query = React.useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: filters.status === "all" ? undefined : filters.status,
      sort: filters.sort,
      page,
      pageSize,
    }),
    [debouncedSearch, filters.status, filters.sort, page, pageSize],
  );

  const { data, isLoading, isFetching } = usePayments(query);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  function openDetail(id: string) {
    setActiveId(id);
    setSheetOpen(true);
  }

  function update(patch: Partial<PaymentsListFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function reset() {
    setFilters(DEFAULT_FILTERS);
  }

  const hasActiveFilters =
    filters.search !== "" || filters.status !== "all" || filters.sort !== "newest";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative max-w-xs flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2" />
          <Input
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="بحث باسم المستخدم أو المرجع…"
            className="h-9 ps-8"
            aria-label="بحث في المدفوعات"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(v) => update({ status: v as StatusFilter })}
        >
          <SelectTrigger
            className="h-9 w-full sm:w-[160px]"
            aria-label="تصفية حسب الحالة"
          >
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={(v) => update({ sort: v as SortOrder })}
        >
          <SelectTrigger
            className="h-9 w-full sm:w-[160px]"
            aria-label="ترتيب"
          >
            <ArrowDownUp className="text-muted-foreground size-3.5" />
            <SelectValue placeholder="ترتيب" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-muted-foreground"
            onClick={reset}
          >
            <X className="size-4" />
            مسح
          </Button>
        )}
      </div>

      {/* Cards grid */}
      <div
        data-loading={isFetching && !isLoading}
        className="relative transition-opacity data-[loading=true]:opacity-70"
      >
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
            <Inbox className="text-muted-foreground/50 size-8" />
            <p className="text-muted-foreground text-sm">لا توجد مدفوعات</p>
            <p className="text-muted-foreground/70 text-xs">
              جرّب تعديل عوامل التصفية أو البحث بكلمة أخرى.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onOpen={() => openDetail(payment.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination footer */}
      {!isLoading && total > 0 && (
        <ListPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          isLoading={isFetching}
        />
      )}

      {/* Detail drawer */}
      <PaymentDetailSheet
        paymentId={activeId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}

// ── Card ────────────────────────────────────────────────────────────────────────

function PaymentCard({
  payment,
  onOpen,
}: {
  payment: PaymentWithRelations;
  onOpen: () => void;
}) {
  const userName = getUserDisplayName(payment.user);

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="hover:border-border/80 hover:bg-muted/30 cursor-pointer gap-0 py-0 transition-colors focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="flex flex-col gap-3 p-4">
        {/* Header: user + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="bg-brand/10 text-brand flex size-8 shrink-0 items-center justify-center rounded-md">
              <UserIcon className="size-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="truncate text-sm font-semibold" title={userName}>
                {userName}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {payment.user?.username
                  ? `@${payment.user.username}`
                  : payment.user?.telegramUserId != null
                    ? `Telegram #${payment.user.telegramUserId}`
                    : "—"}
              </p>
            </div>
          </div>
          <PaymentStatusBadge status={payment.status} />
        </div>

        {/* Amount + method */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Wallet className="text-muted-foreground size-4 shrink-0" />
            <span className="text-lg font-semibold tabular-nums">
              {formatPrice(payment.amount, payment.currency)}
            </span>
          </div>
          <span className="text-muted-foreground rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase">
            {payment.method}
          </span>
        </div>

        {/* Date */}
        <div className="text-muted-foreground flex items-center justify-between gap-2 border-t pt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            <span>{formatDateTime(payment.createdAt)}</span>
          </div>
          {payment.transactionReference && (
            <span
              className="truncate font-mono text-[10px]"
              title={payment.transactionReference}
            >
              #{payment.transactionReference}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
