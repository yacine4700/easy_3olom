import { supabase } from "@/lib/supabase";
import { notifyWebhook } from "@/lib/webhook";
import type { KnowledgeDocument } from "@/types/domain";
import type { CreateKnowledgeDocumentInput, ListKnowledgeDocumentsQuery, UpdateKnowledgeDocumentInput } from "@/lib/validators/knowledge-base";

const TABLE = "knowledge_base";

type Row = {
  id: number | string; title: string | null; content: string | null;
  domain: string | null; unit: string | null; keywords: string[] | null;
  bot_instructions: string | null; created_at?: string | null; level?: string | null;
};

function toDomain(r: Row): KnowledgeDocument {
  return { id: String(r.id), title: r.title ?? "", content: r.content, domain: r.domain, unit: r.unit,
    level: r.level ?? null, keywords: Array.isArray(r.keywords) ? r.keywords : null, botInstructions: r.bot_instructions, createdAt: r.created_at ?? undefined };
}

export interface ListResult { items: KnowledgeDocument[]; total: number; page: number; pageSize: number; }

export async function listKnowledgeDocuments(query: ListKnowledgeDocumentsQuery): Promise<ListResult> {
  const { search, domain, unit, page, pageSize } = query;
  let req = supabase.from(TABLE).select("*", { count: "exact" });
  if (domain) req = req.eq("domain", domain);
  if (unit) req = req.eq("unit", unit);
  if (search) req = req.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  req = req.order("created_at", { ascending: false, nullsFirst: false }).range((page - 1) * pageSize, page * pageSize - 1);
  const { data, error, count } = await req;
  if (error) throw error;
  return { items: (data as Row[]).map(toDomain), total: count ?? 0, page, pageSize };
}

export async function getKnowledgeDocument(id: string): Promise<KnowledgeDocument | null> {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error || !data) return null;
  return toDomain(data as Row);
}

export async function getKnowledgeBaseStats() {
  const [totalRes, allRes] = await Promise.all([
    supabase.from(TABLE).select("*", { count: "exact", head: true }),
    supabase.from(TABLE).select("domain"),
  ]);
  const domains = new Set((allRes.data ?? []).map((r: { domain: string | null }) => r.domain).filter(Boolean));
  return { total: totalRes.count ?? 0, domains: domains.size };
}

// WRITES → webhook only
export async function createKnowledgeDocument(input: CreateKnowledgeDocumentInput): Promise<KnowledgeDocument> {
  const result = await notifyWebhook("knowledge", "create", {
    level: input.level, domain: input.domain ?? null, unit: input.unit ?? null, title: input.title,
    content: input.content ?? null, keywords: input.keywords ?? null, bot_instructions: input.botInstructions ?? null,
  });
  if (!result.success) throw new Error(result.error);
  return { id: "", title: input.title, content: input.content ?? null, domain: input.domain ?? null,
    unit: input.unit ?? null, level: input.level, keywords: input.keywords ?? null, botInstructions: input.botInstructions ?? null, createdAt: new Date().toISOString() };
}

export async function updateKnowledgeDocument(id: string, input: UpdateKnowledgeDocumentInput): Promise<KnowledgeDocument | null> {
  const result = await notifyWebhook("knowledge", "update", {
    id, level: input.level ?? null, domain: input.domain ?? null, unit: input.unit ?? null, title: input.title,
    content: input.content ?? null, keywords: input.keywords ?? null, bot_instructions: input.botInstructions ?? null,
  });
  if (!result.success) throw new Error(result.error);
  return { id, title: input.title ?? "", content: input.content ?? null, domain: input.domain ?? null,
    unit: input.unit ?? null, level: input.level ?? null, keywords: input.keywords ?? null, botInstructions: input.botInstructions ?? null };
}

export async function deleteKnowledgeDocument(id: string): Promise<boolean> {
  const result = await notifyWebhook("knowledge", "delete", id);
  if (!result.success) throw new Error(result.error);
  return true;
}
