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
2. **[`SPEC.md`](./SPEC.md)** — the build plan: the artifact, the core abstractions,
   what to reuse from the spike, settled vs open, how the agent-team build runs.
3. **[`COMPARISON.md`](./COMPARISON.md)** — for the team: where this synthesis stays
   aligned with doppl-prime's architecture and where it genuinely diverges. No verdict —
   the team judges whether it's fundamentally sounder or just a variant.
4. **[`DELTAS.md`](./DELTAS.md)** — the concrete change-list vs. prime: each item marked
   genuine-delta / aligns-with-prime / generalizes-a-prime-pattern, deep where settled and
   `[OPEN]` where not. The build agenda.
5. **[`PANEL_FINDINGS.md`](./PANEL_FINDINGS.md)** — adversarial critique of the synthesis by
   the project's own mutagen skills (six-agent panel). **Unadjudicated — for team digestion.**
   Four operators independently flagged the same fault line (the two-axis fitness); includes
   ranked high-utility fixes and the free experiment that settles the central question.
6. **[`CONVERSATION.md`](./CONVERSATION.md)** — the raw reasoning path the synthesis was
   distilled from (the chat transcript).

Diagrams live in [`diagrams/`](./diagrams/).

## The one line

We didn't find another feature. We found that everything already built is **one engine
wearing different masks**, and the masks are *dial settings*, not separate machines.

## Status

Spec captured. Next: point agent teams at `SPEC.md` to build the kernel artifact —
boil *this* ocean (the kernel), not doppl-prime wholesale.
