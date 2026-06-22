# Knowledge Event Receipts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make imported Doppl run events durable, idempotent graph receipts that every normalized graph node can trace back to.

**Architecture:** Keep JSONL as the portable source of truth. Add receipt rows for raw imported run events, derive graph receipt nodes from those rows, and connect receipts to normalized `Run`, `Candidate`, `CriticReview`, and collapse-derived `KnowledgeRecord` nodes.

**Tech Stack:** Python stdlib, `unittest`, JSONL ledger, generated HTML graph projection, generated Neo4j Cypher projection.

---

### Task 1: Receipt Hashing And Idempotent Import

**Files:**
- Modify: `spikes/knowledge-space/knowledge_space.py`
- Modify: `spikes/knowledge-space/test_knowledge_space.py`

- [ ] **Step 1: Write failing tests**

Add tests that call `load_run_events("fixtures/raw_run_events.json")`, ingest receipts twice, and assert:
- `RunEventReceipt` records have stable `event_hash`
- duplicate `(runId, sequence)` rows are skipped
- receipt fields include `run_id`, `sequence`, `event_type`, `source_path`, and `payload_hash`

- [ ] **Step 2: Run focused tests**

Run:

```bash
cd spikes/knowledge-space
python3 -m unittest test_knowledge_space.KnowledgeSpaceTest.test_import_run_event_receipts_is_idempotent
```

Expected: fail because receipt import does not exist yet.

- [ ] **Step 3: Implement receipt model and import**

Add a `RunEventReceipt` dataclass with `to_json` / `from_json`, stable canonical JSON hashing, and `KnowledgeSpace.ingest_run_events(events, source_path)` that appends only new `(runId, sequence)` receipts.

- [ ] **Step 4: Run tests**

Run:

```bash
cd spikes/knowledge-space
python3 -m unittest test_knowledge_space.py
```

Expected: all tests pass.

### Task 2: Graph Projection Edges From Receipts

**Files:**
- Modify: `spikes/knowledge-space/knowledge_space.py`
- Modify: `spikes/knowledge-space/test_knowledge_space.py`

- [ ] **Step 1: Write failing graph test**

Assert `graph_projection()` includes `RunEventReceipt` nodes and edges:
- `RECEIPT_OF_RUN`
- `RECEIPT_OF_CANDIDATE`
- `RECEIPT_OF_CRITIC`
- `DERIVED_FROM_RECEIPT`

- [ ] **Step 2: Implement graph projection**

Extend `graph_projection()`, `to_cypher()`, and `render_graph_html()` type filters/colors to include `RunEventReceipt` nodes and event metadata.

- [ ] **Step 3: Run tests and demo**

Run:

```bash
cd spikes/knowledge-space
python3 -m unittest test_knowledge_space.py
./demo
```

Expected: tests pass and `out/graph.html` contains receipt nodes.

### Task 3: CLI, Docs, And Task Tracking

**Files:**
- Modify: `spikes/knowledge-space/knowledge_space.py`
- Modify: `spikes/knowledge-space/README.md`
- Modify: `spikes/knowledge-space/tasks.md`

- [ ] **Step 1: Wire CLI import**

When `--collapse-events-file` is used, ingest run-event receipts before collapse writeback and report both receipt count and collapsed record count.

- [ ] **Step 2: Update docs and tasks**

Document event receipt identity and update Phase 2 walking notes to mark receipt hashing/idempotent import as complete while leaving watermarks as pending if not implemented.

- [ ] **Step 3: Final verification**

Run:

```bash
cd spikes/knowledge-space
python3 -m unittest test_knowledge_space.py
python3 knowledge_space.py --collapse-events-file fixtures/raw_run_events.json --collapse-extractor heuristic
git diff --cached | rg -n 'OpenRouter key pattern'
```

Expected: tests pass, CLI import works, and secret scan returns no matches.
