# Least-Action Spike — Mechanism Economy Calibration

This spike tests whether **Least-Action Fitness** is real signal or just a prettier
way to say "write less."

It is deliberately offline and stdlib-only. No provider key, no Ponytail runtime
dependency, no contract changes.

## What it proves

The spike answers four questions:

1. Does the reviewer catch overbuilt ideas?
2. Does it reject dangerously underbuilt ideas even when they are smaller?
3. Does it preserve irreducible-heavy ideas that need real machinery?
4. Does it understand the 10x Theo move: **lazy breadth** / anti-pattern inversion,
   where "boil the ocean" can become rational if the old breadth constraint weakened?

## Run

```bash
cd spikes/least-action
./demo
```

Outputs:

- `out/results.json`
- `out/report.md`

## Decision gate

- **Kill** if it rewards smallness by itself.
- **Keep** if it catches overbuilt ideas current scoring would miss and rejects unsafe cuts.
- **Promote to first-class contract** only after the same signal holds with the real P4.12 critic over live/corpus candidates.

This spike should graduate to `IMPLEMENTATION_PLAN.md` P4.12 first, not to Appendix-A
contract changes.

## The 10x version

The important fixture is not just "avoid overbuilding." It is:

```text
old taboo: do not boil the ocean
old constraint: breadth was expensive to build, deploy, support, and integrate
substrate removed: agentic codegen + integrated runtimes make shallow breadth cheap
new strategy: broad shells with on-demand depth
```

The reviewer should not reject breadth out of habit. It should reject **owning**
the ocean: bespoke depth, extra services, and irreversible commitments before
evidence demands them.

