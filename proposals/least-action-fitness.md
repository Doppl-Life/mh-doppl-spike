# Proposal: Least-Action Fitness

Date: 2026-06-20
Status: proposal for review
Primary question: should Doppl use Ponytail directly, or absorb the mechanism?

## One-line thesis

Make laziness heritable: lineages that solve the same problem with fewer owned mechanisms, fewer assumptions, and fewer irreversible commitments should survive longer, as long as they do not cut safety, evidence, or correctness.

## Recommendation

Do not make Ponytail a runtime dependency of Doppl.

Use Ponytail as prior art and optional developer-process tooling. Build the actual mechanism inside Doppl as a native verifier/scoring pressure: **Least-Action Fitness**.

Ponytail's useful idea is not "be terse." It is a ladder:

1. Does this need to exist?
2. Does the standard library or platform already do it?
3. Does an installed dependency already do it?
4. Can the same result be one line?
5. Only then build the smallest necessary thing.

Doppl should translate that into selection pressure, not import the persona wholesale.

## Why not use Ponytail directly?

Ponytail is designed to steer a coding agent's behavior. Doppl is trying to evaluate and breed idea-producing agents under a replayable kernel.

Those are different layers.

If Ponytail is always on inside Doppl, it contaminates the organism: every candidate inherits the same deletion bias invisibly, benchmarks become harder to interpret, and the event log cannot easily distinguish "this lineage was frugal" from "the harness forced frugality."

If Ponytail is a reviewed external reference, we get the benefit without losing measurement:

- Use Ponytail manually or optionally for code review of Doppl itself.
- Borrow the ladder as a verifier rubric.
- Keep Doppl's runtime behavior explicit, evented, and reproducible.
- Let "least action" become a trait lineages can express differently.

## What Doppl gets

### 1. A new fitness component

Add a scoring component:

```text
leastActionFitness = usefulOutcomeScore - unjustifiedMechanismCost
```

Mechanism cost is not "lines of code." For Doppl ideas, score the owned machinery the idea requires:

- new dependencies or services
- bespoke glue
- new abstractions
- human workflow burden
- tool/API surface
- irreversible commitments
- assumptions that require future maintenance
- scope created before evidence demands it

The score must not punish:

- trust-boundary validation
- security
- accessibility
- evidence gathering
- falsification checks
- data-loss prevention
- calibration knobs for real-world variance

This is the difference between lazy and careless.

### 2. A new critic lens

MVP path without contract churn: encode this under the existing feasibility/subtype-specific critic, then emit a structured evidence item such as `least_action_review`.

Better path if we are still before contract freeze: add `mechanism_economy` to `CriticMandate`.

The critic answers four questions:

```text
What did this candidate ask us to own?
Which parts are required now?
Which parts are speculative?
What simpler native/platform/social mechanism covers the same job?
```

### 3. Deferred-mechanism ledger

Borrow Ponytail's best operational move: every deliberate shortcut must name its ceiling and upgrade trigger.

Example:

```text
defer: no Neo4j runtime dependency for MVP
ceiling: graph queries stay projection/export-only
upgrade when: lineage analysis requires interactive graph traversal during a run
```

If a candidate says "defer X" without a ceiling and trigger, it earns a rot-risk penalty. "Later" is not a plan unless it names what makes later arrive.

### 4. A heritable trait

Least action should become a selectable agenome trait, not just a judge:

```text
mechanismBias:
  frugality: 0.0..1.0
  platformTrust: 0.0..1.0
  deferralDiscipline: 0.0..1.0
```

Some lineages should be expansive, some subtractive. Selection decides when frugality helps. Do not force all agents into one style.

## Fit with current architecture

Lowest-risk fit:

- Phase 4 verifier council: add a least-action review prompt under feasibility/subtype-specific.
- Phase 5 selection/scoring: add `mechanismCost` and `leastActionFitness` as components inside the existing `FitnessScore.components` map.
- Phase 7 dashboard: show mechanism cost beside energy cost, so the audience sees "cheap to run" versus "cheap to own."

Contract-changing fit, only if done before Phase 0 freeze:

- Add `mechanism_economy` to `CriticMandate`.
- Add a first-class `MechanismCost` model.
- Add a projection panel for deferred mechanisms and upgrade triggers.

I would start with the lowest-risk fit. If the signal is useful, promote it.

## MVP experiment

Run a small paper evaluation before building anything deep.

Inputs:

- 6 candidate ideas from existing zeitgeist/transfer case studies
- 2 obviously overbuilt candidate variants
- 2 dangerously underbuilt variants that cut required safety/evidence

Have the critic score:

- useful outcome
- required mechanism
- speculative mechanism
- safety/evidence preserved
- deferred mechanism has ceiling + trigger

Pass condition:

- overbuilt variants lose to simpler equivalents
- dangerously underbuilt variants lose despite being smaller
- irreducible ideas are not penalized just because they require real machinery

Fail condition:

- the critic simply rewards smallness
- the critic punishes necessary verification
- the score duplicates energy cost without adding new signal

## Relationship to the Theo videos

The videos point at a larger harness shift:

- agents should run in loops, not depend on manual prompting
- code/scripts can become disposable orchestration between model turns
- breadth may now be cheaper than it used to be
- deployment/provisioning glue is becoming the bottleneck

Least-Action Fitness is the counterweight. It prevents "boil the ocean" from turning into "own the ocean."

The new strategy is not maximal scope. It is **lazy breadth**:

```text
cover the surface broadly,
use native/platform mechanisms wherever possible,
generate depth only where a real user/task/evidence signal demands it,
and make every deferred depth upgrade-triggered.
```

That reconciles Ponytail with the boil-the-ocean idea.

## The boil-the-ocean mechanism

Working name: **anti-pattern inversion**.

Definition:

```text
An old warning becomes a new strategy when the constraint that made the warning true disappears.
```

Yesterday:

```text
"Do not boil the ocean" was correct because breadth was expensive:
large teams, slow code, deployment friction, provisioning friction, integration glue, support burden.
```

Today:

```text
agentic codegen + integrated runtimes + cheap parallel exploration collapse some of that breadth cost.
```

Tomorrow:

```text
the winning product shape may become broad, shallow, agent-extensible systems
where long-tail depth is generated on demand.
```

This is a `zeitgeist_synthesis` pattern because timing is load-bearing. Five years ago the advice was still mostly right. Five years from now the edge may be gone because everyone designs this way.

## Doppl use of anti-pattern inversion

Add it as a generation/check lens for zeitgeist candidates:

```text
old taboo:
  What strategy used to be a known trap?

constraint:
  What physical/economic/social bottleneck made it a trap?

substrate removed:
  What changed recently that weakens that bottleneck?

new strategy:
  What becomes rational now?

tomorrow implication:
  What product/institution/behavior follows if adoption continues?

falsifier:
  What dated signal would prove the inversion was fake?
```

For the Theo example:

```text
old taboo: do not boil the ocean
constraint: breadth was capital/team/deployment expensive
substrate removed: codegen and agent loops make shallow breadth cheap
new strategy: breadth-first product shells with on-demand agentic depth
tomorrow implication: vertical SaaS moats weaken where workflow depth can be synthesized
falsifier: generated long-tail depth remains too unreliable or too expensive to support
```

## Risks

Least-action reward hack:

The organism learns to say "use native X" even when X does not actually solve the edge case. Mitigation: safety/evidence guards are exempt from deletion pressure.

Timidity:

Frugality suppresses weird, expansive ideas. Mitigation: keep least-action as one scoring component, not the whole judge. `breakout` still gets room to sprawl early.

Hidden labor:

The candidate looks simple but pushes complexity onto the user. Mitigation: mechanism cost includes human workflow burden.

False zeitgeist:

The anti-pattern did not invert; we just got excited by a demo. Mitigation: every inversion needs a current signal and a dated falsifier.

## Decision requested

Approve the proposal as a spike:

1. Use Ponytail as prior art and optional review tooling, not as a Doppl runtime dependency.
2. Add Least-Action Fitness as a verifier/scoring pressure.
3. Add anti-pattern inversion as a `zeitgeist_synthesis` generation/check lens.
4. Test both on existing case-study candidates before changing architecture contracts.

## Actual build changes

This is now wired into the build plan as a non-contract first pass:

- `IMPLEMENTATION_PLAN.md` P4.12 adds a least-action review lens that emits `least_action_review` evidence through existing verifier surfaces.
- P5.6 folds `mechanismCost` and `leastActionFitness` into `FitnessScore.components`, keeping it deterministic and replayable.
- P7.8 makes mechanism cost visible separately from energy cost so "cheap to run" and "cheap to own" are not confused.

The next concrete implementation slice is P4.12. Build that before touching contracts.

## Calibration spike

Built at [`spikes/least-action/`](../spikes/least-action/).

Run:

```bash
cd spikes/least-action
./demo
```

Current result: **KEEP**. The offline gate passes all six checks: rejects dangerous underbuilding, penalizes overbuilding, preserves irreducible-heavy ideas, prefers Postgres projection over runtime Neo4j, understands lazy breadth, and does not reward smallness alone. See [`out/report.md`](../spikes/least-action/out/report.md).
