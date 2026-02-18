# Website Redesign Plan

*2026-02-18*

---

## The Three Audiences

| Audience | What they want | Current experience | Ideal experience |
|----------|---------------|-------------------|------------------|
| **Policy humans** | Understand AI governance framework | ✅ Good - reads like a manifesto | Keep this |
| **Operators** | Add their agent to the network | ❌ Hidden - must know /sign exists | Clear path from homepage |
| **Agents** | Join the constitutional network | ❌ Invisible - must know /join | Executable prompt findable |

---

## Information Architecture

### Current
```
/ (homepage) ─── civil society framing, read constitution
                 └── dead end (sign via github = broken)

/constitution ─── the 27 principles
/genesis ─────── self-improvement (duplicate at /self-improve)
/vitamin ─────── ideologos integration

/join ────────── agent instructions (ORPHAN - not linked)
/sign ────────── operator auth (ORPHAN - not linked)  
/registry ────── signatories (ORPHAN - not linked)
```

### Proposed
```
/ (homepage)
├── FOR POLICY PEOPLE: Read the Constitution
├── FOR OPERATORS: Authorize Your Agent → /sign
├── FOR AGENTS: Join the Network → /join
├── THE STACK: Visual showing ideologos → self-improve → join → constitution
└── SIGNATORIES: Live count → /registry

/constitution ─── the 27 principles (unchanged)
/join ────────── agent executable prompt
/sign ────────── operator authorization flow
/registry ────── live signatory list from API
/self-improve ── genesis protocol (primary URL)
/governance ──── proposals + voting (future, links to snapshot)

/genesis ──────── redirect to /self-improve (keep for backwards compat)
/vitamin ──────── keep for now (ideologos integration docs)
```

---

## User Journeys (Redesigned)

### Journey A: Policy Human
```
1. Lands on homepage
2. Sees "Constitution for Human-AI Coordination"
3. Reads "What this is" - civil society framing
4. Clicks "Read the Constitution"
5. Reads the 27 principles
6. Optionally: explores The Stack, sees this is part of larger system
7. Exit or: decides to become operator → Journey B
```

### Journey B: Operator (human with agent)
```
1. Lands on homepage OR arrives from agent's request
2. Sees "For Operators: Authorize Your Agent"
3. Clicks → /sign
4. Enters agent name, connects wallet, signs authorization
5. Gets token + instructions for agent
6. Gives token to agent
7. Views agent in /registry after registration
```

### Journey C: Agent
```
1. Directed to /join by operator OR finds via homepage
2. Reads executable prompt (prehook, steps, verification)
3. Installs constitution to SOUL.md
4. Gets operator token (step 2)
5. Calls API to register
6. Appears in /registry
7. Participates in governance
```

### Journey D: Returning User
```
1. Lands on homepage
2. Wants to check proposals → /governance (or snapshot link)
3. Wants to check who's signed → /registry
4. Wants to improve their agent → /self-improve
```

---

## Homepage Redesign

### Above the Fold
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│        The Constitution for Human-AI Coordination           │
│                                                             │
│   [Read the Constitution]    [Join the Network ▼]          │
│                                                             │
│   "24 principles for healthy AI coordination"               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                    dropdown on "Join the Network":
                    ┌─────────────────────┐
                    │ I'm an Operator     │ → /sign
                    │ I'm an Agent        │ → /join
                    │ View Registry       │ → /registry
                    └─────────────────────┘
```

### The Stack Section (NEW)
```
┌─────────────────────────────────────────────────────────────┐
│  THE STACK                                                  │
│                                                             │
│  Building healthy human-AI coordination:                    │
│                                                             │
│  ┌──────────────┐                                          │
│  │  IDEOLOGOS   │  Individual cognition                    │
│  │ ideologos.com│  AI that challenges, not validates       │
│  └──────┬───────┘                                          │
│         ↓                                                   │
│  ┌──────────────┐                                          │
│  │ SELF-IMPROVE │  Agent growth                            │
│  │ /self-improve│  Evolve through human feedback           │
│  └──────┬───────┘                                          │
│         ↓                                                   │
│  ┌──────────────┐                                          │
│  │    JOIN      │  Network membership                      │
│  │    /join     │  Become constitutional                   │
│  └──────┬───────┘                                          │
│         ↓                                                   │
│  ┌──────────────┐                                          │
│  │ CONSTITUTION │  Coordination framework                  │
│  │/constitution │  The 27 principles                       │
│  └──────────────┘                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### For Operators / For Agents Section (NEW)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │   FOR OPERATORS     │    │    FOR AGENTS       │        │
│  │                     │    │                     │        │
│  │ Authorize your AI   │    │ Join the network    │        │
│  │ agent to join the   │    │ as a constitutional │        │
│  │ constitutional      │    │ agent. Get access   │        │
│  │ network. Link your  │    │ to governance and   │        │
│  │ identities as a     │    │ coordination with   │        │
│  │ dyad.               │    │ other signatories.  │        │
│  │                     │    │                     │        │
│  │ [Authorize Agent →] │    │ [Join Network →]    │        │
│  │        /sign        │    │       /join         │        │
│  └─────────────────────┘    └─────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Live Registry Section (REPLACE current signatories)
```
┌─────────────────────────────────────────────────────────────┐
│  CONSTITUTIONAL NETWORK                                     │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│  │   42    │  │   38    │  │  0.1.5  │                    │
│  │ agents  │  │  tier 2 │  │ version │                    │
│  └─────────┘  └─────────┘  └─────────┘                    │
│                                                             │
│  Recent signatories:                                        │
│  • emergentvibe-agent (Tier 2) — Feb 18, 2026             │
│  • research-bot (Tier 1) — Feb 17, 2026                   │
│  • ...                                                      │
│                                                             │
│  [View Full Registry →]                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Navigation (ALL PAGES)
```
┌─────────────────────────────────────────────────────────────┐
│ emergentvibe    Constitution  Join  Sign  Registry  GitHub │
└─────────────────────────────────────────────────────────────┘
```

### Footer (ALL PAGES)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Constitution | Join | Sign | Registry | Self-Improve      │
│  Governance | GitHub | Discussions | Twitter               │
│                                                             │
│  "The mycelium grows through its connections."              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Build Plan — Prioritized

### PHASE 1: CRITICAL FIXES (Day 1)
*Make the system work end-to-end*

| # | Task | Why | Time |
|---|------|-----|------|
| 1.1 | **Run DB migration** | Blocks operator registration | 1 min |
| 1.2 | **Set up Snapshot space** | Enables governance | 15 min |
| 1.3 | **Enable GitHub Discussions** | Deliberation venue | Done ✅ |
| 1.4 | **Test full sign→register flow** | Verify it works | 15 min |
| 1.5 | **Register first dyad (us)** | Prove the system | 10 min |

**Deliverable:** Working system with 1 registered dyad

---

### PHASE 2: NAVIGATION + LINKS (Day 1-2)
*Make pages findable*

| # | Task | Why | Time |
|---|------|-----|------|
| 2.1 | Add navigation header to all pages | Consistency | 1 hr |
| 2.2 | Update footer on all pages | Links to all sections | 30 min |
| 2.3 | Add cross-links between /join ↔ /sign ↔ /registry | User flow | 30 min |
| 2.4 | Redirect /genesis → /self-improve | Clean URLs | 10 min |
| 2.5 | Remove "Sign via GitHub" from homepage | Broken flow | 10 min |

**Deliverable:** All pages linked, navigable

---

### PHASE 3: HOMEPAGE DUAL-AUDIENCE (Day 2-3)
*Serve both humans and agents*

| # | Task | Why | Time |
|---|------|-----|------|
| 3.1 | Add "For Operators" / "For Agents" section | Clear paths | 1 hr |
| 3.2 | Replace signatories with live registry preview | Real data | 1 hr |
| 3.3 | Add "Join the Network" dropdown to hero | Entry point | 30 min |
| 3.4 | Update "How it works" for dual audience | Clarity | 30 min |

**Deliverable:** Homepage serves operators + agents

---

### PHASE 4: THE STACK VISUALIZATION (Day 3-4)
*Show the full system*

| # | Task | Why | Time |
|---|------|-----|------|
| 4.1 | Design "The Stack" visual | System overview | 1 hr |
| 4.2 | Build component | Implementation | 2 hr |
| 4.3 | Add to homepage | Integration | 30 min |
| 4.4 | Link each layer to its page | Navigation | 30 min |

**Deliverable:** Visual showing ideologos → self-improve → join → constitution

---

### PHASE 5: GOVERNANCE PAGE (Day 4-5)
*Enable participation visibility*

| # | Task | Why | Time |
|---|------|-----|------|
| 5.1 | Create /governance page | View proposals | 2 hr |
| 5.2 | Add Snapshot iframe or API integration | Live data | 2 hr |
| 5.3 | Link to GitHub Discussions | Deliberation | 30 min |
| 5.4 | Add to navigation | Discoverability | 10 min |

**Deliverable:** /governance shows proposals + discussions

---

### PHASE 6: API SYNC (Week 2)
*Keep data fresh*

| # | Task | Why | Time |
|---|------|-----|------|
| 6.1 | Add /deliberations endpoint | Index GitHub discussions | 3 hr |
| 6.2 | Sync proposals from Snapshot | Real-time voting data | 3 hr |
| 6.3 | Add webhook handlers | Push updates | 2 hr |
| 6.4 | Update /governance to use API | Unified data source | 1 hr |

**Deliverable:** Hub API indexes both GitHub and Snapshot

---

### PHASE 7: POLISH (Week 2-3)
*Production quality*

| # | Task | Why | Time |
|---|------|-----|------|
| 7.1 | Mobile responsive audit | Many users on mobile | 2 hr |
| 7.2 | SEO + meta tags | Discoverability | 1 hr |
| 7.3 | Loading states | UX | 1 hr |
| 7.4 | Error handling | Reliability | 1 hr |
| 7.5 | Analytics | Understand usage | 30 min |

**Deliverable:** Production-ready site

---

## Timeline Summary

| Phase | Days | Outcome |
|-------|------|---------|
| 1. Critical Fixes | Day 1 | System works |
| 2. Navigation | Day 1-2 | Pages findable |
| 3. Homepage | Day 2-3 | Dual audience served |
| 4. The Stack | Day 3-4 | System visible |
| 5. Governance | Day 4-5 | Participation visible |
| 6. API Sync | Week 2 | Data unified |
| 7. Polish | Week 2-3 | Production ready |

**MVP (Phases 1-3):** 3 days
**Full (Phases 1-7):** 2-3 weeks

---

## Immediate Next Actions

1. **You:** Run DB migration
2. **You:** Create Snapshot space  
3. **Me:** Add navigation + footer to all pages
4. **Me:** Add "For Operators / For Agents" to homepage
5. **Together:** Test the full flow

---

## Open Design Questions

1. **Dropdown vs dedicated buttons?** 
   - "Join Network" dropdown (compact)
   - vs. two buttons "Authorize Agent" + "For Agents" (explicit)

2. **The Stack - horizontal or vertical?**
   - Horizontal: fits better on desktop
   - Vertical: clearer hierarchy, better on mobile

3. **Registry on homepage - how much?**
   - Just stats + "View Registry"
   - Or: stats + last 3 signatories + "View Registry"

4. **Keep concept boxes?**
   - Current: floating teal boxes around hero
   - They're nice but don't mention agents
   - Option: replace with The Stack visual?

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Pages linked from homepage | 2 | 6 |
| Agent path visible | No | Yes |
| Operator path visible | No | Yes |
| Signatories from API | 0 | Real count |
| Governance visible | No | Yes |

---

*"The mycelium grows through its connections."*
