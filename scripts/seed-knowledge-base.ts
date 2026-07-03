/**
 * Seed the Knowledge Base with representative demo data.
 * Run with: `bun run scripts/seed-knowledge-base.ts`
 *
 * Safe to re-run: clears existing rows first.
 */
import { db } from "../src/lib/db";

const SEED_DOCS = [
  {
    title: "La cellule — unité du vivant",
    source: "Manuel 1AS — Sciences de la vie et de la terre",
    level: "1AS",
    status: "published",
    chunkCount: 24,
    embeddingReady: true,
  },
  {
    title: "Les mécanismes de la génétique",
    source: "Manuel 2AS — SVT",
    level: "2AS",
    status: "review",
    chunkCount: 31,
    embeddingReady: false,
  },
  {
    title: "La transmission des caractères héréditaires",
    source: "Manuel 3AS — Sciences expérimentales",
    level: "3AS",
    status: "published",
    chunkCount: 18,
    embeddingReady: true,
  },
  {
    title: "Écosystèmes et flux de matière",
    source: "Manuel 2AS — SVT",
    level: "2AS",
    status: "draft",
    chunkCount: 0,
    embeddingReady: false,
  },
  {
    title: "Le système immunitaire et la réponse immunitaire",
    source: "Manuel 3AS — SVT",
    level: "3AS",
    status: "published",
    chunkCount: 27,
    embeddingReady: true,
  },
  {
    title: "Nutrition et métabolisme chez les végétaux",
    source: "Manuel 1AS — SVT",
    level: "1AS",
    status: "archived",
    chunkCount: 15,
    embeddingReady: false,
  },
  {
    title: "La reproduction chez les êtres vivants",
    source: "Manuel AS — Sciences fondamentales",
    level: "AS",
    status: "review",
    chunkCount: 22,
    embeddingReady: true,
  },
  {
    title: "Coordination nerveuse et hormonale",
    source: "Manuel 3AS — SVT",
    level: "3AS",
    status: "draft",
    chunkCount: 9,
    embeddingReady: false,
  },
] as const;

async function main() {
  console.log("Seeding Knowledge Base…");
  await db.knowledgeDocument.deleteMany({});

  for (const doc of SEED_DOCS) {
    await db.knowledgeDocument.create({ data: { ...doc } });
  }

  const count = await db.knowledgeDocument.count();
  console.log(`✓ Seeded ${count} documents.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
