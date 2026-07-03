import type { LucideIcon } from "lucide-react";

/**
 * A single navigation entry rendered in the sidebar.
 * Keep this pure-data so the sidebar component stays presentational.
 */
export interface NavItem {
  /** Stable unique key, also used for React keys */
  key: string;
  /** Visible label */
  title: string;
  /** Route path the item links to */
  href: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Optional short description shown in tooltips / command palette */
  description?: string;
  /** Optional badge text (e.g. "Soon", "New") */
  badge?: string;
  /** When true the item is rendered as disabled (not yet built) */
  disabled?: boolean;
}

/** A labeled group of navigation items */
export interface NavGroup {
  /** Stable unique key */
  key: string;
  /** Group heading label */
  label: string;
  items: NavItem[];
}

/** A flat list of groups makes up the full sidebar navigation */
export type NavConfig = NavGroup[];
