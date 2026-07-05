"use client";

import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface MethodologyTableFilters {
  search: string;
}

interface MethodologyTableToolbarProps {
  filters: MethodologyTableFilters;
  onFiltersChange: (
    next:
      | MethodologyTableFilters
      | ((prev: MethodologyTableFilters) => MethodologyTableFilters),
  ) => void;
  onNew: () => void;
}

/** Search-only toolbar + primary "New rule" action. */
export function MethodologyTableToolbar({
  filters,
  onFiltersChange,
  onNew,
}: MethodologyTableToolbarProps) {
  function update(patch: Partial<MethodologyTableFilters>) {
    onFiltersChange((prev) => ({ ...prev, ...patch }));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2" />
          <Input
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="بحث…"
            className="h-9 ps-8"
            aria-label="بحث في القواعد"
          />
        </div>
      </div>

      <Button
        onClick={onNew}
        className="bg-brand text-brand-foreground hover:bg-brand/90 shrink-0"
      >
        <Plus className="size-4" />
        قاعدة جديدة
      </Button>
    </div>
  );
}
