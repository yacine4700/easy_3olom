"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LevelBadge } from "@/components/shared/level-badge";
import { StatusBadge } from "@/components/shared/status-badge";
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
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            aria-label="Open row actions"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => actions.onEdit(term)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => actions.onDelete(term)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
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
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 36,
    },
    {
      accessorKey: "term",
      header: "Term (FR)",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{row.original.term}</span>
          <span
            dir="rtl"
            className="text-muted-foreground truncate text-xs"
            lang="ar"
          >
            {row.original.termAr}
          </span>
        </div>
      ),
    },
    {
      id: "definition",
      header: "Definition",
      cell: ({ row }) => (
        <div className="max-w-[42ch]">
          <p className="text-muted-foreground truncate text-xs">
            {row.original.definition}
          </p>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "level",
      header: "Level",
      cell: ({ row }) => <LevelBadge level={row.original.level} />,
      size: 90,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      size: 140,
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {formatDistanceToNow(new Date(row.original.updatedAt), {
            addSuffix: true,
          })}
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
