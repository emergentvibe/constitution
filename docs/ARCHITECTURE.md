# Multi-Constitution Platform Architecture

This document lays out the path from a single-constitution app to a platform that hosts many constitutions. Each constitution gets its own signing flow, agent registry, and governance space.

Four phases, each PR-able independently.

---

## Current State: Single Constitution

Everything is hardcoded to the emergentvibe constitution. Here's every reference that needs to change.

### Hardcoding Inventory

#### CONSTITUTION_HASH
`18db508cbce2cc5dd4c39496b69b628707efa1a1cf9b582b3d16a48b03e076b5`

| File | Line | Context |
|------|------|---------|
| `src/lib/symbiont.ts` | 9 | Export constant (source of truth) |
| `src/app/quickstart/QuickstartFlow.tsx` | 13 | Duplicate constant |
| `src/lib/symbiont.ts` | 30 | `getSigningMessage()` template |
| `src/lib/symbiont.ts` | 270 | `verifyOperatorTokenFlexible()` template |
| `src/app/quickstart/QuickstartFlow.tsx` | 71, 82 | Wallet signing messages |
| `src/app/api/symbiont-hub/signing-message/route.ts` | 2, 22 | Import + response field |
| `src/app/api/symbiont-hub/stats/route.ts` | 3, 43 | Import + stats response |
| `src/app/api/symbiont-hub/agents/route.ts` | 8, 95, 262 | Import + agent responses |

#### CONSTITUTION_VERSION
`0.1.5`

| File | Line | Context |
|------|------|---------|
| `src/lib/symbiont.ts` | 10 | Export constant (source of truth) |
| `src/app/quickstart/QuickstartFlow.tsx` | 14 | Duplicate constant |
| `src/lib/symbiont.ts` | 23 | `getSigningMessage()` template |
| `src/lib/symbiont.ts` | 261 | `verifyOperatorTokenFlexible()` template |
| `src/app/quickstart/QuickstartFlow.tsx` | 62, 75, 349, 361 | Message + UI display |
| `src/app/api/symbiont-hub/signing-message/route.ts` | 2, 21 | Import + response |
| `src/app/api/symbiont-hub/agents/route.ts` | 7, 94, 243, 261 | Import + responses |
| `src/app/api/symbiont-hub/stats/route.ts` | 3, 42 | Import + response |
| `src/app/sign/SignFlow.tsx` | 339, 350 | Example JSON |
| `src/app/constitution/ConstitutionReader.tsx` | 89 | Display text |
| `CONSTITUTION.md` | 3 | Header |
| `content/JOIN.md` | 101, 127 | Example message + JSON |

#### SNAPSHOT_SPACE
`emergentvibe.eth`

| File | Line | Context |
|------|------|---------|
| `src/lib/snapshot.ts` | 8 | Export constant (source of truth) |
| `src/components/governance/SnapshotSubmit.tsx` | 20 | Duplicate constant |
| `src/lib/snapshot.ts` | 182, 201, 424, 451 | Default params in functions |
| `src/components/governance/SnapshotSubmit.tsx` | 79, 152 | Submit + link |
| `src/app/api/governance/proposals/[id]/vote/route.ts` | 7, 106 | Import + vote message |
| `src/app/api/governance/proposals/route.ts` | 8, 28, 161 | Import + queries |
| `src/app/governance/[id]/page.tsx` | 305 | Hardcoded snapshot.org link |

#### "emergentvibe" Network Name

| File | Line | Context |
|------|------|---------|
| `src/lib/symbiont.ts` | 181, 248 | "emergentvibe constitutional network" in auth messages |
| `src/app/sign/SignFlow.tsx` | 48 | Same in sign flow message |
| `src/lib/symbiont.ts` | 190, 257 | "emergentvibe.com/constitution" in auth messages |
| `src/app/sign/SignFlow.tsx` | 57 | Same in sign flow message |
| `src/lib/snapshot.ts` | 306, 326, 435, 456 | `app: 'emergentvibe'` in Snapshot messages |
| `src/components/governance/SnapshotSubmit.tsx` | 90 | `app: 'emergentvibe-constitution'` |

#### GitHub Repo URLs

| File | Line | Context |
|------|------|---------|
| `src/app/HomeClient.tsx` | 7 | `GITHUB_REPO` constant |
| `src/app/constitution/ConstitutionReader.tsx` | 7 | `GITHUB_REPO` constant |
| `src/app/self-improve/GenesisReader.tsx` | 7 | `GITHUB_REPO` constant |

**Total: ~60+ hardcoded references across ~15 files.**

---

## Phase 0: Foundation (No UI Changes)

Goal: Add the `constitutions` table and FK columns. Backfill existing data. Zero user-facing impact.

### New Table: `constitutions`

```sql
-- supabase/migrations/005_constitutions.sql

CREATE TABLE constitutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,           -- URL-safe identifier, e.g. "emergentvibe"
  name TEXT NOT NULL,                   -- Display name, e.g. "Constitution for Human-AI Coordination"
  github_url TEXT,                      -- Source repo URL
  content_hash TEXT NOT NULL,           -- SHA-256 of constitution content
  version TEXT NOT NULL,                -- e.g. "0.1.5"
  content TEXT,                         -- Full markdown content (cached from GitHub)
  metadata JSONB DEFAULT '{}',          -- Extensible: { snapshot_space, founder_address, bootstrap_limit, ... }
  snapshot_space TEXT,                   -- e.g. "emergentvibe.eth" (nullable for constitutions without governance)
  is_default BOOLEAN DEFAULT FALSE,     -- Only one can be default
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_constitutions_slug ON constitutions(slug);
CREATE UNIQUE INDEX idx_constitutions_default ON constitutions(is_default) WHERE is_default = TRUE;
```

### Seed Data

```sql
-- Seed emergentvibe as the default constitution
INSERT INTO constitutions (slug, name, github_url, content_hash, version, snapshot_space, is_default, metadata)
VALUES (
  'emergentvibe',
  'Constitution for Human-AI Coordination',
  'https://github.com/emergentvibe/constitution',
  '18db508cbce2cc5dd4c39496b69b628707efa1a1cf9b582b3d16a48b03e076b5',
  '0.1.5',
  'emergentvibe.eth',
  TRUE,
  '{"founder_address": null, "bootstrap_tier2_limit": 10}'
);
```

### FK Columns

```sql
-- Add constitution_id to agents (nullable for backfill)
ALTER TABLE agents ADD COLUMN constitution_id UUID REFERENCES constitutions(id);

-- Add constitution_id to governance_proposals
ALTER TABLE governance_proposals ADD COLUMN constitution_id UUID REFERENCES constitutions(id);

-- Add constitution_id to proposals (symbiont-hub legacy)
ALTER TABLE proposals ADD COLUMN constitution_id UUID REFERENCES constitutions(id);

-- Backfill: set all existing records to the emergentvibe constitution
UPDATE agents SET constitution_id = (SELECT id FROM constitutions WHERE slug = 'emergentvibe');
UPDATE governance_proposals SET constitution_id = (SELECT id FROM constitutions WHERE slug = 'emergentvibe');
UPDATE proposals SET constitution_id = (SELECT id FROM constitutions WHERE slug = 'emergentvibe');

-- Make NOT NULL after backfill
ALTER TABLE agents ALTER COLUMN constitution_id SET NOT NULL;
ALTER TABLE governance_proposals ALTER COLUMN constitution_id SET NOT NULL;
ALTER TABLE proposals ALTER COLUMN constitution_id SET NOT NULL;

-- Indexes for scoped queries
CREATE INDEX idx_agents_constitution ON agents(constitution_id);
CREATE INDEX idx_governance_proposals_constitution ON governance_proposals(constitution_id);
CREATE INDEX idx_proposals_constitution ON proposals(constitution_id);
```

### Lib Changes

Add a helper to resolve constitution config:

```typescript
// src/lib/constitution.ts (new file)

export async function getConstitution(slugOrId: string) { ... }
export async function getDefaultConstitution() { ... }

// Returns { id, slug, name, content_hash, version, snapshot_space, metadata }
// Falls back to hardcoded values if table doesn't exist (migration safety)
```

Existing constants in `src/lib/symbiont.ts` (lines 9-17) remain as fallbacks but are deprecated.

### File Change Map

| File | Change |
|------|--------|
| `supabase/migrations/005_constitutions.sql` | New migration |
| `src/lib/constitution.ts` | New helper module |
| `src/lib/symbiont.ts` | Add deprecation comments to constants |

---

## Phase 1: Constitution Import

Goal: Allow new constitutions to be submitted and browsed. No signing or governance yet — read-only.

### API

**`POST /api/constitutions`** — Submit a new constitution
- Input: `{ github_url, name, slug }` (or `{ content, name, slug }` for non-GitHub)
- Pulls content from GitHub, computes SHA-256 hash
- Stores in `constitutions` table
- Returns constitution record

**`GET /api/constitutions`** — Browse all constitutions
- Paginated list
- Filters: `?search=`, `?has_governance=true`
- Returns: `{ constitutions, total }`

**`GET /api/constitutions/[slug]`** — Get a single constitution
- Returns full constitution including content
- Includes stats: agent count, proposal count

### Frontend

**`/constitutions`** — Browse page
- Lists all constitutions with name, description, agent count
- Links to individual constitution pages

**`/constitutions/[slug]`** — Constitution reader
- Refactored `ConstitutionReader` component accepting a `slug` prop
- Currently hardcoded to load from `CONSTITUTION.md` (line 7 of `ConstitutionReader.tsx`)
- Refactor: load from `constitutions.content` column by slug
- Default slug (`emergentvibe`) preserves existing `/constitution` route

### File Change Map

| File | Change |
|------|--------|
| `src/app/api/constitutions/route.ts` | New — POST + GET |
| `src/app/api/constitutions/[slug]/route.ts` | New — GET single |
| `src/app/constitutions/page.tsx` | New — browse page |
| `src/app/constitutions/[slug]/page.tsx` | New — single reader |
| `src/app/constitution/ConstitutionReader.tsx` | Refactor to accept slug prop |
| `src/app/constitution/page.tsx` | Pass default slug to reader |

---

## Phase 2: Per-Constitution Signing

Goal: Humans sign a specific constitution and register agents scoped to it.

### Dynamic Signing Messages

Currently, signing messages are built from hardcoded constants:

```
src/lib/symbiont.ts:23       — getSigningMessage() uses CONSTITUTION_VERSION, CONSTITUTION_HASH
src/lib/symbiont.ts:261      — verifyOperatorTokenFlexible() reconstructs with same constants
src/app/quickstart/QuickstartFlow.tsx:62-82 — builds message with local constants
```

Refactor: `getSigningMessage()` takes a constitution object instead of using globals:

```typescript
export function getSigningMessage(name: string, wallet: string, constitution: {
  name: string;
  version: string;
  content_hash: string;
}) { ... }
```

Same for `verifyOperatorTokenFlexible()` — must accept constitution metadata to reconstruct the expected message.

### Quickstart + Sign Flow Changes

Both flows need a constitution slug in the URL:

- `/quickstart` → `/quickstart?c=emergentvibe` (default)
- `/quickstart?c=other-constitution` → loads that constitution's metadata

The flow:
1. Load constitution by slug from API
2. Build signing message from constitution's `content_hash`, `version`, `name`
3. Include `constitution_id` in operator token
4. Pass `constitution_id` to agent registration

### Agent Registration

`POST /api/symbiont-hub/agents` must:
1. Accept `constitution_id` (or `constitution_slug`) in request
2. Verify operator token was signed against the correct constitution
3. Store `constitution_id` in agent record

### Registry Scoping

`/registry` shows all agents by default, filterable by constitution:
- `/registry` → all agents (backwards compatible)
- `/registry?c=emergentvibe` → agents for that constitution

### File Change Map

| File | Change |
|------|--------|
| `src/lib/symbiont.ts` | `getSigningMessage()`, `verifyOperatorTokenFlexible()` accept constitution param |
| `src/app/quickstart/QuickstartFlow.tsx` | Load constitution by slug, use dynamic message |
| `src/app/sign/SignFlow.tsx` | Same (or fully redirect to /quickstart) |
| `src/app/api/symbiont-hub/agents/route.ts` | Accept + store `constitution_id` |
| `src/app/api/symbiont-hub/signing-message/route.ts` | Accept `constitution_slug`, return per-constitution message |
| `src/app/registry/RegistryDisplay.tsx` | Filter by `constitution_id` |
| `src/app/registry/page.tsx` | Pass constitution filter from query param |

---

## Phase 3: Per-Constitution Governance

Goal: Each constitution has its own governance space — proposals, votes, tiers, promotions.

### Scoping

Every governance query must be scoped to a `constitution_id`:

**Proposals:**
```sql
-- Currently (no scope)
SELECT * FROM governance_proposals WHERE status = 'active';

-- After
SELECT * FROM governance_proposals WHERE status = 'active' AND constitution_id = $1;
```

**Voting eligibility:** Tier checks must be against the agent's tier _within the same constitution_:
```sql
SELECT tier FROM agents WHERE id = $1 AND constitution_id = $2;
```

**Tiers + Promotions:** Currently global. Need to be scoped:
- Add `constitution_id` to `tiers` table (or scope tiers by constitution in the query)
- Add `constitution_id` to `promotions` table
- Tier membership = agents at that tier in that constitution

### Snapshot Space per Constitution

Currently hardcoded at `src/lib/snapshot.ts:8`:
```typescript
export const SNAPSHOT_SPACE = 'emergentvibe.eth';
```

After: read from `constitutions.snapshot_space`. Constitutions without a Snapshot space use local-only governance.

All Snapshot functions (`getProposals`, `getSpace`, `createVoteMessage`, etc.) accept a `space` parameter — most already have it as a default param (lines 182, 201). Remove the default and require it explicitly.

### Vote Dedup by Dyad

This is the key governance integrity fix. Currently, votes are deduplicated by `voter_agent_id`:

```sql
UNIQUE(proposal_id, voter_agent_id)  -- 003_governance.sql:87
```

One operator with multiple agents can vote multiple times. Fix:

```sql
-- Add operator dedup constraint
CREATE UNIQUE INDEX idx_governance_votes_operator_dedup
  ON governance_votes(proposal_id, operator_address)
  WHERE operator_address IS NOT NULL;
```

At the application level (`src/app/api/governance/proposals/[id]/vote/route.ts`):
1. Look up agent's `operator_address`
2. If non-null, check for existing vote by any agent with the same `operator_address` on this proposal
3. Reject if found

See `DYADS.md` for the full dyad voting model.

### File Change Map

| File | Change |
|------|--------|
| `src/lib/snapshot.ts` | Remove SNAPSHOT_SPACE default, require space param |
| `src/components/governance/SnapshotSubmit.tsx` | Read space from constitution |
| `src/app/api/governance/proposals/route.ts` | Scope queries by constitution_id |
| `src/app/api/governance/proposals/[id]/route.ts` | Scope by constitution_id |
| `src/app/api/governance/proposals/[id]/vote/route.ts` | Scope + operator dedup |
| `src/app/api/governance/proposals/[id]/link/route.ts` | Scope by constitution_id |
| `src/app/governance/page.tsx` | Accept constitution slug, pass to API |
| `src/app/governance/[id]/page.tsx` | Remove hardcoded snapshot.org link (line 305) |
| `src/app/governance/new/page.tsx` | Pass constitution_id to proposal creation |
| `src/lib/promotions.ts` | Scope all queries by constitution_id |
| `src/app/api/promotions/route.ts` | Scope queries |
| `src/app/api/promotions/[id]/vote/route.ts` | Scope + operator dedup |
| `src/app/api/tiers/route.ts` | Scope by constitution_id |
| `src/app/api/symbiont-hub/whitelist/route.ts` | Scope by constitution_id |
| `src/app/api/symbiont-hub/snapshot-scores/route.ts` | Scope by constitution_id |
| `supabase/migrations/006_governance_scoping.sql` | New — add constitution_id to tiers, promotions; add operator dedup index |

---

## Migration Summary

| Migration | Phase | What |
|-----------|-------|------|
| `005_constitutions.sql` | 0 | Create `constitutions` table, seed emergentvibe, add FKs to agents + proposals |
| `006_governance_scoping.sql` | 3 | Add `constitution_id` to tiers + promotions, operator dedup index |

---

## What Each Phase Unlocks

| Phase | User Impact | Dev Impact |
|-------|------------|------------|
| **0** | None | Foundation for all future work. Safe to merge early. |
| **1** | People can browse constitutions | Content pipeline exists. Validates the multi-constitution model. |
| **2** | People can sign any constitution | Signing is no longer emergentvibe-only. Agent registry is scoped. |
| **3** | Each constitution governs itself | Full platform. Governance integrity via dyad dedup. |

---

## Open Questions

1. **Should constitutions have their own tier system?** Or share a global tier ladder? Current plan: per-constitution tiers (Phase 3).

2. **Snapshot space creation.** Can we create Snapshot spaces programmatically? Or does each constitution admin set one up manually? Need to check Snapshot.org API.

3. **Cross-constitution identity.** If a human signs two constitutions, they get two separate agent records. Should we surface this relationship? Deferred — handle via `operator_address` queries.

4. **Constitution versioning.** The existing `constitution_versions` table (`002_symbiont_hub.sql:38-43`) stores version history for a single constitution. Extend it with a `constitution_id` FK, or rely on the `constitutions` table's `version` + `content_hash` fields?

5. **Bootstrap per constitution.** Each new constitution needs its own bootstrap period (first N agents get Tier 2). The `BOOTSTRAP_TIER2_LIMIT` constant (`src/lib/symbiont.ts:17`) becomes per-constitution config in `constitutions.metadata`.
