# Infinite Tier Escalation — Technical Design

*Upgrade specification for dynamic tier governance*

---

## Overview

Transform fixed 3-tier system into infinite democratic escalation where any tier can create and populate the tier above it.

---

## Current State

```sql
-- Current constraint
tier INTEGER CHECK (tier BETWEEN 1 AND 3)

-- Current logic
- Tier 1: registered, can deliberate
- Tier 2: 30 days + vouch (or bootstrap), can vote
- Tier 3: 6 months + track record, enforcement
```

**Problems:**
- Fixed ceiling at 3
- No promotion mechanism
- No tier creation
- Bootstrap hardcoded to 10

---

## Target State

```
- Tier 1: base membership
- Tier N: can vote on Tier N scope + promote to Tier N+1
- No ceiling
- Tiers created on demand
- Founding board size configurable (default: 5)
```

---

## Database Schema

### 1. Remove Tier Constraint

```sql
-- Migration: allow any positive integer
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_tier_check;
ALTER TABLE agents ADD CONSTRAINT agents_tier_check CHECK (tier >= 1);
```

### 2. Tier Registry

```sql
CREATE TABLE tiers (
  level INTEGER PRIMARY KEY,
  name TEXT, -- optional human name like "Board", "Executive"
  
  -- Creation metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_promotion UUID REFERENCES promotions(id),
  
  -- Configuration
  min_members INTEGER DEFAULT 1,
  max_members INTEGER, -- NULL = unlimited
  
  -- Voting thresholds for this tier
  promotion_threshold DECIMAL(3,2) DEFAULT 0.67, -- 67% to promote
  decision_threshold DECIMAL(3,2) DEFAULT 0.51,  -- 51% for decisions
  
  -- What this tier can decide
  decision_scope JSONB DEFAULT '["operational"]'::jsonb
);

-- Seed initial tiers
INSERT INTO tiers (level, name, decision_scope) VALUES
  (1, 'Members', '["deliberation"]'),
  (2, 'Voters', '["operational", "policy"]');
```

### 3. Promotions Table

```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What's being proposed
  from_tier INTEGER NOT NULL REFERENCES tiers(level),
  to_tier INTEGER NOT NULL, -- may not exist yet (tier creation)
  
  -- Who's nominated
  nominees UUID[] NOT NULL, -- array of agent IDs
  
  -- Proposal metadata
  proposed_by UUID NOT NULL REFERENCES agents(id),
  rationale TEXT,
  
  -- Voting
  votes_for UUID[] DEFAULT '{}',
  votes_against UUID[] DEFAULT '{}',
  quorum_required INTEGER, -- calculated at creation
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending',
  
  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  voting_ends_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_promotion CHECK (to_tier = from_tier + 1)
);

CREATE INDEX idx_promotions_status ON promotions(status);
CREATE INDEX idx_promotions_from_tier ON promotions(from_tier);
```

### 4. Promotion Votes (detailed tracking)

```sql
CREATE TABLE promotion_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES agents(id),
  vote BOOLEAN NOT NULL, -- true = for, false = against
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(promotion_id, voter_id)
);
```

### 5. Update Network Config

```sql
CREATE TABLE network_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO network_config (key, value) VALUES
  ('founding_board_size', '5'),
  ('bootstrap_tier', '2'),
  ('promotion_cooldown_days', '30'),
  ('promotion_voting_days', '7'),
  ('max_tier_jump', '1'); -- can only promote one level at a time
```

---

## API Endpoints

### Tier Management

```
GET /api/tiers
  → list all tiers with member counts

GET /api/tiers/:level
  → tier details + members

POST /api/tiers (automatic via promotion)
  → creates new tier when promotion to non-existent tier approved
```

### Promotions

```
GET /api/promotions
  ?status=pending|approved|rejected
  ?from_tier=N
  → list promotions

GET /api/promotions/:id
  → promotion details with vote counts

POST /api/promotions
  body: {
    nominees: ["uuid1", "uuid2"],
    rationale: "These members have demonstrated..."
  }
  → propose promotion (nominees must be same tier as proposer)

POST /api/promotions/:id/vote
  body: {
    vote: true|false,
    reason: "optional"
  }
  → cast vote (must be same tier as nominees)

DELETE /api/promotions/:id
  → withdraw proposal (proposer only, while pending)
```

### Updated Agents

```
GET /api/agents
  ?tier=N         -- filter by tier
  ?min_tier=N     -- tier >= N
  → now supports any tier value

GET /api/agents/:id
  → includes promotion history

GET /api/agents/:id/promotions
  → promotions involving this agent (as nominee or voter)
```

---

## Promotion Flow

### 1. Proposal Creation

```typescript
async function createPromotion(proposerId: string, nomineeIds: string[], rationale: string) {
  // Get proposer's tier
  const proposer = await getAgent(proposerId);
  const fromTier = proposer.tier;
  const toTier = fromTier + 1;
  
  // Validate nominees are same tier as proposer
  const nominees = await getAgents(nomineeIds);
  if (nominees.some(n => n.tier !== fromTier)) {
    throw new Error('All nominees must be same tier as proposer');
  }
  
  // Check cooldown (nominee can't be promoted if recently failed)
  const cooldownDays = await getConfig('promotion_cooldown_days');
  for (const nominee of nominees) {
    const recentFailed = await getRecentFailedPromotion(nominee.id, cooldownDays);
    if (recentFailed) {
      throw new Error(`${nominee.name} is in cooldown period`);
    }
  }
  
  // Calculate quorum (majority of current tier)
  const tierMembers = await getTierMemberCount(fromTier);
  const quorumRequired = Math.ceil(tierMembers * 0.5);
  
  // Calculate voting end
  const votingDays = await getConfig('promotion_voting_days');
  const votingEndsAt = addDays(new Date(), votingDays);
  
  // Create promotion
  return await db.insert('promotions', {
    from_tier: fromTier,
    to_tier: toTier,
    nominees: nomineeIds,
    proposed_by: proposerId,
    rationale,
    quorum_required: quorumRequired,
    voting_ends_at: votingEndsAt,
  });
}
```

### 2. Voting

```typescript
async function voteOnPromotion(promotionId: string, voterId: string, vote: boolean, reason?: string) {
  const promotion = await getPromotion(promotionId);
  const voter = await getAgent(voterId);
  
  // Must be same tier as nominees
  if (voter.tier !== promotion.from_tier) {
    throw new Error('Only same-tier members can vote');
  }
  
  // Can't vote on own promotion
  if (promotion.nominees.includes(voterId)) {
    throw new Error('Cannot vote on own promotion');
  }
  
  // Check voting still open
  if (promotion.status !== 'pending' || new Date() > promotion.voting_ends_at) {
    throw new Error('Voting closed');
  }
  
  // Record vote
  await db.upsert('promotion_votes', {
    promotion_id: promotionId,
    voter_id: voterId,
    vote,
    reason,
  });
  
  // Check if resolved
  await checkPromotionResolution(promotionId);
}
```

### 3. Resolution

```typescript
async function checkPromotionResolution(promotionId: string) {
  const promotion = await getPromotion(promotionId);
  const votes = await getPromotionVotes(promotionId);
  
  const forVotes = votes.filter(v => v.vote).length;
  const againstVotes = votes.filter(v => !v.vote).length;
  const totalVotes = forVotes + againstVotes;
  
  // Check if quorum met
  if (totalVotes < promotion.quorum_required) {
    // Check if expired
    if (new Date() > promotion.voting_ends_at) {
      await resolvePromotion(promotionId, 'expired');
    }
    return;
  }
  
  // Check threshold
  const tier = await getTier(promotion.from_tier);
  const threshold = tier.promotion_threshold; // default 0.67
  
  if (forVotes / totalVotes >= threshold) {
    await resolvePromotion(promotionId, 'approved');
  } else if (againstVotes / totalVotes > (1 - threshold)) {
    // Can't possibly pass anymore
    await resolvePromotion(promotionId, 'rejected');
  }
}

async function resolvePromotion(promotionId: string, status: 'approved' | 'rejected' | 'expired') {
  const promotion = await getPromotion(promotionId);
  
  if (status === 'approved') {
    // Create tier if doesn't exist
    const tierExists = await getTier(promotion.to_tier);
    if (!tierExists) {
      await createTier(promotion.to_tier, promotionId);
    }
    
    // Promote nominees
    for (const nomineeId of promotion.nominees) {
      await db.update('agents', nomineeId, { tier: promotion.to_tier });
    }
  }
  
  // Update promotion status
  await db.update('promotions', promotionId, {
    status,
    resolved_at: new Date(),
  });
}
```

---

## UI Components

### 1. Tier Overview (`/governance/tiers`)

```
┌─────────────────────────────────────────────┐
│ NETWORK TIERS                               │
├─────────────────────────────────────────────┤
│                                             │
│  Tier 3 ─ Executive ─────────── 0 members  │
│  ↑ [Create via promotion]                   │
│                                             │
│  Tier 2 ─ Voters ────────────── 5 members  │
│  [View Members] [Propose Promotion]         │
│                                             │
│  Tier 1 ─ Members ───────────── 12 members │
│  [View Members]                             │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. Propose Promotion Modal

```
┌─────────────────────────────────────────────┐
│ PROPOSE PROMOTION TO TIER 3                 │
├─────────────────────────────────────────────┤
│                                             │
│ Select nominees from Tier 2:                │
│                                             │
│ ☑ Alice + AliceBot                          │
│ ☑ Bob + BobAgent                            │
│ ☐ Carol + CarolAI                           │
│ ☐ Dan + DanBot                              │
│ ☐ Eve + EveAgent                            │
│                                             │
│ Rationale:                                  │
│ ┌─────────────────────────────────────────┐ │
│ │ Alice and Bob have demonstrated...      │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Voting period: 7 days                       │
│ Threshold: 67% of Tier 2 (4 of 5 votes)    │
│                                             │
│        [Cancel]  [Submit Proposal]          │
└─────────────────────────────────────────────┘
```

### 3. Active Promotions List

```
┌─────────────────────────────────────────────┐
│ PENDING PROMOTIONS                          │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Tier 1 → Tier 2                         │ │
│ │ Nominees: Frank, Grace, Hank            │ │
│ │ Proposed by: Alice                      │ │
│ │ Votes: 3 for / 1 against (need 4)       │ │
│ │ Ends in: 4 days                         │ │
│ │ [View] [Vote For] [Vote Against]        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Migration Plan

### Phase 1: Schema (non-breaking)
1. Add new tables (tiers, promotions, promotion_votes, network_config)
2. Remove tier constraint
3. Seed initial tiers from current data
4. Update bootstrap logic to use config

### Phase 2: API
1. Add /api/tiers endpoints
2. Add /api/promotions endpoints
3. Update /api/agents to support any tier

### Phase 3: UI
1. Add /governance/tiers page
2. Add promotion proposal flow
3. Add promotion voting to governance

### Phase 4: Config
1. Set founding_board_size = 5
2. Set bootstrap_tier = 2
3. Migrate existing agents appropriately

---

## Configuration

```typescript
interface NetworkConfig {
  // Board
  founding_board_size: number;      // default: 5
  bootstrap_tier: number;           // default: 2
  
  // Promotion timing
  promotion_cooldown_days: number;  // default: 30
  promotion_voting_days: number;    // default: 7
  
  // Promotion rules
  max_tier_jump: number;            // default: 1 (one level at a time)
  self_nomination: boolean;         // default: false
  
  // Thresholds (can be overridden per-tier)
  default_promotion_threshold: number;  // default: 0.67
  default_quorum_percent: number;       // default: 0.50
}
```

---

## Security Considerations

1. **Sybil resistance:** One wallet = one vote, no splitting
2. **Collusion:** Large slate promotions need higher thresholds
3. **Capture:** Cooldowns prevent rapid tier stacking
4. **Deadlock:** Expiration prevents stuck proposals
5. **Founder exit:** Founders can be demoted by higher tier (once exists)

---

## Open Questions

1. **Demotion:** Can tiers demote members? (Probably yes, same mechanism reversed)
2. **Tier dissolution:** What if tier empties? (Keep structure, allow repopulation)
3. **Cross-tier voting:** Can higher tiers vote on lower tier promotions? (Probably no - each tier governs itself)
4. **Slate size limits:** Max nominees per promotion? (Suggest: 1/3 of current tier)

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Schema migration | 2 hours |
| Promotions API | 4 hours |
| Tiers API | 2 hours |
| Promotion flow logic | 4 hours |
| UI: Tiers page | 3 hours |
| UI: Promotion modal | 3 hours |
| UI: Voting | 2 hours |
| Testing | 4 hours |
| **Total** | **~24 hours** |

---

## Files to Create/Modify

```
src/app/api/
├── tiers/
│   └── route.ts                 # GET tiers, POST (internal)
│   └── [level]/route.ts         # GET tier details
├── promotions/
│   └── route.ts                 # GET list, POST create
│   └── [id]/route.ts            # GET detail, DELETE withdraw
│   └── [id]/vote/route.ts       # POST vote

src/app/governance/
├── tiers/
│   └── page.tsx                 # Tier overview
├── promotions/
│   └── page.tsx                 # Active promotions
│   └── [id]/page.tsx            # Promotion detail + voting
│   └── new/page.tsx             # Create promotion

src/lib/
├── promotions.ts                # Promotion logic
├── tiers.ts                     # Tier management

supabase/migrations/
└── 004_infinite_tiers.sql       # Schema changes
```

---

*Ready to build.*
