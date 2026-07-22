"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExerciseCollection } from "@/types/exercises";

export interface CollectionRowActions {
  onEdit: (collection: ExerciseCollection) => void;
  onDelete: (collection: ExerciseCollection) => void;
}

function RowActionsCell({
  collection,
  actions,
}: {
  collection: ExerciseCollection;
  actions: CollectionRowActions;
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
          <DropdownMenuItem onClick={() => actions.onEdit(collection)}>
            <Pencil className="size-4" />
            تعديل
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => actions.onDelete(collection)}
          >
            <Trash2 className="size-4" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Build the column definitions for the exercise collections table. */
export function getCollectionColumns(
  actions: CollectionRowActions,
): ColumnDef<ExerciseCollection>[] {
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
      accessorKey: "title",
      header: "العنوان",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "collectionType",
      header: "النوع",
      cell: ({ row }) =>
        row.original.collectionType ? (
          <Badge variant="secondary" className="text-xs">
            {row.original.collectionType}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
      size: 120,
    },
    {
      accessorKey: "year",
      header: "السنة",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.year ?? "—"}
        </span>
      ),
      size: 90,
    },
    {
      accessorKey: "unit",
      header: "الوحدة",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.unit || "—"}
        </span>
      ),
      size: 160,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActionsCell collection={row.original} actions={actions} />
      ),
      size: 56,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
