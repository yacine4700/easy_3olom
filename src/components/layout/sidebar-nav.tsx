"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navConfig } from "@/config/navigation";
import { Badge } from "@/components/ui/badge";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

/**
 * Renders the full sidebar navigation from the central config.
 *
 * Active state is derived from the current pathname so the sidebar stays
 * in sync with routing without any per-page wiring.
 *
 * Disabled items (modules not yet built) render as inert buttons with a
 * "Soon" badge — they never navigate, so we avoid dead/404 routes.
 */
export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {navConfig.map((group) => (
        <SidebarGroup key={group.key}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                if (item.disabled) {
                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className="cursor-not-allowed opacity-55"
                        aria-disabled
                      >
                        <Icon />
                        <span>{item.title}</span>
                        {item.badge ? (
                          <Badge
                            variant="secondary"
                            className="ml-auto h-4 px-1.5 text-[10px] font-medium"
                          >
                            {item.badge}
                          </Badge>
                        ) : null}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className={cn(active && "text-sidebar-accent-foreground")}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
