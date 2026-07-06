import type { Metadata } from "next";
import { StudentQuestionsPageClient } from "@/components/student-questions/student-questions-page-client";

export const metadata: Metadata = { title: "أسئلة الطلاب" };

export default function StudentQuestionsPage() {
  return <StudentQuestionsPageClient />;
}
