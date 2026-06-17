# Diagrams — how it all relates

**Status:** initial sketch · revisable · not canon
**Purpose:** a high-level, visual map of the Doppl ecology — the moving parts and how they interrelate. Words live in [`TREATISE.md`](./TREATISE.md) and [`GLOSSARY.md`](./GLOSSARY.md); this file is the *picture*.

> These are deliberately simple. Each diagram shows **one process**; the first diagram shows **how the diagrams relate**. Edit freely — they are meant to drift as the model sharpens. (Rendered with Mermaid: GitHub + the IDE preview both display these.)

---

## 0. Map of maps — how the diagrams relate

```mermaid
flowchart TB
  A["#0 · This map"]
  B["#1 · Whole organism<br/>L1–L4 + Lα"]
  C["#2 · Two geometries<br/>peer fight vs. uncle/nephew"]
  D["#3 · Heredity & collapse<br/>agenome → aphenome → lesson"]
  E["#4 · Crucible loop<br/>belief revision"]
  F["#5 · Energy & metabolism<br/>spawncidences"]
  G["#6 · Loop-topology crossover<br/>spawner-spawners"]
  H["#7 · Mortal projects,<br/>immortal lineage"]
  I["#8 · Agarden hub<br/>repo ecology"]

  A --> B
  B -->|"zoom: between strata"| C
  B -->|"zoom: what a node inherits"| D
  B -->|"zoom: one L2 topology"| E
  F -->|"bounds"| B
  G -->|"races topologies inside"| B
  D -->|"lessons feed"| H
  E -->|"emits traces to"| I
  H -->|"collapses into"| D

  classDef map fill:#1b232e,stroke:#c084fc,color:#e8edf4;
  class A,B,C,D,E,F,G,H,I map;
```

---

## 1. The whole organism — the tree (L1–L4) and Lα outside it

```mermaid
flowchart TB
  subgraph TREE["The running organism"]
    direction TB
    L1["L1 · Ideation<br/>agenomes, Fusants"]
    L2["L2 · Deliberation<br/>loop topologies, spawner-spawners"]
    L3["L3 · Instrumentation<br/>harness, rubrics"]
    L4["L4 · Adjudication<br/>bedrock, pruning"]
    L1 -->|"spawn + nurture (down)"| L2
    L2 -->|"spawn + nurture (down)"| L3
    L3 -->|"spawn + nurture (down)"| L4
    L4 -->|"results + maturation (up)"| L3
    L3 -->|"results + maturation (up)"| L2
    L2 -->|"results + maturation (up)"| L1
  end

  LA["Lα — Lαlphα · the witness<br/>humans + agent, as peers<br/>observes · sifts lessons · no runtime authority"]
  LA -.->|"watches the whole thing"| TREE
  TREE -.->|"aphenomes + traces to witness"| LA

  classDef tree fill:#13202e,stroke:#5aa9e6,color:#e8edf4;
  classDef witness fill:#1b232e,stroke:#c084fc,color:#e8edf4;
  class L1,L2,L3,L4 tree;
  class LA witness;
```

*Cross-strata messages are **typed handoffs** (jurisdiction), not free chat. Lα is **outside** the ordinal tree — not an L5.*

---

## 2. Two geometries — intraspecies vs. inter-stratum

```mermaid
flowchart LR
  subgraph INTRA["Intraspecies (within one stratum)"]
    direction LR
    F1["Fusant A"]
    F2["Fusant B"]
    F3["Fusant C"]
    F1 <-->|"argue / steal / object"| F2
    F2 <-->|"compete for scarce energy"| F3
    F1 <-->|"the combinatorics live here"| F3
  end

  subgraph INTER["Inter-stratum (between strata)"]
    direction TB
    U["Uncle (upper stratum)<br/>nurtures down · lets die"]
    N["Nephew (lower stratum)<br/>tries · hopes · reports up"]
    U -->|"questions, mandates, budget<br/>(butterfly-wing touch)"| N
    N -->|"results, honest reports"| U
  end

  INTRA -.->|"orthogonal — both run at once"| INTER

  classDef a fill:#13202e,stroke:#5aa9e6,color:#e8edf4;
  classDef b fill:#1d2615,stroke:#3dd68c,color:#e8edf4;
  class F1,F2,F3 a;
  class U,N b;
```

*Conflating these is how you get either endless chat with no pruning, or pruning with no growth.*

---

## 3. Heredity & collapse — agenome → aphenome → lesson (amemetics)

```mermaid
flowchart LR
  AG["Agenome<br/>(heritable recipe)"]
  AP["Aphenome<br/>(the expressed run)"]
  EX["Extended aphenotype<br/>HTML trace · hub · registers"]
  CO{"Collapse<br/>(spike dies)"}
  L1["Lesson<br/>(register entry)"]
  L2["Skill<br/>(convergent strategy)"]
  L3["Agenome patch<br/>(mutation)"]

  AG -->|"express × environment"| AP
  AP --> EX
  AP --> CO
  EX -.->|"helps it be witnessed"| CO
  CO --> L1
  CO --> L2
  CO --> L3
  L1 & L2 & L3 -->|"inherit — harder to fool the same way"| AG

  classDef gene fill:#13202e,stroke:#5aa9e6,color:#e8edf4;
  classDef art fill:#1b232e,stroke:#c084fc,color:#e8edf4;
  classDef seed fill:#1d2615,stroke:#3dd68c,color:#e8edf4;
  class AG,AP gene;
  class EX,CO art;
  class L1,L2,L3 seed;
```

*Amemetics: each cycle leaves the next generation harder to fool the same way. What survives is the compressed lesson, not the organism.*

---

## 4. The crucible loop — belief revision under pressure (one L2 topology)

```mermaid
flowchart TB
  P["Prompt"] --> SP["Spawner<br/>picks N Fusants + archetypes<br/>(within metabolism cap)"]
  SP --> OP["Openings<br/>private structured positions"]
  OP --> TU["Turns ×T<br/>object · steal · change-test · HOLD-OR-FOLD"]
  TU --> FI["Finals + revision ledger<br/>held / changed / moved-me / still-reject"]
  FI --> JU["Judge<br/>surviving idea · earned revision<br/>consensus_quality: resolved | herded | mixed"]
  JU --> V{"Verdict"}
  V -->|"pass"| KEEP["lesson + agenome patch"]
  V -->|"needs-revision"| BACK["re-spawn / re-tune"]

  DIAL["Disagreeableness dial (0–1)<br/>per Fusant + --dissent floor"]
  DIAL -.->|"anti-herding pressure"| TU
  DIAL -.->|"counter-mutation"| JU

  classDef step fill:#13202e,stroke:#5aa9e6,color:#e8edf4;
  classDef dial fill:#2a1f15,stroke:#f5c451,color:#e8edf4;
  class P,SP,OP,TU,FI,JU step;
  class DIAL dial;
```

*Cooperation is the dominant strategy; dissenters provoke the mutation. The dial keeps the room off the mean without forcing disagreement-for-its-own-sake.*

---

## 5. Energy & metabolism — what bounds the chaos

```mermaid
flowchart TB
  EB["Energy budget<br/>(tokens · space · memory)"]
  SPN["Spawner"]
  EB -->|"how many it can afford"| SPN
  SPN -->|"≤ cap (e.g. 5)"| SC["Spawncidences<br/>(each is born + gives birth)"]
  SC --> RATE{"Rated by bedrock"}
  RATE -->|"success"| FEED["Metabolize → more energy<br/>+ agenomes, skills"]
  RATE -->|"failure"| STARVE["Starve → pruned"]
  FEED -->|"feeds future spawns"| EB

  classDef e fill:#1d2615,stroke:#3dd68c,color:#e8edf4;
  classDef x fill:#2a1620,stroke:#fb7185,color:#e8edf4;
  class EB,SPN,SC,FEED e;
  class STARVE x;
```

*Pruning isn't failure — it's metabolism. "Feeding and being fed upon."*

---

## 6. Loop-topology crossover — spawning spawners

```mermaid
flowchart TB
  Q["Same prompt suite"]
  Q --> T1["Agenotype topology<br/>breed child on blind spots"]
  Q --> T2["Crucible topology<br/>belief revision"]
  Q --> T3["…future topology"]
  T1 --> TR["Comparable traces"]
  T2 --> TR
  T3 --> TR
  TR --> BR{"Bedrock compares<br/>(held-out, same prompt)"}
  BR --> WIN["Winning strategy inherited<br/>+ topologies recombine"]
  WIN -.->|"the fork is the prey — race, don't resolve"| Q

  classDef t fill:#13202e,stroke:#5aa9e6,color:#e8edf4;
  class Q,T1,T2,T3,TR,WIN t;
```

---

## 7. Mortal projects, immortal lineage — the spike lifecycle

```mermaid
flowchart LR
  BORN["Spike born<br/>spikes/&lt;name&gt;/"]
  RUN["Runs · aphenomes"]
  WIT["Witnessed<br/>HTML trace → Agarden hub"]
  COL{"Collapse"}
  REG["Registers<br/>LESSONS · MEMORY · BUGS · GLOSSARY"]
  NEXT["Next spike inherits"]
  DEAD(["Spike dies / pruned"])

  BORN --> RUN --> WIT --> COL
  COL --> REG --> NEXT
  COL --> DEAD

  classDef live fill:#13202e,stroke:#5aa9e6,color:#e8edf4;
  classDef keep fill:#1d2615,stroke:#3dd68c,color:#e8edf4;
  classDef gone fill:#2a1620,stroke:#fb7185,color:#e8edf4;
  class BORN,RUN,WIT live;
  class REG,NEXT keep;
  class DEAD gone;
```

*The organism doesn't need to persist for the DNA to survive. The lineage log is what's passed on.*

---

## 8. Agarden hub — repo ecology & navigation

```mermaid
flowchart TB
  subgraph ROOT["Root · Lα + shared culture"]
    DOCS["TREATISE · GLOSSARY<br/>registers · proposal"]
    BI["build_index.py"]
    IDX["index.html<br/>(the findable hub)"]
  end
  subgraph SPK["spikes/"]
    G["agenotype/<br/>*trace*.html"]
    C["crucible/<br/>*trace*.html"]
  end

  BI -->|"scans + enriches from *.trace.json"| IDX
  IDX -->|"links to live traces"| G
  IDX -->|"links to live traces"| C
  G -.->|"back-link ⌂ Agarden index"| IDX
  C -.->|"back-link ⌂ Agarden index"| IDX

  classDef root fill:#1b232e,stroke:#c084fc,color:#e8edf4;
  classDef spike fill:#13202e,stroke:#5aa9e6,color:#e8edf4;
  class DOCS,BI,IDX root;
  class G,C spike;
```

*Mortal traces come and go; the hub is regenerated and points at whatever still lives — itself an extended aphenotype.*

---

## Revision log

| Date | Note |
|------|------|
| 2026-06-17 | Initial diagram set — map-of-maps, organism/Lα, two geometries, heredity/collapse, crucible loop, energy/metabolism, loop-topology crossover, spike lifecycle, Agarden hub |
