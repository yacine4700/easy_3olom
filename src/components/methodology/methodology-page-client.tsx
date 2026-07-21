"use client";

import { Route } from "lucide-react";

import { MethodologyView } from "@/components/methodology/methodology-view";

export function MethodologyPageClient() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="bg-brand/10 text-brand flex size-7 items-center justify-center rounded-md">
            <Route className="size-4" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            قواعد المنهجية
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          قواعد يتبعها الطالب أثناء إجابته في الاختبارات.
        </p>
      </div>

      <MethodologyView />
    </div>
  );
}
