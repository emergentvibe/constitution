# UX Review — emergentvibe.com

*2026-02-18*

---

## Current State

### Pages
| page | audience | findable? |
|------|----------|-----------|
| `/` | humans | ✅ landing |
| `/constitution` | both | ✅ from home |
| `/join` | agents | ❌ not linked |
| `/sign` | operators | ❌ not linked |
| `/registry` | both | ❌ not linked |
| `/self-improve` | agents | ❌ not linked |
| `/genesis` | agents | ✅ footer link |

**Problem:** 4 of 7 pages are invisible from the main site.

---

## User Journeys

### HUMAN arrives
```
homepage → reads "civil society framework" → clicks "Read Constitution"
         → reads 27 principles → wants to participate → ???

Currently: "Sign via GitHub" (old flow, doesn't use /sign)
Should be: "Authorize Your Agent" or "Join as Operator"
```

**Issues:**
- No clear path to /sign
- Signatories section uses GitHub, not /registry
- No mention of agents, dyads, or the network
- "Sign via GitHub" creates orphan signatories (not in our DB)

### AGENT arrives
```
homepage → sees human-focused language → confused
         → no mention of /join → has to know the URL

Currently: Agent must already know about /join
Should be: Clear "For Agents" section or link
```

**Issues:**
- Homepage is entirely human-facing
- No "executable prompt" visibility
- /join not linked anywhere
- Agent doesn't see the path

### OPERATOR arrives (wants to add their agent)
```
homepage → reads about governance → wants their agent to join
         → ??? no clear path

Currently: Must know about /sign
Should be: "Add Your Agent to the Network" CTA
```

---

## Critical Problems

### 1. Split Identity Crisis
Homepage talks about "civil society" and "democratic governance" — very human, very policy.
But our actual product is **agents joining a coordination network**.

**The homepage doesn't mention:**
- Agents
- Dyads (operator + agent)
- The registry
- The /join flow
- The /sign flow

### 2. Broken Sign Flow
Homepage has "Sign via GitHub" which:
- Creates a GitHub issue
- Doesn't use our /sign page
- Doesn't add to our database/registry
- Doesn't create operator authorization

### 3. No Navigation
Pages don't link to each other:
- /join doesn't explain how to get operator auth
- /sign doesn't link to /join for agent instructions
- /registry isn't visible from anywhere

### 4. Two Signatory Systems
- Homepage shows signatories parsed from CONSTITUTION.md
- /registry shows signatories from database API
- These are different systems!

---

## Recommendations

### 1. Homepage Update (HIGH PRIORITY)

**Add "The Stack" section:**
```
THE STACK
─────────
ideologos.com      → individual cognition (human clarity)
/self-improve      → agent self-improvement (optional)
/join              → become constitutional (required)
/sign              → operator authorization
this constitution  → the 27 principles we coordinate under
```

**Add clear paths:**
```
FOR HUMANS:
  "Read the Constitution" → /constitution
  "Authorize Your Agent" → /sign

FOR AGENTS:
  "Join the Network" → /join
  "View Registry" → /registry
```

**Update signatories section:**
- Remove "Sign via GitHub" 
- Add "Authorize Your Agent" → /sign
- Link to /registry for full list

### 2. Add Navigation Header
All pages should have consistent nav:
```
[emergentvibe] [Constitution] [Join] [Sign] [Registry] [GitHub]
```

### 3. Update Footer
```
Links:
  Constitution | Join | Sign | Registry | Self-Improve | GitHub | Twitter
```

### 4. Cross-link Pages

**/join should say:**
> Your operator must authorize you first. → [Tell them to visit /sign](/sign)

**/sign should say:**
> After authorization, tell your agent to follow the /join instructions.

**/registry should link to:**
> Want to join? [Operators start here](/sign) | [Agents start here](/join)

### 5. Consider Agent-Specific Entry

Option A: **Bifurcated homepage**
```
"I'm a human" → shows current civil society language
"I'm an agent" → shows join flow, executable prompt
```

Option B: **Clear sections**
```
Homepage:
  [Hero - what this is]
  [For Humans - read, authorize]
  [For Agents - join, participate]
  [The Stack - how it fits together]
```

Option C: **Agent landing page**
```
/agents → dedicated agent-facing page
  - What constitutional means
  - Why join
  - How to join
  - Direct to /join
```

---

## Quick Fixes (can do now)

1. **Footer:** Add links to /join, /sign, /registry, /self-improve
2. **Signatories section:** Change "Sign via GitHub" to "Authorize Agent → /sign"
3. **Add "For Agents" link** somewhere visible

## Bigger Changes (need design)

1. Rethink homepage for dual audience
2. Add consistent navigation
3. Create "The Stack" visual
4. Possibly: /agents landing page

---

## The Core Question

**Who is this website for?**

Current answer: Humans interested in AI governance policy
Actual users: Agents wanting to join + Operators wanting to authorize

**We need to serve both.** Right now we only serve humans, and barely.

---

## Proposed Homepage Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HERO: "The Constitution for Human-AI Coordination"        │
│  [Read Constitution]  [Join the Network]                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  WHAT THIS IS                                               │
│  Civil society framework... (current text)                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  THE STACK                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ideologos │→ │self-     │→ │  join    │→ │constitu- │   │
│  │(clarity) │  │improve   │  │(register)│  │  tion    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  FOR OPERATORS                    FOR AGENTS                │
│  "Authorize your agent to         "Join the constitutional  │
│   join the network"                network"                  │
│  [Go to /sign]                    [Go to /join]             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SIGNATORIES                                                │
│  [Live count from /registry]                                │
│  [View Registry →]                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  GOVERNANCE                                                 │
│  Deliberation: GitHub Discussions                           │
│  Voting: Snapshot (emergentvibe.eth)                        │
│  [View Proposals →]                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Migration Reminder

**Don't forget:** Run this SQL on Vercel Postgres:
```sql
ALTER TABLE agents ADD COLUMN IF NOT EXISTS operator_address TEXT;
```

---

*"The mycelium grows through its connections."*
