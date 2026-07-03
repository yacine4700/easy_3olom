import { Rocket } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Informs the admin of the current build phase and what comes next.
 * Remove or repurpose once modules ship.
 */
export function PhaseBanner() {
  return (
    <Alert className="border-brand/30 bg-brand/5">
      <Rocket className="text-brand size-4" />
      <AlertTitle className="text-sm font-medium">
        Phase 1 — Foundation ready
      </AlertTitle>
      <AlertDescription className="text-muted-foreground text-xs leading-relaxed">
        The application shell (sidebar, topbar, theming, providers, types and
        navigation config) is in place. Modules below will be built
        incrementally, starting with the Knowledge Base in the next phase.
      </AlertDescription>
    </Alert>
  );
}
