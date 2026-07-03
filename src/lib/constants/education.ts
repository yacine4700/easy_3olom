import type { ContentStatus, EducationLevel } from "@/types/domain";

/**
 * Display labels for the shared education-level enum.
 * Algerian secondary-education years for sciences expérimentales.
 */
export const EDUCATION_LEVELS: {
  value: EducationLevel;
  label: string;
  hint: string;
}[] = [
  { value: "1AS", label: "1AS", hint: "السنة الأولى علوم" },
  { value: "2AS", label: "2AS", hint: "السنة الثانية علوم" },
  { value: "3AS", label: "3AS", hint: "السنة الثالثة علوم" },
  { value: "AS", label: "AS", hint: "علوم أساسية" },
];

/** Map a level value to its short display label (fallback to raw value). */
export function levelLabel(value: EducationLevel | string): string {
  return EDUCATION_LEVELS.find((l) => l.value === value)?.label ?? value;
}

/** Ordered lifecycle for knowledge content. */
export const CONTENT_STATUSES: {
  value: ContentStatus;
  label: string;
}[] = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "In review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

/** Map a status value to its display label. */
export function statusLabel(value: ContentStatus | string): string {
  return CONTENT_STATUSES.find((s) => s.value === value)?.label ?? value;
}
