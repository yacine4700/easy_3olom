"use client";

import * as React from "react";

import { CollectionsTable } from "@/components/exercises/collections-table";
import {
  CollectionsToolbar,
  type CollectionsTableFilters,
} from "@/components/exercises/collections-toolbar";
import { CollectionDialog } from "@/components/exercises/collection-dialog";
import { DeleteCollectionDialog } from "@/components/exercises/delete-collection-dialog";
import { useExerciseCollections } from "@/hooks/queries/use-exercises";
import type { ExerciseCollection } from "@/types/exercises";

/**
 * Client orchestrator for the Exercise Collections list view.
 * Owns filter state, create/edit/delete dialogs, and the data query.
 * Mirrors the methodology/glossary view pattern.
 */
export function CollectionsView({
  initialItems,
}: {
  initialItems?: ExerciseCollection[];
}) {
  const [filters, setFilters] = React.useState<CollectionsTableFilters>({
    search: "",
  });

  // Debounce search so we don't fire a request on every keystroke.
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

  const { data, isLoading, isFetching } = useExerciseCollections(query);
  const items = data?.items ?? initialItems ?? [];

  // Dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [active, setActive] = React.useState<ExerciseCollection | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  function openCreate() {
    setActive(null);
    setEditOpen(true);
  }
  function openEdit(collection: ExerciseCollection) {
    setActive(collection);
    setEditOpen(true);
  }
  function openDelete(collection: ExerciseCollection) {
    setActive(collection);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-4">
      <CollectionsToolbar
        filters={filters}
        onFiltersChange={setFilters}
        onNew={openCreate}
      />

      <div
        data-loading={isFetching && !isLoading}
        className="relative transition-opacity data-[loading=true]:opacity-70"
      >
        <CollectionsTable
          collections={items}
          isLoading={isLoading}
          actions={{ onEdit: openEdit, onDelete: openDelete }}
        />
      </div>

      <CollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={active}
      />
      <DeleteCollectionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        collection={active}
      />
    </div>
  );
}
