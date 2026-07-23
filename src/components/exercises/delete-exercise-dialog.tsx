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
import { useDeleteExercise } from "@/hooks/queries/use-exercises";
import type { Exercise } from "@/types/exercises";
import { cn } from "@/lib/utils";

interface DeleteExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: Exercise | null;
}

/** Confirmation dialog for destructive delete. */
export function DeleteExerciseDialog({
  open,
  onOpenChange,
  exercise,
}: DeleteExerciseDialogProps) {
  const deleteMutation = useDeleteExercise();

  function handleConfirm() {
    if (!exercise) return;
    deleteMutation.mutate(exercise.id, {
      onSuccess: () => onOpenChange(false),
    });
  }

  // No `title` on exercises anymore — identify by mainConcept, falling back
  // to the exercise number (e.g. "التمرين #2").
  const label =
    exercise?.mainConcept?.trim() ||
    (exercise?.exerciseNumber != null
      ? `التمرين رقم ${exercise.exerciseNumber}`
      : "هذا التمرين");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف التمرين؟</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم حذف{" "}
            <span className="text-foreground font-medium">{label}</span>{" "}
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
