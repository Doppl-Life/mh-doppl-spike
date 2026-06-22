# Tasks: Doppl Knowledge Space

This task list is implementation-ready but intentionally phased. The subsystem
is production-bound; early slices should be small only so they can be verified,
not because the goal is a disposable prototype.

## Phase 0 - Contracts And Boundaries

- [~] Define `KnowledgeNodeBase` schema.
- [~] Define node kind schemas: `Receipt`, `Claim`, `ResearchFinding`,
      `Hypothesis`, `HiddenVariable`, `Heuristic`, `SkillCandidate`,
      `NegativeFinding`, `CaseInsight`, `KnowledgePacket`, `CollapsePacket`.
- [ ] Define edge enum and required edge properties.
- [~] Define `KnowledgePacketRequest`, `KnowledgePacket`, `PacketItem`, and
      `ExcludedKnowledgeItem`.
- [~] Define `CollapseRequest`, `CollapsePacket`, `ExtractedKnowledgeItem`, and
      `PromotionProposal`.
- [ ] Define knowledge event payloads for the Doppl event log:
      `knowledge.packet_requested`, `knowledge.packet_selected`,
      `knowledge.item_injected`, `knowledge.item_excluded`,
      `knowledge.influence_recorded`, `knowledge.collapse_requested`,
      `knowledge.item_extracted`, `knowledge.promotion_proposed`,
      `knowledge.promotion_decided`.
- [ ] Write explicit rule: runtime imports `KnowledgeGateway` port only, never a
      Neo4j driver.
- [ ] Write leakage policy for `public`, `internal`, `withheld_evaluator`, and
      `secret_forbidden` visibility.
- [x] Acceptance gate: schema tests reject missing provenance, missing trust tier,
      and evaluator-only retrieval into candidate-producing roles.

### Phase 0 Walking Notes

- [x] Add stable source chunk IDs, line spans, headings, and citation strings to
      persisted `KnowledgeRecord` rows.
- [x] Add packet item citation handles suitable for future prompt citation.
- [x] Add strict `CollapsePacket` validation for item kind, trust tier, text, and
      provenance before ledger writeback.
- [x] Add `KnowledgePacketRequest`, `ExcludedKnowledgeItem`, and
      `knowledge.packet_selected` JSON event export in the local prototype.
- [x] Propagate citation metadata into JSONL, packet JSON, report Markdown,
      local graph HTML, and Neo4j Cypher projection.
- [x] Add strict schema validators for packet events and leakage rules.

## Phase 1 - Local Graph Repository

- [x] Add local Neo4j dev setup: Docker compose or documented local install.
- [x] Create constraints and indexes for IDs, content hashes, run IDs, case IDs,
      trust tiers, and visibility.
- [ ] Create vector index for embedded receipt/claim/finding text.
- [ ] Implement `Receipt` ingestion from Markdown files.
- [ ] Ingest `mh-doppl-spike/case-studies/` with withheld boundary metadata.
- [ ] Ingest root registers: `MEMORY.md`, `LESSONS_AND_BANGERS.md`,
      `BUGS_AND_MITIGATIONS.md`, and `HEURISTICS.md`.
- [x] Export graph snapshot to JSONL and Markdown.
- [x] Acceptance gate: clean rebuild from exported receipts creates the same node
      IDs and source links.

### Phase 1 Walking Notes

- [x] Add a local visual graph workbench projection in `out/graph.html`.
- [x] Support search, node-type filters, SVG graph inspection, and a details
      panel with citation/chunk metadata.
- [x] Add GitHub Pages-ready knowledge-space workbench at
      `prototypes/knowledge-space/`.
- [x] Export web-ready graph, packet, collapse, research, and summary JSON for
      the hosted workbench.
- [x] Add hosted case-study switching with permalink state and per-case gateway
      packet explanations.
- [x] Add regression coverage that embedded graph data is raw parseable JSON,
      not HTML-escaped script text.
- [x] Add local Neo4j Docker Compose harness with schema, idempotent projection
      import, and smoke queries for receipts/watermarks/provenance.
- [x] Add graph snapshot export/rebuild proof with stable node IDs and edge
      links.
- [x] Document Neo4j Browser visual queries for interactive graph exploration.
- [x] Make the local graph workbench default to a readable runtime view with
      memory and provenance layers available on demand.
- [ ] Add promotion/review actions to the visual workbench once promotion
      workflow exists.
- [x] Add run/candidate/provenance nodes to the graph after collapse/write-back
      exists.

## Phase 2 - Run Event Ingestion

- [~] Add ordered run-event export reader.
- [x] Mirror `Run`, `Generation`, `Agenome`, `Candidate`, `CriticReview`,
      `CheckResult`, `FitnessScore`, and `NoveltyScore` into graph nodes.
- [ ] Link mirrored graph nodes back to authoritative `run_events`.
- [x] Preserve raw event payload receipt hashes.
- [x] Add idempotent ingestion by `(runId, sequence)`.
- [x] Add sequence watermark per ingested run.
- [ ] Acceptance gate: ingesting the same run twice creates no duplicate nodes or
      edges.

### Phase 2 Walking Notes

- [x] Add deterministic mock run-event export in `fixtures/mock_run_events.json`.
- [x] Mirror run-derived provenance into graph projection nodes for `Run`,
      `Candidate`, and `CriticReview`.
- [x] Link extracted records to run/candidate/critic provenance in graph HTML and
      Neo4j Cypher.
- [x] Add JSON array, `{ events: [...] }`, JSONL, and current `my-doppl` whole-run
      import support for collapse writeback.
- [x] Store imported run events as `RunEventReceipt` ledger rows with stable
      event and payload hashes.
- [x] Link receipt nodes to runs, candidates, critics, and collapse-derived
      knowledge in graph HTML and Neo4j Cypher.
- [x] Add sequence watermarks to the run-event reader.
- [x] Detect missing sequence gaps and expose watermark nodes in graph HTML and
      Neo4j Cypher.
- [x] Add richer whole-run projection from `fixtures/rich_run_export.json` for
      generations, agenomes, checks, fitness, and novelty scoring.

## Phase 3 - Embedding And Retrieval

- [ ] Install/configure local embedding adapter using `Qwen/Qwen3-Embedding-0.6B`
      or a drop-in compatible local embedding model.
- [ ] Store embedding model ID, dimension, instruction, and vector with each
      embedded node.
- [~] Implement hybrid retrieval:
      graph filters first, vector search second, rerank third.
- [ ] Add optional local reranker adapter using `Qwen/Qwen3-Reranker-0.6B`.
- [x] Implement local `KnowledgeGateway.selectPacket` contract.
- [~] Add packet budget controls: max items, max tokens, max stale items, required
      warning slots.
- [x] Acceptance gate: a packet for a case-study run includes relevant public
      priors but excludes withheld evaluator-only solution content.

### Phase 3 Walking Notes

- [x] Add `LocalKnowledgeGateway` as the runtime-facing packet selection port for
      the local ledger.
- [x] Add role-aware leakage filtering so candidate-producing roles receive no
      `withheld_evaluator` or `secret_forbidden` records.
- [x] Add deterministic packet budgets for `max_items`, `max_tokens`, and
      `required_warning_slots`.
- [x] Add excluded-record audit metadata for withheld and over-budget items.
- [x] Add graph-first local retrieval filters for target case, source-case
      prefix, kind, required tags, visibility, and minimum trust tier.
- [ ] Add stale item metadata and enforce `max_stale_items`.
- [ ] Replace graph-filtered lexical ranking with vector retrieval and rerank.

## Phase 4 - Runtime Read Integration

- [ ] Add `memoryMode`: `off | auto | pinned`.
- [ ] Call `KnowledgeGateway.selectPacket` after `run.configured` and before
      generation starts.
- [ ] Persist `knowledge.packet_requested` and `knowledge.packet_selected`.
- [ ] Include packet slices in agenome prompt construction.
- [ ] Emit `knowledge.item_injected` per agenome/candidate role.
- [ ] Show selected packet in operator/debug UI or run summary.
- [ ] Acceptance gate: replay uses persisted packet events and performs no fresh
      knowledge retrieval.

## Phase 5 - Influence Tracking

- [x] Add citation handles to packet items.
- [ ] Require candidate/council outputs to cite packet handles when relying on
      memory.
- [ ] Record `knowledge.influence_recorded` for cited items.
- [ ] Detect ignored warnings when a candidate repeats a known negative finding.
- [ ] Update source/item credit ledgers after fitness scoring.
- [ ] Acceptance gate: a source can earn positive or negative credit independent
      of whether the agenome survives.

## Phase 6 - Collapse And Distillation

- [~] Implement `KnowledgeGateway.requestCollapse`.
- [~] Build collapse prompt/schema over run event sequences.
- [ ] Extract:
      claims,
      hidden variables,
      useful sources,
      contradictions,
      negative findings,
      stale facts,
      skill candidates,
      heuristic candidates,
      and promotion proposals.
- [~] Store collapse packet as a receipt and graph node.
- [x] Insert extracted items as `draft` or `candidate` trust tier.
- [x] Link extracted items to run/candidate/critic/check provenance.
- [x] Acceptance gate: a culled agenome with one useful source creates a
      searchable `ResearchFinding` even though its candidate is not selected.

### Phase 6 Walking Notes

- [x] Collapse a mock culled candidate into `ResearchFinding` and
      `NegativeFinding` records.
- [x] Persist collapse-derived records to the JSONL ledger with run, candidate,
      critic, agenome, and event-sequence provenance.
- [x] Write `out/collapse_packet.json` from the demo.
- [x] Add pluggable collapse extractors: deterministic fixture extraction, local
      heuristic draft extraction, and optional cheap OpenRouter extraction.
- [~] Replace deterministic fixture extraction with schema-bound model extraction
      when OpenRouter/local model use is warranted.

## Phase 7 - Promotion Workflow

- [ ] Build promotion queue query.
- [ ] Add review actions: promote, reject, deprecate, mark stale, request refresh.
- [ ] Add automated low-risk promotion for immutable raw receipts only.
- [ ] Require human or policy gate for `validated` and `canonical`.
- [ ] Log `knowledge.promotion_decided`.
- [ ] Export promoted skills/heuristics to repo-appropriate Markdown targets when
      approved.
- [ ] Acceptance gate: no model-generated claim can become `canonical` without a
      promotion decision.

## Phase 8 - Maintenance Jobs

- [ ] Add scheduled ingest job for new run events.
- [ ] Add stale knowledge detector.
- [ ] Add duplicate/similar claim detector.
- [ ] Add source hit-rate updater.
- [ ] Add daily/weekly "what changed in knowledge" summary.
- [ ] Add portable snapshot export job.
- [ ] Acceptance gate: stale time-sensitive claims are either refreshed,
      downgraded, or excluded from default retrieval.

## Phase 9 - Local Fine-Tune Dataset

- [ ] Define dataset schemas for extraction, relation typing, packet assembly,
      and negative finding classification.
- [ ] Export only reviewed examples with provenance and privacy classification.
- [ ] Create train/validation/test splits by case/run so held-out evaluations are
      not contaminated.
- [ ] Fine-tune a local model with LoRA/QLoRA only after at least 200 reviewed
      examples per task exist.
- [ ] Evaluate against held-out extraction fixtures and compare to prompt-only
      baseline.
- [ ] Acceptance gate: fine-tuned model improves schema-valid extraction without
      increasing unsupported claims or leakage.

## Phase 10 - Production Hardening

- [ ] Add migrations for graph schema changes.
- [ ] Add backup/restore docs.
- [ ] Add permission tests for connector visibility.
- [ ] Add replay tests proving no fresh graph reads during replay unless replaying
      original packet events.
- [ ] Add observability: ingest lag, extraction errors, stale count, packet
      selection latency, graph query latency, embedding failures.
- [ ] Add degradation path: if Knowledge Space is unavailable, run continues with
      `memoryMode: off` and a visible event.
- [ ] Acceptance gate: a Doppl run can start, complete, collapse, and influence a
      later run locally with no external SaaS dependency except configured model
      calls.

## First Walking Skeleton

Build this minimal vertical slice first:

1. Ingest two case-study Markdown folders and one saved run-event export.
2. Extract/source-link five claims and two negative findings manually or with a
   schema-bound extractor.
3. Store them in Neo4j with embeddings.
4. Select a packet for a new case-study run.
5. Persist that packet as JSON fixture shaped like future run events.
6. Collapse a mock culled agenome into one searchable finding.
7. Export the graph to JSONL/Markdown and rebuild it.

The walking skeleton is complete only when the packet can be inspected, cited,
and replayed without querying live graph state.

Current skeleton status:

- [x] Ingest multiple FSD case-study Markdown folders.
- [x] Select and persist a packet for a new case-study run.
- [x] Persist packet fixture shaped like future run events.
- [x] Collapse a mock culled agenome into searchable findings.
- [x] Export graph projections to HTML and Neo4j Cypher.
- [ ] Ingest one real saved run-event export from Doppl runtime.
- [x] Rebuild graph from exported receipts and prove stable IDs/source links.
