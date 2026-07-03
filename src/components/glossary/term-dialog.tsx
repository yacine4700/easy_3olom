"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TermForm } from "@/components/glossary/term-form";
import {
  useCreateGlossaryTerm,
  useUpdateGlossaryTerm,
} from "@/hooks/queries/use-glossary";
import type { CreateGlossaryTermInput } from "@/lib/validators/glossary";
import type { GlossaryTerm } from "@/types/domain";

interface TermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided the dialog edits this term; otherwise it creates. */
  term?: GlossaryTerm | null;
}

/** Single dialog handling both create and edit flows. */
export function TermDialog({ open, onOpenChange, term }: TermDialogProps) {
  const isEdit = Boolean(term);

  const createMutation = useCreateGlossaryTerm();
  const updateMutation = useUpdateGlossaryTerm();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(values: CreateGlossaryTermInput) {
    if (isEdit && term) {
      updateMutation.mutate(
        { id: term.id, input: values },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => onOpenChange(false),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit term" : "New term"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this bilingual glossary term."
              : "Add a new bilingual (FR + AR) glossary term."}
          </DialogDescription>
        </DialogHeader>

        <TermForm
          defaultValues={term ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
