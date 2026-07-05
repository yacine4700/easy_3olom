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
        المرحلة 1 — الأساس جاهز
      </AlertTitle>
      <AlertDescription className="text-muted-foreground text-xs leading-relaxed">
        الهيكل الأساسي للتطبيق (الشريط الجانبي، الشريط العلوي، نظام المظهر،
        المزوّدات، الأنواع، وإعداد التنقّل) جاهز. الوحدات أدناه ستُبنى بشكل
        تدريجي، بدءاً بقاعدة المعرفة في المرحلة التالية.
      </AlertDescription>
    </Alert>
  );
}
