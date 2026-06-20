# Knowledge Space Spike

A production-bound design spike for Doppl's durable knowledge repository.

This is not a demo note vault and not a throwaway graph toy. The goal is to
specify the real memory substrate a production Doppl should use to preserve
research, source receipts, learned heuristics, negative findings, lineages,
evaluation evidence, and reusable skills across runs.

The user-facing question is simple:

> If an agenome goes cold, what happens to the intelligence it found?

The answer here is a **Doppl Knowledge Space**: a local-first, append-aware,
graph-plus-vector repository that sits beside the Doppl kernel and turns run
intelligence into durable, queryable, evolving memory.

## SDD Artifacts

Following `Spec Driven Development.pdf`, this folder keeps four living artifacts:

- [constitution.md](./constitution.md) - non-negotiable rules for this subsystem.
- [spec.md](./spec.md) - what the subsystem must do and why.
- [plan.md](./plan.md) - architecture, data flow, model choices, and integration plan.
- [tasks.md](./tasks.md) - implementation slices and acceptance gates.

## One Sentence

Doppl Knowledge Space ingests every useful research artifact and run lesson into
a durable knowledge graph, retrieves the right priors before each run, captures
what each run learned after collapse, and gives future agenomes a memory without
letting memory rewrite truth.

## Article Seed

The design is grounded in the "AI second brain" pattern supplied by the user:
plain-text ownership, project-scoped context, reusable skills, live-data
ingestion, scheduled maintenance, and hard permission boundaries. Translated to
Doppl, the pattern becomes:

- Plain text / structured exports are the portable outer layer.
- Neo4j / graph storage is the query engine, not the only copy.
- Run events and evidence receipts anchor all remembered claims.
- Skills, heuristics, and case knowledge are promoted only through gates.
- Scheduled maintenance keeps memory fresh without silently changing run truth.

## Relationship To Existing Spikes

- `discovery/` points Doppl at new opportunities.
- `agenotype/` and `crucible/` create and test ideas.
- `least-action/` calibrates mechanism economy.
- `knowledge-space/` remembers what the organism learned so later runs do not
  begin from a blank chat box.

## Production Posture

This spike should graduate into real Doppl as a first-class subsystem after the
event-store contracts are stable. It may start with local Neo4j plus file-backed
exports, but the contract must already fit production:

- deterministic replay boundaries,
- scoped retrieval into runs,
- source-backed claims,
- model/version metadata,
- promotion and decay policies,
- permission-level safety,
- and migration-ready schemas.

