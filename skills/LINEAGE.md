# Skill Lineage — the studbook

The heritable record of every skill under selection: pedigree, mutation, observed stratum,
status, where it currently expresses, and the bedrock evidence that promoted or pruned it.
Files are mortal; this log survives. See [`README.md`](./README.md) for the convention.

**Add a row when:** a spike collapses into a skill, a skill is mutated/forked, or two lineages
converge on the same organ. **Edit a row when:** status changes (promotion, deprecation) or new
[Agora verdict](../bedrock/signal/README.md) evidence accrues.

## Roster

| Lineage id | Gen | Parent | Mutation (what changed) | Stratum (observed) | Status | Expresses at | Bedrock evidence |
| ---------- | --- | ------ | ----------------------- | ------------------ | ------ | ------------ | ---------------- |
| `rule-of-cool` | 0 | — | — (gen-0 seed) | Lα (witness/reframe) | stable | [`.cursor/skills/rule-of-cool/`](../.cursor/skills/rule-of-cool/SKILL.md) | Progenitor of the repo ([AGENTS.md](../AGENTS.md)); "cool uncle at Lα" ([TREATISE § VIII](../TREATISE.md#viii-the-search-for-better-definitions-of-better)). No Agora verdicts yet. |

## Convergence watch

Organs to watch for re-evolving independently across spikes (promote to shared apex skill when
two unrelated lineages grow them — [Convergent skills](../LESSONS_AND_BANGERS.md#convergent-skills--2026-06-17)):

- **uncle-questioner** — the nurture/clarifying-question organ (inter-stratum, down).
- **falsifier-audit** — the wolf-hunter organ that writes its own check ([Personality ecology](../LESSONS_AND_BANGERS.md#personality-ecology--2026-06-17)).
- **harness-runner** — the L3 instrument that runs a spike and emits a comparable trace.
- **collapse/distill** — the Lα organ that folds a dead aphenome into a register entry or skill allele.

None promoted yet — recorded so the convergence is *recognized* when it appears, not reinvented.

## Carry forward

- First mutation candidate: a **stratum-specialized Rule of Cool** — e.g. `rule-of-cool-fed`
  (the `--fed` Frontend Design Mode already living inside the seed) split out as a gen-1 child
  with `parent: rule-of-cool`, `mutation: "scoped to frontend-design exploration"`. Only do it if
  Agora verdicts show the split earns its own keep.
- Keep `stratum` descriptive; let the L1–L2 / L3–L4 / Lα families **emerge** ([Open Q #8](../TREATISE.md#x-open-questions-edit-here)).
