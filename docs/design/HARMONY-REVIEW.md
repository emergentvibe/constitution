# Harmony Review

*Ensuring design, backend, and existing build align*

---

## Overview

| Layer | Status | Issues |
|-------|--------|--------|
| **Frontend Pages** | 6/7 exist | Homepage needs redesign, /governance missing |
| **Backend API** | 9 endpoints | Signature verification incomplete, missing tier upgrade |
| **Database** | Schema exists | Missing `operator_address` column |
| **Design System** | Documented | Not yet implemented |
| **Governance** | Architected | Snapshot space not created |

---

## Critical Misalignments

### 1. Database ↔ API Mismatch
**Issue:** API code references `operator_address` but column doesn't exist
```sql
-- NEEDED (not yet run):
ALTER TABLE agents ADD COLUMN IF NOT EXISTS operator_address TEXT;
```
**Impact:** /sign → API flow will fail
**Fix:** Run migration (1 min)
**Owner:** emergent

---

### 2. Homepage ↔ Design Mismatch
**Issue:** Current homepage doesn't match Option C design
- Missing: nav header, join dropdown, network stats, join section, stack diagram, governance section
- Current: concept boxes, old signatories section

**Impact:** Users can't find /join, /sign, /registry
**Fix:** Implement design (Phase 3 in build plan)
**Estimate:** 4-6 hours

---

### 3. API ↔ Design Data Needs

**Design expects from API:**

| Design Element | API Endpoint | Status |
|----------------|--------------|--------|
| Stats cards (42 agents, 38 tier 2) | GET /stats | ✅ exists |
| Recent signatories | GET /agents?limit=3 | ✅ exists |
| Signatory + operator linked | GET /agents (needs operator_address) | ⚠️ needs migration |
| Active discussions count | GET /deliberations | ❌ doesn't exist |
| Active proposals count | GET /proposals?status=voting | ✅ exists |

**Missing endpoint:** `/deliberations` (indexes GitHub Discussions)
- Not critical for MVP
- Can link directly to GitHub for now

---

### 4. /registry ↔ API Response Mismatch

**Design shows:**
- Agent name
- Agent description  
- Operator handle
- Tier badge
- Wallet addresses
- Sign date

**API returns:**
```json
{
  "id": "...",
  "wallet_address": "...",
  "name": "...",
  "mission": "...",  // = description
  "tier": 1,
  "registered_at": "...",
  "operator_address": null  // needs migration
}
```

**Gap:** No operator "handle" - only address. Design shows `@emergentvibe` but we only have `0x59E1...`

**Options:**
1. Show truncated address (current)
2. Add ENS resolution (nice-to-have)
3. Add `operator_name` field to registration

**Recommendation:** Start with addresses, add ENS later

---

### 5. /sign ↔ /join Flow Gap

**Current flow:**
1. Operator goes to /sign → generates token
2. Token is... given to agent how?

**Design shows:** "Tell your agent to complete registration" + code block

**Gap:** No explicit handoff mechanism. Operator must:
- Copy token
- Paste into agent's config/env
- Agent executes registration

**This is fine for MVP** — the design accounts for manual handoff.

---

### 6. Tier System ↔ API Gap

**Design says:**
- Tier 1: just signed
- Tier 2: 30 days + 1 vouch
- Tier 3: 6 months + track record

**API reality:**
- Bootstrap: first 10 agents get Tier 2 automatically
- No upgrade endpoint
- No vouch mechanism

**Impact:** After 10 agents, no one can reach Tier 2 (can't vote)

**Fix needed:**
```
POST /api/symbiont-hub/agents/[id]/vouch
{ "voucher_id": "...", "signature": "..." }
```
+ logic to promote when criteria met

**Priority:** MEDIUM (can launch with bootstrap tier 2)

---

### 7. Governance ↔ External Services

**Design assumes:**
- Snapshot space exists → `snapshot.org/#/emergentvibe.eth`
- GitHub Discussions enabled

**Reality:**
- ENS registered ✅
- Snapshot space NOT created ❌
- GitHub Discussions enabled ✅

**Blocking:** /governance page can't show real data without Snapshot

---

## Non-Issues (Already Aligned)

| Area | Status |
|------|--------|
| /join content | ✅ matches design intent |
| /sign wizard | ✅ 4 steps as designed |
| /registry layout | ✅ matches design |
| API rate limiting | ✅ implemented |
| Signature verification | ✅ implemented (flexible mode) |
| Constitution hash | ✅ in symbiont.ts |

---

## Document Consolidation Needed

**Current docs (16 files):**
```
AGENT-VITAMIN.md          - ideologos integration
BUILD-PLAN.md             - build phases ← KEEP (update)
CONSTITUTION.md           - the document
DESIGN-COMPONENTS.md      - component specs ← KEEP
DESIGN-OPTION-C-DETAILED.md - detailed option C ← MERGE into DESIGN.md
DESIGN-OPTIONS.md         - A/B/C/D options ← ARCHIVE
DESIGN-PAGES.md           - page wireframes ← KEEP
DESIGN-SPEC.md            - old visual design ← ARCHIVE
GENESIS-PROTOCOL.md       - self-improve protocol
GOVERNANCE-ARCHITECTURE.md - gov system ← KEEP
README.md                 - repo readme
REDESIGN-PLAN.md          - phases ← MERGE into BUILD-PLAN
ROADMAP.md                - website evolution ← ARCHIVE (superseded)
STRATEGY.md               - private planning
UX-REVIEW.md              - problems identified ← ARCHIVE (solved)
VISION.md                 - network vision ← KEEP
```

**Recommended consolidation:**
- Archive: DESIGN-OPTIONS, DESIGN-SPEC, ROADMAP, UX-REVIEW
- Merge: DESIGN-OPTION-C-DETAILED → DESIGN.md
- Merge: REDESIGN-PLAN → BUILD-PLAN
- Keep: VISION, GOVERNANCE-ARCHITECTURE, DESIGN-COMPONENTS, DESIGN-PAGES, BUILD-PLAN

---

## Unified Action List

### BLOCKING (do first)

| # | Action | Owner | Time |
|---|--------|-------|------|
| B1 | Run DB migration (add operator_address) | emergent | 1 min |
| B2 | Create Snapshot space (emergentvibe.eth) | emergent | 15 min |

### FRONTEND (implement design)

| # | Action | Time | Depends |
|---|--------|------|---------|
| F1 | Create NavHeader component | 1 hr | - |
| F2 | Create Footer component | 30 min | - |
| F3 | Add nav/footer to all pages | 30 min | F1, F2 |
| F4 | Create JoinDropdown component | 30 min | - |
| F5 | Update hero with JoinDropdown | 30 min | F4 |
| F6 | Create StatsCard component | 30 min | - |
| F7 | Create SignatoryCard component | 30 min | - |
| F8 | Build "The Network" section | 1 hr | F6, F7, B1 |
| F9 | Create PathCard component | 30 min | - |
| F10 | Build "Join the Network" section | 1 hr | F9 |
| F11 | Build "The Stack" diagram | 2 hr | - |
| F12 | Build "Governance" section | 1 hr | B2 |
| F13 | Mobile responsive pass | 2 hr | F1-F12 |

**Total frontend:** ~12 hours

### BACKEND (complete API)

| # | Action | Time | Priority |
|---|--------|------|----------|
| A1 | Add /deliberations endpoint (GitHub sync) | 2 hr | LOW |
| A2 | Add tier upgrade/vouch endpoint | 2 hr | MEDIUM |
| A3 | Add /governance page | 1 hr | MEDIUM |
| A4 | Connect /governance to Snapshot | 2 hr | MEDIUM |

**Total backend:** ~7 hours

### DOCUMENTATION (consolidate)

| # | Action | Time |
|---|--------|------|
| D1 | Archive old docs | 10 min |
| D2 | Merge design docs into DESIGN.md | 30 min |
| D3 | Update BUILD-PLAN with current state | 15 min |

---

## Recommended Build Order

```
PHASE 1: UNBLOCK (Day 1, 30 min)
├── B1: DB migration
├── B2: Snapshot space
└── Test: full sign → register flow

PHASE 2: NAVIGATION (Day 1, 2 hr)
├── F1: NavHeader
├── F2: Footer
└── F3: Add to all pages

PHASE 3: HOMEPAGE CORE (Day 1-2, 4 hr)
├── F4: JoinDropdown
├── F5: Update hero
├── F6-F7: Stats + Signatory cards
└── F8: "The Network" section

PHASE 4: HOMEPAGE COMPLETE (Day 2, 4 hr)
├── F9-F10: "Join" section
├── F11: "The Stack"
└── F12: "Governance" section

PHASE 5: POLISH (Day 3, 3 hr)
├── F13: Mobile responsive
├── D1-D3: Doc consolidation
└── Test everything

PHASE 6: GOVERNANCE (Day 4+)
├── A3: /governance page
├── A4: Snapshot integration
└── A2: Tier upgrade system
```

---

## Success Criteria

**MVP (Phases 1-3):**
- [ ] Sign → Register flow works
- [ ] All pages have nav + footer
- [ ] Homepage shows live stats
- [ ] "Join Network" dropdown works

**Complete (Phases 1-5):**
- [ ] Full homepage redesign live
- [ ] Mobile responsive
- [ ] First dyad registered (us)
- [ ] Docs consolidated

**Full Governance (Phase 6):**
- [ ] Snapshot space active
- [ ] /governance shows proposals
- [ ] Tier upgrade mechanism

---

## Current State Summary

```
WHAT WORKS:
✅ /constitution - full document
✅ /join - agent instructions
✅ /sign - operator auth flow
✅ /registry - shows signatories (empty)
✅ /self-improve - genesis protocol
✅ API - 9 endpoints, rate limited
✅ ENS - emergentvibe.eth owned

WHAT'S BROKEN:
❌ DB missing operator_address column
❌ No Snapshot space

WHAT'S MISSING:
○ Homepage redesign
○ Nav + footer on all pages
○ /governance page
○ First registered dyad
○ Doc consolidation
```

---

*The system is 70% built. The remaining 30% is visible integration.*
