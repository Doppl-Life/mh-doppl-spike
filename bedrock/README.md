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

## First candidates (sketches)

Two complementary first instances, neither exclusive:

- **Check #1 — repo integrity (still owed):** the cheapest possible bedrock — an executable
  check that every path referenced in deploy / READMEs / `demo` resolves, plus a golden
  "herded-transcript" probe asserting the crucible judge caps a fake-consensus room at ≤ 6.
  See [`../BUGS_AND_MITIGATIONS.md`](../BUGS_AND_MITIGATIONS.md) (immune memory) — the most
  recent path-drift entry is exactly what check #1 should have caught.

- **Check #2 — human judgment via the Agora (schema sketched):** the async channel where the
  organism surfaces ideas to the Agardeners; each reaction is logged as a falsifiable
  `(context, idea, judgment)` **verdict**. This is the first instance of the *human-judgment*
  anchor named above. Schema + contract: [`signal/`](./signal/README.md). Reward-hack
  defenses (politeness inflation, survivorship bias, Goodhart-on-cool) live in
  [`../BUGS_AND_MITIGATIONS.md`](../BUGS_AND_MITIGATIONS.md); the fork rationale in
  [`../MEMORY.md`](../MEMORY.md).
