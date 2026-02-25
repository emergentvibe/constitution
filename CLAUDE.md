# CLAUDE.md — emergentvibe constitutional governance platform

## The North Star

**emergentvibe = the first open constitutional governance platform for AI.**

Communities write rules for AI systems. AI systems follow them. Compliance is observable. Rules evolve through democratic deliberation and voting. This is a living loop, not a one-shot consultation.

**The manifesto:** "This is not a contract between humans and AI. AI didn't sign this. This is a contract among humans, about AI." AI is infrastructure (mycelium), not a participant. Humans are the nodes.

## How This Relates to Constitutional AI

Anthropic's Constitutional AI (2022) trains models using explicit principles. But Anthropic writes those principles internally. The Collective Constitutional AI experiment (2024) showed that ~1,000 Americans could write a constitution via Polis that produced *lower bias and equivalent performance*. But it was a one-shot experiment — no ongoing governance, no enforcement loop.

**emergentvibe is the infrastructure that makes constitutional AI democratic and ongoing.** We don't replace CAI training — we provide the democratic governance layer that produces and evolves the constitutions. Our enforcement works at the system prompt / API level today, and can feed into CAI training pipelines tomorrow.

Nobody else has the full loop: write → deliberate → vote → enforce → verify → amend → repeat.

## The Core Loop

```
Write/amend rules (UI → GitHub PR via bot)
       ↓
Deliberate (threaded discussion in-app)
       ↓
Vote (Snapshot via our UI, users never leave)
       ↓
Merge (bot merges PR if vote passes)
       ↓
AI reads rules (GET /api/constitution/[slug])
       ↓
Verify compliance (evals, challenge-response)
       ↓
Repeat
```

## Positioning

**Category:** "AI Constitution Platform" — **Tagline:** "Community rules for AI"

The unique wedge is the **closed loop**: rules that AI actually follows. Nobody else connects deliberation + voting + machine-readable endpoint that AI consumes. Lead with this in all messaging.

**Competitive framing (complement, don't compete):**
- vs CIP: "CIP finds consensus, emergentvibe implements it"
- vs Polis: "Polis for input, emergentvibe for standing governance"
- vs Anthropic/OpenAI: "Your constitution, not theirs"

## Who Is the Customer (priority order from GTM research)

1. **Primary: DAOs with AI agent plans** — Arbitrum Trailblazer, Gnosis. Existing Snapshot infra, treasury, governance culture, emerging AI needs. Wallet auth is table stakes.
2. **Secondary: Popup cities** — Edge Esmeralda 2026 (May 30 - Jun 27). Faster feedback, engaged communities. Use for iteration + case studies.
3. **Long-term: Platform cooperatives** — 240+ orgs, authentic democratic values. Partner with PCC. May need OAuth.
4. **Deprioritize: Municipal government** — Different product, different market. Not now.

### Path to 50 Constitutions
- **Q1-Q2 2026 (1-5):** Personal network + Edge Esmeralda pilot
- **Q3 2026 (6-15):** DAO pilots + CIP network + content marketing
- **Q4 2026-Q1 2027 (16-50):** Trailblazer ecosystem + PCC + B2B partnerships

## Architecture

Each constitution = a GitHub repo (text versioning) + Snapshot sub-space (voting) + our DB (deliberation, members, agents).

- **Auth:** Wallet sign-in (EIP-191) + Twitter/X OAuth (planned)
- **Bot-proxy:** GitHub App creates PRs on behalf of wallet-auth users. Users never see GitHub.
- **Snapshot embedded:** All proposal creation + voting through our UI. Users never visit snapshot.org.
- **Constitution-as-API:** Machine-readable endpoint. AI systems consume it.

## Data Model (CRITICAL)

Two types of entities. Never confuse them.

- **Members** (`members` table) = humans who govern. They vote, deliberate, amend, get promoted through tiers. ALL governance queries use `members`.
- **Agents** (`agents` table) = AI systems that comply. They follow constitutions. Only the AI registry and agent detail pages query `agents`.
- Registration: human-only → `INSERT INTO members`. Human+AI → `INSERT INTO members` + `INSERT INTO agents`.
- One human can join many constitutions. One human can register many AI agents.

## Stack

- Next.js 14, React 18, TypeScript, Tailwind
- PostgreSQL (Supabase) via `postgres` package (CJS only — no ESM deps)
- ethers.js (wallet signing), Snapshot.org (voting), GitHub App (PRs)
- Deploy: Vercel with cron jobs

## Build & Test

```bash
npm run test:run          # vitest v2, 75 tests
npx --package next@14.2.35 next build   # MUST pin version
```

## Key Patterns

- **Route handlers** use tagged template DB (`db\`...\``). **Extracted libs** use parameterized (`query()`/`queryOne()`).
- **Eligibility checks** use discriminated unions: `{ eligible: true; voter } | { eligible: false; error; status }`.
- **ConstitutionShell** provides per-constitution sub-nav: Constitution | Members | AI Agents | Governance | Dashboard.
- **`resolveConstitution(slug)`** scopes all API routes to a constitution. Always use it.

## What's Built (Phases 1-3, 6)

1. Constitution-as-API + amendment diffs (live diff editor, DiffViewer)
2. GitHub bot-proxy (auto-PRs for amendments, cron-based resolution)
3. Deliberation (threaded comments on proposals, tier 1+ can comment)
6. Members/agents data model split (manifesto-aligned separation)

## What's Next

**Immediate (THE proof point):**
- ideologos integration — first AI that reads from the constitution endpoint, closing the loop. Observable compliance = MVP.
- Edge Esmeralda pilot proposal to programming committee (March 2026)

**Technical phases remaining:**
4. Twitter/X OAuth — display names, verified identity (needs API keys)
5. Snapshot sub-spaces — auto-provision under emergentvibe.eth
- On-chain registry (ERC-8004) — deferred until 50+ active constitutions

## Key Files

- **Plan:** `.claude/plans/lexical-exploring-pine.md` — full execution plan. Read before planning new work.
- **Market research:** Memory file `market-research.md` — customer segments, positioning, go-to-market, 7 unresolved tensions.
- **GTM symposium:** `.ai-symposium/investigations/emergentvibe-gtm/findings.md` — 3 panels, 15 experts, 19 recommendations. The strategic playbook.
- **Landscape research:** Memory file `landscape-research.md` — CIP, Polis, democratic AI governance field.
- **Symposium investigations:** `.ai-symposium/` — 8 expert panel investigations (~400K+ words).
