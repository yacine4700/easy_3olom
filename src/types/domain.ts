/** Domain types matching existing Supabase tables. */

export type EducationLevel = "1AS" | "2AS" | "3AS" | "AS";
export type ContentStatus = "draft" | "review" | "published" | "archived";

export interface BaseEntity {
  id: string;
  createdAt?: string;
}

// knowledge_base table: id, domain, unit, title, keywords(jsonb), content, bot_instructions, created_at
export interface KnowledgeDocument extends BaseEntity {
  title: string;
  content: string | null;
  domain: string | null;
  unit: string | null;
  keywords: string[] | null;
  botInstructions: string | null;
}

// methodology_rules table: id, title, explanation, keywords(jsonb)
export interface Methodology extends BaseEntity {
  title: string;
  explanation: string | null;
  keywords: string[] | null;
}

// glossary table: id, term, definition, unit, domain
export interface GlossaryTerm extends BaseEntity {
  term: string;
  definition: string | null;
  unit: string | null;
  domain: string | null;
}

// user_questions table: id, session_id, user_id, question, answer, created_at
export type QuestionStatus = "new" | "answered";

export interface StudentQuestion extends BaseEntity {
  question: string;
  answer: string | null;
  sessionId: string | null;
  userId: string | null;
}
