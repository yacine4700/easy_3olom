"use client";

import * as React from "react";
import { Check, Eye, EyeOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface SettingFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  secret?: boolean;
  placeholder?: string;
  help?: string;
  hasValue?: boolean;
}

/**
 * A single labeled setting input.
 *
 * Client Component — owns the password-reveal state for secret fields. The
 * "مُعدّ" (Configured) badge surfaces when the field has a stored value so the
 * admin can tell at a glance which secrets are already provisioned without
 * ever revealing the value itself.
 */
export function SettingField({
  label,
  value,
  onChange,
  secret,
  placeholder,
  help,
  hasValue,
}: SettingFieldProps) {
  const [revealed, setRevealed] = React.useState(false);
  const inputType = secret && !revealed ? "password" : "text";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        {hasValue ? (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 gap-1 font-medium text-emerald-700 dark:text-emerald-400"
          >
            <Check className="size-3" />
            مُعدّ
          </Badge>
        ) : null}
      </div>
      <div className="relative">
        <Input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir="auto"
          className={cn(secret && "pe-10")}
          autoComplete="off"
          spellCheck={false}
        />
        {secret ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            tabIndex={-1}
            aria-label={revealed ? "إخفاء القيمة" : "إظهار القيمة"}
            onClick={() => setRevealed((r) => !r)}
            className="absolute end-1 top-1/2 size-7 -translate-y-1/2 text-muted-foreground"
          >
            {revealed ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
        ) : null}
      </div>
      {help ? (
        <p className="text-muted-foreground text-xs leading-relaxed">
          {help}
        </p>
      ) : null}
    </div>
  );
}
