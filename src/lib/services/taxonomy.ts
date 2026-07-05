import { supabase } from "@/lib/supabase";
import {
  LEVEL_LABELS,
  type EducationLevelKey,
  type TaxonomyData,
} from "@/lib/constants/taxonomy";

// Re-export for backwards compatibility
export { LEVEL_LABELS, type EducationLevelKey, type TaxonomyData };

const SETTING_KEY = "knowledge.taxonomy";

const DEFAULT_TAXONOMY: TaxonomyData = {
  "1AS": { domains: [], units: {} },
  "2AS": { domains: [], units: {} },
  "3AS": { domains: [], units: {} },
};

export async function getTaxonomy(): Promise<TaxonomyData> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", SETTING_KEY)
    .single();

  if (error || !data) {
    return DEFAULT_TAXONOMY;
  }

  try {
    const parsed = JSON.parse((data as { value: string }).value);
    // Merge with defaults to ensure all levels exist
    return {
      "1AS": parsed["1AS"] ?? { domains: [], units: {} },
      "2AS": parsed["2AS"] ?? { domains: [], units: {} },
      "3AS": parsed["3AS"] ?? { domains: [], units: {} },
    };
  } catch {
    return DEFAULT_TAXONOMY;
  }
}

export async function updateTaxonomy(
  taxonomy: TaxonomyData,
): Promise<TaxonomyData> {
  const { error } = await supabase.from("settings").upsert(
    {
      key: SETTING_KEY,
      value: JSON.stringify(taxonomy),
      secret: false,
    },
    { onConflict: "key" },
  );

  if (error) throw error;
  return taxonomy;
}
