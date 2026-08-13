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
  SUBSCRIPTION_STATUS_FILTER_OPTIONS,
  SubscriptionStatusBadge,
} from "@/components/subscriptions/subscription-status-badge";
import { SubscriptionDetailSheet } from "@/components/subscriptions/subscription-detail";
import {
  formatDate,
  formatPrice,
  getUserDisplayName,
} from "@/components/subscriptions/format";
import { useSubscriptions } from "@/hooks/queries/use-subscriptions";
import type { SubscriptionStatus, SubscriptionWithRelations } from "@/types/subscriptions";

type StatusFilter = "all" | SubscriptionStatus;
type SortOrder = "newest" | "oldest";

interface SubscriptionsListFilters {
  search: string;
  status: StatusFilter;
  sort: SortOrder;
}

const DEFAULT_FILTERS: SubscriptionsListFilters = {
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
 * Subscriptions list — card-based (not a table).
 *
 * Each card shows the user's display name, the plan name, a colored status
 * badge, the start/end dates, and the plan price. Clicking a card opens a
 * Sheet (drawer) with the full subscription detail.
 *
 * READ-ONLY — no create/edit/delete affordances.
 */
export function SubscriptionsList() {
  const [filters, setFilters] =
    React.useState<SubscriptionsListFilters>(DEFAULT_FILTERS);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE);

  // Debounce search so typing doesn't fire a request per keystroke.
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

  const { data, isLoading, isFetching } = useSubscriptions(query);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  function openDetail(id: string) {
    setActiveId(id);
    setSheetOpen(true);
  }

  function update(patch: Partial<SubscriptionsListFilters>) {
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
            placeholder="بحث باسم المستخدم أو الخطة…"
            className="h-9 ps-8"
            aria-label="بحث في الاشتراكات"
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
            {SUBSCRIPTION_STATUS_FILTER_OPTIONS.map((opt) => (
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
            <p className="text-muted-foreground text-sm">لا توجد اشتراكات</p>
            <p className="text-muted-foreground/70 text-xs">
              جرّب تعديل عوامل التصفية أو البحث بكلمة أخرى.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                onOpen={() => openDetail(sub.id)}
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
      <SubscriptionDetailSheet
        subscriptionId={activeId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}

// ── Card ────────────────────────────────────────────────────────────────────────

function SubscriptionCard({
  subscription,
  onOpen,
}: {
  subscription: SubscriptionWithRelations;
  onOpen: () => void;
}) {
  const userName = getUserDisplayName(subscription.user);
  const planName = subscription.plan?.name ?? "—";
  const planPrice =
    subscription.plan != null
      ? formatPrice(subscription.plan.price, subscription.plan.currency)
      : "—";

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
        {/* Header: user name + status */}
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
                {subscription.user?.username
                  ? `@${subscription.user.username}`
                  : subscription.user?.telegramUserId != null
                    ? `Telegram #${subscription.user.telegramUserId}`
                    : "—"}
              </p>
            </div>
          </div>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>

        {/* Plan */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Wallet className="text-muted-foreground size-4 shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium" title={planName}>
                {planName}
              </p>
              {subscription.plan?.code && (
                <p className="text-muted-foreground font-mono text-[10px] uppercase">
                  {subscription.plan.code}
                </p>
              )}
            </div>
          </div>
          <span className="text-sm font-semibold tabular-nums">
            {planPrice}
          </span>
        </div>

        {/* Dates */}
        <div className="text-muted-foreground flex items-center justify-between gap-2 border-t pt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            <span>البداية: {formatDate(subscription.startsAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            <span>النهاية: {formatDate(subscription.expiresAt)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
