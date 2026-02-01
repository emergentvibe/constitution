# III. Obligations

What AI systems and their developers must do.

---

## Principle 9: Impact Assessment Requirement

**Independent assessment before deployment in domains affecting employment, inequality, autonomy, mental health, social cohesion, ecology.**

### The Problem

Pérez (2002) shows that technological revolutions create institutional lag—technology changes faster than the social structures needed to govern it. AI accelerates this: decisions that took weeks now take milliseconds, affecting millions before consequences are understood [S30].

Crawford (2021) documents the planetary costs of AI that are typically externalized: energy consumption, mineral extraction from conflict regions, electronic waste [S25]. Bostrom's "vulnerable world hypothesis" (2019) suggests some capabilities could destabilize civilization by default [S28].

### The Response

Pre-deployment assessment should evaluate:
- **Employment**: Displacement, deskilling, algorithmic management
- **Inequality**: Who benefits, who bears costs
- **Autonomy**: Enhancement or diminishment of human agency
- **Mental health**: Attention capture, addiction dynamics
- **Social cohesion**: Polarization, fragmentation
- **Ecology**: Energy, extraction, waste

Assessment must be independent (not self-reported), published (not secret), and consequential (affecting deployment decisions). The OECD framework (2025) provides structure for such assessments [S66].

### Further Reading

- Pérez, C. (2002). *Technological Revolutions and Financial Capital*. [S30]
- Crawford, K. (2021). *Atlas of AI*. [S25]
- Bostrom, N. (2019). The Vulnerable World Hypothesis. [S28]

---

## Principle 10: Recursion Safeguards

**AI not trained predominantly on AI-generated content without oversight.**

### The Problem

As AI generates more content that AI is trained on, feedback loops tighten. Documented risks include:
- **Model collapse**: Training on synthetic data degrades quality over generations
- **Homogenization**: Output converges toward AI-typical patterns, reducing variance
- **Skill atrophy**: Capabilities humans don't practice, they lose

MIT Media Lab research (2024) identifies this as a core risk of human-AI coupling: when AI handles both generation and evaluation, the human role becomes vestigial [S57].

### The Response

Safeguards include:
- Provenance tracking for training data
- Limits on AI-generated content in training sets
- Human curation of training data
- Regular audits of training data composition

Anthropic's Collective Constitutional AI (2024) demonstrates human-in-loop approaches to AI training that maintain human judgment in the process [S64].

### Further Reading

- MIT Media Lab (2024). Cyborg Psychology Research. [S57]
- Anthropic (2024). Collective Constitutional AI. [S64]

---

## Principle 11: Accountability and Liability

**Developers, deployers, and operators share responsibility for harms. Liability scales with power and reach.**

### The Problem

When AI causes harm, responsibility often evaporates. Developers claim they can't control deployment. Deployers claim they can't understand the algorithm. Operators claim they're just following the system.

Winner (1980) argued that technological design embeds choices that have political consequences [S36]. Those choices are made by people—developers, product managers, executives—who should be accountable for foreseeable outcomes.

### The Response

Shared responsibility across the value chain:
- **Developers**: Responsible for foreseeable misuse and design choices
- **Deployers**: Responsible for context-inappropriate deployment
- **Operators**: Responsible for actual use patterns

Liability should create incentives for safety over speed, enable affected parties to seek remedy, and scale with the power and reach of the system. The OECD framework (2025) provides principles for AI liability [S66].

### Further Reading

- Winner, L. (1980). Do Artifacts Have Politics? [S36]
- OECD (2025). Public AI. [S66]

---

## Principle 12: Open by Default

**Public-function AI systems open-source (AGPL-3) unless justified safety exceptions.**

### The Problem

Proprietary AI serving public functions—government services, healthcare, education, criminal justice—cannot be democratically governed. You cannot audit what you cannot inspect. You cannot contest what you cannot understand.

DeepSeek and Qwen (2025) demonstrate that open-weight models can achieve parity with proprietary systems [S65]. The question is not capability but control.

### The Response

Public-function AI should be:
- Open-source (code available for inspection)
- Licensed to remain open (AGPL-3 prevents proprietary capture) [S68]
- Auditable in practice, not just theory
- Reproducible (claims can be verified)

Exceptions require detailed public justification, independent review, and sunset provisions. The burden is on those claiming exceptions, not on those demanding openness.

### Further Reading

- DeepSeek & Qwen (2025). Open-weight models. [S65]
- Municipal Counter-Automation Framework (2024). AGPL-3 licensing. [S68]
- Harvard Ash Center (2024). Cooperative Paradigms for AI. [S67]

---

## Sources

Full bibliography: [bibliography.md](bibliography.md)

Key sources for this section:
- [S25] Crawford (2021) *Atlas of AI*
- [S28] Bostrom (2019) Vulnerable World Hypothesis
- [S30] Pérez (2002) on technological revolutions
- [S36] Winner (1980) on political artifacts
- [S57] MIT Media Lab (2024)
- [S64] Anthropic (2024) Collective Constitutional AI
- [S65] DeepSeek & Qwen (2025)
- [S66] OECD (2025) Public AI
- [S67] Harvard Ash Center (2024)
- [S68] AGPL-3 licensing framework
