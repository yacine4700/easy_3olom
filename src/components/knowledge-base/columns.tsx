"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { KnowledgeDocument } from "@/types/domain";

/** Actions available on each row; the table component supplies handlers. */
export interface RowActions {
  onEdit: (document: KnowledgeDocument) => void;
  onDelete: (document: KnowledgeDocument) => void;
}

/** Cell that renders the row actions dropdown. Kept here so columns stay
 *  colocated with the data they describe. */
function RowActionsCell({
  document,
  actions,
}: {
  document: KnowledgeDocument;
  actions: RowActions;
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
          <DropdownMenuItem onClick={() => actions.onEdit(document)}>
            <Pencil className="size-4" />
            تعديل
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => actions.onDelete(document)}
          >
            <Trash2 className="size-4" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Truncate a string to a preview length for the title column. */
function preview(text: string | null, max = 60): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/** Build the column definitions. Needs `actions` for the last column. */
export function getColumns(
  actions: RowActions,
): ColumnDef<KnowledgeDocument>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
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
          {row.original.content ? (
            <span className="text-muted-foreground max-w-[36ch] truncate text-xs">
              {preview(row.original.content)}
            </span>
          ) : null}
        </div>
      ),
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
      accessorKey: "keywords",
      header: "الكلمات المفتاحية",
      cell: ({ row }) => {
        const keywords = row.original.keywords;
        if (!keywords || keywords.length === 0) {
          return (
            <span className="text-muted-foreground text-xs">—</span>
          );
        }
        return (
          <div className="flex max-w-[20ch] flex-wrap gap-1">
            {keywords.slice(0, 4).map((kw) => (
              <Badge key={kw} variant="secondary" className="text-[10px]">
                {kw}
              </Badge>
            ))}
            {keywords.length > 4 ? (
              <Badge variant="outline" className="text-[10px]">
                +{keywords.length - 4}
              </Badge>
            ) : null}
          </div>
        );
      },
      enableSorting: false,
      size: 180,
    },
    {
      accessorKey: "createdAt",
      header: "أُنشئ",
      cell: ({ row }) => {
        const created = row.original.createdAt;
        if (!created) return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <span className="text-muted-foreground text-xs">
            {formatDistanceToNow(new Date(created), {
              addSuffix: true,
              locale: ar,
            })}
          </span>
        );
      },
      size: 130,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActionsCell document={row.original} actions={actions} />
      ),
      size: 56,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
