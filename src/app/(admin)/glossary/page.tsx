import type { Metadata } from "next";
import { GlossaryPageClient } from "@/components/glossary/glossary-page-client";

export const metadata: Metadata = { title: "المعجم" };

export default function GlossaryPage() {
  return <GlossaryPageClient />;
}
