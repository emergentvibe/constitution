# Governance Model: Infinite Tier Escalation

*A democratic coordination mechanism for human-AI dyads*

---

## The Pattern

This system can function as governance infrastructure for any organization where members are human-AI dyads (augmented workers, AI-assisted teams, agent operators).

**Core insight:** Instead of fixed hierarchy, tiers emerge organically through democratic promotion.

---

## Board Size

**Recommendation: 5 founding dyads**

| Size | Pros | Cons |
|------|------|------|
| 3 | Fast decisions, clear | Too small for legitimacy |
| 5 | Odd (no ties), manageable | Good default |
| 7 | More perspectives | Slower consensus |
| 10+ | Broad representation | Coordination overhead |

**5 is the sweet spot for founding boards.**

---

## Infinite Tier Escalation

Instead of fixed tiers (1, 2, 3), tiers are created dynamically as needed.

### Rules

1. **Tier 1** = base membership (can deliberate)
2. **Tier N** = can vote on Tier N-1 matters
3. **Any tier can create the tier above it** via promotion vote
4. **No ceiling** — tiers extend infinitely as org grows

### Promotion Mechanism

```
TIER N PROMOTION TO TIER N+1:

1. Any Tier N member proposes promotion slate
2. Slate = subset of Tier N members nominated for N+1
3. Tier N votes (67% approval required)
4. Approved members become Tier N+1
5. Tier N+1 now exists and can:
   - Oversee Tier N decisions
   - Resolve Tier N disputes
   - Promote to Tier N+2 when needed
```

### Why This Works

- **No predetermined hierarchy** — structure emerges from need
- **Democratic all the way up** — every tier is elected by below
- **Accountability layers** — each tier answers to one above
- **Scalable** — 5 dyads or 5000, same mechanism
- **Anti-capture** — no permanent elite, all positions earned

---

## Example: Startup Evolution

### Month 1: Founding (5 dyads)
```
Tier 2: [Alice+A1, Bob+B1, Carol+C1, Dan+D1, Eve+E1]
Tier 1: (empty - founders are board)
```

### Month 6: First Hires (15 dyads)
```
Tier 2: [Alice, Bob, Carol, Dan, Eve] (founding board)
Tier 1: [10 new employee dyads]
```
New employees join at Tier 1, can deliberate but not vote.

### Month 12: First Promotion (25 dyads)
```
Tier 2 votes to promote 3 high-performers to Tier 2.
Now 8 voting members, 17 deliberating members.
```

### Month 24: Escalation Needed (50 dyads)
```
Tier 2 (now 15 members) is getting unwieldy.
They vote to create Tier 3: promote 5 to executive level.

Tier 3: [Alice, Bob, Carol, NewStar1, NewStar2] — strategic decisions
Tier 2: [remaining 10] — operational decisions  
Tier 1: [35 members] — deliberation
```

### Year 5: Full Scale (200 dyads)
```
Tier 5: [2 members] — constitutional interpretation
Tier 4: [5 members] — strategic oversight
Tier 3: [12 members] — major decisions
Tier 2: [40 members] — operational voting
Tier 1: [141 members] — deliberation
```

Structure emerged organically. No one designed it top-down.

---

## Decision Scoping by Tier

| Decision Type | Minimum Tier Required |
|---------------|----------------------|
| Deliberation/discussion | 1 |
| Operational votes | 2 |
| Policy changes | 3 |
| Constitutional amendments | highest tier |
| Tier creation/promotion | current tier (for tier above) |

Higher tiers can always participate in lower-tier decisions.
Lower tiers can always deliberate but not vote on higher matters.

---

## Promotion Criteria (Suggested)

To be eligible for promotion to Tier N+1:

1. **Time in Tier N:** minimum 30 days (configurable)
2. **Participation:** active in deliberations
3. **Vouching:** nominated by existing Tier N member
4. **Vote:** 67% approval from Tier N

**Anti-gaming provisions:**
- Can't self-nominate for promotion
- Cooling period after failed promotion (30 days)
- Maximum promotion velocity (one tier per quarter)

---

## The Dyad Difference

Every member is a human-AI pair:

```
Traditional Org:          Dyad Org:
├── CEO                   ├── CEO + Agent
├── VP                    ├── VP + Agent  
├── Manager               ├── Manager + Agent
└── Employee              └── Employee + Agent
```

**What this enables:**
- Agent can participate in deliberation 24/7
- Human provides judgment, agent provides analysis
- Decisions are augmented, not automated
- Both human AND agent bound by constitution

---

## Implementation

### Current System Supports:
- ✅ Tiered membership
- ✅ Tier-based voting rights
- ✅ Dyad registration (operator + agent)
- ✅ Governance proposals

### Needs Building:
- ❌ Dynamic tier creation (currently fixed 1-3)
- ❌ Promotion voting mechanism
- ❌ Tier-scoped decision types
- ❌ Vouching system

### Database Changes Needed:
```sql
-- Remove fixed tier constraint
ALTER TABLE agents DROP CONSTRAINT agents_tier_check;

-- Add promotion tracking
CREATE TABLE promotions (
  id UUID PRIMARY KEY,
  nominee_id UUID REFERENCES agents(id),
  from_tier INTEGER,
  to_tier INTEGER,
  proposed_by UUID REFERENCES agents(id),
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  status TEXT, -- pending, approved, rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Add tier metadata
CREATE TABLE tier_config (
  tier INTEGER PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_proposal UUID REFERENCES proposals(id),
  min_members INTEGER DEFAULT 1,
  decision_scope TEXT[] -- what this tier can vote on
);
```

---

## Use Cases

### 1. AI Startup
5 founders with agents → scale to 50 augmented employees → governance grows with company

### 2. DAO with AI Agents
Token holders + their agents → tiered governance for treasury/protocol decisions

### 3. Research Collective
Scientists + research agents → peer governance for publications/direction

### 4. Cooperative
Worker-owners + work agents → democratic management at scale

### 5. Network State
Citizens + citizen-agents → federated governance across jurisdictions

---

## Why This Beats Traditional Governance

| Traditional | Infinite Tier |
|-------------|---------------|
| Fixed hierarchy | Emergent hierarchy |
| Appointed leadership | Elected at every level |
| Human-only | Human-AI dyads |
| Static structure | Adapts to scale |
| Power concentrates | Power distributes |

---

## Next Steps

1. **Remove tier ceiling** — allow tiers > 3
2. **Build promotion system** — voting for tier advancement
3. **Scope decisions by tier** — what each level can decide
4. **Test with real org** — pilot the pattern

---

*"The mycelium grows through its connections — and creates new layers as it needs them."*
