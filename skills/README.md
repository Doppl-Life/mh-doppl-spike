# skills/ — the skill lineage registry (Lα / shared culture)

Skills are **convergent organs** ([TREATISE § VIII-b](../TREATISE.md#viii-b-convergent-skills--evolutionary-strategies-not-just-ideas)):
evolutionary strategies — eyes, wings, claws — that re-evolve per stratum because the niche
demands the same function. They are the most *actionable* layer of the collapse pipeline: when a
mortal spike dies, what survives is sometimes a lesson, sometimes an agenome patch, and
sometimes a **skill** the next host can load and run.

This folder is **not where skills are stored** — it is where their **lineage is tracked.**

## The split: expression lives in host dirs, lineage lives here

A skill file (`SKILL.md` + optional scripts) is an **expression** that a *host* discovers and
runs — Cursor reads `.cursor/skills/`, Claude reads `.claude/skills/`, Codex reads `.codex/skills/`.
That is the "same agenome, different host expression" rule from [TREATISE § VI](../TREATISE.md#vi-heredity--agenome-aphenome-extended-aphenotype)
(`AGENTS.md` ↔ `claude.md` `@import`). We deliberately **do not** move every skill into one tree
or symlink them around — the host dirs *are* the regulatory network, and they stay put.

What outlives any single expression is the **lineage**: who its parent was, what mutation
produced it, what evidence promoted it. That is heritable; the file is mortal. So:

- **Expression** → `.cursor/skills/<name>/SKILL.md`, `.claude/skills/<name>/`, etc. (host-discovered)
- **Lineage** → [`LINEAGE.md`](./LINEAGE.md) in this folder (the studbook)
- **Self-description** → a `lineage:` block in each skill's own frontmatter (so an organ carries its own pedigree)

If a skill ever needs a home that no host owns yet, it can live at `skills/<name>/SKILL.md` here —
but the registry, not the storage location, is the point.

## Lineage frontmatter convention

Every skill under selection carries this block (host loaders ignore unknown keys):

```yaml
lineage:
  id: rule-of-cool          # stable lineage id
  parent: null              # parent lineage id, or null for a gen-0 root
  generation: 0             # 0 = ancestral seed
  mutation: null            # one line: what changed from the parent (null for roots)
  stratum: "Lα"             # OBSERVED, not enforced — where it has tended to express
  status: stable            # coined | working | stable | deprecated
  bedrock: []               # verdict/evidence refs that promoted or pruned it
```

`stratum` is an **observation, not a partition.** We do not pre-carve an L1–L2 / L2–L3 / L3–L4 / Lα
skill taxonomy ([Open Q #8](../TREATISE.md#x-open-questions-edit-here)); we let families **emerge** as
spikes run and the same organ reappears, then record the convergence. Premature taxonomy is the
enemy.

## How a skill evolves (mutation · divergence · convergence)

- **Mutation** — a child skill with `parent` set and a one-line `mutation`. Generation += 1.
- **Divergence (fork)** — two children of one parent specialize in different directions; both get
  rows, same parent, different `mutation`.
- **Convergence** — two *unrelated* lineages independently grow the same organ (the uncle-questioner,
  the falsifier-audit, the harness-runner). Note it: convergence is the signal to **promote** to a
  shared apex skill. Eyes evolved many times.
- **Death** — a skill that stops earning is marked `deprecated` (point to its successor); the file
  may be pruned, the lineage row stays. Lineage log survives; the organism doesn't.

## The loop that closes with the Agora

This is why the registry matters: **the Agora's verdicts select on skills, not just on ideas.**

```
skill expresses ──► produces ideas in a run ──► Agora posts (sprout/afrit)
        ▲                                              │
        │                                       verdicts logged
        │                                              │
        └──── promote / mutate / deprecate ◄───── attribute verdict
              (recorded in LINEAGE.md bedrock col)    to source skill
```

A skill whose ideas keep earning `novel`/`feasible` verdicts ([bedrock/signal](../bedrock/signal/README.md))
earns the right to spawn mutated children and gets more energy budget; one whose ideas draw
`derivative`/`not-it` starves toward `deprecated`. The verdict's `kind` matters: a skill can be a
strong **sprouter** (great process/generativity) but bear weak **afrits** (poor conclusions) — those
are different fitnesses, so a skill's `bedrock` evidence should track them separately.

**Gate before propagate:** a new/mutated skill is promoted only if its verdicts correlate with
bedrock — otherwise it's [memetic cancer](../BUGS_AND_MITIGATIONS.md), archived not promoted.

## Status

`embryology` — the convention + studbook exist; the verdict→lineage metabolizer does not. Start
by hand: when a spike collapses into a skill, add a `LINEAGE.md` row and a `lineage:` block.
Automate only once there are enough verdicts to bother.
