import {
  LayoutDashboard,
  Library,
  MessageCircleQuestion,
  Route,
  Target,
  BookText,
  ChartNoAxesColumn,
  Settings,
} from "lucide-react";

import type { NavConfig } from "@/types/nav";

/**
 * Centralised sidebar navigation.
 *
 * Only `/` (Dashboard) is enabled in Phase 1. The remaining modules are
 * declared here so the structure is visible and ready to be wired as we
 * build each one — they render as disabled "Soon" entries until then.
 *
 * To enable a module later: create its route + page, then flip
 * `disabled: false` and remove the `badge` here.
 */
export const navConfig: NavConfig = [
  {
    key: "overview",
    label: "Overview",
    items: [
      {
        key: "dashboard",
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        description: "Project health and recent activity",
      },
    ],
  },
  {
    key: "knowledge",
    label: "Knowledge",
    items: [
      {
        key: "knowledge-base",
        title: "Knowledge Base",
        href: "/knowledge-base",
        icon: Library,
        description: "Manage RAG source documents and chunks",
        badge: "Soon",
        disabled: true,
      },
      {
        key: "glossary",
        title: "Glossary",
        href: "/glossary",
        icon: BookText,
        description: "Domain terminology and definitions",
        badge: "Soon",
        disabled: true,
      },
    ],
  },
  {
    key: "pedagogy",
    label: "Pedagogy",
    items: [
      {
        key: "methodology",
        title: "Methodology",
        href: "/methodology",
        icon: Route,
        description: "Teaching sequences per level",
        badge: "Soon",
        disabled: true,
      },
      {
        key: "learning-objectives",
        title: "Learning Objectives",
        href: "/learning-objectives",
        icon: Target,
        description: "Target competencies and outcomes",
        badge: "Soon",
        disabled: true,
      },
    ],
  },
  {
    key: "engagement",
    label: "Engagement",
    items: [
      {
        key: "student-questions",
        title: "Student Questions",
        href: "/student-questions",
        icon: MessageCircleQuestion,
        description: "Questions received via Telegram",
        badge: "Soon",
        disabled: true,
      },
      {
        key: "analytics",
        title: "Analytics",
        href: "/analytics",
        icon: ChartNoAxesColumn,
        description: "Usage and answer-quality insights",
        badge: "Soon",
        disabled: true,
      },
    ],
  },
  {
    key: "system",
    label: "System",
    items: [
      {
        key: "settings",
        title: "Settings",
        href: "/settings",
        icon: Settings,
        description: "Workspace and integration settings",
        badge: "Soon",
        disabled: true,
      },
    ],
  },
];
