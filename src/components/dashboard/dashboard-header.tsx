import { Badge } from "@/components/ui/badge";

/**
 * Page-level header for the dashboard.
 * Kept presentational so the page just composes data + components.
 */
export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">الرئيسية</h1>
        <Badge variant="secondary" className="font-medium">
          المرحلة 1
        </Badge>
      </div>
      <p className="text-muted-foreground text-sm">
        إدارة قاعدة معرفة RAG لمساعد مادة علوم الطبيعة والحياة.
      </p>
    </div>
  );
}
