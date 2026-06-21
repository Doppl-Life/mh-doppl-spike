# Deltas from doppl-prime — itemized change list

> For the team, and for the build. SPINE = the *why*, COMPARISON = the *head-to-head*,
> this = the **concrete change list**: what's different, where it touches prime's plan,
> and how settled each item is.
>
> Depth: **deep where settled, flagged `[OPEN]` where not.** Written pre-build, so it
> stops short of contract-level schemas (that's prime's job once an approach is chosen).

## ⚠ What "prime" means here (the baseline)

**"Prime" = the frozen binding docs, not the current repo state.** Verified by git:

- `ARCHITECTURE.md` froze **2026-06-18 15:40**; `IMPLEMENTATION_PLAN.md` **16:00**.
- `case-studies/` was added **2026-06-19 17:34** — *a day after* the docs.
- `.cursor/skills/` (the mutagens) was added **2026-06-20 10:10** — *two days after*.
- The binding docs **do not reference** either directory.

So the mutagen skills and the case-study corpus are **post-doc work that the frozen
architecture does not account for.** They are *deltas from the plan*, even though they
physically sit in the prime repo today. This doc measures against **the plan**, because
that's what the team builds to and what would have to change to absorb this work.

> Nuance worth keeping: some of these post-doc additions (especially the mutagen skills)
> *already encode* diverge/converge thinking. So the kernel idea isn't foreign to where the
> team's instincts were heading — it just was never in the frozen plan, and was never lifted
> to a kernel-level primitive. "Consistent with recent instincts" ≠ "already in the architecture."

## Legend

- **△ DELTA** — new or changed vs. the **frozen plan**.
- **⇧ GENERALIZES** — lifts a pattern that exists in *post-doc work* (not the plan) up to a
  kernel-level primitive.
- **≈ ADOPTS** — keeps an existing *frozen-plan* commitment unchanged (listed so nobody
  re-invents it).

---

## The headline

The single biggest reframing — **diverge/converge as the engine's master dial** — turns
out to be where the team was *already heading*: the post-doc mutagen skills are explicitly
tagged in diverge/converge terms. But **none of that is in the frozen architecture**, and
nobody lifted it to the kernel level. So this is a genuine delta from the plan *and* a
generalization of the team's most recent (un-codified) instincts — which is the strongest
possible footing: new to the plan, yet consonant with where the work was already moving.

---

## 1. ⇧ Diverge/converge: lift it to the engine's master dial

**Frozen plan:** does **not** mention diverge/converge as an organizing axis at all. The
selection/scoring (§8) and generation loop (§5) don't name it.

**Post-doc work that points at it (not in the plan):** the mutagen skills (added Jun 20)
are *explicitly* tagged in diverge/converge terms — `breakout` = "convergent single-best →
**divergent-UP**", `blindside` = "convergent → **divergent-DOWN**", `breakthrough` =
"**converges** on the single best accretive addition", `addition-by-subtraction` = "valence
flip on the **convergent** axis." So the team's recent instinct was already diverge/converge
— but only per-skill, and only outside the frozen architecture.

**The delta / generalization:** make diverge↔converge the **master parameter of the whole
engine**, not just a per-skill mutation flavor. Discovery = engine pinned to diverge.
Problem-recovery = pinned to converge. Solution-finding = oscillate. The dial the skills use
locally becomes the dial that governs the engine globally.

**Touches the plan:** §8 (selection/scoring), §5 (generation loop) — adds the dial as a
first-class run/lifecycle control.

**Why it's strong footing:** new to the architecture, yet consonant with the team's most
recent (un-codified) instincts. See [`SPINE.md`](./SPINE.md).

---

## 2. △ Mutagen skills as the reproduction/mutation library (incl. `rule-of-cool` → `breakthrough`)

**Frozen plan:** the architecture's reproduction is **fusion + mutation** (§8), but
"mutation" is left abstract — *the plan defines no concrete mutation operators.* It does not
mention skills, mutagens, or a mutation library.

**Delta (post-doc, added Jun 20 — not in the plan):** a concrete **mutation-operator
library** as skills in `.cursor/skills/` — 8 of them (`breakthrough`, `breakout`,
`blindside`, `first-principles`, `polymath`, `constraint-injection`,
`addition-by-subtraction`, `transcript-to-case-study`), organized into **four mutagen
classes** (valence-flip, basis-transform, scarcity-operator, domain-transfer), with explicit
lineage (`rule-of-cool` = progenitor → `breakthrough` convergent / `breakout` divergent-UP).

**Why it's a delta, not "aligns":** the binding docs froze two days before these were added
and don't reference them. So this is **new work that fills in what the plan left abstract**
("mutation") with a real operator set — it needs to be *folded back into* the architecture,
not assumed present.

**How it connects to the kernel:** these operators *are* the kernel's `generate()` library,
and they're already dial-aware (§1). `polymath` (domain-transfer) is effectively the
`cross_domain_transfer` subtype's generative operator — worth wiring explicitly.

**[OPEN]** Audit any mutagens coined in conversation beyond these 8 for genuine additivity
vs. duplication of an existing class.

---

## 3. △ Discovery brought in-house (the research module = the engine, pinned to diverge)

**Frozen plan:** seeds are **human-authored** — a "gen-0 baseline" hand-fed to the runtime
(`REQ-F-017`). There is **no discovery layer and no case-study corpus** in the plan;
finding new ideas is entirely manual. (The `case-studies/` corpus itself was added Jun 19,
post-doc — see §4.)

**Delta:** the discovery engine (built in `../spikes/discovery/`) is **in-house and is the
kernel running divergent** — it harvests live signal (11 sources), recovers the real
problem, classifies subtype, scores, decays, and emits ranked candidates. Seeds become
*machine-generated*, not only hand-authored. It is not a feeder *upstream* of the engine; it
*is* the engine in divergent mode.

**Touches the plan:** §3 (lifecycle gains an automated divergent front-end), the seed/intake
surface, Appendix-A `CandidateIdea` (now machine-generated). Reuse list in
[`SPEC.md`](./SPEC.md).

**Settled:** harvest → recover → classify → score → rank, with signed scoring, decay,
calibration, backtest — all built and running.

---

## 4. △ Explicit "Problem Recovery" stage (find the real problem before solving)

**Frozen plan:** the lifecycle (§3) goes seed → spawn → **generate candidates** → critics →
checks → score. There is **no problem-recovery step** — candidates are generated against the
seed as given; the seed's framing is never interrogated.

**Post-doc work that points at it (not in the plan):** the `case-studies/` corpus (added
Jun 19) introduced a Problem-Recovery contract + `evaluation_focus` fields (`actual_problem`,
`hidden_variable`, `frame_recovery_target`) — but as *evaluator metadata for scoring*, still
not a lifecycle stage, and not in the binding docs.

**Delta:** make Problem Recovery an explicit **upstream lifecycle stage** that runs *before*
solution generation, on every item: symptom → deleted assumptions → hidden variable →
**actual problem**, treating the given framing as a *claim to examine*. (Built in the spike's
`brain.py`.)

**Touches the plan:** §3 lifecycle (insert a stage before candidate generation), the
`CandidateIdea` shape (carry the recovered frame), §8 scoring (frame-recovery becomes a
scored axis, not just an evaluator target).

**Why it matters:** it's the **convergent** move (collapse symptoms → the one cause) — the
mirror of discovery's divergent move. It's where the two-mode idea (§7) gets its teeth.

---

## 5. △ Two-axis fitness (defer the collapse) vs prime's combined total

**Prime today:** `FitnessScore = {total, components, policyVersion}` — components (critic,
checks, novelty, energy, judge) are combined into a **single `total`** that selection acts on.

**Delta:** keep **novelty (divergent) and grounding (convergent) as two orthogonal axes**,
and **defer collapsing them to a single number** until selection, with the weighting set by
the dial/schedule. The claim: collapsing too early hides the explore/exploit tension the
anti-slop / anti-collapse bet depends on.

**Touches prime:** §8 `FitnessScore` / `ScoringPolicy`. *Possibly expressible within* prime's
already-versioned policy (weights are deferred-open there) — so this may be a **discipline on
top of prime's contract** rather than a contract change. Flag for the team to judge.

**[OPEN]** Whether two-axis selection is a new contract or a policy configuration of the
existing one. Decide by building.

---

## 6. △ Signed scoring (−5…+5) + trap register (amemetics at the discovery layer)

**Prime today:** scoring is positive/combined; harm isn't a distinct signal at intake.

**Delta:** scores are **signed** — `+` worth surfacing, `0` meh, `−` an *active trap*
(distractor / Goodhart-bait / mis-framed). Anything ≤ −3 logs to a **trap register** with a
reason — the discovery-layer feed into prime's amemetics / `BUGS_AND_MITIGATIONS` idea.

**Touches prime:** §7/§8 (scoring), and the amemetic register (extends it to *idea-level*
anti-patterns, not just reward-hacks). Built in the spike.

---

## 7. △ [direction LOCKED · mechanics OPEN] Two modes of the discovery engine

**This is the genuinely new structural idea.** The same engine runs in two directions, and
`case_studies` serves *both* — which reframes what `case_studies` even is.

- **Divergent mode → find NEW ideas to exploit.** Harvest broadly, surface non-obvious
  opportunities, promote the strong ones **into `case_studies`** as new
  opportunities/benchmark fixtures. ("What should we go after?") — **built** (the spike).

- **Convergent mode → build DOMAIN EXPERTISE on an ALREADY-CHOSEN problem.** Given a
  decided problem/scenario, the engine researches *inward* — gathering, grounding, and
  distilling until it converges on the **problem-truth / the right question to be asking /
  the real target**. ("We've picked this; now become expert and find the actual target.")
  — **[OPEN] mechanics.**

**So `case_studies` is two things at once:** a *destination* for divergent finds, **and** a
*workspace* for convergent research on a chosen problem. Prime treats case-studies as a
seed corpus; this makes it dual-purpose.

**Touches prime:** §3 (lifecycle gains a convergent-research path), the case-study schema
(distinguish "promoted opportunity" rows from "domain-expertise research" rows), §8 (the
two modes weight the two fitness axes oppositely).

**[OPEN] to specify by building:**
- What "domain expertise" concretely *is* (a structured brief? a grounded fact-base? a
  ranked set of candidate problem-framings?).
- How convergent research *terminates* — what signals "we've found the real target"?
  (Candidate: frame-recovery confidence crosses a threshold + critic agreement.)
- How the two modes share vs. separate ledgers (likely: same engine, different
  weighting-schedule + a `mode` tag on the run).

**Direction is locked; the above mechanics are the first thing the convergent-mode build
should resolve.** Diagram: TODO (a two-mode version of `03-discovery-flow`).

---

## 8. △ [OPEN] Validation-means menu (paper-measurement as one of several)

**Prime/test today:** the test repo's `PROPOSAL.md` has **paper-bets** (pre-registered,
calibration-scored) as the reality/bedrock vertical — singular.

**Delta:** treat thesis-validation as a **menu of means**, of which paper-measurement is
*one*:
- **Paper-bets / Polymarket / Kalshi** — a thesis with a dated, market-resolved prediction;
  the market settles it for free (built as the `backtest` + the arbitrage lens).
- **Stock-market paper-measurement** — timestamp a thesis, measure the counterfactual move
  (the future fake-trade module — *out of scope now*, noted as a means).
- **Reality-on-a-clock** — dated falsifiable predictions resolved by time (built: backtest).
- **Agora / human judgment** — async verdicts (prime/test already has this).

**Stays a rail, not a casino:** analyze and rank only; **never auto-trade.** (Consistent
with the test repo's "paper-first, $0, never play in markets the organism creates.")

**Touches prime:** the bedrock/verification layer — generalizes "paper-bets" into a
pluggable set of `ValidationMeans`, each producing a reality-graded signal.

**[OPEN]** Which means ship first beyond paper-bets; the fake-trade module is explicitly
deferred.

---

## 9. ≈/△ Decay + refresh, lenses, recipes, calibration (built in the spike)

Recording the rest of the spike's machinery and its prime-relationship:

- **Why-now decay + refresh** — △ explicit time-axis on fitness (prime treats zeitgeist as
  timing-bound but doesn't model decay/refresh). Built.
- **Pluggable lenses** (capstone-demo-fit / arbitrage / build-moat) — △ feasibility as an
  observer-relative layer *on top of* fitness (prime folds scoring into one policy). Built.
- **Source registry + recipes + fetch ladder + worth_unlocking** — △ the harvest/access
  layer with self-healing recipes and evidence-gated connector backlog. Built; new vs prime
  (prime has no harvest layer — intake was manual).
- **Calibration (predicted vs realized) + backtest (was-it-right)** — △/≈ closes the loop
  between lens-score and real outcomes; aligns with prime's held-out-judge spirit, adds the
  predicted-vs-realized measurement. Built.

---

## 10. △ [OPEN — boundary only] Knowledge store: total-recall persistence

**Requirement (firm):** keep **everything** the organism generates — every idea, generation,
critic verdict, promotion/rejection, the collective knowledge, the specialized domain
research — append-only, queryable, so the *full record* of how knowledge accumulated is
recoverable. Nothing is thrown away.

**Relationship to the frozen plan:** prime already commits to **Postgres + an append-only
event log as the single source of truth** (§4, §9). So this isn't greenfield — the real open
question is *narrower than "which database":*

> **Open:** does prime's event-log-as-truth suffice for total-knowledge-capture, or does
> cross-run / cross-idea **collective memory + domain research** want an additional store
> (vector / graph / notes-style) layered over it? Event logs are great for *one run's* truth;
> they're not obviously the right shape for "search all ideas ever, by similarity / topic /
> lineage."

**Where the seam is:** a **`KnowledgeStore` port** sitting *beside* the event log —
authoritative truth stays in the log; the store is a derived, cross-run index for recall and
research. Unresolved on purpose; marked here so the boundary is explicit. **Not integral to
the demo.** (See diagram `05-seams`.)

---

## 11. △ [OPEN — boundary only] Self-training flywheel: mine the record → train a model

**Intent:** the total-recall store (§10) is also a **training corpus**. Everything done —
improvements, lessons, heuristics, winning lineages — could be mined to **fine-tune our own
model**, which could then become **one of the models used in the deliberations / fusions**:
the organism trains on its own history, then breeds with the result. The flywheel closes.

**Relationship to the frozen plan:** prime lists "**in-house fine-tuning flywheel**" in its
§18 **deferred** set. So this is a *named prime deferral pulled forward as a seam* — not a new
invention, and explicitly not-now.

**Where the seam is:** a read path **`KnowledgeStore → training-export → fine-tune → ModelRoute`**
— the trained model registers as just another route the gateway can assign to a role (critic,
generator, fusion). **Not built, not a dependency.** Possible "this is where we're headed"
demo flag, or a started-to-show-direction stub. Marked at the boundary only. (See diagram
`05-seams`.)

---

## What this list says, overall

- **Measured against the frozen plan, almost everything here is a delta.** The mutagen
  library, the case-study corpus + Problem Recovery, discovery, the two-mode engine — none
  are in the binding docs (all added Jun 19–20, after the Jun 18 freeze). The plan has the
  *skeleton* (fusion+mutation, `CandidateIdea`, a manual gen-0 seed); the deltas are the
  flesh added since, plus the kernel reframing that ties them together.
- **The deltas:** mutagen mutation-library (§2), discovery in-house (§3), Problem Recovery as
  a stage (§4), two-axis fitness (§5), signed scoring + traps (§6), the **two-mode engine**
  (§7, the big one), the **validation-means menu** (§8), and the harvest/decay/lens/
  calibration machinery (§9) — with diverge/converge as the master dial (§1) unifying them.
- **The honest nuance:** some deltas (mutagens, esp.) already *encode* the diverge/converge
  instinct — so the kernel reframing is new to the *architecture* yet consonant with the
  team's most recent work. New to the plan ≠ foreign to the team.
- **What this means for absorbing it:** the frozen architecture would need real edits to
  account for all of this — it isn't "already covered." That's the point of measuring against
  the plan: it shows exactly what would have to change.
- **Two boundary-only open questions (not demo-integral):** the **knowledge store** (§10,
  total-recall persistence — narrows prime's event-log to "is one store enough for cross-run
  collective memory?") and the **self-training flywheel** (§11, mine the record to fine-tune
  a model that then joins the deliberation — a prime §18 deferral pulled forward as a named
  seam). Both are marked at the boundary, not as demo dependencies.
- **The one to resolve first:** §7 convergent-mode mechanics — locked in direction, open in
  detail, where the kernel's convergent half earns its keep.

**Open items are flagged `[OPEN]` on purpose — they're the build agenda, not hand-waving.**
