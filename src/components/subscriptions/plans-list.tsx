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
  CircleCheck,
  CircleX,
  Inbox,
  Search,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { formatPrice } from "@/components/subscriptions/format";
import { usePlans } from "@/hooks/queries/use-subscriptions";
import type { Plan } from "@/types/subscriptions";

type ActiveFilter = "all" | "true" | "false";
type SortOrder = "newest" | "oldest";

interface PlansTableFilters {
  search: string;
  active: ActiveFilter;
  sort: SortOrder;
}

const DEFAULT_FILTERS: PlansTableFilters = {
  search: "",
  active: "all",
  sort: "newest",
};

const PAGE_SIZE = 10;

const ACTIVE_OPTIONS: { value: ActiveFilter; label: string }[] = [
  { value: "all", label: "كل الخطط" },
  { value: "true", label: "نشطة" },
  { value: "false", label: "غير نشطة" },
];

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "الأحدث أولًا" },
  { value: "oldest", label: "الأقدم أولًا" },
];

/**
 * Plans list — TanStack data table, READ-ONLY.
 *
 * Mirrors the structure of the Subscriptions table (server-side search +
 * filter + sort + pagination), but with no row actions: the admin UI only
 * displays plans. Adding / editing / disabling plans happens through the
 * Telegram bot / n8n flow.
 */
export function PlansList() {
  const [filters, setFilters] =
    React.useState<PlansTableFilters>(DEFAULT_FILTERS);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE);

  // Debounce search.
  const [debouncedSearch, setDebouncedSearch] = React.useState(filters.search);
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.active, filters.sort, pageSize]);

  const query = React.useMemo(
    () => ({
      search: debouncedSearch || undefined,
      active:
        filters.active === "all"
          ? undefined
          : filters.active === "true",
      sort: filters.sort,
      page,
      pageSize,
    }),
    [debouncedSearch, filters.active, filters.sort, page, pageSize],
  );

  const { data, isLoading, isFetching } = usePlans(query);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  function update(patch: Partial<PlansTableFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }
  function reset() {
    setFilters(DEFAULT_FILTERS);
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.active !== "all" ||
    filters.sort !== "newest";

  const columns = React.useMemo<ColumnDef<Plan>[]>(() => buildColumns(), []);

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
            placeholder="بحث برمز الخطة أو اسمها…"
            className="h-9 ps-8"
            aria-label="بحث في الخطط"
          />
        </div>

        <Select
          value={filters.active}
          onValueChange={(v) => update({ active: v as ActiveFilter })}
        >
          <SelectTrigger
            className="h-9 w-full sm:w-[160px]"
            aria-label="تصفية حسب الحالة"
          >
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVE_OPTIONS.map((opt) => (
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                  <TableCell colSpan={columns.length} className="h-32">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <Inbox className="text-muted-foreground/50 size-7" />
                      <p className="text-muted-foreground text-sm">
                        لا توجد خطط
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
    </div>
  );
}

// ── Columns ────────────────────────────────────────────────────────────────────

function buildColumns(): ColumnDef<Plan>[] {
  return [
    {
      accessorKey: "code",
      header: "الرمز",
      cell: ({ row }) => (
        <span className="font-mono text-xs uppercase">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "الاسم",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "price",
      header: "السعر",
      cell: ({ row }) => (
        <span className="text-sm font-semibold tabular-nums">
          {formatPrice(row.original.price, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "durationDays",
      header: "المدة",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm tabular-nums">
          {row.original.durationDays} يومًا
        </span>
      ),
    },
    {
      accessorKey: "active",
      header: "الحالة",
      cell: ({ row }) => <ActiveBadge active={row.original.active} />,
    },
  ];
}

function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge
      variant="outline"
      className="gap-1 border-transparent bg-emerald-500/15 font-medium text-emerald-700 dark:text-emerald-400"
    >
      <CircleCheck className="size-3" />
      نشطة
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="gap-1 border-transparent bg-zinc-500/15 font-medium text-zinc-600 dark:text-zinc-300"
    >
      <CircleX className="size-3" />
      غير نشطة
    </Badge>
  );
}
