import { NextResponse } from "next/server";
import { z, type ZodError } from "zod";

/**
 * Tiny helpers for API route handlers.
 * Keeps route files focused on orchestration, not boilerplate.
 */

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Resource not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

/** Format a ZodError into a field->messages map for the client. */
export function formatZodError(error: ZodError) {
  return error.issues.reduce<Record<string, string[]>>((acc, issue) => {
    const key = issue.path.join(".") || "_";
    (acc[key] ??= []).push(issue.message);
    return acc;
  }, {});
}

/** Validate `input` against `schema`; returns [data, null] or [null, response]. */
export function validate<T>(
  schema: z.ZodType<T>,
  input: unknown,
): [T, null] | [null, NextResponse] {
  const result = schema.safeParse(input);
  if (result.success) return [result.data, null];
  return [
    null,
    NextResponse.json(
      { error: "Validation failed", fields: formatZodError(result.error) },
      { status: 400 },
    ),
  ];
}
