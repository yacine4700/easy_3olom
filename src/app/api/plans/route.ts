import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { created, ok, validate, serverError } from "@/lib/api";
import { z } from "zod";

const createPlanSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب").max(200),
  code: z.string().min(1, "الرمز مطلوب").max(50),
  description: z.string().max(500).nullable().optional(),
  price: z.number().min(0, "السعر يجب أن يكون موجباً"),
  durationDays: z.number().int().min(1, "المدة يجب أن تكون يوم واحد على الأقل"),
  active: z.boolean().default(true),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Re-use existing listPlans via a simple inline query
    const { supabase: sb } = await import("@/lib/supabase");
    let req = sb.from("plans").select("*", { count: "exact" });

    if (query.search) {
      req = req.or(`code.ilike.%${query.search}%,name.ilike.%${query.search}%`);
    }
    if (query.active === "true") req = req.eq("active", true);
    if (query.active === "false") req = req.eq("active", false);

    const ascending = query.sort === "oldest";
    const page = parseInt(query.page || "1", 10);
    const pageSize = parseInt(query.pageSize || "20", 10);
    req = req
      .order("created_at", { ascending, nullsFirst: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await req;
    if (error) throw error;
    return ok({ items: data, total: count ?? 0, page, pageSize });
  } catch (error) {
    console.error("[API] GET /api/plans failed:", error);
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const [parsed, errorResponse] = validate(createPlanSchema, body);
    if (errorResponse) return errorResponse;

    const { data, error } = await supabase
      .from("plans")
      .insert({
        name: parsed.name,
        code: parsed.code,
        description: parsed.description ?? null,
        price: parsed.price,
        duration_days: parsed.durationDays,
        active: parsed.active,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return created(data);
  } catch (error) {
    console.error("[API] POST /api/plans failed:", error);
    return serverError();
  }
}
