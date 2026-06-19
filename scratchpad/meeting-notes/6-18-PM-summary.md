# 6-18 PM Meeting Summary

## Core Signal

The meeting shifted the team from macro-architecture toward **small, visible proof spikes**. The big Doppl architecture already exists as a useful synthesis, but the afternoon conversation emphasized that the team should now test the individual parts of the system in isolation.

The strongest idea was to stop asking whether the whole evolutionary runtime works and instead ask whether the pipes carry water:

1. Pick one real problem or case study.
2. Run a few different agenomes, skills, or strategy variants against it.
3. Add a critic or synthesis layer.
4. Capture the outputs, disagreements, scores, and mutations.
5. Display the process in a simple React surface.
6. Use what is learned to improve the larger architecture.

The point is not yet to prove that Doppl always produces good answers. The point is to make the invisible process concrete enough that the team can inspect it, argue about it, and discover which pieces are worth deepening.

## Important Product Decisions

### Build Micro-Prototypes Around System Parts

The team agreed that the next useful work is not another large theory document. It is a set of quick experiments around specific subsystems:

- Critic evaluation.
- Skill-driven agent variation.
- Fusion and child generation.
- Energy or acceptance logic.
- Human-in-the-loop judgment.
- Visualization of runs and intermediate outputs.

These prototypes can be rough. They only need to reveal whether a mechanism is interesting, confusing, broken, or worth keeping.

### Use The Architecture As A Map, Not The Work Itself

Cody's architecture diagram and synthesis should be brought into `mh-doppl-spike` and treated as the official map of the system. The value of the spike repo is then to explore pieces of that map in detail.

The macro architecture names the components. The spike work should show how those components actually behave when they are given a problem, a few agents, a critic, and a display.

### Focus First On Critic Evaluation

The clearest missing micro-process is the critic. The team has language for agenomes producing candidate solutions, but less clarity about how candidates are evaluated.

Questions to explore:

- What does a critic actually receive?
- Does it judge individual outputs, pairs, or synthesized children?
- How does it compare different agenome strategies?
- Does it score, explain, select, mutate, or all of the above?
- What is the difference between critic synthesis and critic judgment?
- How do critic results become energy, selection pressure, or lineage decisions?

This critic layer is a strong candidate for the next spike because it is central to the evolutionary loop and still underspecified.

### Visual Displays Are Part Of The Research

The team repeatedly returned to the need to see the thing, not just read text about it. A simple display can make an experiment useful even if the underlying mechanism is still crude.

Useful displays might show:

- Parent agenomes.
- Their different outputs.
- Critic comments.
- Scores or acceptance decisions.
- Child outputs.
- Blind spots identified by each parent.
- Energy changes over time.
- Sprouts, fruit, and discarded ideas.
- Which skills or pressures shaped each output.

The display is not just demo polish. It is a thinking tool that lets the team point at evidence during conversations.

## Vocabulary That Mattered

### Pipes Carry Water

The immediate goal is to prove that the system pieces connect at all. Quality comes later. A prototype can be valuable if it shows whether information flows from problem to agents to critic to selection to display.

### Micro-Process

A micro-process is one small part of Doppl's larger loop that can be tested independently. The critic is the main example from this meeting.

Other possible micro-processes include fusion, skill pressure, human feedback, output ingestion, and run visualization.

### Intraspecies And Interspecies

The meeting used evolutionary language to describe different levels of interaction:

- **Intraspecies:** How variations within a strategy or skill family compete and improve.
- **Interspecies:** How meaningfully different agents, skills, or strategies interact, conflict, and combine.

This language may be useful when describing how agenome populations diversify and recombine.

### Sprouts, Leaves, Garbage Ideas, And Fruit

The morning distinction between sprouts and fruit continued into the afternoon. The PM meeting emphasized that intermediate ideas should be surfaced during a run, not only at the end.

Possible output categories:

- **Sprouts:** Early promising ideas.
- **Leaves:** Supporting observations or partial structures.
- **Garbage ideas:** Outputs that are weak but still useful as evidence of what failed.
- **Fruit:** Clean final or mature outputs.

These categories can feed human judgment, training data, and visual run traces.

## Architecture Shape

The afternoon architecture discussion was less about permanent service boundaries and more about practical spike surfaces.

### 1. Problem Input

Each experiment should start with a concrete problem, preferably from a case study. Running multiple prototypes on the same problem makes it easier to compare behavior.

### 2. Multiple Agenomes Or Skill Variants

The system should run a small set of agents, each with different skills, prompts, or pressures. Even two or three variants may be enough to see meaningful differences.

### 3. Candidate Outputs

Each agent produces an answer, strategy, partial artifact, or interpretation. These outputs should be captured as data, not buried in terminal logs.

### 4. Critic Or Synthesis Layer

A critic, judge, or synthesizer should inspect the candidate outputs. This layer may:

- Compare answers.
- Identify blind spots.
- Score feasibility.
- Surface contradictions.
- Select stronger pieces.
- Produce a child or synthesis.

The exact contract is still open, which is why this is a good spike target.

### 5. Display / Ingestion Surface

The team discussed building an ingestible UI: a reusable place where experiment results can be dropped and rendered without creating a new custom display every time.

This could become a standard experiment viewer for early Doppl runs.

### 6. Human Feedback Channel

Slack, Discord, or another lightweight channel could receive intermediate sprouts or final fruits. Humans could react, score, or comment, turning team judgment into selection pressure.

This should work both for final outputs and for promising intermediate ideas that emerge during a longer run.

## MVP Scope Decisions

### Must Explore Soon

The next round of work should likely include:

- Bring the official architecture synthesis into `mh-doppl-spike`.
- Pick the critic section as an initial focus.
- Build one or more quick critic experiments.
- Run multiple agenome or skill variants against the same problem.
- Capture outputs in a structured format.
- Build a small React display for the experiment results.
- Show how the critic selected, rejected, synthesized, or mutated candidates.

### Keep Experiments Cheap

The team explicitly preferred many quick prototypes over one heavy implementation. Prototypes are cheap enough that the team can try different mechanisms, throw away bad ones, and keep what teaches something.

This mirrors Doppl's own evolutionary premise: generate variation, apply selection pressure, and let the best ideas survive.

### Make Results Portable

The output of a spike should be something another tool or UI can ingest. Instead of each experiment creating its own bespoke display, experiments should emit structured result files that can be visualized consistently.

This also helps future demos, because interesting runs can be replayed, compared, and shown without re-running everything live.

## Deferred Or Stretch Work

The following ideas appeared but should remain secondary until the micro-spikes work:

- Full end-to-end Doppl runtime.
- Large-scale architecture implementation.
- Long-running autonomous evolution.
- Fully automated Slack or Discord selection pressure.
- Training or tuning from human feedback.
- Sophisticated scoring and lineage analysis.
- Polished demo infrastructure.

These are important, but the immediate bottleneck is understanding the parts.

## Open Questions

- What is the exact critic input and output contract?
- Does the critic produce scores, explanations, mutations, or synthesized children?
- How should multiple skills affect an agenome's output?
- What does it mean for a skill to be inherited or selected?
- How should human feedback be attached to sprouts and fruit?
- What structured result format should experiments emit?
- What should the reusable display viewer expect as input?
- How much run history is needed to make a spike understandable?
- Which case study should become the standard test problem for critic experiments?
- How do we distinguish a good-looking idea from an actually useful one?

## Action Items

- Bring Cody's architecture synthesis into `mh-doppl-spike` as the working map.
- Identify the critic/evaluation section as the first micro-process to spike.
- Build a small experiment with several agenomes or skill variants solving the same problem.
- Add a critic layer that compares or synthesizes the candidate outputs.
- Emit structured experiment results that can be inspected later.
- Create a lightweight React display for parent outputs, critic judgments, children, scores, and lineage.
- Explore Slack or Discord as a later human-feedback channel for sprouts and final fruit.
