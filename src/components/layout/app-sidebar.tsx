"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";

import { siteConfig } from "@/config/site";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";

/**
 * Application sidebar.
 *
 * - `collapsible="icon"`: collapses to an icon rail on desktop (Linear-like),
 *   becomes a Sheet on mobile automatically (handled by <Sidebar />).
 * - Header carries the brand; footer carries a lightweight status line.
 */
export function AppSidebar() {
  return (
    <Sidebar side="right" collapsible="icon" className="border-s">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip={siteConfig.name}
              className="hover:bg-sidebar-accent"
            >
              <Link href="/">
                <div className="bg-brand text-brand-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                  <Leaf className="size-4" />
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {siteConfig.name}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {siteConfig.subject}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        <SidebarNav />
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup className="p-0">
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <span className="inline-flex size-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span className="truncate group-data-[collapsible=icon]:hidden">
              n8n · Supabase متصل
            </span>
          </div>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
