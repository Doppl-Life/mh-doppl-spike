# kernel-rebuild

The home for the next phase: rebuilding everything around the **kernel** we found —
*generation under selection, run in two directions (diverge/converge), graded by a
fitness that flips with direction.*

This came out of the discovery spike (`../spikes/discovery/`). The spike proved the
*pieces* work; this phase proves the *kernel unifies them* — and is where agent teams
build a runnable prototype to test against real ideas, break, and tighten.

## Read order

1. **[`SPINE.md`](./SPINE.md)** — the conceptual heart. One kernel, two directions, the
   two-axis fitness, decay as the time axis, lens on top. *Start here.*
2. **[`INVARIANTS.md`](./INVARIANTS.md)** — rules that must survive implementation
   changes.
3. **[`SPEC.md`](./SPEC.md)** — the build plan: the artifact, the core abstractions,
   what to reuse from the spike, settled vs open, how the agent-team build runs.
4. **[`ARTIFACTS.md`](./ARTIFACTS.md)** — proof surfaces, generated-output policy,
   and artifact kill rules.
5. **[`OPERATIONAL_WATCHLIST.md`](./OPERATIONAL_WATCHLIST.md)** — process traps and
   convergence signals to monitor while the kernel runs.
6. **[`BUGS_AND_MITIGATIONS.md`](./BUGS_AND_MITIGATIONS.md)** — mistakes and
   mitigations the kernel should not relearn.
7. **[`HEURISTICS.md`](./HEURISTICS.md)** — portable moves and traps for runs.
8. **[`docs/lineage-ledger.schema.md`](./docs/lineage-ledger.schema.md)** — the
   machine-readable delta/lineage memory contract for future runs.
9. **[`GLOSSARY.md`](./GLOSSARY.md)** — local terms used by the rebuild.
10. **[`COMPARISON.md`](./COMPARISON.md)** — for the team: where this synthesis stays
   aligned with doppl-prime's architecture and where it genuinely diverges. No verdict —
   the team judges whether it's fundamentally sounder or just a variant.
11. **[`DELTAS.md`](./DELTAS.md)** — the concrete change-list vs. prime: each item marked
   genuine-delta / aligns-with-prime / generalizes-a-prime-pattern, deep where settled and
   `[OPEN]` where not. The build agenda.
12. **[`PANEL_FINDINGS.md`](./PANEL_FINDINGS.md)** — adversarial critique of the synthesis by
   the project's own mutagen skills (six-agent panel). **Unadjudicated — for team digestion.**
   Four operators independently flagged the same fault line (the two-axis fitness); includes
   ranked high-utility fixes and the free experiment that settles the central question.
13. **[`CONVERSATION.md`](./CONVERSATION.md)** — the raw reasoning path the synthesis was
   distilled from (the chat transcript).

The kernel lives in `src/`. Human-facing views live in `tools/microscope/` and
are disposable unless they prove reusable. Historical diagram sketches are not
part of the active source surface.

## The one line

We didn't find another feature. We found that everything already built is **one engine
wearing different masks**, and the masks are *dial settings*, not separate machines.

## Status

Runnable TypeScript prototype started. Current slice proves:

- multiple seed fixtures run through the same proof board
- source packets generate children through named reproduction operators
- no-delta packets are rejected before fitness
- generated children carry lineage, delta, parent, and generation
- novelty and grounding are computed from seed/candidate/source text, not required fixture scores
- bounded generation 2 expands fixture-authored child packets from selected candidates under caps
- decay is an engine time factor; feasibility is a post-selection lens
- the same generated pool supports diverge vs. converge selection

## What To Do

Run `pnpm build` when you want the default proof. It typechecks and prints the compact
multi-seed board:
`seed -> generated -> rejected -> Explore keeps -> Proof keeps -> swap -> failed checks`.

Run `pnpm proof:export` only when you need replay artifacts under `out/proof-board/**`.

Run `pnpm microscope` from this folder for the single-seed visual view.

Run `pnpm walkthrough` for the short terminal readout.

Run `pnpm walkthrough:detail` only when you want the longer microscope view.
