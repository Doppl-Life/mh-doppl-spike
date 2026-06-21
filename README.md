# Doppl — Idearganism Spike Ecology

A self-replicating idea organism: a population of agents under selection pressure that evolves toward non-obvious, verifiable ideas. This repo is the **ecology** — meta-narrative and lineage logs at the root, mortal experiments (spikes) below.

> **Lα lives here.** The root is the witness layer — the conversation *about* the organism. Spikes are mortal; the lineage log survives.

> **Crucible ↔ Prime.** This repo (`doppl-test`) is the **crucible** — where crazy ideas are tried. **[`doppl-prime`](/Users/michaelhabermas/repos/GAI/DOPPL/doppl-prime)** (`github.com/Doppl-Life/doppl-prime`) is the **canonical, production-bound repo** — the official docs and the binding source of truth (`ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`, `docs/planning/`, gap-audits), where surviving ideas go to get built and tested for real. Measure crucible work against prime. See [AGENTS.md § Doppl Prime](./AGENTS.md#doppl-prime--the-canonical-landing-place) and [GLOSSARY](./GLOSSARY.md#doppl-prime-doppl-prime).

## Layout

```
doppl-test/
  PROPOSAL.md                  ← team planning doc (Capstone Deliverable 01)
  PRD.md                       ← product requirements (stories, AC, KPIs, roadmap)
  ARCHITECTURE.md              ← what we're building and the form
  TREATISE.md                  ← living meta-narrative (philosophy + architecture)
  DIAGRAMS.md                  ← high-level visual map (how it all relates)
  GLOSSARY.md                  ← the evolving lexicon
  LESSONS_AND_BANGERS.md       ← meta-concepts that reframe the problem
  HEURISTICS.md                ← the tribe's instincts (portable moves + traps; priors for the Fusants)
  MEMORY.md                    ← fork register (paths chosen / deferred)
  BUGS_AND_MITIGATIONS.md      ← reward-hack + crash register (amemetic immune memory)
  AGENTS.md                    ← capture/routing rules for this spike
  Doppl_Capstone_Proposal_volume_2.txt   ← seed proposal
  bedrock/                     ← immovable anchor (checks + Agora verdict schema)
  case-studies/                ← fixture corpus + subtype lab (transfer, zeitgeist, unlock clusters)
  kernel-rebuild/              ← active self-contained kernel rebuild workspace
  skills/                      ← skill lineage registry
  harness/                     ← (embryology) run all spikes, compare traces
  render.yaml                  ← deploy (serves the Agarden hub)
  spikes/
    agenotype/                  ← Gen-0 fusion demo: breed child on blind spots
    crucible/                   ← belief-revision sibling spawner (built)
    discovery/                  ← source radar: harvest opportunities into typed seeds
    knowledge-space/            ← durable graph/vector memory for real Doppl runs
    least-action/               ← mechanism-economy calibration for Least-Action Fitness
```

## Read order

1. [`PROPOSAL.md`](./PROPOSAL.md) — team plan: problem, approach, scope, demo (start here for capstone)
2. [`PRD.md`](./PRD.md) — requirements: user stories, acceptance criteria, KPIs, phased rollout
3. [`ARCHITECTURE.md`](./ARCHITECTURE.md) — technical form: closed loop, primitives, schemas, build plan
4. [`case-studies/`](./case-studies/) — concrete fixtures for `cross_domain_transfer` vs `zeitgeist_synthesis`; where the why-now / unlock-cluster doctrine is executable
5. [`Doppl_Capstone_Proposal_volume_2.txt`](./Doppl_Capstone_Proposal_volume_2.txt) — the original seed bet
6. [`TREATISE.md`](./TREATISE.md) — where the thinking is now (strata, uncle/nephew, amemetics, Lα)
7. [`DIAGRAMS.md`](./DIAGRAMS.md) — the same thing, drawn (start here if you're visual)
8. [`LESSONS_AND_BANGERS.md`](./LESSONS_AND_BANGERS.md) — the gems, atomized
9. [`kernel-rebuild/`](./kernel-rebuild/) — active rebuild workspace: kernel spine, runnable artifact, operational watchlist, lineage ledger contract
10. [`MEMORY.md`](./MEMORY.md) / [`BUGS_AND_MITIGATIONS.md`](./BUGS_AND_MITIGATIONS.md) — forks and falsifiable hazards
11. [`HEURISTICS.md`](./HEURISTICS.md) — the tribe's instincts: portable problem-solving moves + traps, condensed as priors

## Run a spike

Each spike is self-contained with its own README, deps, and runner:

```bash
cd spikes/agenotype && ./demo     # fusion demo: breed child on blind spots
cd spikes/crucible  && ./demo     # belief-revision crucible (try --html, --dissent 0.6)
cd spikes/least-action && ./demo  # offline calibration: frugal vs overbuilt vs unsafe
# follow each spike's README for first-time setup
```

## The model in one breath

Tree (L1–L4): ideation → deliberation → instrumentation → adjudication, with spawn/nurture flowing down and artifacts/maturation flowing up. **Lα** (this root, plus us) watches the whole thing, sifts lessons, and decides what replicates. Spikes spider out, collapse to lessons, and die. The lineage log is the genome that outlives any organism.
