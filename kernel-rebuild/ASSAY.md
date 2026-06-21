# Outcome Assay

The kernel is past the "does water move through the pipes?" stage. The next
question is whether a run makes cases more fertile for a human.

## Stages

### Discovery

Discovery asks: what did the run notice that was not already obvious?

Good discovery surfaces a new substrate, hidden dependent, disappearing event,
timing shift, latent asset, adoption boundary, or weird but plausible branch. It
does not need to solve the case. It should make the human want to inspect the
case differently.

### Problem Surface

Problem surface asks: what is the actual pressure point?

Good problem surfacing recovers or sharpens the hidden variable. It turns "the
drone is here" into "the footage is the target," or "add guards" into "the
perimeter excludes the waterline." If the problem surface is wrong, clever
solutions should be capped.

### Collaborative Solution

Collaborative solution asks: what should someone do now?

Good solutions are constraint-aware interventions, strategies, warnings,
products, protocols, or falsification tests. They come after discovery and
problem surfacing, not before them.

## Current Assay

`pnpm assay` is discovery-first. It defaults to five generational runs:

- `jack-drone-privacy`
- `jack-yacht-perimeter-intrusion`
- `fsd-accident-economy`
- `starship-launch-cost-collapse`
- one random fill case from the assay registry

The random fill case is printed with the run seed. Use `--deterministic` for a
sorted fill, `--seed=<value>` to replay a random selection, `--count=<n>` to run
fewer or more cases, `--cases=a,b,c` to choose exact cases, and `--all` to run
the full registry.

## Win Condition

The first outcome gate is simple:

After five cases, did the run surface at least three to five entries a human
would mark `interesting`, `investigate`, or `keeper`?

Kernel scores nominate. Human verdicts are bedrock.

## Feedback Scale

- `dead` - not useful, not worth revisiting.
- `obvious` - true or plausible but already in the visible case.
- `interesting` - worth thinking about.
- `investigate` - worth a follow-up search, case split, or falsification test.
- `keeper` - strong enough to preserve as a candidate insight.
