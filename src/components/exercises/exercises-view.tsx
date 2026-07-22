"use client";

import * as React from "react";

import { ExercisesTable } from "@/components/exercises/exercises-table";
import {
  ExercisesToolbar,
  type ExercisesTableFilters,
} from "@/components/exercises/exercises-toolbar";
import { ExerciseDialog } from "@/components/exercises/exercise-dialog";
import { DeleteExerciseDialog } from "@/components/exercises/delete-exercise-dialog";
import {
  useExerciseCollections,
  useExercises,
} from "@/hooks/queries/use-exercises";
import type { Exercise } from "@/types/exercises";

/**
 * Client orchestrator for the Exercises list view.
 * Owns filter state (search + collection filter), create/edit/delete
 * dialogs, and the data query. Loads collections in parallel to resolve
 * the collection column + filter dropdown.
 */
export function ExercisesView({
  initialItems,
}: {
  initialItems?: Exercise[];
}) {
  const [filters, setFilters] = React.useState<ExercisesTableFilters>({
    search: "",
    collectionId: "",
  });

  // Debounce search so we don't fire a request on every keystroke.
  const [debouncedSearch, setDebouncedSearch] = React.useState(filters.search);
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  const exercisesQuery = React.useMemo(
    () => ({
      search: debouncedSearch || undefined,
      collectionId: filters.collectionId || undefined,
      page: 1,
      pageSize: 50,
    }),
    [debouncedSearch, filters.collectionId],
  );

  const { data, isLoading, isFetching } = useExercises(exercisesQuery);
  const items = data?.items ?? initialItems ?? [];

  // Load collections for the filter dropdown + column lookup.
  const { data: collectionsData } = useExerciseCollections({
    page: 1,
    pageSize: 100,
  });
  const collections = collectionsData?.items ?? [];
  const collectionsById = React.useMemo(
    () =>
      new Map<string, { id: string; title: string }>(
        collections.map((c) => [c.id, { id: c.id, title: c.title }]),
      ),
    [collections],
  );

  // Dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [active, setActive] = React.useState<Exercise | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  function openCreate() {
    setActive(null);
    setEditOpen(true);
  }
  function openEdit(exercise: Exercise) {
    setActive(exercise);
    setEditOpen(true);
  }
  function openDelete(exercise: Exercise) {
    setActive(exercise);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-4">
      <ExercisesToolbar
        filters={filters}
        onFiltersChange={setFilters}
        onNew={openCreate}
        collections={collections}
      />

      <div
        data-loading={isFetching && !isLoading}
        className="relative transition-opacity data-[loading=true]:opacity-70"
      >
        <ExercisesTable
          exercises={items}
          isLoading={isLoading}
          actions={{ onEdit: openEdit, onDelete: openDelete }}
          collectionsById={collectionsById}
        />
      </div>

      <ExerciseDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        exercise={active}
      />
      <DeleteExerciseDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        exercise={active}
      />
    </div>
  );
}
