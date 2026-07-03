/**
 * Domain types for Easy 3olom Admin.
 *
 * These are intentionally lightweight placeholders for Phase 1.
 * Each module (Knowledge Base, Glossary, ...) will expand its own
 * types as we build it. Centralising them here keeps the data
 * contracts stable across services and UI.
 */

/** Generic status used across content modules */
export type ContentStatus = "draft" | "review" | "published" | "archived";

/** Algerian secondary-education levels (سنوات التعليم الثانوي) */
export type EducationLevel =
  | "AS" // السنة الأولى علوم تجريبية
  | "1AS"
  | "2AS"
  | "3AS";

/** Shared metadata attached to most knowledge records */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Module: Knowledge Base                                              */
/* ------------------------------------------------------------------ */
export interface KnowledgeDocument extends BaseEntity {
  title: string;
  source: string;
  level: EducationLevel;
  status: ContentStatus;
  chunkCount: number;
  /** Supabase Storage / vector reference, filled in data layer phase */
  embeddingReady: boolean;
}

/* ------------------------------------------------------------------ */
/* Module: Methodology                                                 */
/* ------------------------------------------------------------------ */
export interface Methodology extends BaseEntity {
  title: string;
  level: EducationLevel;
  order: number;
  status: ContentStatus;
}

/* ------------------------------------------------------------------ */
/* Module: Learning Objectives                                         */
/* ------------------------------------------------------------------ */
export interface LearningObjective extends BaseEntity {
  code: string;
  description: string;
  level: EducationLevel;
  methodologyId: string | null;
}

/* ------------------------------------------------------------------ */
/* Module: Glossary                                                    */
/* ------------------------------------------------------------------ */
export interface GlossaryTerm extends BaseEntity {
  term: string;
  definition: string;
  level: EducationLevel;
}

/* ------------------------------------------------------------------ */
/* Module: Student Questions                                           */
/* ------------------------------------------------------------------ */
export type QuestionStatus = "new" | "answered" | "flagged";

export interface StudentQuestion extends BaseEntity {
  question: string;
  answer: string | null;
  status: QuestionStatus;
  telegramChatId: string;
  /** Whether the answer was grounded in retrieved context */
  grounded: boolean;
}
