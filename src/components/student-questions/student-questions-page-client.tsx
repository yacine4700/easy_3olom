"use client";

import { MessageCircleQuestion } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { StudentQuestionsView } from "@/components/student-questions/student-questions-view";

export function StudentQuestionsPageClient() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="bg-brand/10 text-brand flex size-7 items-center justify-center rounded-md">
            <MessageCircleQuestion className="size-4" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            أسئلة الطلاب
          </h1>
          <Badge variant="secondary" className="font-medium">
            Telegram
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          الأسئلة الواردة عبر تيليجرام مع إجابات المساعد.
        </p>
      </div>

      <StudentQuestionsView />
    </div>
  );
}
