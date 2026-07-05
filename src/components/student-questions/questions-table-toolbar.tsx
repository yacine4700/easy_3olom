"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type QuestionStatusFilter = "all" | "new" | "answered";

export interface QuestionsTableFilters {
  search: string;
  status: QuestionStatusFilter;
}

interface QuestionsTableToolbarProps {
  filters: QuestionsTableFilters;
  onFiltersChange: (
    next:
      | QuestionsTableFilters
      | ((prev: QuestionsTableFilters) => QuestionsTableFilters),
  ) => void;
}

const STATUS_OPTIONS: { value: QuestionStatusFilter; label: string }[] = [
  { value: "all", label: "كل الحالات" },
  { value: "new", label: "جديد" },
  { value: "answered", label: "تمت الإجابة" },
];

/**
 * Search + status toolbar for the questions table.
 * No "New" button — questions arrive via Telegram, not the admin UI.
 */
export function QuestionsTableToolbar({
  filters,
  onFiltersChange,
}: QuestionsTableToolbarProps) {
  const hasActiveFilters = filters.search !== "" || filters.status !== "all";

  function update(patch: Partial<QuestionsTableFilters>) {
    onFiltersChange((prev) => ({ ...prev, ...patch }));
  }

  function reset() {
    onFiltersChange({ search: "", status: "all" });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2" />
          <Input
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="بحث في السؤال أو الإجابة…"
            className="h-9 ps-8"
            aria-label="بحث في الأسئلة"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(v) =>
            update({ status: v as QuestionsTableFilters["status"] })
          }
        >
          <SelectTrigger
            className="h-9 w-full sm:w-[160px]"
            aria-label="تصفية حسب الحالة"
          >
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
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
    </div>
  );
}
