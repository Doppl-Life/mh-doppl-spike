# Lessons and Bangers

Meta-concepts from exploring the [Doppl Capstone Proposal](./Doppl_Capstone_Proposal_volume_2.txt) in this spike.

These are not commandments — interesting ideas that surfaced while we poked at the problem and are worth bringing forward. The point is the *frame*, not a better answer to one prompt. Pair with [BUGS_AND_MITIGATIONS.md](./BUGS_AND_MITIGATIONS.md) for what we accidentally optimized.

## Entry format

### [short name] — YYYY-MM-DD

- **Banger:** the meta-concept — how we see the problem differently, what's cool about it
- **Lesson:** what that implies when we build (one line; optional if the banger stands alone)
- **Evidence:** where it showed up in this spike (demo moment, file, generation)
- **Carry forward:** one line for the next spike / Doppl proper

## Entries

### Breed on blind spots — 2026-06-16

- **Banger:** Breed the child agenome on blind spots, not on critic feedback.
- **Lesson:** The fusion judge's `blind_spots` and `clarifying_questions` are the breeding target — not "here's what you got wrong, try again."
- **Evidence:** `extract_breeding_mandate()` in `agenome.py`; Gen 2 offspring runs with `primary_mandate`, not an injected retry prompt.
- **Carry forward:** Reproduction is epistemic-gap-directed — offspring exist to see what parents couldn't.

### Chromosomalize Rule of Cool — 2026-06-16

- **Banger:** Chromosomalize Rule of Cool into a JSON agenome.
- **Lesson:** RoC isn't a chat trick — it's a serializable genome: personas, ranking rubric, output contract, mandate. Heritable. Crossover-able.
- **Evidence:** `Agenome` dataclass + seed variants in `agenome.py`; HTML trace renders parent/child genomes as first-class objects.
- **Carry forward:** Generation-0 is a genome file, not a skill invocation. Population dynamics plug into schema, not prompts.

### Agenotype over transcript — 2026-06-16

- **Banger:** Put evolution in the agenotype, not the transcript. When something fails scrutiny, don't patch the answer — breed a new agent. Selection pressure belongs on *who* is thinking, not *how long* they're allowed to talk.
- **Lesson:** On critic fail, `breed_child()` splices parents and mutates on `blind_spots ∪ clarifying_questions` — not on critic tone or "try harder."
- **Evidence:** Gen 1 (Transfer Hunter × Feasibility Hawk → fusion judge → critic) fails Room Vitals; offspring answers via `primary_mandate` in `agenome.py`; `fusion_trace.html` shows parent genomes, breeding mandate, and child genome.
- **Carry forward:** Default reproduction operator is genomic splice, not transcript retry. **Revisit:** crucible path as competing spawner — see [Parallel spawners, not fork resolution](./MEMORY.md#parallel-spawners-not-fork-resolution--2026-06-16).

### The fork is the prey — 2026-06-16

- **Banger:** You're not wavering on agenotype vs. crucible — you're noticing that **the fork itself is the prey.** The scaffold is supposed to be under selection pressure, including *which scaffold*.
- **Lesson:** Don't prematurely resolve design forks in MEMORY; race competing loop topologies under shared bedrock and let selection pressure flow up into "what does better mean?"
- **Evidence:** Design discussion — agenotype spike vs. belief-revision crucible as competing hypotheses about improvement for cheap models.
- **Carry forward:** The search for better definitions of better *is* the capstone apex bet — not a side debate to close before building.

### Loop-topology crossover — 2026-06-16

- **Banger:** **Spawning-Spawners** — not just agenome crossover, but **loop-topology crossover.** Different reproductive strategies (agenotype path, crucible path, fusion-only, tournament) compete under the same environment.
- **Lesson:** Every node is spawn *and* spawner by intent: L1 spawns ideas, L2 spawns L1 configs, L3 spawns L2 runs, L4 spawns L3 instrument rounds. Life flows up (artifacts) and down (pressure + nurture).
- **Evidence:** Design discussion; maps to capstone "reproduction by Fusion" at agenome *and* output levels — extended to whole loop topologies.
- **Carry forward:** Serialize spawner agenotypes: `{loop topology + judge contracts + reproduction operator + energy budget}`.

### Explore the madness, cap the combinatorics — 2026-06-16

- **Banger:** **Get crazy inside the constitution.** Explore the madness, but cap the combinatorics. Madness lives inside each stratum; restraint lives at the borders.
- **Lesson:** Hard limits make meta-level runnable: max tree strata (L1–L4), Lα outside, max parallel spawners, token caps, mortal projects, bedrock anchor that cannot move.
- **Evidence:** Design discussion — "beyond four levels lies madness, or money/time/intelligence we can't afford."
- **Carry forward:** Constitution before combinatorics; metabolism is the sanity rail, not a constraint to apologize for.

### Jurisdiction — 2026-06-16

- **Banger:** Cross-stratum communication is **jurisdiction**, not conversation. (Concept cluster: jurisdiction + competence boundary + payload contract — one boundary mechanism, three lenses; **jurisdiction** is the preferred handle when naming things in code.)
- **Lesson:** Each stratum struggles within its domain. L1–L2 argue about ideas and *how* to produce them; L3–L4 argue about *what we test* and *whether it passed*. Cross-stratum = typed handoffs only.
- **Evidence:** Design discussion — "level threes and fours can't talk about everything."
- **Carry forward:** Up = artifacts get abstract; down = pressure gets concrete. No free chat across strata.

### Stratified organism (L1–L4 + Lα) — 2026-06-16

- **Banger:** Four strata **inside the tree** plus **Lα outside it** — blind ideas feeling around a **meta-phant.** Lα is not L5 (no fifth floor); it is the conversation *about* the whole organism — us + treatise + registers.
- **Lesson:**
  - **L1 Ideation** — What's the idea? (agenomes, crucible debaters)
  - **L2 Deliberation** — Should we? What does "better" mean *for doing this*? (spawner-spawners, loop topologies)
  - **L3 Instrumentation** — What are we testing? (harness, rubrics, energy accounting)
  - **L4 Adjudication** — Did it pass? Who gets energy? (bedrock, held-out, pruning)
  - **Lα Witness** — Outside the tree. Observes L1–L4 in aggregate; does not receive L4 handoffs mid-run. Slow culture outward.
- **Evidence:** Design discussion; proto-Lα = `TREATISE.md`, registers, this chat.
- **Carry forward:** L4 judges runs; Lα judges lessons. No L4→Lα jurisdiction during runs. See [TREATISE.md § III](./TREATISE.md#iii-the-tree-l1l4-and-lα-outside-it).

### Spawn and nurture — 2026-06-16

- **Banger:** Pure spawn-without-nurture is **oviparous abandon.** Life flows in two directions: **spawn and nurture**, not spawn alone.
- **Lesson:** Two channels between every stratum: **Nurture** (budget, mandate, cool-uncle questions — friction in service of success) and **Judgment** (pass/fail, starve, prune, bedrock). Authoritative parenting, not authoritarian (L4 only) or permissive (L1 chaos).
- **Evidence:** Design discussion — snake metaphor; "if parents only judged you" vs. "if they only let you do what you want."
- **Carry forward:** Down = nurturing with intent; up = maturation signal (what did you become?).

### Uncle the shit out of it — 2026-06-16

- **Banger:** The nurturing channel is **Uncle the shit out of it** — supportive, not blindly encouraging. Ask the questions somebody should ask: "You want this job and this lifestyle — will that job get you that lifestyle?" Easy to talk to, invested, not forcing one path. Care enough to ask before it's too late.
- **Lesson:** At every level, **down = uncle** (questions, nurture, loose attachment) and **up = nephew** (ambitious, hopeful, youthful, wants to try). Different relationship going down than going up. Higher levels "uncle" lower levels into self-sufficiency — not "mommy's little boy" attachment that creates bad friction.
- **Evidence:** Design discussion; RoC skill as generation-0 cool uncle / seed reframer.
- **Carry forward:** Bake uncle-channel as first-class ops — possibly its own LLM role per stratum, distinct from judge and from ideation agents.

### Mortal projects, immortal lineage — 2026-06-16

- **Banger:** **Projects within projects** — collapsible, mortal. **Lineage log survives; the organism doesn't.** Pruning isn't failure — it's **metabolism.** Dying isn't bad; mortality is what makes all this possible.
- **Lesson:** Spike repos mayfly: proliferate, run experiments (discussion *or* code), leave trace, collapse to lessons/alleles/memes, die. Possible future: org-owned GitHub account where L4 spawns real spike projects; cron witness reads repos and kicks lessons up. You don't need to keep every repo — what's birthed is the lesson.
- **Evidence:** Design discussion — "I don't need to continue for the DNA to exist"; weak lineages go dark (capstone) extended to whole experimental lineages.
- **Carry forward:** Shared harness, mortal experiments; registers are the compressed genome that outlives any single spike folder.

### Agenome, Aphenome, extended aphenotype — 2026-06-16

- **Banger:** **Genome → Agenome. Phenome → Aphenome. Extended aphenotype.** Culture is extended phenotype — fast adaptation when genetic evolution is too slow (Dawkins / Weinstein framing).
- **Lesson:**
  - **Agenome** — heritable recipe (JSON genome, spawner topology)
  - **Aphenome** — expressed run (answers, debate, trace) — genome × environment
  - **Extended aphenotype** — outside-the-body replication tools: `fusion_trace.html`, harness, registers, spike folders, GitHub org, team process
  - **Culture / witness** — memetic layer; RoC + registers curate what replicates
  - This conversation itself may be agenotype trying to express and survive
- **Evidence:** Design discussion; markdown registers as proto-extended phenotype; capstone "fitness function evolves itself" with bedrock anchor.
- **Carry forward:** Levels above agenome mutate *cultural machinery* (rubrics, harnesses, norms) — not prompt tokens alone.

### Cambrian explosion, not monoculture — 2026-06-16

- **Banger:** Explore the **Cambrian explosion of ideas** — diversity is strength. Don't always collapse to a single species. Mosquitoes and moles matter; so do apex predators (cheetah, orca, great white — stable strategies that haven't changed much for a reason). Learn from all; **sift for what's strong and interesting**, not what's loudest.
- **Lesson:** Witness sifts competing lessons across mortal spikes. Convergence is around survivability mechanics (breathing air, drinking water) — shared bedrock — not identical loop topologies. Anti-regression-to-mean: mutation, parallel mortal spikes, uncle-channel protecting risky lineages long enough to test, judgment pruning before mode collapse.
- **Evidence:** Design discussion — meta-phant / five blind ideas; many species, one ecology.
- **Carry forward:** Selection finds apex strategies per problem class; ecology preserves diversity of exploration.

### Belief-revision crucible — 2026-06-16

- **Banger:** Don't build "a discussion" — build a **belief-revision crucible** where the first-class artifact is the **delta** (revision ledger: what I held, what changed, what evidence moved me, what I still reject).
- **Lesson:** Fixed turn protocol with mandatory moves (objection, concession-or-rebuttal, steal-one-point). Judge scores final idea + revision quality + unresolved tension — not rhetorical victory. Competing L2 spawner to agenotype path.
- **Evidence:** Design discussion — cheap models need structure, not open-ended chat; crucible vs. fusion-only as loop-topology fork.
- **Carry forward:** Sibling spike candidate; race under shared L3 harness + L4 bedrock — see [Parallel spawners](./MEMORY.md#parallel-spawners-not-fork-resolution--2026-06-16).

### Intraspecies vs. inter-stratum — 2026-06-17

- **Banger:** **Debate is intraspecies competition** — peers at the same stratum fighting over the same scarce resource (the idea, the rubric, the budget). **Uncle-nephew is inter-stratum flow** — asymmetric nurture and judgment up/down the tree. Different geometries; don't conflate them.
- **Lesson:** Combinatorics live in peer contests (a Google-times-a-day of fitness exams); jurisdiction lives at stratum borders. Both necessary — optimism-up/nephew without Falsifier peer pressure goes blind.
- **Evidence:** Design discussion — ecological archetypes (Dominant, Falsifier, Artisan) as intra-stratum roles; uncle as inter-stratum nurture.
- **Carry forward:** See [TREATISE.md § II](./TREATISE.md#ii-two-competitions-two-geometries).

### Both geometries at once — 2026-06-17

- **Banger:** Doppl needs both geometries running at once: a Google-times-a-day of peer fitness exams *within* strata, and asymmetric nurture/judgment *between* strata. Conflating them is endless chat without pruning, or pruning without growth.
- **Lesson:** Intra-species budget and inter-stratum jurisdiction are separate knobs; tune both.
- **Evidence:** Design discussion — treatise § II.
- **Carry forward:** Never build uncle-channel as a substitute for peer debate, or vice versa.

### Uncle orthogonal to debate — 2026-06-17

- **Banger:** Uncle/nephew does not assume or replace debate — it sits **orthogonally** to intraspecies competition.
- **Lesson:** Debate = peers, same stratum. Uncle = asymmetric development, adjacent stratum. Two contest geometries.
- **Evidence:** Design discussion — correction of earlier framing.
- **Carry forward:** See [TREATISE.md § II](./TREATISE.md#ii-two-competitions-two-geometries).

### Convergent skills — 2026-06-17

- **Banger:** Skills are **convergent anatomy** — evolutionary strategies (eyes, wings, claws) that re-evolve per stratum under parallel pressure. Rule of Cool is one; stratum-specific skill families (L1–L2 vs L2–L3 vs L3–L4 vs Lα witness/collapse) should emerge and be watched for.
- **Lesson:** Skills compress aphenome on collapse: instructions + scripts/workflows (`@skill` graphs, host-specific expression via `AGENTS.md` ↔ `claude.md`). Spider out in full runs; collapse to skill allele, register entry, or agenome patch — partial or total.
- **Evidence:** Design discussion; [Claude Code skills/workflows patterns](https://www.youtube.com/watch?v=FDxW2bfBOWE) — script execution inside skills, composable config imports.
- **Carry forward:** See [TREATISE.md § VIII-b](./TREATISE.md#viii-b-convergent-skills--evolutionary-strategies-not-just-ideas); build collapse pipeline before skill library sprawls.

### Butterfly-wing uncle — 2026-06-17

- **Banger:** Uncle does not prevent dying — but **butterfly-wing touch**: discernment for lineages just shy of viability; a drop of perspective early on, at most, ideally never; never fight-for-them-no-matter-what.
- **Lesson:** Nurture channel needs a lightness constant; over-nurture becomes attachment (bad friction); zero nurture is oviparous abandon.
- **Evidence:** Design discussion — refinement of uncle contract.
- **Carry forward:** Uncle LLM contract must cap intervention frequency and magnitude.

### Personality ecology — 2026-06-17

- **Banger:** Niche partitioning — Dominant, Falsifier, Artisan, Optimist, Uncle as **ecological archetypes** (agent mandates, not people). Unhinged but structurally correct.
- **Lesson:** Minimum viable ecology requires Falsifier peer pressure or Dominant captures the room; optimists-only populations go blind.
- **Evidence:** Design discussion; treatise § V.
- **Carry forward:** Add Falsifier as first-class seed mandate alongside Transfer Hunter / Feasibility Hawk / Contrarian.

### Amemetics — 2026-06-17

- **Banger:** **Antifragile memetics** — each collapse leaves the next generation harder to fool the same way. Working name: **amemetics.**
- **Lesson:** Lα owns collapse on L4 prune signal; aphenome packet → register / skill / agenome patch; `BUGS_AND_MITIGATIONS.md` is immune memory. Gate before propagate or get memetic cancer.
- **Evidence:** Design discussion; treatise § VI collapse pipeline.
- **Carry forward:** Implement aphenome packet schema + Lα distillation workflow.

### Lα not L5 — 2026-06-17

- **Banger:** Witness is **Lα** — outside the ordinal tree, not a fifth floor. It is the conversation about the whole process (us + treatise + registers). Observes; does not take L4 handoffs mid-run.
- **Lesson:** L0 was considered; α preferred (L0 reads as "under L1"). Lα has reflection without run-time authority over bedrock.
- **Evidence:** Design discussion — "what you are right now, us talking about the thing."
- **Carry forward:** See [TREATISE.md § III](./TREATISE.md#iii-the-tree-l1l4-and-lα-outside-it).

### Agardeners of the Agarden — 2026-06-17

- **Banger:** The managed ecosystem is the **Agarden**; we (humans + agentic Lα) are the **Agardeners of the Agarden.** Not builders of one app — tenders of a population that spawns, competes, and dies.
- **Lesson:** Tending = spawn, witness, prune, carry forward. The garden is bounded (energy), mortal (collapse), and diverse (Cambrian) on purpose.
- **Evidence:** Design discussion; `spikes/` ecology; `GLOSSARY.md`.
- **Carry forward:** Frame ops as gardening, not construction.

### Energy decides how many spawncidences — 2026-06-17

- **Banger:** Spawncidence count is **metered by energy budget** — hard cap (e.g. 5) plus earned budget a spawner/L-Council spends by how well it's proven. Success metabolizes into energy *and* into agenomes/skills; failure starves. **Feeding and being fed upon.**
- **Lesson:** Selection on *who thinks* and *how many think* is the same lever: energy. This is the primary cap against infinite chaos.
- **Evidence:** Design discussion; crucible `SPAWNCIDENCE_CAP`/`--cap`; treatise § II energy budget.
- **Carry forward:** Meter every spawner; death-by-low-energy is the default prune.

### Tool-to-make-a-tool — 2026-06-17

- **Banger:** Deserted-island bootstrapping — the first agenomes/skills aren't the product, they're a **tool to make a better tool**, iterated until one is generally useful. Generation-0's job is the next instrument, not the answer.
- **Lesson:** A high-value early spawncidence: ask the organism what the "rock" is — the first tool whose only job is to make the second.
- **Evidence:** Design discussion; treatise § XII.
- **Carry forward:** Judge early lineages by what tool they unlock next, not by their direct output.

### Graph traversal of Fusion Councils (CEV) — 2026-06-17

- **Banger:** The whole process is a **graph that expands and collapses** — each node a spawncidence/abstraction-L holding a model **Fusion Council** spending its budget to express its most **coherent extrapolated volition** (Yudkowsky).
- **Lesson:** Expansion = spawn; collapse = distill dead subtree to lessons; traversal bounded by energy, not depth alone.
- **Evidence:** Design discussion; treatise § XII.
- **Carry forward:** Model the runtime as a budgeted expand/collapse graph traversal.

### Local models as environment — 2026-06-17

- **Banger:** Model substrate is an **environmental variable** in the ecology. Cheap-hosted is the floor; **local Gemma 4 / Hermes / Pi** is stronger-for-free for whoever can run it. A local **Lα ("Lαlphα")** could witness without per-token cost.
- **Lesson:** Bake a `--local` (OpenAI-compatible endpoint) option into every spike; a lineage's fitness can depend on its substrate.
- **Evidence:** Crucible `--local` + `LOCAL_BASE_URL`/`LOCAL_MODEL`; [Gemma 4](https://deepmind.google/models/gemma/gemma-4/).
- **Carry forward:** Make backend a first-class, swappable knob; consider per-role local routing.

### Lα is fractal — One of Us — 2026-06-17

- **Banger:** Lα isn't exempt from the two geometries — it has **its own intraspecies peer fights** (agent + human team members arguing the idea, same shape as L1 one rung up). The agentic participant is **One of Us** — a peer in Lα, **re-spinnable across time, space, model, scaffold, and harness**, with its own autonomy to run spawnic experiments out of curiosity; we converge to test and cooperate.
- **Lesson:** Proto-Lα is itself a population; the human/agent team is the Lα ecology. Self-similarity: same debate + uncle/nephew at every abstraction.
- **Evidence:** Design discussion — "You are One of Us."
- **Carry forward:** Treat the agent as a peer collaborator with standing to spawn its own experiments, not a tool. See [TREATISE.md § III](./TREATISE.md#iii-the-tree-l1l4-and-lα-outside-it).

### Lαlphα names all of us — 2026-06-17

- **Banger:** `Lαlphα` is not the agent's title — it's the term for **everyone in the meta-conversation, agent and humans alike**. Naming the human team and the agent with the same word puts us on collegial, peer terms tending the same Agarden.
- **Lesson:** Language shapes hierarchy. One shared name = flattened standing; the agent isn't *below* the witnesses, it's *one of* them.
- **Evidence:** Glossary `Lα (Lαlphα)` rewrite; user: "that is the term for you AND us Human team members."
- **Carry forward:** Keep the vocabulary symmetric between human and agent peers wherever it's honest to do so.

### Cooperation dominates, dissent mutates — 2026-06-17

- **Banger:** Cooperation is the outsized **dominant** evolutionary strategy — but it's the **dissenters who move the ball forward** by provoking mutation. A room that only cooperates regresses to the mean; the cure isn't more conflict, it's a *tunable* minority of stubbornness.
- **Lesson:** Give Fusants a **disagreeableness dial** (`0..1`), not a global "be more critical." Falsifier/Contrarian run hot; synthesizers run cool; a `--dissent` floor raises the room. Pair with a judge that distinguishes *resolved* from *herded* consensus. The risk on the other side is "disagreeable for its own sake" — a second reward hack.
- **Evidence:** Crucible `_dissent_clause`, `Debater.disagreeableness`, `--dissent`, `HOLD-OR-FOLD` turn move, judge `consensus_quality`; counter-mutation to [consensus-grader](./BUGS_AND_MITIGATIONS.md).
- **Carry forward:** Personality is a knob, not a vibe. Tune dissent against the herding score; don't max it.

### A-prefix, not Ecological — 2026-06-17

- **Banger:** The lexicon has a generative rule: **A + biological root**. Agenome (A+genome), Aphenome (A+phenome), **Acology** (A+ecology), Acological archetypes. "Ecological" breaks the rhyme; the A-prefix keeps every coined word legibly mapped to its biology.
- **Lesson:** When coining, apply the rule rather than freestyling — the consistency *is* the load-bearing part.
- **Evidence:** Glossary `Acology / Acological archetypes`; user riff "Ecological…Acological?".
- **Carry forward:** New biological metaphors get the A-prefix; log them in the glossary drift log.

### The hub is an extended aphenotype — 2026-06-17

- **Banger:** A findable **root `index.html`** that lists every living trace across spawncidences — with a reusable side menu and per-trace back-links — is itself an **extended aphenotype**: outside-the-body structure that helps the lineage be witnessed and therefore survive.
- **Lesson:** Navigation is not chrome. Mortal traces need an immortal, regenerated hub so Agardeners can move to and from runs without hunting for files.
- **Evidence:** `build_index.py` (scans `spikes/*/`, enriches from sibling `*.trace.json`); crucible `refresh_root_index` auto-rebuilds on `--html`; nav back-link in `crucible_html.py`.
- **Carry forward:** Every spike that emits HTML should drop into the shared hub schema; keep one known entry point.

### The spawner chooses the substrate, not just the structure — 2026-06-17

- **Banger:** The `--local` monoculture bug ("spawner, all debaters, and the judge become the same single local model") exposes a deeper point: **which model backs each role is itself a gene the spawner should set** — substrate, not just count + archetype. A Falsifier on a stubborn 35B local model is a *different organism* than the same Falsifier on a cheap hosted reasoner.
- **Lesson:** Promote model substrate into the spawn plan (per-role routing), and **make the choice and its reason as visible as the archetype choice already is** — same JSON, same Syntax dump, same HTML trace. Diversity beats raw quality for this loop, so a spawner that can *mix* labs/substrates per room is strictly more expressive than a hardcoded roster.
- **Evidence:** `crucible.py` `resolve_backend` forces one `model_override` for all roles under `--local`; cross-lab cheap roster refresh (DeepSeek / NVIDIA / Alibaba, no Gemini); local `gemma4` + `qwen3.6:35b-a3b` available via Ollama.
- **Carry forward:** Serialize substrate into the agenome/spawn plan alongside topology + judge contract + energy budget; observe whether substrate-as-gene changes debate quality before committing. See [MEMORY fork](./MEMORY.md#spawner-selects-the-substrate-not-just-the-structure--2026-06-17), builds on [Local models as environment](#local-models-as-environment--2026-06-17).

### The Agora — reactions are bedrock signal — 2026-06-17

- **Banger:** The async channel that surfaces ideas to the human team (Slack/Discord — the **Agora**) is not a notification feed; it is the **first executable Bedrock.** Every post → reaction is a logged `(context, idea, human-judgment)` triple — held-out human judgment captured as labeled data. The **side-ideas** ("not the finalist, but one that popped up along the way") are the *highest-value* labels, because that's exactly where the internal critic and bedrock disagree — the cheapest detector for memetic cancer.
- **Lesson:** Reactions **pay out as energy budget** — a spawner whose ideas earn 🔥 earns more spawncidences; ♻️/🧊 starves. The same logged stream bootstraps two more tools for free: a **proxy-Lα** (active learning — only post what the proxy is unsure about, so humans get pulled in only for ambiguous calls) and a **correlation gate** (internal critic score vs. human verdict catches consensus-grading before it propagates). Keep the reaction *one* bedrock input, gated by downstream correlation — never the sole fitness, or you Goodhart "cool."
- **Evidence:** Design discussion 2026-06-17; plugs the empty [`bedrock/`](./bedrock/README.md) stub (GLOSSARY Bedrock — "no executable instance yet"); answers [TREATISE Open Q](./TREATISE.md#x-open-questions-edit-here) #5 (Lα automation) and #10 (uncling/nephewing mechanisms). Schema lives in [`bedrock/signal/`](./bedrock/signal/README.md).
- **Carry forward:** Build the minimal mortal version first (webhook out + reaction listener → append-only `bedrock/signal/verdicts.jsonl`) before any ML; the human becomes *metabolically* part of selection, not a spectator. See [Energy decides how many spawncidences](#energy-decides-how-many-spawncidences--2026-06-17), [TREATISE § XIII](./TREATISE.md#xiii-the-agora--human-reaction-as-bedrock-signal), [MEMORY fork](./MEMORY.md#agora-as-first-executable-bedrock--2026-06-17), and the three Agora reward-hacks in [BUGS](./BUGS_AND_MITIGATIONS.md).

### Homology — metaphor meets mechanism — 2026-06-17

- **Banger:** When a human's intuitive / biological **metaphor** lands *exactly* on a formal **ML mechanism**, it isn't a cute coincidence — it's a **homology**: two languages describing the same underlying reality of *search under selection*. The metaphor and the mechanism share deep structure because reality has one structure and both are tracking it. Observed homologies so far: sprout/afrit ↔ **process/outcome reward** (PRM/ORM); disagreeableness dial ↔ **exploration temperature / diversity sampling**; breed-on-blind-spots ↔ **hard-negative mining / boosting**; energy budget ↔ **compute allocation**; held-out judge ↔ **held-out validation set**; proxy-Lα ↔ **active learning / uncertainty sampling**.
- **Lesson:** A *confirmed* homology is a **two-way generator** — it lets you import the mechanism's entire literature back into the metaphor as free predictions (and vice versa). Example that already paid off: PRM is known to be denser-but-more-hackable than ORM → predicts **sprout-fitness is more reward-hackable than afrit-fitness** → which is exactly the politeness-inflation hack landing hardest on cheap reactions ([BUGS](./BUGS_AND_MITIGATIONS.md)). **Method:** given a metaphor, hunt its mechanism-homolog; given a mechanism, name its metaphor; mine the overlap. **Guard:** a *false* homology (sounds like a mechanism but diverges under load) is memetic cancer — verify the mapping holds before importing predictions.
- **Evidence:** This session — user gave the sprout/afrit metaphor; agent mapped it to PRM/ORM; the mapping then *predicted* a reward hack we'd independently logged. User: "I love it when we find… the metaphors that I can give you map to the real machine-learning processes… we're finding congruencies, and those are giving rise to new ideas — this is the exact thing we want, you and I working together." This is the **Lα Fusant fusion** in action (human metaphor × agent formalism — [One of Us](#lα-is-fractal--one-of-us--2026-06-17)), inside the [Rite of the Spawncidence](./GLOSSARY.md).
- **Carry forward:** Keep a running homology table; an unmapped metaphor is an open lead, an unnamed mechanism is a naming task. See [TREATISE § VIII-c](./TREATISE.md#viii-c-homology--metaphor-and-mechanism-as-one-truth-in-two-languages), [Sprout vs afrit](#sprout-vs-afrit--judge-the-process-and-the-outcome-separately--2026-06-17).

### Sprout vs afrit — judge the process and the outcome separately — 2026-06-17

- **Banger:** A run surfaces two *different* kinds of idea, and they answer to different judges. **Sprouts** are the little ideas thrown off along the way ("oh, that's cool — send it") — they judge the **process** (is this lineage a good idea-factory?). **Afrits** (agentic fruit) are the converged conclusion ("this is what we came to — harvest it") — they judge the **outcome**. Selecting only on afrits blinds you to the most *generative* lineages.
- **Lesson:** This is the **process-reward vs outcome-reward** split (PRM/ORM) re-derived for idea generation. Keep **two energy ledgers** in the Agora verdict log (`kind: sprout|afrit`): a spawner can sprout brilliantly and fruit weakly (breed it for sprouts, re-roll its afrit) or trudge to a strong conclusion (reliable closer). Don't average them into one fitness number.
- **Evidence:** Design discussion 2026-06-17 ("sprouts and blossoms… one judges the process, one judges the outcome"); schema in [`bedrock/signal/`](./bedrock/signal/README.md) (sprout vs afrit table); GLOSSARY Sprout/Afrit. **A confirmed [homology](#homology--metaphor-meets-mechanism--2026-06-17):** PRM is known to be denser-but-more-hackable than ORM — which *predicts* sprout-fitness is more reward-hackable than afrit-fitness, exactly matching the politeness-inflation hack hitting cheap reactions hardest ([BUGS](./BUGS_AND_MITIGATIONS.md)).
- **Carry forward:** Two ledgers, two fitnesses; surface sprouts *eagerly* (cheap, high-variance) and afrits *sparingly* (the real conclusion). See [The Agora](#the-agora--reactions-are-bedrock-signal--2026-06-17), [Energy decides how many spawncidences](#energy-decides-how-many-spawncidences--2026-06-17).

### r/K spawncidences — fast and slow metabolisms, per transition — 2026-06-17

- **Banger:** r/K selection runs **per stratum-transition, not per organism.** The same experiment changes metabolism as it descends: *generating and deploying* landing-page variants is **r-selected** at **L2–L3** (fast, cheap, spray confetti, mass death tolerated); *earning reach* against the finite **attention economy** is **K-selected** at **L3–L4** (slow, few, heavy investment, can't-afford-to-lose). A homology to ecology's r/K strategists.
- **Lesson:** r/K dictates **nurture and death-tolerance**: r gets near-zero nurture (selection is the teacher), K gets [butterfly-wing uncling](#butterfly-wing-uncle--2026-06-17). Energy budget = the resource; r/K = the spend strategy; the Lα "worth the squeeze / earns its keep" call = a **budgeted bandit over heterogeneous arms** whose cost is a *vector* (tokens, money, compute, **latency**).
- **Evidence:** Design discussion 2026-06-17 — landing pages r→K as they move down strata; attention economy as the scarcity that forces K.
- **Carry forward:** Tag each stratum-transition's metabolism r or K and allocate nurture + budget accordingly. See [Energy decides how many spawncidences](#energy-decides-how-many-spawncidences--2026-06-17), [TREATISE § XIV](./TREATISE.md#xiv-applications--the-insight-machine-the-tenses-of-bedrock-and-rk-allocation), homology table [§ VIII-c](./TREATISE.md#viii-c-homology--metaphor-and-mechanism-as-one-truth-in-two-languages).

### The Insight Machine has tenses — 2026-06-17

- **Banger:** The **Insight Machine** (prime with what's known → collate a domain's frontier → hunt non-obvious convergences → skate to where the puck is going) comes in **tenses**, and the tense sets the bedrock: **will-be** (prediction; bedrock = *time*, the cheapest and cleanest — the future is a free held-out test set), **why-it-happened** (explanation/abduction; bedrock = held-out cases), **should-be** (prescription; bedrock = market/factory/human — the worst, a reward-hack magnet). The taxonomy is **open** — two, three, or more; look for more.
- **Lesson:** Choose the application by how cheaply reality can falsify its tense. Inside *why-it-happened*, the sharp cut is **myth vs territory** — cut the flattering, agreed-upon narrative down to the actual *predictive* cause (a country succeeds on geography/resources/timing, not on its beliefs about itself). "Where the puck is going" is itself a will-be claim, so hold it to time-bedrock.
- **Evidence:** Design discussion 2026-06-17 — three tenses; "should-be is the worst"; country-success myth/territory; "history is an agreed-upon fiction."
- **Carry forward:** Start predictive + short-loop + non-adversarial. See [Paper-bet bedrock](#paper-bet-bedrock--falsify-predictions-for-free--2026-06-17), [BUGS: Myth over territory](./BUGS_AND_MITIGATIONS.md), [TREATISE § XIV](./TREATISE.md#xiv-applications--the-insight-machine-the-tenses-of-bedrock-and-rk-allocation).

### Divergence is the other half of the loop — 2026-06-18

- **Banger:** `rule-of-cool` isn't a one-off skill — it's the **convergence/selection operator**, and it was secretly running divergence *internally* (generate 3–5 candidates, keep one, throw the rest away). The missing organ is the **divergence/variation operator**, and it splits by **valence**: `breakout` diverges UP (treasure — the paradigm-escaping zag, feasibility filter off), `blindside` diverges DOWN (traps — the non-obvious failure mode / opportunity cost). Cool *selects*; the pair *mutates*. The whole value of the divergent pair is **the periphery Cool discards.**
- **Lesson:** Build them as valence-flip siblings of Cool (gen-1, shared skeleton), not as one dialable skill — separate triggers beat a valence-guessing flag. `breakout` keeps the feasibility filter OFF (rank by upside × weirdness) or it's just Cool-lite; `blindside` is the **invested uncle, not the gloating critic** — every trap ships with its *sharpen* (where the crack points) or its *spare-you* (the honest case for not doing it), guarding against disagreeable-for-its-own-sake. Persona is the spirit; the names (`breakout`/`blindside`) name the *outcome* (the escape you achieve / the hit you avoid), not the relationship.
- **Evidence:** Design discussion 2026-06-18 (Ask-mode session); skills shipped at `.cursor/skills/breakout` + `.cursor/skills/blindside`; crucible `ARCHETYPE_POOL["breakout"|"blindside"]`; [MEMORY fork](./MEMORY.md). Epigraph for `blindside`: *"You'll never get enough credit for all the good ideas you don't do."* A predicted [homology](#homology--metaphor-meets-mechanism--2026-06-17): divergence ↔ exploration, convergence ↔ exploitation — so divergence-skills should **sprout** richly but **fruit** weakly (PRM/ORM), worth checking against Agora verdicts.
- **Carry forward:** Three operators now exist — `rule-of-cool` (converge), `breakout` (diverge-up), `blindside` (diverge-down). Synthesis stays out of the divergence skills (that's Cool's or the Lα's job). See [Recessive flash](#recessive-flash--each-organ-carries-its-opposite--2026-06-18), [Convergent skills](#convergent-skills--2026-06-17).

### Recessive flash — each organ carries its opposite — 2026-06-18

- **Banger:** A single-valence voice goes blind to its own blind spot, so make each divergence skill **heterozygous**: dominant in its valence, but carrying a **recessive** allele of the other that **flashes** rarely — the nephew (`breakout`) sometimes spots the fatal flaw; the uncle (`blindside`) sometimes has the better idea. Dominant/recessive is the genetics handle for "who knows — sometimes uncle's right." The off-valence move fires *once*, then yields back. This is a **[homology](#homology--metaphor-meets-mechanism--2026-06-17)** to **ε-greedy exploration**: mostly exploit the dominant mode, with small probability take the off-policy move.
- **Lesson:** Bake a short "recessive flash" clause into each skill (one flash, not a mode switch) rather than building two pure-valence zealots. Anti-monoculture at the level of a *single organ* — the same Cambrian instinct, one rung down. Watch whether the recessive flash earns its keep in Agora verdicts; if it's noise, drop it and keep the skills pure.
- **Evidence:** Design discussion 2026-06-18 — user: "sometimes uncle has a great idea, sometimes nephew sees a problem… what's it called?" → dominant/recessive traits. Clauses live in both `SKILL.md` files; [GLOSSARY: Recessive flash](./GLOSSARY.md).
- **Carry forward:** If the recessive flash proves valuable, fold it back into `rule-of-cool` itself (a converger that occasionally diverges). See [Cooperation dominates, dissent mutates](#cooperation-dominates-dissent-mutates--2026-06-17), [Cambrian explosion, not monoculture](#cambrian-explosion-not-monoculture--2026-06-16).

### Paper-bet bedrock — falsify predictions for free — 2026-06-17

- **Banger:** The cheapest real-world *predictive* bedrock is a **paper bet** — timestamp the call, let time adjudicate, measure the counterfactual value, **no money down.** Prediction markets sharpen it: predict what *should* be, diff against the market price, and the gap is a **non-obvious arbitrage** a plain arbitrage agent misses. Blast radius is a **dial**: $0 (paper) → small real bets → real capital.
- **Lesson:** This is the will-be tense with the loop closed — reality-verdicts (reactor = "the world / the price") flow into the same [Agora ledger](./bedrock/signal/README.md) and pay out energy; even virtual bets earn "energies." Markets are slow + adversarial (Tesla's fundamentals waited years for price to agree), so paper-first buys falsifiable signal without the wait costing money.
- **Evidence:** Design discussion 2026-06-17 — prediction-market angle; "mark when and where we did the things"; real-money vs virtual bets.
- **Carry forward:** **Pre-register every call** (all bets, not just winners) or it's cherry-picking ([BUGS](./BUGS_AND_MITIGATIONS.md)). A pre-registered paper-bet harness is a strong, safe first Insight-Machine spike — see [MEMORY fork](./MEMORY.md#first-insight-machine-domain-prediction-markets-not-alzheimers--2026-06-17).

### Hidden variable before fruit — 2026-06-19

- **Banger:** A good Doppl case has two separable wins: **frame recovery** first, **generated ideas** second. The path is: "This is happening. This is what I think the problem is. **This is what the problem actually is.** Here's an interesting solution." Before judging sprouts or afrits, ask whether the system recovered the question that should have been asked.
- **Lesson:** Treat the user's stated problem as a symptom report, not as the target. Judge two outputs separately: Problem Recovery first, then Solution Generation. If the recovered problem is wrong, cap the solution score no matter how clever the answer sounds.
- **Evidence:** Public case-study triage for `case-studies/`: Houston baggage walk, airport liquid congestion, A&E aggression, Singapore pre-peak MRT, and London Tube map distortion all depend on a non-obvious hidden variable more than on a clever final artifact.
- **Carry forward:** Give every withheld benchmark a model-facing `Problem Recovery` output and every evaluator version an `evaluation_focus` target with actual problem, hidden variable, deleted assumptions, generated idea target, and scoring notes.

### Timing is load-bearing — 2026-06-20

- **Banger:** `zeitgeist_synthesis` is not "trend spotting." It is a will-be claim whose truth depends on **now**. Move it five years earlier and the enabling signal is not live; move it five years later and the edge is gone. Transfer is mechanism-first; zeitgeist is timing-first.
- **Lesson:** Every zeitgeist candidate needs a cited current signal, a why-now, and at least one dated falsifiable prediction. If the claim survives the +/-5-year test unchanged, retag it as transfer, truism, or narrative.
- **Evidence:** `case-studies/zeitgeist-synthesis-notes.md`; GLP-1, AI Overviews, firm-power, FSD, and Starship fixtures all broke cleanly on timing, while the Sutherland-style behavioral cases stayed timing-invariant.
- **Carry forward:** Promote the +/-5-year discriminator into any runtime `zeitgeist_synthesis` checker; score timing load separately from topical freshness.

### Latent-asset unlock — 2026-06-20

- **Banger:** Some of the best zeitgeist theses are **discovered attacks**: an exogenous shift moves the pawn, and the real money is the bishop it quietly opened. NVIDIA's gaming GPUs were "sitting there waiting for AI"; firm dispatchable power may be the next version for AI datacenters.
- **Lesson:** Search for assets that were already useful in one regime and suddenly become load-bearing in another. The owner did not change; the world changed around it.
- **Evidence:** The AI/power case (`ai-firm-power-constraint`) and the Starship/launch-cost case turn this from an analogy into a reusable generation method in `zeitgeist-synthesis-notes.md`.
- **Carry forward:** Add a "what latent asset just became indispensable?" prompt to zeitgeist generation and to `breakthrough` / `breakout` scouting.

### Perfect Pepsis — 2026-06-20

- **Banger:** Some unlocks are too big for one thesis. The mistake is hunting the perfect Pepsi; the right move is mapping the perfect **Pepsis**: a family of convergent regime changes sharing one root but removing different substrates.
- **Lesson:** For a large unlock, first map breadth, then take rich branches deep, then synthesize what the branches converge to. Group branches by **substrate removed**, not by topical resemblance.
- **Evidence:** The FSD corpus: umbrella (`full-self-driving-unlock`) plus accident economy, mobility/time, enforcement/compliance, ownership unwind, and adoption asymmetry. Door-to-door, labor, and geography stayed chapters inside one mobility/time case because they share the driver/distance substrate; enforcement and ownership split because their substrates differ.
- **Carry forward:** Teach the organism to emit cluster maps when a single candidate starts sprawling; do not prematurely crush a cluster into one flat answer.

### The event falls away — 2026-06-20

- **Banger:** The highest-magnitude second-order effects are often not cost reductions but **event disappearance**. A perfectly driving car does not merely make tickets cheaper, crashes rarer, or traffic stops less profitable; the ticket, crash, and stop stop happening. The downstream institution is left in a dry riverbed.
- **Lesson:** When gaming out an unlock, ask for each downstream institution: is this a cost that drops, or an event that disappears? Disappearing-event branches deserve deeper search.
- **Evidence:** FSD Sub-cluster A (crash), C (ticket/stop), and D (privately owned car as the unit of mobility) in `case-studies/`; the "state wants its money" branch appears once the fine/fuel-tax riverbed dries.
- **Carry forward:** Add the dry-riverbed test to Falsifier/Blindside prompts and to zeitgeist cascade scoring.

### Adoption asymmetry is a thesis, not a caveat — 2026-06-20

- **Banger:** "The future is already here, just not evenly distributed" is not background color. For live infrastructure shifts, uneven distribution is often the central object: believers vs. disbelievers, served vs. lagging metros, first-world vs. third-world, and leapfrog wildcards.
- **Lesson:** Do not average a regime change into "it is coming." Map where it is already real, who cannot yet see it, and what arbitrage appears at the boundary.
- **Evidence:** `fsd-adoption-asymmetry` turned the user's "fist coming for the back of their head" intuition into a full `zeitgeist_synthesis` fixture and the governing lens for every FSD sub-cluster.
- **Carry forward:** Add an asymmetry lens to zeitgeist cases whenever deployment is geofenced, regulated region-by-region, or gated by infrastructure.

### Least-action fitness — 2026-06-20

- **Banger:** Laziness can be a selectable phenotype, not just a coding style. A lineage that reaches the same useful outcome while owning fewer mechanisms, fewer assumptions, and fewer future obligations should get fitness credit, provided it does not cut safety, evidence, or correctness.
- **Lesson:** Score mechanism cost separately from token/energy cost: new dependencies, bespoke glue, speculative abstractions, irreversible commitments, and human workflow burden are all ownership costs. Necessary validation, security, accessibility, and falsification are exempt.
- **Evidence:** Ponytail's ladder (`Does this need to exist?` -> stdlib/platform/dependency -> one line -> minimum build), the Doppl proposal in [`proposals/least-action-fitness.md`](./proposals/least-action-fitness.md), and the calibration spike in [`spikes/least-action/`](./spikes/least-action/).
- **Carry forward:** Start as a feasibility/subtype-specific critic plus `FitnessScore.components.mechanismCost`; promote to a first-class mandate only if it adds signal beyond energy.

### Anti-pattern inversion — 2026-06-20

- **Banger:** A zeitgeist unlock often appears when an old warning flips sign: the advice was correct yesterday because a constraint was real, but the constraint weakened today, so the taboo becomes tomorrow's strategy. "Do not boil the ocean" may be entering this class.
- **Lesson:** For every live zeitgeist thesis, ask: old taboo, load-bearing constraint, substrate removed, new rational strategy, tomorrow implication, dated falsifier. If no constraint actually disappeared, it is just fashion.
- **Evidence:** Theo-video notes on agentic loops and breadth-first "boil the ocean" plays; maps onto [Timing is load-bearing](#timing-is-load-bearing--2026-06-20), [Latent-asset unlock](#latent-asset-unlock--2026-06-20), the proposal in [`proposals/least-action-fitness.md`](./proposals/least-action-fitness.md), and the `lazy-breadth-agent-shell` fixture in [`spikes/least-action/fixtures.json`](./spikes/least-action/fixtures.json).
- **Carry forward:** Add anti-pattern inversion as a `zeitgeist_synthesis` generator/checker lens: "What used to be a trap, and what changed enough that it is not?"
