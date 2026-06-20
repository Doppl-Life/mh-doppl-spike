# Spec: Doppl Knowledge Space

## Why

Doppl currently preserves run truth through event logs and visible traces, but a
real Doppl also needs durable intelligence across runs. Research gathered by a
cold agenome should not disappear. Failed hypotheses should make future runs
smarter. Sources that repeatedly yield good signal should earn trust. Skills that
work should become reusable machinery. Case-study insights should become priors
without leaking withheld answers into future evaluations.

The supplied second-brain article frames the missing capability well: a useful
AI system should not restart from a blank chat box. It should own its memory as
portable text, scope work into projects, build reusable skills, connect live
data, maintain itself on a schedule, and enforce permissions with keys rather
than wishful prompts. Doppl needs the same pattern, but with stronger provenance,
evaluation, replay, and evolutionary boundaries.

## Goal

Build a production-bound Knowledge Space for Doppl that:

- ingests run outputs, research artifacts, case-study docs, source receipts,
  human notes, and evaluation results;
- extracts typed knowledge objects and relationships;
- stores them in a graph-plus-vector repository;
- retrieves scoped memory packets into the Doppl run process;
- preserves post-run learning through collapse/distillation;
- supports local-first operation and portable exports;
- and never compromises replay determinism or held-out evaluation.

## User Stories

### Operator Starts A Run With Memory

As a Doppl operator, I configure a run and see a preview of the knowledge packet
that will be made available: relevant prior cases, source receipts, failed
analogies, useful heuristics, and freshness warnings.

Acceptance criteria:

- The packet lists each included knowledge item with provenance and trust tier.
- The packet states what was excluded and why when exclusions are material.
- The operator can run with memory on, memory off, or a pinned memory snapshot.
- The run emits `knowledge.packet_selected` with item IDs and retrieval reasons.

### Agenome Uses Scoped Intelligence

As an agenome, I receive only the memory relevant to my role, subtype, and budget,
not the entire graph.

Acceptance criteria:

- Retrieval is constrained by run subtype, case/evaluation boundary, trust tier,
  permissions, and token budget.
- Withheld evaluator-only material is never available to a candidate-producing
  agenome.
- Every injected memory item has a compact citation handle.
- The prompt packet distinguishes facts, hypotheses, heuristics, warnings, and
  stale claims.

### Cold Agenome Preserves Research

As Doppl, when an agenome is culled or a run ends, I preserve useful research
even if the candidate failed.

Acceptance criteria:

- Post-run distillation can extract claims, sources, contradictions, negative
  findings, useful prompts/skills, and hidden-variable discoveries.
- Extracted items start as `draft` or `candidate` trust tier.
- Promotion requires an evidence gate and reviewer or automated policy.
- The source event and original text remain reachable.

### Future Run Avoids Rediscovering Dead Ends

As a future run, I can retrieve negative knowledge about stale sources, bad
analogies, reward hacks, or prior failures before spending energy on them again.

Acceptance criteria:

- Negative findings use first-class node labels and relation types.
- Retrieval can include warnings even when it excludes positive priors.
- A run that repeats a known dead end emits an explicit "ignored warning" event.

### Researcher Queries The Knowledge Space

As a Doppl researcher, I can ask graph questions like:

- Which hidden variables recur across strong zeitgeist cases?
- Which sources have produced high-fitness candidates?
- Which agenome traits repeatedly surface useful research but weak final ideas?
- What claims support this case-study branch?
- Which findings have gone stale?

Acceptance criteria:

- Queries return evidence-backed paths, not only node lists.
- Results include source links, event IDs, and freshness metadata.
- The same knowledge can be exported to Markdown/JSONL.

## Core Concepts

### Knowledge Object

A durable atomic unit of remembered intelligence. Examples:

- `Claim`
- `SourceReceipt`
- `ResearchFinding`
- `Hypothesis`
- `HiddenVariable`
- `Heuristic`
- `SkillCandidate`
- `NegativeFinding`
- `CaseInsight`
- `AgenomeTraitObservation`
- `EvaluationResult`
- `RunSummary`

### Trust Tier

Memory becomes influential only through promotion:

- `raw`: ingested but not interpreted.
- `draft`: extracted by model or script, not reviewed.
- `candidate`: plausible and source-backed.
- `validated`: survived review or repeated evidence.
- `canonical`: stable doctrine for Doppl.
- `deprecated`: retained for history, not injected as guidance.

### Retrieval Packet

A bounded, inspectable bundle selected for a run or agent:

- `facts`: high-trust claims with citations.
- `hypotheses`: useful but uncertain claims.
- `warnings`: negative findings and stale-risk notes.
- `patterns`: heuristics, skills, and analogies.
- `sources`: receipts or URLs the run may inspect.
- `excluded`: known sensitive, withheld, stale, or out-of-scope items.

### Collapse Packet

The post-run distillation artifact produced when a run, generation, or agenome
collapses:

- what was learned,
- what failed,
- which sources mattered,
- which edges should be created,
- which memories should be promoted, deprecated, or refreshed,
- and which reusable skill or agenome mutation should be proposed.

## Functional Requirements

### FR-1: Ingest

The system ingests:

- Doppl `run_events` and projections;
- candidate artifacts, critic reviews, checks, novelty scores, and fitness;
- retrieval/web-search results already persisted in events;
- case-study Markdown and withheld/non-withheld boundaries;
- human-authored docs such as `MEMORY.md`, `LESSONS_AND_BANGERS.md`,
  `BUGS_AND_MITIGATIONS.md`, and `HEURISTICS.md`;
- source documents, URLs, PDFs, transcripts, and pasted text;
- manually authored notes.

### FR-2: Normalize

All ingested content is normalized into immutable raw receipts plus extracted
knowledge objects. Raw receipts are append-only. Extracted objects may be revised
through new versions, never silent overwrite.

### FR-3: Link

The graph captures relationships such as:

- `SUPPORTED_BY`
- `CONTRADICTED_BY`
- `DERIVED_FROM`
- `MENTIONS`
- `GENERALIZES`
- `SPECIALIZES`
- `ANALOGOUS_TO`
- `FAILED_BECAUSE`
- `PROMOTED_TO`
- `DEPRECATED_BY`
- `USED_IN_RUN`
- `INFLUENCED_CANDIDATE`
- `WARNED_AGAINST`
- `REFRESH_DUE`

### FR-4: Retrieve Into Doppl Runs

Before generation, the runtime requests a scoped retrieval packet through a
`KnowledgeGateway` port. The packet is persisted into the run event stream and
is treated as data available to agent prompts, not as hidden mutable state.

### FR-5: Distill After Runs

After a run or generation, Doppl emits a collapse request. The Knowledge Space
extracts durable items and proposes graph updates. Promotion may be automatic for
low-risk receipts, but claims, heuristics, and skills require gates.

### FR-6: Query

The system supports:

- semantic search over claims, receipts, and artifacts;
- graph traversal over provenance and lineage;
- hybrid queries combining graph filters with vector similarity;
- export to Markdown and JSONL;
- refresh queries for stale knowledge.

### FR-7: Fine-Tuning Dataset Creation

The Knowledge Space can produce reviewed local training datasets for specific
tasks:

- knowledge extraction from run artifacts;
- claim typing and relation extraction;
- retrieval packet assembly;
- stale/unsafe memory detection;
- Doppl-specific summary style;
- skill candidate recognition.

Raw database contents are not used directly for fine-tuning. Only reviewed,
schema-valid examples with provenance and privacy classification are eligible.

## Non-Functional Requirements

- **Local-first:** must run locally without SaaS dependencies for development.
- **Portable:** must export durable Markdown/JSONL snapshots.
- **Replay-safe:** replay never depends on fresh knowledge retrieval unless the
  retrieved packet was persisted in the original run.
- **Auditable:** every influential memory has provenance and model metadata.
- **Permissioned:** connectors default to read-only and scoped credentials.
- **Versioned:** schemas, extraction prompts, embedding models, and local model
  adapters are versioned.
- **Freshness-aware:** time-sensitive nodes carry staleness metadata.
- **Model-flexible:** local models can be swapped without rewriting storage.

## Out Of Scope For First Build

- Autonomous deletion of knowledge.
- Agent-written secrets or credential management.
- Fine-tuning a general-purpose foundation model on the whole database.
- Neo4j as replacement for Postgres run truth.
- Production multi-tenant access control.
- Automatic promotion to canonical doctrine without review.

## Success Criteria

The first real implementation is successful when:

1. A completed Doppl run can export a collapse packet into the Knowledge Space.
2. A later run can retrieve a scoped memory packet and persist exactly what it
   used.
3. A researcher can query source-backed paths across runs, cases, claims, and
   outcomes.
4. A cold agenome's useful research can be found later even if its candidate was
   culled.
5. Replay of a run uses the original persisted memory packet, not live graph
   state.
6. The repository can be rebuilt from Postgres events plus portable exports.

