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
import type { Methodology } from "@/types/domain";

export interface MethodologyRowActions {
  onEdit: (methodology: Methodology) => void;
  onDelete: (methodology: Methodology) => void;
}

function RowActionsCell({
  methodology,
  actions,
}: {
  methodology: Methodology;
  actions: MethodologyRowActions;
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
          <DropdownMenuItem onClick={() => actions.onEdit(methodology)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => actions.onDelete(methodology)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Build the column definitions for the methodology table. */
export function getMethodologyColumns(
  actions: MethodologyRowActions,
): ColumnDef<Methodology>[] {
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
      accessorKey: "order",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground inline-flex size-6 items-center justify-center rounded-md bg-muted text-xs font-medium tabular-nums">
          {row.original.order}
        </span>
      ),
      size: 56,
    },
    {
      accessorKey: "title",
      header: "Sequence",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{row.original.title}</span>
          <span
            dir="rtl"
            lang="ar"
            className="text-muted-foreground truncate text-xs"
          >
            {row.original.titleAr}
          </span>
        </div>
      ),
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
        <RowActionsCell methodology={row.original} actions={actions} />
      ),
      size: 56,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
