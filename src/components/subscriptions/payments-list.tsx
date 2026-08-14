"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  ArrowDownUp,
  Inbox,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListPagination } from "@/components/subscriptions/list-pagination";
import {
  PAYMENT_STATUS_FILTER_OPTIONS,
  PaymentStatusBadge,
} from "@/components/subscriptions/payment-status-badge";
import { PaymentDetailSheet } from "@/components/subscriptions/payment-detail";
import { PaymentActions } from "@/components/subscriptions/payment-actions";
import {
  DASH,
  formatDateTime,
  formatPrice,
  getUserDisplayName,
} from "@/components/subscriptions/format";
import { usePayments } from "@/hooks/queries/use-subscriptions";
import type { PaymentStatus, PaymentWithRelations } from "@/types/subscriptions";

type StatusFilter = "all" | PaymentStatus;
type SortOrder = "newest" | "oldest";

interface PaymentsTableFilters {
  search: string;
  sort: SortOrder;
}

interface PaymentsTableProps {
  /** Controlled status filter — lifted to the page so KPI cards can preset it. */
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
}

const DEFAULT_FILTERS: PaymentsTableFilters = {
  search: "",
  sort: "newest",
};

const PAGE_SIZE = 10;

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "الأحدث أولًا" },
  { value: "oldest", label: "الأقدم أولًا" },
];

/**
 * Payments list — TanStack data table.
 *
 * Replaces the previous card grid. Server-side pagination + search + status +
 * sort; the table component itself only handles the row layout and the row
 * click → Sheet detail. The status filter is controlled by the parent so KPI
 * cards can preset it (e.g. clicking "مدفوعات معلقة" sets status = `pending`
 * and switches the tab).
 *
 * A trailing "إجراءات" column renders Approve / Reject buttons inline for
 * `pending` payments — those go through the webhook via the
 * `useReviewPayment` mutation (see `payment-actions.tsx`).
 */
export function PaymentsTable({
  statusFilter,
  onStatusFilterChange,
}: PaymentsTableProps) {
  const [filters, setFilters] =
    React.useState<PaymentsTableFilters>(DEFAULT_FILTERS);
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
  }, [debouncedSearch, statusFilter, filters.sort, pageSize]);

  const query = React.useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      sort: filters.sort,
      page,
      pageSize,
    }),
    [debouncedSearch, statusFilter, filters.sort, page, pageSize],
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

  function closeDetail() {
    setSheetOpen(false);
  }

  function update(patch: Partial<PaymentsTableFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function reset() {
    setFilters(DEFAULT_FILTERS);
    onStatusFilterChange("all");
  }

  const hasActiveFilters =
    filters.search !== "" ||
    statusFilter !== "all" ||
    filters.sort !== "newest";

  const columns = React.useMemo<ColumnDef<PaymentWithRelations>[]>(
    () => buildColumns(),
    [],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
          value={statusFilter}
          onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}
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

      {/* Table */}
      <div
        data-loading={isFetching && !isLoading}
        className="relative transition-opacity data-[loading=true]:opacity-70"
      >
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-10">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow
                    key={`skeleton-${i}`}
                    className="hover:bg-transparent"
                  >
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full max-w-[16ch]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openDetail(row.original.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openDetail(row.original.id);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        // Prevent the actions cell from triggering a row click.
                        onClick={
                          cell.column.id === "actions"
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-32"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <Inbox className="text-muted-foreground/50 size-7" />
                      <p className="text-muted-foreground text-sm">
                        لا توجد مدفوعات
                      </p>
                      <p className="text-muted-foreground/70 text-xs">
                        جرّب تعديل عوامل التصفية أو البحث بكلمة أخرى.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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
        onOpenChange={(next) => {
          if (!next) closeDetail();
        }}
      />
    </div>
  );
}

// ── Columns ────────────────────────────────────────────────────────────────────

function buildColumns(): ColumnDef<PaymentWithRelations>[] {
  return [
    {
      id: "user",
      header: "المستخدم",
      cell: ({ row }) => {
        const user = row.original.user;
        const name = getUserDisplayName(user);
        return (
          <div className="flex min-w-[14ch] flex-col gap-0.5">
            <span className="truncate text-sm font-medium" title={name}>
              {name}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {user?.username
                ? `@${user.username}`
                : user?.telegramUserId != null
                  ? `#${user.telegramUserId}`
                  : DASH}
            </span>
          </div>
        );
      },
    },
    {
      id: "amount",
      header: "المبلغ",
      cell: ({ row }) => (
        <span className="text-sm font-semibold tabular-nums">
          {formatPrice(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      id: "method",
      header: "الطريقة",
      cell: ({ row }) => (
        <span className="text-muted-foreground rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase">
          {row.original.method}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
    },
    {
      id: "transactionReference",
      header: "المرجع",
      cell: ({ row }) => {
        const ref = row.original.transactionReference;
        return ref ? (
          <span
            className="text-muted-foreground truncate font-mono text-xs"
            title={ref}
          >
            #{ref}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">{DASH}</span>
        );
      },
    },
    {
      id: "createdAt",
      header: "أُنشئت",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs tabular-nums">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "إجراءات",
      enableSorting: false,
      cell: ({ row }) => (
        <PaymentActions payment={row.original} variant="inline" />
      ),
    },
  ];
}
