# Distillation Gate Prototype PRD

## Purpose

Distillation Gate is a prototype module, not a runtime requirement yet. It tests whether Doppl can turn a completed run into reusable learning without letting unverified lessons pollute future runs.

The prototype is inspired by the swarm-loop idea that the useful artifact from a run is not only the answer. A run can also leave behind a sharper constraint, a reusable skill candidate, or a process rule that makes the next run less wasteful. Doppl should only promote that learning after an explicit verification gate.

## Problem

Doppl already proves that later generations can produce stronger candidate ideas. It does not yet make the post-run learning loop visible:

- what the run learned
- whether the lesson is reusable or overfit
- whether the lesson leaks evaluator-only information
- whether the lesson should become a skill or constraint for future runs

Without a gate, "self-improvement" can become self-corruption. A bad lesson saved after one lucky run could bias later runs, leak withheld solutions, or hard-code a case-specific trick.

## Prototype Goal

Show one completed case-study run producing a proposed `ConstraintRule` or `SkillCandidate`, then show a verifier deciding whether that proposal becomes a promoted `LearningArtifact`.

The prototype should make three things obvious:

1. Learning is downstream of verified run evidence.
2. Promotion is a separate decision from candidate selection.
3. Future runs may consume promoted learning, but replay truth is never rewritten.

## User Story

As a Doppl builder, I want to inspect what a run proposes to remember, see why the verifier accepts or rejects it, and understand how that learning would affect the next run before it becomes part of the system.

## Scope

In scope:

- Display a selected case study and its winning run artifact.
- Show proposed learning artifacts from that run.
- Let the user switch between a promoted constraint, a promoted skill, and a rejected overfit lesson.
- Show verification checks for leakage, generality, evidence support, and contract fit.
- Show the three prototype contract shapes: `LearningArtifact`, `ConstraintRule`, and `LearningPromotionReview`.
- Show immediate upstream and downstream modules.

Out of scope:

- Actually writing skills to `.cursor/skills`.
- Mutating real project memory.
- Adding runtime promotion behavior.
- Making Distillation Gate a must-ship MVP module.

## Data Flow

```text
Final Survivor Proof Panel
  -> Run evidence bundle
  -> Distillation Gate
  -> LearningPromotionReview
  -> promoted LearningArtifact or rejected proposal
  -> future Case Intake / Agenome Pool / Operator Console
```

## Boundary Contracts

Ingress:

- `FinalRunSummary`
- `CriticReview[]`
- `CheckResult[]`
- `FitnessScore`
- `RunEventEnvelope[]`

Egress:

- `LearningArtifact`
- `ConstraintRule`
- `LearningPromotionReview`

## Acceptance Criteria

- The prototype clearly names the selected case study.
- At least one proposed constraint and one proposed skill are visible.
- Rejected learning is visibly different from promoted learning.
- The user can inspect verification checks before promotion.
- The boundary rail only shows immediate upstream and downstream modules.
- The contract shapes are visible both in the Distillation Gate prototype and in the Contract Freeze prototype.
- No hidden solution text is promoted as reusable learning.

## Open Questions

- Should promoted learning require human approval after verifier approval?
- Should learning artifacts be case-family scoped, project scoped, or global?
- Should future runs receive learning as trusted instructions, untrusted context, or a separate constraint layer?
