"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createMethodologySchema,
  type CreateMethodologyInput,
} from "@/lib/validators/methodology";
import { CONTENT_STATUSES, EDUCATION_LEVELS } from "@/lib/constants/education";
import type { Methodology } from "@/types/domain";

interface MethodologyFormProps {
  defaultValues?: Partial<Methodology>;
  onSubmit: (values: CreateMethodologyInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EMPTY: CreateMethodologyInput = {
  title: "",
  titleAr: "",
  description: "",
  descriptionAr: "",
  level: "1AS",
  status: "draft",
  order: 0,
};

/**
 * Create/edit form for a bilingual teaching sequence.
 * Mirrors the Glossary term form, adds an `order` field for sequencing.
 * Arabic fields use dir="rtl".
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
          titleAr: defaultValues.titleAr ?? "",
          description: defaultValues.description ?? "",
          descriptionAr: defaultValues.descriptionAr ?? "",
          level: (defaultValues.level as CreateMethodologyInput["level"]) ?? "1AS",
          status: (defaultValues.status as CreateMethodologyInput["status"]) ?? "draft",
          order: defaultValues.order ?? 0,
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

  const level = watch("level");
  const status = watch("status");

  return (
    <form
      id="methodology-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Bilingual title row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-muted-foreground text-xs">(FR)</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g. La cellule: unité du vivant"
            dir="ltr"
            autoComplete="off"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-destructive text-xs">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="titleAr">
            العنوان <span className="text-muted-foreground text-xs">(ع)</span>
          </Label>
          <Input
            id="titleAr"
            placeholder="مثال: الخلية: وحدة الكائن الحي"
            dir="rtl"
            autoComplete="off"
            {...register("titleAr")}
          />
          {errors.titleAr && (
            <p className="text-destructive text-xs" dir="rtl">
              {errors.titleAr.message}
            </p>
          )}
        </div>
      </div>

      {/* Bilingual description row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="description">
            Description{" "}
            <span className="text-muted-foreground text-xs">(FR)</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Décrivez la séquence pédagogique…"
            dir="ltr"
            rows={4}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-destructive text-xs">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="descriptionAr">
            الوصف <span className="text-muted-foreground text-xs">(ع)</span>
          </Label>
          <Textarea
            id="descriptionAr"
            placeholder="صف السلسلة التعليمية…"
            dir="rtl"
            rows={4}
            {...register("descriptionAr")}
          />
          {errors.descriptionAr && (
            <p className="text-destructive text-xs" dir="rtl">
              {errors.descriptionAr.message}
            </p>
          )}
        </div>
      </div>

      {/* Level + order + status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="level">Education level</Label>
          <Select
            value={level}
            onValueChange={(v) =>
              setValue("level", v as CreateMethodologyInput["level"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="level" className="w-full">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  <span className="font-medium">{l.label}</span>
                  <span className="text-muted-foreground"> · {l.hint}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.level && (
            <p className="text-destructive text-xs">{errors.level.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="0"
            {...register("order", { valueAsNumber: true })}
          />
          {errors.order && (
            <p className="text-destructive text-xs">{errors.order.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(v) =>
              setValue("status", v as CreateMethodologyInput["status"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-destructive text-xs">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {defaultValues ? "Save changes" : "Create sequence"}
        </Button>
      </div>
    </form>
  );
}
