import { NextResponse } from "next/server";

import { getAllSettings, updateSettings } from "@/lib/services/settings";
import { updateSettingsSchema } from "@/lib/validators/settings";
import { ok, validate, serverError } from "@/lib/api";

/** GET /api/settings — return all settings grouped by group. */
export async function GET() {
  try {
    return ok(await getAllSettings());
  } catch (error) {
    console.error("[API] GET /api/settings failed:", error);
    return serverError();
  }
}

/**
 * PUT /api/settings
 * Update multiple settings at once (keys that are masked or empty for
 * secret fields are skipped by the service).
 */
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

    const [parsed, errorResponse] = validate(updateSettingsSchema, body);
    if (errorResponse) return errorResponse;

    return ok(await updateSettings(parsed));
  } catch (error) {
    console.error("[API] PUT /api/settings failed:", error);
    return serverError();
  }
}
