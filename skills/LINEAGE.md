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
| `rule-of-cool` (aka **breakthrough**) | 0 | — | — (gen-0 seed); **phenotype renamed Rule of Cool → Breakthrough 2026-06-18** — lineage id conserved, children still point at `parent: rule-of-cool` | Lα (witness/reframe) | stable | [`.cursor/skills/breakthrough/`](../.cursor/skills/breakthrough/SKILL.md) | Progenitor of the repo ([AGENTS.md](../AGENTS.md)); "cool uncle at Lα" ([TREATISE § VIII](../TREATISE.md#viii-the-search-for-better-definitions-of-better)). No Agora verdicts yet. |
| `breakout` | 1 | — *(progenitor `rule-of-cool`)* | **valence-flip** mutagen · valence flip (divergence fork): convergent single-best → **divergent-UP** — drop the feasibility filter, crank variance, hunt the paradigm-escaping zag | Lα / L1 (ideation) | coined | [`.cursor/skills/breakout/`](../.cursor/skills/breakout/SKILL.md) + crucible `ARCHETYPE_POOL["breakout"]` | The nephew. Sibling of `blindside`. No verdicts yet. |
| `blindside` | 1 | — *(progenitor `rule-of-cool`)* | **valence-flip** mutagen · valence flip (divergence fork): convergent single-best → **divergent-DOWN** — hunt the non-obvious failure mode / opportunity cost (invested uncle, not gloating critic) | Lα / L1-L2 (ideation, deliberation) | coined | [`.cursor/skills/blindside/`](../.cursor/skills/blindside/SKILL.md) + crucible `ARCHETYPE_POOL["blindside"]` | The uncle. Sibling of `breakout`; convergence candidate with the watched **uncle-questioner** / **falsifier-audit** organs. No verdicts yet. |
| `first-principles` | 1 | — *(progenitor `rule-of-cool`)* | **basis-transform** mutagen · convergent single-best addition → **reduction-to-bedrock** — discard inherited frames, expose invariants, rebuild only from what must be true | L0 / Lα (foundations, ideation) | coined | [`.cursor/skills/first-principles/`](../.cursor/skills/first-principles/SKILL.md) | Subtract-then-rebuild fork. Recessive `blindside` + `breakout` alleles. No verdicts yet. |
| `constraint-injection` | 1 | — *(progenitor `rule-of-cool`)* | **scarcity-operator** mutagen · convergent single-best addition → **productive constraint** — add the pressure that forces specificity, taste, and testability | Lα / L1-L2 (ideation, design, execution) | coined | [`.cursor/skills/constraint-injection/`](../.cursor/skills/constraint-injection/SKILL.md) | Productive-scarcity fork. Recessive `first-principles` + `blindside` alleles. No verdicts yet. |

## Convergence watch

Organs to watch for re-evolving independently across spikes (promote to shared apex skill when
two unrelated lineages grow them — [Convergent skills](../LESSONS_AND_BANGERS.md#convergent-skills--2026-06-17)):

- **uncle-questioner** — the nurture/clarifying-question organ (inter-stratum, down).
- **falsifier-audit** — the wolf-hunter organ that writes its own check ([Personality ecology](../LESSONS_AND_BANGERS.md#personality-ecology--2026-06-17)).
- **harness-runner** — the L3 instrument that runs a spike and emits a comparable trace.
- **collapse/distill** — the Lα organ that folds a dead aphenome into a register entry or skill allele.

None promoted yet — recorded so the convergence is *recognized* when it appears, not reinvented.

## Open cells — mutagens named, not yet forked

Pointed at deliberately so the gaps are *visible* (not built — the current five are the first trial cohort).
The skill family currently tiles a 2×2 of convergence × valence with one corner empty, plus one
high-value operator that already exists as an *archetype* but not yet as a *skill*:

|  | **up (treasure)** | **down (trap / cut)** |
| --- | --- | --- |
| **convergent** (one best) | `breakthrough` — best thing to **add** | **`subtraction`** *(open)* — best thing to **cut** |
| **divergent** (off-path) | `breakout` — paradigm-escaping zag | `blindside` — non-obvious failure mode |

- **`subtraction`** *(convergent-DOWN, open)* — the empty corner. Converges on the single highest-leverage
  *removal* — the load-bearing thing to delete (via-negativa / "the best part is no part"). Mutagen class:
  **valence-flip** (the pure up→down flip of `breakthrough`, staying convergent — the truest sibling).
  Distinct from `blindside` (which hunts *risk*) and `constraint-injection` (which *adds* pressure); this
  *removes mass*. Working names: `subtraction` / `via-negativa` / `the-cut`. Not built.
- **`transfer`** *(cross-domain transplant, open — but half-evolved)* — find a technique/result in field A
  that cracks an open problem in field B. The **Doppl proposal's #1 breakthrough move** ("transfer …
  the move behind most real breakthroughs"). Mutagen class: a **new** operator — **domain-transfer**
  (not valence-flip / basis-transform / scarcity). **Already exists as the `transfer-hunter` archetype**
  in the crucible `ARCHETYPE_POOL` — so crystallizing it into a skill is low-cost, high-value (an organ
  re-evolving → promotion candidate, cf. Convergence watch). Working names: `transfer` / `transplant`. Not built.

`first-principles` (basis-transform) and `constraint-injection` (scarcity-operator) sit *off* this 2×2 —
they are different operator classes, not compass corners. That's the point: the **mutagen catalog** is the
real generating set, and the 2×2 is only one slice of it.

## Carry forward

- **First realized mutation (2026-06-18):** the **divergence fork** — `breakout` + `blindside`, gen-1
  children of `rule-of-cool` via *valence flip* (Cool converges on one best addition; the children
  diverge UP toward treasure and DOWN toward traps). They are a sibling pair sharing one skeleton;
  the mutation is the sign of the valence. Watch whether Agora verdicts show divergence-skills
  sprout well but fruit weakly (predicted by the PRM/ORM homology). See [MEMORY fork](../MEMORY.md).
- Each child is **heterozygous**: a dominant valence + a recessive opposite-valence allele that
  flashes rarely (the "recessive flash" clause). If verdicts show the recessive flash earns its keep,
  it's a candidate to promote into Rule of Cool itself.
- Still-open mutation candidate: a **stratum-specialized Rule of Cool** — e.g. `rule-of-cool-fed`
  (the `--fed` Frontend Design Mode already living inside the seed) split out as a gen-1 child.
  Only do it if Agora verdicts show the split earns its own keep.
- Keep `stratum` descriptive; let the L1–L2 / L2–L3 / L3–L4 / Lα families **emerge** ([Open Q #8](../TREATISE.md#x-open-questions-edit-here)).
