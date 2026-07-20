import { supabase } from "@/lib/supabase";
import type { Methodology } from "@/types/domain";
import type { CreateMethodologyInput, ListMethodologiesQuery, UpdateMethodologyInput } from "@/lib/validators/methodology";

/**
 * Methodology service — all CRUD operations go directly to Supabase.
 * No webhook involvement (methodology does not require embeddings).
 */

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
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      title: input.title,
      explanation: input.explanation ?? null,
      keywords: input.keywords ?? null,
    })
    .select()
    .single();

  if (error || !data) throw error ?? new Error("Create failed");
  return toDomain(data as Row);
}

export async function updateMethodology(id: string, input: UpdateMethodologyInput): Promise<Methodology | null> {
  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.explanation !== undefined) update.explanation = input.explanation;
  if (input.keywords !== undefined) update.keywords = input.keywords;

  const { data, error } = await supabase
    .from(TABLE)
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return toDomain(data as Row);
}

export async function deleteMethodology(id: string): Promise<boolean> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
  return true;
}
