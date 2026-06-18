# Doppl — Product Requirements Document

**Project:** Doppl, an evolutionary population of agents that evolves toward generating non-obvious, verifiable ideas.
**Context:** Gauntlet capstone. Team of 3-4 engineers. Two-week build. Showcase Jun 29.
**Direction:** B (philosophically novel agent) + A (classical ML governs the population).

---

## 1. Purpose of this document

This PRD defines *what* Doppl is, the invariants it must respect, the data model, the functional requirements, and the scope boundary between the MVP and the moonshot.

It deliberately does **not** make architecture decisions. Those are the job of the next deliverable. The intended handoff is: feed this document to Claude Code and have it produce a **technical architecture / spec proposal** that resolves the open questions in Section 13 and proposes concrete implementations for each component.

Read Section 3 (invariants) and Section 13 (open questions) first if you only read two sections.

---

## 2. One-paragraph summary

Instead of hand-building a single agent with a frozen scaffold, Doppl builds an evolutionary system that breeds a *population* of agent configurations and lets selection pressure discover scaffolds no human would write. Each individual is a serialized agent configuration. Individuals compete on a hard task with no cheap ground truth: generating a genuinely good idea (a non-obvious, verifiable hypothesis, innovation, or approach to an open problem). Fitness comes from surviving an adversarial critic council plus objective checks where they exist. Reproduction is two-parent fusion (recombine two high-fitness configurations, then mutate). A finite compute budget per individual is the selection environment. A classical ML control layer allocates compute, scores novelty, and predicts which configurations are worth running. Generation N+1 should measurably beat generation N.

---

## 3. North star and design invariants

These are non-negotiable. The architecture may choose any implementation that preserves them.

1. **Selection must be real, not cosmetic.** Compute scarcity is the environment. An individual that produces verified value earns more budget; one that wastes budget starves. If energy accounting is decorative, the project has failed its core thesis.
2. **Fitness must anchor to signal that cannot be faked.** A self-optimized or council-based metric invites reward hacking ("redefine winning as whatever I already produce"). Any evolvable part of the fitness function must remain correlated with bedrock that the population cannot manipulate: executable checks, real-world resolution, or held-out human judgment.
3. **Reproduction is two-parent fusion, not cloning.** Asexual mutate-a-copy converges to local optima. Offspring inherit from two distinct high-fitness parents, then mutate.
4. **The scaffold is the thing under selection.** The intelligence lives in the population dynamics, not in any single hand-written agent. There is no fixed app, only a process that produces ideas.
5. **The tree must terminate.** Recursive spawning can blow the budget combinatorially. Hard energy caps, depth limits, and a budget allocator keep the population finite. This is demoed as a feature, not hidden as a constraint.

---

## 4. Glossary (metaphor mapped to engineering)

The codebase keeps the project vocabulary, but every term has a literal meaning. Use both.

| Project term | Engineering meaning |
|---|---|
| Agenome | A serialized agent configuration (the genome of one individual). The unit of selection. See Section 5. |
| Population | The set of live agenomes in the current generation. |
| Generation | One full pass of the loop: ideate, evaluate, select, reproduce, mutate. |
| Metabolism / energy | A per-agenome compute budget (tokens / tool-call allowance). Actions debit it; verified value credits it. |
| Fusion | Two-parent recombination. Operates at the agenome level (crossover of config fields) and the output level (synthesis of two parents' reasoning). |
| Critic council | A panel of adversarial critic agents that scores a candidate idea. The core of the fitness function. |
| Objective check | A real, non-LLM verification for a given domain (run the transfer, resolve the claim against data). |
| Rule of Cool | The existing, working single-agent skill that serves as the generation-0 seed agenome. |
| Idea / candidate | A proposed hypothesis, innovation, or approach emitted by an agenome for a given problem instance. |

---

## 5. Core data model

The architecture finalizes types and storage. This is the required shape.

**Agenome** (the individual):
- `id`, `generation`, `parent_ids` (zero, one, or two), `lineage_tag`
- `system_prompt`: string
- `persona` / `value_weights`: the trait vector that biases the agent. Open question whether this is a free-text persona, a dict of named scalar axes (e.g. novelty vs. feasibility bias), or both. The architecture decides; crossover and mutation must be able to operate on it.
- `tool_permissions`: the set of tools / MCP servers this agenome may call
- `decomposition_policy`: how the agenome breaks a problem down (strategy and/or prompt fragment)
- `spawn_budget`: max sub-agents it may spawn
- `energy`: current compute allowance
- `metadata`: mutation history, fitness history, creation timestamp

**ProblemInstance:**
- `id`, `domain` (transfer | zeitgeist | research), `prompt`, optional `objective_check` reference, optional `held_out_rubric` reference

**IdeaCandidate:**
- `id`, `agenome_id`, `problem_instance_id`, `content`, `reasoning_trace`, `energy_spent`

**CritiqueResult:**
- `idea_id`, `critic_id`, `mandate` (grounding | novelty | feasibility | falsification), `score`, `rationale`, optional `evidence` (retrieval hits, check output)

**GenerationRecord:**
- `generation`, `population` (agenome ids), `fitness_scores`, `survivors`, `offspring`, `aggregate_metrics`

### 5.1 These types are the interface contracts

The five types above are the seams between the four ownership surfaces. The flow: Kernel produces Agenomes and IdeaCandidates, the Verifier consumes IdeaCandidates and produces CritiqueResults, the Kernel consumes CritiqueResults for selection, the ML layer reads GenerationRecords and writes allocation back to the Kernel, and Demo reads all of it.

- **Architecture requirement:** lock these schemas on day 1 so the four surfaces build in parallel against stable types. The PRD does not specify internal module structure (package and class layout, orchestration); that is the architecture's call. The contracts are the only thing frozen up front.
- **Decoupling win:** once IdeaCandidate and CritiqueResult are frozen, the Verifier (the highest-risk component) builds day 1 against a stub that feeds it canned IdeaCandidates. It does not wait for the generational loop. The Kernel↔Verifier and Kernel↔ML seams matter regardless of team size; the Kernel↔Demo seam only matters at 4 people.

---

## 6. System components and functional requirements

### 6.1 Generational loop (Kernel)
- **FR-1.** Initialize generation 0 from the seed agenome (Rule of Cool) plus its mutated variants, to a target population size (default ~20 for MVP).
- **FR-2.** For each generation: every live agenome ideates on the active ProblemInstance(s), candidates go to the critic council, fitness is assigned, the bottom of the population is culled, top performers are selected as parents, offspring are produced by fusion + mutation, and the next generation is assembled.
- **FR-3.** The loop runs for a configurable number of generations and persists a GenerationRecord per generation.
- **FR-4.** All spawn and reproduction operations respect depth limits and the global budget cap (invariant 5).

### 6.2 Ideation
- **FR-5.** An agenome consumes a ProblemInstance and emits one or more IdeaCandidates, recording its reasoning trace and energy spent.
- **FR-6.** Ideation is bounded by the agenome's current energy. Running out of energy ends the agenome's turn.

### 6.3 Selection: critic council and objective checks (the fitness function)
This is the highest-risk component. Treat it as the center of gravity.
- **FR-7.** Each IdeaCandidate is evaluated by a panel of critic agents with distinct mandates: factual grounding, novelty / prior-art, feasibility, and falsification.
- **FR-8.** Critics are grounded. Grounding-mandate and novelty-mandate critics must use retrieval (literature / prior-art search) rather than unaided model judgment.
- **FR-9.** Where the domain supports it, an objective check runs and contributes to fitness independent of the council (e.g. the proposed transfer is executed on a test case and scored pass/fail; a claim resolves against held-out data). For research-class domains (Section 7), an objective or strongly grounded check is **required, not optional**, because a council of LLM critics can be confidently wrong in ways that look rigorous.
- **FR-10.** Fitness is an aggregation of council scores and objective-check results. The aggregation rule is an architecture decision; it must weight unfakeable signal above council opinion.
- **FR-11 (anti-reward-hacking).** Judges used to certify an idea are held out from the breeding loop, and critic agenomes rotate so the optimization target keeps moving.

### 6.4 Reproduction: Fusion and mutation
- **FR-12.** Offspring are produced from two distinct high-fitness parents.
- **FR-13.** Agenome-level crossover: combine parents' configuration fields (prompts, personas, tool permissions, decomposition policies) into a child config. The per-field crossover rule is an architecture decision.
- **FR-14.** Output-level fusion: a model synthesizes two parents' reasoning / candidate ideas into a child idea or child agenome bias.
- **FR-15.** A mutation operator perturbs the child agenome after fusion (prompt edits, persona-weight jitter, tool-permission changes, policy swaps).

### 6.5 Metabolism (energy and budget)
- **FR-16.** Every agenome holds a finite energy balance. Reasoning, tool calls, and spawning debit it.
- **FR-17.** Verified value (surviving the council, passing a check) credits energy or increases next-generation allocation.
- **FR-18.** Hard global budget cap, per-agenome cap, and depth cap are enforced and surfaced in telemetry.

### 6.6 Classical ML control layer (Direction A)
For the MVP these may begin as simple heuristics and grow toward the learned versions. The architecture should state which it targets for week 1 vs week 2.
- **FR-19.** Spawn-budget allocation across lineages framed as a multi-armed bandit / RL control problem (which lineages get more compute).
- **FR-20.** An embedding of "idea space" plus novelty / diversity scoring (nearest-neighbor distance, DPP, or MAP-Elites-style niches) to prevent mode collapse.
- **FR-21.** A learned value model that predicts an agenome's expected fitness before spending tokens on it, used to gate or prioritize ideation.

---

## 7. Target problem domains and idea evaluation

"Idea" is defined broadly: any non-obvious, verifiable hypothesis, innovation, or approach to an open problem. This explicitly includes scientific and research innovation, not only product or business framings.

Three prey:
1. **Cross-domain transfer.** Find a technique, mechanism, or result in field A that cracks an open problem in field B. This is the primary target and maps directly to the fusion engine. Research example (illustrative of the class, not a deliverable): applying a method or mechanism from one field to an open problem in Alzheimer's research such as amyloid clearance or blood-brain-barrier delivery.
2. **Zeitgeist synthesis.** Surface a thesis, product, or framing that fits the present moment and survives scrutiny.
3. **Research / scientific innovation.** A non-obvious approach to an open research problem. Highest verification bar; gated on FR-9.

**Honesty boundary for scope and demo.** Doppl is the engine that hunts these problems. The two-week demo shows the *process* (cross-domain hypotheses generated, surviving an adversarial gauntlet, and where a real check exists, passing a verifiable transfer). It does not claim a solved scientific result. Frame research domains as the class of problem the organism targets, not as outcomes promised by Jun 29.

### 7.1 The problem set is a dependency, not a detail

The problem set is a hard dependency for the verifier (the riskiest component), so the PRD pins its requirements but not its exact instances.

**Requirements on the problem set (fixed):**
- Must include at least one domain with a real executable objective check.
- Must produce a measurable gradient: generation 0 should not already max it out, and it should not be so hard that everything floors at zero.
- Must be cheap enough to run that the loop can iterate many times within the two-week budget.
- Each ProblemInstance must declare its evaluation method.

**Specific instances (provisional):** name 2-3 candidate problems as a starting point, but validate them in the week-0 spike (Section 11) before architecture, since the team does not yet know which domains yield a real check and a usable gradient.

### 7.2 Split the problem set by purpose

The fuzzy domains (zeitgeist, research/Alzheimer's-class) have no cheap check, so their fitness rides entirely on the critic council, the acknowledged weak judge. A rising fitness curve from a weak judge proves nothing. Therefore:

- **Checkable domains carry the proof.** The core claim (N+1 beats N) rests on a domain with a real executable check. Cheapest options: code/algorithmic transfer scored against a test harness, math/puzzle transfer with a checkable answer, or forecasting against held-out historical data the model was not trained to know.
- **Fuzzy domains carry the demo.** The live unseen prompt from the room runs on zeitgeist/research domains, where the council plus the audience's reaction carries it, and the framing is honest that the judge is the council.

---

## 8. Scope

### 8.1 MVP (must run, must demo the effect)
- A single-generation loop on a fixed problem set: spawn a population (size derived from a total compute envelope, ~15-25 for tree legibility and enough variation to recombine), reproduce by fusion (crossover + output synthesis), run the critic council, cull, mutate, re-run.
- Verification = critic council + at least one objective check on at least one domain.
- A held-out idea-quality rubric used to measure generation-over-generation improvement.
- Instrumented dashboard: population tree, energy per agent, fitness over generations.
- **The MVP exists to demonstrate one claim: generation N+1 measurably beats generation N on the held-out rubric.**

### 8.2 Stretch / moonshot (explicitly not required for a passing build)
- Multi-generational, open-ended population running for hours, with a live compute economy and learned spawn allocation.
- Emergent lineage specialization (e.g. a "transfer-hunter" lineage, a "contrarian" lineage).
- Self-improving verifier: critic agenomes themselves under selection.
- In-house fine-tuning flywheel: distill winning lineages into model weights so an owned model gets permanently better at ideation. Open-weight models additionally unlock weight-level fusion (merging parent models, not just outputs).
- Live, watchable reorganization of the population on screen as selection runs.

---

## 9. Acceptance criteria (definition of done for MVP)

1. The generational loop runs end-to-end on the fixed problem set without manual intervention per generation.
2. Reproduction demonstrably uses two parents (lineage records show two `parent_ids`).
3. The critic council scores candidates and at least one domain runs a real objective check.
4. Held-out rubric scores show a measurable, reproducible improvement from an early generation to a later one.
5. The budget caps hold: no run exceeds the configured global energy / depth limits.
6. The dashboard renders the population tree, per-agent energy, and a fitness-over-generations chart from real run data.

---

## 10. Observability and demo requirements (Jun 29)

The demo is a live 10 minutes and the dashboard is load-bearing.
- **DR-1.** Seed intake: accept a live, unseen prompt from the room as a ProblemInstance.
- **DR-2.** Live population tree: agents spawning, spending energy, ideas hitting the council, weak lineages going dark, strong pairs fusing into mutated offspring.
- **DR-3.** Fitness-over-time chart that rises as later generations beat earlier ones.
- **DR-4.** Replay: for the surviving best idea, replay the adversarial gauntlet it passed; for transfer prompts, execute the proposed transfer live.
- **DR-5.** The contrast the demo must make legible: this is generational (winners breed, two parents fuse, losers' useful fragments get spliced back in), not a single-round tournament.

---

## 11. Constraints and assumptions

- **Team:** 3-4 engineers. A 3-person team merges Kernel and Demo under one owner; a 4th lets each surface run in parallel. Ownership surfaces: Kernel/runtime, Selection/ML, Verifier council, Demo/observability.
- **Timeline:** two weeks. Week 1: kernel + single-generation fusion loop end-to-end. Week 2: compute economy, learned allocation, novelty pressure, live visualization, and the fine-tuning flywheel if the inner loop holds.
- **De-risked seed:** generation 0 is the existing Rule of Cool skill, the frozen single-agent version of one agenome. The architecture must define how that skill is ingested into the Agenome schema.
- **Cost:** the metabolism is also the cost control. Budget caps are a hard requirement, not a tuning preference.
- **Week-0 spike (before architecture):** validate that at least one candidate problem yields both a real executable check and a measurable gradient. If no checkable problem exists, the core claim cannot be proven, so this spike gates the rest of the build.

---

## 12. Out of scope / anti-requirements

- No fixed end-user-facing product. Doppl is the process, not an app built on top of it.
- No claim of a solved scientific result within the capstone window.
- No fitness signal that rests solely on unaided LLM judgment for research-class domains.
- Asexual single-parent reproduction as the primary mechanism is out (violates invariant 3).

---

## 13. Open questions and decisions deferred to the architecture proposal

The architecture proposal should resolve each of these with a concrete recommendation and rationale.

1. **Orchestration:** LangGraph for the generational loop and agent spawning, a custom orchestrator, or a hybrid? How is the population loop expressed (graph, scheduler, queue)?
2. **Energy metering:** how is energy actually measured and enforced (token accounting from API usage, a virtual currency, wall-clock, tool-call counts)? How is "verified value credits energy" implemented?
3. **Persistence:** what stores the population, lineage, and GenerationRecords (in-memory, SQLite, something else)? What needs to survive a crash mid-run?
4. **Agenome representation:** is `persona` / `value_weights` free text, a named-axis vector, or both? Define so crossover and mutation operate cleanly.
5. **Crossover semantics:** per-field rules for fusing two agenome configs. How are conflicting tool permissions, prompts, and decomposition policies combined?
6. **Critic grounding:** which retrieval source / MCP tools ground the grounding and novelty critics? What is the prior-art search backend?
7. **Objective checks:** for the MVP problem set, which specific domain provides an executable check, and what exactly does it run?
8. **Idea-space embedding:** which embedding model, and how is novelty scored (NN distance, DPP, MAP-Elites niches)?
9. **Spawn allocation:** bandit vs. RL formulation, and the MVP fallback heuristic if the learned version is not ready.
10. **Concurrency:** how is parallel agent execution handled within the budget cap? What is the spawn fan-out limit?
11. **Held-out judges:** how are certifying judges kept out of the breeding loop, and how do critics rotate?
12. **Held-out rubric:** what is the rubric, who/what applies it, and how is generation-over-generation improvement measured reproducibly?
13. **Fitness aggregation:** the exact rule combining council scores and objective checks, weighted so unfakeable signal dominates.
14. **Seed ingestion:** how the Rule of Cool skill becomes a populated Agenome plus its initial mutated variants.

---

## 14. Suggested next step for Claude Code

Produce a technical architecture / spec proposal that:
- Recommends a concrete stack and orchestration model and justifies it against the invariants in Section 3.
- Specifies the Agenome, ProblemInstance, IdeaCandidate, CritiqueResult, and GenerationRecord types in code-level detail.
- Resolves every open question in Section 13 with a recommendation and a stated tradeoff.
- Defines module boundaries aligned to the four ownership surfaces in Section 11, so the team can build in parallel from day one.
- Sequences the work into a week-1 (MVP loop) and week-2 (economy, learned control, novelty, visualization, optional flywheel) plan with the smallest end-to-end runnable slice identified first.
