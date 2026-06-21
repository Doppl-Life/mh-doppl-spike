# Kernel Artifact Policy

Visibility is not volume, and human readability is not part of the kernel
contract. `src/` emits machine-clean process facts. `tools/microscope/`
translates those facts into temporary human views.

The default proof path should minimize process, not create an archive chore.
Prefer one command and one glance when the domain allows it; when it does not,
use the smallest credible proof surface. `pnpm build` prints the verdict,
survivor change, stable survivors, and failed checks directly to stdout. Files
are for replay and investigation after the human already knows what happened.

## Read Order

1. `pnpm walkthrough` - the default microscope view. Use it when you need to
   understand what happened.
2. `run-digest.md` - the default generated human artifact. One screen, pass/fail, survivor
   change, stable survivors, failed checks, and drill-down pointers.
3. `run-report.md` - debug narrative. Use it when the digest surprises you or a
   goal check fails.
4. `run-trace.json` - machine trace. Use it for tooling, replay, comparison, or
   contract debugging.

## Artifact Classes

| Class | Paths | Keep? | Why |
| --- | --- | --- | --- |
| Source contracts | `src/contracts/index.ts`, `contracts/README.md` | yes | Load-bearing boundary definitions. |
| Fixture inputs | `fixtures/*.json` | yes | Reproducible seed material. |
| Microscope tools | `tools/microscope/**` | no by default | Human translation layer; keep only while useful. |
| Generated run output | `out/**` | no | Ephemeral inspection output; regenerate with `pnpm build`. |
| Promoted proof | `records/<slug>/...` | only by decision | Keep when a run becomes evidence for a design decision or regression. |

Default rule: do not preserve generated output just because it exists. Promote a
run only when the digest names a behavior we intend to compare against later.

## Kill Rules

- If a human-facing artifact cannot change a decision in under one minute,
  delete it or demote it to machine trace.
- If an artifact is generated every run but is not read for three meaningful
  runs, stop generating it by default.
- If a report repeats information already visible in stdout or `run-digest.md`,
  cut the repeated section unless it supports drill-down.
- If an artifact has no named consumer, action, or regression it can catch, it
  is report theater.
- If human-language fields leak into `src/contracts`, move them to
  `tools/microscope` or delete them.

Rich data is fine. Mandatory human reading is the scarce resource.

The principle is "best process is no process." One-button proof is a design
pressure, not a literal law.
