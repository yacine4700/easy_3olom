import { db } from "@/lib/db";
import type { Methodology } from "@/types/domain";
import type {
  CreateMethodologyInput,
  ListMethodologiesQuery,
  UpdateMethodologyInput,
} from "@/lib/validators/methodology";

/**
 * Methodology service (repository pattern).
 * Only file that touches Prisma for this module — mirrors KB/Glossary.
 *
 * Default ordering: by level then by `order` ascending, so teaching
 * sequences display in pedagogical progression within each level.
 */

type MethodologyRow = {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  level: string;
  status: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

/** Stable level ordering so 1AS < 2AS < 3AS < AS regardless of string sort. */
const LEVEL_ORDER: Record<string, number> = {
  "1AS": 1,
  "2AS": 2,
  "3AS": 3,
  AS: 4,
};

function toDomain(row: MethodologyRow): Methodology {
  return {
    id: row.id,
    title: row.title,
    titleAr: row.titleAr,
    description: row.description,
    descriptionAr: row.descriptionAr,
    level: row.level as Methodology["level"],
    status: row.status as Methodology["status"],
    order: row.order,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export interface MethodologyListResult {
  items: Methodology[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listMethodologies(
  query: ListMethodologiesQuery,
): Promise<MethodologyListResult> {
  const { search, level, status, page, pageSize } = query;

  const where = {
    ...(level ? { level } : {}),
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { titleAr: { contains: search } },
            { description: { contains: search } },
            { descriptionAr: { contains: search } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    db.methodology.findMany({
      where,
      // SQLite can't order by a lookup expression, so we fetch then sort
      // in JS by (level-rank, order) for a stable pedagogical progression.
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.methodology.count({ where }),
  ]);

  const items = rows
    .map(toDomain)
    .sort((a, b) => {
      const la = LEVEL_ORDER[a.level] ?? 99;
      const lb = LEVEL_ORDER[b.level] ?? 99;
      if (la !== lb) return la - lb;
      return a.order - b.order;
    });

  return { items, total, page, pageSize };
}

export async function getMethodology(
  id: string,
): Promise<Methodology | null> {
  const row = await db.methodology.findUnique({ where: { id } });
  return row ? toDomain(row) : null;
}

export async function createMethodology(
  input: CreateMethodologyInput,
): Promise<Methodology> {
  const row = await db.methodology.create({
    data: {
      title: input.title,
      titleAr: input.titleAr,
      description: input.description,
      descriptionAr: input.descriptionAr,
      level: input.level,
      status: input.status,
      order: input.order,
    },
  });
  return toDomain(row);
}

export async function updateMethodology(
  id: string,
  input: UpdateMethodologyInput,
): Promise<Methodology | null> {
  try {
    const row = await db.methodology.update({ where: { id }, data: input });
    return toDomain(row);
  } catch {
    return null;
  }
}

export async function deleteMethodology(id: string): Promise<boolean> {
  try {
    await db.methodology.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function getMethodologyStats(): Promise<{
  total: number;
  published: number;
  levels: number;
}> {
  const [total, published, levels] = await Promise.all([
    db.methodology.count(),
    db.methodology.count({ where: { status: "published" } }),
    db.methodology.findMany({ select: { level: true } }).then((rows) =>
      new Set(rows.map((r) => r.level)).size,
    ),
  ]);
  return { total, published, levels };
}
