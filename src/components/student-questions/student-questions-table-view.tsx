"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { MoreHorizontal, Trash2, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useStudentQuestionsTable,
  useDeleteStudentQuestionTable,
} from "@/hooks/queries/use-student-questions-table";
import type { StudentQuestionRecord } from "@/lib/services/student-questions-table";

export function StudentQuestionsTableView() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const [deleteTarget, setDeleteTarget] =
    React.useState<StudentQuestionRecord | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useStudentQuestionsTable(
    debouncedSearch,
    page,
    pageSize,
  );
  const deleteMutation = useDeleteStudentQuestionTable();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative max-w-sm">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث في الأسئلة أو الإجابات أو المواضيع…"
          className="h-9"
          aria-label="بحث"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[30%]">السؤال</TableHead>
              <TableHead>الإجابة</TableHead>
              <TableHead className="w-[100px]">الموضوع</TableHead>
              <TableHead className="w-[100px]">النوع</TableHead>
              <TableHead className="w-[100px]">نية الطالب</TableHead>
              <TableHead className="w-[120px]">التاريخ</TableHead>
              <TableHead className="w-[56px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full max-w-[16ch]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="align-top">
                    <p className="line-clamp-2 text-sm" dir="auto">
                      {item.question}
                    </p>
                  </TableCell>
                  <TableCell className="align-top">
                    {item.answer ? (
                      <p className="text-muted-foreground line-clamp-2 text-xs" dir="auto">
                        {item.answer}
                      </p>
                    ) : (
                      <span className="text-muted-foreground/60 text-xs italic">
                        لا توجد إجابة
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    {item.topic ? (
                      <Badge variant="outline" className="text-[10px]">
                        {item.topic}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    {item.questionType ? (
                      <Badge variant="secondary" className="text-[10px]">
                        {item.questionType}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    {item.studentIntent ? (
                      <span className="text-muted-foreground text-xs" dir="auto">
                        {item.studentIntent}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    {item.createdAt ? (
                      <span className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground size-8"
                          aria-label="إجراءات"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2 className="size-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-32">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <Inbox className="text-muted-foreground/50 size-7" />
                    <p className="text-muted-foreground text-sm">
                      لا توجد أسئلة
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > pageSize && (
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
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      )}

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
