import { navConfig } from "@/config/navigation";
import { ModuleCard } from "@/components/dashboard/module-card";

/**
 * Grid of all modules declared in the central navigation config.
 * This gives an at-a-glance map of the project's scope on the dashboard,
 * and updates automatically as modules are enabled in `navigation.ts`.
 */
export function ModulesOverview() {
  const modules = navConfig.flatMap((group) => group.items);

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium">الوحدات</h2>
        <span className="text-muted-foreground text-xs">
          {modules.length} مخطط
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modules.map((item) => (
          <ModuleCard
            key={item.key}
            title={item.title}
            description={item.description ?? ""}
            icon={item.icon}
            href={item.href}
            disabled={item.disabled}
            badge={item.badge}
          />
        ))}
      </div>
    </section>
  );
}
