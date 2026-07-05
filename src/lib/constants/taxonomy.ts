export type EducationLevelKey = "1AS" | "2AS" | "3AS";

export const LEVEL_LABELS: Record<EducationLevelKey, string> = {
  "1AS": "1 ثانوي",
  "2AS": "2 ثانوي",
  "3AS": "3 ثانوي",
};

export interface TaxonomyData {
  [level: string]: {
    domains: string[];
    units: { [domain: string]: string[] };
  };
}
