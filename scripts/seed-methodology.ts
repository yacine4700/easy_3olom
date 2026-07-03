/**
 * Seed the Methodology with representative bilingual teaching sequences.
 * Run with: `bun run scripts/seed-methodology.ts`
 *
 * Safe to re-run: clears existing rows first.
 */
import { db } from "../src/lib/db";

const SEED_SEQUENCES = [
  {
    title: "La cellule: unité structurale et fonctionnelle du vivant",
    titleAr: "الخلية: الوحدة البنيوية والوظيفية للكائن الحي",
    description:
      "Séquence introductive: organisation cellulaire, microscope, cellules animale et végétale.",
    descriptionAr:
      "سلسلة استكشافية: التنظيم الخلوي، المجهر، الخلية الحيوانية والنباتية.",
    level: "1AS",
    order: 1,
    status: "published",
  },
  {
    title: "La nutrition chez les végétaux chlorophylliens",
    titleAr: "التغذية عند النباتات اليخضورية",
    description:
      "Photosynthèse, échanges gazeux, production de matière organique.",
    descriptionAr:
      "التركيب الضوئي، التبادلات الغازية، إنتاج المادة العضوية.",
    level: "1AS",
    order: 2,
    status: "published",
  },
  {
    title: "Information génétique et hérédité",
    titleAr: "المعلومة الوراثية والوراثة",
    description:
      "ADN, gènes, chromosomes, transmission des caractères héréditaires.",
    descriptionAr:
      "الحمض النووي، المورثات، الصبغيات، انتقال الصفات الوراثية.",
    level: "2AS",
    order: 1,
    status: "published",
  },
  {
    title: "La division cellulaire: mitose et méiose",
    titleAr: "الانقسام الخلوي: الانقسام المتساوي والمنصف",
    description:
      "Mécanismes de la division, cycle cellulaire, comparaison mitose/méiose.",
    descriptionAr:
      "آليات الانقسام، الدورة الخلوية، مقارنة الانقسام المتساوي والمنصف.",
    level: "2AS",
    order: 2,
    status: "review",
  },
  {
    title: "Le métabolisme énergétique cellulaire",
    titleAr: "الاستقلاب الطاقي الخلوي",
    description:
      "Respiration cellulaire, fermentation, production d'ATP dans la mitochondrie.",
    descriptionAr:
      "التنفس الخلوي، التخمر، إنتاج الـ ATP داخل المتقدرة.",
    level: "3AS",
    order: 1,
    status: "published",
  },
  {
    title: "Coordination nerveuse et hormonale",
    titleAr: "التنسيق العصبي والهرموني",
    description:
      "Système nerveux, réflexes, messages nerveux et hormonaux, régulation.",
    descriptionAr:
      "الجهاز العصبي، المنعكسات، الرسائل العصبية والهرمونية، التنظيم.",
    level: "3AS",
    order: 2,
    status: "published",
  },
  {
    title: "La réponse immunitaire de l'organisme",
    titleAr: "الاستجابة المناعية للعضوية",
    description:
      "Immunité innée et adaptative, lymphocytes, anticorps, vaccination.",
    descriptionAr:
      "المناعة الطبيعية والمكتسبة، الخلايا اللمفاوية، الأجسام المضادة، التلقيح.",
    level: "3AS",
    order: 3,
    status: "draft",
  },
  {
    title: "Génétique des populations et évolution",
    titleAr: "وراثة الجمهرات والتطور",
    description:
      "Dérive génétique, sélection naturelle, mécanismes de l'évolution.",
    descriptionAr:
      "الانجراف الوراثي، الانتقاء الطبيعي، آليات التطور.",
    level: "AS",
    order: 1,
    status: "review",
  },
] as const;

async function main() {
  console.log("Seeding Methodology…");
  await db.methodology.deleteMany({});

  for (const seq of SEED_SEQUENCES) {
    await db.methodology.create({ data: { ...seq } });
  }

  const count = await db.methodology.count();
  console.log(`✓ Seeded ${count} teaching sequences.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
