"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { CONTENT_STATUSES, EDUCATION_LEVELS } from "@/lib/constants/education";
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
  source: "",
  level: "1AS",
  status: "draft",
  chunkCount: 0,
  embeddingReady: false,
};

/**
 * Create/edit form for a knowledge document.
 * Uses react-hook-form + zod; the same schema validates on both client and
 * server. Controlled selects/switch are bridged into RHF manually.
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
          source: defaultValues.source ?? "",
          level: (defaultValues.level as CreateKnowledgeDocumentInput["level"]) ?? "1AS",
          status: (defaultValues.status as CreateKnowledgeDocumentInput["status"]) ?? "draft",
          chunkCount: defaultValues.chunkCount ?? 0,
          embeddingReady: defaultValues.embeddingReady ?? false,
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

  const level = watch("level");
  const status = watch("status");
  const embeddingReady = watch("embeddingReady");

  return (
    <form
      id="knowledge-document-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g. La cellule — unité du vivant"
          autoComplete="off"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-destructive text-xs">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Input
          id="source"
          placeholder="e.g. Manuel 1AS — SVT"
          autoComplete="off"
          {...register("source")}
        />
        {errors.source && (
          <p className="text-destructive text-xs">{errors.source.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="level">Education level</Label>
          <Select
            value={level}
            onValueChange={(v) =>
              setValue("level", v as CreateKnowledgeDocumentInput["level"], {
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
              setValue("status", v as CreateKnowledgeDocumentInput["status"], {
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="chunkCount">Chunk count</Label>
          <Input
            id="chunkCount"
            type="number"
            min={0}
            inputMode="numeric"
            {...register("chunkCount", { valueAsNumber: true })}
          />
          {errors.chunkCount && (
            <p className="text-destructive text-xs">
              {errors.chunkCount.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-md border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="embeddingReady" className="text-sm">
              Embedding ready
            </Label>
            <p className="text-muted-foreground text-xs">
              Vectorized & ready for RAG retrieval
            </p>
          </div>
          <Switch
            id="embeddingReady"
            checked={embeddingReady}
            onCheckedChange={(checked) =>
              setValue("embeddingReady", checked, { shouldValidate: true })
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {defaultValues ? "Save changes" : "Create document"}
        </Button>
      </div>
    </form>
  );
}
