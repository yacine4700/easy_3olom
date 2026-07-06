# إيزي علوم — لوحة التحكم

لوحة تحكم لإدارة قاعدة المعرفة الخاصة بمساعد ذكي (RAG) لمادة علوم الطبيعة والحياة في التعليم الثانوي الجزائري.

## المميزات

- **قاعدة المعرفة** — إدارة الوثائق المصدرية (تربط مع n8n عبر webhook)
- **المعجم** — مصطلحات وتعريفات المجال
- **القواعد المنهاجية** — قواعد توجيه المساعد الذكي
- **أسئلة الطلاب** — الأسئلة الواردة عبر تيليجرام
- **التحليلات** — إحصائيات ومخططات
- **الإعدادات** — رابط Webhook + إدارة المجالات والوحدات حسب المستوى

## التقنيات

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (قاعدة البيانات)
- TanStack Query + TanStack Table
- React Hook Form + Zod
- Recharts

## البدء

### 1. تثبيت الحزم

```bash
bun install
```

### 2. إعداد المتغيرات البيئية

انسخ `.env.example` إلى `.env` وأدخل بيانات Supabase:

```bash
cp .env.example .env
```

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. جداول Supabase المطلوبة

التطبيق يستخدم الجداول الموجودة في مشروع Supabase:

| الجدول | الاستخدام |
|--------|-----------|
| `knowledge_base` | وثائق المعرفة |
| `glossary` | مصطلحات المعجم |
| `methodology_rules` | القواعد المنهاجية |
| `user_questions` | أسئلة الطلاب |
| `settings` | إعدادات التطبيق (يجب إنشاؤها) |

لإنشاء جدول `settings`:

```sql
CREATE TABLE IF NOT EXISTS settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  value      TEXT NOT NULL DEFAULT '',
  secret     BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
```

### 4. التشغيل

```bash
bun run dev
```

التطبيق يعمل على `http://localhost:3000`

## المعمارية

### تدفق البيانات

```
القراءة (List/Get/Stats) → Supabase مباشرة
الكتابة (Create/Update/Delete) → Webhook فقط (n8n يتولى DB + RAG)
الإعدادات + إجابات الأسئلة → Supabase مباشرة
```

### Webhook

عند إضافة/تعديل/حذف معرفة أو مصطلح أو قاعدة، يُرسل التطبيق POST إلى رابط الـ webhook المُضبوط في الإعدادات:

```json
{
  "entity": "knowledge",
  "action": "create",
  "data": {
    "level": "3AS",
    "domain": "...",
    "unit": "...",
    "title": "...",
    "content": "...",
    "keywords": "كلمة1، كلمة2",
    "bot_instructions": ""
  }
}
```

للحذف:

```json
{
  "entity": "knowledge",
  "action": "delete",
  "id": "15"
}
```

## الترخيص

خاص — © إيزي علوم
