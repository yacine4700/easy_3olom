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
import { CONTENT_STATUSES, EDUCATION_LEVELS } from "@/lib/constants/education";
import type { ContentStatus, EducationLevel } from "@/types/domain";

export interface DocumentsTableFilters {
  search: string;
  level: EducationLevel | "all";
  status: ContentStatus | "all";
}

interface TableToolbarProps {
  filters: DocumentsTableFilters;
  onFiltersChange: (
    next: DocumentsTableFilters | ((prev: DocumentsTableFilters) => DocumentsTableFilters),
  ) => void;
  onNew: () => void;
}

/** Filter/search toolbar + primary "New document" action. */
export function TableToolbar({
  filters,
  onFiltersChange,
  onNew,
}: TableToolbarProps) {
  const hasActiveFilters =
    filters.search !== "" || filters.level !== "all" || filters.status !== "all";

  function update(patch: Partial<DocumentsTableFilters>) {
    onFiltersChange((prev) => ({ ...prev, ...patch }));
  }

  function reset() {
    onFiltersChange({ search: "", level: "all", status: "all" });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search title or source…"
            className="h-9 pl-8"
            aria-label="Search documents"
          />
        </div>

        <Select
          value={filters.level}
          onValueChange={(v) => update({ level: v as DocumentsTableFilters["level"] })}
        >
          <SelectTrigger className="h-9 w-full sm:w-[150px]" aria-label="Filter by level">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {EDUCATION_LEVELS.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label} · {l.hint}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(v) => update({ status: v as DocumentsTableFilters["status"] })}
        >
          <SelectTrigger className="h-9 w-full sm:w-[150px]" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {CONTENT_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
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
            Clear
          </Button>
        )}
      </div>

      <Button onClick={onNew} className="bg-brand text-brand-foreground hover:bg-brand/90 shrink-0">
        <Plus className="size-4" />
        New document
      </Button>
    </div>
  );
}
