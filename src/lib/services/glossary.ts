import { db } from "@/lib/db";
import type { GlossaryTerm } from "@/types/domain";
import type {
  CreateGlossaryTermInput,
  ListGlossaryTermsQuery,
  UpdateGlossaryTermInput,
} from "@/lib/validators/glossary";

/**
 * Glossary service (repository pattern).
 *
 * Mirrors the Knowledge Base service structure. Only place that touches
 * Prisma for this module — swapping persistence (e.g. to Supabase) means
 * re-implementing this file alone.
 */

type GlossaryTermRow = {
  id: string;
  term: string;
  termAr: string;
  definition: string;
  definitionAr: string;
  level: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

function toDomain(row: GlossaryTermRow): GlossaryTerm {
  return {
    id: row.id,
    term: row.term,
    termAr: row.termAr,
    definition: row.definition,
    definitionAr: row.definitionAr,
    level: row.level as GlossaryTerm["level"],
    status: row.status as GlossaryTerm["status"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export interface GlossaryListResult {
  items: GlossaryTerm[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listGlossaryTerms(
  query: ListGlossaryTermsQuery,
): Promise<GlossaryListResult> {
  const { search, level, status, page, pageSize } = query;

  // Search across both languages so a French OR Arabic query can find terms.
  const where = {
    ...(level ? { level } : {}),
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { term: { contains: search } },
            { termAr: { contains: search } },
            { definition: { contains: search } },
            { definitionAr: { contains: search } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    db.glossaryTerm.findMany({
      where,
      orderBy: { term: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.glossaryTerm.count({ where }),
  ]);

  return {
    items: rows.map(toDomain),
    total,
    page,
    pageSize,
  };
}

export async function getGlossaryTerm(
  id: string,
): Promise<GlossaryTerm | null> {
  const row = await db.glossaryTerm.findUnique({ where: { id } });
  return row ? toDomain(row) : null;
}

export async function createGlossaryTerm(
  input: CreateGlossaryTermInput,
): Promise<GlossaryTerm> {
  const row = await db.glossaryTerm.create({
    data: {
      term: input.term,
      termAr: input.termAr,
      definition: input.definition,
      definitionAr: input.definitionAr,
      level: input.level,
      status: input.status,
    },
  });
  return toDomain(row);
}

export async function updateGlossaryTerm(
  id: string,
  input: UpdateGlossaryTermInput,
): Promise<GlossaryTerm | null> {
  try {
    const row = await db.glossaryTerm.update({ where: { id }, data: input });
    return toDomain(row);
  } catch {
    return null;
  }
}

export async function deleteGlossaryTerm(id: string): Promise<boolean> {
  try {
    await db.glossaryTerm.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function getGlossaryStats(): Promise<{
  total: number;
  published: number;
  bilingual: number;
}> {
  const [total, published] = await Promise.all([
    db.glossaryTerm.count(),
    db.glossaryTerm.count({ where: { status: "published" } }),
  ]);
  // "bilingual" = both Arabic fields non-empty. With the Zod schema requiring
  // both, every row is bilingual by construction — kept as a stat placeholder
  // for when Arabic becomes optional in a future iteration.
  return { total, published, bilingual: total };
}
