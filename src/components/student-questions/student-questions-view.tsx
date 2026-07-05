"use client";

import * as React from "react";

import { QuestionsTable } from "@/components/student-questions/questions-table";
import {
  QuestionsTableToolbar,
  type QuestionsTableFilters,
} from "@/components/student-questions/questions-table-toolbar";
import { AnswerDialog } from "@/components/student-questions/answer-dialog";
import { DeleteQuestionDialog } from "@/components/student-questions/delete-question-dialog";
import { useStudentQuestions } from "@/hooks/queries/use-student-question";
import type { StudentQuestion } from "@/types/domain";

/**
 * Client orchestrator for the Student Questions list view.
 * Owns filter state (search + status), the edit-answer + delete dialogs,
 * and the data query. Questions arrive via Telegram — there is no create
 * flow from this admin UI.
 */
export function StudentQuestionsView({
  initialItems,
}: {
  initialItems: StudentQuestion[];
}) {
  const [filters, setFilters] = React.useState<QuestionsTableFilters>({
    search: "",
    status: "all",
  });

  // Debounce search across question + answer text.
  const [debouncedSearch, setDebouncedSearch] = React.useState(filters.search);
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  const query = React.useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: filters.status === "all" ? undefined : filters.status,
      page: 1,
      pageSize: 50,
    }),
    [debouncedSearch, filters.status],
  );

  const { data, isLoading, isFetching } = useStudentQuestions(query);
  const items = data?.items ?? initialItems;

  // Dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [active, setActive] = React.useState<StudentQuestion | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  function openEdit(question: StudentQuestion) {
    setActive(question);
    setEditOpen(true);
  }
  function openDelete(question: StudentQuestion) {
    setActive(question);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-4">
      <QuestionsTableToolbar
        filters={filters}
        onFiltersChange={setFilters}
      />

      <div
        data-loading={isFetching && !isLoading}
        className="relative transition-opacity data-[loading=true]:opacity-70"
      >
        <QuestionsTable
          questions={items}
          isLoading={isLoading}
          actions={{ onEdit: openEdit, onDelete: openDelete }}
        />
      </div>

      <AnswerDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        question={active}
      />
      <DeleteQuestionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        question={active}
      />
    </div>
  );
}
