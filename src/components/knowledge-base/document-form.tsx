"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createKnowledgeDocumentSchema,
  type CreateKnowledgeDocumentInput,
} from "@/lib/validators/knowledge-base";
import type { KnowledgeDocument } from "@/types/domain";

interface DocumentFormProps {
  /** When provided the form is in edit mode. */
  defaultValues?: Partial<KnowledgeDocument>;
  onSubmit: (values: CreateKnowledgeDocumentInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/** Empty defaults shared by create mode and as a fallback. */
const EMPTY: CreateKnowledgeDocumentInput = {
  title: "",
  content: null,
  domain: null,
  unit: null,
  keywords: null,
  botInstructions: null,
};

/**
 * Convert an array of keyword strings into a single comma-separated display
 * string (Arabic comma joins reads naturally in RTL).
 */
function keywordsToText(keywords: string[] | null | undefined): string {
  if (!keywords || keywords.length === 0) return "";
  return keywords.join("، ");
}

/**
 * Parse a free-text input into a keywords array, splitting on both Latin and
 * Arabic commas and trimming empties.
 */
function textToKeywords(text: string): string[] {
  return text
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Create/edit form for a knowledge document.
 *
 * Uses react-hook-form + zod; the same schema validates on both client and
 * server. The `keywords` field is stored as `string[]` on the domain, but
 * presented to the user as a single comma-separated text input — we bridge
 * the two with a local React state and `setValue`.
 */
export function DocumentForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: DocumentFormProps) {
  const values: CreateKnowledgeDocumentInput = {
    ...EMPTY,
    ...(defaultValues
      ? {
          title: defaultValues.title ?? "",
          content: defaultValues.content ?? null,
          domain: defaultValues.domain ?? null,
          unit: defaultValues.unit ?? null,
          keywords: defaultValues.keywords ?? null,
          botInstructions: defaultValues.botInstructions ?? null,
        }
      : {}),
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateKnowledgeDocumentInput>({
    resolver: zodResolver(createKnowledgeDocumentSchema),
    defaultValues: values,
  });

  // Local text state mirrors the array field for display + editing.
  const [keywordsText, setKeywordsText] = React.useState(
    keywordsToText(defaultValues?.keywords),
  );

  function handleKeywordsChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const text = event.target.value;
    setKeywordsText(text);
    const arr = textToKeywords(text);
    setValue("keywords", arr.length ? arr : null, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  return (
    <form
      id="knowledge-document-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="title">العنوان</Label>
        <Input
          id="title"
          placeholder="مثال: الخلية — وحدة الكائن الحي"
          autoComplete="off"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-destructive text-xs">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">المحتوى</Label>
        <Textarea
          id="content"
          placeholder="اكتب محتوى الوثيقة هنا…"
          rows={6}
          {...register("content")}
        />
        {errors.content && (
          <p className="text-destructive text-xs">
            {errors.content.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="domain">المجال</Label>
          <Input
            id="domain"
            placeholder="مثال: علم الخلية"
            autoComplete="off"
            {...register("domain")}
          />
          {errors.domain && (
            <p className="text-destructive text-xs">
              {errors.domain.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">الوحدة</Label>
          <Input
            id="unit"
            placeholder="مثال: الوحدة الأولى"
            autoComplete="off"
            {...register("unit")}
          />
          {errors.unit && (
            <p className="text-destructive text-xs">
              {errors.unit.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="keywords">الكلمات المفتاحية</Label>
        <Input
          id="keywords"
          value={keywordsText}
          onChange={handleKeywordsChange}
          placeholder="افصل بين الكلمات بفاصلة ، مثال: خلية، غشاء، نواة"
          autoComplete="off"
        />
        <p className="text-muted-foreground text-xs">
          افصل بين كل كلمة وأخرى بفاصلة (، أو ,).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="botInstructions">تعليمات البوت</Label>
        <Textarea
          id="botInstructions"
          placeholder="تعليمات توجيهية تُمرَّر إلى المساعد عند استعمال هذه الوثيقة…"
          rows={4}
          {...register("botInstructions")}
        />
        {errors.botInstructions && (
          <p className="text-destructive text-xs">
            {errors.botInstructions.message as string}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {defaultValues ? "حفظ التغييرات" : "إنشاء وثيقة"}
        </Button>
      </div>
    </form>
  );
}
