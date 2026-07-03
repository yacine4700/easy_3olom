import { AppShell } from "@/components/layout/app-shell";

/**
 * Admin route group layout.
 *
 * Every page under `(admin)/` shares the application shell (sidebar + topbar
 * + footer). Keeping the shell here — instead of in the root layout — means
 * future unauthenticated surfaces (e.g. /login) can live outside this group
 * and render chrome-free.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
