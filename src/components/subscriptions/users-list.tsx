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
import { UserStatusBadge } from "@/components/subscriptions/user-status-badge";
import {
  DASH,
  formatDateTime,
  getUserDisplayName,
} from "@/components/subscriptions/format";
import { useUsers } from "@/hooks/queries/use-subscriptions";
import type { User, UserStatus } from "@/types/subscriptions";

type StatusFilter = "all" | UserStatus;
type SortOrder = "newest" | "oldest";

interface UsersTableFilters {
  search: string;
  status: StatusFilter;
  sort: SortOrder;
}

const DEFAULT_FILTERS: UsersTableFilters = {
  search: "",
  status: "all",
  sort: "newest",
};

const PAGE_SIZE = 10;

const USER_STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "كل الحالات" },
  { value: "active", label: "نشط" },
  { value: "blocked", label: "محظور" },
];

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "الأحدث أولًا" },
  { value: "oldest", label: "الأقدم أولًا" },
];

/**
 * Users list — TanStack data table, READ-ONLY.
 *
 * Lists the Telegram-bot users (created from the bot side, never from this
 * admin UI). Mirrors the structure of the Subscriptions / Plans tables.
 */
export function UsersList() {
  const [filters, setFilters] =
    React.useState<UsersTableFilters>(DEFAULT_FILTERS);
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

  const { data, isLoading, isFetching } = useUsers(query);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  function update(patch: Partial<UsersTableFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }
  function reset() {
    setFilters(DEFAULT_FILTERS);
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.sort !== "newest";

  const columns = React.useMemo<ColumnDef<User>[]>(() => buildColumns(), []);

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
            placeholder="بحث باسم المستخدم أو معرّف تيليجرام…"
            className="h-9 ps-8"
            aria-label="بحث في المستخدمين"
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
            {USER_STATUS_FILTER_OPTIONS.map((opt) => (
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
                        لا يوجد مستخدمون
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

function buildColumns(): ColumnDef<User>[] {
  return [
    {
      id: "telegramUserId",
      header: "معرّف تيليجرام",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs tabular-nums">
          {row.original.telegramUserId != null
            ? `#${row.original.telegramUserId}`
            : DASH}
        </span>
      ),
    },
    {
      accessorKey: "username",
      header: "اسم المستخدم",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {row.original.username ? `@${row.original.username}` : DASH}
        </span>
      ),
    },
    {
      id: "fullName",
      header: "الاسم",
      cell: ({ row }) => {
        const name = getUserDisplayName(row.original);
        return (
          <span className="text-sm font-medium">{name}</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
    },
    {
      id: "createdAt",
      header: "أُنشئ",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs tabular-nums">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "lastSeenAt",
      header: "آخر ظهور",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs tabular-nums">
          {formatDateTime(row.original.lastSeenAt)}
        </span>
      ),
    },
  ];
}
