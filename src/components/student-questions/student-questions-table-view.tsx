"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Search,
  Inbox,
  Trash2,
  ChevronRight,
  ChevronLeft,
  X,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import {
  useStudentQuestionsTable,
  useDeleteStudentQuestionTable,
} from "@/hooks/queries/use-student-questions-table";
import type { StudentQuestionRecord } from "@/lib/services/student-questions-table";

const PAGE_SIZE = 12;

export function StudentQuestionsTableView() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [questionType, setQuestionType] = React.useState<string>("all");
  const [topic, setTopic] = React.useState<string>("all");
  const [studentIntent, setStudentIntent] = React.useState<string>("all");
  const [sort, setSort] = React.useState<"newest" | "oldest">("newest");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] =
    React.useState<StudentQuestionRecord | null>(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<StudentQuestionRecord | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [questionType, topic, studentIntent, sort]);

  const { data, isLoading } = useStudentQuestionsTable({
    search: debouncedSearch || undefined,
    questionType: questionType !== "all" ? questionType : undefined,
    topic: topic !== "all" ? topic : undefined,
    studentIntent: studentIntent !== "all" ? studentIntent : undefined,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });
  const deleteMutation = useDeleteStudentQuestionTable();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  // Extract unique values for filter dropdowns from current page items
  // (these are client-side derived from the current page — for a production
  // app you'd fetch distinct values from the server, but this is simple
  // and works well for small-medium datasets)
  const types = React.useMemo(
    () => [...new Set(items.map((i) => i.questionType).filter(Boolean))] as string[],
    [items],
  );
  const topics = React.useMemo(
    () => [...new Set(items.map((i) => i.topic).filter(Boolean))] as string[],
    [items],
  );
  const intents = React.useMemo(
    () => [...new Set(items.map((i) => i.studentIntent).filter(Boolean))] as string[],
    [items],
  );

  function preview(text: string, max = 120): string {
    if (text.length <= max) return text;
    return text.slice(0, max).trimEnd() + "…";
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: Search + Filters + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في الأسئلة…"
            className="h-9 ps-8"
            aria-label="بحث"
          />
        </div>

        <Select value={questionType} onValueChange={setQuestionType}>
          <SelectTrigger className="h-9 w-full sm:w-[140px]">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            {types.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger className="h-9 w-full sm:w-[140px]">
            <SelectValue placeholder="الموضوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المواضيع</SelectItem>
            {topics.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={studentIntent} onValueChange={setStudentIntent}>
          <SelectTrigger className="h-9 w-full sm:w-[140px]">
            <SelectValue placeholder="نية الطالب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل النيات</SelectItem>
            {intents.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as "newest" | "oldest")}>
          <SelectTrigger className="h-9 w-full sm:w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">الأحدث</SelectItem>
            <SelectItem value="oldest">الأقدم</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={`skeleton-${i}`}>
              <CardContent className="space-y-2 p-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16">
          <Inbox className="text-muted-foreground/50 size-8" />
          <p className="text-muted-foreground text-sm">لا توجد أسئلة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="hover:border-border/80 cursor-pointer transition-colors hover:bg-muted/20"
              onClick={() => setSelected(item)}
            >
              <CardContent className="space-y-2 p-4">
                {/* Topic as title */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {item.topic || "بدون موضوع"}
                  </span>
                  {item.createdAt && (
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </span>
                  )}
                </div>

                {/* Type + Intent badges */}
                <div className="flex flex-wrap gap-1.5">
                  {item.questionType && (
                    <Badge variant="outline" className="text-[10px]">
                      {item.questionType}
                    </Badge>
                  )}
                  {item.studentIntent && (
                    <Badge variant="secondary" className="text-[10px]">
                      {item.studentIntent}
                    </Badge>
                  )}
                </div>

                {/* Question preview */}
                <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed" dir="auto">
                  {preview(item.question)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>
            صفحة {page} من {totalPages} — إجمالي {total} سؤال
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronRight className="size-4" />
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              التالي
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Sheet (Drawer) */}
      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto scrollbar-thin">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-start">
                  {selected.topic || "بدون موضوع"}
                </SheetTitle>
                <SheetDescription className="text-start">
                  تفاصيل السؤال
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 p-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {selected.questionType && (
                    <Badge variant="outline">{selected.questionType}</Badge>
                  )}
                  {selected.studentIntent && (
                    <Badge variant="secondary">{selected.studentIntent}</Badge>
                  )}
                </div>

                {/* Question */}
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs font-medium">السؤال</p>
                  <div className="bg-muted/40 rounded-md border p-3">
                    <p className="text-sm leading-relaxed" dir="auto">
                      {selected.question}
                    </p>
                  </div>
                </div>

                {/* Answer */}
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs font-medium">الجواب</p>
                  {selected.answer ? (
                    <div className="bg-muted/40 rounded-md border p-3">
                      <p className="text-sm leading-relaxed" dir="auto">
                        {selected.answer}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground/60 text-sm italic">
                      لا توجد إجابة
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div className="space-y-2 border-t pt-3">
                  {selected.userId && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">المستخدم</span>
                      <span className="font-mono" dir="ltr">{selected.userId}</span>
                    </div>
                  )}
                  {selected.sessionId && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Session ID</span>
                      <span className="font-mono text-xs" dir="ltr">{selected.sessionId}</span>
                    </div>
                  )}
                  {selected.createdAt && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">التاريخ</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDistanceToNow(new Date(selected.createdAt), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive w-full"
                  onClick={() => {
                    setDeleteTarget(selected);
                    setSelected(null);
                  }}
                >
                  <Trash2 className="size-4" />
                  حذف السؤال
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف السؤال؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا السؤال نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
