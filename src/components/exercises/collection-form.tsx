"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createExerciseCollectionSchema,
  type CreateExerciseCollectionInput,
} from "@/lib/validators/exercises";
import type { ExerciseCollection } from "@/types/exercises";

const COLLECTION_TYPES = [
  { value: "SERIES", label: "Series" },
  { value: "BAC", label: "BAC" },
] as const;

interface CollectionFormProps {
  defaultValues?: Partial<ExerciseCollection>;
  onSubmit: (values: CreateExerciseCollectionInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EMPTY: CreateExerciseCollectionInput = {
  title: "",
  collectionType: "SERIES",
  year: null,
  unit: null,
  pdfFileId: "",
};

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
          collectionType: (defaultValues.collectionType as CreateExerciseCollectionInput["collectionType"]) ?? "series",
          year: defaultValues.year ?? null,
          unit: defaultValues.unit ?? null,
          pdfFileId: defaultValues.pdfFileId ?? "",
        }
      : {}),
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateExerciseCollectionInput>({
    resolver: zodResolver(createExerciseCollectionSchema),
    defaultValues: values,
  });

  const collectionType = watch("collectionType");

  return (
    <form
      id="exercise-collection-form"
      onSubmit={handleSubmit(onSubmit)}
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

      <div className="space-y-2">
        <Label htmlFor="collectionType">النوع</Label>
        <Select
          value={collectionType}
          onValueChange={(v) =>
            setValue("collectionType", v as CreateExerciseCollectionInput["collectionType"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="collectionType" className="w-full">
            <SelectValue placeholder="اختر النوع" />
          </SelectTrigger>
          <SelectContent>
            {COLLECTION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.collectionType && (
          <p className="text-destructive text-xs">
            {errors.collectionType.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="year">السنة (اختياري)</Label>
          <Input
            id="year"
            type="number"
            placeholder="مثال: 2024"
            autoComplete="off"
            {...register("year", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">الوحدة (اختياري)</Label>
          <Input
            id="unit"
            placeholder="مثال: الوحدة الأولى"
            autoComplete="off"
            {...register("unit")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pdfFileId">معرف ملف PDF</Label>
        <Input
          id="pdfFileId"
          placeholder="مثال: pdf_1234"
          autoComplete="off"
          {...register("pdfFileId")}
        />
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
