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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createKnowledgeDocumentSchema,
  type CreateKnowledgeDocumentInput,
} from "@/lib/validators/knowledge-base";
import { useTaxonomy } from "@/hooks/queries/use-taxonomy";
import { LEVEL_LABELS, type EducationLevelKey } from "@/lib/constants/taxonomy";
import type { KnowledgeDocument } from "@/types/domain";

interface DocumentFormProps {
  defaultValues?: Partial<KnowledgeDocument>;
  onSubmit: (values: CreateKnowledgeDocumentInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EMPTY: CreateKnowledgeDocumentInput = {
  level: "3AS",
  title: "",
  content: null,
  domain: null,
  unit: null,
  keywords: null,
  botInstructions: null,
};

export function DocumentForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: DocumentFormProps) {
  const { data: taxonomy } = useTaxonomy();

  const values: CreateKnowledgeDocumentInput = {
    ...EMPTY,
    ...(defaultValues
      ? {
          level: (defaultValues.level as EducationLevelKey) ?? "3AS",
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
    watch,
    formState: { errors },
  } = useForm<CreateKnowledgeDocumentInput>({
    resolver: zodResolver(createKnowledgeDocumentSchema),
    defaultValues: values,
  });

  const level = watch("level") ?? "3AS";
  const domain = watch("domain");
  const keywords = watch("keywords");

  // Keywords local state (text input → array)
  const [keywordsText, setKeywordsText] = React.useState(
    Array.isArray(keywords) ? keywords.join("، ") : "",
  );

  const domains = taxonomy?.[level]?.domains ?? [];
  const units = (domain && taxonomy?.[level]?.units?.[domain]) ?? [];

  function handleKeywordsChange(text: string) {
    setKeywordsText(text);
    const arr = text
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);
    setValue("keywords", arr.length > 0 ? arr : null);
  }

  return (
    <form
      id="knowledge-document-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* 1. المستوى الدراسي */}
      <div className="space-y-2">
        <Label htmlFor="level">المستوى الدراسي</Label>
        <Select
          value={level}
          onValueChange={(v) =>
            setValue("level", v, { shouldValidate: true })
          }
        >
          <SelectTrigger id="level" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(LEVEL_LABELS) as [EducationLevelKey, string][]).map(
              ([val, label]) => (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        {errors.level && (
          <p className="text-destructive text-xs">{errors.level.message}</p>
        )}
      </div>

      {/* 2. المجال + 3. الوحدة */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="domain">المجال</Label>
          <Select
            value={domain ?? "none"}
            onValueChange={(v) => {
              setValue("domain", v === "none" ? null : v);
              setValue("unit", null); // reset unit when domain changes
            }}
          >
            <SelectTrigger id="domain" className="w-full">
              <SelectValue placeholder="اختر المجال" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— غير محدد —</SelectItem>
              {domains.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {domains.length === 0 && (
            <p className="text-muted-foreground text-xs">
              لا توجد مجالات مُضافة لهذا المستوى. أضفها من الإعدادات.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">الوحدة</Label>
          <Select
            value={watch("unit") ?? "none"}
            onValueChange={(v) =>
              setValue("unit", v === "none" ? null : v)
            }
            disabled={!domain}
          >
            <SelectTrigger id="unit" className="w-full">
              <SelectValue placeholder="اختر الوحدة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— غير محدد —</SelectItem>
              {units.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {domain && units.length === 0 && (
            <p className="text-muted-foreground text-xs">
              لا توجد وحدات مُضافة لهذا المجال.
            </p>
          )}
        </div>
      </div>

      {/* 4. النشاط */}
      <div className="space-y-2">
        <Label htmlFor="title">النشاط</Label>
        <Input
          id="title"
          placeholder="مثال: نشاط 1 — تركيب البروتين"
          autoComplete="off"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-destructive text-xs">{errors.title.message}</p>
        )}
      </div>

      {/* 5. المحتوى المعرفي */}
      <div className="space-y-2">
        <Label htmlFor="content">المحتوى المعرفي</Label>
        <Textarea
          id="content"
          placeholder="اكتب المحتوى المعرفي هنا…"
          rows={6}
          {...register("content")}
        />
        {errors.content && (
          <p className="text-destructive text-xs">{errors.content.message}</p>
        )}
      </div>

      {/* 6. الكلمات المفتاحية */}
      <div className="space-y-2">
        <Label htmlFor="keywords">الكلمات المفتاحية</Label>
        <Input
          id="keywords"
          placeholder="كلمة1، كلمة2، كلمة3"
          value={keywordsText}
          onChange={(e) => handleKeywordsChange(e.target.value)}
        />
        <p className="text-muted-foreground text-xs">
          افصل بين الكلمات بفاصلة
        </p>
      </div>

      {/* 7. تعليمات للبوت */}
      <div className="space-y-2">
        <Label htmlFor="botInstructions">تعليمات للبوت</Label>
        <Textarea
          id="botInstructions"
          placeholder="تعليمات توجيهية للمساعد الذكي…"
          rows={3}
          {...register("botInstructions")}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {defaultValues ? "حفظ التغييرات" : "إضافة معرفة"}
        </Button>
      </div>
    </form>
  );
}
