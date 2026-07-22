"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createExerciseCollectionSchema,
  type CreateExerciseCollectionInput,
} from "@/lib/validators/exercises";
import type { ExerciseCollection } from "@/types/exercises";

interface CollectionFormProps {
  defaultValues?: Partial<ExerciseCollection>;
  onSubmit: (values: CreateExerciseCollectionInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EMPTY: CreateExerciseCollectionInput = {
  title: "",
  collectionType: null,
  year: null,
  unit: null,
  pdfFileId: null,
};

/**
 * Create/edit form for an exercise collection.
 *
 * Fields: title (العنوان), collectionType (النوع), year (السنة - number),
 * unit (الوحدة), pdfFileId (معرف ملف PDF).
 *
 * The page-level <html dir="rtl"> handles directionality; we use logical CSS
 * properties everywhere.
 */
export function CollectionForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: CollectionFormProps) {
  const values: CreateExerciseCollectionInput = {
    ...EMPTY,
    ...(defaultValues
      ? {
          title: defaultValues.title ?? "",
          collectionType: defaultValues.collectionType ?? null,
          year: defaultValues.year ?? null,
          unit: defaultValues.unit ?? null,
          pdfFileId: defaultValues.pdfFileId ?? null,
        }
      : {}),
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateExerciseCollectionInput>({
    resolver: zodResolver(createExerciseCollectionSchema),
    defaultValues: values,
  });

  function handleFormSubmit(raw: CreateExerciseCollectionInput) {
    // Normalize empty strings → null so the API stores clean NULLs.
    onSubmit({
      ...raw,
      collectionType: raw.collectionType ? raw.collectionType : null,
      unit: raw.unit ? raw.unit : null,
      pdfFileId: raw.pdfFileId ? raw.pdfFileId : null,
      // year is registered with valueAsNumber; NaN → null
      year:
        typeof raw.year === "number" && !Number.isNaN(raw.year)
          ? raw.year
          : null,
    });
  }

  return (
    <form
      id="exercise-collection-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="title">العنوان</Label>
        <Input
          id="title"
          placeholder="مثال: سلسلة التركيب الضوئي"
          autoComplete="off"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-destructive text-xs">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="collectionType">النوع</Label>
          <Input
            id="collectionType"
            placeholder="مثال: تطبيقية"
            autoComplete="off"
            {...register("collectionType")}
          />
          {errors.collectionType && (
            <p className="text-destructive text-xs">
              {errors.collectionType.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">السنة</Label>
          <Input
            id="year"
            type="number"
            placeholder="مثال: 2024"
            autoComplete="off"
            {...register("year", { valueAsNumber: true })}
          />
          {errors.year && (
            <p className="text-destructive text-xs">
              {errors.year.message as string}
            </p>
          )}
        </div>
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
          <Label htmlFor="pdfFileId">معرف ملف PDF</Label>
          <Input
            id="pdfFileId"
            placeholder="مثال: pdf_1234"
            autoComplete="off"
            {...register("pdfFileId")}
          />
          {errors.pdfFileId && (
            <p className="text-destructive text-xs">
              {errors.pdfFileId.message as string}
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
          {defaultValues ? "حفظ التغييرات" : "إنشاء سلسلة"}
        </Button>
      </div>
    </form>
  );
}
