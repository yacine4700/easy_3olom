import type { Metadata } from "next";
import { ExercisesPageClient } from "@/components/exercises/exercises-page-client";

export const metadata: Metadata = { title: "التمارين" };

export default function ExercisesPage() {
  return <ExercisesPageClient />;
}
