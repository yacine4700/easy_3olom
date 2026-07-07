import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware: refreshes the Supabase auth session on every request
 * and protects admin routes (redirects to /login if not authenticated).
 *
 * CRITICAL: must be defensive — if Supabase env vars are missing or the
 * auth call fails, the middleware must NOT throw (Vercel returns
 * MIDDLEWARE_INVOCATION_FAILED / 500). Instead, treat errors as "no user"
 * and let the (admin) layout handle the redirect.
 */
export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, skip auth — let the layout handle protection
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  const response = NextResponse.next({ request });

  let user = null;

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set({ name, value, ...options }),
            );
          } catch {
            // ignore cookie errors
          }
        },
      },
    });

    // Refresh the session (this also sets the cookies on the response)
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // If anything fails, treat as unauthenticated — don't crash the request
    user = null;
  }

  const { pathname } = request.nextUrl;

  // Protected routes: everything except /login, API routes, and static assets
  const isProtected =
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/logo.svg") &&
    !pathname.startsWith("/robots.txt");

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and visiting /login, redirect to /
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
