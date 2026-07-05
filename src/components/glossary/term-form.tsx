"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createGlossaryTermSchema,
  type CreateGlossaryTermInput,
} from "@/lib/validators/glossary";
import type { GlossaryTerm } from "@/types/domain";

interface TermFormProps {
  defaultValues?: Partial<GlossaryTerm>;
  onSubmit: (values: CreateGlossaryTermInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EMPTY: CreateGlossaryTermInput = {
  term: "",
  definition: null,
  unit: null,
  domain: null,
};

/**
 * Create/edit form for a glossary term.
 *
 * Uses react-hook-form + zod; the same schema validates on both client and
 * server. RTL is inherited from `<html dir="rtl">` so no per-element dir is
 * set on the inputs.
 */
export function TermForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: TermFormProps) {
  const values: CreateGlossaryTermInput = {
    ...EMPTY,
    ...(defaultValues
      ? {
          term: defaultValues.term ?? "",
          definition: defaultValues.definition ?? null,
          unit: defaultValues.unit ?? null,
          domain: defaultValues.domain ?? null,
        }
      : {}),
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGlossaryTermInput>({
    resolver: zodResolver(createGlossaryTermSchema),
    defaultValues: values,
  });

  return (
    <form
      id="glossary-term-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="term">المصطلح</Label>
        <Input
          id="term"
          placeholder="مثال: التركيب الضوئي"
          autoComplete="off"
          {...register("term")}
        />
        {errors.term && (
          <p className="text-destructive text-xs">{errors.term.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="definition">التعريف</Label>
        <Textarea
          id="definition"
          placeholder="اكتب تعريف المصطلح هنا…"
          rows={5}
          {...register("definition")}
        />
        {errors.definition && (
          <p className="text-destructive text-xs">
            {errors.definition.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {defaultValues ? "حفظ التغييرات" : "إنشاء مصطلح"}
        </Button>
      </div>
    </form>
  );
}
