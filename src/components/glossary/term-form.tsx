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
  createGlossaryTermSchema,
  type CreateGlossaryTermInput,
} from "@/lib/validators/glossary";
import { CONTENT_STATUSES, EDUCATION_LEVELS } from "@/lib/constants/education";
import type { GlossaryTerm } from "@/types/domain";

interface TermFormProps {
  defaultValues?: Partial<GlossaryTerm>;
  onSubmit: (values: CreateGlossaryTermInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EMPTY: CreateGlossaryTermInput = {
  term: "",
  termAr: "",
  definition: "",
  definitionAr: "",
  level: "1AS",
  status: "draft",
};

/**
 * Create/edit form for a bilingual glossary term.
 *
 * French fields render LTR; Arabic fields use `dir="rtl"` so they display
 * correctly and the browser handles text input direction. The same Zod
 * schema validates here (client) and in the API (server).
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
          termAr: defaultValues.termAr ?? "",
          definition: defaultValues.definition ?? "",
          definitionAr: defaultValues.definitionAr ?? "",
          level: (defaultValues.level as CreateGlossaryTermInput["level"]) ?? "1AS",
          status: (defaultValues.status as CreateGlossaryTermInput["status"]) ?? "draft",
        }
      : {}),
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateGlossaryTermInput>({
    resolver: zodResolver(createGlossaryTermSchema),
    defaultValues: values,
  });

  const level = watch("level");
  const status = watch("status");

  return (
    <form
      id="glossary-term-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Bilingual term row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="term">
            Term <span className="text-muted-foreground text-xs">(FR)</span>
          </Label>
          <Input
            id="term"
            placeholder="e.g. Photosynthèse"
            dir="ltr"
            autoComplete="off"
            {...register("term")}
          />
          {errors.term && (
            <p className="text-destructive text-xs">{errors.term.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="termAr">
            المصطلح <span className="text-muted-foreground text-xs">(ع)</span>
          </Label>
          <Input
            id="termAr"
            placeholder="مثال: تركيب ضوئي"
            dir="rtl"
            autoComplete="off"
            {...register("termAr")}
          />
          {errors.termAr && (
            <p className="text-destructive text-xs" dir="rtl">
              {errors.termAr.message}
            </p>
          )}
        </div>
      </div>

      {/* Bilingual definition row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="definition">
            Definition <span className="text-muted-foreground text-xs">(FR)</span>
          </Label>
          <Textarea
            id="definition"
            placeholder="Définition en français…"
            dir="ltr"
            rows={4}
            {...register("definition")}
          />
          {errors.definition && (
            <p className="text-destructive text-xs">
              {errors.definition.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="definitionAr">
            التعريف <span className="text-muted-foreground text-xs">(ع)</span>
          </Label>
          <Textarea
            id="definitionAr"
            placeholder="التعريف بالعربية…"
            dir="rtl"
            rows={4}
            {...register("definitionAr")}
          />
          {errors.definitionAr && (
            <p className="text-destructive text-xs" dir="rtl">
              {errors.definitionAr.message}
            </p>
          )}
        </div>
      </div>

      {/* Level + status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="level">Education level</Label>
          <Select
            value={level}
            onValueChange={(v) =>
              setValue("level", v as CreateGlossaryTermInput["level"], {
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
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(v) =>
              setValue("status", v as CreateGlossaryTermInput["status"], {
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
          {defaultValues ? "Save changes" : "Create term"}
        </Button>
      </div>
    </form>
  );
}
