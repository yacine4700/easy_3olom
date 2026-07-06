"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnswerForm } from "@/components/student-questions/answer-form";
import { useUpdateStudentQuestion } from "@/hooks/queries/use-student-question";
import type { UpdateStudentQuestionInput } from "@/lib/validators/student-question";
import type { StudentQuestion } from "@/types/domain";

interface AnswerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: StudentQuestion | null;
}

/** Dialog wrapping `AnswerForm` for editing a question's answer. */
export function AnswerDialog({
  open,
  onOpenChange,
  question,
}: AnswerDialogProps) {
  const updateMutation = useUpdateStudentQuestion();

  function handleSubmit(values: UpdateStudentQuestionInput) {
    if (!question) return;
    updateMutation.mutate(
      { id: question.id, input: values },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>تعديل الإجابة</DialogTitle>
          <DialogDescription>
            اكتب أو حسّن إجابة المساعد على سؤال الطالب.
          </DialogDescription>
        </DialogHeader>

        {question ? (
          <AnswerForm
            question={question}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={updateMutation.isPending}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
