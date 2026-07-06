import type { Metadata } from "next";
import { MethodologyPageClient } from "@/components/methodology/methodology-page-client";

export const metadata: Metadata = { title: "القواعد المنهاجية" };

export default function MethodologyPage() {
  return <MethodologyPageClient />;
}
