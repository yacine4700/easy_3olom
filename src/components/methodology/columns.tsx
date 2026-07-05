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
    <div className="text-start">
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
          <DropdownMenuItem onClick={() => actions.onEdit(methodology)}>
            <Pencil className="size-4" />
            تعديل
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => actions.onDelete(methodology)}
          >
            <Trash2 className="size-4" />
            حذف
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
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{row.original.title}</span>
          {row.original.explanation ? (
            <span className="text-muted-foreground line-clamp-1 max-w-[42ch] text-xs">
              {row.original.explanation}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      id: "keywords",
      header: "الكلمات المفتاحية",
      cell: ({ row }) => {
        const kws = row.original.keywords ?? [];
        if (!kws.length) {
          return (
            <span className="text-muted-foreground text-xs">—</span>
          );
        }
        return (
          <div className="flex flex-wrap gap-1">
            {kws.slice(0, 3).map((k, i) => (
              <Badge key={`${k}-${i}`} variant="secondary" className="text-xs">
                {k}
              </Badge>
            ))}
            {kws.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{kws.length - 3}
              </Badge>
            )}
          </div>
        );
      },
      enableSorting: false,
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
