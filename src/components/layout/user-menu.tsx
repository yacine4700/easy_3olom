import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Admin account menu.
 *
 * Phase 1: shows a placeholder admin profile. Once NextAuth is wired in,
 * replace the static identity with the session user and turn "Sign out"
 * into a real action.
 */
export function UserMenu() {
  const initials = "AD";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 px-1.5 pr-2 text-sm font-normal text-muted-foreground hover:text-foreground"
        >
          <Avatar className="size-7">
            <AvatarFallback className="bg-brand text-brand-foreground text-[11px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden truncate sm:inline">Admin</span>
          <ChevronsUpDown className="size-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56"
      >
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">Admin</span>
          <span className="text-xs font-normal text-muted-foreground">
            admin@easy3olom.dz
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
