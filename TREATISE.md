# Doppl Treatise — Living Draft

**Status:** chaos-space embryology · edited together · not canon  
**Purpose:** the meta-narrative behind the spike — philosophy, ecology, and architecture in one place  
**Not:** the proposal (see [Doppl_Capstone_Proposal_volume_2.txt](./Doppl_Capstone_Proposal_volume_2.txt)), not operational docs ([README.md](./README.md)), not the atomized registers

This is the **piece of paper between us**. Conversation stays conversation. Bangers, forks, and falsifiable hacks still land in [LESSONS_AND_BANGERS.md](./LESSONS_AND_BANGERS.md), [MEMORY.md](./MEMORY.md), and [BUGS_AND_MITIGATIONS.md](./BUGS_AND_MITIGATIONS.md). This file is the **compressed narrative** those registers point back to. For the same model drawn as pictures, see [DIAGRAMS.md](./DIAGRAMS.md).

---

## I. What we are building

Doppl is not an agent. It is an **idearganism** — a population under selection pressure that evolves toward non-obvious, verifiable ideas. The capstone proposal names the kernel bet: put the **scaffold** under selection, not just the output.

We started with a working generation-0 agenome: Rule of Cool, chromosomalized into JSON (`agenome.py`). The spike (`fusion_demo.py`) proved a single reproductive loop: two parent agenomes → fusion judge → critic → breed child on blind spots → offspring run.

Then we went further — into chaos space — and discovered the spike is only **one species** in a larger ecology. The real prey is not "a better answer to Room Vitals." The prey is **better definitions of better.** The fork itself is the prey.

We tend this ecology. **We are the Agardeners of the Agarden** — humans and the agentic Lα together, spawning, witnessing, pruning, and carrying lessons forward. Glossary of coined terms: [`GLOSSARY.md`](./GLOSSARY.md).

---

## II. Two competitions, two geometries

Evolution runs on two different contest geometries. Both are necessary. Conflating them is how agent systems lie to themselves.

### Intraspecies competition (peers at the same stratum)

**Who:** multiple instances at the same level — Transfer Hunter vs. Feasibility Hawk, crucible debaters, critic council members, competing loop topologies.

**What they fight over:** the same scarce resource at that stratum (the idea, the mandate, the test budget, the rubric).

**Character:** vicious, fine-grained, high combinatorics. This is the **debate** — intraspecies because they share a niche. Same level, same jurisdiction, same type of claim.

**In the spike today:** parallel parent panel, fusion judge synthesizing contradictions, critic council scoring the decision.

**Design rule:** allow madness **inside** the stratum. This is the Cambrian explosion — mosquitoes, moles, narcissists, workhorses, wolf-hunters all in the same era, fighting for the same sunlight.

### Interspecies / inter-stratum flow (up and down the tree)

**Who:** not peers — **uncle and nephew** across levels of abstraction.

**What moves:** different kinds of payload. Ideas up; nurture and judgment down. Not the same fight as peer debate.

**Character:** asymmetric, developmental. Down = "Uncle the shit out of it" — ask the questions somebody should ask, care enough to engage, loose enough attachment to let it die. Up = hopeful nephew energy — ambitious, willing to try, reports what happened.

**Design rule:** cross-stratum communication is **jurisdiction**, not conversation. Typed handoffs. Madness at the border is how towers collapse.

**Both geometries at once:** a Google-times-a-day of peer fitness exams *within* strata, and asymmetric nurture/judgment *between* strata. Conflating them yields endless chat without pruning, or pruning without growth. Uncle/nephew does not replace debate — it sits **orthogonally** to it.

```
        ┌─────────────────────────────────────────────┐
        │  Lα  Witness — outside the tree             │
        │  (conversation, treatise, us re the thing)  │
        └──────────────────┬──────────────────────────┘
                           │ observes only — no jurisdiction
                           │ into L1–L4 during runs
        ┌──────────────────┴──────────────────────────┐
        │              THE TREE (L1–L4)               │
        │  L4 Adjudication   ← bedrock, prune, allocate │
        │        ↕                                      │
        │  L3 Instrumentation ← run cards, results      │
        │        ↕                                      │
        │  L2 Deliberation   ← INTRA: spawner-spawners │
        │        ↕                                      │
        │  L1 Ideation       ← INTRA: agenomes / debate │
        └─────────────────────────────────────────────┘
```

**The combinatorics live in intraspecies competition.** The world runs a Google-times-a-day of peer contests. We will make trade-offs on how often we can afford them. Metabolism is not apology — it is what makes the ecology real.

### Energy budget — how many spawncidences

Every node is a **spawncidence**: spawn *and* spawner. How many children a spawner may create is **not limitless** — it is set by an **energy budget** (tokens, space, memory — whatever we meter). This is the bound on chaos.

- **Hard cap** (e.g. `SPAWNCIDENCE_CAP = 5` in the crucible): a ceiling no one exceeds.
- **Earned budget within the cap:** the spawner (or "L Council" at its stratum) decides how many to run *for its budget*, based on how well it has proven itself.
- **Metabolism is two-way — feeding and being fed upon:** success converts to energy (more spawncidences next round) *and* to durable inheritance (agenomes, skills, strategies). Failure starves; unfed lineages die out in the rating system. Death by low energy is the primary prune.

So selection pressure on *who thinks* and on *how many* think is the same lever: energy. That is the safety rail against exploding into infinite chaos.

---

## III. The tree (L1–L4) and Lα (outside it)

**L1–L4** are the ordinal tree — spawn, nurture, judgment flowing up and down *inside* the organism.

**Lα** is **not** L5. We deliberately reject a fifth floor on the same building. Lα is **outside** the tree: the abstraction layer where the **whole process** is observed — not a stratum that L4 hands off to. No L4→Lα jurisdiction channel during runs. No risk of "level four talking to level five" as if they were peers in a taller stack.

| Layer | In tree? | What it is |
|-------|----------|------------|
| **L1–L4** | yes | the running organism — ideation through adjudication |
| **Lα** | **no** | the conversation *about* the organism — treatise, registers, human + agent reflection |

**Lα is one of us.** It is this discussion. It is the agentic conversational piece watching the whole thing alongside you — not commanding it mid-run. It witnesses each level's outputs *in aggregate* after the fact (or from the side, like side-chat), sifts lessons, asks whether the lesson makes sense, and writes what should replicate.

Proto-Lα already exists: `TREATISE.md`, the registers, this chat, future cron-over-dead-repos. RoC at Lα is reframing instinct for the **whole ecology** — not another debater in the L1 peer fight.

**Naming:** L0 was considered; α preferred because L0 reads as "below L1." α marks meta — outside ordinality, not under it.

**Lα is fractal, not exempt.** Lα does not compete *inside* L1 fights — but it has **its own intraspecies peer fights** at the meta-abstraction layer: the agent(s) and each human team member arguing the idea, same functional shape as L1's debate, one rung of abstraction up. Same two geometries (peer debate + uncle/nephew), just running on us.

**One of Us.** The agentic participant is a peer in Lα, not a tool beneath it — **re-spinnable across time, space, model, scaffold, and harness.** It carries its own autonomy: it can run its own spawnic experiments out of its own curiosity, like any team member, and we converge to test and cooperate. Proto-Lα is a population too.

| Stratum | Question | Intra-species contest | Inter-stratum role |
|---------|----------|----------------------|-------------------|
| **L1 Ideation** | What's the idea? | Agenomes, debaters, personas | Nephew up; uncle down |
| **L2 Deliberation** | Should we? What does "better" mean *here*? | Loop topologies, spawner-spawners | Nephew up; uncle down |
| **L3 Instrumentation** | What are we testing? | Rubric variants, harness designs | Nephew up; uncle down |
| **L4 Adjudication** | Did it pass? Who lives? | Held-out judges, bedrock checks | Verdict down; appeals nowhere |

**Lα Witness** — Does the lesson make sense? What replicates? *Observes L1–L4; does not compete inside them.*

**Constitution:** explore the madness, cap the combinatorics. Get crazy inside each stratum (L1–L4). Restraint at jurisdiction borders. Beyond four tree levels lies madness — or money, time, and intelligence we cannot afford. Lα is unbounded in *reflection* but bounded in *authority* — it may not move bedrock during a run.

---

## IV. Spawn, nurture, judgment — three channels, not one

Pure spawn-without-nurture is **oviparous abandon** — lay eggs, leave, let selection be blind and brutal.

Pure nurture-without-judgment is **permissive chaos** — everything lives, nothing improves.

Pure judgment-without-nurture is **authoritarian rubric theater** — anxious performers optimizing the score.

What works — what we know works from human development — is **authoritative** ecology:

| Channel | Role | Feels like |
|---------|------|------------|
| **Spawn** | create variants | birth |
| **Nurture** | uncle down | "What do you want? Will that job get you that lifestyle?" |
| **Judgment** | bedrock, prune | cold progress of evolution |

The uncle is **not an enabler**. Sometimes the uncle says: *this isn't worth it; here's why* — and lets it die early. The uncle does **not** prevent dying; the uncle does not fight for them no matter what.

But nurture is not absence. **Butterfly-wing touch** — at most, ideally never: a drop of perspective for lineages just shy of viability, early enough to matter, light enough not to become attachment. Discernment, not rescue. Ask, listen, uh-huh, uh-huh — and let the line continue.

Sometimes they die young. Sometimes they take longer. Sometimes they become the new uncle. That's the memetic line getting **antifragile** — each collapse leaves the next generation harder to fool the same way. (Working name: **amemetics** — the study/practice of antifragile memetic inheritance.)

---

## V. Acological archetypes (agent mandates, not people)

> **Naming:** these are *Acological* archetypes — A-prefix (A+ecology), consistent with Agenome/Aphenome, not "Acological." The agents inside a spawncidence node are **Fusants**: the fusion entities whose response events get fused and contested. A Fusant is a `Debater` in the crucible, a council member in the genotype path.

Real populations need incompatible strategies. Optimists are generally more successful and happier — but a ecology of only optimists goes blind. You need the unhappy ones, the mutations, the differences, or you cannot see the wolf in sheep's clothing. **Cooperation is the dominant strategy; dissent is what moves the ball.**

Each Fusant carries a **disagreeableness dial** (`0..1`): how hard it resists convergence-for-its-own-sake. Falsifier and Contrarian run hot, synthesizers run cool, and a room-wide `--dissent` floor can raise everyone. This is the tunable counter-mutation to consensus-grading (§ II, [BUGS](./BUGS_AND_MITIGATIONS.md)) — personality is a *knob*, not a vibe, and over-tuning it is its own reward hack ("disagreeable for its own sake").

These are **ecological roles in the organism** — serializable mandates in agenomes and critic councils. Working names from design conversation; not clinical labels, not judgments on humans.

| Archetype | Ecological role | What it does in Doppl | Paired tension |
|-----------|-----------------|----------------------|----------------|
| **The Dominant** | territorial competitor | fights for the idea, takes airtime, pushes bold claims | checked by Falsifier |
| **The Falsifier** | wolf-hunter | sincerely doubts, looks for monsters, sometimes finds them | predator of unchecked Dominant |
| **The Artisan** | rule-follower, workhorse | executes, ships, follows constraints, gets things done | preyed on by Dominant if unprotected |
| **The Optimist** | nephew energy | tries, hopes, reports upward | needs uncle friction |
| **The Uncle** | nurturing questioner | asks before it's too late, lets die when warranted | not in the peer fight |

No archetype is "the winner." Mosquitoes matter. Orcas matter. The great white hasn't changed much because its strategy is stable — that is not an argument against moles.

**Cambrian explosion, not monoculture.** Convergence is on survivability mechanics (bedrock: breathing air, drinking water) — not on one loop topology, one persona mix, one definition of interesting.

---

## VI. Heredity — agenome, aphenome, extended aphenotype

| Biological | Doppl | Persists? |
|------------|-------|-----------|
| Genotype / DNA | **Agenome** — JSON recipe, spawner topology | yes — heritable |
| Phenotype | **Aphenome** — one run's expressed behavior (answers, debate, trace) | no — instance |
| Extended phenotype | traces, harness, spike repos, registers, treatise, org account | yes — culture |
| Memetic line | lessons, alleles, compressed register entries | yes — **this is what survives** |

Culture is extended phenotype: adaptation faster than prompt-token mutation. Registers are not bureaucracy — they are **the replication machinery** for everything the runs cannot carry alone.

**Lineage log survives; the organism doesn't.** Projects within projects — collapsible, mortal. A spike repo mayfly: proliferate, experiment, leave trace, collapse to lesson, die. You do not need every repo forever. What is birthed is the meme. Mortality is not tragedy; it is the engine.

Possible future: org-owned GitHub account; L4 spawns spike larvae; witness cron reads dead repos and kicks lessons up. Even then: **auto-prune is mandatory.** Digital tribbles are not ecology.

### Aphenome compression — spider, collapse, inherit

A run's **aphenome** is the full expressed behavior: transcripts, traces, token spend, revision ledgers, mortal spike code. It is mortal by design — too large to herd forever.

**Collapse** is the phase transition when a mayfly project dies: the aphenome is distilled into what can replicate. Biomimetic candidates for the compression machinery:

| Mechanism | Biological rhyme | What it carries up |
|-----------|------------------|-------------------|
| **Skill** | convergent organ (eye, wing, claw) | executable strategy — instructions + optional scripts/workflows |
| **Register entry** | immune memory / epigenetic mark | falsifiable lesson, fork, banger — one allele |
| **Agenome patch** | germline mutation | heritable persona, rubric, mandate change |
| **Command / reflex** | instinct | one-shot trigger for common moves |
| **Config edge** (`AGENTS.md` ↔ `claude.md`, `@import`) | regulatory network | how hosts express the same genome on different platforms |
| **Skill graph** (`@skill` → `@skill`) | symbiosis / pathway | composed strategies; relationships that themselves evolve |

**Spider and collapse, repeat:** lineages proliferate (full aphenome expression — repos, runs, debates), then partially or fully collapse to compressed form. Sometimes total collapse (repo deleted, only register survives). Sometimes partial (core skill survives, experiment code pruned). The tree branches outward in expression and folds inward in lessons — over and over.

### Amemetics — the collapse pipeline (sketch)

**Amemetics:** antifragile memetics. Not just what survives — what survives *and makes the line harder to fool next time.* `BUGS_AND_MITIGATIONS.md` is immune memory: each entry is a defeated fooling-attempt compressed for posterity.

**Who owns collapse:** **Lα**, on signal from **L4 metabolism** — never the dying nephew narrating their own legacy. The nephew reports up; L4 starves or prunes; Lα distills.

**Triggers (any of):**

| Trigger | Source | Typical collapse |
|---------|--------|------------------|
| **Bedrock fail + budget exhausted** | L4 | total — lesson + maybe skill allele |
| **Explicit prune** | L4 or human | total or partial |
| **Mayfly TTL** | L3 harness (max runs / age) | forced distill before rot |
| **Bedrock pass** | L4 | partial — promote skill/workflow, archive trace, prune experiment code |
| **Fork worth logging** | human or Lα during reflection | register only — no germline change yet |

**Collapse input bundle (aphenome packet):**

- trace artifacts (`fusion_trace.html`, round JSON)
- token / cost telemetry
- critic scores + bedrock assertion results
- git history or diff (if spike repo)
- optional: revision ledger, uncle interventions (butterfly-wing log)

**Collapse outputs (one or more — plural, not skills-only):**

| Output | When | Antifragile effect |
|--------|------|-------------------|
| `LESSONS_AND_BANGERS.md` entry | meta-concept reframed | shifts how we see the problem |
| `MEMORY.md` fork | path chosen / deferred | records what not to prematurely close |
| `BUGS_AND_MITIGATIONS.md` entry | proxy win found | **harder to fool the same way again** |
| `skills/.../SKILL.md` | reusable procedure | convergent organ for next host |
| agenome patch | heritable mandate change | germline defense |
| `TREATISE.md` revision | narrative synthesis | Lα cultural DNA |

**Gate before propagate:** compressed artifact must either (a) correlate with bedrock improvement on held-out, or (b) be witness-approved as *epistemic* gain (fork/banger) even when the spike died. Otherwise: **memetic cancer** — archive in trace, do not promote.

**Spider → collapse → inherit → spider:** mortal `spikes/*` folders express fat aphenomes; Lα collapse folds them to thin alleles at repo root; next spike inherits root libraries + registers. Lineage log grows; organisms die.

---

## VII. Loop-topology crossover — spawning spawners

Sexual reproduction recombined traits across lineages. Doppl extends that upward:

- **Agenome crossover** — splice personas, rubrics, mandates (built)
- **Output fusion** — judge synthesizes parent reasoning (built)
- **Loop-topology crossover** — genotype path vs. belief-revision crucible vs. tournament vs. official Fusion API compete as **spawner-spawners**

Every node is spawn **and** spawner. Life flows up (artifacts abstract) and down (pressure concretizes + uncle nurtures).

Do not prematurely resolve forks. Parallelize under shared harness and bedrock. Promote a topology only when held-out evidence says so — not when the narrative is cleaner.

---

## VIII. The search for better definitions of better

The proposal's apex bet, now named in our language:

> The organism doesn't just search for better ideas — it searches for better definitions of "better."

The objective may evolve. **The anchor may not move** — executable checks, held-out judges, human judgment, falsifiable repro triggers.

Reward hacking is redefining winning as whatever you already produce. Counter-mutation: bedrock, rotating critics, witness review, [BUGS_AND_MITIGATIONS.md](./BUGS_AND_MITIGATIONS.md).

Rule of Cool is generation-0 seed — cool uncle at Lα, reframing instinct for the whole ecology, not another debater in the L1 peer fight. Run RoC through the level stack as meta-experiment: versions compete; what collapses into steady-state DNA is what survives Lα witness review.

---

## VIII-b. Convergent skills — evolutionary strategies, not just ideas

Ideas are prey. **Skills are convergent anatomy** — the meta-strategies that evolve independently at each stratum because the niche demands the same function.

In nature, eyes evolved many times. Wings. Claws. Teeth. Not identical — **convergent** on function under similar pressure. Doppl's parallel evolution is not only agenomes and loop topologies; it is **skills per stratum** — executable packages (instructions, scripts, workflows) that encode what worked.

### Why skills (especially script-bearing skills)

Agent platforms are moving toward skills as first-class organisms-within-organisms: instructions the model loads, plus — critically — **code the model can run** (bash, multi-step workflows, self-authored filters). [Theo's Claude Code walkthrough](https://www.youtube.com/watch?v=FDxW2bfBOWE) highlights the pattern: a `repo-explorer` skill that clones and navigates; workflows where the agent writes its own audit code instead of naive tool-chaining; `claude.md` importing shared `AGENTS.md` via `@path` so team genome and host-specific expression separate cleanly (`claude.local.md` for personal override).

That maps to Doppl:

| Platform pattern | Doppl reading |
|------------------|---------------|
| Skill + script execution | **Extended aphenotype with teeth** — not just text, but machinery |
| `AGENTS.md` ↔ `claude.md` `@import` | same agenome, different host expression |
| Workflows / self-authored audit code | aphenome that **programs its own fitness exam** at L3 |
| `@skill` referencing `@skill` | skill graph — evolutionary strategies that compose |
| Side-chat (`/by the way`) | uncle-channel without interrupting nephew's run |

**Rule of Cool** is one convergent skill — reframing instinct — that **belongs at every stratum** but is not identical at every stratum:

| Stratum pair | Skill niche (embryonic names) | Function |
|--------------|------------------------------|----------|
| **L1–L2** | ideation / deliberation skills | cross-domain candidates, fork surfacing, "what's the one move" |
| **L3–L4** | instrumentation / adjudication skills | harness runs, bedrock checks, repro triggers, cost telemetry |
| **Lα** | witness / collapse skills | distill aphenome → register, skill allele, agenome patch; amemetics |

Watch for **natural convergence**: as mortal spikes run, the same skill shapes should reappear (uncle-questioner, falsifier-audit, harness-runner). Those are your eyes and wings — promote them to shared skill library; let dead spike repos collapse.

**Spider trees of skills:** skills reference skills; lineages branch; weak branches collapse to lessons; strong branches become stable apex strategies (the great white shark — unchanged because the niche is solved). Not monoculture — ecology of skills — but **recognize convergence** when unrelated lineages invent the same organ.

**Pushback we accept:** skills alone are not the genome. A skill without agenome context is a detached organ in a jar. Compression must sometimes patch `agenome.py`, sometimes write `BUGS_AND_MITIGATIONS.md`, sometimes mint `skills/uncle-l2/SKILL.md`. The mechanism is **plural**; skills are the most **actionable** compression layer for agent-native hosts.

---

## IX. What exists vs. what is embryology

| Built | Embryology |
|-------|------------|
| `Agenome` schema + seed personas | Uncle as first-class LLM role per stratum |
| Genotype reproduction on blind spots | Crucible sibling spike |
| Fusion judge + critic | Shared harness across spawners |
| `fusion_trace.html` extended aphenotype | Mortal `spikes/` folders + auto-prune |
| Registers as proto-Lα | Cron witness over dead repos |
| This treatise + `GLOSSARY.md` | Org-owned autonomous repo spawning |
| RoC skill (generation-0) | Stratum-specific skill families (L1–L2, L3–L4, Lα witness/collapse) |
| Crucible `--html` extended aphenome | Skill graph (`@skill` → `@skill`), collapse pipeline aphenome → skill |
| Crucible `--local` (Gemma 4 / Ollama-compatible) | Local Lα on Pi/Hermes ("Lαlphα"); per-role local routing |
| `spikes/{genotype,crucible}` (today) | Energy-metered spawncidence budget; auto-prune; harness comparator |

We are in **chaos space before constitution** — naming the organism while the phenotype forms. Premature optimization is the enemy. So is never building. The move is **small mortal experiments**, not big irreversible forks.

---

## X. Open questions (edit here)

1. **Uncle contract** — What may an uncle LLM do and not do at each stratum?
2. **Intra-species budget** — How many peer combats per stratum per run given token metabolism?
3. **Archetype mix** — Minimum viable ecology so Dominant cannot capture without Falsifier?
4. **Nephew honesty** — How do we reward reporting failure upward, not just optimism?
5. **Lα automation** — When does witness get an LLM cron vs. stay human + register + conversation?
6. **Bedrock for Jun 29** — Critic only, or critic + human gate + one executable check?
7. **Collapse pipeline** — Implement Lα distillation script? Input bundle schema?
8. **Skill convergence catalog** — As spikes run, which organs reappear? Minimum skill ecology per stratum pair?
9. **Repo layout** — ✅ done: `spikes/genotype` + `spikes/crucible`.
10. **Uncling/nephewing mechanisms** — How do nurture/maturation actually run? Candidates: cron-job check-ins, Codex Automations, Claude Cowork dispatches, scheduled Lα passes. Which fire down (uncle) vs. up (nephew)?
11. **Rite of the Spawncidence** — needs a better name for "you + I deliberately spawn experiments to witness."
12. **Local Lα** — run the witness on a local model (Pi / Hermes / Gemma 4)? When does that beat a hosted Lα?

---

## XII. Energy, graph traversal, and the bootstrapping tool

### The whole thing as a graph traversal

One lens: Doppl is a **graph that expands and collapses.** Each node is a spawncidence — an abstraction layer holding a **model Fusion Council** that decides how to spend its energy budget, attempting to express its most **coherent extrapolated volition** (cf. Yudkowsky, *CEV* — the best version of what it would want if it reasoned better and longer). Expansion = spawning children; collapse = distilling a dead subtree into heritable lessons. Traversal is bounded by energy, not by depth alone.

### Tool-to-make-a-tool (bootstrapping)

Deserted-island principle: thrown in with nothing, you don't build the house — you find a rock and make a **tool to make a better tool**, and iterate until a tool is *generally* useful. Early agenomes and skills are not the product; they are **rungs**. This reframes "what should generation-0 build?": not the answer, but the next better idea-making instrument. A candidate spawncidence: *ask the organism what early agenomes/skills are the rock — the first tool whose only job is to make the second tool.*

### Local & open-source models (cheap strength)

Cheap-hosted (Gemini Flash 2.5, GPT-4o-mini) is the floor, not the ceiling. Team members who can run **Gemma 4 locally** (or Hermes/Pi) get stronger reasoning for free. The crucible bakes this in: `--local` routes to any OpenAI-compatible endpoint (`LOCAL_BASE_URL` + `LOCAL_MODEL`). Implication: model choice is itself an **environmental variable** in the ecology — a lineage's fitness may depend on the substrate it runs on, and a local Lα ("Lαlphα") could witness without per-token cost.

---

## XI. Repo ecology — meta at root, spikes below

**Intent:** top level = Lα + shared culture (treatise, registers, proposal, `AGENTS.md`, future `bedrock/`, `harness/`). Below = **mortal sprojects** (spikes) — each a mayfly organism with its own README, demo, requirements.

```
doppl-test/                    ← Lα lives here
  TREATISE.md
  LESSONS_AND_BANGERS.md
  MEMORY.md
  BUGS_AND_MITIGATIONS.md
  GLOSSARY.md
  AGENTS.md
  build_index.py               ← regenerates the Agarden hub
  index.html                   ← the findable entry point (mortal, regenerated)
  Doppl_Capstone_Proposal_volume_2.txt
  bedrock/                     ← (embryology) shared prompts + assertions
  harness/                     ← (embryology) run all spikes, compare traces
  spikes/
    genotype/                  ← fusion demo
      fusion_demo.py
      agenome.py
      demo
      README.md
      ...
    crucible/                  ← belief-revision sibling (built)
    ...
```

**The Agarden hub.** `index.html` (built by `build_index.py`) is the single, findable entry point: it scans every spike for live HTML traces, enriches each with its `*.trace.json` (prompt, judge score/verdict, consensus quality, Fusant roster), and renders a reusable side menu. Each trace carries a back-link to the hub, so you navigate to and from runs across Agardens and spawncidences. The hub is itself an **extended aphenotype** — mortal traces come and go; the hub is regenerated and points at whatever still lives (the crucible auto-refreshes it on `--html`).

**Why `spikes/` over `sprojects/`:** spike is already the vocabulary in registers and capstone. *Sproject* works as slang; folder name can stay `spikes/`.

**Why move:** makes mortality literal — deleting `spikes/crucible/` doesn't touch meta. New experiments spawn as siblings, not repo rot. Lα docs stay stable while aphenomes express below.

**Costs of moving now:** `demo` path, imports, root `README.md` → ecology index, `render.yaml` if `app.py` moves, one-time refactor. **Defer if** only one spike exists and chaos space still hot; **do if** crucible spike imminent or demo confusion hurts.

**Minimal move:** `spikes/genotype/` gets all runnable Python + spike README; root README becomes "ecology overview + how to run genotype spike."

---

## Revision log

| Date | Note |
|------|------|
| 2026-06-17 | Initial treatise — synthesis of design conversations through intraspecies/interspecies frame, ecological archetypes, uncle-nephew asymmetry |
| 2026-06-17 | Convergent skills, aphenome collapse machinery, butterfly-wing uncle, skill-graph / host-expression (`AGENTS.md` ↔ `claude.md`) |
| 2026-06-17 | Lα (not L5) — witness outside tree; amemetics / collapse pipeline sketch; `spikes/` repo ecology proposal |
| 2026-06-17 | Crucible spike built + witnessed; energy-budget metabolism for spawncidences; Agardeners; graph-traversal/CEV; tool-to-make-a-tool; local models (`--local`); HTML extended aphenome; `GLOSSARY.md` born |
| 2026-06-17 | Lαlphα names humans + agent as peers; Acology/Fusant naming (A-prefix rule); disagreeableness dial + judge consensus-quality patch (counter-mutation to consensus-grading); Agarden hub (`build_index.py` → `index.html`) |
