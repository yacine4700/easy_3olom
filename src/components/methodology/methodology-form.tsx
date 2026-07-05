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
  createMethodologySchema,
  type CreateMethodologyInput,
} from "@/lib/validators/methodology";
import type { Methodology } from "@/types/domain";

interface MethodologyFormProps {
  defaultValues?: Partial<Methodology>;
  onSubmit: (values: CreateMethodologyInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EMPTY: CreateMethodologyInput = {
  title: "",
  explanation: null,
  keywords: null,
};

/**
 * Create/edit form for an AI assistant methodology rule.
 *
 * Fields: title (العنوان), explanation (الشرح), keywords (الكلمات المفتاحية
 * as comma-separated text → string[]). The page-level <html dir="rtl"> handles
 * directionality; we deliberately do NOT set dir on individual fields.
 */
export function MethodologyForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: MethodologyFormProps) {
  const values: CreateMethodologyInput = {
    ...EMPTY,
    ...(defaultValues
      ? {
          title: defaultValues.title ?? "",
          explanation: defaultValues.explanation ?? null,
          keywords: defaultValues.keywords ?? null,
        }
      : {}),
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateMethodologyInput>({
    resolver: zodResolver(createMethodologySchema),
    defaultValues: values,
  });

  // Keywords are stored as string[] but edited as a single comma-separated
  // text input. Keep a local string state so the user can freely type (and
  // keep trailing separators) while we mirror the parsed array into RHF.
  const keywords = watch("keywords");
  const [keywordsText, setKeywordsText] = React.useState(() =>
    Array.isArray(keywords) ? keywords.join("، ") : "",
  );

  function handleKeywordsChange(text: string) {
    setKeywordsText(text);
    const arr = text
      .split(/[,\u060C]/) // accept both Latin and Arabic commas
      .map((s) => s.trim())
      .filter(Boolean);
    setValue("keywords", arr.length ? arr : null, { shouldValidate: true });
  }

  function handleFormSubmit(raw: CreateMethodologyInput) {
    // Normalize empty strings → null so the API stores clean NULLs.
    onSubmit({
      ...raw,
      explanation: raw.explanation ? raw.explanation : null,
      keywords: raw.keywords && raw.keywords.length ? raw.keywords : null,
    });
  }

  return (
    <form
      id="methodology-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="title">العنوان</Label>
        <Input
          id="title"
          placeholder="مثال: اعتمد على المصدر الموثوق قبل الإجابة"
          autoComplete="off"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-destructive text-xs">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="explanation">الشرح</Label>
        <Textarea
          id="explanation"
          rows={6}
          placeholder="اشرح القاعدة بالتفصيل…"
          {...register("explanation")}
        />
        {errors.explanation && (
          <p className="text-destructive text-xs">
            {errors.explanation.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="keywords">الكلمات المفتاحية</Label>
        <Input
          id="keywords"
          value={keywordsText}
          onChange={(e) => handleKeywordsChange(e.target.value)}
          placeholder="مثال: مصدر، موثوق، تحقق"
          autoComplete="off"
        />
        <p className="text-muted-foreground text-xs">
          افصل بين الكلمات بفاصلة (، أو ,).
        </p>
        {errors.keywords && (
          <p className="text-destructive text-xs">{errors.keywords.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {defaultValues ? "حفظ التغييرات" : "إنشاء قاعدة"}
        </Button>
      </div>
    </form>
  );
}
