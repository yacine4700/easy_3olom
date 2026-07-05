"use client";

import { Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface DocumentsTableFilters {
  search: string;
}

interface TableToolbarProps {
  filters: DocumentsTableFilters;
  onFiltersChange: (
    next: DocumentsTableFilters | ((prev: DocumentsTableFilters) => DocumentsTableFilters),
  ) => void;
  onNew: () => void;
}

/** Search toolbar + primary "New document" action. */
export function TableToolbar({
  filters,
  onFiltersChange,
  onNew,
}: TableToolbarProps) {
  const hasActiveFilters = filters.search !== "";

  function update(patch: Partial<DocumentsTableFilters>) {
    onFiltersChange((prev) => ({ ...prev, ...patch }));
  }

  function reset() {
    onFiltersChange({ search: "" });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2" />
          <Input
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="بحث في العنوان أو المحتوى…"
            className="h-9 ps-8"
            aria-label="بحث في الوثائق"
          />
        </div>

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

      <Button
        onClick={onNew}
        className="bg-brand text-brand-foreground hover:bg-brand/90 shrink-0"
      >
        <Plus className="size-4" />
        وثيقة جديدة
      </Button>
    </div>
  );
}
