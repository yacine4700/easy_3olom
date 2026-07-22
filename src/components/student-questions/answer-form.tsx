"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateStudentQuestionSchema,
  type UpdateStudentQuestionInput,
} from "@/lib/validators/student-question";
import type { StudentQuestion } from "@/types/domain";

interface AnswerFormProps {
  question: StudentQuestion;
  onSubmit: (values: UpdateStudentQuestionInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Edit form for a student question's answer.
 *
 * The question itself is rendered read-only (with `dir="auto"` so mixed
 * Arabic/French text displays correctly); only the answer Textarea is
 * editable. RHF + zodResolver validate against `updateStudentQuestionSchema`.
 */
export function AnswerForm({
  question,
  onSubmit,
  onCancel,
  isSubmitting,
}: AnswerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateStudentQuestionInput>({
    resolver: zodResolver(updateStudentQuestionSchema),
    defaultValues: {
      answer: question.answer ?? null,
    },
  });

  function handleFormSubmit(raw: UpdateStudentQuestionInput) {
    // Normalize empty string → null so the DB stores a clean NULL (which
    // the derived status "new" depends on).
    onSubmit({ answer: raw.answer ? raw.answer : null });
  }

  return (
    <form
      id="answer-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="question-preview">السؤال</Label>
        <div
          id="question-preview"
          dir="auto"
          className="bg-muted/30 rounded-md border p-3"
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {question.question}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="answer">الإجابة</Label>
        <Textarea
          id="answer"
          rows={8}
          dir="auto"
          placeholder="اكتب أو حسّن إجابة المساعد…"
          {...register("answer")}
        />
        {errors.answer && (
          <p className="text-destructive text-xs">{errors.answer.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          حفظ الإجابة
        </Button>
      </div>
    </form>
  );
}
