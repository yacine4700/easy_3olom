import { supabase } from "@/lib/supabase";
import { notifyWebhook } from "@/lib/webhook";
import type { GlossaryTerm } from "@/types/domain";
import type { CreateGlossaryTermInput, ListGlossaryTermsQuery, UpdateGlossaryTermInput } from "@/lib/validators/glossary";

const TABLE = "glossary";

type Row = { id: number | string; term: string | null; definition: string | null; unit: string | null; domain: string | null };

function toDomain(r: Row): GlossaryTerm {
  return { id: String(r.id), term: r.term ?? "", definition: r.definition, unit: r.unit, domain: r.domain };
}

export interface GlossaryListResult { items: GlossaryTerm[]; total: number; page: number; pageSize: number; }

export async function listGlossaryTerms(query: ListGlossaryTermsQuery): Promise<GlossaryListResult> {
  const { search, domain, unit, page, pageSize } = query;
  let req = supabase.from(TABLE).select("*", { count: "exact" });
  if (domain) req = req.eq("domain", domain);
  if (unit) req = req.eq("unit", unit);
  if (search) req = req.or(`term.ilike.%${search}%,definition.ilike.%${search}%`);
  req = req.order("term", { ascending: true }).range((page - 1) * pageSize, page * pageSize - 1);
  const { data, error, count } = await req;
  if (error) throw error;
  return { items: (data as Row[]).map(toDomain), total: count ?? 0, page, pageSize };
}

export async function getGlossaryTerm(id: string): Promise<GlossaryTerm | null> {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error || !data) return null;
  return toDomain(data as Row);
}

export async function getGlossaryStats() {
  const [totalRes, allRes] = await Promise.all([
    supabase.from(TABLE).select("*", { count: "exact", head: true }),
    supabase.from(TABLE).select("domain"),
  ]);
  const domains = new Set((allRes.data ?? []).map((r: { domain: string | null }) => r.domain).filter(Boolean));
  return { total: totalRes.count ?? 0, domains: domains.size };
}

export async function createGlossaryTerm(input: CreateGlossaryTermInput): Promise<GlossaryTerm> {
  const result = await notifyWebhook("glossary", "create", {
    term: input.term, definition: input.definition ?? null, unit: input.unit ?? null, domain: input.domain ?? null,
  });
  if (!result.success) throw new Error(result.error);
  return { id: "", term: input.term, definition: input.definition ?? null, unit: input.unit ?? null, domain: input.domain ?? null };
}

export async function updateGlossaryTerm(id: string, input: UpdateGlossaryTermInput): Promise<GlossaryTerm | null> {
  const result = await notifyWebhook("glossary", "update", {
    id, term: input.term ?? null, definition: input.definition ?? null, unit: input.unit ?? null, domain: input.domain ?? null,
  });
  if (!result.success) throw new Error(result.error);
  return { id, term: input.term ?? "", definition: input.definition ?? null, unit: input.unit ?? null, domain: input.domain ?? null };
}

export async function deleteGlossaryTerm(id: string): Promise<boolean> {
  const result = await notifyWebhook("glossary", "delete", id);
  if (!result.success) throw new Error(result.error);
  return true;
}
