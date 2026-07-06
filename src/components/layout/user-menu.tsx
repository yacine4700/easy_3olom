"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { toast } from "sonner";

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
import { createClient } from "@/lib/supabase/client";

/**
 * Admin account menu with real Supabase auth session.
 * Shows the logged-in user's email and provides sign-out.
 */
export function UserMenu() {
  const router = useRouter();
  const [email, setEmail] = React.useState<string>("");

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  const initials = email ? email[0].toUpperCase() : "؟";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج");
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 px-1.5 pe-2 text-sm font-normal text-muted-foreground hover:text-foreground"
        >
          <Avatar className="size-7">
            <AvatarFallback className="bg-brand text-brand-foreground text-[11px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden truncate sm:inline">المشرف</span>
          <ChevronsUpDown className="size-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56"
      >
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">المشرف</span>
          <span className="text-muted-foreground text-xs font-normal truncate" dir="ltr">
            {email || "—"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
