"use client";

import * as React from "react";
import {
  useFieldArray,
  useForm,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import {
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  FileText,
  ListOrdered,
  HelpCircle,
} from "lucide-react";

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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { CreateExerciseInput } from "@/lib/validators/exercises";
import { useExerciseCollections } from "@/hooks/queries/use-exercises";
import type { Exercise, ExerciseJson } from "@/types/exercises";

// ─── Local form model ────────────────────────────────────────────
// The stored `exerciseJson` is free-form; the form keeps a structured
// representation so dynamic arrays (parts, documents, questions, rubric)
// work cleanly with react-hook-form. Empty strings are coerced to null
// on submit. We wrap primitive arrays (`documents`, `rubric`) as
// `{ value: string }[]` so useFieldArray handles them uniformly.

interface QuestionFormValue {
  id: string;
  question: string;
  answer: string;
  hint: string;
  rubric: { value: string }[];
}

interface PartFormValue {
  context: string;
  documents: { value: string }[];
  questions: QuestionFormValue[];
}

interface ExerciseFormValues {
  collectionId: string; // "" = none; converted to null on submit
  exerciseNumber: number | null; // null = unset
  exerciseMode: string; // "" | "استرجاع" | "استدلال علمي" | "مسعى علمي"
  mainConcept: string;
  context: string;
  parts: PartFormValue[];
}

interface ExerciseFormProps {
  defaultValues?: Partial<Exercise>;
  onSubmit: (values: CreateExerciseInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EXERCISE_MODES = [
  { value: "RETRIEVAL", label: "استرجاع" },
  { value: "REASONING", label: "استدلال علمي" },
  { value: "SCIENTIFIC_APPROACH", label: "مسعى علمي" },
] as const;

function emptyQuestion(): QuestionFormValue {
  return { id: "", question: "", answer: "", hint: "", rubric: [] };
}

function emptyPart(): PartFormValue {
  return { context: "", documents: [], questions: [emptyQuestion()] };
}

function valuesFromExercise(exercise?: Partial<Exercise>): ExerciseFormValues {
  const json: ExerciseJson | null = exercise?.exerciseJson ?? null;
  return {
    collectionId: exercise?.collectionId ?? "",
    exerciseNumber: exercise?.exerciseNumber ?? null,
    exerciseMode: exercise?.exerciseMode ?? "",
    mainConcept: exercise?.mainConcept ?? "",
    context: json?.context ?? "",
    parts:
      json?.parts?.map((p) => ({
        context: p.context ?? "",
        documents: (p.documents ?? []).map((d) => ({ value: d })),
        questions: (p.questions ?? []).map((q) => ({
          id: q.id ?? "",
          question: q.question ?? "",
          answer: q.answer ?? "",
          hint: q.hint ?? "",
          rubric: (q.rubric ?? []).map((r) => ({ value: r })),
        })),
      })) ?? [emptyPart()],
  };
}

function buildExerciseJson(values: ExerciseFormValues): ExerciseJson {
  return {
    context: values.context ?? "",
    parts: values.parts.map((p, idx) => ({
      part: idx + 1,
      context: p.context ?? "",
      documents: p.documents.map((d) => d.value).filter(Boolean),
      questions: p.questions.map((q) => ({
        id: q.id ?? "",
        question: q.question ?? "",
        answer: q.answer ?? "",
        hint: q.hint ?? "",
        rubric: q.rubric.map((r) => r.value).filter(Boolean),
      })),
    })),
  };
}

/**
 * The exercise form is the most complex component in this module. It edits a
 * nested `exerciseJson` structure (context + parts → documents + questions →
 * rubric) using react-hook-form `useFieldArray` for every dynamic level.
 *
 * The page-level <html dir="rtl"> handles directionality; we use logical CSS
 * properties everywhere.
 *
 * Note: the `title` field was removed from the DB; an exercise is now
 * identified by (collection, exerciseNumber) and described by `mainConcept`.
 */
export function ExerciseForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: ExerciseFormProps) {
  // Load collections to populate the collectionId Select.
  const { data: collectionsData, isLoading: collectionsLoading } =
    useExerciseCollections({ page: 1, pageSize: 100 });
  const collections = collectionsData?.items ?? [];

  const initial = React.useMemo(
    () => valuesFromExercise(defaultValues),
    [defaultValues],
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<ExerciseFormValues>({
    defaultValues: initial,
    // The stored exerciseJson is `z.any()` on the server, so we don't use a
    // Zod resolver here. We run a lightweight exerciseMode check on submit
    // and let the server schema do the authoritative validation.
    shouldUnregister: false,
  });

  const partsField = useFieldArray({ control, name: "parts" });

  // Collection Select (string → null on submit).
  const collectionIdValue = watch("collectionId") ?? "";
  const exerciseModeValue = watch("exerciseMode") ?? "";

  function handleFormSubmit(values: ExerciseFormValues) {
    if (!values.exerciseMode) {
      setError("exerciseMode", {
        type: "manual",
        message: "اختر طبيعة التمرين",
      });
      return;
    }
    const input: CreateExerciseInput = {
      collectionId: values.collectionId ? values.collectionId : null,
      exerciseNumber: values.exerciseNumber ?? null,
      exerciseMode: values.exerciseMode as CreateExerciseInput["exerciseMode"],
      mainConcept: values.mainConcept ? values.mainConcept : null,
      exerciseJson: buildExerciseJson(values),
    };
    onSubmit(input);
  }

  function handleError(errors: FieldErrors<ExerciseFormValues>) {
    // Inline messages are already shown next to each field; nothing else to
    // do here. Logged for debugging.
    console.warn("[exercise-form] validation errors", errors);
  }

  return (
    <form
      id="exercise-form"
      onSubmit={handleSubmit(handleFormSubmit, handleError)}
      className="space-y-6"
    >
      {/* ── Section 1: Identity ─────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="text-brand size-4" />
          <h3 className="text-sm font-semibold">معلومات التمرين</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="collectionId">السلسلة</Label>
            <Select
              value={collectionIdValue || "none"}
              onValueChange={(v) =>
                setValue("collectionId", v === "none" ? "" : v, {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger id="collectionId" className="w-full">
                <SelectValue placeholder="اختر السلسلة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— بدون سلسلة —</SelectItem>
                {collections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {collectionsLoading && (
              <p className="text-muted-foreground text-xs">
                جاري تحميل السلاسل…
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="exerciseNumber">رقم التمرين</Label>
            <Input
              id="exerciseNumber"
              type="number"
              min={1}
              max={99}
              placeholder="مثال: 1"
              autoComplete="off"
              {...register("exerciseNumber", {
                setValueAs: (v) =>
                  v === "" || v == null ? null : Number(v),
              })}
            />
            {errors.exerciseNumber && (
              <p className="text-destructive text-xs">
                {errors.exerciseNumber.message as string}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="exerciseMode">طبيعة التمرين</Label>
            <Select
              value={exerciseModeValue || "none"}
              onValueChange={(v) =>
                setValue("exerciseMode", v === "none" ? "" : v, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="exerciseMode" className="w-full">
                <SelectValue placeholder="اختر الطبيعة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— غير محدد —</SelectItem>
                {EXERCISE_MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.exerciseMode && (
              <p className="text-destructive text-xs">
                {errors.exerciseMode.message as string}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mainConcept">فكرة التمرين</Label>
            <Input
              id="mainConcept"
              placeholder="مثال: تحويل الطاقة الضوئية"
              autoComplete="off"
              {...register("mainConcept")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="context">السياق الرئيسي</Label>
          <Textarea
            id="context"
            rows={4}
            placeholder="النص التقديمي العام للتمرين…"
            {...register("context")}
          />
        </div>
      </section>

      {/* ── Section 2: Parts ────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ListOrdered className="text-brand size-4" />
            <h3 className="text-sm font-semibold">أجزاء التمرين</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => partsField.append(emptyPart())}
          >
            <Plus className="size-4" />
            إضافة جزء
          </Button>
        </div>

        {partsField.fields.length === 0 ? (
          <div className="text-muted-foreground rounded-md border border-dashed py-8 text-center text-sm">
            لا توجد أجزاء بعد. اضغط «إضافة جزء» للبدء.
          </div>
        ) : (
          <div className="space-y-4">
            {partsField.fields.map((field, partIndex) => (
              <PartCard
                key={field.id}
                partIndex={partIndex}
                control={control}
                register={register}
                onRemove={() => partsField.remove(partIndex)}
                canRemove={partsField.fields.length > 1}
              />
            ))}
          </div>
        )}
      </section>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {defaultValues ? "حفظ التغييرات" : "إنشاء تمرين"}
        </Button>
      </div>
    </form>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

interface PartCardProps {
  partIndex: number;
  control: Control<ExerciseFormValues>;
  register: UseFormRegister<ExerciseFormValues>;
  onRemove: () => void;
  canRemove: boolean;
}

function PartCard({
  partIndex,
  control,
  register,
  onRemove,
  canRemove,
}: PartCardProps) {
  const [open, setOpen] = React.useState(true);
  const documentsField = useFieldArray({
    control,
    name: `parts.${partIndex}.documents` as const,
  });
  const questionsField = useFieldArray({
    control,
    name: `parts.${partIndex}.questions` as const,
  });

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="bg-muted/30 rounded-lg border"
    >
      <div className="flex items-center justify-between gap-2 p-3">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex flex-1 items-center gap-2 text-start"
          >
            <span className="bg-brand/10 text-brand flex size-6 items-center justify-center rounded-md text-xs font-semibold">
              {partIndex + 1}
            </span>
            <span className="text-sm font-medium">
              الجزء {partIndex + 1}
            </span>
            <ChevronDown
              className={`text-muted-foreground size-4 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </CollapsibleTrigger>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive size-8"
            onClick={onRemove}
            aria-label="حذف الجزء"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <CollapsibleContent className="space-y-4 px-3 pb-4">
        <div className="space-y-2">
          <Label htmlFor={`parts.${partIndex}.context`}>
            سياق الجزء (اختياري)
          </Label>
          <Textarea
            id={`parts.${partIndex}.context`}
            rows={3}
            placeholder="نص تقديمي خاص بهذا الجزء…"
            {...register(`parts.${partIndex}.context` as const)}
          />
        </div>

        {/* Documents */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>الوثائق</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => documentsField.append({ value: "" })}
            >
              <Plus className="size-3.5" />
              إضافة وثيقة
            </Button>
          </div>
          {documentsField.fields.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              لا توجد وثائق. اضغط «إضافة وثيقة».
            </p>
          ) : (
            <div className="space-y-2">
              {documentsField.fields.map((doc, docIndex) => (
                <div key={doc.id} className="flex items-center gap-2">
                  <Input
                    placeholder="اسم الملف، مثال: doc1.png"
                    autoComplete="off"
                    className="h-8"
                    {...register(
                      `parts.${partIndex}.documents.${docIndex}.value` as const,
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive size-8 shrink-0"
                    onClick={() => documentsField.remove(docIndex)}
                    aria-label="حذف الوثيقة"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="text-muted-foreground size-4" />
              <Label>الأسئلة</Label>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => questionsField.append(emptyQuestion())}
            >
              <Plus className="size-3.5" />
              إضافة سؤال
            </Button>
          </div>

          {questionsField.fields.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              لا توجد أسئلة. اضغط «إضافة سؤال».
            </p>
          ) : (
            <div className="space-y-3">
              {questionsField.fields.map((q, qIndex) => (
                <QuestionCard
                  key={q.id}
                  partIndex={partIndex}
                  qIndex={qIndex}
                  control={control}
                  register={register}
                  onRemove={() => questionsField.remove(qIndex)}
                  canRemove={questionsField.fields.length > 1}
                />
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface QuestionCardProps {
  partIndex: number;
  qIndex: number;
  control: Control<ExerciseFormValues>;
  register: UseFormRegister<ExerciseFormValues>;
  onRemove: () => void;
  canRemove: boolean;
}

function QuestionCard({
  partIndex,
  qIndex,
  control,
  register,
  onRemove,
  canRemove,
}: QuestionCardProps) {
  const rubricField = useFieldArray({
    control,
    name: `parts.${partIndex}.questions.${qIndex}.rubric` as const,
  });

  const baseName = `parts.${partIndex}.questions.${qIndex}` as const;

  return (
    <div className="bg-background rounded-md border p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs font-medium">
          سؤال {qIndex + 1}
        </span>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive size-7"
            onClick={onRemove}
            aria-label="حذف السؤال"
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr]">
          <div className="space-y-1.5">
            <Label htmlFor={`${baseName}.id`} className="text-xs">
              المعرف
            </Label>
            <Input
              id={`${baseName}.id`}
              placeholder="Q1"
              autoComplete="off"
              className="h-8"
              {...register(`${baseName}.id` as const)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${baseName}.hint`} className="text-xs">
              تلميح
            </Label>
            <Input
              id={`${baseName}.hint`}
              placeholder="تلميح اختياري"
              autoComplete="off"
              className="h-8"
              {...register(`${baseName}.hint` as const)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${baseName}.question`} className="text-xs">
            نص السؤال
          </Label>
          <Textarea
            id={`${baseName}.question`}
            rows={2}
            placeholder="اكتب السؤال…"
            {...register(`${baseName}.question` as const)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${baseName}.answer`} className="text-xs">
            الإجابة
          </Label>
          <Textarea
            id={`${baseName}.answer`}
            rows={2}
            placeholder="اكتب الإجابة النموذجية…"
            {...register(`${baseName}.answer` as const)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs">معايير التصحيح (Rubric)</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => rubricField.append({ value: "" })}
            >
              <Plus className="size-3" />
              إضافة معيار
            </Button>
          </div>
          {rubricField.fields.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              لا توجد معايير. اضغط «إضافة معيار».
            </p>
          ) : (
            <div className="space-y-2">
              {rubricField.fields.map((r, rIndex) => (
                <div key={r.id} className="flex items-center gap-2">
                  <span className="text-muted-foreground w-5 shrink-0 text-xs">
                    {rIndex + 1}.
                  </span>
                  <Input
                    placeholder="مثال: ذكر التفاعل الكيميائي"
                    autoComplete="off"
                    className="h-8"
                    {...register(`${baseName}.rubric.${rIndex}.value` as const)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive size-8 shrink-0"
                    onClick={() => rubricField.remove(rIndex)}
                    aria-label="حذف المعيار"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
