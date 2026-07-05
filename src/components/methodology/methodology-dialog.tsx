"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MethodologyForm } from "@/components/methodology/methodology-form";
import {
  useCreateMethodology,
  useUpdateMethodology,
} from "@/hooks/queries/use-methodology";
import type { CreateMethodologyInput } from "@/lib/validators/methodology";
import type { Methodology } from "@/types/domain";

interface MethodologyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided the dialog edits this rule; otherwise it creates. */
  methodology?: Methodology | null;
}

/** Single dialog handling both create and edit flows. */
export function MethodologyDialog({
  open,
  onOpenChange,
  methodology,
}: MethodologyDialogProps) {
  const isEdit = Boolean(methodology);

  const createMutation = useCreateMethodology();
  const updateMutation = useUpdateMethodology();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(values: CreateMethodologyInput) {
    if (isEdit && methodology) {
      updateMutation.mutate(
        { id: methodology.id, input: values },
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
            {isEdit ? "تعديل القاعدة" : "قاعدة جديدة"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "حدّث محتوى هذه القاعدة التوجيهية لمساعد الذكاء الاصطناعي."
              : "أضف قاعدة توجيهية جديدة لمساعد الذكاء الاصطناعي."}
          </DialogDescription>
        </DialogHeader>

        <MethodologyForm
          defaultValues={methodology ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
