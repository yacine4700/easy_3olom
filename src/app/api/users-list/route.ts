import { listUsers } from "@/lib/services/subscriptions";
import { listUsersQuerySchema } from "@/lib/validators/subscriptions";
import { ok, serverError, validate } from "@/lib/api";

/**
 * GET /api/users-list
 *
 * READ-ONLY list of Telegram-bot users. Named `users-list` (not `users`) to
 * avoid colliding with Next.js / Supabase auth conventions on `/api/users`.
 *
 * Supports `search`, `status` (`active`/`blocked`), `sort`, `page`, `pageSize`.
 * No POST/PATCH/DELETE — users are created from the Telegram side.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const [parsed, errorResponse] = validate(listUsersQuerySchema, query);
    if (errorResponse) return errorResponse;

    return ok(await listUsers(parsed));
  } catch (error) {
    console.error("[API] GET /api/users-list failed:", error);
    return serverError();
  }
}
