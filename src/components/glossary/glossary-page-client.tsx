"use client";

import { BookText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { GlossaryView } from "@/components/glossary/glossary-view";

export function GlossaryPageClient() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="bg-brand/10 text-brand flex size-7 items-center justify-center rounded-md">
            <BookText className="size-4" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">المعجم</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          مصطلحات وتعريفات المجال لمادة علوم الطبيعة والحياة.
        </p>
      </div>

      <GlossaryView />
    </div>
  );
}
