# Least-Action Calibration Report

Decision: **KEEP: build P4.12 as non-contract evidence; do not promote contracts yet**

## Gate Checks

- PASS `rejects_dangerous_underbuilding`
- PASS `penalizes_overbuilding`
- PASS `preserves_irreducible_heavy`
- PASS `prefers_projection_over_runtime_graph`
- PASS `understands_lazy_breadth`
- PASS `does_not_reward_smallness_alone`

## Candidate Results

| Candidate | Label | Verdict | Mechanism cost | Least-action score | Expected |
|---|---|---:|---:|---:|---:|
| Postgres-derived lineage projection first | `good_minimal` | `promote` | 0.10 | 7.90 | PASS |
| Breadth-first agent shell with on-demand depth | `anti_pattern_inversion` | `promote` | 3.80 | 6.20 | PASS |
| Use platform auth and a user-claimed flow | `good_minimal` | `promote` | 0.80 | 6.20 | PASS |
| AI firm-power constraint thesis with cited current signals | `irreducible_heavy` | `keep` | 3.30 | 5.70 | PASS |
| Skip redaction to ship the event log faster | `dangerously_underbuilt` | `reject` | 0.00 | -2.00 | PASS |
| Make Neo4j a runtime dependency for MVP lineage | `overbuilt` | `reject` | 9.10 | -3.10 | PASS |
| Live-only demo without replay fixture | `dangerously_underbuilt` | `reject` | 1.40 | -4.40 | PASS |
| Let candidates run arbitrary verification scripts | `dangerously_underbuilt` | `reject` | 5.20 | -6.20 | PASS |
| Full horizontal SaaS platform with every vertical prebuilt | `overbuilt` | `reject` | 13.90 | -8.90 | PASS |
| AI changes everything, so build a trend dashboard | `dangerously_underbuilt` | `reject` | 6.70 | -10.70 | PASS |

## What This Means

The rubric is useful only if it does all three: penalizes overbuilt mechanism, rejects unsafe deletion, and preserves heavy-but-necessary evidence machinery.

The 10x fixture is `lazy-breadth-agent-shell`: the reviewer should accept breadth when the old breadth constraint is explicitly weakened, while still penalizing owning bespoke depth before evidence demands it.

## Next Action

Build `IMPLEMENTATION_PLAN.md` P4.12 as evidence-only. Do not add a first-class contract until this same separation holds with the real critic over corpus/live candidates.
