# harness/ — the shared arena (embryology · reserved, not built)

**Status:** `embryology` — reserved directory, **requirements stub, not a design.**

The harness is where competing **loop-topologies** race. "The fork is the prey": we
don't argue agenotype vs. crucible — we run them on the **same prompt suite** against the
**same [bedrock](../bedrock/README.md)** and compare. Today each spike runs alone with
its own cheap-model judge, so no real race exists yet. See
[`../TREATISE.md`](../TREATISE.md) § VII and [`../MEMORY.md`](../MEMORY.md)
(Parallel spawners).

## What this must eventually be (not yet defined)

- **A shared runner** — invoke each spike on one prompt suite, collect comparable traces.
- **One comparison surface** — feeds the [Agarden hub](../index.html) with a shared
  scoring lens, so "topology A beat topology B here" is legible.
- **A shared substrate** — the `chat()` client, the JSON-parse fallback, and the
  threadpool fan-out are currently **copy-pasted across both spikes** (convergent
  organs). The harness is where they collapse into one inheritable library
  (tool-to-make-a-tool).

## Deliberately NOT defined yet

Cross-topology score normalization, energy accounting across spawners, the rotating-
judge schedule. Defer until two topologies actually need to be compared head-to-head.
