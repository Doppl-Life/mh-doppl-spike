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

## Working Prototype

The first runnable slice is deliberately local and stdlib-only. It proves the
core behavior before Neo4j or live research are added:

1. ingest research from one FSD case,
2. persist it as append-only JSONL memory,
3. query that memory while working on a separate FSD case,
4. emit an inspectable knowledge packet with source paths and retrieval reasons.

Run it:

```bash
cd spikes/knowledge-space
./demo
```

The demo ingests `fsd-accident-economy` and `fsd-mobility-and-time`, then asks the
Knowledge Space for useful prior memory while working on `fsd-ownership-unwind`.

Outputs:

- `data/knowledge.jsonl` - durable local memory ledger.
- `out/knowledge_packet.json` - retrieved packet for the later problem.
- `out/report.md` - human-readable demo report.
- `out/graph.html` - local visual graph projection you can open in a browser.
- `out/neo4j.cypher` - Neo4j import projection generated from the ledger.

To inspect the graph locally:

```bash
open out/graph.html
```

Neo4j is intentionally a projection at this stage. Import `out/neo4j.cypher` into
Neo4j when you want graph queries, but keep `data/knowledge.jsonl` as the portable
ledger the projection is generated from.

Run tests:

```bash
cd spikes/knowledge-space
python3 -m unittest test_knowledge_space.py
```

Research an arbitrary problem statement against the local case-study corpus:

```bash
python3 knowledge_space.py \
  --research-problem-file ../../case-studies/fsd-ownership-unwind/problem-statement.md \
  --exclude-case fsd-ownership-unwind
```

Optional cheap OpenRouter enrichment is available, but off by default:

```bash
python3 knowledge_space.py --demo --openrouter
```

Collapse extraction has three modes:

- `fixture` - reads explicit `payload.extracted_knowledge` from run events.
- `heuristic` - locally extracts draft memory from candidate and critic text.
- `openrouter` - optional cheap schema-bounded extraction when a key is present.

Collapse a real run export into the local ledger:

```bash
python3 knowledge_space.py \
  --collapse-events-file fixtures/raw_run_events.json \
  --collapse-extractor heuristic
```

The importer accepts JSON arrays, `{ "events": [...] }` files, JSONL event logs,
and whole current `my-doppl` run objects with `candidates` and `verdicts`.
Each imported event is stored as a `RunEventReceipt` row keyed by `(runId,
sequence)` with stable event and payload hashes. Collapse-derived knowledge then
links back to the exact receipt sequence that produced it, so the visual graph
and Neo4j projection can show a receipt-backed provenance chain.

The OpenRouter key is read from `OPENROUTER_API_KEY` or the workspace-level
`tokens and keys.md` file outside this Git repo. Do not copy keys into this
folder or commit them.

The demo writes both human and runtime-facing artifacts:

- `data/knowledge.jsonl` - durable ledger with source chunk IDs, line spans, and citations.
- `out/research_report.json` - selected local sources for the problem statement.
- `out/collapse_packet.json` - deterministic write-back from a mock culled run.
- `out/knowledge_packet.json` - retrieval packet with `K...` citation handles.
- `out/knowledge_packet_event.json` - future-shaped `knowledge.packet_selected` run event.
- `out/report.md` - human-readable transfer proof with citations.
- `out/graph.html` - interactive local graph workbench with search, filters, SVG graph inspection, and citation details.
- `out/neo4j.cypher` - Neo4j import projection, not the source of truth.

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
