/**
 * Thin fetch wrapper used by client data hooks.
 *
 * Centralises JSON parsing + error normalisation so every hook can
 * `throw` on failure and let TanStack Query handle retries/loading state.
 */
export class ApiError extends Error {
  status: number;
  fields?: Record<string, string[]>;

  constructor(message: string, status: number, fields?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

export async function fetchJson<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let body: { error?: string; fields?: Record<string, string[]> } | null = null;
    try {
      body = await res.json();
    } catch {
      /* ignore parse errors */
    }
    throw new ApiError(
      body?.error ?? `Request failed (${res.status})`,
      res.status,
      body?.fields,
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
