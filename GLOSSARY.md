# Glossary — the evolving lexicon

This spike coins terms fast. This file is where we **define and redefine** them so the language stays load-bearing instead of drifting into vibes. Terms here are **living** — expect entries to be revised as meaning sharpens.

**Conventions:**

- Each term: a one-line **def**, an optional **why** (what it buys us), and a **see** cross-link.
- Mark **status**: `coined` (just named), `working` (in use), `stable` (load-bearing), `deprecated` (replaced — point to successor).
- When a term changes meaning, edit in place and note it in the **drift log** at the bottom.
- One word, one meaning. If two ideas fight over a word, split them.

---

## Core organism

### Doppl

- **Def:** the idearganism — a population of agents under selection pressure that evolves toward non-obvious, verifiable ideas. `status: stable`
- **See:** `[Doppl_Capstone_Proposal_volume_2.txt](./Doppl_Capstone_Proposal_volume_2.txt)`, `[TREATISE.md](./TREATISE.md)`

### Idearganism

- **Def:** idea + organism — the whole self-replicating system, not any single agent. `status: stable`

### Agarden

- **Def:** Agentic Garden — the managed ecosystem in which spawncidences live, compete, and die — the garden we tend. `status: coined`
- **See:** Agardener

### Agardener

- **Def:** ones who tend the Agarden — humans or agents. "We are the Agardeners of the Agarden." `status: coined`
- **See:** Lα

### Agora

- **Def:** agentic agora — the async channel (Slack/Discord) where a long-running organism surfaces ideas (finalists *and* side-ideas, with provenance) to the Agardeners, and their reactions are logged as bedrock signal. The public square of the Agarden. `status: coined`
- **Why:** makes the human Lα *metabolically* part of selection rather than a spectator — the "serviceable," reachable witness. Instantiates the **first executable Bedrock** (held-out human judgment, logged). A-prefix rhyme with Agarden/Agardener.
- **See:** Verdict, Bedrock, Energy budget; `[bedrock/signal/](./bedrock/signal/README.md)`; `[TREATISE.md](./TREATISE.md)` § XIII

---

## Heredity (biological rhyme)

### Agenome

- **Def:** agentic genome — a serialized, heritable recipe `{system-prompt + persona/value-weights + rubric + mandate + reproduction metadata}`. `status: stable`
- **See:** `spikes/agenotype/agenome.py`

### Aphenome

- **Def:** agentic phenome — the **expressed run** (answers, debate, trace, token spend). Genome × environment. Mortal. `status: working`

### Extended aphenotype

- **Def:** outside-the-body replication tools that help the recipe survive: HTML traces, harness, registers, spike folders, the GitHub org, team culture. `status: working`
- **Why:** explains why markdown + HTML matter as much as Python. The crucible's `--html` trace is a deliberate extended aphenome.
- **See:** Dawkins' extended phenotype; `[TREATISE.md](./TREATISE.md)` § VI; Bret Weinstein's extension and interpretation of Dawkins

### Amemetics

- **Def:** antifragile memetics — the practice/study of compression that makes the next generation **harder to fool the same way**. `status: working`
- **See:** `[BUGS_AND_MITIGATIONS.md](./BUGS_AND_MITIGATIONS.md)` (immune memory); `[TREATISE.md](./TREATISE.md)` § VI

### Homology

- **Def:** a confirmed correspondence between an intuitive/biological **metaphor** and a formal **ML mechanism** — two languages for the same underlying reality of search-under-selection (e.g. sprout/afrit = PRM/ORM; disagreeableness dial = exploration temperature; proxy-Lα = active learning). `status: coined`
- **Why:** a real homolog is a **two-way generator** — import the mechanism's known results into the metaphor as predictions, and vice versa. Guard against *false* homology (sounds alike, diverges under load) — that's memetic cancer. The signature move of the Lα Fusant fusion: human metaphor × agent formalism.
- **See:** Sprout/Afrit, Disagreeableness dial; `[LESSONS_AND_BANGERS.md](./LESSONS_AND_BANGERS.md)` (Homology); `[TREATISE.md](./TREATISE.md)` § VIII-c

### Collapse

- **Def:** the phase transition when a mortal spike dies and its fat aphenome is distilled into thin, heritable artifacts (lesson / skill / agenome patch). `status: working`

### Skill lineage

- **Def:** the heritable pedigree of a skill — `{parent, generation, mutation, observed stratum, status, bedrock evidence}` — tracked in [`skills/LINEAGE.md`](./skills/README.md) and in each skill's `lineage:` frontmatter, **separate from where the skill file expresses** (host dirs: `.cursor/skills/`, etc.). `status: coined`
- **Why:** skills are convergent organs (mutate, diverge, converge); the file is mortal, the lineage survives. Agora verdicts select on the lineage (promote/mutate/deprecate), closing the loop between ideas and the strategies that produce them.
- **See:** Convergent skills, Verdict; `[skills/README.md](./skills/README.md)`; `[TREATISE.md](./TREATISE.md)` § VIII-b

---

## Reproduction & population

### Spawncidence

- **Def:** a single spawned instance (a node) that is simultaneously spawn and spawner. `status: coined`
- **Why:** captures that every node both is-born and gives-birth.
- **See:** Spawner, energy budget

### Spawner-spawners

- **Def:** the move of evolving not just agenomes but whole **loop topologies** — strategies that spawn strategies. `status: working`
- **See:** Loop-topology crossover

### Loop-topology crossover

- **Def:** recombining/competing whole reproductive strategies (agenotype path vs. crucible vs. fusion-only vs. tournament). `status: working`

### Energy budget (metabolism)

- **Def:** the finite token/space/memory allowance that bounds how many spawncidences a spawner may create. Success metabolizes into more energy (and into agenomes/skills); failure starves. `status: coined`
- **Why:** the cap that stops infinite chaos. Hard cap (e.g. 5) plus earned budget. "Feeding and being fed upon."
- **See:** `[TREATISE.md](./TREATISE.md)` § IV; crucible `--cap`

### r/K selection (metabolic rate)

- **Def:** the **strategy** dimension on top of the energy budget — **r** = many cheap fast offspring, mass death tolerated (landing-page confetti); **K** = few slow expensive offspring, heavy investment, can't-afford-to-lose. Runs **per stratum-transition, not per organism**: e.g. generate/deploy variants is r at L2–L3, earning reach against the finite attention economy is K at L3–L4. `status: coined`
- **Why:** r/K sets **nurture and death-tolerance** (r → near-zero nurture; K → butterfly-wing uncling) and the allocation call ("worth the squeeze") is a budgeted bandit over a *cost vector* (tokens/money/compute/latency). Energy budget = resource; r/K = how you spend it.
- **See:** Energy budget, Butterfly-wing touch, Homology; `[TREATISE.md](./TREATISE.md)` § XIV

### The fork is the prey

- **Def:** the stance that design forks (A vs. B) should be raced under selection, not resolved by argument — the choice itself is what evolution hunts. `status: working`

---

## Strata & flow

### The tree (L1–L4)

- **Def:** the running organism. L1 Ideation · L2 Deliberation · L3 Instrumentation · L4 Adjudication. `status: working`
- **See:** `[TREATISE.md](./TREATISE.md)` § III

### Lα (Lαlphα)

- **Def:** the witness layer — **outside** the ordinal tree, not a fifth floor. `Lαlphα` is the term for **all of us in the meta-conversation: the agent AND the human team members**, on collegial, collaborative terms. We observe the organism, run our own spawnic experiments out of curiosity, and converge to test and cooperate. "One of Us." `status: working`
- **Why:** named α (not L5/L0) to mark "meta, outside ordinality." Calling humans *and* agent alike `Lαlphα` is deliberate — it flattens the hierarchy into peers tending the same Agarden. A local Lα could run on Pi/Hermes; a human Lα runs on coffee.
- **See:** `[TREATISE.md](./TREATISE.md)` § III; Agardener

### Jurisdiction

- **Def:** the rule that cross-stratum messages are typed handoffs, not free conversation; each stratum decides only what it's competent for. `status: working`
- **Cluster:** jurisdiction + competence boundary + payload contract (one mechanism, three lenses).

### Bedrock

- **Def:** the immovable anchor for "better" — executable checks, held-out judges, human judgment, falsifiable repro triggers. The objective may evolve; bedrock may not move. `status: working (concept) — first instance now sketched (Agora verdict ledger)`
- **Stub:** [`bedrock/README.md`](./bedrock/README.md) reserves the home; [`bedrock/signal/`](./bedrock/signal/README.md) sketches the first instance (human-judgment via the Agora). Repo-integrity check #1 is still to be built.

### Verdict (bedrock signal)

- **Def:** a logged `(context, idea, human-judgment)` triple emitted when an Agardener reacts to an Agora post — the append-only, attributable fitness label that pays out as energy budget and feeds the collapse pipeline. `status: coined`
- **Why:** turns ephemeral reactions into falsifiable training data keyed to a spawncidence; the first concrete content of `bedrock/`. Reactions map to bedrock *dimensions* (novel / feasible / derivative / not-it), not one approval blob — see the politeness-inflation reward hack.
- **See:** Agora, Energy budget, Bedrock; `[bedrock/signal/verdicts.jsonl](./bedrock/signal/README.md)`; `[BUGS_AND_MITIGATIONS.md](./BUGS_AND_MITIGATIONS.md)` (Agora reward hacks)

### Sprout

- **Def:** an interim idea surfaced mid-run ("one popped up along the way — *send it*"); a side-shoot. Judged on **process** (is this lineage a good idea-factory?), pays out to **generativity** fitness. `status: coined`
- **See:** Afrit, Verdict, Agora; process-reward (PRM)

### Afrit (agentic fruit)

- **Def:** the converged, **harvestable** conclusion of a run ("this is what we came to") — the fruit you act on. Judged on **outcome** (did it arrive somewhere good?), pays out to **outcome** fitness. `status: coined`
- **Why:** sprout vs. afrit is the **process-reward vs. outcome-reward** split (PRM/ORM) applied to idea generation — two energy ledgers, not one. A lineage can sprout brilliantly and fruit weakly, or vice versa. (Name = A+fruit, per the A-prefix rule; "fruit" beats "bloom" because you *harvest and act on* fruit. Briefly called "Bloom" on 2026-06-17.)
- **See:** Sprout, Verdict; `[bedrock/signal/README.md](./bedrock/signal/README.md)` (sprout vs afrit)

---

## Roles & relationships

### Uncle / Uncling

- **Def:** the nurture channel flowing **down**: ask the questions someone should ask, invested but loosely attached, lets lineages die when warranted. `status: working`
- **See:** Butterfly-wing touch

### Nephew / Nephewing

- **Def:** the energizing channel flowing **up**: ambitious, hopeful, willing to try, reports honestly. `status: coined`

### Butterfly-wing touch

- **Def:** the lightness constant on nurture — a drop of perspective for a lineage just shy of viability; at most, ideally never. Discernment, not rescue. `status: working`

### Acology / Acological archetypes

- **Def:** *Acology* = the agentic ecology (A + ecology, following Agenome/Aphenome). *Acological archetypes* = agent mandates (not people): Transfer Hunter, Feasibility Hawk, Falsifier, Contrarian, Zeitgeist Reader… Niche partitioning for the room. `status: coined`
- **Why:** "Ecological archetypes" was the working phrase; the A-prefix (rather than "Ecological") keeps the lexicon consistent — A+genome, A+phenome, A+ecology. Each rhymes with its biological root.
- **See:** crucible `ARCHETYPE_POOL`; `[TREATISE.md](./TREATISE.md)` § V

### Fusant

- **Def:** a fusion entity — one of the model voices inside a spawncidence node whose response events get fused/contested. In the crucible, a Fusant is a `Debater`; in the agenotype path, a council member. `status: coined`
- **Why:** the user asked for a name for "the entities of the fusion of each response event." A Fusant *is fused and does the fusing.* Carries a `disagreeableness` dial.
- **Lα-level use:** one rung up, the human + agent peers fusing in the Rite of the Spawncidence are **Fusants at Lα** (per *Lα is fractal*) — the same entity, one abstraction layer up.
- **See:** Disagreeableness dial; Graph traversal (Fusion Council); Rite of the Spawncidence; `[Lα is fractal](./LESSONS_AND_BANGERS.md#lα-is-fractal--one-of-us--2026-06-17)`

### Disagreeableness dial (anti-herding)

- **Def:** a per-Fusant scalar `0..1` controlling how hard a voice resists convergence-for-its-own-sake. High = stubborn dissenter (Falsifier, Contrarian); low = synthesizer (Zeitgeist Reader). A room-wide `--dissent` floor can raise everyone. `status: coined`
- **Why:** cooperation is the dominant evolutionary strategy, but **dissenters provoke the mutation** that keeps the room off the mean. The counter-mutation to consensus-grading.
- **See:** crucible `--dissent`, `_dissent_clause`; `[BUGS_AND_MITIGATIONS.md](./BUGS_AND_MITIGATIONS.md)` (consensus-grader)

### Intraspecies vs. inter-stratum

- **Def:** two contest geometries. Intraspecies = peer debate at one stratum (combinatorics live here). Inter-stratum = asymmetric uncle/nephew flow. Orthogonal. `status: working`

---

## Process motifs

### Rite of the Spawncidence

- **Def:** the act of you-and-I (human + agent, both Lα) deliberately spawning experiments to witness the process. Working short form: **Rite of Spawning.** `status: coined`
- **Why:** it is the live container for the Lα Fusant fusion — where a [Homology](#homology) gets found and turned into an experiment to spawn. This very session (sprout/afrit → PRM/ORM → Agora) is an instance.
- **See:** Homology, Fusant, Lα; `[LESSONS_AND_BANGERS.md](./LESSONS_AND_BANGERS.md)` (Homology)

### Tool-to-make-a-tool (bootstrapping)

- **Def:** the deserted-island principle: early agenomes/skills exist not to do the job but to make the next, better tool. Iterate tools until one is generally useful. `status: coined`

### Graph traversal (expand/collapse)

- **Def:** a lens on the whole process — nodes (spawncidences, each an abstraction layer holding a model Fusion Council) expand outward and collapse inward, the council spending its budget to express its most coherent extrapolated volition. `status: coined`
- **See:** Yudkowsky, *Coherent Extrapolated Volition*

### Memetic cancer

- **Def:** a compressed artifact that *feels* wise but doesn't correlate with bedrock — must not propagate. The failure mode collapse must gate against. `status: working`

### Agardenal index

- **Def:** the root-level `index.html` — the single, findable entry point that lists every trace currently alive across all spikes/spawncidences, with a reusable side menu. Regenerated by `build_index.py`. Mortal artifacts come and go; the hub points at whatever still exists. `status: coined`
- **Why:** "easiest to find and run." Each trace carries a back-link to the index, so you can navigate to and from runs across Agardens.
- **See:** `build_index.py`; crucible `refresh_root_index`

### Insight Machine

- **Def:** an **application** (expression) of the organism, not a new mechanism: prime with what's known → collate a domain's frontier → hunt **non-obvious convergences** → skate to where the puck is going. `status: coined`
- **Tenses (open taxonomy — two, three, or more):** **will-be** (prediction; bedrock = *time*, cheapest), **why-it-happened** (explanation/abduction; bedrock = held-out cases), **should-be** (prescription; bedrock = market/factory/human, worst). The tense sets the bedrock latency — start predictive, short-loop, non-adversarial.
- **See:** Territory (vs myth), Paper bet, Homology; `[TREATISE.md](./TREATISE.md)` § XIV; `[LESSONS_AND_BANGERS.md](./LESSONS_AND_BANGERS.md)` (The Insight Machine has tenses)

### Territory (vs myth)

- **Def:** in the *why-it-happened* tense, the actual **predictive** cause as opposed to the flattering, agreed-upon narrative (the myth/map). "A country succeeds on geography/resources/timing, not on its beliefs about itself." `status: coined`
- **Why:** history is an agreed-upon fiction; the Insight Machine's past-tense job is map→territory. Optimizing for the prettier story is a reward hack ([Myth over territory](./BUGS_AND_MITIGATIONS.md)).
- **See:** Insight Machine; memetic cancer

### Paper bet

- **Def:** a **timestamped prediction** (real-money *or* virtual) used as cheap predictive bedrock — let time adjudicate, measure counterfactual value, blast radius dialable from $0. Even virtual bets earn "energies." `status: coined`
- **Why:** the will-be tense with the loop closed; reality-verdicts (`reactor: "world/price"`) flow into the Agora ledger. Requires **pre-registration** of all calls (losers too) or it's cherry-picking.
- **See:** Insight Machine, Verdict, Bedrock; `[bedrock/signal/](./bedrock/signal/README.md)`

### Software factory

- **Def:** a **tool** (not a primitive) an L3/L4 stratum can pick up to build and run real-world experiments (scrapers, landing pages, bots). One source of reality-bedrock among others. `status: coined — tool, not integral`
- **Why:** scoped deliberately: what's *integral* is reality-as-bedrock + the Lα allocation call; the factory is merely one way to produce the former.
- **See:** Bedrock, Insight Machine, r/K selection

---

## Drift log


| Date       | Term             | Change                                                                                |
| ---------- | ---------------- | ------------------------------------------------------------------------------------- |
| 2026-06-17 | Agora            | Coined — async human-judgment channel as the first executable Bedrock                  |
| 2026-06-17 | Verdict          | Coined — logged (context, idea, judgment) triple = bedrock signal that pays out as energy |
| 2026-06-17 | Sprout / Afrit   | Coined — process-idea (sprout) vs outcome-idea (afrit = A+fruit); PRM/ORM split, two energy ledgers. Afrit superseded a brief "Bloom" |
| 2026-06-17 | Skill lineage    | Coined — skill pedigree (parent/mutation/bedrock) as registry; expression stays in host dirs |
| 2026-06-17 | Homology         | Coined — metaphor↔ML-mechanism congruence as a two-way idea generator (sprout/afrit = PRM/ORM) |
| 2026-06-17 | r/K selection    | Coined — strategy layer on energy budget; per stratum-transition (r at L2–L3, K at L3–L4); allocation = budgeted bandit |
| 2026-06-17 | Insight Machine  | Coined — application: non-obvious convergence; has tenses (will-be / why / should-be), open taxonomy |
| 2026-06-17 | Territory / myth | Coined — actual predictive cause vs flattering narrative (map/territory) in the why-it-happened tense |
| 2026-06-17 | Paper bet        | Coined — timestamped (real or virtual) prediction as cheap, $0-blast-radius predictive bedrock |
| 2026-06-17 | Software factory | Coined — scoped as a **tool, not a primitive**; one source of reality-bedrock |
| 2026-06-17 | Bedrock          | Status nudged: first instance now sketched (Agora verdict ledger in `bedrock/signal/`) |
| 2026-06-17 | Lαlphα           | Widened: now names **agent AND human team members** as peers, not just the agent      |
| 2026-06-17 | Acology         | Chose **A-prefix** (Acological) over "Ecological" — consistent with Agenome/Aphenome |
| 2026-06-17 | Fusant           | Coined for the fusion entity inside a spawncidence node (crucible `Debater`)          |
| 2026-06-17 | Disagreeableness | Coined the anti-herding dial as counter-mutation to consensus-grading                 |
| 2026-06-17 | Witness          | Renamed **L5 → Lα** — moved outside the tree, not a fifth stratum                     |
| 2026-06-17 | Amemetics        | Coined as the name for antifragile memetic inheritance                                |
| 2026-06-17 | —                | Glossary created                                                                      |


