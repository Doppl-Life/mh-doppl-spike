# Panel Findings — adversarial critique of the kernel synthesis

> **Status: unadjudicated. Nothing here is decided.** These are the raw outputs of a
> six-agent adversarial panel run against [`SPINE.md`](./SPINE.md) / [`SPEC.md`](./SPEC.md) /
> [`DELTAS.md`](./DELTAS.md), for the team to digest and decide how much course-correction is
> warranted. **SPEC is unchanged** pending that call.
>
> The panel = the project's own **mutagen skills** (`doppl-prime/.cursor/skills/`) turned on
> the kernel docs — the engine's diverge/converge move applied to its own design. Five
> divergent/transform operators + one convergent counterweight (`breakthrough`). Each was
> given the identical brief: read the docs, return **one** finding, concrete and falsifiable.

---

## The signal: four operators independently hit the same fault line

The finding that matters most isn't any single critique — it's that **four of six agents,
from four different lenses, converged on the same weak point: the two-axis fitness
(novelty × grounding), which is the load-bearing claim of the SPINE.** When independent
divergent passes land on the same crack, treat the crack as real.

Specifically, **the novelty axis** is suspect in three compounding ways:

1. **It's self-graded.** Default novelty = embedding-cosine = *distance from the LLM's own
   training distribution*. It rewards unusual phrasing, not real conceptual novelty, and it's
   unfalsifiable against the world. *(blindside)*
2. **It may be derivative.** novelty = grounding − consensus-grounding; decay =
   d(that gap)/dt. If so, the "three orthogonal axes" collapse to one truth-estimate + a
   consensus model. *(first-principles)*
3. **The way it's combined defeats its own purpose.** SPEC's `select()` collapses the two
   axes with a weighted sum, which provably can't select from concave regions of a
   Pareto frontier → corner solutions → mode collapse, the exact failure the design claims to
   prevent. *(polymath)*

These don't kill the kernel. They say: **the central claim has a specific, fixable weakness,
and it should be hardened before the demo is staked on it.** That is the panel's actual
verdict — not "ship it," not "scrap it."

---

## The six findings (verbatim-tight, attributed)

### 1. blindside (valence-flip) — novelty is measured against the model, not the world
**Finding:** embedding-cosine novelty rewards distance from the LLM's training distribution —
weird phrasing scores as "novel"; it's self-grading and unfalsifiable.
**Fix proposed:** score novelty as **absence-from-the-record** — the fraction of N independent
*harvested sources* that already assert the thesis — using the existing source registry.
Converts novelty from an LLM artifact into a reality-grounded count.
**Test:** on a known case, compare embedding-novelty vs source-absence-novelty against which
ideas were actually non-obvious. *(low cost — parts already exist)*

### 2. first-principles (basis-transform) — the two axes may be one
**Finding:** novelty (distance-from-consensus) is not orthogonal to grounding (truth) — it's a
measure of truth's distribution over time. novelty = grounding − consensus-grounding;
decay = d(gap)/dt. The three axes collapse to **one grounded-truth estimator + a consensus
model.** The real "dial" becomes *whose grounding you trust — yours vs. the crowd's.*
**What changes if true:** half the fitness machinery and the weighting-schedule disappear.
**Test:** on the FSD seed, look for any surviving thesis that is high-novelty + high-grounding
yet has **zero consensus-gap.** If none exists, the axes were never independent.

### 3. polymath (domain-transfer) — weighted-sum scalarization causes the collapse it forbids
**Finding:** combining novelty + grounding via a weighted sum is linear scalarization, which
**cannot reach concave Pareto-frontier points** — it returns corner solutions (all-novelty or
all-grounding). That *is* mode collapse, reintroduced at the selection step.
**Fix proposed (imported from multi-objective optimization):** **NSGA-II non-dominated
sorting + crowding distance** — select on the Pareto front directly, never collapse to one
number before selecting. The dial becomes "how deep into the front," not "what weight."
**Test:** run both selectors on the same candidate pool; if weighted-sum yields only corner
keep-sets while NSGA-II yields frontier-spread keep-sets, the critique holds.

### 4. breakout (valence-flip, divergent-UP) — invert it: make decay the *primary* signal
**Finding:** the design estimates two hallucinated axes at t=0 with an LLM judge (the weak
point) and treats decay as a distant third. **Invert:** let the *forward decay trajectory* —
how long a thesis keeps surviving cheap dated reality-checks — be the **sole** fitness; infer
novelty/grounding as the *shape* of the survival curve (novel-but-false decays fast & steep;
grounded-durable decays slow). The one observer-independent signal (time/reality) becomes
primary; the two observer-dependent guesses become derived.
**Test:** re-rank past theses by lagged curve-shape vs. by birth-time novelty×grounding;
if lagged decay-shape out-predicts birth scores, it wins.
**Risk (stated):** the lag may be fatal for a *fast* discovery use-case — you can't rank a
fresh idea until weeks of decay accrue.

### 5. breakthrough (convergent counterweight) — the "regret panel" demo payload
**Finding (the single most accretive *addition*):** at the same-seed demo, for each kept node
also render **the sibling the *other* dial would have selected at that step**, with its
scores. One `generate()` pool, two `select()` passes, joined on shared candidates. The
contrast becomes a per-decision diff, not two separate runs.
**Why it compounds:** makes "fitness flips with the dial" *directly visible* instead of
asserted — turns two-axis fitness from plumbing into the demo's whole point. Bonus: every node
*both* dials keep is exactly where the two axes aren't yet orthogonal — so it doubles as the
bottleneck finder.
**Payoff (falsifiable):** a viewer sees one shared pool split into two defensibly different
keep-sets and says "oh — it's literally one engine choosing opposite things," unaided.

### 6. constraint-injection (scarcity-operator) — the build shape that forces the proof
**Finding:** the SPEC's "definition of done" is still prose. Impose a hard constraint: build
the kernel as **one file, ≤~300 lines, one hardcoded seed, two entry points
(`--dial=diverge` / `--dial=converge`) whose ONLY difference is the schedule weight vector.**
"One kernel" becomes *grep-able and diff-able* — the two runs differ by a single constant —
instead of asserted.
**Test:** if making the two runs differ requires changing more than the weight vector, the
"one kernel" claim is false and you've found that out in a day.

---

## Ranked high-utility steps (the convergent read)

The findings collapse into one coherent ~2-day build path. **Ranked by utility, with cost:**

| # | Step | From | Utility | Cost |
|---|------|------|---------|------|
| 1 | **Externalize novelty** — score as *absence-from-harvested-sources*, not embedding distance | blindside | **Very high** — kills the deepest flaw in the central claim | Low (parts exist) |
| 2 | **Single-file, two-entry-point kernel** — runs differ only by the weight vector | constraint-injection | High — makes "one kernel" executable, not asserted | Low |
| 3 | **Regret panel** — show the sibling the other dial would've kept | breakthrough | High — *proves* the thesis on screen; doubles as bottleneck finder | Low–med |
| 4 | **Settle axes empirically** — re-run existing backtest: consensus-gap / lagged-decay vs novelty×grounding | first-principles + breakout | High — resolves the core dispute with data, not argument | Low (backtest exists) |
| 5 | **Cut decay from the v1 demo engine** — keep it post-demo (already bracketed in docs) | addition-by-subtraction | Medium — sharpens the demo, costs nothing now | None |
| — | **NSGA-II selection** instead of weighted sum | polymath | High *if* two axes are kept (depends on #4) | Medium |

**Note on apparent contradictions (both are real, not conflicts):**
- breakout wants decay *promoted* to primary; addition-by-subtraction wants it *cut* from the
  demo. Reconciled: decay is **not a co-equal third axis in v1** — but it may be the *realest*
  signal long-term. Cut it from the demo engine; revisit as primary post-demo.
- polymath's NSGA-II only matters **if** the team keeps two axes (step 4 might collapse them to
  one, making it moot). So #4 gates polymath.

---

## What this means for course-correction (for the team to decide)

The panel did **not** return "the synthesis is sound, proceed." It returned: **the kernel's
organizing idea (one engine, diverge/converge dial) survived; its fitness model did not survive
unscathed.** The decision in front of the team is essentially one fork, and there's a free
experiment to settle it:

> **Fork:** keep **two axes** (and fix the combination with NSGA-II + a reality-grounded
> novelty signal), OR collapse to **one axis** (grounded-truth vs. consensus-gap, with decay as
> its time-derivative).
>
> **The experiment that decides it (free — uses the existing backtest):** re-rank resolved
> past theses by the consensus-gap / lagged-decay signal vs. the current novelty×grounding.
> Whichever better predicts real outcomes wins. *Measure, don't argue.*

Everything else (single-file build, regret panel, externalized novelty) is robust to that
fork — worth doing regardless.

---

*Raw agent transcripts available on request; each finding above is its agent's verbatim
output, tightened for length, not altered in substance.*
