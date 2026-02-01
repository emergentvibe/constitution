# III. Obligations — Deep Reasoning

What AI systems and their developers must do. This appendix provides the detailed reasoning from our expert panel investigations.

---

## Principle 9: Impact Assessment Requirement

**Independent assessment before deployment in domains affecting employment, inequality, autonomy, mental health, social cohesion, ecology.**

### AI Accelerates Feedback Loops

From Panel 3 (The Race), on why impact assessment is urgent:

> "AI tightens feedback loops faster than institutions can adapt. A decision that took weeks (human review) now takes milliseconds (algorithmic). A bias that affected hundreds now affects millions. The velocity of impact requires pre-deployment scrutiny, not post-hoc correction."

### What Must Be Assessed

Impact assessment should evaluate:

**Employment effects**: Job displacement, deskilling, surveillance intensity, algorithmic management. Not just "how many jobs lost?" but "what happens to the quality of remaining work?"

**Inequality effects**: Who benefits, who bears costs, distributional consequences. AI often externalizes costs to marginalized communities while concentrating benefits among the already-privileged.

**Autonomy effects**: Does this enhance or diminish human agency and judgment? (Connects to Principle 1.) Systems that optimize for engagement may capture attention while eroding autonomy.

**Mental health effects**: Attention capture, social comparison dynamics, addiction mechanisms. Recommendation algorithms optimized for engagement have documented mental health impacts.

**Social cohesion effects**: Polarization, filter bubbles, community fragmentation. AI-mediated communication may reduce shared reality.

**Ecological effects**: Energy consumption, resource extraction for hardware, electronic waste. Training large models has significant carbon footprint.

### Independent, Published, Consequential

Assessment should be:

- **Independent**: Not self-reported by developers. Third-party auditors with no financial relationship.
- **Published**: Results publicly available, not hidden behind confidentiality agreements.
- **Consequential**: Affecting deployment decisions. An assessment that changes nothing is theater.

---

## Principle 10: Recursion Safeguards

**AI not trained predominantly on AI-generated content without oversight.**

### The Feedback Loop Problem

From Panel 5 and 7, on the risks of AI training on AI output:

> "As AI generates more of the content AI is trained on, several risks compound:
>
> **Model collapse**: Training on synthetic data degrades quality over generations. The distribution drifts from human-generated content.
>
> **Homogenization**: AI converges toward AI-typical outputs. Variance decreases. Weird, novel, challenging content gets smoothed out.
>
> **Human skill atrophy**: If AI writes and humans just prompt, human writing capacity degrades. The GAN structure requires human discrimination—but discrimination requires capability.
>
> **Epistemic closure**: AI reflects AI, not reality. The training data becomes a hall of mirrors."

### The Human Discriminator Function

From Panel 5's GAN structure:

> "Human-AI systems should operate as a GAN—AI generates, humans discriminate. But this requires maintaining human discrimination capacity. If we outsource all generation AND all discrimination to AI, the human isn't in the loop."

Recursion safeguards protect this:
- **Provenance tracking**: Know what's AI-generated in training data
- **Limits on AI content**: Caps on synthetic data percentage
- **Human curation**: Human judgment in training data selection
- **Regular audits**: Monitor training data composition over time

---

## Principle 11: Accountability and Liability

**Developers, deployers, and operators share responsibility for harms. Liability scales with power and reach.**

### Responsibility Doesn't Evaporate

From Panel 6 on accountability:

> "When AI systems cause harm, responsibility shouldn't evaporate into 'the algorithm did it.' Every AI system is created by developers who made design choices, deployed by organizations who chose to use it, and operated by people who configured its use."

The principle establishes shared responsibility:

**Developers** are responsible for:
- Foreseeable misuse (if it's predictable, you should have prevented it)
- Design choices (optimization targets, training data, capability boundaries)
- Known failure modes (if you know it fails, you must disclose and mitigate)

**Deployers** are responsible for:
- Context-inappropriate deployment (using a system where it shouldn't be used)
- Failure to customize (not adapting to local conditions)
- Inadequate oversight (deploying without monitoring)

**Operators** are responsible for:
- Actual use patterns (how the system is configured and applied)
- Override failures (not intervening when human review was required)
- Feedback negligence (ignoring signals that the system is failing)

### Liability Frameworks

From Panel 6's enforcement mechanisms:

> "Liability frameworks should:
> - Create incentives for safety over speed
> - Enable affected parties to seek remedy
> - Not allow 'black box' defenses ('we don't know why it did that')
> - Scale with the power and reach of the system"

A system affecting millions should face greater liability than one affecting hundreds. Market dominance increases responsibility.

---

## Principle 12: Open by Default

**Public-function AI systems open-source (AGPL-3) unless justified safety exceptions.**

### Why Open

From Panel 6's layered architecture:

> "Open source means:
> - **Auditable**: External researchers can examine code and training
> - **Reproducible**: Claims can be verified independently
> - **Improvable**: Community can fix problems
> - **Forkable**: Alternatives can be built if governance is captured"

For AI systems serving public functions—government services, healthcare, education, criminal justice—openness is a democratic requirement. You can't govern what you can't inspect.

### AGPL-3 Specifically

From Luis Villa (Panel 6) on licensing:

> "GPL and MIT are too permissive for AI. A company can take open-source code, train a proprietary model, and release nothing back. AGPL-3 has 'network use' provisions—if you deploy modified software as a service, you must release your modifications. This prevents proprietary capture of commons-developed AI."

### Justified Safety Exceptions

Some capabilities genuinely warrant restriction. The principle requires:

- **Detailed public justification**: Why is this exception necessary? What's the specific risk?
- **Independent review**: External assessment of whether claims are legitimate (vs. competitive advantage masquerading as safety)
- **Sunset provisions**: Exceptions expire and must be renewed. Safety justifications should be re-evaluated as context changes.

The burden is on those claiming exceptions, not on those demanding openness.

---

## Sources

- [S25] Crawford, K. (2021). *Atlas of AI*. Yale University Press.
- [S27-29] Bostrom, N. et al. on AI safety and recursive self-improvement
- [S68] AGPL-3 licensing documentation
- Panel 3 transcript: The Race (AI acceleration dynamics)
- Panel 5 transcript: GAN structure and human discriminator function
- Panel 6 transcript: Accountability and enforcement mechanisms

---

*This appendix summarizes reasoning from Investigation 2. Full panel transcripts available in the research archive.*
