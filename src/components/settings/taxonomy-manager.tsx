"use client";

import * as React from "react";
import { Plus, Trash2, ChevronDown, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTaxonomy, useUpdateTaxonomy } from "@/hooks/queries/use-taxonomy";
import {
  LEVEL_LABELS,
  type EducationLevelKey,
  type TaxonomyData,
} from "@/lib/constants/taxonomy";

export function TaxonomyManager() {
  const { data: taxonomy, isLoading } = useTaxonomy();
  const updateMutation = useUpdateTaxonomy();

  const [activeLevel, setActiveLevel] =
    React.useState<EducationLevelKey>("3AS");
  const [expandedDomain, setExpandedDomain] = React.useState<string | null>(
    null,
  );

  // Local working copy
  const [local, setLocal] = React.useState<TaxonomyData | null>(null);

  React.useEffect(() => {
    if (taxonomy && !local) {
      setLocal(taxonomy);
    }
  }, [taxonomy, local]);

  if (isLoading || !local) {
    return <p className="text-muted-foreground text-sm">جارٍ التحميل…</p>;
  }

  const currentLevelData = local[activeLevel] ?? { domains: [], units: {} };

  function save(updated: TaxonomyData) {
    setLocal(updated);
    updateMutation.mutate(updated);
  }

  function addDomain() {
    const name = window.prompt("اسم المجال الجديد:");
    if (!name?.trim()) return;
    if (currentLevelData.domains.includes(name.trim())) {
      toast.error("المجال موجود مسبقاً");
      return;
    }
    const updated: TaxonomyData = {
      ...local,
      [activeLevel]: {
        domains: [...currentLevelData.domains, name.trim()],
        units: { ...currentLevelData.units, [name.trim()]: [] },
      },
    };
    save(updated);
  }

  function removeDomain(domain: string) {
    if (!window.confirm(`حذف المجال "${domain}"؟`)) return;
    const newDomains = currentLevelData.domains.filter((d) => d !== domain);
    const newUnits = { ...currentLevelData.units };
    delete newUnits[domain];
    save({
      ...local,
      [activeLevel]: { domains: newDomains, units: newUnits },
    });
    if (expandedDomain === domain) setExpandedDomain(null);
  }

  function addUnit(domain: string) {
    const name = window.prompt(`إضافة وحدة للمجال "${domain}":`);
    if (!name?.trim()) return;
    const existing = currentLevelData.units[domain] ?? [];
    if (existing.includes(name.trim())) {
      toast.error("الوحدة موجودة مسبقاً");
      return;
    }
    save({
      ...local,
      [activeLevel]: {
        ...currentLevelData,
        units: { ...currentLevelData.units, [domain]: [...existing, name.trim()] },
      },
    });
  }

  function removeUnit(domain: string, unit: string) {
    const existing = currentLevelData.units[domain] ?? [];
    save({
      ...local,
      [activeLevel]: {
        ...currentLevelData,
        units: {
          ...currentLevelData.units,
          [domain]: existing.filter((u) => u !== unit),
        },
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">تصنيف المعرفة</CardTitle>
        <p className="text-muted-foreground text-sm">
          المجالات والوحدات حسب المستوى الدراسي — تُستخدم كقوائم منسدلة في نموذج إضافة المعرفة
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level selector */}
        <div className="flex gap-2">
          {(Object.entries(LEVEL_LABELS) as [EducationLevelKey, string][]).map(
            ([val, label]) => (
              <Button
                key={val}
                variant={activeLevel === val ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveLevel(val)}
                className={cn(
                  activeLevel === val &&
                    "bg-brand text-brand-foreground hover:bg-brand/90",
                )}
              >
                {label}
              </Button>
            ),
          )}
        </div>

        {/* Domains list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">المجالات ({currentLevelData.domains.length})</Label>
            <Button variant="outline" size="sm" onClick={addDomain}>
              <Plus className="size-4" />
              مجال
            </Button>
          </div>

          {currentLevelData.domains.length === 0 ? (
            <p className="text-muted-foreground rounded-md border border-dashed py-6 text-center text-sm">
              لا توجد مجالات. اضغط "مجال" لإضافة مجال جديد.
            </p>
          ) : (
            <div className="space-y-1.5">
              {currentLevelData.domains.map((domain) => {
                const isExpanded = expandedDomain === domain;
                const units = currentLevelData.units[domain] ?? [];
                return (
                  <div
                    key={domain}
                    className="rounded-md border"
                  >
                    {/* Domain header */}
                    <div className="flex items-center justify-between p-2.5">
                      <button
                        type="button"
                        className="flex flex-1 items-center gap-2 text-start text-sm font-medium"
                        onClick={() =>
                          setExpandedDomain(isExpanded ? null : domain)
                        }
                      >
                        {isExpanded ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronLeft className="size-4" />
                        )}
                        {domain}
                        <span className="text-muted-foreground text-xs">
                          ({units.length} وحدة)
                        </span>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive size-7"
                        onClick={() => removeDomain(domain)}
                        aria-label="حذف المجال"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    {/* Units (expanded) */}
                    {isExpanded && (
                      <div className="border-t p-2.5 space-y-1.5">
                        {units.length === 0 ? (
                          <p className="text-muted-foreground py-2 text-center text-xs">
                            لا توجد وحدات
                          </p>
                        ) : (
                          units.map((unit) => (
                            <div
                              key={unit}
                              className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5"
                            >
                              <span className="text-sm">{unit}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive size-6"
                                onClick={() => removeUnit(domain, unit)}
                                aria-label="حذف الوحدة"
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          ))
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => addUnit(domain)}
                        >
                          <Plus className="size-3.5" />
                          إضافة وحدة
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
