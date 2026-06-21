# Kernel synthesis and doppl-prime — comparison, not compliance

Doppl Prime is source material, not the target architecture.

> For the team. This is **not a verdict** — it's an honest map of where the
> "one kernel, two directions" synthesis (see [`SPINE.md`](./SPINE.md)) lines up with
> doppl-prime's committed architecture, and where it genuinely departs. The purpose is
> source context, not conformance. Read it, then judge for yourselves whether the
> divergences are *fundamentally* sounder or just a variant.

> **Baseline note:** "prime" here = the **frozen binding docs** (ARCHITECTURE/IMPLEMENTATION_PLAN,
> Jun 18), *not* the current repo. The mutagen skills and case-study corpus were added Jun
> 19–20, after the freeze, and aren't in the binding docs — so they count as deltas, not
> "already there." See [`DELTAS.md`](./DELTAS.md) for the verified timeline and full change list.

## TL;DR

The synthesis and prime **agree on almost everything that is a *safety/correctness*
commitment**, and **diverge on the *organizing metaphor*** — what the system fundamentally
*is*. Prime says: *a population of agenomes, evolved, with production-grade event-sourced
infrastructure.* The synthesis says: *one operation — generate-under-selection — run in
two directions (diverge/converge), with a fitness that flips with direction; the
agenome-population is one configuration of that operation, not the thing itself.*

It is less "different blueprint" and more "**prime is one instantiation of what the
synthesis claims is the general engine.**" Whether that reframing is profound or merely
cosmetic is the real question for the team.

---

## Shared commitments

These are not compromises — the synthesis actively endorses them. If the kernel idea
graduates, it should *keep* all of this.

1. **Evolution as the core.** Both are generation → selection → reproduction over a
   population. Prime's "agenomes generate candidates, critics evaluate, strong lineages
   fuse/mutate" *is* the kernel loop. No disagreement on the heart being evolutionary.

2. **The two subtypes.** `cross_domain_transfer` and `zeitgeist_synthesis` are shared,
   identically defined (the ±5-year discriminator). The synthesis adds *why* they differ
   (timing-agnostic vs. timing-bound → different decay), but doesn't change the taxonomy.

3. **Manufactured fitness without ground truth.** Both rest on the same bet: adversarial
   verification + reality/resolution as the fitness signal. The synthesis's "novelty ×
   grounding" axes are a *naming* of what prime's critic-council + held-out-judge already
   produce.

4. **The held-out judge / bedrock that cannot move.** Prime's `FinalJudgeRubric`
   (immutable to agents) = the synthesis's "the objective can evolve, the anchor cannot."
   Identical commitment.

5. **Process vs outcome split.** The frozen plan references the **PRM/ORM** (process-reward
   / outcome-reward) idea; the fuller sprout/afrit, two-ledger framing lives in the
   *test-repo PROPOSAL*, not the binding docs. Either way the synthesis is consonant: keep
   divergent fitness (novelty) and convergent fitness (grounding) as *separate signals*.
   Shared in spirit; the synthesis names it as the two-axis rule.

6. **Finite by construction.** Caps on population/generations/energy/depth + kill switch.
   The synthesis keeps this verbatim ("caps" in the kernel abstractions). Fully in the
   frozen plan.

7. **Timing-bound zeitgeist (decay is a near-delta).** The frozen plan defines
   `zeitgeist_synthesis` as timing-bound but has **no decay/refresh mechanism** — the
   synthesis adds that as an explicit time-axis. So this is more *delta* than *alignment*;
   listed here only because the timing-sensitivity instinct is shared. (See DELTAS §9.)

8. **Safety invariants.** No arbitrary code exec, secrets never in prompts/events,
   candidate-as-data prompt-injection isolation, append-only truth. The synthesis touches
   none of these — they're orthogonal to the organizing metaphor and should survive intact.

**So: every load-bearing *correctness* and *safety* commitment in prime is preserved.**
The divergence is not about what's safe or true; it's about what the system *is*.

---

## Where they DIVERGE (the real differences)

### 1. The organizing primitive: *agenome-population* vs. *one directional operation*

- **Prime:** the unit of life is the **agenome** (a scaffold). The system is a population
  of agenomes under selection. Discovery, problem-recovery, solution-finding are *things
  the agenomes do* inside one lifecycle.
- **Synthesis:** the unit is the **operation** — generate-under-selection — and *direction*
  (diverge ↔ converge) is the master parameter. The agenome-population is *one
  configuration*; discovery (pinned-diverge) and problem-ID (pinned-converge) are *equally
  fundamental settings of the same engine*, not sub-behaviors of the agenome loop.
- **Why it might matter:** if the synthesis is right, prime is solving a *special case*
  (breed agents) of a *general engine* (breed anything, in either direction). That would
  mean prime's architecture is *correct but narrow* — it bakes "the unit is an agenome"
  into the contracts, where the synthesis would make the unit pluggable
  (`ReproductionUnit = agenome | thesis | consequence`).
- **Why it might not:** "it's all one engine" can be true and still not *buy* you anything
  — if you only ever breed agenomes, the generality is decoration. The team should ask:
  *does treating direction as the primitive change a single build decision, or is it a
  prettier story over the same code?*

### 2. Fitness: *a decomposed FitnessScore* vs. *two warring orthogonal axes*

- **Prime:** `FitnessScore = {total, components, policyVersion}` — components (critic,
  checks, novelty, energy, judge) combined per a scoring policy into a total.
- **Synthesis:** fitness is **two orthogonal axes that cannot both be maximized** —
  novelty (divergent) vs. grounding (convergent) — and the *weighting between them is the
  application*. The key claim: collapsing them to a single `total` *too early* is the
  failure mode (it hides the explore/exploit tension that the whole anti-slop /
  anti-collapse bet depends on).
- **Why it might matter:** prime *has* the components but treats the total as the object of
  selection. The synthesis says selection should happen *in the two-axis space*, with the
  collapse deferred and schedule-driven. That's a real, testable architectural difference,
  not a rename.
- **Why it might not:** prime's `ScoringPolicy` is already versioned and the weights are
  deferred-open — arguably it can *express* a two-axis weighting as a policy. If so, the
  synthesis is a *discipline* on top of prime's contract, not a replacement for it.

### 3. The dial: *implicit knobs* vs. *one named master parameter*

- **Prime (frozen plan):** has **novelty pressure** as a fitness component and "fusion
  prefers distant lineages" as an anti-collapse force — but **bandit allocation is explicitly
  deferred** (§18 non-goal), and **disagreeableness dial / r/K are not in the binding docs at
  all** (those live in the test-repo PROPOSAL, not the architecture). So prime's explore/
  exploit control is *partial and scattered*, and the richer knobs are either deferred or
  un-codified.
- **Synthesis:** claims the explore↔exploit / diverge↔converge control is **one master dial**
  seen from different angles, named and lifted to the kernel — rather than partial pressures
  spread across subsystems (and a test-repo wishlist).
- **Why it might matter:** if they really are one parameter, prime is maintaining N knobs
  where 1 would do — a parsimony win, and a conceptual clarity win.
- **Why it might not:** they may be *correlated but not identical* in practice (temperature
  ≠ critic-disagreeableness ≠ spawn-allocation under the hood). Unifying them in the model
  could be a leaky abstraction that hides necessary independent control. **This is the
  divergence most likely to be "pretty but wrong" — worth the team's scrutiny.**

### 4. Scope & build posture: *production-first contracts* vs. *prove-the-kernel-then-port*

- **Prime:** contract-first. Phase 0 freezes ~12 schemas (event envelope, gateway,
  scoring, lineage…) before tracks fork; event-sourced Postgres; production-grade from the
  start. Optimized for *a 3–4 person team building a durable system in parallel*.
- **Synthesis / this rebuild:** prove the kernel *runs and is sound* on real ideas in the
  crucible first — minimal persistence, break-it-fast — then port the *proven* design into
  a prime branch. Optimized for *answering "is this approach sounder" cheaply* before
  committing to contracts.
- **Why it might matter:** prime's contract-first approach *assumes the architecture is
  right* and invests in durability. If the synthesis's reframing is sound, freezing
  agenome-centric contracts in Phase 0 is premature — you'd be cementing the special case.
- **Why it might not:** the synthesis hasn't been *built* yet. Prime is executable today;
  the kernel is a claim. A sound-sounding metaphor that never ships loses to a slightly-less
  elegant architecture that's running. **Prime's biggest advantage is that it exists.**

### 5. Discovery's status: *intake feature* vs. *the engine, pinned to diverge*

- **Prime:** discovery/case-intake is the front of the pipeline — where seeds enter.
- **Synthesis:** discovery is *the whole engine* running divergent; it's not upstream of
  the kernel, it *is* the kernel in one mode. Ripple (AI-unlock → non-AI consequences) is
  the proof — divergent generation is a first-class application, not a feeder.
- **Why it might matter:** elevates discovery from "input handling" to "co-equal mode,"
  which is what justifies investing in it as more than a scraper.
- **Why it might not:** for the *demo*, "where seeds come from" may be all that's needed;
  the grander framing might not change what gets built in two weeks.

---

## The honest summary for the team

- **If you only read one thing:** the synthesis keeps **100% of prime's safety/correctness
  commitments** and re-frames the **organizing metaphor** (direction-as-primitive,
  two-axis fitness, one master dial). The disagreement is *conceptual architecture*, not
  *engineering safety*.

- **The strongest case FOR the synthesis:** it's more parsimonious (one engine, one dial,
  two axes) and it makes discovery/ripple/problem-ID fall out as *settings* rather than
  separate subsystems — which, if true, means prime is building a special case of a more
  general thing, and freezing agenome-centric contracts early is premature.

- **The strongest case AGAINST (FOR prime):** prime is *executable now* with frozen
  contracts a team can build against in parallel; the synthesis is an unbuilt claim, and
  some of its unifications (especially "all the knobs are one dial") may be elegant but
  leaky. Generality you never use is decoration.

- **The fair test** (what would actually settle it): build the kernel in the crucible,
  run the **same seed diverge-vs-converge** demonstration, and see (a) whether the
  two-axis/one-dial model produces *better or more controllable* output than prime's
  decomposed approach, and (b) whether it took *fewer concepts* to get there. If both →
  the reframing is sound and earns a prime branch. If neither → it's a variant, and prime's
  executable head-start wins.

**No verdict here on purpose. The crucible proposes; the team disposes.**
