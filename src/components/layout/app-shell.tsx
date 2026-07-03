import { siteConfig } from "@/config/site";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/**
 * Application shell: sidebar + inset (topbar, content, footer).
 *
 * This is the single place that wires the chrome together so every page
 * only has to provide its own content. It is a Server Component on purpose;
 * the interactive pieces (sidebar, topbar controls) are client islands.
 *
 * Footer is pinned to the bottom on short pages (content wrapper is flex-1)
 * and pushed down naturally on long pages.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <div className="flex flex-1 flex-col">
          <div className="flex-1 p-4 md:p-6">{children}</div>

          <footer className="border-t">
            <div className="text-muted-foreground flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs sm:flex-row md:px-6">
              <p>
                © {new Date().getFullYear()} {siteConfig.name} · v0.1.0
              </p>
              <p className="flex flex-wrap items-center justify-center gap-1.5">
                {siteConfig.stack.map((tech, i) => (
                  <span key={tech} className="flex items-center gap-1.5">
                    {i > 0 && <span className="opacity-40">·</span>}
                    <span>{tech}</span>
                  </span>
                ))}
              </p>
            </div>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
