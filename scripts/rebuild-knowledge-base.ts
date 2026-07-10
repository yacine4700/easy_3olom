import { Client } from "pg";

const url = "postgresql://postgres.zuuiyqqqzjaqxfbgsrnw:yacinkous93@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";
const client = new Client({ connectionString: url, connectionTimeoutMillis: 10000, ssl: { rejectUnauthorized: false } });
await client.connect();

// 1. Create table
await client.query(`
  CREATE TABLE IF NOT EXISTS knowledge_base (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    domain text,
    unit text,
    title text,
    keywords jsonb DEFAULT '[]',
    bot_instructions text DEFAULT '',
    content text DEFAULT '',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    chunk_ids jsonb DEFAULT '[]'
  )
`);
console.log("✅ تم إنشاء جدول knowledge_base");

// 2. Get grouped data from knowledge_chunks
const { rows: groups } = await client.query(`
  SELECT
    title,
    max(domain) as domain,
    max(unit) as unit,
    max(bot_instructions) as bot_instructions,
    string_agg(content, E'\n\n' ORDER BY id) as content,
    array_agg(id ORDER BY id) as chunk_ids
  FROM knowledge_chunks
  GROUP BY title
  ORDER BY min(id)
`);
console.log("العناوين الفريدة:", groups.length);

// 3. Insert each group into knowledge_base
let inserted = 0;
for (const g of groups) {
  // Get keywords from first chunk with this title
  const { rows: kwRows } = await client.query(
    "SELECT keywords FROM knowledge_chunks WHERE title = $1 LIMIT 1",
    [g.title]
  );
  const keywords = kwRows[0]?.keywords || [];

  const chunkIdsJson = JSON.stringify(g.chunk_ids);
  const keywordsJson = JSON.stringify(keywords);

  await client.query(
    "INSERT INTO knowledge_base (title, domain, unit, keywords, bot_instructions, content, chunk_ids) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7::jsonb)",
    [g.title, g.domain, g.unit, keywordsJson, g.bot_instructions || "", g.content, chunkIdsJson]
  );
  inserted++;
}
console.log("✅ تم إدراج", inserted, "صف");

// 4. Update knowledge_id in knowledge_chunks
const { rowCount } = await client.query(`
  UPDATE knowledge_chunks kc
  SET knowledge_id = kb.id
  FROM knowledge_base kb
  WHERE kc.title = kb.title
`);
console.log("✅ تم ربط", rowCount, "chunk");

// 5. Verify
const { rows: kbStats } = await client.query("SELECT count(*) as c FROM knowledge_base");
const { rows: chunkStats } = await client.query("SELECT count(knowledge_id) as linked, count(*) as total FROM knowledge_chunks");
console.log("\nknowledge_base:", kbStats[0].c, "صف");
console.log("knowledge_chunks:", chunkStats[0].linked, "/", chunkStats[0].total, "مرتبط");

const { rows: sample } = await client.query("SELECT title, chunk_ids, length(content) as content_len FROM knowledge_base ORDER BY jsonb_array_length(chunk_ids) DESC LIMIT 5");
console.log("\n=== عينة ===");
for (const r of sample) console.log(JSON.stringify({ title: r.title.slice(0, 40), chunk_ids: r.chunk_ids, content_length: r.content_len }));

await client.end();
