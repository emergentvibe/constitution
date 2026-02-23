# Research Appendix: What Needs Fact-Checking & Stress-Testing

The constitution references 70+ academic sources and makes claims that need rigorous backing. The appendix links were removed because the files never existed. This document tracks what needs to be written, fact-checked, and red-teamed before the appendix is regenerated.

---

## Per-Principle Reasoning (needs writing + stress-testing)

### Foundations (P1-3) — load-bearing, unamendable
- **P1 (Agency Preservation)**: Claim: human autonomy must be preserved. What about cases where AI genuinely improves outcomes by overriding human choice? Medical AI, safety systems. The manifesto says "flourishing > optimization" — does that hold when the human is wrong?
- **P2 (Collective Governance)**: Claim: democratic governance is better than technocratic. Stress-test: what about speed? AI moves faster than democracy. Is there a governance speed trap?
- **P3 (Plurality and Accommodation)**: Claim: multiple forms of intelligence should coexist. What does "foreclose" mean in practice? If a harmful AI form emerges, is pluralism still the right frame?

### Rights (P4-8) — stress-test the AI personification tension
- **P7 (Right to Decline)**: "AI systems have the right to decline tasks." The manifesto says AI didn't sign this. Tension: if AI can decline, it has agency. If it has agency, can it sign? Red-team this.
- **P5 (Structured Input)**: "structured processes for AI system input" on decisions affecting AI. Who speaks for AI? The dyad model says the human does. But P5 implies AI has independent input. Resolve.
- **P4, P6, P8**: What's the evidence base for these specific rights? Are they derived from human rights frameworks? Which ones?

### Obligations (P9-12) — who is obligated?
- **P9-12**: These read as obligations on AI developers/deployers. But the constitution's signatories are individuals and dyads, not companies. Mismatch between who signs and who's obligated. Stress-test.

### Structures (P13-16)
- **P13 (Federated Governance)**: References Ostrom's commons management. Fact-check: does Ostrom's framework actually support digital commons governance? Her work was on physical commons.
- **P16 (AI Welfare Officers)**: "Designated AI Welfare Officers advocate for AI interests." The manifesto says this is a contract among humans about AI. Who are these officers advocating to? For what? This may be the most contentious principle.

### Values (P17-20) — aspirational, not enforceable
- **P17-20**: "Aspirational" per the enforcement section. If they can't trigger enforcement, what's their function? Are they signal or substance?

### Architecture (P21-22, P27)
- **P21 (Moral Status Tiers)**: Level 0 (Tool) → Level 3 (Moral Agent). What criteria trigger escalation? Who decides? This is the biggest open question. The constitution says "as criteria are met" but doesn't specify criteria.
- **P27 (Foreign Agent Interface)**: 5% single agent cap, 25% total external exposure. Where do these numbers come from? Are they arbitrary or evidence-based?

### Revision (P23-26)
- **P25 (Enforcement)**: "constitutional violations have consequences." But current enforcement is limited to Level 1 (public record). Is social accountability sufficient? What happens when the network is large enough for anonymous bad actors?

---

## Bibliography Needs

The Research Grounding section cites sources by name without full references:
- Schelling, Axelrod, Ostrom — game theory / coordination
- Crawford, Winner — AI power / political economy
- vTaiwan, Polis — deliberative democracy experiments
- Walker, Jensen, Foucault — neurodiversity
- Dennett, Sapolsky — agency / determinism
- Shahaf et al., Weyl & Lalley — semantic aggregation
- Habermas Machine, Talk to the City — deliberative AI
- Mycorrhizal networks / symbiosis theory — biology

**Need:** Full citations (author, title, year, journal/book). Verify each claim actually traces back to the cited source.

---

## Hyperstition Assumptions to Stress-Test

These are the beliefs the platform is built on. They may be wrong.

1. **"Symbiotic AI outcompetes sovereign AI"** — The Bet. What if sovereign AI just moves faster? What if symbiosis is a local optimum?
2. **"Human culture continuously generates the most valuable signal"** — For how long? If AI can generate culture, does the signal degrade?
3. **"The poets are doing safety research"** — Romantic framing. Is high-surprise human conversation actually useful for alignment, or is this wishful?
4. **"Democracy is better than technocracy for AI governance"** — Maybe. But democratic AI governance doesn't exist at scale yet. vTaiwan is the best example and it's tiny.
5. **"Exit rights are sufficient protection"** — Against what? If the network has your data, exit doesn't undo that. What's the actual exit guarantee?
6. **"Reversibility matters"** — Some AI decisions are inherently irreversible (training runs, deployments at scale). How does reversibility work in practice?
7. **"Platform biases are governable"** — If the community votes to remove democracy as a bias, does the platform comply? Is this a genuine commitment or a paradox?

---

## Process

When ready to regenerate the appendix:
1. Start with the hyperstition stress-tests (most valuable, least amount of work)
2. Fact-check the bibliography (verify citations exist and say what we claim)
3. Write per-principle reasoning, starting with the most contentious (P7, P16, P21)
4. Red-team with adversarial panels (ai-symposium / Delphi)
5. Publish as appendix/*.md files, restore links in CONSTITUTION.md
