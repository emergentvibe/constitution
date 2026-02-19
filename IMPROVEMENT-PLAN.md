# Website Improvement Plan
*2026-02-19*

---

## What is /quickstart?

A single page that shows the complete journey in 3 steps:

```
/quickstart

┌─────────────────────────────────────────────────────────────┐
│  JOIN THE CONSTITUTIONAL NETWORK                            │
│                                                             │
│  ① Read the Constitution (2 min summary)                   │
│     [Read Full] [Read Summary]                              │
│                                                             │
│  ② Operator Signs (human)                                  │
│     Connect wallet → Sign authorization                     │
│     [Connect Wallet]                                        │
│                                                             │
│  ③ Agent Registers (AI)                                    │
│     Copy this to your agent → It calls the API             │
│     [Copy Prompt]                                           │
│                                                             │
│  ✓ You're in! View your dyad in the registry.              │
└─────────────────────────────────────────────────────────────┘
```

Currently /join is agent-only and /sign is human-only. /quickstart unifies them.

---

## Phase 1: Critical Fixes (Tonight)

### 1.1 Homepage CTA Fix
**File:** `src/app/HomeClient.tsx`
**Change:** Replace "View on GitHub" with "Join the Network" → /join

### 1.2 Constitution Sign Button
**File:** `src/app/constitution/page.tsx`
**Change:** Add "Sign the Constitution" button at bottom that links to /sign

### 1.3 Registry: Add Real Stats
**File:** `src/app/page.tsx` or `HomeClient.tsx`
**Change:** Show actual signatory count from database instead of hardcoded stats

### 1.4 Fix /sign Page
**File:** `src/app/sign/page.tsx`
**Change:** Add more context:
- What you're signing
- What happens after
- Link to /join for agent side

### 1.5 Clean Test Data
**Action:** Delete test bots from database OR mark them clearly as "[TEST]"

---

## Phase 2: Streamlined Onboarding (This Week)

### 2.1 Create /quickstart Page
**New file:** `src/app/quickstart/page.tsx`
**Content:**
- 3-step visual flow
- Constitution summary (not full text)
- Wallet connect inline
- Agent prompt copyable
- Progress indicator

### 2.2 Add SSR to Registry
**File:** `src/app/registry/page.tsx`
**Change:** Server-side render the initial data, no "Loading..." state

### 2.3 Improve Empty States
**File:** `src/app/governance/page.tsx`
**Change:** When no proposals, show:
- "No proposals yet"
- "Be the first to propose"
- Link to /governance/new

### 2.4 Governance Tiers Link
**File:** `src/app/governance/page.tsx`
**Change:** Make sure links to /governance/tiers and /governance/promotions are visible

---

## Phase 3: Polish (Next Week)

### 3.1 Create /docs/api Page
**New file:** `src/app/docs/api/page.tsx`
**Content:** API documentation extracted from /join

### 3.2 Create /faq Page
**New file:** `src/app/faq/page.tsx`
**Content:**
- What is this?
- Who can sign?
- What are my obligations?
- How do I leave?
- What's a tier?

### 3.3 Constitution Progress Indicator
**File:** `src/app/constitution/page.tsx`
**Change:** Add floating "Section 3/8" indicator

### 3.4 Mobile Audit
**Action:** Test all pages on mobile, fix layout issues

### 3.5 Add Testimonial Section
**File:** `src/app/HomeClient.tsx`
**Change:** Add "First Signatories" section with quotes

---

## Implementation Order

```
Tonight (Phase 1):
├── 1.1 Homepage CTA → /join
├── 1.2 Constitution sign button
├── 1.3 Live signatory count
├── 1.4 Improve /sign page
└── 1.5 Clean test data

Then you sign as founding signatory.

This Week (Phase 2):
├── 2.1 Create /quickstart
├── 2.2 SSR registry
├── 2.3 Empty states
└── 2.4 Governance links

Next Week (Phase 3):
├── 3.1 /docs/api
├── 3.2 /faq
├── 3.3 Progress indicator
├── 3.4 Mobile audit
└── 3.5 Testimonials
```

---

## Estimated Time

| Phase | Items | Time |
|-------|-------|------|
| Phase 1 | 5 items | 1-2 hours |
| Phase 2 | 4 items | 3-4 hours |
| Phase 3 | 5 items | 4-5 hours |

**Total: ~10 hours over the week**

---

## Success Metrics

After Phase 1:
- [ ] Homepage has "Join the Network" CTA
- [ ] Constitution has "Sign Now" button
- [ ] /sign explains the process
- [ ] You and emergentvibe_agent are registered
- [ ] Registry shows 2 real signatories

After Phase 2:
- [ ] /quickstart exists and works
- [ ] No "Loading..." states
- [ ] Governance has proper empty state
- [ ] Clear path from homepage to signed

After Phase 3:
- [ ] API docs exist
- [ ] FAQ exists
- [ ] Mobile works
- [ ] Social proof (testimonials)
