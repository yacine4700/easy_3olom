export const siteConfig = {
  name: "إيزي علوم — لوحة التحكم",
  shortName: "إيزي علوم",
  subject: "علوم الطبيعة والحياة",
  description: "لوحة تحكم لإدارة قاعدة المعرفة الخاصة بالمساعد الذكي لمادة علوم الطبيعة والحياة في التعليم الثانوي الجزائري.",
  stack: ["n8n", "Supabase", "RAG", "Telegram", "Gemini Flash 2.5"] as const,
} as const;
export type SiteConfig = typeof siteConfig;
