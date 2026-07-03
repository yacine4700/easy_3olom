/**
 * Seed the Glossary with representative bilingual (FR + AR) biology terms.
 * Run with: `bun run scripts/seed-glossary.ts`
 *
 * Safe to re-run: clears existing rows first.
 */
import { db } from "../src/lib/db";

const SEED_TERMS = [
  {
    term: "Cellule",
    termAr: "خلية",
    definition:
      "Unité structurale et fonctionnelle de base de tous les êtres vivants.",
    definitionAr:
      "الوحدة البنيوية والوظيفية الأساسية لجميع الكائنات الحية.",
    level: "1AS",
    status: "published",
  },
  {
    term: "ADN",
    termAr: "الحمض النووي الريبي منقوص الأكسجين",
    definition:
      "Acide nucléique porteur de l'information génétique héréditaire.",
    definitionAr:
      "حمض نووي يحمل المعلومة الوراثية المنتقلة عبر الأجيال.",
    level: "2AS",
    status: "published",
  },
  {
    term: "Photosynthèse",
    termAr: "التركيب الضوئي",
    definition:
      "Processus de conversion de l'énergie lumineuse en énergie chimique par les végétaux chlorophylliens.",
    definitionAr:
      "عملية تحويل الطاقة الضوئية إلى طاقة كيميائية يقوم بها النبات اليخضوري.",
    level: "1AS",
    status: "published",
  },
  {
    term: "Mitose",
    termAr: "الانقسام المتساوي",
    definition:
      "Division cellulaire donnant deux cellules filles génétiquement identiques à la cellule mère.",
    definitionAr:
      "انقسام خلوي ينتج خليتين ابنتين متطابقتين وراثياً مع الخلية الأم.",
    level: "2AS",
    status: "review",
  },
  {
    term: "Méiose",
    termAr: "الانقسام المنصف",
    definition:
      "Division réductionnelle produisant quatre cellules haploïdes à partir d'une cellule diploïde.",
    definitionAr:
      "انقسام اختزالي ينتج أربع خلايا أحادية الصيغة الصبغية انطلاقاً من خلية ثنائية الصيغة.",
    level: "3AS",
    status: "published",
  },
  {
    term: "Chromosome",
    termAr: "صبغي",
    definition:
      "Structure composée d'ADN et de protéines, porteuse des gènes.",
    definitionAr:
      "بنية مكونة من الحمض النووي والبروتينات، تحمل المورثات.",
    level: "2AS",
    status: "published",
  },
  {
    term: "Enzyme",
    termAr: "أنزيم",
    definition:
      "Protéine catalysant une réaction biochimique spécifique.",
    definitionAr:
      "بروتين يعمل كعامل حفّاز لتفاعل كيميائي حيوي محدد.",
    level: "1AS",
    status: "published",
  },
  {
    term: "Membrane plasmique",
    termAr: "الغشاء البلازمي",
    definition:
      "Membrane lipidique délimitant la cellule et contrôlant les échanges.",
    definitionAr:
      "غشاء شحمي يحدّ الخلية وينظّم التبادلات مع الوسط الخارجي.",
    level: "1AS",
    status: "review",
  },
  {
    term: "Mitochondrie",
    termAr: "المتقدرة",
    definition:
      "Organite responsable de la production d'énergie (ATP) par respiration cellulaire.",
    definitionAr:
      "عضية مسؤولة عن إنتاج الطاقة (ATP) عبر التنفس الخلوي.",
    level: "3AS",
    status: "published",
  },
  {
    term: "Génome",
    termAr: "المجموع المورثي",
    definition:
      "Ensemble du matériel génétique d'un organisme.",
    definitionAr:
      "مجموع المادة الوراثية لكائن حي.",
    level: "3AS",
    status: "draft",
  },
  {
    term: "Osmose",
    termAr: "التناضح",
    definition:
      "Diffusion de l'eau à travers une membrane semi-perméable du milieu hypotonique vers le milieu hypertonique.",
    definitionAr:
      "انتشار الماء عبر غشاء نصف نفاذ من الوسط منخفض التركيز إلى الوسط مرتفع التركيز.",
    level: "1AS",
    status: "archived",
  },
  {
    term: "Ribosome",
    termAr: "الريبوزوم",
    definition:
      "Organite cytoplasmique assurant la synthèse des protéines.",
    definitionAr:
      "عضية سيتوبلازمية تقوم بتركيب البروتينات.",
    level: "2AS",
    status: "published",
  },
] as const;

async function main() {
  console.log("Seeding Glossary…");
  await db.glossaryTerm.deleteMany({});

  for (const term of SEED_TERMS) {
    await db.glossaryTerm.create({ data: { ...term } });
  }

  const count = await db.glossaryTerm.count();
  console.log(`✓ Seeded ${count} glossary terms.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
