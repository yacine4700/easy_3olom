import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { MessageCircleQuestion, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentQuestionRecord } from "@/lib/services/student-questions-table";

export function RecentQuestionsFeed({
  questions,
}: {
  questions: StudentQuestionRecord[];
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">أحدث الأسئلة</CardTitle>
        <Link
          href="/student-questions"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
        >
          عرض الكل
          <ArrowUpRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {questions.length === 0 ? (
          <p className="text-muted-foreground px-6 py-8 text-center text-sm">
            لا توجد أسئلة بعد.
          </p>
        ) : (
          <ul className="divide-y">
            {questions.map((q) => (
              <li key={q.id}>
                <Link
                  href="/student-questions"
                  className="hover:bg-muted/30 flex gap-3 px-6 py-3 transition-colors"
                >
                  <div className="bg-muted text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md">
                    <MessageCircleQuestion className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="line-clamp-2 text-sm leading-snug" dir="auto">
                      {q.question}
                    </p>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      {q.topic && <span>{q.topic}</span>}
                      {q.topic && <span>·</span>}
                      {q.createdAt && (
                        <span>
                          {formatDistanceToNow(new Date(q.createdAt), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
