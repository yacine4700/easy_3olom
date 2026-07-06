"use client";

import * as React from "react";

import { MethodologyTable } from "@/components/methodology/methodology-table";
import {
  MethodologyTableToolbar,
  type MethodologyTableFilters,
} from "@/components/methodology/methodology-table-toolbar";
import { MethodologyDialog } from "@/components/methodology/methodology-dialog";
import { DeleteMethodologyDialog } from "@/components/methodology/delete-methodology-dialog";
import { useMethodologies } from "@/hooks/queries/use-methodology";
import type { Methodology } from "@/types/domain";

/**
 * Client orchestrator for the Methodology list view.
 * Search-only filters; debounced text search drives the server query.
 */
export function MethodologyView({
  initialItems,
}: {
  initialItems?: Methodology[];
}) {
  const [filters, setFilters] = React.useState<MethodologyTableFilters>({
    search: "",
  });

  // Debounce search across title + explanation.
  const [debouncedSearch, setDebouncedSearch] = React.useState(filters.search);
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  const query = React.useMemo(
    () => ({
      search: debouncedSearch || undefined,
      page: 1,
      pageSize: 50,
    }),
    [debouncedSearch],
  );

  const { data, isLoading, isFetching } = useMethodologies(query);
  const items = data?.items ?? initialItems ?? [];

  // Dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [active, setActive] = React.useState<Methodology | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  function openCreate() {
    setActive(null);
    setEditOpen(true);
  }
  function openEdit(methodology: Methodology) {
    setActive(methodology);
    setEditOpen(true);
  }
  function openDelete(methodology: Methodology) {
    setActive(methodology);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-4">
      <MethodologyTableToolbar
        filters={filters}
        onFiltersChange={setFilters}
        onNew={openCreate}
      />

      <div
        data-loading={isFetching && !isLoading}
        className="relative transition-opacity data-[loading=true]:opacity-70"
      >
        <MethodologyTable
          methodologies={items}
          isLoading={isLoading}
          actions={{ onEdit: openEdit, onDelete: openDelete }}
        />
      </div>

      <MethodologyDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        methodology={active}
      />
      <DeleteMethodologyDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        methodology={active}
      />
    </div>
  );
}
