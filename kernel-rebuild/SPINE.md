# The Spine — one kernel, two directions

> The conceptual heart, distilled. The full reasoning path is in `CONVERSATION.md`;
> the build plan is in `SPEC.md`. This doc is the *why* — the thing every build
> decision should trace back to. Keep it short on purpose.

## The one-sentence version

**There is one kernel — *generation under selection* — and everything Doppl does is
that kernel run in a direction, at a dial setting, graded by a fitness that flips
with the direction.**

Discovery, problem-identification, and solution-finding are not three engines. They
are three settings of one engine.

---

## The kernel

Strip any of it down and you get the same loop:

```
generate candidates  →  evaluate against a fitness signal  →  keep the strong  →  generate again from them
```

Doppl breeds *agenomes* (scaffolds). Discovery breeds *theses* (claims about the
world). Ripple breeds *consequences* (ideas off ideas). Same loop. The unit that
reproduces differs; the loop does not. That shared loop is the **kernel** — the
mitochondrion of the whole organism. Build it once, well; everything else is
configuration.

---

## The dial: divergent ↔ convergent

The kernel has one master knob — the balance between **generation** and **selection**
— and turning it gives you opposite kinds of search:

| | **Divergent** (generation up) | **Convergent** (selection up) |
|---|---|---|
| Move | one seed → many children, fanning out | many signals → collapse to the one |
| Verb | explore, expand, branch | exploit, contract, funnel |
| In biology | **fertile** (r-selected): many cheap offspring | **resilient** (K-selected): few, survive scrutiny |
| Enemy | redundancy (diverging into near-copies) | slop (converging on something false) |
| Doppl pieces | mutation, sprouts, ripple generation | critic council, culling, selection |

Divergence and convergence are **the same operation with the sign flipped.** The
disagreeableness dial, the sampling temperature, the r/K allocation — these are all
*the same dial seen from different angles*. There is one knob.

---

## The three applications = three dial settings

- **Discovery = divergent.** Finds interesting problems and ripples. Dial pinned to
  explore. "What's out there / what does this unlock?"
- **Problem-identification = convergent.** Finds the ground-zero cause. Dial pinned to
  exploit. Symptoms → the single hidden variable. (Doppl's Problem Recovery is this.)
- **Solution-finding = the oscillation.** Diverge to generate candidate solutions,
  converge to verify against critics, diverge to mutate, converge to score. The art is
  the *rhythm* of switching. "Perfect Pepsi" (one converged answer) vs "perfect Pepsis"
  (diverge into a cluster, then converge on each branch) — **that choice is itself the
  dial.**

Doppl-the-product is the *full oscillation*. The discovery spike is the *same engine
with the dial pinned to diverge, graded by novelty.* We built the breathing twice
before noticing it was the same lungs.

---

## Fitness flips with the dial (the load-bearing rule)

The mechanism unifies. The **fitness signal does not** — and must not. Divergent and
convergent search measure *opposite things*, on two **orthogonal, warring axes**:

- **Novelty** (divergent fitness): spread, coverage, distance-from-consensus. *Did we
  reach somewhere new?*
- **Grounding** (convergent fitness): truth, falsifiability, evidence. *Did we land on
  the real thing?*

You **cannot maximize both at once** — max novelty and max grounding pull apart. That
tension *is* the design, not a bug to fix. The whole "manufacture fitness without
ground truth" bet lives in the balance:

- pure divergence → **confident slop** (risk #1)
- pure convergence → **mode collapse / premature consensus** (risk #2)

So fitness is not one scale, and not three rubrics. It is **one two-axis space
(novelty × grounding), and each application is a different weighting / trajectory
through it.** You maintain *two fitness signals and a weighting schedule* — the
schedule is the application. (This is also the sprout/afrit, process/outcome,
two-ledger insight from `PROPOSAL.md` — preserved, not collapsed.)

---

## The third axis: time (decay / adaptability)

Novelty and grounding describe an idea *now*. But fitness **erodes as the world
changes**, and that's a real, observer-independent property of the idea — so it's an
axis *inside* the engine, not a filter on top.

- A `cross_domain_transfer` is timing-agnostic — slow decay.
- A `zeitgeist_synthesis` is built on a dated signal — fast decay; its window closes.

This is already built as **why-now decay + refresh**. The insight here is that
*decay is the time dimension of fitness*, the same thing the biology examples point at:
the big-shell creature, the long-mating-cycle species, **BlackBerry** — none are about
cost-at-a-moment; all are about *adaptation speed under changing conditions*. BlackBerry
scored high fertile (mass adoption) and high resilient (lock-in, "undefeatable") but
its **decay was lethal** when the touchscreen regime arrived and it couldn't refit fast
enough. So the idea's true fitness is **novelty × grounding × decay-rate**.

> **Noted for the future, not the demo:** *resilient and adaptable trade against each
> other.* Over-fit to current conditions = brittle to regime change (BlackBerry's
> strength was its weakness). An idea that looks *most* bulletproof may decay *fastest*
> when the regime turns. The backtest could eventually catch this ("the theses that
> looked most resilient decayed fastest"). Real, original, and one layer too deep for
> the two-week demo. Capture it; don't build it yet.

---

## The lens: feasibility (pluggable, on top)

Separate from the engine's fitness is the **lens** — "is this worth it *to me*, with my
resources?" Observer-*relative*: a hedge fund and a capstone team see the same
novel+true+durable thesis and weigh feasibility oppositely. The engine finds what's
*novel and true and durable*; the lens decides what's *worth acting on*. Keeping
feasibility out of the core fitness is exactly what lets one engine serve many users —
they share novelty+grounding+decay, they differ only in lens. (Lenses are already
pluggable in the spike: capstone-demo-fit, arbitrage, build-moat.)

**Engine = novelty × grounding × decay (intrinsic). Lens = feasibility / fit
(observer-relative, swappable, applied on top.)**

---

## The Ripple corollary (why the AI-skew is a feature)

The discovery feed skews toward AI because its sources and lens do — and because AI
genuinely is the biggest exogenous shock of the moment. The fix is not to fight the
skew but to **use it as the input to a divergent second pass**: take each
high-confidence "AI is solved here" thesis and project its *consequences into named
non-AI substrates* (energy, insurance, labor, real estate, regulation, healthcare,
logistics, materials). The NVIDIA case wasn't an AI idea — it was a *power* idea AI
unlocked. FSD isn't an AI idea — it's *insurance / real-estate / enforcement*. Ripple
is the kernel set to **diverge along the consequence axis**, using the doctrine already
written (`dry-riverbed test`, `discovered-attack`, `perfect-Pepsis cluster`). It is the
discovery-layer version of **Fusion**: recombine distant material instead of nudging
locally.

---

## What this changes about how we build

1. **Build the kernel once.** Generate-under-selection with a `direction` dial and a
   pluggable `FitnessSource` + `ReproductionUnit`. Not three engines.
2. **Two fitness signals, not one and not three.** Novelty + grounding, weighted by a
   schedule. The schedule is the application.
3. **Decay is in the engine; feasibility is the lens.** Don't confuse them.
4. **The spike already proved the *pieces*.** The rebuild proves the *kernel unifies
   them.* That's the whole point of the next phase.

The breakthrough wasn't another feature. It was noticing that everything already built
is one engine wearing different masks — and that the masks are *dial settings*, not
separate machines.
