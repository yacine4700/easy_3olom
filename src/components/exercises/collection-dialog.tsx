"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CollectionForm } from "@/components/exercises/collection-form";
import {
  useCreateExerciseCollection,
  useUpdateExerciseCollection,
} from "@/hooks/queries/use-exercises";
import type { CreateExerciseCollectionInput } from "@/lib/validators/exercises";
import type { ExerciseCollection } from "@/types/exercises";

interface CollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided the dialog edits this collection; otherwise it creates. */
  collection?: ExerciseCollection | null;
}

/** Single dialog handling both create and edit flows. */
export function CollectionDialog({
  open,
  onOpenChange,
  collection,
}: CollectionDialogProps) {
  const isEdit = Boolean(collection);

  const createMutation = useCreateExerciseCollection();
  const updateMutation = useUpdateExerciseCollection();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(values: CreateExerciseCollectionInput) {
    if (isEdit && collection) {
      updateMutation.mutate(
        { id: collection.id, input: values },
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
          <DialogTitle>
            {isEdit ? "تعديل السلسلة" : "سلسلة جديدة"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "حدّث بيانات هذه السلسلة من التمارين."
              : "أضف سلسلة تمارين جديدة لتنظيم التمارين ضمنها."}
          </DialogDescription>
        </DialogHeader>

        <CollectionForm
          defaultValues={collection ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
