import type { Metadata } from "next";
import { KnowledgeBasePageClient } from "@/components/knowledge-base/knowledge-base-page-client";

export const metadata: Metadata = {
  title: "قاعدة المعرفة",
};

export default function KnowledgeBasePage() {
  return <KnowledgeBasePageClient />;
}
