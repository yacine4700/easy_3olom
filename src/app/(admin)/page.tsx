import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PhaseBanner } from "@/components/dashboard/phase-banner";
import { ModulesOverview } from "@/components/dashboard/modules-overview";

/**
 * Dashboard (/).
 *
 * The page stays a thin composition of small components — all structure and
 * logic lives in dedicated modules under `components/dashboard` and
 * `config/navigation`. This keeps the route file readable and scalable.
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <DashboardHeader />
      <PhaseBanner />
      <ModulesOverview />
    </div>
  );
}
