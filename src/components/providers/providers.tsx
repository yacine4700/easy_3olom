"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/components/providers/theme-provider";

/**
 * Root client provider tree.
 *
 * Order matters:
 *  - ThemeProvider must wrap everything so `useTheme` works in the shell.
 *  - QueryClientProvider sits inside so server components can still render
 *    the shell markup before hydration.
 *
 * The QueryClient is created once per browser session via a ref so cache
 * is not shared across users on the server (safe by default in App Router).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Sensible defaults for an admin console: fresh for a bit,
            // no aggressive refetching that could hammer Supabase.
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
