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
import { useDeleteMethodology } from "@/hooks/queries/use-methodology";
import type { Methodology } from "@/types/domain";
import { cn } from "@/lib/utils";

interface DeleteMethodologyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  methodology: Methodology | null;
}

/** Confirmation dialog for destructive delete. */
export function DeleteMethodologyDialog({
  open,
  onOpenChange,
  methodology,
}: DeleteMethodologyDialogProps) {
  const deleteMutation = useDeleteMethodology();

  function handleConfirm() {
    if (!methodology) return;
    deleteMutation.mutate(methodology.id, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete sequence?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="text-foreground font-medium">
              {methodology?.title}
            </span>
            <span className="text-muted-foreground"> / {methodology?.titleAr}</span>{" "}
            from the methodology. This action cannot be undone.
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
