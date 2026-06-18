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
| `polymath` | 1 | — *(progenitor `rule-of-cool`)* | **domain-transfer** mutagen (the 4th operator class) · import a proven mechanism from field B to crack field A — the Medici Effect | Lα / L1 (ideation) | coined | [`.cursor/skills/polymath/`](../.cursor/skills/polymath/SKILL.md) + crucible `ARCHETYPE_POOL["polymath"]` | The Renaissance man. Skill-backed crystallization of the older `transfer-hunter` archetype (organ re-evolved → promoted). Recessive `first-principles` + `breakout` alleles. No verdicts yet. |
| `addition-by-subtraction` | 1 | — *(progenitor `rule-of-cool`)* | **valence-flip** mutagen (convergent axis) · convergent best-ADD → convergent best-CUT — the highest-leverage removal (via-negativa) | Lα / L1-L2 (ideation, design, editing) | coined | [`.cursor/skills/addition-by-subtraction/`](../.cursor/skills/addition-by-subtraction/SKILL.md) + crucible `ARCHETYPE_POOL["addition-by-subtraction"]` | The sculptor. Truest sibling of `breakthrough` (pure up→down flip, stays convergent); completes the 2×2. Recessive `blindside` + `breakthrough` alleles. No verdicts yet. |

## Convergence watch

Organs to watch for re-evolving independently across spikes (promote to shared apex skill when
two unrelated lineages grow them — [Convergent skills](../LESSONS_AND_BANGERS.md#convergent-skills--2026-06-17)):

- **uncle-questioner** — the nurture/clarifying-question organ (inter-stratum, down).
- **falsifier-audit** — the wolf-hunter organ that writes its own check ([Personality ecology](../LESSONS_AND_BANGERS.md#personality-ecology--2026-06-17)).
- **harness-runner** — the L3 instrument that runs a spike and emits a comparable trace.
- **collapse/distill** — the Lα organ that folds a dead aphenome into a register entry or skill allele.

None promoted yet — recorded so the convergence is *recognized* when it appears, not reinvented.

## The convergence × valence 2×2 (now complete)

Four of the seven skills tile a clean 2×2 of convergence × valence; the other two
(`first-principles` = basis-transform, `constraint-injection` = scarcity-operator) sit *off* it as
different operator classes — which is the point: the **mutagen catalog**, not the 2×2, is the real
generating set.

|  | **up (treasure / add)** | **down (trap / cut)** |
| --- | --- | --- |
| **convergent** (one best) | `breakthrough` — best thing to **add** | `addition-by-subtraction` — best thing to **cut** *(coined 2026-06-18)* |
| **divergent** (off-path) | `breakout` — paradigm-escaping zag | `blindside` — non-obvious failure mode |

**Mutagen-operator catalog (4 observed):** `valence-flip` (→ breakout / blindside / addition-by-subtraction),
`basis-transform` (→ first-principles), `scarcity-operator` (→ constraint-injection), and
**`domain-transfer`** (→ polymath) — the catalog is **open**, not closed at three. `polymath` also confirms
the *organ-promotion* path: the `transfer-hunter` archetype re-evolved into a skill (cf. Convergence watch).

> **Emergent voicings (watch, don't pre-name):** a *recurring, reusable* combination of mutagens we didn't
> design but that keeps winning would be **emergent behavior**, not a planned noun. Recorded here so it's
> *recognized* if it appears in trials (cf. Convergence watch); the per-problem assignment is just the
> `spawn plan` until then.

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
