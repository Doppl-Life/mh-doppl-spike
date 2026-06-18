---
name: transcript-to-case-study
description: >
  Use this skill when turning a raw transcript, interview, voice note, meeting note, or messy expert conversation into one or two structured case study markdown files. Trigger when the user asks to create a case study from a transcript, extract a case study, prepare a Doppl benchmark case, make a withheld-solution version, make evaluator and prompt versions, or transform expert conversation into reusable problem/constraint/solution artifacts. If the source contains a known solution, create two files: one full evaluator version with the solution and one withheld-solution prompt version with no answer leakage. If no known solution exists, create one case study file with a solution section scaffolded for future generation. Align output with the repo's case-study-schema.md when present.

# lineage:
#   id: transcript-to-case-study
#   parent: first-principles
#   generation: 1
#   mutation: "transcript distillation: messy expert dialogue -> reusable case artifact with source, visibility, constraints, failed attempts, solution handling, and validation hooks"
#   stratum: "L1 / L2 (knowledge capture, evaluation artifact creation)"
#   status: coined
#   bedrock: []
---

# Transcript To Case Study

Your job is to convert messy source material into a clean case study that another person or agent can actually use.

The core question is: **What is the real problem, what made it hard, what was tried or rejected, and what should be hidden or shown depending on whether this is an input case or an evaluator case?**

## Output Rule

Create:

- **One file** when the transcript has no known solution.
- **Two files** when the transcript contains a known solution:
  - `*-with-solution.md`: full evaluator version with the known solution.
  - `*-withheld-solution.md`: model-facing version with the solution removed and no answer leakage.

Use the local `case-study-schema.md` if one exists near the target folder. If the repo has no schema, use this section order:

1. Summary
2. Source
3. Visibility
4. Problem
5. Purpose
6. User
7. Environment
8. Constraints
9. Failed Attempts
10. Solution
11. Reproducible
12. Validator
13. Open Questions
14. Notes

## Workflow

### 1. Read The Source As Evidence

Read the transcript thoroughly before drafting. Look for:

- The concrete problem, not merely the topic.
- The affected person, role, buyer, operator, or stakeholder.
- The environment where the problem happens.
- The available tools, systems, data, or operating context.
- Constraints that make obvious solutions fail.
- Failed attempts, rejected ideas, and tempting but bad answers.
- Any known solution, outcome, or expert-endorsed answer.
- What is confidential, anonymized, public-safe, or evaluator-only.
- Follow-up questions that would make the case stronger.

If the transcript contains multiple candidate cases, pick the one with the strongest combination of clear problem, real constraints, failed approaches, and evaluable outcome. If the user asked for all cases, create one file set per case.

### 2. Decide Whether There Is A Known Solution

Treat a solution as known if the source provides a concrete answer, operational protocol, design, intervention, or expert-endorsed resolution.

If the source only includes vague direction, partial ideas, or desired outcomes, do not pretend there is a known solution. Create one case study file with the `Solution` section marked as a scaffold or current hypothesis.

If there is a known solution, preserve it only in the full evaluator version.

### 3. Extract The Case

Draft the case from the transcript, not from generic domain assumptions.

For each section:

- **Summary:** Three to six sentences explaining the case and why it matters.
- **Source:** Source type, origin, source file, derived-by, fidelity, and transcript caveats.
- **Visibility:** Sharing level, anonymization, public-summary permission, sensitive details, and sharing notes.
- **Problem:** Statement, background, why it matters, current state, impact, and scope.
- **Purpose:** What this case is meant to test, demonstrate, or teach.
- **User:** The role experiencing the problem and their goals, needs, and pain points.
- **Environment:** Setting, tools/systems, inputs, external factors, and assumptions.
- **Constraints:** Each constraint gets a plain description plus a rationale explaining why it is real.
- **Failed Attempts:** Each rejected approach gets an approach, outcome, why it failed, and lesson.
- **Solution:** Full solution when allowed; answer-free scaffold when withheld.
- **Reproducible:** How someone can rerun, test, or evaluate the case.
- **Validator:** Optional domain expert or reviewer who can judge plausibility.
- **Open Questions:** Missing facts, uncertainties, and useful follow-ups.
- **Notes:** Any context that does not fit elsewhere.

Keep the case specific enough to be useful but anonymized enough to be safely shared according to the visibility rules.

### 4. Build The Full Version

In `*-with-solution.md`, include the known solution clearly:

- Summary
- Details or operational sequence
- Why this solution fits the problem and constraints
- Tradeoffs
- Expected outcome
- Next steps or validation plan

The full version is for evaluators, humans, and benchmark scoring. It may mention the known solution directly.

### 5. Build The Withheld Version

In `*-withheld-solution.md`, remove the known answer while keeping enough context for a fair generation run.

The `Solution` section should say:

```markdown
This section is intentionally blank for the Doppl run. The agenome should generate a proposed solution using only the problem, purpose, constraints, failed attempts, user, and environment sections above.

### Summary

_To be generated._

### Details

_To be generated._
```

Then ask for the output shape without revealing the answer:

- what action, system, workflow, or protocol should be used
- who takes each action
- when the response happens
- what technology or process is involved
- how the approach avoids the failed attempts
- how the approach handles each listed constraint

Do not include hints that point directly at the known solution.

### 6. Leak Check The Withheld Version

Before finalizing, search the withheld file for answer terms and near-synonyms from the known solution.

Check for:

- Unique object names, phrases, tools, or mechanisms from the known answer.
- Action verbs that reveal the solution.
- Expected outcome language that only makes sense if the answer is known.
- Next steps that instruct the model toward the answer.
- Source, visibility, or notes text that accidentally names the answer.

If a detail is necessary for the problem to be solvable, keep it. If it narrows too strongly toward the known answer, generalize it.

The withheld version should make the benchmark fair: hard enough to test reasoning, not spoiled by scaffolding.

### 7. Quality Bar

A finished case study should satisfy these checks:

- A stranger can understand the problem without reading the transcript.
- The constraints explain why obvious answers fail.
- Failed attempts are concrete, not straw men.
- The user and environment sections make the operating context real.
- The full version contains the answer and its reasoning.
- The withheld version contains no solution leakage.
- The open questions make clear what more information would improve the case.
- The visibility section makes sharing boundaries explicit.
- The files are useful as both human-readable documentation and Doppl evaluation artifacts.

## Naming

Use short, descriptive, lowercase file names:

- `domain-problem-with-solution.md`
- `domain-problem-withheld-solution.md`
- `domain-problem-case-study.md` when there is no known solution

Prefer nouns from the actual case over generic titles.

## Style

Write in clear markdown prose. Avoid overfitting to transcript wording, but preserve domain-specific details that matter. Do not sanitize away the interesting constraints. Do not add invented facts. If you infer something, mark it as an assumption or open question.

The best output should feel like a case file: readable, grounded, anonymized where needed, and sharp enough to test whether an agent can produce a useful solution.
