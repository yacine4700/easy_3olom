"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StudentQuestion } from "@/types/domain";

export interface QuestionRowActions {
  onEdit: (question: StudentQuestion) => void;
  onDelete: (question: StudentQuestion) => void;
}

function RowActionsCell({
  question,
  actions,
}: {
  question: StudentQuestion;
  actions: QuestionRowActions;
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
          <DropdownMenuItem onClick={() => actions.onEdit(question)}>
            <Pencil className="size-4" />
            تعديل الإجابة
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => actions.onDelete(question)}
          >
            <Trash2 className="size-4" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Build the column definitions for the student questions table. */
export function getQuestionColumns(
  actions: QuestionRowActions,
): ColumnDef<StudentQuestion>[] {
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
      accessorKey: "question",
      header: "السؤال",
      cell: ({ row }) => (
        <div className="flex max-w-[40ch] flex-col gap-0.5">
          <span dir="auto" className="line-clamp-2 font-medium">
            {row.original.question}
          </span>
          <span
            dir="auto"
            className="text-muted-foreground line-clamp-1 text-xs"
          >
            {row.original.answer ?? "لا توجد إجابة بعد"}
          </span>
        </div>
      ),
    },
    {
      id: "session",
      header: "الجلسة / المستخدم",
      cell: ({ row }) => {
        const { userId, sessionId } = row.original;
        if (!userId && !sessionId) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        return (
          <div className="flex flex-col gap-0.5">
            {userId && (
              <span
                dir="ltr"
                className="text-muted-foreground truncate font-mono text-xs"
                title={userId}
              >
                {userId}
              </span>
            )}
            {sessionId && (
              <span
                dir="ltr"
                className="text-muted-foreground/70 truncate font-mono text-xs"
                title={sessionId}
              >
                {sessionId}
              </span>
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 180,
    },
    {
      accessorKey: "createdAt",
      header: "الوقت",
      cell: ({ row }) => {
        const created = row.original.createdAt;
        if (!created) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
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
        <RowActionsCell question={row.original} actions={actions} />
      ),
      size: 56,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
