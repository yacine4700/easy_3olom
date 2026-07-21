import type { Metadata } from "next";
import { MethodologyPageClient } from "@/components/methodology/methodology-page-client";

export const metadata: Metadata = { title: "قواعد المنهجية" };

export default function MethodologyPage() {
  return <MethodologyPageClient />;
}
