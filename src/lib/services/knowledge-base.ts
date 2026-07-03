import { db } from "@/lib/db";
import type { KnowledgeDocument } from "@/types/domain";
import type {
  CreateKnowledgeDocumentInput,
  ListKnowledgeDocumentsQuery,
  UpdateKnowledgeDocumentInput,
} from "@/lib/validators/knowledge-base";

/**
 * Knowledge Base service (repository pattern).
 *
 * This is the only place that touches Prisma for this module. Every UI/API
 * consumer goes through these functions, so the persistence layer can be
 * swapped (e.g. to Supabase) by re-implementing this file alone — the
 * signatures, validators and types stay unchanged.
 */

type KnowledgeDocumentRow = {
  id: string;
  title: string;
  source: string;
  level: string;
  status: string;
  chunkCount: number;
  embeddingReady: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** Map a Prisma row to the typed domain object (Date -> ISO string). */
function toDomain(row: KnowledgeDocumentRow): KnowledgeDocument {
  return {
    id: row.id,
    title: row.title,
    source: row.source,
    level: row.level as KnowledgeDocument["level"],
    status: row.status as KnowledgeDocument["status"],
    chunkCount: row.chunkCount,
    embeddingReady: row.embeddingReady,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export interface ListResult {
  items: KnowledgeDocument[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listKnowledgeDocuments(
  query: ListKnowledgeDocumentsQuery,
): Promise<ListResult> {
  const { search, level, status, page, pageSize } = query;

  const where = {
    ...(level ? { level } : {}),
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { source: { contains: search } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    db.knowledgeDocument.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.knowledgeDocument.count({ where }),
  ]);

  return {
    items: rows.map(toDomain),
    total,
    page,
    pageSize,
  };
}

export async function getKnowledgeDocument(
  id: string,
): Promise<KnowledgeDocument | null> {
  const row = await db.knowledgeDocument.findUnique({ where: { id } });
  return row ? toDomain(row) : null;
}

export async function createKnowledgeDocument(
  input: CreateKnowledgeDocumentInput,
): Promise<KnowledgeDocument> {
  const row = await db.knowledgeDocument.create({
    data: {
      title: input.title,
      source: input.source,
      level: input.level,
      status: input.status,
      chunkCount: input.chunkCount,
      embeddingReady: input.embeddingReady,
    },
  });
  return toDomain(row);
}

export async function updateKnowledgeDocument(
  id: string,
  input: UpdateKnowledgeDocumentInput,
): Promise<KnowledgeDocument | null> {
  try {
    const row = await db.knowledgeDocument.update({
      where: { id },
      data: input,
    });
    return toDomain(row);
  } catch {
    // Prisma throws P2025 when the record doesn't exist.
    return null;
  }
}

export async function deleteKnowledgeDocument(
  id: string,
): Promise<boolean> {
  try {
    await db.knowledgeDocument.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

/** Lightweight aggregate counts for dashboard/header surfaces. */
export async function getKnowledgeBaseStats(): Promise<{
  total: number;
  published: number;
  embeddingReady: number;
}> {
  const [total, published, embeddingReady] = await Promise.all([
    db.knowledgeDocument.count(),
    db.knowledgeDocument.count({ where: { status: "published" } }),
    db.knowledgeDocument.count({ where: { embeddingReady: true } }),
  ]);
  return { total, published, embeddingReady };
}
