"use client";

import { Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExerciseCollection } from "@/types/exercises";

export interface ExercisesTableFilters {
  search: string;
  collectionId: string; // "" = all collections
}

interface ExercisesToolbarProps {
  filters: ExercisesTableFilters;
  onFiltersChange: (
    next:
      | ExercisesTableFilters
      | ((prev: ExercisesTableFilters) => ExercisesTableFilters),
  ) => void;
  onNew: () => void;
  /** Collections available for the filter dropdown. */
  collections: ExerciseCollection[];
}

/** Search + collection filter toolbar + primary "New exercise" action. */
export function ExercisesToolbar({
  filters,
  onFiltersChange,
  onNew,
  collections,
}: ExercisesToolbarProps) {
  const hasActiveFilters = filters.search !== "" || filters.collectionId !== "";

  function update(patch: Partial<ExercisesTableFilters>) {
    onFiltersChange((prev) => ({ ...prev, ...patch }));
  }

  function reset() {
    onFiltersChange({ search: "", collectionId: "" });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2" />
          <Input
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="بحث في التمارين…"
            className="h-9 ps-8"
            aria-label="بحث في التمارين"
          />
        </div>

        <Select
          value={filters.collectionId || "all"}
          onValueChange={(v) =>
            update({ collectionId: v === "all" ? "" : v })
          }
        >
          <SelectTrigger className="h-9 w-full sm:w-[200px]" aria-label="فلتر السلسلة">
            <SelectValue placeholder="كل السلاسل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل السلاسل</SelectItem>
            {collections.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
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

      <Button
        onClick={onNew}
        className="bg-brand text-brand-foreground hover:bg-brand/90 shrink-0"
      >
        <Plus className="size-4" />
        تمرين جديد
      </Button>
    </div>
  );
}
