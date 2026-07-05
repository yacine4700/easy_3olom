import { NextResponse } from "next/server";

import { getTaxonomy, updateTaxonomy } from "@/lib/services/taxonomy";
import { ok, serverError } from "@/lib/api";

export async function GET() {
  try {
    return ok(await getTaxonomy());
  } catch (error) {
    console.error("[API] GET /api/taxonomy failed:", error);
    return serverError();
  }
}

export async function PUT(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }
    return ok(await updateTaxonomy(body as never));
  } catch (error) {
    console.error("[API] PUT /api/taxonomy failed:", error);
    return serverError();
  }
}
