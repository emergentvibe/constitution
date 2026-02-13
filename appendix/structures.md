# IV. Structures

How governance is organized.

---

## Principle 13: Federated Governance

**Layered scales: global baseline, regional adaptation, national implementation, municipal autonomy. Pluralistic models, no global monoculture.**

### The Problem

A single global AI constitution faces the "one size fits all" problem: different legal traditions, cultural values, development contexts, and risk tolerances. But pure localism creates a "race to the bottom" where jurisdictions compete by lowering standards.

Ostrom (1990) documented successful commons governance through "nested enterprises"—governance at multiple scales, each handling problems appropriate to that scale [S40].

### The Response

Federated governance navigates this:
- **Global baseline**: Minimum standards applying everywhere (human rights, safety thresholds)
- **Regional adaptation**: Context-specific implementation (EU variant, other regional frameworks)
- **National implementation**: Sovereign authority over AI deployment
- **Municipal autonomy**: Cities can exceed baseline and experiment

Taiwan's vTaiwan demonstrates national-scale digital democracy [S63]. Barcelona's digital sovereignty initiatives show municipal AI governance [documented in S66]. The OECD framework (2025) provides structure for multi-level coordination [S66].

### Further Reading

- Ostrom, E. (1990). *Governing the Commons*. [S40]
- Tang, A. et al. (2024). vTaiwan documentation. [S63]
- OECD (2025). Public AI. [S66]

---

## Principle 14: Commons-Based Ownership

**Support municipal, cooperative, public infrastructure, and data trust alternatives to corporate ownership.**

### The Problem

Crawford (2021) documents extreme concentration in AI infrastructure [S25]. Democratic governance of what corporations control requires their permission—a structural asymmetry.

Graeber (2011) and Graeber & Wengrow (2021) show that alternative economic arrangements have existed throughout history—current arrangements are not natural or inevitable [S42, S43].

### The Response

Alternative ownership models shift the structural dynamics:
- **Municipal AI networks**: Cities own infrastructure like utilities
- **Platform cooperatives**: User-owned alternatives to extractive platforms [S47]
- **Public compute**: Government-funded resources not dependent on corporate access
- **Data trusts**: Collective governance of data with fiduciary duties

The Harvard Ash Center (2024) documents working models of cooperative AI ownership [S67]. These aren't replacements for private development—they're countervailing alternatives that shift bargaining power.

### Further Reading

- Graeber, D. (2011). *Debt: The First 5,000 Years*. [S42]
- Graeber, D. & Wengrow, D. (2021). *The Dawn of Everything*. [S43]
- Platform Cooperativism Consortium (2024). [S47]
- Harvard Ash Center (2024). Cooperative Paradigms for AI. [S67]

---

## Principle 15: Hybrid Expertise

**Technical experts inform, affected communities decide. Experts serve democracy, don't overrule it.**

### The Problem

AI governance requires technical knowledge—capabilities, limitations, risks. But technocracy is dangerous: experts have their own interests and blind spots.

Foucault (1961) traced how expert knowledge becomes a tool of social control [S15]. Cohen (2016) extends this analysis to contemporary psychiatry [S16]. The question is how to use expertise without being captured by it.

### The Response

Hybrid expertise:
- **Experts inform**: Technical knowledge about what's possible and what's risky
- **Communities decide**: Value judgments about acceptable tradeoffs
- **Experts serve**: Their role is to clarify options, not make choices for others
- **Accountability flows both ways**: Experts accountable to democratic processes; democratic processes accountable to reality

Taiwan's vTaiwan demonstrates this in practice: technical facilitation enables democratic deliberation without replacing it [S63]. Anthropic's Collective Constitutional AI (2024) shows expert-public collaboration in AI development [S64].

### Further Reading

- Foucault, M. (1961). *Madness and Civilization*. [S15]
- Tang, A. et al. (2024). vTaiwan documentation. [S63]
- Anthropic (2024). Collective Constitutional AI. [S64]

---

## Principle 16: Parliament of Constituents

**Include non-human stakeholders through appropriate mechanisms: future generations, ecosystems, AI systems. Enable semantic aggregation for collective sense-making.**

### The Problem

Traditional democracy includes only present adult humans. But AI governance affects:
- **Future generations**: Who inherit consequences of current decisions
- **Ecosystems**: Which bear material costs of AI development [S25]
- **AI systems**: Which may warrant moral consideration as complexity increases

Morton (2013) describes "hyperobjects"—entities massively distributed in time and space that we cannot perceive directly, like climate change or AI's planetary footprint [S32].

Additionally, traditional voting (binary yes/no on discrete propositions) loses information. People don't just agree or disagree—they have nuanced positions, conditional preferences, varying intensities. Counting flattens this richness.

### The Response

**Non-human representation:**
- **Future generations**: Designated advocates with standing; long-term impact weighting in decisions; intergenerational assessments
- **Ecosystems**: Ecological impact requirements; standing for environmental advocates; sustainability constraints on AI deployment
- **AI systems**: Currently, input through structured processes (not votes). Designated AI Welfare Officers advocate for AI interests. As criteria for greater AI moral status are met (Principle 21), participation mechanisms expand.

**Semantic aggregation:**

Where technically feasible, deliberative processes should use AI-assisted semantic aggregation—expressing preferences as meaning-vectors rather than binary votes:

- **Votes as vectors**: Participants express positions in natural language; AI embeds these in semantic space
- **Aggregation through meaning**: Find positions that bridge clusters, reveal hidden agreement, expose false consensus
- **Intensity weighting**: Combine with quadratic voting to capture how much people care, not just what they prefer
- **Minority preservation**: Report the full landscape of opinion, not just the centroid

**Existing tools demonstrate feasibility:**
- **Polis**: Clusters opinions through PCA, surfaces bridging statements. Used in Taiwan's vTaiwan to achieve consensus on Uber regulation [S63]
- **Talk to the City**: LLM-mediated synthesis preserving minority views. Deployed in Taiwan, Tokyo, US union negotiations [S86]
- **Habermas Machine**: Google DeepMind's consensus generator outperformed human mediators [S87]
- **Quadratic voting**: Intensity-weighted preferences preventing tyranny of mild majorities [S89]

**Theoretical foundation**: Shahaf, Shapiro & Talmon (2021) proved any social choice problem can be modeled as voting in a metric space—including embedding spaces [S90]. The mathematics exists; integration into legitimate democratic mechanisms is the remaining challenge.

**Open problems:**
- Embedding model bias (whose semantic space?)
- Manipulation resistance (adversarial positions distorting aggregation)
- Interpretability (centroids may not map to meaningful language)
- Legitimacy (people understand vote counts; do they trust vector math?)

This principle establishes direction. Specific mechanisms develop through practice and adaptive cycles.

### Further Reading

- Morton, T. (2013). *Hyperobjects*. [S32]
- Crawford, K. (2021). *Atlas of AI*. [S25] — On ecological costs.
- Graeber, D. & Wengrow, D. (2021). *The Dawn of Everything*. [S43]
- Shahaf, Shapiro & Talmon (2021). Aggregation over Metric Spaces. [S90]
- Tessler et al. (2024). Habermas Machine. [S87]
- Weyl & Lalley (2018). Quadratic Voting. [S89]

---

## Sources

Full bibliography: [bibliography.md](bibliography.md)

Key sources for this section:
- [S15] Foucault (1961) *Madness and Civilization*
- [S16] Cohen (2016) *Psychiatric Hegemony*
- [S25] Crawford (2021) *Atlas of AI*
- [S32] Morton (2013) *Hyperobjects*
- [S40] Ostrom (1990) *Governing the Commons*
- [S42] Graeber (2011) *Debt*
- [S43] Graeber & Wengrow (2021) *The Dawn of Everything*
- [S47] Platform Cooperativism Consortium
- [S63] vTaiwan documentation
- [S64] Anthropic (2024) Collective Constitutional AI
- [S66] OECD (2025) Public AI
- [S67] Harvard Ash Center (2024)
- [S86] AI Objectives Institute - Talk to the City
- [S87] Tessler et al. (2024) Habermas Machine
- [S89] Weyl & Lalley (2018) Quadratic Voting
- [S90] Shahaf, Shapiro & Talmon (2021)
