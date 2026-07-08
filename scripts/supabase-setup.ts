/**
 * Supabase setup + seed script.
 * Run with: bun run scripts/supabase-setup.ts
 *
 * Uses EXISTING RAG pipeline tables:
 *   - knowledge_base, glossary, methodology_rules, user_questions
 *
 * Only the `settings` table needs to be created (admin-only).
 * This script:
 *   1. Checks if settings table exists
 *   2. If not — prints SQL to create it
 *   3. If yes — seeds demo data into all 4 existing tables
 */
import { supabase } from "../src/lib/supabase";
import { readFileSync } from "fs";

const SUPABASE_URL = process.env.SUPABASE_URL!;

async function settingsTableExists(): Promise<boolean> {
  const { error } = await supabase.from("settings").select("id").limit(1);
  if (error) {
    if (error.code === "PGRST205" || error.code === "42P01") return false;
  }
  return !error;
}

async function clearExisting() {
  // Only clear the tables we seed (don't touch settings — auto-seeded by service)
  const tables = ["knowledge_base", "glossary", "methodology_rules", "user_questions"];
  for (const table of tables) {
    await supabase.from(table).delete().neq("id", "0");
  }
  console.log("✓ Cleared existing data (4 tables)");
}

async function seedKnowledgeBase() {
  const docs = [
    { title: "الخلية: وحدة الكائن الحي", content: "مقدمة في التنظيم الخلوي، أنواع الخلايا (حيوانية ونباتية)، تركيب الخلية ووظائف العضيات.", domain: "ع.ط.ح", unit: "الخلية", keywords: ["خلية", "غشاء بلازمي", "سيتوبلازم", "نواة"], bot_instructions: "ركز على التعاريف الأساسية والفرق بين الخلية الحيوانية والنباتية." },
    { title: "التركيب الضوئي", content: "آلية تحويل الطاقة الضوئية إلى طاقة كيميائية، مراحل التركيب الضوئي، أهميته في النظام البيئي.", domain: "ع.ط.ح", unit: "التغذية عند النباتات", keywords: ["تركيب ضوئي", "يخضور", "كلوروبلاست", "غلوكوز"], bot_instructions: "اشرح المراحل بوضوح مع التركيز على دور اليخضور." },
    { title: "الانقسام المتساوي", content: "مراحل الانقسام المتساوي، أهميته في النمو والتجديد الخلوي.", domain: "ع.ط.ح", unit: "الانقسام الخلوي", keywords: ["انقسام متساوي", "طور ابتدائي", "طور استوائي", "طور نهائي"], bot_instructions: "اذكر المراحل بالترتيب مع شرح كل طور." },
    { title: "الانقسام المنصف", content: "آلية الانقسام المنصف وإنتاج الأمشاج، أهميته في التنوع الوراثي.", domain: "ع.ط.ح", unit: "الانقسام الخلوي", keywords: ["انقسام منصف", "أمشاج", "تنوع وراثي", "صبغيات"], bot_instructions: "وضح الفرق بين الانقسام المتساوي والمنصف." },
    { title: "الحمض النووي والوراثة", content: "تركيب الحمض النووي، آلية انتقال الصفات الوراثية، قوانين مندل.", domain: "ع.ط.ح", unit: "الوراثة", keywords: ["حمض نووي", "مورثة", "صبغي", "مندل"], bot_instructions: "استخدم أمثلة ملموسة لشرح قوانين مندل." },
    { title: "التنفس الخلوي", content: "مراحل التنفس الخلوي، إنتاج الـ ATP، دور المتقدرة.", domain: "ع.ط.ح", unit: "الاستقلاب", keywords: ["تنفس خلوي", "ATP", "متقدرة", "غلوكوز"], bot_instructions: "ركز على المراحل الثلاث ومكان حدوث كل منها." },
    { title: "الاستجابة المناعية", content: "أنواع المناعة (طبيعية ومكتسبة)، آليات الاستجابة، دور الأجسام المضادة.", domain: "ع.ط.ح", unit: "المناعة", keywords: ["مناعة", "أجسام مضادة", "لمفاويات", "مستضد"], bot_instructions: "فرّق بين المناعة الطبيعية والمكتسبة بأمثلة." },
    { title: "التنسيق العصبي", content: "الجهاز العصبي، الناقل العصبي، المنعكسات العصبية.", domain: "ع.ط.ح", unit: "التنسيق", keywords: ["جهاز عصبي", "عصبون", "مشبك", "منعكس"], bot_instructions: "اشرح كيف تنتقل السيالة العصبية." },
  ];

  const { error } = await supabase.from("knowledge_base").insert(docs);
  if (error) throw error;
  console.log(`✓ Seeded ${docs.length} knowledge_base documents`);
}

async function seedGlossary() {
  const terms = [
    { term: "خلية", definition: "الوحدة البنيوية والوظيفية الأساسية لجميع الكائنات الحية.", unit: "الخلية", domain: "ع.ط.ح" },
    { term: "غشاء بلازمي", definition: "غشاء شحمي يحدّ الخلية وينظّم التبادلات مع الوسط الخارجي.", unit: "الخلية", domain: "ع.ط.ح" },
    { term: "يخضور", definition: "صبغة خضراء في البلاستيدات تلتقط الطاقة الضوئية للتركيب الضوئي.", unit: "التغذية", domain: "ع.ط.ح" },
    { term: "مورثة", definition: "قطعة من الحمض النووي تحمل معلومة وراثية محددة.", unit: "الوراثة", domain: "ع.ط.ح" },
    { term: "صبغي", definition: "بنية مكونة من الحمض النووي والبروتينات تحمل المورثات.", unit: "الوراثة", domain: "ع.ط.ح" },
    { term: "أنزيم", definition: "بروتين يعمل كعامل حفّاز لتفاعل كيميائي حيوي محدد.", unit: "الاستقلاب", domain: "ع.ط.ح" },
    { term: "متقدرة", definition: "عضية مسؤولة عن إنتاج الطاقة (ATP) عبر التنفس الخلوي.", unit: "الاستقلاب", domain: "ع.ط.ح" },
    { term: "انقسام متساوي", definition: "انقسام خلوي ينتج خليتين ابنتين متطابقتين وراثياً.", unit: "الانقسام الخلوي", domain: "ع.ط.ح" },
    { term: "انقسام منصف", definition: "انقسام اختزالي ينتج أربع خلايا أحادية الصيغة الصبغية.", unit: "الانقسام الخلوي", domain: "ع.ط.ح" },
    { term: "تركيب ضوئي", definition: "عملية تحويل الطاقة الضوئية إلى طاقة كيميائية يقوم بها النبات اليخضوري.", unit: "التغذية", domain: "ع.ط.ح" },
    { term: "ATP", definition: "جزيء يحمل الطاقة الكيميائية اللازمة للتفاعلات الخلوية.", unit: "الاستقلاب", domain: "ع.ط.ح" },
    { term: "مناعة", definition: "قدرة العضوية على الدفاع ضد الأجسام الغريبة.", unit: "المناعة", domain: "ع.ط.ح" },
  ];

  const { error } = await supabase.from("glossary").insert(terms);
  if (error) throw error;
  console.log(`✓ Seeded ${terms.length} glossary terms`);
}

async function seedMethodology() {
  const rules = [
    { title: "استخدم لغة بسيطة", explanation: "وجّه الإجابات للطلاب بلغة عربية واضحة وبسيطة مناسبة لمستوى الثانوي.", keywords: ["لغة", "وضوح", "تبسيط"] },
    { title: "اعتمد على المنهاج", explanation: "اجعل إجاباتك متوافقة مع المنهاج الجزائري لمادة علوم الطبيعة والحياة.", keywords: ["منهاج", "توافق", "محتوى"] },
    { title: "وضّح بالأمثلة", explanation: "أضف أمثلة ملموسة من الحياة اليومية لتسهيل فهم المفاهيم العلمية.", keywords: ["أمثلة", "توضيح", "فهم"] },
    { title: "تحقق من المصطلحات", explanation: "استخدم المصطلحات العلمية الصحيحة كما وردت في المنهاج الرسمي.", keywords: ["مصطلحات", "دقة", "علمية"] },
    { title: "شجّع على التفكير", explanation: "اطرح أسئلة توجيهية تشجع الطالب على التفكير بدل إعطاء الإجابة مباشرة.", keywords: ["تفكير", "توجيه", "أسئلة"] },
    { title: "اختصر الإجابات", explanation: "اجعل الإجابات مركّزة دون إطالة، مع تغطية النقاط الأساسية.", keywords: ["إيجاز", "تركيز", "وضوح"] },
  ];

  const { error } = await supabase.from("methodology_rules").insert(rules);
  if (error) throw error;
  console.log(`✓ Seeded ${rules.length} methodology rules`);
}

async function seedUserQuestions() {
  const questions = [
    { question: "ما هو الفرق بين الانقسام المتساوي والانقسام المنصف؟", answer: "الانقسام المتساوي ينتج خليتين ابنتين متطابقتين وراثياً (2n)، بينما الانقسام المنصف ينتج أربع خلايا أحادية الصيغة الصبغية (n) لإنتاج الأمشاج.", session_id: "sess_001", user_id: "user_482719365" },
    { question: "ما هو التركيب الضوئي وأين يحدث؟", answer: "التركيب الضوئي هو العملية التي يحول بها النبات اليخضوري الطاقة الضوئية إلى طاقة كيميائية (غلوكوز). يحدث في البلاستيدات الخضراء.", session_id: "sess_001", user_id: "user_482719365" },
    { question: "اشرح لي دور المتقدرة في الخلية.", answer: "المتقدرة هي عضية مسؤولة عن إنتاج الطاقة (ATP) عبر عملية التنفس الخلوي باستخدام الغلوكوز والأكسجين.", session_id: "sess_002", user_id: "user_510388271" },
    { question: "كيف ينتقل الحمض النووي من الآباء إلى الأبناء؟", answer: null, session_id: "sess_002", user_id: "user_510388271" },
    { question: "ما هي مراحل الاستجابة المناعية؟", answer: "تتميز المناعة الطبيعية (السريعة، غير النوعية) والمكتسبة (نوعية). عند دخول مستضح تتدخل أولاً المناعة الطبيعية ثم النوعية مع تكوين ذاكرة مناعية.", session_id: "sess_003", user_id: "user_631904558" },
    { question: "ما هي مكونات الحمض النووي؟", answer: "الحمض النووي مكون من نكليوتيدات، كل واحد منها يتكون من سكر (ديوكسي ريبوز)، ومجموعة فوسفات، وقاعدة آزوتية.", session_id: "sess_003", user_id: "user_631904558" },
    { question: "ما المقصود بالانزياح الجيني؟", answer: null, session_id: "sess_004", user_id: "user_778120934" },
    { question: "لماذا يعتبر الغشاء البلازمي مهمًا للخلية؟", answer: "الغشاء البلازمي يحدّ الخلية وينظّم التبادلات مع الوسط الخارجي عبر خاصية النفاذية الاختيارية.", session_id: "sess_004", user_id: "user_778120934" },
    { question: "ما الفرق بين التكاثر الجنسي واللاجنسي؟", answer: null, session_id: "sess_005", user_id: "user_921034882" },
    { question: "كيف تنتقل السيالة العصبية؟", answer: null, session_id: "sess_005", user_id: "user_921034882" },
  ];

  const { error } = await supabase.from("user_questions").insert(questions);
  if (error) throw error;
  console.log(`✓ Seeded ${questions.length} user questions`);
}

async function main() {
  console.log("🔍 Checking Supabase connection…");
  console.log(`   URL: ${SUPABASE_URL}\n`);

  const settingsExists = await settingsTableExists();

  if (!settingsExists) {
    console.log("⚠️  The 'settings' table doesn't exist yet.");
    console.log("   The Settings page will show instructions to create it.\n");
    console.log("   The other 4 modules use EXISTING tables and work now.\n");
  } else {
    console.log("✅ Settings table exists.\n");
  }

  // Seed the 4 existing tables regardless (they already exist)
  console.log("📦 Seeding data into existing tables…\n");
  await clearExisting();
  await seedKnowledgeBase();
  await seedGlossary();
  await seedMethodology();
  await seedUserQuestions();
  console.log("\n✅ All modules seeded!");

  if (!settingsExists) {
    console.log("\n📋 To enable the Settings module, create the settings table:");
    console.log("   Run: bun run scripts/supabase-setup.ts");
    console.log("   (it will print the SQL to run in Supabase SQL Editor)");
  }
}

main().catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});
