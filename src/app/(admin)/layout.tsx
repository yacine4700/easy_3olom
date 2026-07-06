"use client";

import { AppShell } from "@/components/layout/app-shell";

/**
 * Admin route group layout.
 *
 * Every page under `(admin)/` shares the application shell (sidebar + topbar
 * + footer). Keeping the shell here — instead of in the root layout — means
 * future unauthenticated surfaces (e.g. /login) can live outside this group
 * and render chrome-free.
 *
 * IMPORTANT: this layout MUST be a Client Component. When a Server Component
 * renders a Client Component tree that uses Radix (which relies on useId),
 * the Server→Client boundary shifts the useId tree between SSR and hydration,
 * causing a React 19 hydration mismatch on every Radix id. Making the layout
 * a Client Component eliminates the boundary.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
