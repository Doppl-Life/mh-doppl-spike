# Doppl — Idearganism Spike Ecology

A self-replicating idea organism: a population of agents under selection pressure that evolves toward non-obvious, verifiable ideas. This repo is the **ecology** — meta-narrative and lineage logs at the root, mortal experiments (spikes) below.

> **Lα lives here.** The root is the witness layer — the conversation *about* the organism. Spikes are mortal; the lineage log survives.

## Layout

```
doppl-test/
  TREATISE.md                  ← living meta-narrative (philosophy + architecture)
  DIAGRAMS.md                  ← high-level visual map (how it all relates)
  GLOSSARY.md                  ← the evolving lexicon
  LESSONS_AND_BANGERS.md       ← meta-concepts that reframe the problem
  MEMORY.md                    ← fork register (paths chosen / deferred)
  BUGS_AND_MITIGATIONS.md      ← reward-hack + crash register (amemetic immune memory)
  AGENTS.md                    ← capture/routing rules for this spike
  Doppl_Capstone_Proposal_volume_2.txt   ← seed proposal
  render.yaml                  ← deploy (serves the agenotype fusion demo web app)
  spikes/
    agenotype/                  ← Gen-0 fusion demo: breed child on blind spots
    crucible/                   ← belief-revision sibling spawner (built)
```

## Read order

1. [`Doppl_Capstone_Proposal_volume_2.txt`](./Doppl_Capstone_Proposal_volume_2.txt) — the seed bet
2. [`TREATISE.md`](./TREATISE.md) — where the thinking is now (strata, uncle/nephew, amemetics, Lα)
3. [`DIAGRAMS.md`](./DIAGRAMS.md) — the same thing, drawn (start here if you're visual)
4. [`LESSONS_AND_BANGERS.md`](./LESSONS_AND_BANGERS.md) — the gems, atomized
5. [`MEMORY.md`](./MEMORY.md) / [`BUGS_AND_MITIGATIONS.md`](./BUGS_AND_MITIGATIONS.md) — forks and falsifiable hazards

## Run a spike

Each spike is self-contained with its own README, deps, and runner:

```bash
cd spikes/agenotype && ./demo     # fusion demo: breed child on blind spots
cd spikes/crucible  && ./demo     # belief-revision crucible (try --html, --dissent 0.6)
# follow each spike's README for first-time setup
```

## The model in one breath

Tree (L1–L4): ideation → deliberation → instrumentation → adjudication, with spawn/nurture flowing down and artifacts/maturation flowing up. **Lα** (this root, plus us) watches the whole thing, sifts lessons, and decides what replicates. Spikes spider out, collapse to lessons, and die. The lineage log is the genome that outlives any organism.
