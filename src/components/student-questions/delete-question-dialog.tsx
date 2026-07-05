"use client";

import { Loader2, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteStudentQuestion } from "@/hooks/queries/use-student-question";
import type { StudentQuestion } from "@/types/domain";
import { cn } from "@/lib/utils";

interface DeleteQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: StudentQuestion | null;
}

/** Confirmation dialog for destructive delete. */
export function DeleteQuestionDialog({
  open,
  onOpenChange,
  question,
}: DeleteQuestionDialogProps) {
  const deleteMutation = useDeleteStudentQuestion();

  function handleConfirm() {
    if (!question) return;
    deleteMutation.mutate(question.id, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف السؤال؟</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم حذف السؤال{" "}
            <span dir="auto" className="text-foreground font-medium">
              {question?.question}
            </span>{" "}
            بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
            className={cn(
              "bg-destructive text-white hover:bg-destructive/90",
              "focus-visible:ring-destructive",
            )}
          >
            {deleteMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            <Trash2 className="size-4" />
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
