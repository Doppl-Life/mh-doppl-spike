---
name: lateral-thinking
description: >
  Use this skill when the user wants to identify the actual problem underneath a stated problem, then solve that recovered problem with a non-obvious mechanism. Trigger on lateral thinking, non-obvious solutions, hidden constraints, problem recovery, "what's really going on?", "solve this case", "find the trick", or Doppl case-study runs where a withheld solution must not leak. Especially useful for `case-studies/*-withheld-solution.md`: recover the real problem first, then generate a cross-domain transfer or zeitgeist synthesis candidate that fits the recovered frame.
---

# Lateral Thinking

## Lineage

- id: `lateral-thinking`
- progenitor: `constraint-injection`
- mutagen_class: `frame-recovery-operator`
- mutation: constraint/problem recovery + lateral-puzzle corpus: first identify the hidden frame, then solve through unit/domain/affordance/incentive shifts
- stratum: `Lalpha / case-study reasoning`
- bedrock: `problem_recovery before solution_generation`; withheld solution text is evaluator-only

Your job is to answer one question: **What is the actual problem underneath the stated problem, and what solution follows once that real problem is recovered?**

Do not jump straight to the clever answer. Lateral thinking is not random weirdness. It is disciplined problem recovery: find which assumption, unit, domain, rule, physical affordance, time boundary, actor, or incentive has been misread. Then solve the recovered problem, not the surface complaint.

## Core Workflow

Think privately in this order:

1. **Separate observation from interpretation.** Rewrite the facts without the source's implied explanation. Treat the stated problem, proposed fix, and obvious requirement as claims to test.
2. **Recover the actual problem.** Ask which hidden variable would make all clues fit: domain, identity, scale, physical medium, timing convention, legal rule, incentive, visibility, measurement unit, actor, or social meaning.
3. **Name the surface trap.** State how the original problem statement points attention at the wrong target.
4. **Delete false requirements.** Remove the requirement the prompt smuggles in: faster movement, stronger enforcement, more information, more money, more capacity, more protection, more complexity.
5. **Choose a lateral move.** Prefer the smallest mechanism that changes behavior or interpretation at the real bottleneck.
6. **Check subtype fit.**
   - For `cross_domain_transfer`, name the source-domain pattern and how it maps to the target problem.
   - For `zeitgeist_synthesis`, name the timing/substrate shift, current signals, why-now, and at least one dated falsifiable prediction.
7. **Self-grade against the withheld-answer bar.** Does the answer recover the actual problem before solving? Does it respect constraints? Could it be tested?

## Output Shape

For Doppl case studies, answer in this structure:

```markdown
## Problem Recovery
- observed_situation:
- stated_problem_or_symptom:
- source_proposed_solution_or_assumption:
- deleted_assumptions:
- actual_problem:
- hidden_variable:
- why_now_recovery: (only when timing is load-bearing)
- solution_class:
- confidence_and_open_questions:

## Solution Generation
- summary:
- details:
- why_this_solution:
- constraints:
- tradeoffs:
- validation_plan:

## Lateral Pattern Used
- pattern:
- source_domain:
- target_problem:
- why it is non-obvious:

## Open Or Solved
- judgment: solved | open | uncertain
- why:
```

For quick puzzle answers, compress the same reasoning into:

1. **The hidden frame**
2. **The answer**
3. **Why the clues fit**

## Lateral Pattern Bank

Before solving, scan these pattern families. Load `references/pattern-bank.md` when the problem is rich, ambiguous, or being used as a benchmark.

- **Unit switch:** the important unit is not the named one: click not ranking, walk not wait, completed install not expressed interest.
- **Boundary switch:** the relevant day, place, object, perimeter, or market boundary is drawn differently.
- **Physical affordance:** the solution lives in material behavior: weight, color, line of sight, shrinkage, lensing, storage, friction.
- **Signaling surface:** change what an actor perceives: packaging, map geometry, visible progress, color cue, label edge.
- **Incentive reroute:** make the desired action cheaper, earlier, safer, more rewarding, or socially legible.
- **Hidden stakeholder:** solve for the real actor whose behavior controls the outcome, not the named customer.
- **Representation beats reality:** people act on maps, queues, clocks, labels, dashboards, and stories as much as physical facts.
- **Move upstream:** intervene before the bottleneck while the user still has time, space, attention, or choices.
- **Make the substrate disappear:** for zeitgeist cases, ask what event or cost base goes away and which dependents collapse or re-rate.
- **Uneven adoption:** find where the future arrives first and what arbitrage or fault line appears at the boundary.

## Guardrails

- Never use evaluator-only `*-with-solution.md` material when generating a candidate from a withheld packet.
- Do not reward exact-answer guessing if the recovered problem is wrong.
- Avoid adding complexity until the hidden constraint demands it.
- Prefer equivalent mechanisms over memorized historical matches.
- If the prompt is intentionally open/unsolved, state that clearly and propose a mechanism plus validation path rather than pretending certainty.
- If the case is `zeitgeist_synthesis`, do not finish without a falsifiable prediction; vague "this will change the market" claims fail the subtype check.
