import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  disabled?: boolean;
  badge?: string;
}

/**
 * Preview card for a single upcoming/active module on the dashboard.
 * Disabled modules render as inert cards (no navigation) to avoid dead links.
 */
export function ModuleCard({
  title,
  description,
  icon: Icon,
  href,
  disabled,
  badge,
}: ModuleCardProps) {
  const content = (
    <CardContent className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-md",
            disabled
              ? "bg-muted text-muted-foreground"
              : "bg-brand/10 text-brand",
          )}
        >
          <Icon className="size-4.5" />
        </div>
        {badge ? (
          <Badge variant="outline" className="text-muted-foreground font-medium">
            {badge}
          </Badge>
        ) : (
          <Badge className="bg-brand/10 text-brand font-medium hover:bg-brand/10">
            مفعّل
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {description}
        </p>
      </div>
      {!disabled && (
        <div className="text-muted-foreground mt-auto flex items-center gap-1 text-xs">
          فتح
          <ArrowUpRight className="size-3.5" />
        </div>
      )}
    </CardContent>
  );

  if (disabled) {
    return (
      <Card className="opacity-70 transition-opacity">{content}</Card>
    );
  }

  return (
    <Link href={href} className="block">
      <Card className="transition-colors hover:border-border/80 hover:bg-muted/30">
        {content}
      </Card>
    </Link>
  );
}
