# 6-18 AM Meeting Summary

## Core Signal

The meeting clarified Doppl as an **agential evolution runtime for problem-solving**, not merely a system for evolving better agents. Agents are the mechanism; better ideas, solutions, and artifacts are the output.

The team converged on a practical MVP shape:

1. Start from a structured problem/case study.
2. Generate an initial population of agenomes.
3. Let agenomes produce candidate solutions or partial solution artifacts.
4. Run candidates through a fitness pipeline made of critic council review and objective checks.
5. Apply selection pressure through scores, energy, culling, fusion, and mutation.
6. Record every step in an append-only event log.
7. Display lineage, traces, energy, scores, and artifact evolution in a dashboard.

The strongest shared example was the **Jack superyacht drone privacy case**, because it has a real-world problem, meaningful constraints, failed obvious approaches, and a known non-obvious solution.

## Important Product Decisions

### Use Problems, Not Abstract Ideas

The team decided the system should be framed around **problems that need ideas**, not vague "good idea" generation. This makes evaluation easier because a good answer can be judged against:

- The problem being solved.
- The constraints it respects.
- The failed approaches it avoids.
- The artifact or recommendation it produces.
- Domain expert judgment.

### Case Studies Become Evaluation Inputs

The Jack example showed the need for a repeatable case-study template:

- Problem statement.
- Domain context.
- User or stakeholder.
- Constraints.
- Failed attempts.
- Known solution, if available.
- Withheld-solution version for testing.
- Expert validator.

The team identified solved-but-non-obvious cases as especially valuable. These can be used to test whether Doppl can rediscover or approximate strong expert solutions without being handed the answer.

### Domain Experts Are Valuable Validators

Jack can act as a domain expert for superyacht cases. More generally, Doppl should support expert feedback loops where people can asynchronously rate ideas, sprouts, and final outputs.

The team discussed using Slack or Discord as a lightweight "human pressure" channel:

- Doppl emits candidate ideas or intermediate sprouts.
- Humans rate or comment on them.
- Domain experts can be weighted more heavily for their field.
- Feedback can later become training or calibration data.

## Vocabulary That Mattered

### Sprouts And Fruit

The team distinguished between:

- **Sprouts:** Interesting intermediate ideas that appear during a run but are not final outputs.
- **Fruit:** The final or mature output of the run.

Both may be worth capturing. Sprouts can become training data or future inspiration; fruit is what the system ultimately presents.

### Weeds

Weak or bad ideas that lose energy, get culled, or fail critic pressure. These should not simply vanish; keeping them in logs can help audit what the system tried and why it failed.

### Agenome

An agenome is a problem-solving unit or strategy representation. It may include:

- Problem framing.
- Constraints/environment.
- System prompt/persona.
- Tool permissions.
- Decomposition strategy.
- Critique style.
- Scoring weights.
- Energy budget.

The team treated agenomes as evolving entities whose outputs compete under environmental pressure.

### Selective Pressure

Selective pressure maps to the environment and evaluation criteria:

- Constraints.
- Critic scores.
- Objective checks.
- Human/domain expert feedback.
- Energy cost.
- Novelty or usefulness.
- Fit to the current moment or domain.

### Mutagen Pressures

Skills like rule-of-cool, breakout, and blindside were discussed as possible mutagen pressures:

- **Rule of cool / breakthrough:** Find the non-obvious accretive idea latent in the current material.
- **Breakout:** Escape the current frame and find a radically different path.
- **Blindside:** Find non-obvious traps or failure modes.

These can shape how agenomes mutate or how candidate ideas are reframed.

## Architecture Shape

The team repeatedly returned to service boundaries and contracts. The emerging architecture has these core components:

### 1. Kernel / Runtime Loop

The kernel owns the evolutionary lifecycle:

- Seed intake.
- Population creation.
- Run orchestration.
- Energy/metabolism.
- Fusion.
- Mutation.
- Culling.
- Replayability.

### 2. Agenome Population

The system starts with a population of agenomes. These are not necessarily final ideas themselves; they are strategies or organisms for generating and improving ideas.

The population may be seeded from one base idea plus mutations, or from multiple initial strategies.

### 3. Ideation / Artifact Generation Service

The ideation surface produces idea candidates or artifacts. The team emphasized that this cannot be a black box: the system must capture what each model or agent said, how it debated, and what artifact resulted.

### 4. Fitness Pipeline

The fitness pipeline includes:

- Critic council.
- Objective check service.
- Partial credit gate.
- Score aggregation.
- Energy adjustment.

The team recognized that "idea quality" is under-specified and needs better rubrics, held-out judges, and non-LLM checks.

### 5. Selection And Reproduction

Selection removes weak candidates and preserves stronger ones. Reproduction should not always be equal-parent averaging. If one parent earns 80% and another earns 40%, the child may inherit proportionally more from the stronger parent.

The team discussed:

- Individual parent evaluation.
- Pair evolution.
- Blind spot cancellation.
- Weighted fusion based on parent strength.
- Mutation to explore adjacent possibilities.

### 6. Event Log And Replay

The team leaned toward an append-only event log as the source of truth. Every run event should be recorded so the system can:

- Replay a strong demo run.
- Audit decisions.
- Show lineage.
- Explain why candidates survived or died.
- Persist traces for later analysis.

This may create more data than a minimal system, but the team felt the observability upside is worth it for the MVP.

### 7. Dashboard

The dashboard needs to make the process visible:

- Population and lineage.
- Energy changes.
- Candidate artifacts.
- Critic scores.
- Objective checks.
- Fitness improvement over generations.
- Replay mode.

The architecture document should serve engineering first, but the demo architecture must still have strong narrative and visual clarity.

## MVP Scope Decisions

### Must Ship

The MVP should include:

- Case-study intake.
- Agenome population.
- Evolution loop.
- Critic council.
- Objective checks.
- Selection/fusion/mutation.
- Energy or budget metaphor.
- Append-only event trace.
- Replayable runs.
- Dashboard observability.
- At least one strong case study with withheld/evaluator versions.

### Keep Boring Tech Around The Weird Part

The team preferred a boring stack around the strange core:

- TypeScript/full-stack app.
- Durable event store.
- LLM provider adapters.
- Rich dashboard.
- Postgres as the likely source of truth.
- OpenRouter or similar provider access.
- Observability/tracing for model calls and run events.

The weirdness should live in scoring, evolution, critic behavior, and lineage, not in fragile infrastructure choices.

### Postgres First, Neo4j Later

Postgres was favored as the primary source of truth. Neo4j or graph tooling may be useful later as a read model for lineage analysis and visualization, but should be treated as a spike/deferred architecture option rather than the MVP database.

### Replay Mode Matters

The demo should support replaying a strong previous run. Live runs are useful, but replay makes the presentation deterministic and lets the team show a clean trace even if live model calls are slow or variable.

## Deferred Or Stretch Work

The following were treated as stretch or deferred:

- Self-evolving verifier.
- Fine-tuning flywheel.
- Learned/bandit allocation of compute.
- Advanced novelty scoring.
- Advanced quality diversity.
- Long-running open-ended evolution.
- Production-grade auth and multi-role systems.
- Full Neo4j lineage infrastructure.
- In-house model training.

Some of these should be designed for, but not built deeply before the core loop works.

## Open Questions

- What exactly is the agenome data model?
- What fields cross over during fusion: prompt sections, tools, critique style, scoring weights, or something else?
- What is the minimum useful critic rubric?
- What non-LLM checks can be included in the MVP?
- How should partial credit be computed from critic and objective scores?
- What makes an idea meaningfully novel rather than merely different?
- How should energy budget interact with score improvement and compute cost?
- How much of the human/domain expert feedback loop should be in the MVP?
- What is the exact contract between kernel, ideation, critic, objective checks, and reproduction?

## Action Items

- Create or refine a case-study schema based on the Jack example.
- Turn the Jack transcript into full and withheld case-study files.
- Solicit more non-obvious solved problem cases from the cohort or outside domain experts.
- Run architecture drafting/finalization against the current planning docs.
- Define the agenome, problem instance, candidate artifact, critic result, objective check result, and run event contracts.
- Build toward a replayable dashboard that shows lineage, energy, critique, and artifact evolution.
- Keep a central place for raw transcripts, meeting notes, synthesized summaries, planning docs, and architecture artifacts.

## Bottom Line

The meeting moved Doppl from a poetic evolutionary metaphor toward an implementable MVP architecture. The key breakthrough was realizing that Doppl needs strong **problem cases** and visible **evaluation pressure**, not generic idea generation. The Jack case became the model: a messy expert transcript can become a structured benchmark with constraints, failed attempts, a hidden known solution, and domain-expert validation.

The MVP should now prove one thing clearly: given a hard, constrained problem, Doppl can evolve candidate artifacts through critic pressure and selection into stronger, more defensible solutions while showing its work.
