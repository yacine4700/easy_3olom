"use client";

import * as React from "react";
import {
  CircleCheck,
  CircleX,
  Inbox,
  Loader2,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { usePlans } from "@/hooks/queries/use-subscriptions";
import { useCreatePlan, useUpdatePlan, useDeletePlan } from "@/hooks/queries/use-plans";
import { formatPrice } from "@/components/subscriptions/format";
import type { Plan } from "@/types/subscriptions";

type ActiveFilter = "all" | "true" | "false";
type SortOrder = "newest" | "oldest";

interface PlansFilters {
  search: string;
  active: ActiveFilter;
  sort: SortOrder;
}

const DEFAULT_FILTERS: PlansFilters = {
  search: "",
  active: "all",
  sort: "newest",
};

const PAGE_SIZE = 12;

const EMPTY_FORM = {
  name: "",
  code: "",
  description: "",
  price: "",
  durationDays: "",
  active: true,
};

export function PlansList() {
  const [filters, setFilters] = React.useState<PlansFilters>(DEFAULT_FILTERS);
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(PAGE_SIZE);
  const [editingPlan, setEditingPlan] = React.useState<Plan | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Plan | null>(null);

  const [debouncedSearch, setDebouncedSearch] = React.useState(filters.search);
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.active, filters.sort]);

  const query = React.useMemo(
    () => ({
      search: debouncedSearch || undefined,
      active: filters.active === "all" ? undefined : filters.active === "true",
      sort: filters.sort,
      page,
      pageSize,
    }),
    [debouncedSearch, filters.active, filters.sort, page, pageSize],
  );

  const { data, isLoading, isFetching } = usePlans(query);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  function update(patch: Partial<PlansFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function reset() {
    setFilters(DEFAULT_FILTERS);
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.active !== "all" ||
    filters.sort !== "newest";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative max-w-xs flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2" />
          <Input
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="بحث برمز الخطة أو اسمها…"
            className="h-9 ps-8"
            aria-label="بحث في الخطط"
          />
        </div>

        <Select
          value={filters.active}
          onValueChange={(v) => update({ active: v as ActiveFilter })}
        >
          <SelectTrigger className="h-9 w-full sm:w-[140px]" aria-label="تصفية حسب الحالة">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الخطط</SelectItem>
            <SelectItem value="true">نشطة</SelectItem>
            <SelectItem value="false">غير نشطة</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={(v) => update({ sort: v as SortOrder })}
        >
          <SelectTrigger className="h-9 w-full sm:w-[140px]" aria-label="ترتيب">
            <SelectValue placeholder="ترتيب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">الأحدث أولًا</SelectItem>
            <SelectItem value="oldest">الأقدم أولًا</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-9 text-muted-foreground" onClick={reset}>
            <X className="size-4" />
            مسح
          </Button>
        )}

        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-brand text-brand-foreground hover:bg-brand/90 h-9 shrink-0"
        >
          <Plus className="size-4" />
          إضافة خطة
        </Button>
      </div>

      {/* Cards grid */}
      <div
        data-loading={isFetching && !isLoading}
        className="relative transition-opacity data-[loading=true]:opacity-70"
      >
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
            <Inbox className="text-muted-foreground/50 size-8" />
            <p className="text-muted-foreground text-sm">لا توجد خطط</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={() => setEditingPlan(plan)}
                onDelete={() => setDeleteTarget(plan)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>صفحة {page} من {totalPages} — إجمالي {total} خطة</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              السابق
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              التالي
            </Button>
          </div>
        </div>
      )}

      {/* Create dialog */}
      <CreatePlanDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      {/* Edit dialog */}
      <EditPlanDialog plan={editingPlan} onClose={() => setEditingPlan(null)} />

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الخطة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف &quot;{deleteTarget?.name}&quot; نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <DeletePlanAction
              plan={deleteTarget}
              onDone={() => setDeleteTarget(null)}
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Plan Card ───────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: Plan;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="hover:border-border/80 gap-0 overflow-hidden py-0 transition-colors">
      <CardContent className="space-y-4 p-5">
        {/* Header: name + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-brand/10 text-brand flex size-9 items-center justify-center rounded-lg">
              <Tag className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold">{plan.name}</h3>
              <p className="text-muted-foreground font-mono text-[10px] uppercase">{plan.code}</p>
            </div>
          </div>
          <ActiveBadge active={plan.active} />
        </div>

        {/* Price + duration */}
        <div className="flex items-end justify-between gap-2 border-y py-3">
          <div>
            <p className="text-2xl font-bold tabular-nums">
              {formatPrice(plan.price, plan.currency)}
            </p>
          </div>
          <div className="text-end">
            <p className="text-muted-foreground text-sm">
              {plan.durationDays} يومًا
            </p>
          </div>
        </div>

        {/* Description */}
        {plan.description ? (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {plan.description}
          </p>
        ) : null}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Pencil className="size-3.5" />
            تعديل
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="outline" className="gap-1 border-transparent bg-emerald-500/15 font-medium text-emerald-700 dark:text-emerald-400">
      <CircleCheck className="size-3" />
      نشطة
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1 border-transparent bg-zinc-500/15 font-medium text-zinc-600 dark:text-zinc-300">
      <CircleX className="size-3" />
      غير نشطة
    </Badge>
  );
}

// ── Shared form fields ─────────────────────────────────────────────────────

function PlanFormFields({
  form,
  setForm,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="plan-name">اسم الخطة</Label>
        <Input
          id="plan-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan-code">الرمز</Label>
        <Input
          id="plan-code"
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          className="font-mono uppercase"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plan-price">السعر (DZD)</Label>
          <Input
            id="plan-price"
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="plan-duration">المدة (أيام)</Label>
          <Input
            id="plan-duration"
            type="number"
            min={1}
            value={form.durationDays}
            onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan-desc">الوصف</Label>
        <Textarea
          id="plan-desc"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={2}
          placeholder="وصف الخطة (اختياري)"
        />
      </div>

      <div className="flex items-center justify-between rounded-md border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="plan-active" className="text-sm">الخطة نشطة</Label>
          <p className="text-muted-foreground text-xs">عند التعطيل لن تظهر للمستخدمين</p>
        </div>
        <Switch
          id="plan-active"
          checked={form.active}
          onCheckedChange={(checked) => setForm((f) => ({ ...f, active: checked }))}
        />
      </div>
    </>
  );
}

// ── Create Plan Dialog ──────────────────────────────────────────────────────

function CreatePlanDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMutation = useCreatePlan();
  const [form, setForm] = React.useState(EMPTY_FORM);

  React.useEffect(() => {
    if (open) setForm(EMPTY_FORM);
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate(
      {
        name: form.name,
        code: form.code,
        description: form.description || null,
        price: Number(form.price),
        durationDays: Number(form.durationDays),
        active: form.active,
      },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة خطة جديدة</DialogTitle>
          <DialogDescription>أدخل بيانات الخطة الجديدة.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PlanFormFields form={form} setForm={setForm} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              إنشاء الخطة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Plan Dialog ────────────────────────────────────────────────────────

function EditPlanDialog({ plan, onClose }: { plan: Plan | null; onClose: () => void }) {
  const open = plan !== null;
  const updateMutation = useUpdatePlan();

  const [form, setForm] = React.useState(EMPTY_FORM);

  React.useEffect(() => {
    if (plan) {
      setForm({
        name: plan.name ?? "",
        code: plan.code ?? "",
        description: plan.description ?? "",
        price: String(plan.price ?? ""),
        durationDays: String(plan.durationDays ?? ""),
        active: plan.active,
      });
    }
  }, [plan]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!plan) return;

    updateMutation.mutate(
      {
        id: plan.id,
        input: {
          name: form.name,
          code: form.code,
          description: form.description || null,
          price: Number(form.price),
          durationDays: Number(form.durationDays),
          active: form.active,
        },
      },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل الخطة</DialogTitle>
          <DialogDescription>تعديل بيانات الخطة مباشرة في قاعدة البيانات.</DialogDescription>
        </DialogHeader>

        {plan && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <PlanFormFields form={form} setForm={setForm} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-brand text-brand-foreground hover:bg-brand/90"
              >
                {updateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Plan Action ───────────────────────────────────────────────────────

function DeletePlanAction({ plan, onDone }: { plan: Plan | null; onDone: () => void }) {
  const deleteMutation = useDeletePlan();

  return (
    <AlertDialogAction
      className="bg-destructive text-white hover:bg-destructive/90"
      disabled={deleteMutation.isPending || !plan}
      onClick={() => {
        if (plan) {
          deleteMutation.mutate(plan.id, { onSuccess: () => onDone() });
        }
      }}
    >
      {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
      <Trash2 className="size-4" />
      حذف
    </AlertDialogAction>
  );
}
