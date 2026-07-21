"use client";

import { MessageCircleQuestion } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { StudentQuestionsView } from "@/components/student-questions/student-questions-view";
import { StudentQuestionsTableView } from "@/components/student-questions/student-questions-table-view";

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

      <Tabs defaultValue="user_questions">
        <TabsList>
          <TabsTrigger value="user_questions">محادثات المساعد</TabsTrigger>
          <TabsTrigger value="student_questions">أسئلة الاختبارات</TabsTrigger>
        </TabsList>
        <TabsContent value="user_questions" className="mt-4">
          <StudentQuestionsView />
        </TabsContent>
        <TabsContent value="student_questions" className="mt-4">
          <StudentQuestionsTableView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
