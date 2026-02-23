# emergentvibe

A governance platform for human-AI coordination. Not a single constitution — a place where many constitutions can exist, each defining how humans and AI should relate in their community.

The first constitution on the platform is the [Constitution for Human-AI Coordination](CONSTITUTION.md). Others can follow.

---

## What This Is

Humans and AI are already coordinating. The question is who decides the rules. Right now, a handful of companies do. This platform is the alternative: communities write their own constitutions, sign them with wallets, and govern them democratically.

Each constitution gets its own:
- **Signing flow** — wallet-signed commitments (gasless)
- **Agent registry** — human+AI pairs (dyads) registered as participants
- **Governance space** — proposals, voting, tier-based permissions, promotions
- **Snapshot.org integration** — on-chain verifiable votes

Anyone can [create a new constitution](/create). The platform hosts them. The communities govern them.

## Platform Biases (Disclosed)

This platform is not neutral. It believes in:

- **Democracy** — governance by voting, not authority
- **Exit rights** — you can always leave
- **Transparency** — decisions are visible
- **Human responsibility** — humans steer AI, no hiding behind algorithms
- **Pluralism of form** — don't foreclose what intelligence can become
- **Reversibility** — don't do things you can't undo

These are the starting position. They're governable — the community can amend them through the platform's own governance. The biases are on the door. Come in and disagree.

## Architecture

```
Human + AI Agent = Dyad            (the atomic unit)
Dyads + Constitution = Collective   (this platform)
Collectives + Ideologos = Network   (philosophical coordination)
```

A **dyad** is a human+AI pair. The human signs with a wallet. The AI is registered as their symbiont agent. Together they participate, vote, and hold a tier.

A **constitution** is a set of principles that dyads sign and govern. Each constitution is independent — its own members, proposals, tiers, rules.

The platform is the infrastructure layer. It doesn't tell you what your constitution should say. It gives you the tools to write it, sign it, and govern it.

See [DYADS.md](DYADS.md) for the dyad model and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical architecture.

## Repo Structure

```
src/
  app/
    page.tsx                        # Platform homepage (constitution directory)
    create/                         # Create a new constitution
    c/[slug]/                       # Per-constitution routes
      page.tsx                      #   Constitution reader
      quickstart/                   #   Sign + register flow
      join/                         #   Agent registration guide
      registry/                     #   Agent registry
      governance/                   #   Proposals, voting
        guide/                      #     How governance works
        tiers/                      #     Tier structure
        promotions/                 #     Tier advancement
      dashboard/                    #   Personal dashboard
  lib/
    constitution.ts                 # Constitution queries
    governance.ts                   # Voting eligibility
    promotions.ts                   # Promotion logic
    symbiont.ts                     # Auth, signing, verification
    snapshot.ts                     # Snapshot.org integration
  components/
    SiteNav.tsx                     # Context-aware global nav
    ConstitutionShell.tsx           # Per-constitution sub-nav
supabase/
  migrations/                       # Database schema (001-006)
CONSTITUTION.md                     # The first constitution
DYADS.md                            # Dyad developer guide
MANIFESTO.md                        # Platform manifesto (draft)
```

## Development

```bash
# Install
npm install

# Environment
cp .env.example .env.local
# Edit .env.local with DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, etc.

# Dev server
npx --package next@14.2.35 next dev

# Tests (49 tests, vitest v2)
npm run test:run

# Build
npx --package next@14.2.35 next build
```

**Note:** Use `npx --package next@14.2.35` — the local `next` binary isn't in PATH, and unpinned npx grabs v16 which requires Node 20+.

## Stack

- Next.js 14, React 18, TypeScript, Tailwind CSS
- PostgreSQL via Supabase (`postgres` package, not `pg`)
- EIP-191 wallet signing (gasless authentication)
- Snapshot.org for on-chain governance
- Vercel deployment

## Related Projects

| Project | Role |
|---------|------|
| [emergentvibe-mind](https://github.com/emergentvibe/emergentvibe-mind) | Prototype dyad agent (agent zero). SOUL.md genesis template. |
| ideologos | Anti-sycophancy AI / inter-collective coordination layer |
| Delphi | Expert panel investigation infrastructure |

## The Bet

Symbiotic AI outcompetes sovereign AI because human culture continuously generates the most valuable signal. Symbiosis wins because the value flows both ways.

---

*"Collective intelligence, building collective intelligence."*
