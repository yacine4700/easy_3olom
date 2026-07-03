"use client";

import * as React from "react";
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
import { useDeleteGlossaryTerm } from "@/hooks/queries/use-glossary";
import type { GlossaryTerm } from "@/types/domain";
import { cn } from "@/lib/utils";

interface DeleteTermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  term: GlossaryTerm | null;
}

/** Confirmation dialog for destructive delete. */
export function DeleteTermDialog({
  open,
  onOpenChange,
  term,
}: DeleteTermDialogProps) {
  const deleteMutation = useDeleteGlossaryTerm();

  function handleConfirm() {
    if (!term) return;
    deleteMutation.mutate(term.id, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete term?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="text-foreground font-medium">{term?.term}</span>
            <span className="text-muted-foreground"> / {term?.termAr}</span>{" "}
            from the glossary. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
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
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
