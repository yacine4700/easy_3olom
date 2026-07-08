import { supabase } from "@/lib/supabase";
import { notifyWebhook } from "@/lib/webhook";
import type { Methodology } from "@/types/domain";
import type { CreateMethodologyInput, ListMethodologiesQuery, UpdateMethodologyInput } from "@/lib/validators/methodology";

const TABLE = "methodology_rules";

type Row = { id: number | string; title: string | null; explanation: string | null; keywords: string[] | null };

function toDomain(r: Row): Methodology {
  return { id: String(r.id), title: r.title ?? "", explanation: r.explanation, keywords: Array.isArray(r.keywords) ? r.keywords : null };
}

export interface MethodologyListResult { items: Methodology[]; total: number; page: number; pageSize: number; }

export async function listMethodologies(query: ListMethodologiesQuery): Promise<MethodologyListResult> {
  const { search, page, pageSize } = query;
  let req = supabase.from(TABLE).select("*", { count: "exact" });
  if (search) req = req.or(`title.ilike.%${search}%,explanation.ilike.%${search}%`);
  req = req.order("title", { ascending: true }).range((page - 1) * pageSize, page * pageSize - 1);
  const { data, error, count } = await req;
  if (error) throw error;
  return { items: (data as Row[]).map(toDomain), total: count ?? 0, page, pageSize };
}

export async function getMethodology(id: string): Promise<Methodology | null> {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error || !data) return null;
  return toDomain(data as Row);
}

export async function getMethodologyStats() {
  const { count, error } = await supabase.from(TABLE).select("*", { count: "exact", head: true });
  if (error) throw error;
  return { total: count ?? 0 };
}

export async function createMethodology(input: CreateMethodologyInput): Promise<Methodology> {
  const result = await notifyWebhook("methodology", "create", {
    title: input.title, explanation: input.explanation ?? null, keywords: input.keywords ?? null,
    embedding_required: true,
  });
  if (!result.success) throw new Error(result.error);
  return { id: "", title: input.title, explanation: input.explanation ?? null, keywords: input.keywords ?? null };
}

export async function updateMethodology(id: string, input: UpdateMethodologyInput): Promise<Methodology | null> {
  // Fetch the existing record to compare explanation (the content field)
  const existing = await getMethodology(id);
  const oldExplanation = existing?.explanation ?? "";

  // embedding_required: true only when explanation actually changed
  const newExplanation = input.explanation ?? "";
  const embeddingRequired = input.explanation !== undefined && newExplanation !== oldExplanation;

  const result = await notifyWebhook("methodology", "update", {
    id, title: input.title ?? null, explanation: input.explanation ?? null, keywords: input.keywords ?? null,
    embedding_required: embeddingRequired,
  });
  if (!result.success) throw new Error(result.error);
  return { id, title: input.title ?? "", explanation: input.explanation ?? null, keywords: input.keywords ?? null };
}

export async function deleteMethodology(id: string): Promise<boolean> {
  const result = await notifyWebhook("methodology", "delete", id);
  if (!result.success) throw new Error(result.error);
  return true;
}
