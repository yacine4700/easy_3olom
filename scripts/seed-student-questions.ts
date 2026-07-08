/**
 * Seed Student Questions with representative bilingual data.
 * Run with: `bun run scripts/seed-student-questions.ts`
 *
 * Safe to re-run: clears existing rows first.
 *
 * Questions are mostly in Arabic (the language students use on Telegram),
 * with a few in French. Answers are present for "answered" items, null for
 * "new" items. This mirrors the real Telegram-driven ingestion flow.
 */
import { db } from "../src/lib/db";

const SEED_QUESTIONS = [
  {
    question:
      "ما هو الفرق بين الانقسام المتساوي والانقسام المنصف من حيث عدد الخلايا الناتجة؟",
    answer:
      "الانقسام المتساوي ينتج خليتين ابنتين متطابقتين وراثياً (2n)، بينما الانقسام المنصف ينتج أربع خلايا أحادية الصيغة الصبغية (n) لإنتاج الأمشاج.",
    status: "answered",
    level: "2AS",
    telegramChatId: "482719365",
    telegramMessageId: "1042",
    grounded: true,
  },
  {
    question: "Qu'est-ce que la photosynthèse et où se déroule-t-elle ?",
    answer:
      "La photosynthèse est le processus par lequel les végétaux chlorophylliens convertissent l'énergie lumineuse en énergie chimique (glucose), en consommant du CO₂ et en libérant de l'O₂. Elle se déroule dans les chloroplastes, au niveau de la chlorophylle.",
    status: "answered",
    level: "1AS",
    telegramChatId: "482719365",
    telegramMessageId: "1043",
    grounded: true,
  },
  {
    question: "اشرح لي دور المتقدرة في الخلية.",
    answer:
      "المتقدرة هي عضية مسؤولة عن إنتاج الطاقة (ATP) عبر عملية التنفس الخلوي، باستخدام الغلوكوز والأكسجين. تُلقب بـ«محطة طاقة الخلية».",
    status: "answered",
    level: "3AS",
    telegramChatId: "510388271",
    telegramMessageId: "876",
    grounded: true,
  },
  {
    question: "كيف ينتقل الحمض النووي من الآباء إلى الأبناء؟",
    answer: null,
    status: "new",
    level: "2AS",
    telegramChatId: "510388271",
    telegramMessageId: "879",
    grounded: false,
  },
  {
    question:
      "ما هي مراحل الاستجابة المناعية في الجسم عند دخول جسم غريب؟",
    answer:
      "تتميز المناعة الطبيعية (السريعة، غير النوعية: البلعمة، الحواجز) والمكتسبة (نوعية: خلايا لمفاوية T وB، أجسام مضادة). عند دخول مستضح تتدخل أولاً المناعة الطبيعية ثم النوعية مع تكوين ذاكرة مناعية.",
    status: "answered",
    level: "3AS",
    telegramChatId: "631904558",
    telegramMessageId: "201",
    grounded: true,
  },
  {
    question: "هل التركيب الضوئي عكس التنفس الخلوي؟",
    answer:
      "ليس عكسًا تمامًا. التركيب الضوئي يبني المادة العضوية ويخزن الطاقة، والتنفس الخلوي يفككها ويحرر الطاقة. لكنهما متكاملان في دورة الكربون والأكسجين.",
    status: "flagged",
    level: "1AS",
    telegramChatId: "631904558",
    telegramMessageId: "205",
    grounded: false,
  },
  {
    question: "Quels sont les composants de l'ADN ?",
    answer:
      "L'ADN est composé de nucléotides, chacun formé d'un sucre (désoxyribose), d'un groupement phosphate et d'une base azotée (adénine, thymine, guanine ou cytosine).",
    status: "answered",
    level: "2AS",
    telegramChatId: "482719365",
    telegramMessageId: "1051",
    grounded: true,
  },
  {
    question: "ما المقصود بالانزياح الجيني؟",
    answer: null,
    status: "new",
    level: "AS",
    telegramChatId: "778120934",
    telegramMessageId: "12",
    grounded: false,
  },
  {
    question: "لماذا يعتبر الغشاء البلازمي مهمًا للخلية؟",
    answer:
      "الغشاء البلازمي يحدّ الخلية وينظّم التبادلات مع الوسط الخارجي (دخول وخروج المواد) عبر خاصية النفاذية الاختيارية، ويحافظ على التوازن الداخلي (التناضح).",
    status: "answered",
    level: "1AS",
    telegramChatId: "778120934",
    telegramMessageId: "15",
    grounded: true,
  },
  {
    question:
      "ما الفرق بين التكاثر الجنسي واللاجنسي وأيهما أفضل من ناحية التنوع؟",
    answer: null,
    status: "flagged",
    level: "AS",
    telegramChatId: "510388271",
    telegramMessageId: "890",
    grounded: false,
  },
] as const;

async function main() {
  console.log("Seeding Student Questions…");
  await db.studentQuestion.deleteMany({});

  for (const q of SEED_QUESTIONS) {
    await db.studentQuestion.create({
      data: {
        question: q.question,
        answer: q.answer,
        status: q.status,
        level: q.level,
        telegramChatId: q.telegramChatId,
        telegramMessageId: q.telegramMessageId,
        grounded: q.grounded,
      },
    });
  }

  const count = await db.studentQuestion.count();
  console.log(`✓ Seeded ${count} student questions.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
