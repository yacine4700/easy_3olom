import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StudentQuestion } from "@/types/domain";

export interface RecentQuestionsFeedProps {
  questions: StudentQuestion[];
}

/**
 * Formats an ISO date string as an Arabic relative-time label using the
 * built-in Intl.RelativeTimeFormat. Stable on both server (Node 19+) and
 * client, so it's safe to call from this Server Component.
 */
function formatRelativeTime(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, "second");
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour");
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day");
  const diffMonth = Math.round(diffDay / 30);
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, "month");
  return rtf.format(Math.round(diffDay / 365), "year");
}

/**
 * Server Component — lists the most recent unanswered student questions with
 * a "عرض الكل" deep link to the full module. Empty state celebrates that
 * nothing is pending ("كل شيء منجز — لا توجد أسئلة بدون إجابة.").
 */
export function RecentQuestionsFeed({ questions }: RecentQuestionsFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>في انتظار الإجابة</CardTitle>
        {questions.length > 0 ? (
          <CardAction>
            <Link
              href="/student-questions"
              className="text-brand hover:text-brand/80 text-xs font-medium hover:underline"
            >
              عرض الكل
            </Link>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <CheckCircle2 className="size-8 text-emerald-500" />
            <p className="text-muted-foreground text-sm">
              كل شيء منجز — لا توجد أسئلة بدون إجابة.
            </p>
          </div>
        ) : (
          <ul className="divide-border divide-y">
            {questions.map((q) => (
              <li
                key={q.id}
                className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0"
              >
                <p className="text-sm leading-relaxed" dir="auto">
                  {q.question}
                </p>
                <p className="text-muted-foreground text-xs tabular-nums">
                  {formatRelativeTime(q.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
