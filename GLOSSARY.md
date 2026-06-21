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

### Doppl Prime (Doppl-Prime)

- **Def:** the **canonical, production-bound repo** for Doppl — the official documentation and binding source of truth where ideas that survive the crucible go to get **built and tested for real**. Lives at `/Users/michaelhabermas/repos/GAI/DOPPL/doppl-prime` (`github.com/Doppl-Life/doppl-prime`). `status: coined`
- **Use the full name.** Refer to it as **"Doppl Prime"** / **"Doppl-Prime"** — be specific. Bare **"Doppl"** (idearganism vs. org vs. any repo) and bare **"prime"** are ambiguous; don't auto-resolve them to this repo without context.
- **Why:** names the **anvil** opposite this **crucible** (`doppl-test`). Prime is the **measuring stick** — crucible spikes (often unfinished or deliberately wrong) are measured against it to find divergence and where the skill family (`breakthrough` & kin) can **add to** what prime already has. Same Git caution as canon: read for grounding, change deliberately.
- **See:** `[AGENTS.md § Doppl Prime](./AGENTS.md)`; prime's `ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`, `docs/planning/`, `docs/gap-audits/`

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

### Lineage Ledger

- **Def:** the global append-only memory of candidate ideas, parentage, mutations, claimed deltas, nearest priors, delta classes, convergence clusters, and operational watch triggers across Doppl runs. `status: coined`
- **Why:** lets future runs ask "are we taking the next step or just saying the same thing again?" without starting from a blank page. It blocks dead rehash, preserves enriching convergence, and feeds skills like `breakout` with the actual tried paths.
- **See:** `[kernel-rebuild/docs/lineage-ledger.schema.md](./kernel-rebuild/docs/lineage-ledger.schema.md)`, `[kernel-rebuild/OPERATIONAL_WATCHLIST.md](./kernel-rebuild/OPERATIONAL_WATCHLIST.md)`, Knowledge Space

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

### Weed

- **Def:** a surfaced idea the system **shouldn't** have surfaced — low-value, obvious, or dead-end; the negative class alongside sprout/afrit. Pulled, not harvested. In code it's the bottom band of the surfacing gate (`spikes/backyard/sprout.py`: `score < WEED_BAR → weed`). `status: coined`
- **Why:** completes the tri-state the Agardeners react to ("sweet / sour / rotten → that's a weed"). Surfacing a weed **on purpose** is the anti-survivorship move (the `exploration: true` flag): a held-out judge that can only ever see winners can't be falsified. Polarity −1, so a human's "weed" and a machine's `not-it` land on the same axis.
- **See:** Sprout, Afrit, Verdict, Agora; `[agora/README.md](./agora/README.md)`; the survivorship-leak test in `[bedrock/signal/README.md](./bedrock/signal/README.md)`
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

### Mutagen / Mutagen catalog

- **Def:** a **mutagen** is the external pressure injected into a skill that creates the variation — operationally "what if we did [idea X], from someone who isn't me." It is the *diff*, not the descent: the skill skeleton is inherited (from the progenitor `breakthrough`), the mutagen is what makes the offspring different. The **mutagen catalog** is the set of mutagen *classes* observed so far — `valence-flip` (→ `breakout` / `blindside` / `addition-by-subtraction`), `basis-transform` (→ `first-principles`), `scarcity-operator` (→ `constraint-injection`), and `domain-transfer` (→ `polymath`) — i.e. the **generating function** of the skill family. The catalog is **open**, not closed (it grew from three operators to four when `polymath` was coined). `status: coined`
- **Key property — stratum-invariance:** the *same* mutagen operates at two strata. At the **meta** level it mutates a skill into a sibling skill (skill phylogeny); at the **object** level, an agent *wielding* that skill applies it to mutate an **idea**. The skill *is* the mutagen instantiated as an agent-mandate — so the catalog generates **both** new skills **and** new ideas. (A [homology](#homology) to the agenome/aphenome fractal: same operator, different host stratum.)
- **Why:** reframes "we have N skills" into "we've found K of the mutagen operators," which is the higher-leverage object for the meta-improvement thesis — it tells you what to fork *on purpose* (e.g. the unclaimed **convergent-DOWN** slot, or a **transfer/analogy** mutagen — the Doppl proposal's #1 breakthrough move) instead of by inspiration. The progenitor (`rule-of-cool`/`breakthrough`) donates the conserved skeleton; the mutagen is the allele.
- **See:** Divergence pair, Recessive flash, Homology; [MEMORY: Progenitor not parent](./MEMORY.md); `[skills/LINEAGE.md](./skills/LINEAGE.md)`

### Divergence pair (breakout / blindside)

- **Def:** two gen-1 skills mutated from `rule-of-cool` by **valence flip**. Rule of Cool *converges* on the single best accretive addition; the pair *diverges* off the main path. **`breakout`** = divergence-UP (the nephew: drops the feasibility filter, hunts the paradigm-escaping 10x/100x zag — "the treasure"). **`blindside`** = divergence-DOWN (the uncle: the non-obvious failure mode or the honest case for not doing it — "the trap"). `status: coined`
- **Why:** convergence and divergence are the explore/exploit halves of one search loop; Rule of Cool ran divergence *silently* and hid all but the winner — the pair surfaces the periphery it discards. Both are self-contained "modes of thinking," callable by any Lα and assignable as Fusant mandates (crucible `ARCHETYPE_POOL`).
- **See:** Recessive flash, Recon, Disagreeableness dial; `[skills/LINEAGE.md](./skills/LINEAGE.md)`; `[.cursor/skills/breakout/SKILL.md](./.cursor/skills/breakout/SKILL.md)`, `[.cursor/skills/blindside/SKILL.md](./.cursor/skills/blindside/SKILL.md)`

### Recessive flash

- **Def:** the rare expression of a skill's **recessive** (opposite-valence) allele. Each divergence skill is **heterozygous** — dominant in its valence, but carrying the other: `breakout` mostly diverges up yet occasionally spots the fatal flaw; `blindside` mostly hunts traps yet occasionally has the better idea. The off-valence move fires once, then yields back to the dominant trait. `status: coined`
- **Why:** dominant/recessive is the genetics handle for "sometimes uncle has a great idea, sometimes nephew sees the problem." A **[homology](#homology)** to **ε-greedy exploration** — mostly exploit the dominant mode, with small probability take the off-policy move — which keeps a single-valence voice from going blind to its own blind spot.
- **See:** Divergence pair, Disagreeableness dial, Homology

### Recon

- **Def:** the reconnaissance mechanism — when an idea is unsettled, dispatch cheap, capped **scouts**, each carrying a skill/persona (`breakout`, `blindside`, `rule-of-cool`), to explore the periphery and report back **leads, not verdicts**, which then prior the spawncidences that attack the problem for real. `status: coined (mechanism sketched, spike not built)`
- **Why:** r-selected reconnaissance (cheap, many, disposable) feeding K-selected deliberation (few, expensive, committed) at an L→L+1 boundary. Scouts return *open questions and blind spots* (the breed-on-blind-spots rule) so they **prior** the council without **anchoring** it; their reports are sprouts. Combinatorics capped by the energy budget.
- **See:** Divergence pair, Sprout, r/K selection, Energy budget, Breed on blind spots; `[MEMORY.md](./MEMORY.md)`

### Disagreeableness dial (anti-herding)

- **Def:** a per-Fusant scalar `0..1` controlling how hard a voice resists convergence-for-its-own-sake. High = stubborn dissenter (Falsifier, Contrarian); low = synthesizer (Zeitgeist Reader). A room-wide `--dissent` floor can raise everyone. `status: coined`
- **Why:** cooperation is the dominant evolutionary strategy, but **dissenters provoke the mutation** that keeps the room off the mean. The counter-mutation to consensus-grading.
- **See:** crucible `--dissent`, `_dissent_clause`; `[BUGS_AND_MITIGATIONS.md](./BUGS_AND_MITIGATIONS.md)` (consensus-grader)

### Intraspecies vs. inter-stratum

- **Def:** two contest geometries. Intraspecies = peer debate at one stratum (combinatorics live here). Inter-stratum = asymmetric uncle/nephew flow. Orthogonal. `status: working`

---

## Process motifs

### Operational Watchlist

- **Def:** the human-readable register of process patterns to watch during Doppl runs: failures, near-failures, and ambiguous signals that need ledger evidence before becoming bugs or doctrine. `status: coined`
- **Why:** separates "watch this during the organism's operation" from confirmed reward hacks (`BUGS_AND_MITIGATIONS.md`) and durable lessons (`LESSONS_AND_BANGERS.md`).
- **See:** `[kernel-rebuild/OPERATIONAL_WATCHLIST.md](./kernel-rebuild/OPERATIONAL_WATCHLIST.md)`, Lineage Ledger

### Rite of the Spawncidence

- **Def:** the act of you-and-I (human + agent, both Lα) deliberately spawning experiments to witness the process. Working short form: **Rite of Spawning.** `status: coined`
- **Why:** it is the live container for the Lα Fusant fusion — where a [Homology](#homology) gets found and turned into an experiment to spawn. This very session (sprout/afrit → PRM/ORM → Agora) is an instance.
- **See:** Homology, Fusant, Lα; `[LESSONS_AND_BANGERS.md](./LESSONS_AND_BANGERS.md)` (Homology)

### Frame recovery

- **Def:** the precursor move before idea generation: recover what the problem actually is, not the problem as first stated. `status: coined`
- **Why:** it does not matter how good the answers are if the question is wrong. In Doppl case studies, this is scored separately from sprout/afrit quality: first identify the hidden variable, then generate.
- **See:** Problem recovery; Hidden variable before fruit; `[case-studies/case-study-schema.md](./case-studies/case-study-schema.md)` (`evaluation_focus`)

### Problem recovery

- **Def:** the generated artifact that turns an observed situation and stated complaint into the actual problem, deleted assumptions, hidden variable, and solution class before idea generation begins. `status: coined`
- **Why:** makes frame recovery judgeable by humans and domain experts instead of burying it inside the final answer.
- **See:** Frame recovery; `[case-studies/evaluation-rubric.md](./case-studies/evaluation-rubric.md)`

### Cross-domain transfer

- **Def:** a `CandidateIdea` subtype whose leverage is mapping a valid source-domain technique/mechanism onto a target-domain problem. Timing is incidental; the analogy/mechanism is the point. `status: working`
- **Why:** distinguishes durable mechanism transfer from time-bound market/world theses. It answers "what known thing from A solves B?"
- **See:** Zeitgeist synthesis; `[case-studies/cross-domain-transfer-notes.md](./case-studies/cross-domain-transfer-notes.md)`

### Zeitgeist synthesis

- **Def:** a `CandidateIdea` subtype whose leverage is a thesis/framing fitted to live current signals and a defensible **why-now**, with falsifiable predictions. Timing is load-bearing. `status: working`
- **Why:** keeps Doppl from mistaking trend narration for insight. A true zeitgeist thesis breaks under the +/-5-year test: too early = enabling signal not live; too late = consensus/priced in.
- **See:** Cross-domain transfer; Why-now; Current signal; `[case-studies/zeitgeist-synthesis-notes.md](./case-studies/zeitgeist-synthesis-notes.md)`

### Why-now

- **Def:** the timing claim that explains what changed recently, why the window is open now, and why the obvious timing story is wrong or incomplete. `status: coined`
- **Why:** for zeitgeist cases, frame recovery is often why-now recovery. Without why-now, the thesis is either perennial truth, trend-following, or transfer.
- **See:** Zeitgeist synthesis; Current signal; Frame recovery

### Current signal

- **Def:** a dated, citable, live piece of evidence that a threshold has crossed or a regime is changing now. `status: coined`
- **Why:** a zeitgeist synthesis is grounded by signals, not vibes. Signals may be agent-visible inputs; evaluator-only required-signal targets and the withheld thesis stay separate.
- **See:** Why-now; `[case-studies/sources.md](./case-studies/sources.md)` Signal Set D

### Latent-asset unlock

- **Def:** a zeitgeist sub-pattern where an existing asset/capability suddenly becomes load-bearing because the world changed around it. `status: coined`
- **Why:** the owner did not need to invent a new thing; the exogenous shift made what they already had scarce. NVIDIA's gaming GPUs becoming AI compute is the reference shape; firm dispatchable power for AI datacenters is the corpus case.
- **See:** Discovered attack; Zeitgeist synthesis; `[case-studies/ai-firm-power-constraint](./case-studies/ai-firm-power-constraint)`

### Discovered attack

- **Def:** the chess-shaped version of latent-asset unlock: everyone watches the pawn move while the important effect is the bishop it opened downfield. `status: coined`
- **Why:** names the direction-of-attention failure that makes second-order winners mispriced.
- **See:** Latent-asset unlock; Blindside; Breakout

### Perfect Pepsis / unlock cluster

- **Def:** a large unlock that should not be forced into one thesis because it detonates into several convergent regime changes, each worthy of its own case. `status: coined`
- **Why:** "find the perfect Pepsis" means map the family: breadth first, depth on fertile branches, then synthesis. FSD is the reference cluster.
- **See:** Substrate removed; Dry-riverbed test; `[case-studies/full-self-driving-unlock](./case-studies/full-self-driving-unlock)`

### Substrate removed

- **Def:** the underlying event, unit, constraint, or economic subject that disappears or changes under an unlock. `status: coined`
- **Why:** big clusters should be split by substrate removed, not by industry topic. FSD's substrates: crash, driver/distance, driver-as-policeable-subject, privately owned car, plus the adoption-asymmetry lens.
- **See:** Perfect Pepsis; Dry-riverbed test

### Dry-riverbed test

- **Def:** ask whether a downstream institution faces a smaller river (cost drops) or a dry riverbed (the event that fed it stops happening). `status: coined`
- **Why:** disappearing-event branches are often higher magnitude and less priced than ordinary cost-collapse branches.
- **See:** Substrate removed; `[LESSONS_AND_BANGERS.md](./LESSONS_AND_BANGERS.md#the-event-falls-away--2026-06-20)`; `[case-studies/fsd-enforcement-economy](./case-studies/fsd-enforcement-economy)`

### Adoption asymmetry

- **Def:** the regime-change lens where uneven distribution is the main effect: believers vs. disbelievers, served vs. lagging regions, rich-world concentration vs. leapfrog wildcard. `status: coined`
- **Why:** "X is coming" averages away the arbitrage. The useful question is who already lives in the new world, who cannot see it yet, and what happens at the boundary.
- **See:** Zeitgeist synthesis; `[case-studies/fsd-adoption-asymmetry](./case-studies/fsd-adoption-asymmetry)`

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
| 2026-06-21 | Operational Watchlist / Lineage Ledger | Coined — process watch surface plus global run-appended lineage/delta memory contract; distinguishes rehash from enrichment and convergence signal. |
| 2026-06-20 | Zeitgeist synthesis / Cross-domain transfer | Stabilized the subtype distinction: transfer is mechanism-first and timing-incidental; zeitgeist is timing-first with current signals, why-now, and falsifiable predictions. |
| 2026-06-20 | Why-now / Current signal | Coined — the timing and evidence primitives that make a zeitgeist thesis judgeable rather than trend narration. |
| 2026-06-20 | Latent-asset unlock / Discovered attack | Coined — the NVIDIA-shaped pattern where an exogenous shift unlocks an existing asset, and attention misses the downfield effect. |
| 2026-06-20 | Perfect Pepsis / Substrate removed / Dry-riverbed test | Coined — large unlocks become clusters split by substrate removed; the strongest branches are disappearing events, not merely falling costs. |
| 2026-06-20 | Adoption asymmetry | Coined — uneven distribution as the thesis, not a caveat; maps believer/disbeliever, served/unserved, and first/third-world boundary effects. |
| 2026-06-19 | Problem recovery | Coined — the explicit generated artifact for case studies: symptom report → actual problem → hidden variable → solution class before solution generation. |
| 2026-06-19 | Frame recovery   | Coined — the precursor before idea generation: recover the actual question/problem before judging sprouts or afrits. Added to case-study `evaluation_focus` |
| 2026-06-19 | Doppl Prime      | Coined — the canonical, production-bound repo (`doppl-prime`, `Doppl-Life/doppl-prime`): official docs + binding source of truth, the **anvil** to this crucible. Surviving ideas land there; crucible work is measured against it. Referenced in [AGENTS.md](./AGENTS.md) + [README](./README.md) |
| 2026-06-18 | Weed             | Coined — the negative class (sprout/afrit/**weed**); already live in `spikes/backyard`. Surfacing one on purpose = anti-survivorship (`exploration:true`). Polarity −1, aligns with `not-it`. Built the Agora verdict bus (`agora/`) that compares human vs judge vs council on this axis |
| 2026-06-18 | `polymath` / `addition-by-subtraction` | Coined — two gen-1 skills built: `polymath` (the Renaissance man; **domain-transfer** mutagen = the Medici Effect; promotes the `transfer-hunter` archetype) + `addition-by-subtraction` (the sculptor; **valence-flip** convergent-DOWN, via-negativa). The latter completes the convergence×valence 2×2; the former adds a **4th** operator class (catalog is open) |
| 2026-06-18 | Mutagen / Mutagen catalog | Coined — the injected external pressure that creates a skill's variation (`valence-flip` / `basis-transform` / `scarcity-operator`); **stratum-invariant** (mutates skills at the meta level, ideas at the object level). Progenitor donates the skeleton; mutagen is the allele. See [MEMORY](./MEMORY.md) |
| 2026-06-18 | Progenitor (vs parent) | Coined — the gen-1 skills demoted `rule-of-cool` from `parent` to `progenitor` (`parent: null` + `progenitor: rule-of-cool`): spiritual root + donor of the shared skeleton, not a direct idea-parent |
| 2026-06-18 | Rule of Cool → **Breakthrough** | Phenotype renamed — the gen-0 progenitor now expresses as **Breakthrough** (better juxtaposed against its `breakout`/`blindside`/`first-principles`/`constraint-injection` children; the name was already used informally in `breakout`'s prose + meeting notes). **Genotype conserved:** `lineage.id` stays `rule-of-cool`, children still point at `parent: rule-of-cool`. A name-mutation-under-selection: phenotype drifts, ancestral id is held fixed. See [MEMORY fork](./MEMORY.md) |
| 2026-06-18 | First Principles / Constraint Injection | Coined — two more gen-1 forks of `rule-of-cool`: `first-principles` (basis transform → reduction-to-bedrock) + `constraint-injection` (scarcity operator → productive constraint). Logged in [`skills/LINEAGE.md`](./skills/LINEAGE.md) |
| 2026-06-18 | Divergence pair  | Coined — `breakout` (treasure/up) + `blindside` (trap/down) as valence-flip mutations of `rule-of-cool` |
| 2026-06-18 | Recessive flash  | Coined — rare off-valence allele expression in a heterozygous skill; homolog of ε-greedy exploration |
| 2026-06-18 | Recon            | Coined — dispatch skill-bearing scouts to return leads (not verdicts) that prior the council; r→K at an L→L+1 boundary |
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
