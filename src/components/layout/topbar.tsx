import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

/**
 * Top application bar.
 *
 * Deliberately minimal: collapse trigger, a command-style search (wired in a
 * later phase), theme toggle, and the admin menu. Page titles live in the
 * page content, not here — this matches the Linear / Supabase chrome pattern.
 */
export function Topbar() {
  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex h-14 w-full items-center gap-2 border-b pr-3 backdrop-blur-sm">
      <SidebarTrigger className="ml-2" />
      <Separator orientation="vertical" className="mr-1 h-5" />

      {/* Command-style search — decorative in Phase 1, becomes a real
          cmdk palette in a later phase. */}
      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Search knowledge base, questions…"
          className="bg-muted/50 border-transparent h-8 pl-8 text-sm shadow-none focus-visible:bg-background"
          aria-label="Search"
        />
      </div>

      {/* On mobile, a compact search icon keeps the bar uncluttered */}
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground sm:hidden"
        aria-label="Search"
      >
        <Search className="size-4" />
      </Button>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <Separator orientation="vertical" className="mx-1 h-5" />
        <UserMenu />
      </div>
    </header>
  );
}
