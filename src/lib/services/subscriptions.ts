import { supabase } from "@/lib/supabase";
import { notifyWebhookAction, type WebhookAction } from "@/lib/webhook";
import type {
  Payment,
  PaymentDetail,
  PaymentWithRelations,
  Plan,
  Subscription,
  SubscriptionDetail,
  SubscriptionStats,
  SubscriptionWithRelations,
  User,
} from "@/types/subscriptions";
import type {
  ListPaymentsQuery,
  ListPlansQuery,
  ListSubscriptionsQuery,
  ListUsersQuery,
} from "@/lib/validators/subscriptions";

/**
 * READ-ONLY Subscriptions & Users service.
 *
 * All functions perform only `SELECT` queries against the `users`, `plans`,
 * `subscriptions`, and `payments` tables. The admin UI cannot mutate any of
 * these tables — payments are reviewed through the Telegram bot / n8n flow.
 *
 * Joins use Supabase's nested-select syntax (e.g.
 * `subscriptions!inner(*, user:users(*), plan:plans(*))`).
 */

const USERS_TABLE = "users";
const PLANS_TABLE = "plans";
const SUBSCRIPTIONS_TABLE = "subscriptions";
const PAYMENTS_TABLE = "payments";

// ── Row → domain mappers ──────────────────────────────────────────────────────

type UserRow = {
  id: string;
  telegram_user_id: number | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  language_code: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_seen_at: string | null;
};

type PlanRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number | string | null;
  currency: string | null;
  duration_days: number | null;
  active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string | null;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PaymentRow = {
  id: string;
  payment_reference: string;
  user_id: string;
  subscription_id: string | null;
  amount: number | string | null;
  currency: string | null;
  method: string | null;
  status: string | null;
  telegram_file_id: string | null;
  proof_filename: string | null;
  transaction_reference: string | null;
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function toUser(r: UserRow): User {
  return {
    id: r.id,
    telegramUserId: r.telegram_user_id,
    username: r.username,
    firstName: r.first_name,
    lastName: r.last_name,
    languageCode: r.language_code,
    status: (r.status as User["status"]) ?? "active",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    lastSeenAt: r.last_seen_at,
  };
}

function toPlan(r: PlanRow): Plan {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    description: r.description,
    price: Number(r.price ?? 0),
    currency: r.currency ?? "DZD",
    durationDays: Number(r.duration_days ?? 0),
    active: r.active ?? true,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toSubscription(r: SubscriptionRow): Subscription {
  return {
    id: r.id,
    userId: r.user_id,
    planId: r.plan_id,
    status: (r.status as Subscription["status"]) ?? "pending",
    startsAt: r.starts_at,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toPayment(r: PaymentRow): Payment {
  return {
    id: r.id,
    userId: r.user_id,
    subscriptionId: r.subscription_id,
    amount: Number(r.amount ?? 0),
    currency: r.currency ?? "DZD",
    method: (r.method as Payment["method"]) ?? "ccp",
    status: (r.status as Payment["status"]) ?? "pending",
    telegramFileId: r.telegram_file_id,
    proofFilename: r.proof_filename,
    transactionReference: r.transaction_reference,
    notes: r.notes,
    reviewedBy: r.reviewed_by,
    reviewedAt: r.reviewed_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ── List result types ──────────────────────────────────────────────────────────

export interface SubscriptionListResult {
  items: SubscriptionWithRelations[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaymentListResult {
  items: PaymentWithRelations[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Stats ──────────────────────────────────────────────────────────────────────

/**
 * Aggregate KPI counts across users, subscriptions, and payments.
 *
 * Each `count: "exact", head: true` query is a cheap SQL `COUNT(*)` that
 * doesn't transfer rows. Revenue sums the `amount` column of approved
 * payments (no head — we need the values, but we limit to a single column).
 */
export async function getSubscriptionStats(): Promise<SubscriptionStats> {
  const [
    totalUsersRes,
    activeSubsRes,
    pendingSubsRes,
    expiredSubsRes,
    cancelledSubsRes,
    suspendedSubsRes,
    pendingPaymentsRes,
    approvedPaymentsRes,
    rejectedPaymentsRes,
    approvedAmountsRes,
  ] = await Promise.all([
    supabase
      .from(USERS_TABLE)
      .select("*", { count: "exact", head: true }),
    supabase
      .from(SUBSCRIPTIONS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from(SUBSCRIPTIONS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from(SUBSCRIPTIONS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq("status", "expired"),
    supabase
      .from(SUBSCRIPTIONS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq("status", "cancelled"),
    supabase
      .from(SUBSCRIPTIONS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq("status", "suspended"),
    supabase
      .from(PAYMENTS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from(PAYMENTS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from(PAYMENTS_TABLE)
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected"),
    supabase
      .from(PAYMENTS_TABLE)
      .select("amount")
      .eq("status", "approved"),
  ]);

  // Note: errors here are swallowed — the dashboard degrades to 0 instead of
  // throwing the whole page. The list endpoints still surface real errors.
  const totalRevenue = (approvedAmountsRes.data ?? []).reduce(
    (sum, row) => sum + Number((row as { amount: number | string }).amount ?? 0),
    0,
  );

  return {
    totalUsers: totalUsersRes.count ?? 0,
    activeSubscriptions: activeSubsRes.count ?? 0,
    pendingSubscriptions: pendingSubsRes.count ?? 0,
    expiredSubscriptions: expiredSubsRes.count ?? 0,
    cancelledSubscriptions: cancelledSubsRes.count ?? 0,
    suspendedSubscriptions: suspendedSubsRes.count ?? 0,
    pendingPayments: pendingPaymentsRes.count ?? 0,
    approvedPayments: approvedPaymentsRes.count ?? 0,
    rejectedPayments: rejectedPaymentsRes.count ?? 0,
    totalRevenue,
  };
}

// ── Subscriptions list + detail ──────────────────────────────────────────────────

/**
 * Paginated list of subscriptions joined with their `user` and `plan`.
 *
 * PostgREST search across referenced tables uses the dotted column syntax:
 * `user.first_name.ilike.%term%`. The `!inner` hint forces an inner join so
 * only subscriptions that actually have a user AND a plan come back.
 */
export async function listSubscriptions(
  query: ListSubscriptionsQuery,
): Promise<SubscriptionListResult> {
  const { search, status, sort, page, pageSize } = query;

  let req = supabase
    .from(SUBSCRIPTIONS_TABLE)
    .select("*, user:users(*), plan:plans(*)", { count: "exact" });

  if (status) req = req.eq("status", status);

  if (search) {
    // Search across user (first_name, last_name, username) and plan (name).
    req = req.or(
      `user.first_name.ilike.%${search}%,user.last_name.ilike.%${search}%,user.username.ilike.%${search}%,plan.name.ilike.%${search}%`,
    );
  }

  const ascending = sort === "oldest";
  req = req
    .order("created_at", { ascending, nullsFirst: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await req;
  if (error) throw error;

  const rows = (data ?? []) as Array<
    SubscriptionRow & { user: UserRow | null; plan: PlanRow | null }
  >;

  const items: SubscriptionWithRelations[] = rows.map((r) => ({
    ...toSubscription(r),
    user: r.user ? toUser(r.user) : null,
    plan: r.plan ? toPlan(r.plan) : null,
  }));

  return { items, total: count ?? 0, page, pageSize };
}

/**
 * Single subscription with full joins (user + plan + the subscription's own
 * payments). Returns `null` if the subscription id doesn't exist.
 */
export async function getSubscriptionDetail(
  id: string,
): Promise<SubscriptionDetail | null> {
  const [subRes, paymentsRes] = await Promise.all([
    supabase
      .from(SUBSCRIPTIONS_TABLE)
      .select("*, user:users(*), plan:plans(*)")
      .eq("id", id)
      .single(),
    supabase
      .from(PAYMENTS_TABLE)
      .select("*")
      .eq("subscription_id", id)
      .order("created_at", { ascending: false, nullsFirst: false }),
  ]);

  if (subRes.error || !subRes.data) return null;

  const subRow = subRes.data as SubscriptionRow & {
    user: UserRow | null;
    plan: PlanRow | null;
  };

  const payments = (paymentsRes.data ?? []) as PaymentRow[];

  return {
    ...toSubscription(subRow),
    user: subRow.user ? toUser(subRow.user) : null,
    plan: subRow.plan ? toPlan(subRow.plan) : null,
    payments: payments.map(toPayment),
  };
}

// ── Payments list + detail ───────────────────────────────────────────────────────

/**
 * Paginated list of payments joined with their `user`.
 *
 * Search matches the user's first/last name or telegram username (the
 * payments table itself has no searchable text column beyond `notes`).
 */
export async function listPayments(
  query: ListPaymentsQuery,
): Promise<PaymentListResult> {
  const { search, status, sort, page, pageSize } = query;

  let req = supabase
    .from(PAYMENTS_TABLE)
    .select("*, user:users(*)", { count: "exact" });

  if (status) req = req.eq("status", status);

  if (search) {
    req = req.or(
      `user.first_name.ilike.%${search}%,user.last_name.ilike.%${search}%,user.username.ilike.%${search}%,transaction_reference.ilike.%${search}%,notes.ilike.%${search}%`,
    );
  }

  const ascending = sort === "oldest";
  req = req
    .order("created_at", { ascending, nullsFirst: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await req;
  if (error) throw error;

  const rows = (data ?? []) as Array<
    PaymentRow & { user: UserRow | null }
  >;

  const items: PaymentWithRelations[] = rows.map((r) => ({
    ...toPayment(r),
    user: r.user ? toUser(r.user) : null,
  }));

  return { items, total: count ?? 0, page, pageSize };
}

/**
 * Single payment with full joins: the paying `user`, and the `subscription`
 * (which itself includes its `plan`). Returns `null` if not found.
 */
export async function getPaymentDetail(
  id: string,
): Promise<PaymentDetail | null> {
  const { data, error } = await supabase
    .from(PAYMENTS_TABLE)
    .select("*, user:users(*), subscription:subscriptions(*, plan:plans(*))")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const row = data as PaymentRow & {
    user: UserRow | null;
    subscription:
      | (SubscriptionRow & { plan: PlanRow | null })
      | null;
  };

  return {
    ...toPayment(row),
    user: row.user ? toUser(row.user) : null,
    subscription: row.subscription
      ? {
          ...toSubscription(row.subscription),
          plan: row.subscription.plan
            ? toPlan(row.subscription.plan)
            : null,
        }
      : null,
  };
}

// ── Plans list ──────────────────────────────────────────────────────────────────

export interface PlanListResult {
  items: Plan[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Paginated list of plans. READ-ONLY.
 *
 * Optional `active` boolean filter narrows to enabled/disabled plans, and
 * `search` matches the plan's `code` or `name` (case-insensitive).
 */
export async function listPlans(
  query: ListPlansQuery,
): Promise<PlanListResult> {
  const { search, active, sort, page, pageSize } = query;

  let req = supabase
    .from(PLANS_TABLE)
    .select("*", { count: "exact" });

  if (typeof active === "boolean") {
    req = req.eq("active", active);
  }

  if (search) {
    req = req.or(`code.ilike.%${search}%,name.ilike.%${search}%`);
  }

  const ascending = sort === "oldest";
  req = req
    .order("created_at", { ascending, nullsFirst: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await req;
  if (error) throw error;

  const rows = (data ?? []) as PlanRow[];
  const items = rows.map(toPlan);

  return { items, total: count ?? 0, page, pageSize };
}

// ── Users list ─────────────────────────────────────────────────────────────────

export interface UserListResult {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Paginated list of Telegram-bot users. READ-ONLY.
 *
 * `search` matches `username`, `first_name`, `last_name`, or the textual form
 * of `telegram_user_id`. The optional `status` filter narrows to active/blocked.
 */
export async function listUsers(
  query: ListUsersQuery,
): Promise<UserListResult> {
  const { search, status, sort, page, pageSize } = query;

  let req = supabase
    .from(USERS_TABLE)
    .select("*", { count: "exact" });

  if (status) {
    req = req.eq("status", status);
  }

  if (search) {
    req = req.or(
      `username.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`,
    );
  }

  const ascending = sort === "oldest";
  req = req
    .order("created_at", { ascending, nullsFirst: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await req;
  if (error) throw error;

  const rows = (data ?? []) as UserRow[];
  const items = rows.map(toUser);

  return { items, total: count ?? 0, page, pageSize };
}

// ── Payment actions (via Webhook only) ──────────────────────────────────────────
//
// The admin UI never writes to the `payments` table directly. Approve / reject
// requests are sent to the configured webhook (Telegram bot / n8n) which is
// the only writer. The webhook payload always carries the payment's current
// fields alongside its id so the receiver has full context.

/**
 * Resolves a payment to its full row (with no joins) so we can send its
 * fields to the webhook. Returns `null` when the id doesn't exist.
 */
async function fetchPaymentRow(id: string): Promise<PaymentRow | null> {
  const { data, error } = await supabase
    .from(PAYMENTS_TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as PaymentRow;
}

/**
 * Send a payment action (`approve` / `reject`) to the webhook.
 *
 * Throws an `Error` with the webhook's failure message so the API route can
 * surface it as a 400. The webhook receives:
 *
 *   { entity: "payment", action: "approve"|"reject",
 *     data: { id, userId, subscriptionId, amount, currency, method,
 *            status, transactionReference, telegramFileId, notes } }
 */
export async function reviewPayment(
  id: string,
  action: Extract<WebhookAction, "approve" | "reject">,
): Promise<void> {
  const row = await fetchPaymentRow(id);
  if (!row) {
    throw new Error("المدفوعة غير موجودة");
  }
const { data: telegramUser, error: telegramUserError } =
  await supabase
    .from(USERS_TABLE)
    .select("telegram_user_id")
    .eq("id", row.user_id)
    .single();

if (telegramUserError || !telegramUser) {
  throw new Error("مستخدم تيليجرام غير موجود");
}
  const data: Record<string, unknown> = {
    id,
    paymentReference: row.payment_reference,
    userId: row.user_id,
    subscriptionId: row.subscription_id,
    amount: Number(row.amount ?? 0),
    currency: row.currency ?? "DZD",
    method: row.method ?? "ccp",
    status: row.status ?? "pending",
    transactionReference: row.transaction_reference,
    telegramFileId: row.telegram_file_id,
    notes: row.notes,
    telegramUserId: telegramUser.telegram_user_id,
  };

  const result = await notifyWebhookAction("payment", action, data);
  if (!result.success) {
    throw new Error(result.error ?? "فشل إرسال الإجراء إلى Webhook");
  }
}

