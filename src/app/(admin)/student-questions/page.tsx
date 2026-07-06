import type { Metadata } from "next";
import { MessageCircleQuestion } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { StudentQuestionStats } from "@/components/student-questions/student-question-stats";
import { StudentQuestionsView } from "@/components/student-questions/student-questions-view";
import {
  getStudentQuestionStats,
  listStudentQuestions,
} from "@/lib/services/student-question";

export const metadata: Metadata = {
  title: "أسئلة الطلاب",
};

/**
 * /student-questions — Student Questions module.
 *
 * Server Component: fetches the first page + aggregate stats directly from
 * the service layer (instant first paint), then hands off to the client
 * `StudentQuestionsView` which keeps data fresh via TanStack Query.
 *
 * Questions arrive via Telegram; the admin UI only edits answers or deletes
 * them — there is no create flow here.
 */
export default async function StudentQuestionsPage() {
  const [initial, stats] = await Promise.all([
    listStudentQuestions({ page: 1, pageSize: 50 }),
    getStudentQuestionStats(),
  ]);

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
          الأسئلة الواردة عبر تيليجرام من الطلاب. راجع الإجابات، حسّنها، أو
          احذف ما لا يلزم.
        </p>
      </div>

      <StudentQuestionStats stats={stats} />

      <StudentQuestionsView initialItems={initial.items} />
    </div>
  );
}
