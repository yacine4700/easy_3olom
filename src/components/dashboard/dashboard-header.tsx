import { Badge } from "@/components/ui/badge";

/**
 * Page-level header for the dashboard.
 * Kept presentational so the page just composes data + components.
 */
export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Badge variant="secondary" className="font-medium">
          Phase 1
        </Badge>
      </div>
      <p className="text-muted-foreground text-sm">
        Manage the RAG knowledge base for the Natural &amp; Life Sciences
        assistant (علوم الطبيعة والحياة).
      </p>
    </div>
  );
}
