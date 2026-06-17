# Fork Register

This spike explores ideas from the [Doppl Capstone Proposal](./Doppl_Capstone_Proposal_volume_2.txt). This file is the **lineage log**: not every note, but every fork — where we chose one path over another, and why.

**Write here when:** a design choice could reasonably have gone another way, and the reason matters later.

**Write elsewhere:**

- Timeless insight → [LESSONS_AND_BANGERS.md](./LESSONS_AND_BANGERS.md)
- Proxy win / reward hack → [BUGS_AND_MITIGATIONS.md](./BUGS_AND_MITIGATIONS.md)

## Entry format

### [fork name] — YYYY-MM-DD

- **Chose:** what we committed to
- **Over:** what we set aside (be specific)
- **Because:** the constraint, observation, or bet that tipped the scale
- **Revisit if:** what would make us reopen this fork
- **Spirit note:** one line on intent — what we were protecting or optimizing for

## Entries

### Breed on blind spots, not critic feedback — 2026-06-16

- **Chose:** genomic reproduction — `breed_child()` splices parents and mutates on `blind_spots ∪ clarifying_questions`; offspring answers via `primary_mandate`
- **Over:** transcript retry — feeding critic scores or “try harder” back into the same agent’s prompt
- **Because:** critic feedback optimizes for fluency and rubric-surface pass, not coverage of what fusion actually missed; selection pressure belongs on *who* is thinking, not *how long* they talk
- **Revisit if:** offspring quality plateaus while blind-spot signal stays rich — may need a second reproduction operator or richer agenotype
- **Spirit note:** evolution in the agenotype, not the transcript — see [Agenotype over transcript](./LESSONS_AND_BANGERS.md#agenotype-over-transcript--2026-06-16)

### Parallel spawners, not fork resolution — 2026-06-16

- **Chose:** parallelize competing loop topologies (agenotype spike + crucible spike + future spawners) under shared harness/bedrock — **the fork is the prey**
- **Over:** resolving agenotype vs. crucible in design discussion or MEMORY before a bedrock race; premature optimization toward Jun 29 demo structure while still in chaos/exploration space
- **Because:** capstone apex bet is searching for better definitions of “better”; closing the fork early optimizes for narrative coherence, not fitness; two-week spike can explore meta-architecture without picking one topology
- **Revisit if:** one spawner consistently wins on held-out bedrock at lower cost — then promote it as default L2 topology, not before
- **Spirit note:** spawn-spawners, don't settle spawners — see [The fork is the prey](./LESSONS_AND_BANGERS.md#the-fork-is-the-prey--2026-06-16), [Loop-topology crossover](./LESSONS_AND_BANGERS.md#loop-topology-crossover--2026-06-16)

### Jurisdiction as boundary term — 2026-06-16

- **Chose:** **jurisdiction** as the preferred name for cross-stratum boundaries when something needs a variable name in code
- **Over:** treating jurisdiction / competence boundary / payload contract as three separate mechanisms
- **Because:** they're one boundary concept, three lenses (who decides / what they can know / how messages cross); chaos space is fine holding the triad until code demands a name — then jurisdiction wins
- **Revisit if:** implementation reveals distinct enforcement layers (e.g. schema validation vs. role permissions) that need separate terms
- **Spirit note:** restraint at borders, madness inside strata — see [Jurisdiction](./LESSONS_AND_BANGERS.md#jurisdiction--2026-06-16)

### Chaos space before constitution — 2026-06-16

- **Chose:** stay in unbounded exploration — naming the organism (strata, uncle/nephew, witness, extended aphenotype) before locking spike implementation or demo story
- **Over:** jumping to Jun 29 demo structure, harness specs, or `./crucible-demo` build order while still in embryology
- **Because:** premature optimization is especially toxic when the product *is* meta-improvement; documenting bangers and forks *is* Lα witness work and valid spike output
- **Revisit if:** team needs a shippable cut for showcase deadline — then apply [Explore the madness, cap the combinatorics](./LESSONS_AND_BANGERS.md#explore-the-madness-cap-the-combinatorics--2026-06-16) constitution
- **Spirit note:** meta-phant first, demo second — witness layer writing notes while phenotype forms

### Meta at root, spikes below — 2026-06-17

- **Chose:** (intent) Lα docs + registers at repo root; runnable spikes in `spikes/<name>/` as mortal sprojects
- **Over:** monolithic repo where meta treatise and agenotype demo share one flat directory
- **Because:** literal mortality — delete or archive a spike folder without touching culture; mirrors "lineage log survives, organism doesn't"
- **Revisit if:** move cost outweighs benefit with only one spike and no crucible sibling yet — defer is valid
- **Spirit note:** see [TREATISE.md § XI](./TREATISE.md#xi-repo-ecology--meta-at-root-spikes-below)

### Deploy serves the root hub, not the interactive demo — 2026-06-17

- **Chose:** point [`render.yaml`](./render.yaml) at the root Agarden `index.html` (static hub of whatever traces are live)
- **Over:** keeping the `spikes/agenotype` FastAPI app (`app.py`) as the deployed service — the live "type a prompt, watch fusion run" demo
- **Because:** the hub is the findable, always-valid entry point across every spike; the interactive app is one spike's surface and needs a running server + key. Early stage — favor the navigable index over a single live demo
- **Revisit if:** we want a public live-run demo for the Jun 29 showcase — then redeploy `app.py` as a separate Render web service alongside the static hub
- **Spirit note:** mortal traces come and go; the hub is the extended aphenotype that points at whatever still lives. (Folder naming `genotype → agenotype` was resolved in `565d300`; see [BUGS](./BUGS_AND_MITIGATIONS.md).)

### Cheap roster refresh — cross-lab, no Gemini — 2026-06-17

- **Chose:** a cross-lab cheap default roster — debaters `deepseek/deepseek-v4-flash` (~$0.10/M in), `nvidia/nemotron-3-ultra-550b-a55b:free`, `qwen/qwen3.7-max`; spawner DeepSeek V4 Flash; judge `deepseek/deepseek-v4-pro` ($0.435/M, reasoning). Premium swaps Gemini 2.5 Pro → DeepSeek V4 Pro. **Zero Google/Gemini in any hosted role.**
- **Over:** the prior Google+OpenAI pair (`gemini-2.5-flash` + `gpt-4o-mini`) — only two labs, and two converging ones; Gemini judged too weak for the price
- **Because:** for *this* loop, **lab diversity beats raw single-model quality** — blind-spot coverage and anti-herding are the product, so spending the budget on more *independent* priors (DeepSeek / NVIDIA / Alibaba, + local) is worth more than a marginally-smarter monoculture; cost is near-noise at these prices (a run is fractions of a cent)
- **Revisit if:** a candidate slug 404s on OpenRouter (MiMo-V2.5 / Qwen3.7-Plus were considered but not slug-confirmed — verify on the dashboard), or a bedrock race shows a cheaper held-out judge (e.g. Xiaomi MiMo-V2.5-Pro) beats DeepSeek V4 Pro on catching herding
- **Spirit note:** Cambrian over monoculture — see [Cambrian explosion, not monoculture](./LESSONS_AND_BANGERS.md#cambrian-explosion-not-monoculture--2026-06-16). Cheap-tier judge shares a lab with a debater; true held-out is a `--premium` property by design.

### Spawner selects the substrate, not just the structure — 2026-06-17

- **Chose:** (intent — to build + observe, not yet built) extend the spawner's latitude so it decides **which LLM backs each harness/role**, not only how many debaters and which archetypes — i.e. model substrate becomes part of the spawn plan, emitted in the same JSON and rendered in the trace
- **Over:** the status quo where the roster is hardcoded (`CHEAP_MODELS`) and `--local` bluntly overrides *every* role to one model — collapsing the cross-lab diversity the loop depends on (the bug that motivated this fork)
- **Because:** if the spawner's job is to compose a room under selection pressure, the **substrate is a gene it should set** (a Falsifier on a stubborn local model vs. a synthesizer on a cheap hosted model is a different organism); per-role routing also fixes the `--local` monoculture without abandoning local models
- **Revisit if:** spawner-chosen substrates don't measurably change debate quality vs. a fixed cross-lab roster (then substrate is environment, not gene, and we keep it static); or combinatorics blow the metabolism cap
- **Spirit note:** **observe first** — make the substrate choice, the reason, and the per-role assignment as visible as the archetype choice already is (Syntax-dumped plan + HTML trace). See banger [The spawner chooses the substrate](./LESSONS_AND_BANGERS.md#the-spawner-chooses-the-substrate-not-just-the-structure--2026-06-17); builds on [Local models as environment](./LESSONS_AND_BANGERS.md#local-models-as-environment--2026-06-17) carry-forward ("consider per-role local routing") and [Loop-topology crossover](./LESSONS_AND_BANGERS.md#loop-topology-crossover--2026-06-16).

### Composer (cursor-agent) as an optional Fusant / judge — 2026-06-17

- **Chose:** (exploring — prototyped in an isolated worktree, not merged) wire the Cursor **Composer** model in as an **opt-in** backend via the local `cursor-agent` CLI (confirmed installed, v2026.04.17), usable as the held-out judge and/or one debater; default behavior unchanged; slower latency accepted in exchange for a strong, different-substrate voice *here in the planning zone* (not for deploy)
- **Over:** treating Composer as unreachable because it has no OpenRouter slug / no hostable `/chat/completions` endpoint — true for a clean HTTP backend, but the CLI is a viable (if heavier, agentic) local adapter
- **Because:** variety with a good model is worth it for Lα-side runs; this is exactly the kind of "crazy idea, see what stabilizes" the spike exists for, and it keeps the agent as **One of Us** — a re-spinnable peer that can also be a Fusant
- **Revisit if:** the worktree spike reports it NOT VIABLE — e.g. cursor-agent can't return reliable JSON for the judge contract non-interactively, TTY/auth/recursion issues, or latency makes runs unwitnessable
- **Spirit note:** opt-in only, never a default or a deploy dependency; the validity test lives in a mortal worktree branch + `spikes/crucible/COMPOSER_SPIKE_FINDINGS.md`. See [Lα is fractal — One of Us](./LESSONS_AND_BANGERS.md#lα-is-fractal--one-of-us--2026-06-17).
