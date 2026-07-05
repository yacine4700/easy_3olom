"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { GlossaryTerm } from "@/types/domain";

export interface TermRowActions {
  onEdit: (term: GlossaryTerm) => void;
  onDelete: (term: GlossaryTerm) => void;
}

function RowActionsCell({
  term,
  actions,
}: {
  term: GlossaryTerm;
  actions: TermRowActions;
}) {
  return (
    <div className="text-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            aria-label="إجراءات الصف"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => actions.onEdit(term)}>
            <Pencil className="size-4" />
            تعديل
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => actions.onDelete(term)}
          >
            <Trash2 className="size-4" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Truncate a definition for the column preview. */
function preview(text: string | null, max = 80): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/** Build the column definitions for the glossary table. */
export function getTermColumns(
  actions: TermRowActions,
): ColumnDef<GlossaryTerm>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="تحديد الكل"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="تحديد الصف"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 36,
    },
    {
      accessorKey: "term",
      header: "المصطلح",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{row.original.term}</span>
          {row.original.definition ? (
            <span className="text-muted-foreground max-w-[44ch] truncate text-xs">
              {preview(row.original.definition)}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "unit",
      header: "الوحدة",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.unit || "—"}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: "domain",
      header: "المجال",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.domain || "—"}
        </span>
      ),
      size: 120,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActionsCell term={row.original} actions={actions} />
      ),
      size: 56,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
