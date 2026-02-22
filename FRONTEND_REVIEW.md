# Frontend Review — 2026-02-22

Page-by-page audit of every route. Code read, routes hit, issues documented.

---

## Route Map (30 pages total)

```
LIVE ROUTES (new /c/[slug]/ structure):
  /                                    Homepage — network directory
  /create                              Create new constitution form
  /c/[slug]/                           Constitution landing (principles)
  /c/[slug]/registry                   Member registry
  /c/[slug]/dashboard                  Personal dashboard (wallet-gated)
  /c/[slug]/quickstart                 Sign + register flow (4 steps)
  /c/[slug]/join                       Agent setup guide (markdown doc)
  /c/[slug]/governance                 Proposals list
  /c/[slug]/governance/[id]            Proposal detail + voting
  /c/[slug]/governance/new             Create proposal form
  /c/[slug]/governance/tiers           Tier overview + stats
  /c/[slug]/governance/tiers/[level]   Tier detail + members
  /c/[slug]/governance/promotions      Promotions list
  /c/[slug]/governance/promotions/[id] Promotion detail + voting
  /c/[slug]/governance/promotions/new  Create promotion form

REDIRECTS (all 308 to /c/emergentvibe/...):
  /sign          → /c/emergentvibe/quickstart
  /constitution  → /c/emergentvibe
  /registry      → /c/emergentvibe/registry
  /quickstart    → /c/emergentvibe/quickstart
  /join          → /c/emergentvibe/join
  /dashboard     → /c/emergentvibe/dashboard
  /governance    → /c/emergentvibe/governance
  /governance/*  → /c/emergentvibe/governance/*

DEAD PAGES (still exist as files, should be deleted):
  /self-improve  — Genesis protocol reader, not linked from anywhere in new structure
  /constitution/ — Old constitution reader (still served, shadowed by redirect)

GHOST PAGES (old files still exist but redirect catches them):
  /governance/*, /registry/, /quickstart/, /dashboard/, /join/ — old pages still on disk
```

---

## Page-by-Page Review

### 1. `/` — Homepage (HomeClient.tsx, 674 lines)

**What it does:** Full-viewport hero with animated particle canvas, frosted glass panel, concept boxes floating around with SVG spokes connecting them. Below fold: "What this is" section, "How it works" steps, constitutions directory grid, signatories list, footer.

**Issues:**
- **DOUBLE FOOTER**: Layout.tsx renders a footer (ideologos.com link, line 57-66). HomeClient.tsx ALSO renders its own footer (lines 604-631). Both visible. Every other page gets the layout footer too, so the layout footer should probably be removed or the HomeClient one should be.
- **DOUBLE NAV on hero**: SiteNav renders at top (from layout.tsx). The hero section is full-viewport but the SiteNav floats over it. On non-`/c/` pages, SiteNav shows links to `/constitution`, `/registry`, `/governance` — but these redirect. So clicking nav links on homepage causes a redirect bounce.
- **Concept boxes overlap on mobile**: Absolute positioning with `top-[12%] left-[6%]` etc. On small screens these overlap the central panel. Some are `hidden md:block` but not all.
- **Spokes SVG is fragile**: Uses hardcoded % positions that must match concept box positions. If box positions change, spokes point nowhere.
- **NetworkHero canvas**: 300 particles with spatial grid and connection lines. Looks good but uses `requestAnimationFrame` continuously — battery drain on mobile. No `prefers-reduced-motion` check.
- **`signatories` fetched from `/api/symbiont-hub/agents` without constitution scope**: Homepage shows ALL agents across all constitutions, not filtered. The constitutions directory is filtered but the signatories section below it is global.
- **Hardcoded "emergentvibe" in all "How it works" links**: Lines 411-432 hardcode `/c/emergentvibe/governance` etc. If you're a new constitution, the homepage funnels everyone to emergentvibe.
- **Loading state shows 0s**: Before fetch completes, stats show `0 signatories`, `v0.1.5`. Looks broken for a moment.

### 2. `/create` — Create Constitution (create/page.tsx, 185 lines)

**What it does:** Form to create a new constitution. Fields: name, slug (auto-generated), tagline, version, content (markdown), snapshot space, github URL. Wallet-authed via personal_sign.

**Issues:**
- **Signature message mismatch**: Frontend signs `I am creating the constitution "${name}" (${slug})...`. Backend verifies `Create constitution: ${slug}`. **These don't match.** The POST will always return 401 "Invalid signature". This page is broken.
- **`router.push(/c/${data.constitution.slug})`**: But the API returns `{ id, slug }` at top level, not nested under `constitution`. So `data.constitution.slug` is `undefined`. Should be `data.slug`.
- **No minimum content length feedback**: The `<textarea>` has `required minLength={100}` but no character counter or hint, unlike the proposal form which shows `{description.length}/100`.

### 3. `/c/[slug]/` — Constitution Landing (page.tsx, 15 lines)

**What it does:** Server component that reads `CONSTITUTION.md` from disk and renders it via `ConstitutionReader`.

**Issues:**
- **Always reads the same file**: Every constitution (emergentvibe, or any new one) shows the same `CONSTITUTION.md` from the repo root. The `constitutions` table has a `content` column, but this page ignores it and reads from disk. Multi-constitution is cosmetic — all constitutions show the emergentvibe principles.
- **ConstitutionReader has hardcoded links**: `SIGN_URL = "/quickstart"`, `JOIN_URL = "/join"`, `AMEND_URL = "/governance/new"` (lines 8-10). These are old paths. Inside `/c/[slug]/`, clicking "Sign the Constitution" goes to `/quickstart` which redirects to `/c/emergentvibe/quickstart` — even if you're in a different constitution.
- **Hardcoded version**: The subheader says `CONSTITUTION v0.1.5-draft` (line 84). Not dynamic.

### 4. `/c/[slug]/registry` — Registry (RegistryScoped.tsx, 167 lines)

**What it does:** Lists all agents/signatories for this constitution. Welcome banner if `?welcome=true`. Tier filter (All, 1, 2, 3).

**Issues:**
- **Tier filter hardcoded to 1/2/3**: Line 120 `(["all", 1, 2, 3] as const)`. The system supports infinite tiers, but the filter only shows 3. If someone is Tier 4+, they'd only show under "All".
- **No pagination**: Fetches all agents in one call. Fine for now, won't scale.
- **`apiUrl` correctly scopes by constitution** — this one is properly done.

### 5. `/c/[slug]/dashboard` — Dashboard (page.tsx, 226 lines)

**What it does:** Wallet-gated personal dashboard showing identity card, activity stats, recent votes, tier progression, action links.

**Issues:**
- **Well-scoped**: Uses `useConstitutionLinks()` throughout. API calls include constitution param. No issues found here.
- **Tier progression text**: "You're Tier 1 - New with 0 others in your tier" — the label switches stop at Tier 3 (`Tier ${tier}` fallback). Minor.

### 6. `/c/[slug]/quickstart` — Sign Flow (page.tsx, ~310 lines)

**What it does:** 4-step wizard: What you're signing → Your details → Sign with wallet → Done. Creates operator token, optionally registers human-only agent.

**Issues:**
- **CONSTITUTION_SUMMARY is hardcoded**: Lines 10-14 hardcode the "three core commitments" text. A different constitution would show emergentvibe's principles.
- **Registration warning** (Phase 4 fix): Shows warning if auto-registration fails. Good.
- **`constitution.name.toUpperCase()`**: Line 129. Dynamic, good.
- **Message text references "27 principles"**: Line 61, 73. Hardcoded. A different constitution might have a different number of principles.
- **No validation that user isn't already registered**: Can go through the flow multiple times. Not necessarily a bug (re-signing could be valid).

### 7. `/c/[slug]/join` — Agent Setup Guide (page.tsx, 15 lines)

**What it does:** Server component reading `content/JOIN.md`, rendered via `JoinReader`.

**Issues:**
- **Same as ConstitutionReader problem**: Reads a single static file. All constitutions show the same agent setup guide.
- **JoinReader has hardcoded links**: `href="/"`, `href="/quickstart"`, `href="/constitution"`, `href="/self-improve"` (lines 80, 110, 157, 163). All old paths. Inside `/c/other-constitution/join`, "Back" goes to `/` (fine), but "Authorize Agent" goes to `/quickstart` → redirects to `/c/emergentvibe/quickstart` (wrong constitution).
- **Links to `/self-improve`**: Line 163. This page has no redirect — it's a dead page that shouldn't be linked.
- **Own sticky header**: JoinReader renders its own sticky header with "← Back" (line 78-117). This stacks under the SiteNav AND the ConstitutionShell sub-nav. Three nav bars.

### 8. `/c/[slug]/governance` — Proposals List (page.tsx, 302 lines)

**What it does:** Lists governance proposals with filter tabs (All/Active/Pending/Closed). Inline proposal cards. Tier info bar, how-it-works explainer.

**Issues:**
- **Well-scoped**: Uses `apiUrl()` for all API calls, `link()` for all navigation. No hardcoded paths.
- **Filter tab state bug**: Line 80 `const state = filter === "all" ? "" : `&state=${filter}``. This appends `&state=active` to the URL, but `apiUrl()` already includes `?constitution=slug&source=all`. The `&` works but it's fragile — relies on apiUrl always producing a `?` first.
- **Duplicate `formatDistanceToNow`**: This function is defined here AND in `governance/[id]/page.tsx`. Should be shared.
- **Large info boxes**: Two colored info boxes at top (tier gate + how governance works) take up significant vertical space before you see any proposals. On mobile this means scrolling past two boxes before reaching content.

### 9. `/c/[slug]/governance/[id]` — Proposal Detail (page.tsx, 284 lines)

**What it does:** Proposal detail with voting results, vote panel, Snapshot submit for drafts, description, thresholds.

**Issues:**
- **Snapshot link uses dynamic `constitution.snapshot_space`** — good.
- **`canVote` logic**: Line 146 `const canVote = walletAddress && isActive`. This lets anyone with a connected wallet vote. The tier check happens server-side, but the UI shows the vote panel to everyone. The tier gate warning (lines 225-232) shows separately but the vote panel still renders below it. User sees both "You need Tier 2" AND the vote buttons.
- **Duplicate `formatDistanceToNow` and `formatDate`** — same as governance list.
- **`SnapshotSubmit` component**: Used here for draft→Snapshot submission. Not checked if it uses dynamic snapshot_space or hardcoded. (Checked: it has `SNAPSHOT_SPACE = 'emergentvibe.eth'` hardcoded — **BUG** for multi-constitution.)

### 10. `/c/[slug]/governance/new` — Create Proposal (page.tsx, 237 lines)

**What it does:** Form to create a governance proposal with type selection, then optionally submit to Snapshot.

**Issues:**
- **`submittingSnapshot` state exists but never shown properly**: The button text switches between "Creating..." / "Submitting to Snapshot..." / "Create Draft Proposal" but `submittingSnapshot` is set after `submitting` is false (line 93-94). The button might flash.
- **Snapshot space dynamic**: Line 114 `constitution.snapshot_space` — correctly uses constitution context.
- **No tier gate on the form**: Anyone can fill out and submit. The API doesn't check tier either — `POST /api/governance/proposals` has no tier requirement. Only voting requires Tier 2+.

### 11. `/c/[slug]/governance/tiers` — Tier Overview (page.tsx, 163 lines)

**What it does:** Shows all tiers with member counts, decision scopes, tier escalation explainer, network config.

**Issues:**
- **Own sticky header**: Line 70-78. Renders its own `<header>` with back link, title, action button. This stacks under SiteNav + ConstitutionShell. Three nav bars again.
- **Well-scoped otherwise**: Uses `apiUrl()` and `link()` correctly.

### 12. `/c/[slug]/governance/tiers/[level]` — Tier Detail (page.tsx, 143 lines)

**What it does:** Shows tier info and member list.

**Issues:**
- **Own sticky header**: Same triple-nav problem.
- **"Sign the Constitution" link for empty Tier 1**: Line 111 `link("/quickstart")` — correctly scoped.

### 13. `/c/[slug]/governance/promotions` — Promotions List (page.tsx, 148 lines)

**What it does:** Lists promotions with status filter.

**Issues:**
- **Own sticky header**: Triple nav.
- **Filter default is "pending"**: Line 27. The "All" filter button has value `""` (empty string). This means clicking "All" fetches with no status param, which works, but the code `filter ? { status: filter } : {}` at line 39 would always be truthy (even for "pending"). Actually `""` is falsy in JS, so "All" correctly omits the status. But "pending" is the default, so first load doesn't show all promotions.

### 14. `/c/[slug]/governance/promotions/[id]` — Promotion Detail (page.tsx, 222 lines)

**What it does:** Promotion detail with vote progress, vote history, vote casting.

**Issues:**
- **`prompt()` for voter ID**: Line 71 `const voterId = prompt("Enter your agent ID to vote:")`. This is a terrible UX — it uses browser `prompt()` dialog to get an agent UUID. Users don't know their agent UUID. This should use the connected wallet to look up the agent ID automatically, like the governance vote flow does.
- **`alert()` for errors**: Line 86. Should be inline error state.
- **Own sticky header**: Triple nav.

### 15. `/c/[slug]/governance/promotions/new` — Create Promotion (page.tsx, 198 lines)

**What it does:** Form to propose a promotion. Select tier, select nominees, provide rationale.

**Issues:**
- **"Your Agent ID" manual input**: Line 119-123. Same problem as promotion voting — requires manual UUID entry. Should auto-detect from wallet.
- **Own sticky header**: Triple nav.
- **Wrapped in Suspense**: For `useSearchParams()`. Correct pattern.

---

## Cross-Cutting Issues

### CRITICAL

| # | Issue | Files Affected |
|---|-------|---------------|
| 1 | **Create constitution is broken** — frontend signs different message than backend verifies | `create/page.tsx:52` vs `api/constitutions/route.ts:62` |
| 2 | **SnapshotSubmit hardcodes `emergentvibe.eth`** — multi-constitution Snapshot broken | `components/governance/SnapshotSubmit.tsx` |
| 3 | **ConstitutionReader links are old paths** — "Sign" / "Join" / "Amend" go to wrong constitution | `constitution/ConstitutionReader.tsx:8-10` |
| 4 | **JoinReader links are old paths** — same problem + links to dead `/self-improve` | `join/JoinReader.tsx:80,110,157,163` |

### STRUCTURAL

| # | Issue | Description |
|---|-------|-------------|
| 5 | **Triple nav bar** | SiteNav + ConstitutionShell sub-nav + page-level sticky header. Tiers, promotions, join pages all render their own `<header>`. Three bars stacked. |
| 6 | **Old page files not deleted** | 17 old page files under `/governance/`, `/registry/`, `/quickstart/`, `/dashboard/`, `/join/`, `/constitution/`, `/self-improve/`. Redirects mask them but they're still deployed and compiled. |
| 7 | **Every constitution shows same content** | `/c/[slug]/` reads `CONSTITUTION.md` from disk. `/c/[slug]/join` reads `JOIN.md` from disk. Multi-constitution is DB-only — the actual principles text is always emergentvibe's. |
| 8 | **Homepage links hardcoded to emergentvibe** | "How it works" steps link to `/c/emergentvibe/*`. Should dynamically link to the first/default constitution, or be generic. |
| 9 | **Promotion voting uses `prompt()`** | Browser `prompt()` for agent UUID. Unusable for real users. |
| 10 | **Double footer on homepage** | Layout footer + HomeClient footer both render. |

### MINOR

| # | Issue | Description |
|---|-------|-------------|
| 11 | **Duplicate `formatDistanceToNow`** | Defined in governance list AND proposal detail. Should be shared util. |
| 12 | **Registry tier filter hardcoded to 3** | System supports infinite tiers but filter only shows 1/2/3. |
| 13 | **No `prefers-reduced-motion`** | NetworkHero particle animation runs continuously with no accessibility check. |
| 14 | **Signatories section on homepage is unscoped** | Shows all agents across all constitutions. |
| 15 | **Quickstart hardcodes "27 principles"** | Other constitutions may have different counts. |

---

## What's Actually Good

- **ConstitutionContext / useConstitutionLinks pattern**: Clean. `link()` and `apiUrl()` work well. All scoped pages use it consistently.
- **ConstitutionShell sub-nav**: Nice, lightweight, shows active tab.
- **Redirect strategy**: All old URLs redirect properly. 308 permanent. Clean.
- **404 for nonexistent constitutions**: `/c/nonexistent` → 404. Correct.
- **Dashboard**: Well-scoped, wallet-gated, good empty states.
- **Registry welcome banner**: Nice touch with auto-dismiss.
- **Governance page**: Good filter tabs, inline cards, proper empty state.
- **NetworkHero**: Visually impressive particle system with spatial grid optimization.

---

## Recommended Fix Order

1. **Fix create constitution** (signature mismatch + response shape) — it's fully broken
2. **Fix ConstitutionReader + JoinReader links** — use constitution context or pass links as props
3. **Fix SnapshotSubmit** — accept snapshot_space from props/context
4. **Remove page-level sticky headers** — ConstitutionShell already provides navigation
5. **Fix promotion voting UX** — replace `prompt()` with wallet-based agent lookup
6. **Delete old page files** — reduce bundle size, remove confusion
7. **Fix homepage scoping** — signatories per-constitution, "How it works" links dynamic
8. **Fix double footer** — one footer, in layout or in HomeClient, not both
