"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentForm } from "@/components/knowledge-base/document-form";
import {
  useCreateKnowledgeDocument,
  useUpdateKnowledgeDocument,
} from "@/hooks/queries/use-knowledge-base";
import type { CreateKnowledgeDocumentInput } from "@/lib/validators/knowledge-base";
import type { KnowledgeDocument } from "@/types/domain";

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog edits this document; otherwise it creates. */
  document?: KnowledgeDocument | null;
}

/**
 * Single dialog handling both create and edit flows.
 * Picks the right mutation based on whether a `document` is passed in.
 */
export function DocumentDialog({
  open,
  onOpenChange,
  document,
}: DocumentDialogProps) {
  const isEdit = Boolean(document);

  const createMutation = useCreateKnowledgeDocument();
  const updateMutation = useUpdateKnowledgeDocument();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(values: CreateKnowledgeDocumentInput) {
    if (isEdit && document) {
      updateMutation.mutate(
        { id: document.id, input: values },
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
            {isEdit ? "تعديل المعرفة" : "إضافة معرفة"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "عدّل بيانات هذه المعرفة."
              : "أضف معرفة جديدة إلى قاعدة المعرفة لتغذية المساعد."}
          </DialogDescription>
        </DialogHeader>

        <DocumentForm
          defaultValues={document ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
