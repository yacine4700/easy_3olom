"use client";

import * as React from "react";
import { Plus, Trash2, ChevronDown, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

  // Dialog state for adding domain
  const [domainDialogOpen, setDomainDialogOpen] = React.useState(false);
  const [newDomainName, setNewDomainName] = React.useState("");

  // Dialog state for adding unit
  const [unitDialogOpen, setUnitDialogOpen] = React.useState(false);
  const [unitDialogDomain, setUnitDialogDomain] = React.useState<string | null>(
    null,
  );
  const [newUnitName, setNewUnitName] = React.useState("");

  // Alert dialog for deleting domain
  const [deleteDomainAlert, setDeleteDomainAlert] = React.useState<
    string | null
  >(null);

  // Alert dialog for deleting unit
  const [deleteUnitAlert, setDeleteUnitAlert] = React.useState<
    { domain: string; unit: string } | null
  >(null);

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

  function handleAddDomain() {
    const name = newDomainName.trim();
    if (!name) return;
    if (currentLevelData.domains.includes(name)) {
      return; // duplicate — could show toast
    }
    const updated: TaxonomyData = {
      ...local,
      [activeLevel]: {
        domains: [...currentLevelData.domains, name],
        units: { ...currentLevelData.units, [name]: [] },
      },
    };
    save(updated);
    setNewDomainName("");
    setDomainDialogOpen(false);
  }

  function handleRemoveDomain(domain: string) {
    const newDomains = currentLevelData.domains.filter((d) => d !== domain);
    const newUnits = { ...currentLevelData.units };
    delete newUnits[domain];
    save({
      ...local,
      [activeLevel]: { domains: newDomains, units: newUnits },
    });
    if (expandedDomain === domain) setExpandedDomain(null);
    setDeleteDomainAlert(null);
  }

  function handleAddUnit() {
    if (!unitDialogDomain) return;
    const name = newUnitName.trim();
    if (!name) return;
    const existing = currentLevelData.units[unitDialogDomain] ?? [];
    if (existing.includes(name)) return;
    save({
      ...local,
      [activeLevel]: {
        ...currentLevelData,
        units: {
          ...currentLevelData.units,
          [unitDialogDomain]: [...existing, name],
        },
      },
    });
    setNewUnitName("");
    setUnitDialogOpen(false);
    setUnitDialogDomain(null);
  }

  function handleRemoveUnit(domain: string, unit: string) {
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
    setDeleteUnitAlert(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">تصنيف المعرفة</CardTitle>
        <p className="text-muted-foreground text-sm">
          المجالات والوحدات حسب المستوى الدراسي — تُستخدم كقوائم منسدلة في
          نموذج إضافة المعرفة
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level selector */}
        <div className="flex gap-2">
          {(
            Object.entries(LEVEL_LABELS) as [EducationLevelKey, string][]
          ).map(([val, label]) => (
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
          ))}
        </div>

        {/* Domains list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">
              المجالات ({currentLevelData.domains.length})
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNewDomainName("");
                setDomainDialogOpen(true);
              }}
            >
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
                  <div key={domain} className="rounded-md border">
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
                        onClick={() => setDeleteDomainAlert(domain)}
                        aria-label="حذف المجال"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    {/* Units (expanded) */}
                    {isExpanded && (
                      <div className="space-y-1.5 border-t p-2.5">
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
                                onClick={() =>
                                  setDeleteUnitAlert({ domain, unit })
                                }
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
                          onClick={() => {
                            setUnitDialogDomain(domain);
                            setNewUnitName("");
                            setUnitDialogOpen(true);
                          }}
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

      {/* Add Domain Dialog */}
      <Dialog open={domainDialogOpen} onOpenChange={setDomainDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>إضافة مجال جديد</DialogTitle>
            <DialogDescription>
              أدخل اسم المجال للمستوى: {LEVEL_LABELS[activeLevel]}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-domain">اسم المجال</Label>
            <Input
              id="new-domain"
              value={newDomainName}
              onChange={(e) => setNewDomainName(e.target.value)}
              placeholder="مثال: التخصص الوظيفي للبروتينات"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddDomain();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDomainDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleAddDomain}
              disabled={!newDomainName.trim()}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Unit Dialog */}
      <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>إضافة وحدة جديدة</DialogTitle>
            <DialogDescription>
              {unitDialogDomain
                ? `أدخل اسم الوحدة للمجال: ${unitDialogDomain}`
                : "أدخل اسم الوحدة"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-unit">اسم الوحدة</Label>
            <Input
              id="new-unit"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="مثال: التركيب الضوئي"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddUnit();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnitDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleAddUnit}
              disabled={!newUnitName.trim()}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Domain Confirmation */}
      <AlertDialog
        open={deleteDomainAlert !== null}
        onOpenChange={(open) => !open && setDeleteDomainAlert(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المجال؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المجال &quot;{deleteDomainAlert}&quot; وجميع وحداته. لا
              يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() =>
                deleteDomainAlert && handleRemoveDomain(deleteDomainAlert)
              }
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Unit Confirmation */}
      <AlertDialog
        open={deleteUnitAlert !== null}
        onOpenChange={(open) => !open && setDeleteUnitAlert(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الوحدة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الوحدة &quot;{deleteUnitAlert?.unit}&quot; من المجال
              &quot;{deleteUnitAlert?.domain}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() =>
                deleteUnitAlert &&
                handleRemoveUnit(deleteUnitAlert.domain, deleteUnitAlert.unit)
              }
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
