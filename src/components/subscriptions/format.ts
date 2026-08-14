import { format, formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

import type { User } from "@/types/subscriptions";

/**
 * Shared formatting helpers for the Subscriptions & Users module.
 *
 * Dates use the Arabic `date-fns` locale. Currency is always DZD per the
 * schema CHECK constraint — formatted with thousands separators.
 */

/** "—" placeholder when a value is missing. */
export const DASH = "—";

/** Returns the user's display name (first + last, falling back to username or telegram id). */
export function getUserDisplayName(user: Pick<User, "firstName" | "lastName" | "username" | "telegramUserId"> | null | undefined): string {
  if (!user) return DASH;
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (user.username) return `@${user.username}`;
  if (user.telegramUserId != null) return `Telegram #${user.telegramUserId}`;
  return DASH;
}

/** Format a DZD amount with thousands separators. */
export function formatPrice(amount: number, currency = "DZD"): string {
  const formatted = new Intl.NumberFormat("ar-DZ", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
  return `${formatted} ${currency}`;
}

/** Format an ISO date string as `dd MMM yyyy` in Arabic. Empty string if null. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return DASH;
  try {
    return format(new Date(iso), "d MMM yyyy", { locale: ar });
  } catch {
    return DASH;
  }
}

/** Format an ISO date string with time as `d MMM yyyy · HH:mm` in Arabic. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return DASH;
  try {
    return format(new Date(iso), "d MMM yyyy · HH:mm", { locale: ar });
  } catch {
    return DASH;
  }
}

/** Relative time ("منذ 5 دقائق") for an ISO date in Arabic. */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return DASH;
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ar });
  } catch {
    return DASH;
  }
}
