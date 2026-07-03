/**
 * Global site configuration.
 * Single source of truth for branding strings used across the app.
 */
export const siteConfig = {
  name: "Easy 3olom Admin",
  shortName: "Easy 3olom",
  /** Arabic name of the subject the assistant covers */
  subject: "علوم الطبيعة والحياة",
  description:
    "Admin console for the RAG-powered assistant covering Natural & Life Sciences (علوم الطبيعة والحياة) in Algerian secondary education.",
  /** Tech context shown in footer / about surfaces */
  stack: ["n8n", "Supabase", "RAG", "Telegram", "Gemini Flash 2.5"] as const,
} as const;

export type SiteConfig = typeof siteConfig;
