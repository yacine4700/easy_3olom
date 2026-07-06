"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("فشل تسجيل الدخول: " + error.message);
      setLoading(false);
      return;
    }

    toast.success("تم تسجيل الدخول بنجاح");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="bg-muted/30 flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="bg-brand text-brand-foreground flex size-12 items-center justify-center rounded-xl">
            <Leaf className="size-6" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">إيزي علوم — لوحة التحكم</h1>
            <p className="text-muted-foreground text-sm">علوم الطبيعة والحياة</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-background space-y-4 rounded-xl border p-6 shadow-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="ps-9"
                required
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="ps-9"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-brand text-brand-foreground hover:bg-brand/90 w-full"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            تسجيل الدخول
          </Button>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-xs">
          لوحة تحكم خاصة بالمشرفين فقط
        </p>
      </div>
    </div>
  );
}
