# Governance System Setup

This document describes how to set up the governance system for the Constitution project.

## Overview

The governance system uses:
- **Snapshot.org** for decentralized, gasless voting
- **Supabase** for local proposal tracking and citizen management
- **Web3 wallets** (MetaMask, etc.) for identity and signing

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Constitution  │────▶│    Supabase     │────▶│   Snapshot.org  │
│   Next.js App   │     │   (PostgreSQL)  │     │   (IPFS/Arweave)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
   Citizens create         Local tracking         On-chain voting
   & vote on proposals     & metadata             & verification
```

## Setup Steps

### 1. Create Snapshot Space

Go to https://snapshot.org and create a new space:

1. **Space ID**: `emergentvibe.eth` (requires ENS name)
2. **Network**: Ethereum mainnet (for token-based voting) or use offchain
3. **Symbol**: `VOTE` or `CITIZEN`

**Settings to configure:**
```json
{
  "name": "Emergent Vibe Constitution",
  "about": "Governance for the emergentvibe.com constitution",
  "network": "1",
  "symbol": "VOTE",
  "admins": ["your-wallet-address"],
  "moderators": [],
  "voting": {
    "delay": 3600,
    "period": 604800,
    "quorum": 0
  },
  "strategies": [
    {
      "name": "whitelist",
      "params": {
        "addresses": [
          "citizen-wallet-1",
          "citizen-wallet-2"
        ]
      }
    }
  ],
  "validation": {
    "name": "basic",
    "params": {}
  }
}
```

**Voting Strategies (choose one):**

A. **Whitelist** (simplest)
- Only addresses in the list can vote
- Add citizen wallets as they're approved
- 1 vote per citizen

B. **ERC-721 NFT**
- Mint citizenship NFTs
- Token holders can vote
- More decentralized

C. **Custom contract**
- Deploy a contract that returns voting power
- Most flexible, most complex

### 2. Set Up Supabase

Create a new Supabase project and run the migrations:

1. Go to https://supabase.com
2. Create new project
3. Get your credentials from Settings > API

**Run migrations:**
```bash
cd projects/constitution

# Option A: Using Supabase CLI
npx supabase db push

# Option B: Manually in Supabase SQL Editor
# Copy and run each file in supabase/migrations/ in order
```

**Required migrations:**
- `001_citizens.sql` - Citizens table
- `002_*.sql` - Any other schema
- `003_governance.sql` - Governance tables

### 3. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### 4. Update Snapshot Space ID

If using a different space ID, update `src/lib/snapshot.ts`:

```typescript
export const SNAPSHOT_SPACE = 'your-space.eth';
```

### 5. Set Up Sync Job (Optional)

To keep local DB in sync with Snapshot:

```bash
# Add to crontab
0 * * * * cd /path/to/constitution && npx ts-node scripts/sync-snapshot.ts >> /var/log/snapshot-sync.log 2>&1
```

## Proposal Flow

### Creating a Proposal

1. Citizen fills out proposal form on `/governance/new`
2. Draft saved to Supabase (`governance_proposals` table)
3. Citizen signs and submits to Snapshot
4. Snapshot proposal linked to local record

### Voting

1. Citizen views proposal on `/governance/[id]`
2. Selects choice and submits
3. Vote recorded locally
4. Citizen signs Snapshot vote message
5. Vote submitted to Snapshot

### Resolution

1. Voting period ends
2. Sync job updates proposal status
3. Results stored in `final_scores`, `final_outcome`
4. Proposal can trigger constitution amendments

## Database Schema

### governance_proposals

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Proposal title |
| description | TEXT | Full description |
| proposal_type | ENUM | Type (amendment, policy, etc.) |
| status | ENUM | draft/pending/active/closed |
| snapshot_id | TEXT | Linked Snapshot proposal ID |
| choices | JSONB | Voting options |
| final_scores | JSONB | Final vote counts |
| final_outcome | TEXT | passed/rejected/no_quorum |

### governance_votes

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| proposal_id | UUID | FK to proposals |
| citizen_id | UUID | FK to citizens |
| choice | INTEGER | Selected choice (1-indexed) |
| reason | TEXT | Optional reason |
| snapshot_vote_id | TEXT | Linked Snapshot vote |

## Voting Thresholds

| Proposal Type | Quorum | Approval | Period |
|--------------|--------|----------|--------|
| Constitutional Amendment | 33% | 67% | 14 days |
| Boundary Change | 25% | 67% | 10 days |
| Policy Proposal | 15% | 51% | 7 days |
| Resource Allocation | 10% | 51% | 5 days |
| Emergency Action | 5% | 67% | 3 days |

## Security Considerations

- All votes are signed with user's wallet
- Snapshot provides immutable vote record
- Local DB mirrors for UX, Snapshot is source of truth
- RLS policies prevent unauthorized access

## Troubleshooting

**"Space not found" error:**
- Ensure the Snapshot space exists
- Check space ID matches in `src/lib/snapshot.ts`

**Votes not syncing:**
- Check sync job is running
- Verify Supabase credentials
- Check Snapshot API rate limits

**Wallet connection issues:**
- Ensure user has Web3 wallet installed
- Check correct network selected
