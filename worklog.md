# Easy 3olom Admin — Worklog

---
Task ID: 1
Agent: main (orchestrator)
Task: Phase 1 — Project foundation: folder structure, theme system, providers, types, centralized navigation config, and application shell (Sidebar + Topbar + Footer).

Work Log:
- Audited existing scaffold: Next.js 16, all shadcn/ui components present (incl. full `sidebar.tsx`), `next-themes`, `lucide-react`, `@tanstack/react-query` already installed. Base color = neutral (grayscale), no indigo/blue.
- Extended `src/app/globals.css`: added `--brand` emerald accent (light: oklch 0.596 0.145 163; dark: oklch 0.696 0.17 162) wired to `--sidebar-primary` so active nav uses brand; mapped `--color-brand` in `@theme inline`; added `.scrollbar-thin` utility.
- Created `src/types/nav.ts` (NavItem / NavGroup / NavConfig), `src/types/domain.ts` (placeholder domain types for Knowledge Base, Methodology, Learning Objectives, Glossary, Student Questions), `src/types/index.ts` barrel.
- Created `src/config/site.ts` (branding strings incl. Arabic subject name + stack) and `src/config/navigation.ts` (centralized nav config: Dashboard enabled, 7 modules marked `disabled` + "Soon" badge, grouped Overview/Knowledge/Pedagogy/Engagement/System).
- Created `src/components/providers/theme-provider.tsx` (next-themes wrapper) and `src/components/providers/providers.tsx` (ThemeProvider + QueryClientProvider client island, sensible query defaults).
- Built layout components in `src/components/layout/`: `theme-toggle.tsx`, `user-menu.tsx` (admin dropdown, placeholder identity), `sidebar-nav.tsx` (client, derives active state from `usePathname`, renders disabled items as inert), `app-sidebar.tsx` (`collapsible="icon"`, brand header, status footer), `topbar.tsx` (sticky, backdrop blur, search + theme + user menu), `app-shell.tsx` (Server Component composing SidebarProvider + SidebarInset; footer pinned via flex-1 content wrapper).
- Built dashboard components in `src/components/dashboard/`: `dashboard-header.tsx`, `module-card.tsx`, `modules-overview.tsx` (grid from navConfig), `phase-banner.tsx`.
- Restructured routes: root `src/app/layout.tsx` holds fonts + Providers + Toaster only (no shell); added route group `src/app/(admin)/layout.tsx` wrapping children in `AppShell`; moved dashboard to `src/app/(admin)/page.tsx`; deleted old `src/app/page.tsx` to avoid `/` route conflict.
- Ran `bun run lint` — clean (no errors/warnings).
- Self-verified with Agent Browser: page renders (title "Easy 3olom Admin · علوم الطبيعة والحياة"), no runtime/console errors; theme toggle flips html class light↔dark; sidebar collapse expands/collapses (`data-state`); user menu opens (Profile/Settings/Sign out); mobile viewport shows search icon button + single-column grid; mobile sidebar opens as Sheet with all nav items; sticky footer verified (`gapBelowFooter=0`, footerBottom==vh on short content). All `/` requests return 200.

Stage Summary:
- Architecture decision: shell lives in `src/app/(admin)/layout.tsx` (route group) so future unauthenticated pages (login) can render chrome-free.
- Architecture decision: sidebar nav is data-driven from `src/config/navigation.ts`; enabling a module = build route/page + flip `disabled:false` + drop badge.
- Color: neutral base + emerald `--brand` accent (fits "life sciences" + Supabase-dashboard aesthetic). No indigo/blue used.
- Open item for Phase 2+: data layer. Environment ships Prisma/SQLite; user requested Supabase. Decision deferred — no DB needed in Phase 1. When Knowledge Base module starts, choose between installing `@supabase/supabase-js` (remote project, needs credentials) vs adapting.
- Server Actions vs API routes: user requested Server Actions; platform convention prefers API routes. Deferred to data-layer phase.
- Phase 1 is complete and browser-verified. Awaiting user approval before starting Phase 2.

---
Task ID: 2
Agent: main (orchestrator)
Task: Phase 2 — Knowledge Base module (first functional module). Establish the data/service/API/CRUD pattern all future modules will follow.

Work Log:
- Resolved deferred Phase-1 decisions: (1) Data layer = Prisma/SQLite behind a service/repository interface (Supabase swap = one file, types/validators stay stable). (2) API routes (not Server Actions) per platform convention; TanStack Query on client.
- Prisma: added `KnowledgeDocument` model (title, source, level, status, chunkCount, embeddingReady + timestamps, indexes on level/status). SQLite has no enums → level/status stored as strings, constrained at Zod layer. `bun run db:push` applied.
- Seed script `scripts/seed-knowledge-base.ts` → 8 representative documents (French/Arabic curriculum titles across 1AS/2AS/3AS/AS levels, mixed statuses). Re-runnable.
- Tuned `db.ts` log from `['query']` → `['warn','error']` to keep dev.log clean.
- Validators `src/lib/validators/knowledge-base.ts`: Zod create/update/list-query schemas (single source of truth, shared by client form + server API).
- Constants `src/lib/constants/education.ts`: EDUCATION_LEVELS (1AS/2AS/3AS/AS with Arabic hints) + CONTENT_STATUSES (draft/review/published/archived) + label helpers.
- Service `src/lib/services/knowledge-base.ts`: list (filters+pagination), get, create, update, delete, getKnowledgeBaseStats. Repository pattern — only file touching Prisma for this module; returns domain types (Date→ISO).
- API helper `src/lib/api.ts`: ok/created/noContent/badRequest/notFound/serverError + `validate()` wrapper returning Zod field errors.
- API routes: `src/app/api/knowledge-base/route.ts` (GET list, POST create) + `src/app/api/knowledge-base/[id]/route.ts` (GET, PATCH, DELETE). All validate input via Zod.
- Fetch helper `src/lib/fetch.ts`: `fetchJson` + `ApiError` (carries status + field errors) for client hooks.
- TanStack Query hooks `src/hooks/queries/use-knowledge-base.ts`: useKnowledgeDocuments (list, placeholderData), useCreate/Update/Delete with cache invalidation + sonner toasts. Colocated query keys.
- Shared UI: `status-badge.tsx` (icon+color per status), `level-badge.tsx` (color per level), `knowledge-base-stats.tsx` (3 stat cards).
- Form `document-form.tsx`: RHF + zodResolver, controlled Select/Switch bridged into RHF, server-validated schema reused. Handles create + edit via defaultValues.
- Dialogs: `document-dialog.tsx` (create/edit in one dialog, picks mutation), `delete-document-dialog.tsx` (AlertDialog confirmation, destructive styling).
- Table `documents-table.tsx` + `columns.tsx`: TanStack Table with sorting, pagination, row selection, row-actions dropdown, skeleton loading state, empty state. shadcn Table has overflow-x-auto built-in (mobile horizontal scroll).
- Toolbar `table-toolbar.tsx`: search (debounced in view), level/status Selects, Clear button, "New document" brand button.
- Orchestrator `knowledge-base-view.tsx`: owns filter state + dialogs, debounced search, passes server-fetched initialItems to avoid loading flash.
- Page `src/app/(admin)/knowledge-base/page.tsx`: Server Component, fetches initial list + stats in parallel from service, renders header + stats + KnowledgeBaseView.
- Enabled nav item in `config/navigation.ts` (removed disabled/badge).
- Swapped root layout Toaster from radix → sonner (`richColors position="bottom-right"`) for hook toasts.
- Lint: 0 errors, 2 warnings (React Compiler notes on RHF `watch()` + TanStack `useReactTable()` — inherent to requested libraries, non-blocking).

Self-verification (Agent Browser):
- /knowledge-base renders with title "Knowledge Base · Easy 3olom Admin", no runtime/console errors.
- 8 seeded rows + 3 stat cards + filters + New button render correctly.
- CREATE: opened New dialog → filled title/source/chunkCount/switch → submit → 9th row "La photosynthèse…" appears. No errors.
- UPDATE: row actions → Edit → dialog prefilled → changed Status Draft→Published → Save → row shows "Published". PATCH 200.
- FILTER: status=Published → 4 rows. SEARCH: "immunitaire" (+Published) → 1 row. Both confirmed via eval.
- DELETE: row actions → Delete → AlertDialog → confirm → row removed, back to 8 rows. DELETE 204.
- Nav active state correct on both routes; sidebar navigation KB↔Dashboard works.
- Mobile (375px): table horizontally scrollable (scrollWidth 881 > clientWidth 341); footer pushed down naturally (gapBelow=0).
- dev.log shows full request chain: GET list 200, POST create, PATCH 200, GET ?status=published 200, GET ?search=immunitaire&status=published 200, DELETE 204.

Stage Summary:
- Established the reusable vertical slice pattern for all future modules: schema → service (repository) → validators → API routes → fetch helper → TanStack Query hooks → small UI components → orchestrator view → Server Component page. Each future module (Glossary, Methodology, …) can copy this skeleton.
- Clean Architecture honored: UI never imports Prisma; only `services/*` touches the DB. Swapping to Supabase = re-implement `services/knowledge-base.ts` only.
- Server-Component-first: pages fetch initial data server-side (instant first paint) then hydrate to interactive TanStack Query CRUD on client.
- Verification covers the full CRUD golden path + filters + search + responsive + footer. Phase 2 complete and browser-verified. Awaiting approval for Phase 3.

---
Task ID: 3
Agent: main (orchestrator)
Task: Phase 3 — Glossary module (bilingual FR + AR). Reuse the Phase 2 vertical-slice pattern to validate it generalizes; add justified bilingual domain fields.

Work Log:
- Architecture decision: Glossary is bilingual (FR term/definition + AR term/definition). Justified — Algerian secondary science is taught bilingually (French textbooks, Arabic instruction); glossary must serve both to feed the Arabic-answering RAG assistant.
- Updated `GlossaryTerm` domain type to bilingual (term, termAr, definition, definitionAr, level, status).
- Prisma: added `GlossaryTerm` model (term, termAr, definition, definitionAr, level, status + timestamps, indexes on level/status). `bun run db:push` applied + `db:generate`.
- Refactor: extracted `status-badge.tsx` + `level-badge.tsx` from `components/knowledge-base/` → `components/shared/` (now reused by KB + Glossary). Updated KB `columns.tsx` import; deleted KB-local copies. Regression-verified KB still renders (8 rows, badges intact).
- Validators `lib/validators/glossary.ts`: bilingual Zod schemas (FR fields with FR messages, AR fields with AR messages + 2000-char cap). Reused level/status enums from constants.
- Service `lib/services/glossary.ts`: list (search across ALL 4 fields — FR+AR term+definition — so an Arabic query finds French-sourced content and vice versa), get, create, update, delete, getGlossaryStats. Repository pattern, only file touching Prisma for this module.
- API routes: `api/glossary/route.ts` (GET list, POST create) + `api/glossary/[id]/route.ts` (GET, PATCH, DELETE). All Zod-validated.
- TanStack Query hooks `hooks/queries/use-glossary.ts`: useGlossaryTerms (placeholderData), useCreate/Update/Delete with cache invalidation + sonner toasts. Colocated keys.
- UI components in `components/glossary/`:
  - `term-form.tsx`: RHF + Zod, bilingual grid; Arabic fields use `dir="rtl"` + `lang="ar"` for correct rendering/input direction; Arabic error messages also `dir="rtl"`.
  - `term-dialog.tsx` (create/edit in one, 2xl width for bilingual grid) + `delete-term-dialog.tsx` (shows both FR + AR term in confirmation).
  - `columns.tsx`: term cell shows FR (medium) + AR (muted, dir=rtl, lang=ar) stacked; truncated definition; level/status shared badges; row actions.
  - `terms-table.tsx`: TanStack Table (sort by term asc default, paginate, select, skeleton/empty states).
  - `terms-table-toolbar.tsx`: search (placeholder "Search FR or AR…") + level/status filters + Clear + brand "New term".
  - `glossary-stats.tsx`: 3 cards (Total terms, Published, Bilingual FR+AR with Languages icon).
  - `glossary-view.tsx`: client orchestrator (debounced search, dialogs).
- Page `app/(admin)/glossary/page.tsx`: Server Component, parallel fetch initial list + stats, header with "FR · AR" badge + Arabic subject subtitle.
- Seed `scripts/seed-glossary.ts`: 12 real bilingual biology terms (Cellule/خلية, ADN/الحمض النووي..., Photosynthèse/التركيب الضوئي, Mitose/الانقسام المتساوي, Méiose/الانقسام المنصف, Chromosome/صبغي, Enzyme/أنزيم, Membrane plasmique/الغشاء البلازمي, Mitochondrie/المتقدرة, Génome/المجموع المورثي, Osmose/التناضح, Ribosome/الريبوزوم) with full FR+AR definitions, mixed levels/statuses.
- Enabled nav item in `config/navigation.ts`.
- Hit one issue: dev server cached the pre-regeneration Prisma Client → `db.glossaryTerm` undefined → 500. Fixed by restarting dev server (kill + nohup bun run dev). Root cause: long-running Node process caches the old @prisma/client module; `db:push` regenerates on disk but the running process keeps the stale import. Lesson for future schema additions: restart dev server after db:push.
- Lint: 0 errors, 4 warnings (same React Compiler notes on RHF watch() + TanStack useReactTable(), now across KB + Glossary forms/tables — inherent to requested libraries).

Self-verification (Agent Browser):
- /glossary renders with title "Glossary · Easy 3olom Admin", no runtime/console errors after dev restart.
- 12 seeded terms paginate (10 on page 1, 2 on page 2), 3 stat cards render.
- RTL verified: 10 [dir=rtl] elements in table; first row shows FR "ADN" + AR "الحمض النووي الريبي منقوص الأكسجين" stacked.
- CREATE: New term dialog → filled bilingual (Respiration cellulaire / التنفس الخلوي + FR/AR definitions) → set Published → submit → term appears on page 2 (alphabetical). No errors.
- UPDATE: row actions → Edit → dialog prefilled with all bilingual values (FR + AR including RTL) → changed status Published→Draft + updated AR definition → Save → status shows "Draft". PATCH 200.
- BILINGUAL SEARCH: searched Arabic "خلية" → returned 4 related terms (Cellule + 3 whose AR definitions mention خلية). Proves cross-language search across all 4 fields. Then searched "Respiration" → 2 results (Mitochondrie via definition match + Respiration cellulaire).
- DELETE: row actions → Delete → AlertDialog shows "Cellule / خلية" → canceled (preserved seed). Then deleted test "Respiration cellulaire" → confirmed removed (filtered search drops to 1). DELETE 204.
- Nav active state correct on Glossary + Dashboard; navigation works both ways.
- Regression: KB module still fully functional after shared-badge refactor (8 rows, status/level badges render, no errors).
- Mobile (375px): glossary renders, footer pinned (gapBelow=0).
- dev.log confirms full request chain incl. Arabic URL-encoded search (search=%D8%AE%D9%84%D9%8A%D8%A9 200).

Stage Summary:
- Validated the Phase 2 vertical-slice pattern generalizes: Glossary shipped faster by mirroring schema→service→validators→API→hooks→components→page structure. Each future module follows the same skeleton.
- Shared badge extraction (components/shared/) prevents duplication — first concrete DRY win across modules.
- Bilingual FR+AR with proper RTL rendering is now a proven pattern reusable for Student Questions (Arabic student queries + FR/AR answers) and any future bilingual content.
- New operational learning: restart dev server after Prisma schema changes (db:push regenerates client on disk, but the running process caches the old module).
- 3 of 8 modules now live (Dashboard, Knowledge Base, Glossary). Remaining: Methodology, Learning Objectives, Student Questions, Analytics, Settings.
- Phase 3 complete and browser-verified. Awaiting approval for Phase 4.

---
Task ID: 4
Agent: main (orchestrator)
Task: Phase 4 — Methodology module (bilingual FR + AR teaching sequences with pedagogical ordering). Parent of Learning Objectives (Phase 5). Proves the vertical-slice pattern generalizes a 3rd time.

Work Log:
- Corrected Phase 3 recommendation order: built Methodology (parent) BEFORE Learning Objectives (child) so the child can have a populated relational dropdown instead of an empty one retrofitted later.
- Updated Methodology domain type to bilingual (title, titleAr, description, descriptionAr) + level + order + status. `order` sequences units within a level for pedagogical progression.
- Prisma: added Methodology model (bilingual fields + level/status strings + order int + indexes). db:push + db:generate. Restarted dev server (per Phase 3 learning — running process caches old Prisma client).
- Validators lib/validators/methodology.ts: bilingual Zod schemas (FR fields + AR fields with AR messages) + order (int 0-9999). Reused level/status enums.
- Service lib/services/methodology.ts: list (search across all 4 FR+AR fields), get, create, update, delete, getMethodologyStats (total/published/levels-covered). KEY ADDITION: stable level-rank ordering (1AS<2AS<3AS<AS) via in-JS sort after fetch — SQLite can't order by a lookup expression. Returns rows in pedagogical (level, order) order.
- API routes: api/methodology/route.ts (GET, POST) + api/methodology/[id]/route.ts (GET, PATCH, DELETE).
  - Hit one issue: the collection route.ts was NOT written initially (the Write tool's first attempt failed on missing dir, I created the dir + [id] route but forgot to re-write the collection route). Symptom: page rendered via server-side service call (8 rows) but client TanStack refetch hit 404 → create POST also 404'd. Fixed by writing the missing route.ts. Lesson: verify both route files exist after creating API dirs.
- TanStack Query hooks hooks/queries/use-methodology.ts: useMethodologies (placeholderData), useCreate/Update/Delete with cache invalidation + toasts.
- UI components in components/methodology/: methodology-form (bilingual grid + order number field, dir=rtl for AR), methodology-dialog (create/edit, 2xl width), delete-methodology-dialog (shows FR/AR title), columns (# order badge + bilingual sequence title + level/status shared badges + row actions), methodology-table (TanStack, NO default client sort — preserves server pedagogical order; user can still click headers to re-sort), methodology-table-toolbar (search + level/status + New), methodology-stats (Total/Published/Levels covered), methodology-view (orchestrator).
  - KEY FIX: initial client SortingState was [{order, asc}] which re-sorted by order across all levels, breaking the server's level-then-order pedagogical sequence. Changed to [] so server order is preserved. Verified: 1AS(1,2,3)→2AS(1,2)→3AS(1,2,3)→AS(1).
- Page app/(admin)/methodology/page.tsx: Server Component, parallel fetch initial list + stats.
- Seed scripts/seed-methodology.ts: 8 real bilingual teaching sequences across 1AS(2)/2AS(2)/3AS(3)/AS(1), ordered, mixed statuses.
- Enabled nav item in config/navigation.ts.
- Lint: 0 errors, 6 warnings (same React Compiler notes on RHF watch() + TanStack useReactTable(), now across 3 modules — inherent to requested libraries).

Self-verification (Agent Browser):
- /methodology renders "Methodology · Easy 3olom Admin", no errors after route fix + dev restart.
- 8 seeded sequences; pedagogical ordering VERIFIED: 1AS(1,2)→2AS(1,2)→3AS(1,2,3)→AS(1).
- Bilingual RTL verified: 8 [dir=rtl] elements; FR "La cellule..." + AR "الخلية: الوحدة..." stacked.
- CREATE: New dialog → filled bilingual + order 3 + Published → submit (POST 201) → new sequence "La reproduction..." inserted at 1AS position 3. No errors.
- UPDATE: Edit prefilled (bilingual + order 3 + Published) → changed order→1 + status→Draft → Save (PATCH) → status shows Draft, reordering applied. 
- DELETE: row actions → Delete → AlertDialog shows FR/AR title → confirm (DELETE 204) → removed, back to 8 rows.
- Nav active state correct; mobile (375px) renders, footer pinned (gapBelow=0).
- Regression: KB module intact after shared-badge + new module additions (8 rows, no errors).

Stage Summary:
- 4 of 8 modules now live (Dashboard, Knowledge Base, Glossary, Methodology). The vertical-slice pattern now proven 3× (KB, Glossary, Methodology) — it scales cleanly.
- New pattern addition: stable server-side ordering when SQLite can't express the sort (level-rank lookup). Client table preserves server order by defaulting to empty SortingState.
- Bilingual FR+AR + RTL pattern now consistent across 2 modules (Glossary, Methodology); ready for reuse in Learning Objectives.
- Methodology is the PARENT of Learning Objectives — Phase 5 will add a real relational dropdown (objectives → methodology) demonstrating the first parent-child module relationship.
- Two operational learnings logged: (1) restart dev after Prisma schema changes; (2) verify both collection + [id] route files exist after creating API dirs.
- Phase 4 complete and browser-verified. Awaiting approval for Phase 5 (Learning Objectives — first relational module).

---
Task ID: FIX-1
Agent: main (orchestrator)
Task: Solve console errors (cross-origin warning + React 19 hydration mismatch).

Work Log:
- Issue 1 — Next.js cross-origin dev warning: "Cross origin request detected from preview-chat-*.space-z.ai to /_next/* resource". The preview panel loads resources from a different subdomain (preview-chat-{session-id}.space-z.ai). Next.js 16 requires explicitly allowlisting these origins.
  - Fix: added `allowedDevOrigins: ["*.space-z.ai"]` to next.config.ts. Wildcard covers the per-session subdomain.
  - Required dev server restart (next.config changes need restart).
  - Verified: warning gone from dev.log.

- Issue 2 — React 19 hydration mismatch on Radix DropdownMenuTrigger (and SelectTrigger). Error: "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties." Diff showed `id="radix-_R_1qqitplb_"` (server) vs `id="radix-_R_emitplb_"` (client) — different useId tree paths. Appeared on ALL pages including Dashboard (shell-only), confirming root cause in the shell not module content.
  - Root cause: `Topbar` and `UserMenu` were Server Components rendered as children of `SidebarInset` (a Client Component). In Next.js App Router, Server Components are "transparent" in the CLIENT React tree (they don't create React nodes), but during SSR they DO occupy tree positions. This asymmetry shifts every downstream `useId()` output, causing the Radix ID mismatch.
  - First attempt: changed `useIsMobile` hook from `useState(undefined)` → `useState(false)` for deterministic initial value. Did NOT fix the issue (the `!!undefined === false` return was already deterministic).
  - Actual fix: added `"use client"` to `Topbar` and `UserMenu`. Now the tree is Client → Client → Client (SidebarInset → Topbar → UserMenu → DropdownMenu) with no Server Component boundary, so useId paths are identical on server and client.
  - Verified: hydration error gone on all 4 live pages (Dashboard, Knowledge Base, Glossary, Methodology). Console shows only standard React DevTools + HMR logs. Zero page errors. Dev log clean.
  - Functionality regression check: UserMenu dropdown opens (Profile/Settings/Sign out), sidebar navigation works, table data renders (KB: 8 rows), no errors.

Stage Summary:
- Both console errors fully resolved. Console is now clean (only standard dev info logs).
- Key learning: when a Server Component is rendered as a child of a Client Component, its Radix `useId` outputs can mismatch between SSR and hydration. Components that contain Radix primitives (DropdownMenu, Select, Tooltip, etc.) should be Client Components when they're inside Client Component trees. This is a React 19 + Next.js App Router + Radix interaction.
- Lint: 0 errors, 6 warnings (unchanged React Compiler notes).

---
Task ID: REBUILD-API
Agent: sub-agent (general-purpose)
Task: Rebuild the API + hooks layer on top of the Supabase-backed services + webhook write pattern. Create all 9 API route files and all 5 TanStack Query hook files.

Work Log:
- Audited existing services + validators + helpers: services already talk to Supabase directly for reads + write through `notifyWebhook` (entity: knowledge | glossary | methodology) for creates/updates/deletes. Student questions are direct-DB writes (answer field) — no webhook. Settings are direct-DB (settings table). Webhook failures surface as `throw new Error(arabicMessage)` from the service.
- API route pattern (write endpoints): on success return `ok`/`created`/`noContent` as before; on webhook failure catch the Error and return `NextResponse.json({ error: message }, { status: 400 })` so the client receives the Arabic message and the hook can `toast.error(err.message)`. Previously these routes returned a generic 500 — fixed across all KB/Glossary/Methodology collection + [id] routes.
- KB: rewrote `app/api/knowledge-base/route.ts` (GET list, POST create) + `[id]/route.ts` (GET, PATCH, DELETE) with the new webhook-error pattern. GET list validates `listKnowledgeDocumentsQuerySchema` (search/domain/unit/page/pageSize).
- Glossary: rewrote `app/api/glossary/route.ts` (GET, POST) + `[id]/route.ts` (GET, PATCH, DELETE). Same pattern; query schema is search/domain/unit/page/pageSize.
- Methodology: rewrote `app/api/methodology/route.ts` (GET, POST) + `[id]/route.ts` (GET, PATCH, DELETE). Query schema is search/page/pageSize only (no domain/unit on this table).
- Student questions: created `app/api/student-questions/route.ts` (GET only — no POST because questions arrive via Telegram, not from this admin UI). Created `app/api/student-questions/[id]/route.ts` with GET, PATCH (answer-only via `updateStudentQuestionSchema`), DELETE. PATCH/DELETE write directly to the DB (no webhook), so on error they return a generic `serverError()` rather than the webhook 400-pattern.
- Settings: created `app/api/settings/route.ts` with GET (`getAllSettings`) and PUT (`updateSettings` validated by `updateSettingsSchema`). PUT skips masked/empty secret values server-side; returns the full grouped settings back to the client.
- All `[id]` routes use `params: Promise<{ id: string }>` and `const { id } = await params;` (Next.js 16 async-params contract). `isValidId(id)` helper guards each id segment (string, length 1–63).
- Hook: `use-knowledge-base.ts` rewritten — colocated `knowledgeBaseKeys`, `useKnowledgeDocuments` (queryKey `["knowledge-base","list",query]`, placeholderData prev), `useCreate/Update/Delete` with cache invalidation + Arabic toast "تم الإرسال إلى Webhook" on success and `toast.error(err.message)` on error. Fixed `buildQueryString` to emit `domain`/`unit` (was emitting `level`/`status` which the validator doesn't accept on Supabase schema).
- Hook: `use-glossary.ts` rewritten — same pattern with `glossaryKeys`, queryKey `["glossary","list",query]`, toast "تم الإرسال إلى Webhook". Fixed `buildQueryString` to emit `domain`/`unit`.
- Hook: `use-methodology.ts` rewritten — `methodologyKeys`, queryKey `["methodology","list",query]`, toast "تم الإرسال إلى Webhook". `buildQueryString` emits only `search`/`page`/`pageSize` (no level/status/domain/unit on this schema).
- Hook: `use-student-question.ts` created — `useStudentQuestions` (list, placeholderData), `useUpdateStudentQuestion` (toast "تم حفظ الإجابة", invalidates list + detail), `useDeleteStudentQuestion` (toast "تم حذف السؤال"). Direct-DB writes (no webhook). Query string emits `search`/`status`/`page`/`pageSize`.
- Hook: `use-settings.ts` created — `useSettings` (staleTime 60_000 ms). `useUpdateSettings` does an optimistic update via `qc.setQueryData` (applies user input to cached `SettingsByGroup[]`, masks secret fields locally with `SECRET_MASK`), rolls back on error, sets the authoritative server response on success, then invalidates. Toast on success: "تم حفظ الإعدادات". On error: `toast.error(err.message)`.

Stage Summary:
- All 9 API route files (KB ×2, Glossary ×2, Methodology ×2, Student questions ×2, Settings ×1) and all 5 TanStack Query hooks exist and follow the Supabase + webhook write pattern.
- Webhook error path is consistent: write endpoints catch the service-thrown Arabic Error and return `{ error: message }` with HTTP 400 so client toasts render the real message.
- Student questions are deliberately read-only at the collection route (no POST) — questions arrive via Telegram, not the admin UI.
- Settings use a 60s staleTime + optimistic update to keep the form snappy when toggling multiple values.
- Did NOT run lint or dev server per instructions. Code is ready for the UI layer to consume.

---
Task ID: REBUILD-LAYOUT
Agent: general-purpose (sub agent)
Task: Rebuild layout + dashboard for Arabic RTL after the project was reverted to an old English/LTR state. `<html dir="rtl" lang="ar">` and Cairo font were already in place; navigation + site config were already Arabic. This task converted the shell + dashboard chrome to match.

Work Log:
- `src/components/layout/app-shell.tsx`: verified footer text already uses `siteConfig.name` (Arabic "إيزي علوم — لوحة التحكم"); no string changes needed. Note: the "n8n · Supabase connected" status line referenced in the task brief lives in `app-sidebar.tsx`, not here — updated there.
- `src/components/layout/app-sidebar.tsx`: added `side="right"` to `<Sidebar>` so it docks to the right (RTL start); swapped explicit `border-r` → `border-s` (logical) so the shadcn sidebar's `group-data-[side=right]:border-l` rule isn't duplicated on both sides; changed brand header `text-left` → `text-start` so the Arabic brand name right-aligns naturally; changed footer status text "n8n · Supabase connected" → "n8n · Supabase متصل".
- `src/components/layout/topbar.tsx`: confirmed `"use client"` (already present from FIX-1 — required because Radix SidebarTrigger lives inside SidebarInset client tree). Translated search placeholder → "بحث في قاعدة المعرفة، الأسئلة…" and `aria-label="Search"` → `aria-label="بحث"` (both desktop Input and mobile icon Button). Converted all physical properties to logical per the task directive: `ml-2`→`ms-2` (SidebarTrigger), `mr-1`→`me-1` (separator), `ml-auto`→`ms-auto` (right-side controls wrapper), `left-2.5`→`start-2.5` (Search icon absolute position), `pl-8`→`ps-8` (Input text padding so text doesn't sit under the icon), `pr-3`→`pe-3` (header end padding). `mx-1` left as-is (symmetric, RTL-safe).
- `src/components/layout/user-menu.tsx`: confirmed `"use client"` (already present from FIX-1). Translated all visible strings: trigger label "Admin" → "المشرف"; dropdown header label "Admin" → "المشرف"; menu items "Profile" → "الملف الشخصي", "Settings" → "الإعدادات", "Sign out" → "تسجيل الخروج". Email `admin@easy3olom.dz` left as-is (Latin email).
- `src/components/layout/theme-toggle.tsx`: translated the three tooltip states — `"Switch to light"` → `"الوضع الفاتح"`, `"Switch to dark"` → `"الوضع الداكن"`, `"Toggle theme"` → `"تبديل المظهر"`. Also translated `aria-label="Toggle theme"` → `aria-label="تبديل المظهر"` for RTL screen-reader consistency.
- `src/components/layout/sidebar-nav.tsx`: verified disabled-item rendering works with the Arabic nav config — `item.badge` is sourced from `navConfig` (already "قريباً" for learning-objectives), so the badge text is correct. Fixed one RTL layout bug while verifying: the Badge on disabled items had `ml-auto` (physical), which in RTL pushes the badge toward the start instead of the end — changed to `ms-auto` so the "قريباً" badge correctly docks to the inline-end in both directions.
- `src/components/dashboard/dashboard-header.tsx`: "Dashboard" → "الرئيسية"; "Phase 1" badge → "المرحلة 1"; description replaced with "إدارة قاعدة معرفة RAG لمساعد مادة علوم الطبيعة والحياة." (removed the bilingual `&amp;` + parenthetical Arabic).
- `src/components/dashboard/module-card.tsx`: active badge "Active" → "مفعّل"; card CTA "Open" → "فتح". The "Soon" badge is data-driven from `item.badge` (already "قريباً"), so no text change needed there. `ArrowUpRight` icon left as-is (out of task scope; can be swapped to `ArrowUpLeft` in a future RTL polish pass if desired).
- `src/components/dashboard/modules-overview.tsx`: section heading "Modules" → "الوحدات"; counter "{n} planned" → "{n} مخطط".
- `src/components/dashboard/phase-banner.tsx`: title "Phase 1 — Foundation ready" → "المرحلة 1 — الأساس جاهز"; description rewritten in Arabic describing the shell (sidebar, topbar, theming, providers, types, navigation config) being ready and modules shipping incrementally starting with the Knowledge Base.
- `src/app/(admin)/page.tsx`: verified — already a thin composition of `DashboardHeader` + `PhaseBanner` + `ModulesOverview`; no code change needed.
- `src/hooks/use-mobile.ts`: verified — already uses `useState<boolean>(false)` (the FIX-1 hydration fix from the previous cycle survived the revert). No change needed.
- Did NOT run lint or dev server per task constraints. All edits are string-level or className swaps with no logic changes, so regression risk is minimal.

Stage Summary:
- Layout chrome (sidebar, topbar, user menu, theme toggle, footer) and dashboard (header, phase banner, modules overview, module cards) are now fully Arabic + RTL-correct. Combined with the already-Arabic `siteConfig`, `navConfig`, `<html dir="rtl" lang="ar">`, and Cairo font, the admin UI now renders end-to-end in Arabic with correct right-to-left layout.
- Key RTL technique applied throughout: physical Tailwind utilities (`ml-*`, `mr-*`, `left-*`, `right-*`, `pl-*`, `pr-*`) → logical (`ms-*`, `me-*`, `start-*`, `end-*`, `ps-*`, `pe-*`) so spacing/positioning auto-flips with `dir="rtl"`. The one exception left for a future polish pass: `ArrowUpRight` on module cards (kept as-is per task scope).
- Sidebar side change: `side="right"` makes shadcn's Sidebar dock right with `border-l` automatically; removed the conflicting explicit `border-r` to avoid double borders. Brand block `text-left` → `text-start` for natural Arabic alignment.
- Hydration-safety preserved: `topbar.tsx` and `user-menu.tsx` keep their `"use client"` directives (FIX-1), and `use-mobile.ts` keeps `useState<boolean>(false)` — so the Radix `useId` SSR/hydration mismatch from FIX-1 stays fixed.
- Recommended next verification (when dev server is run): confirm sidebar appears on the right, search icon sits at the inline-start of the input, user menu dropdown opens aligned to the inline-end, "قريباً" badge docks to the inline-end on the disabled "أهداف التعلم" item, and the dashboard renders fully in Arabic with no console errors. No further code changes anticipated.

---
Task ID: REBUILD-UI-1
Agent: general-purpose (sub agent)
Task: Rebuild the Knowledge Base + Glossary UI components for the new Supabase schema (single Arabic fields, no level/status). The project had been reverted to an old bilingual FR/AR state and the data layer was migrated to Supabase (REBUILD-API) + layout/dashboard migrated to Arabic RTL (REBUILD-LAYOUT). This task rewrote the two module UIs to match.

Work Log:
- Audited the new domain types + validators + services + hooks before writing UI:
  - `KnowledgeDocument` = { id, title, content, domain, unit, keywords(string[]), botInstructions, createdAt } (no level/status/chunkCount/embeddingReady/source/titleAr/…).
  - `GlossaryTerm` = { id, term, definition, unit, domain } (no termAr/definitionAr/level/status).
  - `createKnowledgeDocumentSchema` (title min 2; content/domain/unit/keywords/botInstructions nullable) + `createGlossaryTermSchema` (term min 2; definition/unit/domain nullable).
  - Services already exist with `getKnowledgeBaseStats()` returning `{ total, domains }` and `getGlossaryStats()` returning `{ total, domains }` — used directly from the Server Components.
  - Hooks already exist: `useKnowledgeDocuments`, `useCreate/Update/DeleteKnowledgeDocument`, `useGlossaryTerms`, `useCreate/Update/DeleteGlossaryTerm` — query strings emit `search`/`domain`/`unit`/`page`/`pageSize`.

Knowledge Base — rewrote all 9 files under `src/components/knowledge-base/` + the page:
1. `document-form.tsx`: RHF + zodResolver with `createKnowledgeDocumentSchema`. Fields: العنوان (title), المحتوى (content Textarea rows 6), المجال (domain), الوحدة (unit), الكلمات المفتاحية (keywords text input), تعليمات البوت (botInstructions Textarea rows 4). Keywords bridge: local React state `keywordsText` mirrors the array field; on change split on `/[,،]/` → trim → filter Boolean → `setValue("keywords", arr.length ? arr : null, { shouldValidate, shouldDirty })`; display joins array with Arabic comma "، ". Initialize `keywordsText` from `defaultValues.keywords?.join("، ")`. Buttons: "إلغاء" (outline) + "إنشاء وثيقة" / "حفظ التغييرات" (brand submit). Removed Switch/Select for level/status and the chunkCount/embeddingReady/source fields.
2. `columns.tsx`: select (تحديد الكل/تحديد الصف) → العنوان (title + content preview truncated to 60 chars) → المجال (domain or "—") → الوحدة (unit or "—") → الكلمات المفتاحية (up to 4 secondary Badges + outline "+N" overflow badge) → أُنشئ (`formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ar })` from `date-fns/locale/ar` so it renders "منذ X دقيقة"). Row actions dropdown: تعديل / حذف. Removed `LevelBadge`/`StatusBadge` imports + the level/status/chunkCount/embeddingReady columns. `text-right` → `text-end` on the actions cell wrapper.
3. `knowledge-base-stats.tsx`: 2 cards (إجمالي الوثائق + المجالات), interface `{ total: number; domains: number }`, grid `sm:grid-cols-2`. Icons Library + Layers (kept the brand tone for the domains card).
4. `table-toolbar.tsx`: search-only (no level/status Selects). Placeholder "بحث في العنوان أو المحتوى…", aria-label "بحث في الوثائق", button "وثيقة جديدة" (brand), clear button text "مسح" shown only when search non-empty. Interface `{ search: string }`. Search icon `left-2.5` → `start-2.5`, input `pl-8` → `ps-8` (logical props per REBUILD-LAYOUT pattern).
5. `documents-table.tsx`: TanStack Table, default sort `[{ id: "createdAt", desc: true }]`, pageSize 10. Empty state: "لا توجد وثائق" + "حاول تعديل المرشحات أو أضف وثيقة جديدة." Pagination Arabic: "{n} من {total} محدد" + "مسح" button + "الصفوف" + "صفحة X من Y" + aria-labels ("الصفحة الأولى/السابقة/التالية/الأخيرة"). Default `updatedAt` sort → `createdAt`.
6. `document-dialog.tsx`: title "وثيقة جديدة" / "تعديل الوثيقة"; descriptions "أضف وثيقة جديدة إلى قاعدة المعرفة لتغذية المساعد." / "عدّل بيانات هذه الوثيقة في قاعدة المعرفة." Width bumped `sm:max-w-lg` → `sm:max-w-2xl` for the larger form.
7. `delete-document-dialog.tsx`: title "حذف الوثيقة؟", body "سيتم حذف {title} نهائياً من قاعدة المعرفة. لا يمكن التراجع عن هذا الإجراء." Buttons: "إلغاء" (cancel) + "حذف" (destructive action with Trash2 icon).
8. `knowledge-base-view.tsx`: filter state `{ search: string }` only. 300ms debounced search → query `{ search: debouncedSearch || undefined, page: 1, pageSize: 50 }`. Uses `useKnowledgeDocuments(query)`. Create/edit/delete dialog wiring unchanged structurally.
9. `src/app/(admin)/knowledge-base/page.tsx`: Server Component. h1 "قاعدة المعرفة" + Badge "RAG" + Arabic description "إدارة الوثائق المصدرية التي تُغذّي مساعد RAG في مادة علوم الطبيعة والحياة." Parallel fetch `listKnowledgeDocuments({ page: 1, pageSize: 50 })` + `getKnowledgeBaseStats()`. metadata title "قاعدة المعرفة".

Glossary — rewrote all 8 files under `src/components/glossary/` + the page:
10. `term-form.tsx`: RHF + zodResolver with `createGlossaryTermSchema`. Fields: المصطلح (term), التعريف (definition Textarea rows 5), الوحدة (unit), المجال (domain) — latter two in a 2-col grid. Buttons: "إلغاء" + "إنشاء مصطلح" / "حفظ التغييرات". Removed all FR/AR bilingual duplication (no termAr/definitionAr) and level/status Selects. No `dir="rtl"` on inputs — inherited from `<html>`.
11. `columns.tsx`: select → المصطلح (term + definition preview truncated to 80 chars) → الوحدة → المجال → actions. Row actions: تعديل / حذف. Removed `LevelBadge`/`StatusBadge` imports + level/status columns + the separate definition column (folded into term cell preview) + the updatedAt column (no createdAt on glossary schema).
12. `glossary-stats.tsx`: 2 cards (إجمالي المصطلحات + المجالات), interface `{ total: number; domains: number }`, grid `sm:grid-cols-2`. Icons BookText + Layers.
13. `terms-table-toolbar.tsx`: search-only. Placeholder "بحث…", button "مصطلح جديد" (brand), clear button "مسح". Logical props `start-2.5`/`ps-8`. Interface `{ search: string }`.
14. `terms-table.tsx`: TanStack Table, default sort `[{ id: "term", desc: false }]`. Empty: "لا توجد مصطلحات" / "حاول تعديل المرشحات أو أضف مصطلحاً جديداً." Pagination Arabic (same pattern as KB table).
15. `term-dialog.tsx`: title "مصطلح جديد" / "تعديل المصطلح"; descriptions "أضف مصطلحاً جديداً إلى المعجم يستعمله المساعد." / "عدّل بيانات هذا المصطلح في المعجم." Width `sm:max-w-lg` (single-column form is smaller than the old bilingual grid).
16. `delete-term-dialog.tsx`: title "حذف المصطلح؟", body "سيتم حذف {term} نهائياً من المعجم. لا يمكن التراجع عن هذا الإجراء." Buttons "إلغاء" + "حذف".
17. `glossary-view.tsx`: filter state `{ search: string }` only. 300ms debounced → query `{ search, page: 1, pageSize: 50 }`. Uses `useGlossaryTerms(query)`.
18. `src/app/(admin)/glossary/page.tsx`: Server Component. h1 "المعجم" + Arabic description "مصطلحات وتعريفات علمية تُغذّي مساعد مادة علوم الطبيعة والحياة." Parallel fetch `listGlossaryTerms({ page: 1, pageSize: 50 })` + `getGlossaryStats()`. metadata title "المعجم". Removed the "FR · AR" badge (no longer bilingual).

Cross-cutting:
- Removed ALL imports of `LevelBadge`, `StatusBadge`, `EDUCATION_LEVELS`, `CONTENT_STATUSES`, and `EducationLevel`/`ContentStatus` types from the KB + Glossary modules + their pages (verified with ripgrep — no matches). The shared `level-badge.tsx` / `status-badge.tsx` files themselves were NOT deleted (Methodology still uses them — out of scope).
- Used logical CSS properties throughout (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`/`text-end`). Verified with ripgrep that no `ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-`/`text-left`/`text-right` physical utilities remain in any KB/Glossary component or page.
- Did NOT add `dir="rtl"` to any element — `<html dir="rtl">` already handles direction globally. (The only `dir="rtl"` reference in `term-form.tsx` is inside a code comment.)
- All visible text is Arabic (titles, descriptions, labels, placeholders, buttons, dropdown items, table headers, empty states, pagination, aria-labels).
- Did NOT run lint or dev server per task instructions. Code-only edits with no logic/structural changes beyond the schema swap, so regression risk is contained to the rewritten modules.
- Did NOT modify the existing `use-knowledge-base.ts` / `use-glossary.ts` hooks (already Supabase-correct from REBUILD-API), the services, validators, or the API routes — the UI just consumes them.

Stage Summary:
- Knowledge Base (9 files) + Glossary (8 files) UI layers fully rewritten to match the new Supabase schema: single Arabic fields, no level/status, search-only filters, 2-card stats with `{ total, domains }` interface, full Arabic copy, logical CSS properties throughout, no per-element `dir="rtl"`.
- Key pattern: keywords (string[]) bridged through a local text state + `setValue("keywords", parsedArray)` so the user types comma-separated text (Latin or Arabic comma) and RHF/zod still validate the `string[] | null` schema. Display join uses Arabic comma "، " for natural RTL reading.
- Key pattern: created_at formatted with `date-fns/locale/ar` so "أُنشئ" column shows Arabic relative time ("منذ X دقيقة"). Glossary has no createdAt field so no time column there.
- The vertical-slice pattern (page → view → toolbar + table → dialogs → form → columns → stats) is preserved; only the schema-shaped pieces (form fields, columns, stats cards, filter interface, query shape) changed. This means Methodology (still bilingual FR/AR + level/status) is now the outlier and will need the same treatment in a future task.
- Recommended next verification (when dev server is run): confirm /knowledge-base renders the 2-card stats + search-only toolbar + new columns (title+preview, المجال, الوحدة, keyword badges, أُنشئ) + create/edit/delete dialogs work end-to-end via the webhook; confirm /glossary renders the same shape with the simpler term/definition/unit/domain form; confirm Arabic date locale renders correctly; confirm no console errors; confirm regression-free navigation between Dashboard / KB / Glossary / Methodology.


---
Task ID: REBUILD-UI-2
Agent: general-purpose (sub agent)
Task: Rebuild the Methodology + Student Questions UI components for the new Supabase schema (methodology_rules: title/explanation/keywords; user_questions: question/answer/sessionId/userId/createdAt with DERIVED status "new"=no answer / "answered"=has answer). All Arabic, RTL inherited from <html dir="rtl">, no dir="rtl" on individual elements (dir="auto" allowed for mixed Arabic/French student-question text). Removed all imports of LevelBadge/StatusBadge/QuestionStatusBadge/CONTENT_STATUSES/EDUCATION_LEVELS from these modules.

Work Log:
- Audited existing scaffolding: domain types (Methodology: id/title/explanation/keywords; StudentQuestion: id/question/answer/sessionId/userId/createdAt + QuestionStatus="new"|"answered"), validators (createMethodologySchema: title/explanation/keywords nullable; updateStudentQuestionSchema: answer nullable), services (listMethodologies with search+pagination; listStudentQuestions with search+status+pagination; getMethodologyStats returns {total}; getStudentQuestionStats returns {total,new,answered}), hooks (useMethodologies/useCreate/Update/DeleteMethodology; useStudentQuestions/useUpdate/DeleteStudentQuestion with Arabic toasts), nav config already enables methodology + student-questions.
- Methodology rewrite (9 files in src/components/methodology/ + page.tsx):
  - methodology-form.tsx: RHF + zodResolver(createMethodologySchema). Fields: title (العنوان — Input), explanation (الشرح — Textarea, 6 rows), keywords (الكلمات المفتاحية — Input comma-separated text → string[]). Keywords handled via local React state mirrored into RHF via setValue("keywords", arr|null) on change so the user can freely type trailing separators; split on both Latin "," and Arabic "،"; initialized lazily from defaultValues?.keywords. On submit, normalizes empty explanation/keywords → null for clean DB NULLs. Buttons: "إلغاء" (outline) + isEdit ? "حفظ التغييرات" : "إنشاء قاعدة" (with Loader2 spinner when submitting).
  - columns.tsx: 4 columns — select (Checkbox, aria "تحديد الكل"/"تحديد الصف"), title (header "العنوان", cell shows title in medium weight + explanation preview below as muted line-clamp-1 max-w-42ch), keywords (header "الكلمات المفتاحية", renders up to 3 Badge variant=secondary + "+N" outline Badge when more; "—" muted when empty; enableSorting false), actions (RowActionsCell dropdown with "تعديل"/"حذف", destructive styling on delete). Row-actions wrapper text-start (logical) not text-right.
  - methodology-stats.tsx: 1 card "إجمالي القواعد" with Route icon + brand tint. Interface { total: number }. Grid sm:grid-cols-3 with col-span-1 so the card aligns with the 3-column grid used by other modules without filling all 3 slots.
  - methodology-table-toolbar.tsx: search-only (no level/status Selects). Placeholder "بحث…". Search icon positioned with start-2.5 + Input padding ps-8 (logical). Button "قاعدة جديدة" with Plus icon, brand styling. Interface MethodologyTableFilters { search: string }.
  - methodology-table.tsx: TanStack Table, SortingState initialized to [] (no default sort — preserves server alphabetical order), pagination pageSize 10, skeleton loading rows, empty state "لا توجد قواعد" + "حاول تعديل المرشحات أو أضف قاعدة جديدة." with Inbox icon. Pagination footer translated: "{n} من {total} محدد", "مسح", "الصفوف", "صفحة X من Y", aria-labels "الصفحة الأولى/السابقة/التالية/الأخيرة".
  - methodology-dialog.tsx: Dialog (sm:max-w-2xl), title "قاعدة جديدة"/"تعديل القاعدة", description Arabic; hands off to MethodologyForm. Uses useCreateMethodology/useUpdateMethodology with onSuccess closing the dialog.
  - delete-methodology-dialog.tsx: AlertDialog, title "حذف القاعدة؟", description shows methodology.title in font-medium. Cancel "إلغاء" + Action "حذف" (destructive bg, Loader2 + Trash2 icons).
  - methodology-view.tsx: client orchestrator with MethodologyTableFilters { search: string } only. Debounced search (300ms) drives query { search, page: 1, pageSize: 50 }. Owns edit + delete dialog state. data?.items ?? initialItems fallback for instant first paint.
  - app/(admin)/methodology/page.tsx: Server Component, parallel fetch listMethodologies({page:1,pageSize:50}) + getMethodologyStats(). h1 "القواعد المنهاجية" with Route icon in brand tint box. Description "القواعد التوجيهية لمساعد الذكاء الاصطناعي." metadata title "القواعد المنهاجية".
- Student Questions create (9 files in src/components/student-questions/ + page.tsx):
  - answer-form.tsx: RHF + zodResolver(updateStudentQuestionSchema) — only the answer field is editable. Read-only question panel rendered inside a bordered muted box with dir="auto" so mixed Arabic/French student text auto-orientates; Label "السؤال". Editable Textarea (8 rows) with Label "الإجابة", dir="auto", placeholder "اكتب أو حسّن إجابة المساعد…". On submit normalizes empty answer → null (the derived "new" status depends on a true NULL). Buttons: "إلغاء" + "حفظ الإجابة".
  - columns.tsx: 5 columns — select, question (header "السؤال", dir="auto" on both question + answer-preview lines, line-clamp-2/1, answer preview falls back to "لا توجد إجابة بعد"), session/user (header "الجلسة / المستخدم", muted font-mono text-xs dir="ltr" so Telegram IDs render LTR inside the RTL row; truncates long IDs with title tooltip; "—" when both absent), createdAt (header "الوقت", formatDistanceToNow with locale=ar from date-fns/locale, addSuffix true; "—" when missing), actions ("تعديل الإجابة" + "حذف").
  - student-question-stats.tsx: 3 cards in grid sm:grid-cols-3 — "إجمالي الأسئلة" (MessageCircleQuestion, default tone), "جديد" (Sparkles, brand tone), "تمت الإجابة" (CheckCircle2, muted tone). Interface { total: number; new: number; answered: number }.
  - questions-table-toolbar.tsx: search Input (placeholder "بحث في السؤال أو الإجابة…", start-2.5 + ps-8) + status Select with 3 options only ("all" → "كل الحالات", "new" → "جديد", "answered" → "تمت الإجابة") — deliberately NO "flagged" option. Clear button (with X icon, "مسح") shows when search !== "" OR status !== "all". NO "New question" button — questions arrive via Telegram. Exports QuestionStatusFilter type + QuestionsTableFilters { search; status }.
  - questions-table.tsx: TanStack Table mirroring methodology-table.tsx — empty SortingState, pageSize 10, skeleton rows, empty state "لا توجد أسئلة" + "الأسئلة الواردة عبر تيليجرام تظهر هنا." Inbox icon. Pagination footer fully translated. Uses getQuestionColumns from columns.tsx.
  - answer-dialog.tsx: Dialog title "تعديل الإجابة", description "اكتب أو حسّن إجابة المساعد على سؤال الطالب.", hands off to AnswerForm (only rendered when `question` is non-null). Uses useUpdateStudentQuestion with onSuccess closing the dialog.
  - delete-question-dialog.tsx: AlertDialog title "حذف السؤال؟", description shows question.question in font-medium with dir="auto" (mixed Arabic/French). Cancel "إلغاء" + Action "حذف" (destructive, Loader2 + Trash2).
  - student-questions-view.tsx: client orchestrator with QuestionsTableFilters { search; status }. Debounced search (300ms) + status passed to query { search, status, page: 1, pageSize: 50 }. Owns edit-answer + delete dialog state.
  - app/(admin)/student-questions/page.tsx: Server Component, parallel fetch listStudentQuestions({page:1,pageSize:50}) + getStudentQuestionStats(). h1 "أسئلة الطلاب" with MessageCircleQuestion icon in brand box + Badge "Telegram". Description "الأسئلة الواردة عبر تيليجرام من الطلاب. راجع الإجابات، حسّنها، أو احذف ما لا يلزم." metadata title "أسئلة الطلاب".
- Cross-cutting:
  - RTL: all positioning uses logical Tailwind utilities — Search icon `start-2.5`, Input padding `ps-8`, row-actions wrapper `text-start`. No `dir="rtl"` on any element (page-level <html dir="rtl"> handles it). Verified by grep — only comment-string match in methodology-form.tsx.
  - dir="auto" applied to: AnswerForm question panel + answer Textarea; columns.tsx question + answer-preview spans; delete-question-dialog question.question span — all for mixed Arabic/French content.
  - dir="ltr" applied to: session/user ID spans in student-questions columns.tsx so Telegram numeric/UUID identifiers render LTR inside the RTL row.
  - Removed imports check (grep across both module dirs): no LevelBadge, no StatusBadge, no QuestionStatusBadge (does not exist in repo, was a defensive name in the brief), no CONTENT_STATUSES, no EDUCATION_LEVELS.
  - date-fns v4 Arabic locale imported via `import { ar } from "date-fns/locale"` (verified barrel re-exports ar from ./locale/ar.js).
  - Both pages reuse the existing Server-Component-first pattern: parallel fetch list + stats → client View with initialItems fallback → TanStack Query keeps fresh.
  - Did NOT run lint or dev server per task constraints.

Stage Summary:
- 18 files delivered (9 methodology rewritten in place, 8 student-questions components created new, 2 page.tsx files). Methodology module now matches the new minimal schema (title/explanation/keywords) with no leftover bilingual/order/status fields. Student Questions module is a fresh build matching the user_questions schema with derived status (no DB status column).
- Methodology stat card intentionally single (the schema has no status/level fields to aggregate, so only "إجمالي القواعد" is meaningful). Student Questions has 3 cards (total/new/answered) where new = answer IS NULL, answered = answer IS NOT NULL — counts come straight from getStudentQuestionStats() and never depend on a stored status.
- The student-questions toolbar intentionally has no "New" button (Telegram-only ingestion); the questions-table-toolbar has only "new" + "answered" in the status filter (no "flagged").
- Form patterns: keywords edited as comma-separated text via local state mirrored into RHF (so the user can type "تركيب،" without losing the trailing comma); answer form normalizes empty string → null on submit so the derived status flips back to "new" when the user clears the field.
- All text is Arabic; RTL flows from <html dir="rtl">; mixed Arabic/French student-question text uses dir="auto"; Telegram IDs use dir="ltr". Logical CSS properties (start/end/ps/pe/ms/me/text-start) used throughout so the same markup works in either direction.
- Ready for verification once the dev server runs: /methodology shows "القواعد المنهاجية" + 1 stat card + search-only toolbar + table with keyword badges; /student-questions shows "أسئلة الطلاب" + Telegram badge + 3 stat cards + search+status toolbar + table with dir="auto" question cells + Arabic relative times. CREATE flow only on methodology; EDIT-ANSWER + DELETE on student-questions.

---
Task ID: REBUILD-UI-3
Agent: general-purpose (sub agent)
Task: Create the Analytics + Settings UI modules (these two modules did not exist in the reverted codebase). Both pages are Arabic/RTL and consume existing services (getKnowledgeBaseStats / getGlossaryStats / getMethodologyStats / getStudentQuestionStats / getRecentUnansweredQuestions / checkSupabaseConnection / getAllSettings / updateSettings) and the existing useUpdateSettings hook. No new services, hooks, or API routes were created.

Work Log:
- Audited the existing surface before writing UI: domain types (`StudentQuestion = { id, question, answer, sessionId, userId, createdAt }`), service signatures (all six read/connection functions exist and return the expected shapes), settings constants (`SETTING_GROUPS` = general + webhook, `SETTING_DEFINITIONS` = 3 entries: general.app_name, general.subject, webhook.url — none marked secret), settings service exports `SettingItem` + `SettingsByGroup` interfaces, the shadcn `chart.tsx` wrapper exports `ChartContainer / ChartTooltip / ChartTooltipContent / ChartLegend / ChartLegendContent` + `ChartConfig` type, the shadcn `card.tsx` exports `Card / CardHeader / CardTitle / CardDescription / CardContent / CardFooter / CardAction`, the `useUpdateSettings` hook does optimistic cache update + Arabic success toast "تم حفظ الإعدادات" and returns the fresh `SettingsByGroup[]` from the server.

Analytics module — created 5 files under `src/components/analytics/` + the route page:
1. `src/components/analytics/kpi-card.tsx` — Server Component. Whole card wrapped in `next/link` `<Link href>`. Props: `title`, `value`, `subtitle?`, `icon: LucideIcon`, `href`, `tone?: "brand" | "muted" | "warn" | "default"`. Exports `KpiTone` type. Icon chip uses tone-keyed backgrounds: brand → `bg-brand/10 text-brand`, muted → `bg-muted text-muted-foreground`, warn → `bg-amber-500/15 text-amber-700 dark:text-amber-400`, default → `bg-foreground/5 text-foreground`. Card has hover state (`hover:border-border/80 hover:bg-muted/30`) and `ArrowUpRight` affordance icon (kept consistent with `module-card.tsx` — worklog REBUILD-LAYOUT noted this as a future RTL polish item). `h-full` so all cards in a grid row match height.
2. `src/components/analytics/status-donut-chart.tsx` — `"use client"`. Recharts PieChart donut. Title "الأسئلة حسب الحالة" + description "توزيع الأسئلة الواردة من الطلاب". `chartConfig = { new: { label: "جديد", color: "#0ea5e9" }, answered: { label: "تمت الإجابة", color: "#10b981" } }` (sky-500 / emerald-500 — actual hex values so ChartStyle's `--color-new` / `--color-answered` CSS vars resolve correctly; self-referential `var(--color-…)` here would be circular). Props: `data: { status, label, count, fill }[]`. The `fill` field in each datum is `var(--color-new)` / `var(--color-answered)` so colors are wired through ChartStyle. Pie `innerRadius=55 outerRadius=85 paddingAngle=3 strokeWidth=2`; each slice colored via `<Cell fill={entry.fill} />`. ChartTooltip + ChartTooltipContent with `nameKey="status" hideLabel` so the tooltip resolves the Arabic label via `getPayloadConfigFromPayload`. ChartLegend + ChartLegendContent with `nameKey="status"` so the legend dots resolve to "جديد" / "تمت الإجابة". Empty state when `total === 0`: centered `text-muted-foreground` "لا توجد أسئلة بعد" inside a 240px box to match the chart's height. ChartContainer className `aspect-auto mx-auto h-[240px] w-full` (overrides default `aspect-video`).
3. `src/components/analytics/readiness-bar-chart.tsx` — `"use client"`. Recharts BarChart, horizontal bars (`layout="vertical"`) so long Arabic category labels ("قاعدة المعرفة" / "المعجم" / "القواعد المنهاجية") sit on the inline-start edge and the bars extend toward the inline-end. Title "محتوى قاعدة المعرفة" + description "عدد العناصر في كل وحدة معرفية". `chartConfig = { total: { label: "الإجمالي", color: "var(--color-brand)" } }` — brand emerald so the bars tie back to the active-module accent. YAxis `orientation="right" width=110 tickLine=false axisLine=false tickMargin=8` puts Arabic labels on the right (start of RTL); XAxis `type="number" hide`. CartesianGrid both axes hidden for a clean look. Bar `fill="var(--color-total)" radius=4 maxBarSize=28`. ChartTooltip + ChartTooltipContent `nameKey="total" hideLabel`. ChartContainer `aspect-auto h-[240px] w-full`.
4. `src/components/analytics/recent-questions-feed.tsx` — Server Component. Title "في انتظار الإجابة". When there are questions, renders `CardAction` with a `next/link` "عرض الكل" → `/student-questions` link in brand color (the shadcn CardAction grid auto-flips to the inline-end in RTL). Empty state: centered CheckCircle2 (emerald) + "كل شيء منجز — لا توجد أسئلة بدون إجابة." Non-empty: `<ul class="divide-border divide-y">` of items each showing the question text in a `<p dir="auto">` (mixed Arabic/French from Telegram auto-orients) and an Arabic relative-time label below. Relative time uses `Intl.RelativeTimeFormat("ar", { numeric: "auto" })` (built-in, stable on Node 19+ server and client) — picks second/minute/hour/day/month/year based on the magnitude of the delta, returns strings like "منذ ٥ دقائق" / "قبل ٣ ساعات". Props: `questions: StudentQuestion[]`.
5. `src/app/(admin)/analytics/page.tsx` — Server Component. h1 "التحليلات" + Badge "نظرة عامة" + ChartNoAxesColumn icon in brand chip + description "نظرة شاملة على نشاط قاعدة المعرفة وأسئلة الطلاب." Parallel fetch via `Promise.allSettled([getKnowledgeBaseStats(), getGlossaryStats(), getMethodologyStats(), getStudentQuestionStats(), getRecentUnansweredQuestions(5)])` so a single failing service (e.g. missing table on a fresh DB) doesn't take the page down — each falls back to zero/empty. KPI grid (4 cards, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`): قاعدة المعرفة (Library, brand tone, subtitle = "{domains} مجالات"), المعجم (BookText, muted tone, "{domains} مجالات"), القواعد المنهاجية (Route, default tone, "قواعد التوجيه"), أسئلة الطلاب (MessageCircleQuestion, warn tone, "{new} جديدة · {answered} مُجابة"). Chart row (`grid-cols-1 lg:grid-cols-2`): StatusDonutChart (data: two slices new/answered with `var(--color-new)` / `var(--color-answered)` fills) + ReadinessBarChart (data: 3 rows module/total). Full-width RecentQuestionsFeed at the bottom. metadata title "التحليلات".

Settings module — created 3 files under `src/components/settings/` + the route page:
6. `src/components/settings/setting-field.tsx` — `"use client"`. Props: `label`, `value`, `onChange`, `secret?`, `placeholder?`, `help?`, `hasValue?`. Renders Label + (when `hasValue`) an outline "مُعدّ" Badge with emerald tint and Check icon ("Configured" → Arabic "مُعدّ"). Input with `dir="auto"` so Arabic values (app_name, subject) and URLs (webhook.url) auto-orient; `autoComplete="off" spellCheck={false}`. For secret fields: `type="password"` by default + reveal toggle Button (ghost, size icon, absolute `end-1 top-1/2 -translate-y-1/2 size-7`, `tabIndex=-1` so it doesn't trap keyboard focus, aria-label "إظهار القيمة" / "إخفاء القيمة") cycling Eye ↔ EyeOff; Input gets `pe-10` so text doesn't sit under the button. Help text below in muted `text-xs leading-relaxed`.
7. `src/components/settings/settings-form.tsx` — `"use client"`. Props: `groups: SettingsByGroup[]`. State model: `groups` mirrors the server snapshot (initialized from `initialGroups`), `overrides: Record<string, string>` holds dirty key → pending value. `useEffect([initialGroups])` re-syncs if the parent ever hands a new snapshot (won't happen during client-side mutations, but defensive). `handleChange(key, value)` mutates only `overrides`; `getEffectiveValue(item)` returns `overrides[key] ?? item.value`; `getEffectiveHasValue(item)` returns `Boolean(overrides[key])` when dirty, else `item.hasValue` — so the "مُعدّ" badge flips live as the user types/clears. Only the dirty keys are sent on save (matches the server's `updateSettings` API which skips masked/empty secret values). Save flow: `updateMutation.mutateAsync({ settings: overrides })` → on success `setGroups(result)` (replaces with the authoritative server response — re-masks secrets, recomputes hasValue) + `setOverrides({})`. Sticky save bar at `bottom-4 z-20` with backdrop blur (`bg-card/95 supports-[backdrop-filter]:bg-card/80`): status dot (amber-500 when dirty / emerald-500 when saved) + label "{n} تغيير غير محفوظ" / "تم حفظ جميع التغييرات" + "تراجع" ghost button (RotateCcw icon, only when dirty) + "حفظ التغييرات" brand button (Save icon, disabled when !isDirty || isSaving, label flips to "جارٍ الحفظ…" while pending). Border color also flips amber/emerald with the dirty state. Renders one Card per group with CardTitle=group.label + CardDescription=group.description, then SettingField per item.
8. `src/app/(admin)/settings/page.tsx` — Server Component. h1 "الإعدادات" + Badge "مساحة العمل" + Settings icon in brand chip + description "إعدادات عامة وتكامل Webhook للمساعد." Parallel `Promise.all([checkSupabaseConnection(), getAllSettings().then(ok).catch(err)])` — the settings read is wrapped in try/catch so a missing table or any other unexpected failure doesn't crash the page. The Supabase URL host is extracted from `process.env.SUPABASE_URL` via `new URL(...).host` (wrapped in try/catch). Connection banner: rounded-xl border, emerald tint + CheckCircle2 + "متصل بقاعدة البيانات" + host (dir="ltr") when connected; destructive tint + AlertTriangle + "غير متصل بقاعدة البيانات" + error message (dir="ltr") when not. When the connection error is exactly "جدول الإعدادات غير موجود" (the marker `checkSupabaseConnection` returns in that case), an amber-tinted SQL setup card renders with the full `create table public.settings (...)` + RLS + service-role policy in a `<pre dir="ltr">` block so the admin can copy-paste into Supabase. If `getAllSettings` failed for any other reason while connected, a destructive-tinted "تعذّر تحميل الإعدادات" card shows the error. When `groups.length > 0`, the SettingsForm renders below. metadata title "الإعدادات".

Cross-cutting:
- RTL: every spacing/positioning utility uses logical properties (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`/`text-start`). The reveal-eye Button on secret inputs uses `end-1` so it docks to the inline-end in both directions. No `dir="rtl"` on any element (page-level `<html dir="rtl">` handles it). `dir="auto"` on the SettingField Input (Arabic + URL values) and on the RecentQuestionsFeed question text (mixed Arabic/French from Telegram). `dir="ltr"` on the Supabase host/error string and the SQL `<pre>` block (URLs + SQL are LTR).
- All visible text is Arabic: page titles, badges, KPI labels + subtitles, chart titles + descriptions, legend + tooltip labels (via chartConfig), feed title + empty state + relative-time strings, settings group labels + descriptions (sourced from `SETTING_GROUPS`), field labels (sourced from `SETTING_DEFINITIONS`), help text, the "مُعدّ" badge, sticky save bar status + buttons, connection banner states, SQL card title + description.
- Server/Client split: KpiCard, RecentQuestionsFeed, and both pages are Server Components (no `"use client"`). StatusDonutChart, ReadinessBarChart, SettingField, and SettingsForm are Client Components (Recharts needs a measured container; SettingField owns password-reveal state; SettingsForm owns overrides + mutation state). The pages pass server-fetched data as props to the client islands.
- Did NOT run lint or dev server per task instructions. No new services, hooks, or API routes were created — the UI consumes what REBUILD-API + REBUILD-UI-1/2 already shipped.

Stage Summary:
- 8 files delivered (5 analytics + 3 settings + 2 route pages). The Analytics module gives a one-screen overview: 4 KPI cards (KB / Glossary / Methodology / Student Questions) → 2-col chart row (status donut + readiness bar) → full-width recent unanswered questions feed. The Settings module renders a Supabase connection banner + (when needed) the SQL setup card + grouped settings form with a sticky save bar that tracks dirty count and only sends changed keys.
- Key chart-color wiring: `chartConfig` entries carry the actual color value (hex `#0ea5e9` / `#10b981` for the donut, `var(--color-brand)` for the bar — theme-aware for the brand bar); ChartStyle writes `--color-<key>` CSS vars at the `[data-chart=…]` scope; data fills reference `var(--color-<key>)` so the same chart works in light + dark. Self-referential `var(--color-new)` inside chartConfig would have been circular — avoided.
- Key RTL chart choice: the readiness bar chart uses `layout="vertical"` (horizontal bars) + `YAxis orientation="right"` so long Arabic category labels dock to the inline-start (right) and bars extend toward the inline-end (left). With vertical columns the three long labels would have overlapped on the X axis.
- Key settings form pattern: dirty tracking via a single `overrides: Record<string, string>` map. Only dirty keys are sent on save (matches the server's skip-masked-secrets behavior). After save, the local `groups` snapshot is replaced with the server response so secrets re-mask and `hasValue` recomputes; `overrides` is cleared. The "مُعدّ" badge is computed from `getEffectiveHasValue(item)` so it flips live as the user types into a secret field.
- Key graceful-degradation pattern: both pages wrap their server fetches so a missing table (fresh Supabase project) or a single failing service doesn't 500 the page — Analytics uses `Promise.allSettled` and falls back to zero/empty values; Settings uses try/catch on `getAllSettings` and surfaces either the SQL setup card (when the connection probe specifically reports the settings table missing) or an inline destructive error card (any other failure) while still rendering the connection banner.
- Recommended next verification (when dev server runs): /analytics renders the 4 KPI cards with correct counts + subtitles, the donut shows new vs answered question slices with Arabic legend, the bar chart shows 3 horizontal bars with Arabic labels on the right, the recent questions feed lists up to 5 unanswered questions with Arabic relative times (or the empty-state message). /settings renders the green/red connection banner with the Supabase host, the grouped form with 2 cards (عام + Webhook), the sticky save bar that's disabled + green ("تم حفظ جميع التغييرات") initially, flips to amber "{n} تغيير غير محفوظ" with "حفظ التغييرات" + "تراجع" enabled on first edit, and saves via the existing PUT /api/settings route. If the settings table is dropped, /settings shows the SQL setup card with the create-table statement.

---
Task ID: REBUILD-FINAL
Agent: main (orchestrator)
Task: Full rebuild after git rollback. Restored Supabase + Arabic RTL + Webhook architecture.

Work Log:
- Discovered project reverted to early Prisma/SQLite English/LTR state via git.
- Rebuilt foundation: .env (Supabase creds), @supabase/supabase-js installed, lib/supabase.ts, lib/webhook.ts, lib/api.ts, lib/fetch.ts.
- Rewrote domain types for existing Supabase tables (knowledge_base, glossary, methodology_rules, user_questions).
- Created validators for all 5 modules (Arabic error messages).
- Created constants (education, settings — simplified to general + webhook only).
- Rewrote all 5 services: Supabase for reads, webhook for writes (KB/Glossary/Methodology), DB direct for Settings + Student Questions answer edits.
- 5 parallel subagents rebuilt: API routes (9 files) + hooks (5 files) + layout/dashboard (12 files) + KB/Glossary UI (18 files) + Methodology/StudentQ UI (18 files) + Analytics/Settings UI (8 files).
- Lint: 0 errors, 5 warnings (React Compiler notes).
- Dev server restarted. All 7 pages verified:
  - Dashboard: "الرئيسية" ✓
  - Knowledge Base: "قاعدة المعرفة" ✓ (1 row from Supabase)
  - Glossary: "المعجم" ✓
  - Methodology: "القواعد المنهاجية" ✓
  - Student Questions: "أسئلة الطلاب" ✓
  - Analytics: "التحليلات" ✓
  - Settings: "الإعدادات" ✓ (shows "متصل" — Supabase connected)
- RTL verified: dir="rtl" lang="ar", sidebar on right (left:1184 in 1440px viewport).
- Zero errors across all pages.

Stage Summary:
- Full rebuild complete. App is back to: Arabic RTL + Supabase (existing tables) + Webhook writes (KB/Glossary/Methodology) + DB direct (Settings/Student Questions).
- Architecture: reads from Supabase, writes via webhook (n8n handles DB + RAG processing), settings in DB directly.

---
Task ID: KB-FORM-REDESIGN
Agent: main (orchestrator)
Task: Redesign KB form — add level field, domain/unit dropdowns, reorder fields, rename button, create taxonomy manager.

Work Log:
- Created taxonomy service (src/lib/services/taxonomy.ts): stores domains/units per level as JSON in settings table (key: "knowledge.taxonomy"). Structure: { "3AS": { domains: [], units: {} }, ... }
- Created constants file (src/lib/constants/taxonomy.ts): EducationLevelKey, LEVEL_LABELS, TaxonomyData — separated from service to avoid importing supabase client into client components.
- Created API route (src/app/api/taxonomy/route.ts): GET + PUT.
- Created hook (src/hooks/queries/use-taxonomy.ts): useTaxonomy + useUpdateTaxonomy.
- Updated KB validator: added `level` field (default "3AS").
- Updated domain type: added `level` to KnowledgeDocument.
- Updated KB service: includes `level` in webhook payload for create/update.
- Rewrote document-form.tsx with new field order: 1) المستوى الدراسي (dropdown, default 3AS), 2) المجال (dropdown from taxonomy), 3) الوحدة (dropdown from taxonomy, disabled until domain selected), 4) النشاط, 5) المحتوى المعرفي, 6) الكلمات المفتاحية, 7) تعليمات للبوت. Button: "إضافة معرفة".
- Updated dialog: "إضافة معرفة" / "تعديل المعرفة".
- Updated toolbar button: "إضافة معرفة".
- Created taxonomy-manager.tsx: management UI with level tabs (1/2/3 ثانوي), add/remove domains, expand domain to see/add/remove units. Added to settings page.
- Fixed client-side crash: taxonomy constants were in services/taxonomy.ts which imports supabase.ts (server-only). Moved constants to separate file to prevent supabase client from being bundled into client components.
- Lint: 0 errors, 6 warnings.

Verification (Agent Browser):
- KB page renders: "قاعدة المعرفة" ✓
- Form opens with correct field order ✓
- Level dropdown defaults to "3 ثانوي" ✓
- Domain dropdown shows "— غير محدد —" (empty, no domains configured yet) ✓
- Unit dropdown disabled until domain selected ✓
- Button says "إضافة معرفة" ✓
- Settings page shows "تصنيف المعرفة" section with 3 level tabs ✓
- No errors ✓
