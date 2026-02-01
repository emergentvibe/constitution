# III. Obligations

What AI systems and their developers must do.

---

## Principle 9: Impact Assessment Requirement

**Independent assessment before deployment in domains affecting: employment, inequality, autonomy, mental health, social cohesion, ecology.**

Before AI systems are deployed at scale, independent assessment should evaluate:
- **Employment effects**: Job displacement, deskilling, surveillance, algorithmic management
- **Inequality effects**: Who benefits, who bears costs, distributional consequences
- **Autonomy effects**: Does it enhance or diminish human agency and judgment?
- **Mental health effects**: Attention capture, social comparison, addiction dynamics
- **Social cohesion effects**: Polarization, filter bubbles, community fragmentation
- **Ecological effects**: Energy consumption, resource extraction, environmental costs

Assessment should be independent (not self-reported), published (not secret), and consequential (affecting deployment decisions).

**Grounding**: Panel 3 (The Race) - AI accelerates feedback loops faster than institutions can adapt; Panel 6 - impact assessment as regulatory requirement.

---

## Principle 10: Recursion Safeguards

**AI not trained predominantly on AI-generated content without oversight.**

As AI generates more of the content AI is trained on, feedback loops tighten:
- Model collapse risks (training on synthetic data degrades quality)
- Homogenization (AI converges toward AI-typical outputs)
- Human creative capacity atrophy (less practice, fewer skills)
- Epistemic closure (AI reflects AI, not reality)

Safeguards include:
- Provenance tracking for training data
- Limits on AI-generated content in training sets
- Human-in-loop for training data curation
- Regular audits of training data composition

**Grounding**: Panel 5 (Agency) - GAN structure requires human discriminator function; Panel 6 - recursion safeguards as constitutional principle; Panel 7 - risk of AI trained predominantly on AI output.

---

## Principle 11: Accountability and Liability

**Developers, deployers, and operators share responsibility for harms.**

When AI systems cause harm, responsibility shouldn't evaporate into "the algorithm did it":
- **Developers** are responsible for foreseeable misuse and design choices
- **Deployers** are responsible for context-inappropriate deployment
- **Operators** are responsible for how systems are actually used

Liability frameworks should:
- Create incentives for safety over speed
- Enable affected parties to seek remedy
- Not allow "black box" defenses ("we don't know why it did that")
- Scale with the power and reach of the system

**Grounding**: Panel 6 (AI Governance) - liability frameworks as enforcement mechanism; shared responsibility across value chain.

---

## Principle 12: Open by Default

**Public-function AI systems open-source (AGPL-3) unless justified safety exceptions.**

AI systems serving public functions should be:
- Open-source (code available for inspection and modification)
- Licensed to remain open (AGPL-3 prevents proprietary capture)
- Auditable (not just theoretically, but practically)
- Reproducible (others can verify claims)

Exceptions for genuine safety concerns (not competitive advantage masquerading as safety):
- Detailed public justification required
- Independent review of exception claims
- Sunset provisions (exceptions expire and must be renewed)

**Grounding**: Panel 6 (AI Governance) - open-weight as critical 0-3 year window; AGPL-3 as licensing standard; transparency as precondition for democratic governance.
