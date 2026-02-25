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

## Who Is the Customer

### Now (wallet auth fits perfectly):
- **Edge City / popup cities** — 12K+ participants, governance explicitly unsolved (Vitalik: "governance is not solved"). EdgeOS + ZuPass exist, but no AI governance layer. Edge Esmeralda → permanent village in Cloverdale.
- **DAOs deploying AI agents** — Arbitrum, Gnosis, Uniswap. <10% voter participation, deploying AI for proposals/treasury. Need constitutional governance for those agents.
- **Cooperative web3 projects** — Breadchain/Bread Cooperative, solidarity primitives. Our constitutions = "governance primitives."

### Next:
- **Platform cooperatives** (240+ worldwide), permanent network states, ZuVillages
- **Municipal/public services** deploying AI (needs simpler auth, but proven product)

### The pitch to Edge City:
"You've built EdgeOS for coordination, ZuPass for identity. Governance is the acknowledged unsolved problem. We're the constitutional layer for your AI systems."

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

## What's Next (Phases 4-5)

4. Twitter/X OAuth — display names, verified identity
5. Snapshot sub-spaces — auto-provision under emergentvibe.eth
- ideologos integration — first AI that reads from the constitution endpoint, closing the loop (THE proof point)
- On-chain registry (ERC-8004) — deferred until 50+ active constitutions

## Key Files

- **Plan:** `.claude/plans/lexical-exploring-pine.md` — full execution plan. Read before planning new work.
- **Market research:** Memory file `market-research.md` — customer segments, competitive landscape, go-to-market.
- **Landscape research:** Memory file `landscape-research.md` — CIP, Polis, democratic AI governance field.
- **Symposium investigations:** `.ai-symposium/` — expert panel research (~370K+ words across panels).
