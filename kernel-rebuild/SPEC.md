# The Build Spec — what we're building, and what agents build toward

> Binds to `SPINE.md` (the why). This is the *what* and the *scope fence*. Written so
> agent teams can build against it without re-deriving the thinking. If a build choice
> isn't traceable to SPINE, it's out of scope.

---

## Scope fence (read first)

**Boil THIS ocean, not every ocean.** We are *not* rebuilding doppl-prime's full
production architecture (event-sourced Postgres, ModelGateway, the works). We are
building **the kernel we identified** — generate-under-selection with a diverge/converge
dial — running end-to-end on real ideas, wearing discovery/ripple as its visible skin.

- **In scope:** the kernel loop, the two-axis fitness, the dial, one or two applications
  (discovery + ripple), enough I/O to run it on real seeds and judge the output.
- **Out of scope (for now):** production persistence, multi-user, auth, hosting, the full
  critic-council/agenome machinery, anything in doppl-prime's §18 deferred list.
- **Posture:** code is cheap. Generate aggressively *within this fence*, run it, break
  it, find bottlenecks empirically. Divergent building, convergent scope.

---

## The artifact

**A small runnable program that demonstrates the kernel on real ideas.**

Given a **seed** (an AI-unlock thesis, or a problem statement), it:
1. **Diverges** — generates children (ripples / candidate theses / candidate solutions).
2. **Converges** — scores them on the two-axis fitness (novelty × grounding), culls weak.
3. **Recurses** — optionally breeds the survivors into a next generation (ideas off ideas).
4. **Shows** — the lineage tree + the surviving ideas + their scores, so a human can judge.

The proof it works: **the same seed, dial set to diverge vs. converge, yields different
and both-useful output** (e.g. FSD seed → divergent = the ripple cluster; convergent =
the one mispriced thesis). If that demonstrably holds, the kernel is real.

It does *not* need to be pretty, persistent, or complete. It needs to **run, produce
judgeable output, and reveal where the kernel strains.**

---

## The core abstractions (what agents implement)

Keep these few and clean — they ARE the kernel:

| Abstraction | What it is | Notes |
|---|---|---|
| `Seed` | the starting condition | a thesis, a problem, or an existing idea node |
| `ReproductionUnit` | what reproduces | thesis \| consequence \| (later) agenome — pluggable |
| `generate(parent, dial)` | the divergent step | dial high = more/wilder children; produces candidates |
| `FitnessSource` | scores a candidate | returns **{novelty, grounding}** (two axes, not one) |
| `select(candidates, schedule)` | the convergent step | weights the two axes per the schedule; culls |
| `dial` / `schedule` | the diverge↔converge knob over generations | a weighting trajectory, not a constant |
| `decay(node, age)` | time axis | erodes fitness by subtype half-life (zeitgeist fast, transfer slow) |
| `Lens` | feasibility / fit, applied on top | pluggable; NOT part of fitness |
| `lineage` | the tree of who-bred-what | append-only; the demo's visible artifact |
| caps | finite-by-construction | max generations / population / depth / spend |

**The two non-negotiables from SPINE:**
1. Fitness is **two orthogonal axes** (novelty × grounding), weighted by the schedule —
   never collapsed to one number before selection.
2. **Decay is in the engine; feasibility is the lens.** Don't merge them.

---

## What to reuse from the discovery spike (don't rebuild)

The spike (`spikes/discovery/`) already proved the *pieces*. Lift them:

- **Problem Recovery + subtype classify** (`brain.py`) — the convergent move + the
  ±5-year discriminator. Reuse as the grounding/classify component.
- **Signed −5..+5 scoring + trap register** — feeds the grounding axis + the
  harm-detection.
- **Why-now decay + refresh** (`decay.py`, `reality.py`) — the time axis, already built.
- **Lenses** (`brain.py` LENSES) — the pluggable feasibility layer.
- **Calibration + backtest** (`calibrate.py`, `reality.py`) — predicted-vs-realized and
  was-it-right; the bedrock grading.
- **Source registry + recipes + fetch ladder** — the harvest/access layer, if the
  artifact needs live seeds (optional for the kernel demo; can run on fixtures).
- **Ripple** (to be built in the spike) — the divergent consequence-generator; the
  kernel's first real `generate()` with the dial set to diverge.

The rebuild's job is to **refactor these from a pipeline into the kernel** — same
behavior, but expressed as `generate / select / decay / lens` with the dial explicit.

---

## Settled (decisions locked by the synthesis)

- One kernel; three applications are dial settings. (SPINE)
- Two-axis fitness (novelty × grounding); weighting schedule = the application. (SPINE)
- Decay = engine time axis; feasibility = pluggable lens. (SPINE)
- Discovery is the same engine pinned to diverge; not a separate service. (SPINE)
- Ripple = divergent pass over AI-unlock seeds into named non-AI substrates. (SPINE)
- Language for the *artifact*: stay in Python for the spike-grade kernel (fast to break);
  the doppl-prime TS rebuild is a *later* target, fed by what this teaches.
- Scope: the kernel, not doppl-prime wholesale. (this doc)

## Open questions (decide by building, not arguing)

- **Schedule representation.** Is the diverge→converge schedule a simple per-generation
  weight curve, a bandit, or operator-set? *Start: simple curve; learn from runs.*
- **How recursive for the demo?** Depth-1 (seed → ripples) vs depth-N (ripples of
  ripples)? *Start: depth-1, prove it, then turn the crank.*
- **Novelty metric.** Embedding-cosine (spike already does this) vs cluster-coverage vs
  LLM-judged distinctness? *Start: reuse the spike's embedding novelty.*
- **What's the seed source for the demo?** Live harvest vs a curated set of AI-unlock
  seeds? *Lean: curated AI-unlock seeds → ripple; live harvest optional.*
- **Where does Doppl-the-agent-breeder fit?** Same kernel, `ReproductionUnit=agenome` —
  but do we build that now or just leave the seam? *Lean: leave the seam, build
  thesis/consequence reproduction first.*
- **Agent-team build structure.** How many parallel teams, on what boundaries? (kernel
  core / fitness / applications / harness) — *decide when we kick off the swarm.*

---

## How the agent-team build runs (the machine that builds the machine)

The posture you + Claude operate at the meta level; agents do the generation; **this
spec is the held-out judge.** Suggested boundaries for parallel teams (clean seams from
the abstractions above):

1. **Kernel core** — `generate / select / dial / lineage / caps`.
2. **Fitness** — the two-axis `FitnessSource` (novelty + grounding), reusing spike scoring.
3. **Applications** — discovery (diverge) + ripple (diverge-on-consequences), as kernel
   configs.
4. **Harness + demo** — run on real seeds, render lineage + survivors, the judgeable output.

Each team builds against this spec; integration point is the kernel's `generate/select`
contract. Run it, break it, report bottlenecks, iterate. The first milestone is the
**same-seed-diverge-vs-converge** demonstration — the proof the kernel is one thing.

---

## Definition of done (for this phase)

- The kernel runs end-to-end on at least one real seed.
- It produces a lineage tree + scored survivors a human can judge.
- The **same-seed diverge-vs-converge** contrast is demonstrable and both outputs are
  useful.
- We've learned where it strains (bottlenecks, weak fitness, bad outputs) — documented,
  so the *next* phase (or the TS rebuild) is aimed.

Done is **"we ran it, it worked enough to judge, and we know what to fix"** — not
"production-ready."
