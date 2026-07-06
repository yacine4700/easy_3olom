"use client";

import * as React from "react";

import { DocumentsTable } from "@/components/knowledge-base/documents-table";
import {
  TableToolbar,
  type DocumentsTableFilters,
} from "@/components/knowledge-base/table-toolbar";
import { DocumentDialog } from "@/components/knowledge-base/document-dialog";
import { DeleteDocumentDialog } from "@/components/knowledge-base/delete-document-dialog";
import { useKnowledgeDocuments } from "@/hooks/queries/use-knowledge-base";
import type { KnowledgeDocument } from "@/types/domain";

/**
 * Client orchestrator for the Knowledge Base list view.
 *
 * Owns: filter state, the create/edit/delete dialogs, and the data query.
 * The page (Server Component) just renders this with initial data so the
 * first paint is instant, then TanStack Query keeps things fresh.
 */
export function KnowledgeBaseView({
  initialItems,
}: {
  initialItems?: KnowledgeDocument[];
}) {
  const [filters, setFilters] = React.useState<DocumentsTableFilters>({
    search: "",
  });

  // Debounce the search so we don't fire a request on every keystroke.
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

  const { data, isLoading, isFetching } = useKnowledgeDocuments(query);

  // Use initial items on first render to avoid a loading flash; once the
  // query returns, prefer its data.
  const items = data?.items ?? initialItems ?? [];

  // Dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [activeDocument, setActiveDocument] =
    React.useState<KnowledgeDocument | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  function openCreate() {
    setActiveDocument(null);
    setEditOpen(true);
  }
  function openEdit(document: KnowledgeDocument) {
    setActiveDocument(document);
    setEditOpen(true);
  }
  function openDelete(document: KnowledgeDocument) {
    setActiveDocument(document);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-4">
      <TableToolbar
        filters={filters}
        onFiltersChange={setFilters}
        onNew={openCreate}
      />

      <div
        data-loading={isFetching && !isLoading}
        className="relative transition-opacity data-[loading=true]:opacity-70"
      >
        <DocumentsTable
          documents={items}
          isLoading={isLoading}
          actions={{ onEdit: openEdit, onDelete: openDelete }}
        />
      </div>

      <DocumentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        document={activeDocument}
      />
      <DeleteDocumentDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        document={activeDocument}
      />
    </div>
  );
}
