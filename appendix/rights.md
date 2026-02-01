# II. Rights — Deep Reasoning

What constituents can claim in relation to AI systems. This appendix provides the detailed reasoning from our expert panel investigations.

---

## Principle 4: Right to Transparency

**Understand how AI systems function, what data is used, what failures exist.**

### Information Architecture Is Power Architecture

From Panel 6 (AI Governance), Kate Crawford:

> "Democratic AI governance is aspirational rhetoric until we address **who owns the infrastructure**. You can't democratically govern what you don't control."

Transparency isn't just documentation—it's the foundation of accountability. Without transparency:
- You can't audit for bias
- You can't verify safety claims
- You can't challenge decisions
- You can't build alternatives

### What Transparency Requires

From Panel 6's layered architecture (Yochai Benkler):

> **Layer 3 - Algorithms**: Open source, transparent training logs, hyperparameters, ablations published. External researchers can examine.
>
> **Layer 5 - Applications**: User-owned data, transparency about model choices, right to explanation, portability.

Transparency must be *meaningful*, not theatrical. A 500-page technical document satisfies legal requirements while obscuring from affected communities. We need:

- **Explanation in context**: Why did this AI make this decision about me?
- **Known limitations**: Where does this system fail? What are the documented biases?
- **Data provenance**: What was this trained on? Whose labor? Whose creativity?
- **Interaction disclosure**: When am I talking to AI vs. humans?

### Trade Secrets vs. Democratic Oversight

Companies claim trade secret protection for model details. But public-function AI—systems that affect employment, housing, healthcare, criminal justice—cannot hide behind competitive advantage. The principle establishes: transparency requirements for systems affecting life outcomes, with appropriate mechanisms for genuinely sensitive safety information.

---

## Principle 5: Right to Human Review

**Human review of algorithmic decisions in high-stakes domains. The reviewer must be actually empowered to override.**

### Automation Shouldn't Mean Abdication

From Panel 5 (Agency), the GAN structure principle:

> "Human-AI systems should operate as a GAN, where AI generates possibilities and humans discriminate among them."

When AI makes consequential decisions without meaningful human oversight, the human discriminator function is removed. The efficiency gains don't justify this in domains affecting:

- Employment (hiring, firing, performance evaluation)
- Housing (rental applications, mortgage approval)
- Healthcare (diagnosis, treatment recommendations, insurance coverage)
- Criminal justice (bail, sentencing, parole)
- Education (admissions, grading, disciplinary actions)
- Credit (loan approval, interest rates)

### Actually Empowered

The right to human review is meaningless if:
- The reviewer rubber-stamps AI recommendations (accountability theater)
- The reviewer lacks authority to override
- The appeal process is inaccessible or punitive
- The human is slower/worse than the AI (incentivizes circumvention)

Implementation requires: reviewers with genuine authority, time to deliberate, information to evaluate, and protection from pressure to defer to automation.

---

## Principle 6: Right to Collective Bargaining

**Workers, creators, and communities can collectively negotiate AI deployment terms.**

### Individual Powerlessness

From Panel 6's coalition analysis:

> "Power concentrates regardless of architecture. The question isn't 'what's the architecture?' It's '**who has power and how do we redistribute it?**'"

An individual worker facing algorithmic management has no leverage. An individual creator whose work trains AI without consent has no recourse. An individual community subjected to AI policing has no voice.

Collective organization changes this:
- **Workers** can negotiate how AI is deployed in their workplaces (surveillance limits, algorithmic transparency, human oversight requirements)
- **Creators** can negotiate how their work is used for training (licensing terms, compensation, attribution)
- **Communities** can negotiate how AI systems operate in their contexts (deployment criteria, accountability mechanisms, impact assessments)

### Coalition Power

From Panel 6's enforcement analysis:

> "Target scale: 50-100 cities + 1M+ creators + 100K+ workers = companies must comply or lose access to markets, talent, content, infrastructure."

Collective bargaining isn't just labor rights—it's the material base for constitutional enforcement. Without organized countervailing power, constitutional principles are suggestions.

### Existing Precedents

- Writers Guild and SAG-AFTRA strikes (2023) included AI provisions
- EU collective bargaining for platform workers
- Data trusts as collective bargaining infrastructure for data subjects
- Tech worker organizing (Alphabet Workers Union, Amazon Labor Union)

---

## Principle 7: Right to Exit and Alternatives

**Opt out of AI systems and access non-AI alternatives without penalty.**

### Against Mandatory Adoption

AI adoption should be a choice, not a mandate. The convenience of AI for some shouldn't eliminate options for others.

This means:
- Human alternatives available for essential services (banking, healthcare, government)
- No penalty for choosing non-AI options (not slower, not more expensive, not degraded)
- Analog options maintained for core life functions
- Ability to exit AI-mediated systems without losing access to necessities

### Exit as Check on Capture

From Panel 4's deterritorialization analysis:

> "The ability to exit keeps any coordination layer honest. No lock-in."

Exit rights are structural: they create competition between AI and non-AI approaches. If AI systems can't retain users without coercion, they must compete on quality. This prevents lock-in and incentivizes systems that actually serve constituents.

### Exit Requires Somewhere to Go

Exit is meaningless without alternatives. This connects to Principle 8 (Deterritorialization)—the right to build different systems. And to Principle 14 (Commons-Based Ownership)—public alternatives to corporate AI.

---

## Principle 8: Right to Deterritorialization

**Communities can build alternative AI systems with different principles.**

### Beyond Exit to Voice Through Building

From Panel 4's historical analysis:

> "Deterritorialization isn't just leaving—it's creating new territories. Lines of flight that open possibilities the dominant assemblage forecloses."

The right to exit implies the right to build alternatives:
- Communities can develop AI systems governed by different values
- Open-weight models enable distributed innovation
- Public compute infrastructure supports non-corporate development
- AGPL-3 licensing ensures alternatives remain open (derivative works must also be open)

### The Critical Window

From Panel 6 on open-weight AI:

> "Open-weight AI (DeepSeek-R1, Llama, Qwen) is the critical 0-3 year window. Once closed models achieve sufficient lead, alternatives may become infeasible. The ecosystem must be built NOW."

Luis Villa (Panel 6) on licensing:

> **Open weights**: Release trained model parameters. Allows local deployment. No control over use.
>
> **Open training**: Release code, data, compute logs. Reproducible. Transparent. Expensive to verify.
>
> **Open governance**: Community decides training objectives, safety constraints, deployment. (Nobody's done this fully.)
>
> **Open infrastructure**: Compute, data, hosting collectively owned.

Each has different implications for democratic control. AGPL-3 specifically prevents proprietary capture—derivative works must remain open.

### Pluralism, Not Fragmentation

This isn't about incompatible systems. It's about genuine pluralism in AI development:
- Multiple approaches can coexist
- Interoperability standards enable switching
- No single corporate monoculture
- Innovation emerges from diversity

---

## Sources

- [S25] Crawford, K. (2021). *Atlas of AI*. Yale University Press.
- [S65] DeepSeek-R1, Llama, Qwen documentation
- [S67] Benkler, Y. (2006). *The Wealth of Networks*. Yale University Press.
- [S68] Open source licensing frameworks (AGPL-3, MIT, Apache)
- Panel 4 transcript: Deterritorialization mechanisms
- Panel 5 transcript: Agency and human-AI coupling
- Panel 6 transcript: AI Governance architecture

---

*This appendix summarizes reasoning from Investigation 2. Full panel transcripts available in the research archive.*
