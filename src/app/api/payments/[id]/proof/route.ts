import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id || id.length >= 64) {
      return NextResponse.json(
        { error: "Invalid payment id" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!API_URL) {
      return NextResponse.json(
        { error: "API URL is not configured" },
        { status: 500 },
      );
    }

    const response = await fetch(
      `${API_URL}/payments/id/${encodeURIComponent(id)}/proof`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const text = await response.text();

      return NextResponse.json(
        {
          error:
            text || "Failed to retrieve payment proof",
        },
        { status: response.status },
      );
    }

    const contentType =
      response.headers.get("content-type") ??
      "application/octet-stream";

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error(
      "[API] GET /api/payments/[id]/proof failed:",
      error,
    );

    return NextResponse.json(
      { error: "Failed to retrieve payment proof" },
      { status: 500 },
    );
  }
}
