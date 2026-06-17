# bedrock/ — the immovable anchor (embryology · reserved, not built)

**Status:** `embryology` — this directory is reserved. Nothing here yet, on purpose.
We are early; this is a **requirements stub, not a design.**

Bedrock is the one thing in Doppl that **may not move**: the un-fakeable anchor for
what counts as a "better idea," so the organism can't win by learning to fool its own
critic. The objective may evolve; bedrock may not. See [`../GLOSSARY.md`](../GLOSSARY.md)
(Bedrock) and [`../TREATISE.md`](../TREATISE.md) § VIII.

## What this must eventually be (not yet defined)

- **Executable checks** — assertions that pass/fail without a model's opinion. Even a
  trivial first one (a plumbing invariant, a golden-transcript probe) counts, as long
  as it can go **RED**.
- **Held-out judgment** — judges the breeding/debate loop never sees and cannot author.
- **Falsifiable repro triggers** — every register "bedrock assertion" should eventually
  point at one of these.
- **A correlation gate** — a metric mutation survives only if it keeps tracking bedrock.

## Deliberately NOT defined yet

The full fitness function, the rubric schema, the held-out human panel, the ML
correlation test. Naming them now would be over-building. We define bedrock when a
spike's result actually demands it.

## First candidate (a sketch, uncommitted)

The cheapest possible first bedrock is the repo's own integrity: an executable check
that every path referenced in deploy / READMEs / `demo` resolves, plus a golden
"herded-transcript" probe asserting the crucible judge caps a fake-consensus room at
≤ 6. See [`../BUGS_AND_MITIGATIONS.md`](../BUGS_AND_MITIGATIONS.md) (immune memory) —
the most recent path-drift entry is exactly what check #1 should have caught.
