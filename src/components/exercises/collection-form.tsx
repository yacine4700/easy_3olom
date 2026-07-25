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
  { value: "SERIES", label: "سلسلة" },
  { value: "BAC", label: "بكالوريا" },
  { value: "EXAM", label: "امتحان" },
] as const;

const STREAMS = [
  { value: "SCIENCE", label: "علوم تجريبية" },
  { value: "MATH", label: "رياضيات" },
] as const;

const VERSIONS = [
  { value: "1", label: "الموضوع الأول" },
  { value: "2", label: "الموضوع الثاني" },
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
  stream: null,
  version: null,
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
          collectionType:
            (defaultValues.collectionType as CreateExerciseCollectionInput["collectionType"]) ??
            "SERIES",
          year: defaultValues.year ?? null,
          unit: defaultValues.unit ?? null,
          pdfFileId: defaultValues.pdfFileId ?? "",
          stream: defaultValues.stream ?? null,
          version: defaultValues.version ?? null,
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
  const stream = watch("stream");
  const version = watch("version");
  const showYear = collectionType === "BAC" || collectionType === "EXAM";
  const showUnit = collectionType === "SERIES";
  const showBacFields = collectionType === "BAC";

  function handleTypeChange(next: CreateExerciseCollectionInput["collectionType"]) {
    setValue("collectionType", next, { shouldValidate: true, shouldDirty: true });
    if (next === "SERIES") {
      setValue("year", null, { shouldDirty: true });
      setValue("stream", null, { shouldDirty: true });
      setValue("version", null, { shouldDirty: true });
    } else {
      setValue("unit", null, { shouldDirty: true });
      if (next !== "BAC") {
        setValue("stream", null, { shouldDirty: true });
        setValue("version", null, { shouldDirty: true });
      }
    }
  }

  function handleFormSubmit(raw: CreateExerciseCollectionInput) {
    // For SERIES: strip stream/version entirely
    if (raw.collectionType === "SERIES") {
      raw.stream = null;
      raw.version = null;
    }
    onSubmit(raw);
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

      <div className="space-y-2">
        <Label htmlFor="collectionType">النوع</Label>
        <Select
          value={collectionType}
          onValueChange={(v) =>
            handleTypeChange(v as CreateExerciseCollectionInput["collectionType"])
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

      {/* Conditional: BAC/EXAM → year, SERIES → unit */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {showYear ? (
          <div className="space-y-2">
            <Label htmlFor="year">السنة (اختياري)</Label>
            <Input
              id="year"
              type="number"
              min={2000}
              max={2100}
              placeholder="مثال: 2024"
              autoComplete="off"
              {...register("year", {
                setValueAs: (v) =>
                  v === "" || v == null ? null : Number(v),
              })}
            />
          </div>
        ) : null}

        {showUnit ? (
          <div className="space-y-2">
            <Label htmlFor="unit">الوحدة (اختياري)</Label>
            <Input
              id="unit"
              placeholder="مثال: الوحدة الأولى"
              autoComplete="off"
              {...register("unit")}
            />
          </div>
        ) : null}
      </div>

      {/* BAC-only fields: stream + version */}
      {showBacFields ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="stream">الشعبة</Label>
            <Select
              value={stream ?? "none"}
              onValueChange={(v) =>
                setValue("stream", v === "none" ? null : v, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger id="stream" className="w-full">
                <SelectValue placeholder="اختر الشعبة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— غير محدد —</SelectItem>
                {STREAMS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">الموضوع</Label>
            <Select
              value={version != null ? String(version) : "none"}
              onValueChange={(v) =>
                setValue(
                  "version",
                  v === "none" ? null : Number(v),
                  { shouldValidate: true, shouldDirty: true },
                )
              }
            >
              <SelectTrigger id="version" className="w-full">
                <SelectValue placeholder="اختر الموضوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— غير محدد —</SelectItem>
                {VERSIONS.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}

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
