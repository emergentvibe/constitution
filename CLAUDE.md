# Emergent Vibe

Democratic platform for collectively writing the AI constitution.

**Domain:** emergentvibe.com
**Status:** Pre-alpha, building genesis ratification system

---

## Project Structure

```
conversation-seeds.ai/
├── src/
│   └── app/
│       ├── page.tsx              # Landing page
│       ├── layout.tsx            # Root layout
│       └── globals.css           # Global styles + CSS variables
├── constitution/                  # THE CONSTITUTION (git-backed)
│   ├── README.md                 # Constitution overview
│   ├── signatories.md            # WHO HAS SIGNED (update this!)
│   ├── principles/
│   │   ├── 01-foundations.md     # Principles 1-3
│   │   ├── 02-rights.md          # Principles 4-8
│   │   ├── 03-obligations.md     # Principles 9-12
│   │   ├── 04-structures.md      # Principles 13-16
│   │   ├── 05-capabilities.md    # Principles 17-20
│   │   └── 06-revision.md        # Principles 21-24 + amendment process
│   └── meta/
│       ├── origin.md             # Research grounding (Investigation 2)
│       └── changelog.md          # Version history
├── tailwind.config.ts            # Custom theme (emerge, warm colors)
├── README.md                     # Public-facing project description
└── CLAUDE.md                     # THIS FILE - project context for AI
```

---

## The Constitution

**Version:** v1.0-genesis (awaiting ratification)

### 24 Principles in 6 Sections

| Section | Principles | Focus |
|---------|------------|-------|
| I. Foundations | 1-3 | Human agency, collective governance, plurality |
| II. Rights | 4-8 | Transparency, human review, collective bargaining, exit, deterritorialization |
| III. Obligations | 9-12 | Impact assessment, recursion safeguards, accountability, open by default |
| IV. Structures | 13-16 | Federated governance, commons ownership, hybrid expertise, Parliament of Things |
| V. Capabilities | 17-20 | Flourishing, care as commons, weird AI, contemplative capacity |
| VI. Revision | 21-24 | Amendment process, certification, enforcement, coalition power |

### Unamendable Provisions
- Principle 1: Human Agency Preservation
- Principle 2: Collective Governance
- Principle 21: Regular Amendment

These are load-bearing walls. Everything else can evolve.

### Amendment Process
- **Genesis:** 30-day conviction voting (time-weighted)
- **Standard:** 7-day deliberation + 2/3 supermajority
- **Emergency:** 48-hour deliberation + 3/4 supermajority + 90-day sunset

---

## Signatories System

**File:** `constitution/signatories.md`

Current flow (pre-OAuth):
1. User reads constitution
2. User submits signature request (email or GitHub handle)
3. Manual addition to signatories.md
4. Git commit records timestamp

Future flow (post-OAuth):
1. GitHub OAuth authentication
2. Sybil check (6+ months old, 10+ contributions)
3. User reads constitution (tracked)
4. User clicks "Sign"
5. Automatic addition to signatories.md via GitHub API
6. Signature converts to vote when conviction voting launches

**Signatories table format:**
```markdown
| # | GitHub Handle | Signed | Statement |
|---|---------------|--------|-----------|
| 1 | @username | YYYY-MM-DD | *"Optional statement"* |
```

---

## Tech Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS (custom theme in tailwind.config.ts)
- PostgreSQL + postgres.js (not yet set up)
- GitHub OAuth (not yet set up)

---

## Research Grounding

Constitution derived from **Investigation 2: The Superorganism and Its Selves**

**Location:** `../memetic-self/.ai-symposium/investigations/superorganism-selves/`

**Key file:** `INVESTIGATION-2-COMPLETE.md` - full synthesis with all 95 recommendations

**Statistics:**
- 7 panels of multi-expert deliberation
- 46 experts consulted (44 unique)
- 95 recommendations synthesized
- 80 academic sources
- 27 tensions identified (4 unresolved)

---

## Build Phases

### Phase 1: Genesis (current)
- [x] Landing page
- [x] Constitution structure
- [x] Signatories system (manual)
- [ ] Constitution viewer UI
- [ ] GitHub OAuth
- [ ] Automated signature flow

### Phase 2: Ratification
- [ ] Conviction voting implementation
- [ ] 30-day ratification period
- [ ] Vote tracking + display

### Phase 3: Amendment
- [ ] Proposal system
- [ ] Deliberation interface
- [ ] Voting on amendments
- [ ] Git-backed merge flow

### Phase 4: Ecosystem
- [ ] Vibe chatbot (embodies constitution)
- [ ] Integration with research platform
- [ ] Coalition tools

---

## Key Design Decisions

1. **Git as primitive** - Constitution lives in markdown, all changes tracked
2. **GitHub OAuth** - Sybil resistance via account heuristics
3. **Conviction voting** - Time-weighted commitment for genesis
4. **Federated** - Global baseline, local autonomy
5. **Self-amending** - Constitution defines its own evolution

---

## Privacy

Never expose @emergentvibe's real name in code, commits, or public content.

---

## The Vision

> "Collective intelligence, building collective intelligence."

This is the superorganism's attempt to perceive and steer itself.
