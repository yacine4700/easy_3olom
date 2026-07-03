"use client";

import * as React from "react";

import { TermsTable } from "@/components/glossary/terms-table";
import {
  TermsTableToolbar,
  type TermsTableFilters,
} from "@/components/glossary/terms-table-toolbar";
import { TermDialog } from "@/components/glossary/term-dialog";
import { DeleteTermDialog } from "@/components/glossary/delete-term-dialog";
import { useGlossaryTerms } from "@/hooks/queries/use-glossary";
import type { GlossaryTerm } from "@/types/domain";

/**
 * Client orchestrator for the Glossary list view.
 * Owns filter state, create/edit/delete dialogs, and the data query.
 * Mirrors `KnowledgeBaseView` so the module pattern stays uniform.
 */
export function GlossaryView({
  initialItems,
}: {
  initialItems: GlossaryTerm[];
}) {
  const [filters, setFilters] = React.useState<TermsTableFilters>({
    search: "",
    level: "all",
    status: "all",
  });

  // Debounce search across both languages.
  const [debouncedSearch, setDebouncedSearch] = React.useState(filters.search);
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  const query = React.useMemo(
    () => ({
      search: debouncedSearch || undefined,
      level: filters.level === "all" ? undefined : filters.level,
      status: filters.status === "all" ? undefined : filters.status,
      page: 1,
      pageSize: 50,
    }),
    [debouncedSearch, filters.level, filters.status],
  );

  const { data, isLoading, isFetching } = useGlossaryTerms(query);
  const items = data?.items ?? initialItems;

  // Dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [activeTerm, setActiveTerm] = React.useState<GlossaryTerm | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  function openCreate() {
    setActiveTerm(null);
    setEditOpen(true);
  }
  function openEdit(term: GlossaryTerm) {
    setActiveTerm(term);
    setEditOpen(true);
  }
  function openDelete(term: GlossaryTerm) {
    setActiveTerm(term);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-4">
      <TermsTableToolbar
        filters={filters}
        onFiltersChange={setFilters}
        onNew={openCreate}
      />

      <div
        data-loading={isFetching && !isLoading}
        className="relative transition-opacity data-[loading=true]:opacity-70"
      >
        <TermsTable
          terms={items}
          isLoading={isLoading}
          actions={{ onEdit: openEdit, onDelete: openDelete }}
        />
      </div>

      <TermDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        term={activeTerm}
      />
      <DeleteTermDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        term={activeTerm}
      />
    </div>
  );
}
