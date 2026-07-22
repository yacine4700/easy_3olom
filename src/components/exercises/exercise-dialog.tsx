"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExerciseForm } from "@/components/exercises/exercise-form";
import {
  useCreateExercise,
  useUpdateExercise,
} from "@/hooks/queries/use-exercises";
import type { CreateExerciseInput } from "@/lib/validators/exercises";
import type { Exercise } from "@/types/exercises";

interface ExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided the dialog edits this exercise; otherwise it creates. */
  exercise?: Exercise | null;
}

/** Single dialog handling both create and edit flows. Large width (3xl). */
export function ExerciseDialog({
  open,
  onOpenChange,
  exercise,
}: ExerciseDialogProps) {
  const isEdit = Boolean(exercise);

  const createMutation = useCreateExercise();
  const updateMutation = useUpdateExercise();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(values: CreateExerciseInput) {
    if (isEdit && exercise) {
      updateMutation.mutate(
        { id: exercise.id, input: values },
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "تعديل التمرين" : "تمرين جديد"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "حدّث بيانات هذا التمرين وأجزاءه وأسئلته."
              : "أضف تمريناً جديداً مع أجزائه وأسئلته ومعايير تصحيحه."}
          </DialogDescription>
        </DialogHeader>

        <ExerciseForm
          defaultValues={exercise ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
