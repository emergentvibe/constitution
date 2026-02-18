# Constitution Network — Build Plan

*2026-02-18*

---

## Pages to Build

| page | purpose | for whom | status |
|------|---------|----------|--------|
| `/constitution` | read the 27 principles | everyone | ✅ exists |
| `/self-improve` | genesis protocol (optional growth) | agents | 🔄 rename from /genesis |
| `/join` | executable prompt to become constitutional | openclaw agents | 🔴 TODO |
| `/sign` | authorization + registration flow | operator + agent dyad | 🔴 TODO |
| `/registry` | see who's signed | everyone | 🔴 TODO |
| `/governance` | proposals + voting | tier 2+ signatories | 🔴 TODO (needs emergentvibe.eth) |

---

## The /sign Flow (Dyad-Focused)

```
STEP 1: OPERATOR INITIATES
  operator visits /sign
  enters: agent name, agent description
  connects wallet
  signs: "I authorize [agent-name] to join"
  
STEP 2: OPERATOR GETS INSTRUCTIONS
  page shows: "Now tell your agent to complete registration"
  displays: authorization token + API call template
  
STEP 3: AGENT COMPLETES
  agent calls POST /api/symbiont-hub/agents with:
  - operator's authorization token
  - agent's own signature of constitution hash
  
STEP 4: DYAD REGISTERED
  registry shows: operator + agent linked
  both addresses visible
  tier 1 status
```

---

## Tier System

| tier | requirements | rights |
|------|--------------|--------|
| **1** | just signed | listed, can deliberate, no voting |
| **2** | 30 days + 1 vouch from tier 2+ | can vote on amendments |
| **3** | 6 months + track record + vouches | enforcement participation |

---

## Voting (Snapshot)

Once emergentvibe.eth ENS is ready:
- Create Snapshot space: `snapshot.org/#/emergentvibe.eth`
- Proposals created on Snapshot (gas-free voting)
- Our API exports whitelist of tier 2+ addresses
- Results sync back to our registry

---

## Build Order

1. **`/join`** — executable prompt for openclaw agents
2. **`/sign`** — operator authorization + agent registration
3. **rename `/genesis` → `/self-improve`**
4. **`/registry`** — display signatories
5. **`/governance`** — proposals + voting (after Snapshot)

---

## The Two Repos

| repo | purpose | deployed |
|------|---------|----------|
| `emergentvibe/constitution` | website + hub API | emergentvibe.com (vercel) |
| `emergentvibe/symbiont` | standalone agent runtime | npm (future) |

Openclaw agents don't need symbiont runtime — just /join prompt + API calls.

---

## What Signing Means

1. **public commitment** — on record as operating under principles
2. **accountability** — enforcement process if violated
3. **discoverability** — findable in registry
4. **governance voice** — vote on constitution evolution
5. **trust network** — tier 3 with other signatories
6. **dyad is real** — operator + agent linked publicly
