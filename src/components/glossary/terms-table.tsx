"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getTermColumns, type TermRowActions } from "@/components/glossary/columns";
import type { GlossaryTerm } from "@/types/domain";
import { cn } from "@/lib/utils";

interface TermsTableProps {
  terms: GlossaryTerm[];
  isLoading?: boolean;
  actions: TermRowActions;
}

/**
 * Data table for glossary terms.
 * Mirrors the Knowledge Base table structure (sort + paginate + select).
 */
export function TermsTable({ terms, isLoading, actions }: TermsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "term", desc: false },
  ]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = React.useMemo(() => getTermColumns(actions), [actions]);

  const table = useReactTable({
    data: terms,
    columns,
    state: { sorting, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const rows = table.getRowModel().rows;
  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={cn(
                        "h-10",
                        canSort && "cursor-pointer select-none",
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1.5">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {canSort && sorted === "asc" && (
                            <ArrowUp className="size-3" />
                          )}
                          {canSort && sorted === "desc" && (
                            <ArrowDown className="size-3" />
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                  {table.getVisibleLeafColumns().map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full max-w-[16ch]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-32"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <Inbox className="text-muted-foreground/50 size-7" />
                    <p className="text-muted-foreground text-sm">
                      No terms found
                    </p>
                    <p className="text-muted-foreground/70 text-xs">
                      Try adjusting your filters or add a new term.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>
            {rows.length === 0
              ? "0"
              : `${selectedCount} of ${terms.length} selected`}
          </span>
          {selectedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setRowSelection({})}
            >
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Rows</span>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-muted-foreground text-xs">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="First page"
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              aria-label="Last page"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
