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
import { useDeleteExerciseCollection } from "@/hooks/queries/use-exercises";
import type { ExerciseCollection } from "@/types/exercises";
import { cn } from "@/lib/utils";

interface DeleteCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: ExerciseCollection | null;
}

/** Confirmation dialog for destructive delete. */
export function DeleteCollectionDialog({
  open,
  onOpenChange,
  collection,
}: DeleteCollectionDialogProps) {
  const deleteMutation = useDeleteExerciseCollection();

  function handleConfirm() {
    if (!collection) return;
    deleteMutation.mutate(collection.id, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف السلسلة؟</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم حذف السلسلة{" "}
            <span className="text-foreground font-medium">
              {collection?.title}
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
