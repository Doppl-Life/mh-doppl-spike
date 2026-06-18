# Doppl — Architecture

**Companion to:** [`PROPOSAL.md`](./PROPOSAL.md) (team planning document)  
**Status:** early proposal · Jun 17, 2026

What we're building, how the pieces connect, and the form they take in code and docs.

### System at a glance

```mermaid
flowchart TB
  subgraph meta [Lα — witness layer]
    Registers["Registers · treatise · proposal"]
    Agora["The Agora<br/>async human channel"]
    Skills["Skill lineage studbook"]
  end

  subgraph runtime [Running organism — L1 to L4]
  direction TB
    L1["L1 Ideation"]
    L2["L2 Deliberation"]
    L3["L3 Instrumentation"]
    L4["L4 Adjudication"]
    L1 --> L2 --> L3 --> L4
  end

  subgraph spikes [Mortal spawncidences]
    Agenotype["agenotype<br/>Fusion + breed"]
    Crucible["crucible<br/>Belief revision"]
  end

  subgraph bedrock [Bedrock — immovable anchor]
    RepoCheck["Repo integrity"]
    VerdictLedger["Verdict ledger"]
    PaperBets["Paper-bets / reality"]
  end

  spikes --> runtime
  runtime --> bedrock
  bedrock -->|energy payout| runtime
  meta -.->|observes| runtime
  spikes -->|sprouts + afrits| Agora
  Agora --> VerdictLedger
  PaperBets --> VerdictLedger
  Registers -.->|collapse| Skills
```

---

## 1. The organism

Doppl is not an agent. It is an **idearganism** — a population under selection pressure that evolves toward non-obvious, verifiable ideas.

### The tree (L1–L4) and Lα (outside it)

```mermaid
flowchart TB
  subgraph witness [Lα Witness — outside the tree]
    Lalpha["Conversation · treatise · Lαlphα peers<br/>observes · does not compete inside L1–L4"]
  end

  subgraph tree [The Tree — L1 through L4]
    direction TB
    L4["L4 Adjudication<br/>bedrock · prune · allocate"]
    L3["L3 Instrumentation<br/>run cards · results · energy accounting"]
    L2["L2 Deliberation<br/>loop topologies compete · spawner-spawners"]
    L1["L1 Ideation<br/>agenomes · Fusants · debate"]
    L1 <-->|jurisdiction| L2
    L2 <-->|jurisdiction| L3
    L3 <-->|jurisdiction| L4
  end

  Lalpha -.->|observes only| tree
```

| Stratum | Question | Role |
|---------|----------|------|
| **L1 Ideation** | What's the idea? | Agenomes, debaters, personas |
| **L2 Deliberation** | Should we? What does "better" mean here? | Loop topologies, spawner-spawners |
| **L3 Instrumentation** | What are we testing? | Harness, rubrics, run cards, energy accounting |
| **L4 Adjudication** | Did it pass? Who lives? | Bedrock, held-out judges, pruning |
| **Lα Witness** | Does the lesson make sense? What replicates? | Observes L1–L4; does not compete inside them |

**Lα is One of Us** — human team members and the agentic participant are peers (`Lαlphα`). Lα has its own intraspecies peer fights one rung of abstraction up (Fusants at Lα).

### Two geometries (do not conflate)

```mermaid
flowchart LR
  subgraph intra [Intraspecies — peers at same stratum]
    direction LR
    TH["Transfer Hunter"]
    FH["Feasibility Hawk"]
    FZ["Falsifier"]
    TH <-->|same scarce resource| FH
    FH <-->|debate| FZ
  end

  subgraph inter [Inter-stratum — uncle and nephew]
    direction TB
    Uncle["Uncle down<br/>questions · nurture · budget"]
    Nephew["Nephew up<br/>artifacts · honest reports"]
    Uncle --> Nephew
  end
```

| Geometry | Who | What moves |
|----------|-----|------------|
| **Intraspecies** (peers at same stratum) | Transfer Hunter vs Feasibility Hawk, crucible debaters | Same scarce resource — the idea, the rubric, the budget. Vicious, high combinatorics. |
| **Inter-stratum** (uncle/nephew) | Asymmetric nurture and judgment up/down the tree | Different payload types. Down = uncle questions; up = nephew reports. |

Cross-stratum communication is **jurisdiction** — typed handoffs, not free conversation.

See [`TREATISE.md`](./TREATISE.md) § II–III for full narrative.

---

## 2. The closed loop

Everything we build serves one reproductive economy:

```mermaid
flowchart TB
  subgraph spawn_layer [Spawn and express]
    Fusion["Fusion reproduction<br/>agenotype + crucible"]
    Ideas["Sprouts · Afrits"]
    Fusion --> Ideas
  end

  subgraph signal_layer [Bedrock signal]
    Agora["The Agora<br/>async · non-blocking"]
    Reality["Reality / paper-bets<br/>automatic adversary"]
    Ledger["Verdict ledger<br/>bedrock/signal"]
    Agora -->|human verdict| Ledger
    Reality -->|world verdict| Ledger
  end

  subgraph control_layer [Selection and inheritance]
    Energy["Energy budget"]
    RK["r/K allocation<br/>budgeted bandit"]
    Lineage["Skill lineage<br/>promote · mutate · seed-bank"]
    Ledger --> Energy --> RK --> Lineage
  end

  Ideas --> Agora
  Lineage --> Fusion
  Homology["Homology<br/>metaphor × mechanism"] -.->|new primitives| Fusion
  Agora -.->|gates real-world actions| Reality
```

**Walkthrough:**

1. **Spawn / Fusion** — competing loop topologies (`agenotype`, `crucible`) produce ideas under selection. Two parent agenomes fuse; offspring inherit and mutate on blind spots, not critic tone.
2. **Sprouts and afrits** — a run throws off process-ideas (sprouts) and outcome-ideas (afrits). Different judges, different energy ledgers.
3. **The Agora** — async channel (Slack/Discord). Humans react without blocking the organism. Verdicts log to `bedrock/signal/verdicts.jsonl`.
4. **Reality / paper-bets** — pre-registered predictions resolved by time. `reactor: "world"`. The free automatic adversary.
5. **Energy budget** — verdicts pay out as tokens/compute/money. Success feeds the lineage; failure starves (demote, don't delete).
6. **r/K allocation** — fast-cheap-many (r) vs slow-expensive-few (K) per stratum-transition. Classical ML bandit over heterogeneous arm costs.
7. **Skill lineage** — convergent organs tracked in [`skills/LINEAGE.md`](./skills/LINEAGE.md). Agora verdicts select on skills: promote, mutate, or seed-bank.
8. **Homology** — metaphor ↔ ML mechanism congruence generates the next primitives (sprout/afrit = PRM/ORM, amemetics = adversarial training, etc.).

---

## 3. Core primitives

### Component map

```mermaid
flowchart LR
  subgraph heredity [Heredity]
    Agenome["Agenome<br/>JSON recipe"]
    Aphenome["Aphenome<br/>one run trace"]
    Skill["Skill lineage<br/>convergent organ"]
  end

  subgraph reproduction [Reproduction]
    Crossover["Agenome crossover"]
    OutFusion["Output fusion"]
    BlindSpot["Breed on blind spots"]
    Crossover --> OutFusion --> BlindSpot
  end

  subgraph selection [Selection]
    Council["Critic council<br/>Fusants + disagreeableness"]
    Judge["Held-out judge"]
    Council --> Judge
  end

  Agenome --> reproduction
  reproduction --> Aphenome
  Aphenome -.->|collapse| Skill
  Aphenome --> selection
```

### Agenome

Serialized agent genome — the heritable recipe.

```json
{
  "id": "transfer-hunter",
  "name": "Transfer Hunter",
  "model": "deepseek/deepseek-v4-flash",
  "personas": ["veteran engineer hunting cross-domain analogies"],
  "ranking_rubric": "...",
  "output_contract": "...",
  "primary_mandate": [],
  "parent_ids": [],
  "generation": 0
}
```

Implementation: [`spikes/agenotype/agenome.py`](./spikes/agenotype/agenome.py). Generation-0 seed = Rule of Cool chromosomalized.

### Aphenome

One run's expressed behavior — answers, debate, trace, token spend. Mortal. Collapses to lessons, skills, or agenome patches on death.

### Metabolism / energy budget

Finite token/compute allowance per spawncidence. Hard cap (e.g. `SPAWNCIDENCE_CAP = 5` in crucible) plus earned budget. Death-by-low-energy is the default prune. **Demote-don't-delete** on single bad outcomes; **autopsy** before permanent death; **seed bank** for dormant lineages.

### Fusion reproduction

- **Agenome crossover** — splice personas, rubrics, mandates from two parents.
- **Output fusion** — judge synthesizes parent reasoning into offspring.
- **Breed on blind spots** — offspring mandate targets `blind_spots ∪ clarifying_questions`, not "try harder."

### Critic council (Fusants)

Panel of debaters with distinct mandates (Transfer Hunter, Feasibility Hawk, Falsifier, Contrarian, etc.). Each carries a **disagreeableness dial** (`0..1`) — resistance to convergence-for-its-own-sake. Judge distinguishes `consensus_quality: resolved|herded|mixed` and caps scores when the room herded.

### Bedrock ladder

```mermaid
flowchart BT
  B1["Check 1 · Repo integrity<br/>executable path invariants"]
  B2["Check 2 · Agora judgment<br/>human verdict ledger"]
  B3["Check 3 · Reality<br/>paper-bets · calibration"]
  B1 --> B2 --> B3

  Anchor["Bedrock anchor<br/>objective may evolve · anchor may not move"]
  B3 -.-> Anchor
```

| Level | Check | Anchor |
|-------|-------|--------|
| 1 | Repo integrity | Executable path invariants |
| 2 | Agora human judgment | Verdict ledger — attributed, dimension-typed reactions |
| 3 | Reality / paper-bets | Pre-registered predictions, calibration-scored |

The objective may evolve; bedrock may not move.

### The Agora + verdict schemas

```mermaid
sequenceDiagram
  participant Org as Organism run
  participant Chan as Agora channel
  participant Human as Agardener
  participant World as Reality
  participant Led as verdicts.jsonl
  participant Met as Energy budget

  Org->>Chan: post sprout or afrit + provenance
  Note over Org: continues without blocking
  Human-->>Chan: react dimension + because
  Chan->>Led: append human verdict
  World-->>Led: append reality verdict at resolve
  Led->>Met: payout or demote lineage
```

**Post** (organism → channel):

```json
{
  "post_id": "p_2026-06-17_0001",
  "spawncidence_id": "crucible:run_42:node_3",
  "source_agenome": "transfer-hunter×feasibility-hawk:gen2",
  "kind": "sprout",
  "context": "...",
  "idea": "...",
  "internal_score": 7.5,
  "cost_usd": 0.0031,
  "trace_link": "...",
  "ts": "2026-06-17T20:00:00Z",
  "exploration": false
}
```

**Verdict** (reactor → ledger):

```json
{
  "post_id": "p_2026-06-17_0001",
  "spawncidence_id": "crucible:run_42:node_3",
  "kind": "sprout",
  "reactor": "mike",
  "dimension": "novel",
  "because": "...",
  "weight": 1.0,
  "ts": "2026-06-17T20:14:00Z"
}
```

`reactor` may be a human name or `"world"` / `"world/price"` for reality-verdicts.

Full spec: [`bedrock/signal/README.md`](./bedrock/signal/README.md).

### Skill lineage

Pedigree tracked in [`skills/LINEAGE.md`](./skills/LINEAGE.md); expression in host dirs (`.cursor/skills/breakthrough/SKILL.md`). The `name` (phenotype) can drift while the `lineage.id` (genotype) is conserved — the gen-0 seed was renamed Rule of Cool → Breakthrough on 2026-06-18 but keeps `id: rule-of-cool`, and its children still point at `parent: rule-of-cool`. Frontmatter block:

```yaml
name: breakthrough        # phenotype — may drift under selection
lineage:
  id: rule-of-cool        # genotype — conserved ancestral id
  aka: breakthrough
  parent: null
  generation: 0
  mutation: null
  stratum: "Lα"
  status: stable
  bedrock: []
```

---

## 4. First concrete vertical — predictive paper-bet Insight Machine

**Target selection criterion:** hard to find, easy to verify.

```mermaid
flowchart TD
  scout["Target scout<br/>hard to find easy to verify"] --> predict["Prediction + confidence"]
  predict --> prereg["Pre-registered ledger<br/>all calls losers included"]
  prereg --> wait["Time resolves"]
  wait --> score["Calibration score<br/>Brier or similar"]
  score --> verdict["Reality-verdict<br/>reactor world"]
  verdict --> energy["Energy payout"]
  energy --> alloc["r/K allocation"]
```

**Data flow:**

1. **Target scout** — surface domains with verification ≪ discovery cost. Prediction markets are a candidate (short-loop, adversarial price as bedrock). Alzheimer's is the dream, not the on-ramp.
2. **Prediction + confidence** — timestamp the call. The Insight Machine is a **high-precision** instrument (better silent than wrong).
3. **Pre-registration** — append-only ledger. Every call logged before resolution. Cherry-picking without pre-registration is a logged reward hack.
4. **Time resolves** — the future is a free held-out test set. Reality is the automatic adversary.
5. **Calibration eval** — grade whether confidence matches outcome frequency (70%-sure → ~70% true), not raw accuracy.
6. **Reality-verdict → energy → r/K** — winning lineages earn budget; losing lineages demote (not delete on one bad draw).

**Blast-radius dial:** $0 paper → small real bets → real capital. Never adjudicate or play in markets the organism creates.

### r/K metabolism across strata (example: landing pages)

```mermaid
flowchart TB
  subgraph L2L3 ["L2–L3 · r-selected"]
    Gen["Generate many variants"]
    Deploy["Deploy fast · cheap"]
    Gen --> Deploy
  end

  subgraph L3L4 ["L3–L4 · K-selected"]
    Reach["Earn reach · attention economy"]
    Measure["Wait for market signal"]
    Reach --> Measure
  end

  L2L3 -->|promote winners| L3L4
  L2L3 -.->|mass death tolerated| Cull["Cull weak variants"]
  L3L4 -.->|few bets · heavy investment| Nurture["Butterfly-wing uncling"]
```

---

## 5. Repo / code architecture

```mermaid
flowchart TB
  subgraph root [doppl-test — Lα witness layer]
    Proposal["PROPOSAL.md"]
    Arch["ARCHITECTURE.md"]
    Treatise["TREATISE.md · registers · GLOSSARY"]
    Hub["build_index.py → index.html"]
  end

  subgraph bedrock_dir [bedrock/]
    BedrockReadme["README.md"]
    Signal["signal/ · verdict schema"]
  end

  subgraph skills_dir [skills/]
    Lineage["LINEAGE.md studbook"]
  end

  subgraph spikes_dir [spikes/ — mortal organisms]
    Agenotype["agenotype/ BUILT"]
    Crucible["crucible/ BUILT"]
  end

  subgraph embryology [embryology]
    Harness["harness/"]
  end

  root --> bedrock_dir
  root --> skills_dir
  root --> spikes_dir
  spikes_dir --> Hub
  bedrock_dir --> Signal
```

### Parallel spawners (the fork is the prey)

```mermaid
flowchart LR
  Prompt["Fixed prompt suite"]
  Harness2["Shared harness + bedrock"]

  subgraph agenotype_path [agenotype topology]
    Parents["Parent panel"]
    FusionJ["Fusion judge"]
    Breed["Breed on blind spots"]
    Parents --> FusionJ --> Breed
  end

  subgraph crucible_path [crucible topology]
    Debaters["Fusant debaters"]
    Revise["Belief-revision turns"]
    Delta["Revision ledger"]
    Debaters --> Revise --> Delta
  end

  Prompt --> Harness2
  Harness2 --> agenotype_path
  Harness2 --> crucible_path
  agenotype_path --> Traces["HTML traces + hub"]
  crucible_path --> Traces
```

### Built vs to-build

| Built | To-build (2-week target) |
|-------|---------------------------|
| `Agenome` schema + seed personas | Shared harness across spawners |
| Agenotype reproduction on blind spots | Paper-bet pre-registration ledger + calibration scorer |
| Fusion judge + critic council | Agora webhook + verdict listener |
| Crucible belief-revision loop | Energy budget wired to verdict ledger |
| `fusion_trace.html` / `crucible_trace.html` extended aphenotype | Live population-tree visualization |
| Registers as proto-Lα | Bandit spawn allocator (Direction A) |
| RoC skill (generation-0) | Novelty pressure scoring |
| Agarden hub (`build_index.py` → `index.html`) | Multi-generational population loop |

---

## 6. Schemas (reference)

### Run card / ticket (L2–L3 handoff)

Typed contract for an experiment the software factory (or any L3 tool) executes:

```json
{
  "run_id": "rc_001",
  "objective": "Test landing-page variant B against variant A",
  "bedrock_metric": "waitlist_signup_rate",
  "energy_cap_tokens": 50000,
  "money_cap_usd": 0,
  "blast_radius": "dry-run",
  "kill_condition": "zero signups after 48h",
  "spawncidence_id": "crucible:run_42",
  "agenome_id": "feasibility-hawk:gen1"
}
```

`blast_radius`: `dry-run` | `sandboxed` | `real-with-gate` (Agora approval required).

### Pre-registered prediction ledger entry

```json
{
  "prediction_id": "pred_2026-06-17_001",
  "market_or_target": "polymarket:will-x-happen-by-date",
  "predicted_probability": 0.72,
  "confidence_tier": "medium",
  "reasoning_summary": "...",
  "source_spawncidence": "crucible:run_42:node_3",
  "source_agenome": "transfer-hunter:gen2",
  "ts_registered": "2026-06-17T21:00:00Z",
  "ts_resolves": "2026-06-24T00:00:00Z",
  "outcome": null,
  "brier_score": null
}
```

`outcome` and `brier_score` filled at resolution. All entries scored — winners and losers.

---

## 7. Two-week build plan

```mermaid
flowchart LR
  subgraph week1 [Week 1 — prove the loop]
    W1K["Kernel<br/>single-gen Fusion"]
    W1V["Verifier<br/>paper-bet ledger"]
    W1D["Demo<br/>traces + Agora log"]
    W1K --> W1V --> W1D
  end

  subgraph week2 [Week 2 — turn the economy on]
    W2K["Kernel<br/>multi-gen + energy"]
    W2S["Selection<br/>bandit + novelty"]
    W2V["Verifier<br/>held-out rotation"]
    W2D["Demo<br/>live viz Jun 29"]
    W2K --> W2S --> W2V --> W2D
  end

  week1 --> week2
```

### Week 1 — kernel + single generation + paper-bet ledger

| Surface | Deliverable |
|---------|-------------|
| **Kernel** | Single-generation Fusion loop end-to-end on fixed prompt set; generation N vs N+1 comparison |
| **Verifier** | Critic council integrated; pre-registered prediction ledger (append-only JSONL); basic calibration scorer |
| **Demo** | Trace HTML for both spikes; root hub refreshed; manual Agora posts + verdict logging |
| **Selection** | Fixed energy cap per run; manual r/K tagging on stratum transitions |

### Week 2 — economy, allocation, visualization

| Surface | Deliverable |
|---------|-------------|
| **Kernel** | Multi-generational loop (if Week 1 holds); spawn/cull wired to energy |
| **Selection** | Bandit allocator prototype; novelty/diversity scoring |
| **Verifier** | Held-out judge rotation; correlation gate (internal score vs calibration) |
| **Demo** | Population tree + fitness-over-time chart; live demo harness for Jun 29 |

Stretch items (fine-tuning flywheel, real-money bets, software factory) are explicitly deferred.

---

## 8. Safety and governance

```mermaid
flowchart TD
  Idea["Candidate action or bet"]
  Paper{"Blast radius?"}
  AgoraGate{"Agora approval?"}
  Execute["Execute with caps"]
  Ledger["Log verdict"]
  Demote["Demote budget"]
  SeedBank["Seed bank · autopsy"]

  Idea --> Paper
  Paper -->|$0 paper| Ledger
  Paper -->|sandboxed| AgoraGate
  Paper -->|real-with-gate| AgoraGate
  AgoraGate -->|approved| Execute
  AgoraGate -->|denied| Demote
  Execute --> Ledger
  Ledger -->|repeat failure| Demote
  Demote --> SeedBank
```

| Principle | Implementation |
|-----------|----------------|
| **Agora gate** | No real-world side effects without human approval (async, non-blocking for the organism) |
| **Blast-radius classes** | `dry-run` → `sandboxed` → `real-with-gate` on every run card |
| **Paper-first** | $0 blast radius until calibration proves out |
| **Pre-registration** | All predictions logged before resolution; score the full book |
| **Never play own markets** | Organism must not adjudicate or bet in markets it creates |
| **Demote-don't-delete** | Single bad outcomes lower budget; autopsy before permanent death |
| **Amemetics** | Every reward hack → [`BUGS_AND_MITIGATIONS.md`](./BUGS_AND_MITIGATIONS.md) with repro + assertion |
| **Held-out judges** | Judges the breeding loop never sees and cannot author |

Horizon items (minting markets, self-funding treasury, software factory at scale) are documented as future direction only — not in scope for two weeks.

---

## 9. Further reading

- [`PROPOSAL.md`](./PROPOSAL.md) — problem, scope, team surfaces, demo story
- [`TREATISE.md`](./TREATISE.md) § VIII-c (Homology), § XIII (Agora), § XIV (Insight Machine, r/K)
- [`GLOSSARY.md`](./GLOSSARY.md) — full lexicon
- [`DIAGRAMS.md`](./DIAGRAMS.md) — existing visual maps (update as architecture solidifies)
