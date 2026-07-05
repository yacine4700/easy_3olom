import { NextResponse } from "next/server";
import { z, type ZodError } from "zod";

export function ok<T>(data: T) { return NextResponse.json(data); }
export function created<T>(data: T) { return NextResponse.json(data, { status: 201 }); }
export function noContent() { return new NextResponse(null, { status: 204 }); }
export function badRequest(message: string) { return NextResponse.json({ error: message }, { status: 400 }); }
export function notFound(message = "Not found") { return NextResponse.json({ error: message }, { status: 404 }); }
export function serverError(message = "Internal server error") { return NextResponse.json({ error: message }, { status: 500 }); }

export function validate<T>(schema: z.ZodType<T>, input: unknown): [T, null] | [null, NextResponse] {
  const result = schema.safeParse(input);
  if (result.success) return [result.data, null];
  return [null, NextResponse.json({ error: "Validation failed" }, { status: 400 })];
}
