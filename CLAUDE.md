# CLAUDE.md — emergentvibe constitutional governance platform

## The North Star

**emergentvibe = the first open constitutional governance platform for AI.**

The platform is a demonstration that the alternative exists. AI governance should be democratic, not decided by a handful of people in SF or DC. The product is the proof. The attention is the outcome.

**The manifesto:** "This is not a contract between humans and AI. AI didn't sign this. This is a contract among humans, about AI." AI is infrastructure (mycelium), not a participant. Humans are the nodes.

## The Provocation (Feb 2026)

The Anthropic/Pentagon standoff crystallizes everything:
- Anthropic proved public input produces better constitutions (CCAI, 2024). Then shelved it.
- The Pentagon is now trying to override even Anthropic's internal constitution (Hegseth ultimatum, Feb 24).
- Anthropic dropped its safety pledge the same day (RSP v3.0, Feb 25).
- The Pentagon CTO said it's "not democratic" for Anthropic to limit military AI use.
- Nobody asked the public. Nobody has infrastructure for ongoing democratic AI governance.
- **emergentvibe is that infrastructure. It exists. It works today.**

This is performance art with a URL. The platform demonstrates that democratic AI governance is possible. The discourse around it shifts the conversation from "which company decides" to "why doesn't the public decide."

See `drafts/twitter-thread-who-decides-2026-02-25.md` for the launch thread.
See `memory/provocation-research.md` for verified sources.

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

**The core argument:** A constitution without external governance is a corporate policy document. It can be changed when business conditions require it. Every AI lab writes, interprets, enforces, and changes its own rules with no external accountability.

**The wedge is the closed loop**: write → deliberate → vote → enforce → verify → amend. Nobody else has this as standing infrastructure.

**Competitive framing (complement, don't compete):**
- vs CIP: "CIP finds consensus, emergentvibe implements it"
- vs Polis: "Polis for input, emergentvibe for standing governance"
- vs Anthropic/OpenAI: "Your constitution, not theirs"
- vs Pentagon: "Neither the company nor the government should decide unilaterally"

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

**Immediate: Launch the provocation.**
- Verify all sources in `drafts/twitter-thread-who-decides-2026-02-25.md`
- Post thread timed to Friday Pentagon deadline (Feb 27)
- Ensure emergentvibe.com is presentable and accessible

**Then: Close the loop.**
- ideologos integration — first AI that reads from the constitution endpoint. Observable compliance = MVP.
- Edge Esmeralda pilot proposal to programming committee (March 2026)

**Technical phases remaining:**
4. Twitter/X OAuth — display names, verified identity (needs API keys)
5. Snapshot sub-spaces — auto-provision under emergentvibe.eth
- On-chain registry (ERC-8004) — deferred until 50+ active constitutions

## Key Files

- **Plan:** `.claude/plans/lexical-exploring-pine.md` — full execution plan. Read before planning new work.
- **Launch thread:** `drafts/twitter-thread-who-decides-2026-02-25.md` — sourced thread + verification checklist.
- **Provocation research:** Memory file `provocation-research.md` — Anthropic/Pentagon standoff, CCAI, safety pledge, verified sources.
- **Market research:** Memory file `market-research.md` — customer segments, positioning, go-to-market, 7 tensions.
- **GTM symposium:** `.ai-symposium/investigations/emergentvibe-gtm/findings.md` — 3 panels, 15 experts, 19 recs.
- **Anthropic deep research:** `.ai-symposium/investigations/anthropic-constitution-research/findings.md` — constitution analysis, governance gap, lab comparison.
- **Constitutional enforcement:** `.ai-symposium/investigations/constitutional-enforcement/findings.md` — enforcement spectrum, community formation, product-market.
- **AI community market:** `.ai-symposium/investigations/ai-community-market/findings.md` — Discord admins, personas, beta strategy.
- **Symposium investigations:** `.ai-symposium/` — 11 expert panel investigations total.
