"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Minimal pagination footer for card-based lists.
 *
 * Mirrors the controls in the questions data-table but is driven by the
 * server-side pagination shape (`page`, `pageSize`, `total`) returned by the
 * Supabase-backed list endpoints.
 */
export interface ListPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
}

export function ListPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  isLoading = false,
}: ListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1 && !isLoading;
  const canNext = page < totalPages && !isLoading;

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <span>
          {total === 0
            ? "لا توجد نتائج"
            : `${rangeStart}–${rangeEnd} من ${total}`}
        </span>
        {onPageSizeChange && (
          <>
            <span className="text-muted-foreground/50">·</span>
            <div className="flex items-center gap-1.5">
              <span>الصفوف:</span>
              <select
                value={String(pageSize)}
                onChange={(e) =>
                  onPageSizeChange(Number(e.target.value))
                }
                className="bg-background hover:bg-muted/40 h-8 rounded-md border px-1.5 text-xs transition-colors"
                aria-label="عدد الصفوف في الصفحة"
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={String(n)}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-muted-foreground text-xs">
          صفحة {page} من {totalPages}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(1)}
            disabled={!canPrev}
            aria-label="الصفحة الأولى"
          >
            <ChevronsRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}
            aria-label="الصفحة السابقة"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
            aria-label="الصفحة التالية"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(totalPages)}
            disabled={!canNext}
            aria-label="الصفحة الأخيرة"
          >
            <ChevronsLeft className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
