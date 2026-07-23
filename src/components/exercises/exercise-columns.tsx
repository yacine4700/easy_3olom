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
import type { Exercise } from "@/types/exercises";

export interface ExerciseRowActions {
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
}

export interface ExerciseColumnContext {
  /** Map of collectionId → collection title, used to resolve the column. */
  collectionsById: Map<string, { id: string; title: string }>;
}

function RowActionsCell({
  exercise,
  actions,
}: {
  exercise: Exercise;
  actions: ExerciseRowActions;
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
          <DropdownMenuItem onClick={() => actions.onEdit(exercise)}>
            <Pencil className="size-4" />
            تعديل
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => actions.onDelete(exercise)}
          >
            <Trash2 className="size-4" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Build the column definitions for the exercises table. */
export function getExerciseColumns(
  actions: ExerciseRowActions,
  ctx: ExerciseColumnContext,
): ColumnDef<Exercise>[] {
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
      id: "exerciseNumber",
      header: "الرقم",
      cell: ({ row }) => {
        const num = row.original.exerciseNumber;
        if (num == null) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        return (
          <Badge variant="secondary" className="text-xs">
            #{num}
          </Badge>
        );
      },
      size: 90,
      enableSorting: false,
    },
    {
      accessorKey: "exerciseMode",
      header: "الطبيعة",
      cell: ({ row }) => {
        const mode = row.original.exerciseMode;
        if (!mode) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        const labels: Record<string, string> = {
          RETRIEVAL: "استرجاع",
          REASONING: "استدلال علمي",
          SCIENTIFIC_APPROACH: "مسعى علمي",
        };
        return (
          <Badge variant="outline" className="text-xs">
            {labels[mode] ?? mode}
          </Badge>
        );
      },
      size: 140,
      enableSorting: false,
    },
    {
      accessorKey: "mainConcept",
      header: "فكرة التمرين",
      cell: ({ row }) => {
        const concept = row.original.mainConcept;
        if (!concept) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        return (
          <span className="line-clamp-1 max-w-[42ch] text-sm font-medium">
            {concept}
          </span>
        );
      },
      size: 260,
      enableSorting: false,
    },
    {
      id: "collection",
      header: "السلسلة",
      cell: ({ row }) => {
        const cid = row.original.collectionId;
        const collection = cid ? ctx.collectionsById.get(cid) : null;
        if (!collection) {
          return (
            <span className="text-muted-foreground text-xs">—</span>
          );
        }
        return (
          <span className="text-muted-foreground line-clamp-1 max-w-[28ch] text-sm">
            {collection.title}
          </span>
        );
      },
      size: 200,
      enableSorting: false,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActionsCell exercise={row.original} actions={actions} />
      ),
      size: 56,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
