# Knowledge Space Constitution

## Purpose

The Knowledge Space exists to preserve and reuse Doppl's intelligence across
runs. It is not an agent chat history, not a private notebook, and not a
replacement for Doppl's event log. It is the durable repository where useful
research, validated findings, failed hypotheses, source receipts, lineage
patterns, learned skills, and case-study knowledge survive after an agenome or
run goes cold.

## Non-Negotiables

1. **Event log remains truth.**
   The Postgres append-only `run_events` stream is authoritative for lifecycle,
   replay, fitness, lineage decisions, model outputs, retrieval results, and
   evidence. The Knowledge Space can enrich, index, summarize, and connect those
   facts, but it cannot overwrite run truth.

2. **Every remembered claim needs provenance.**
   A knowledge node that can influence a run must link to at least one source:
   a `run_event`, source document, case-study file, URL receipt, human note, or
   evaluation artifact. Unsupported notes may exist as drafts but cannot be
   injected into a run as trusted context.

3. **Memory is scoped before it is retrieved.**
   Doppl never dumps the whole knowledge graph into an agenome. Retrieval is
   scoped by run goal, case, subtype, time horizon, trust tier, permissions, and
   energy budget.

4. **Research survives collapse.**
   A cold or culled agenome can still contribute durable intelligence. Its final
   artifact may fail, while a source, hidden variable, contradiction, dead end,
   or useful technique gets preserved as a separate knowledge object.

5. **Promotion is gated.**
   Raw notes do not become priors automatically. Promotion from observation to
   durable prior requires evidence, review, freshness metadata, and a clear
   scope of validity.

6. **Negative knowledge is first-class.**
   Dead ends, reward hacks, brittle sources, false analogies, stale signals, and
   failed retrieval patterns are stored so Doppl can avoid rediscovering them.

7. **Plain-text portability is mandatory.**
   The graph database may be Neo4j, but the system must export/import durable
   Markdown/JSONL artifacts. The memory must outlive a vendor, local database,
   model, or UI.

8. **Permission boundaries beat prompts.**
   Read-only connectors are default. Write actions, deletion, email sending,
   external posting, and secret handling are controlled by credentials and
   adapter capabilities, not by instructing an agent to behave.

9. **Knowledge decays unless refreshed.**
   Time-sensitive facts carry `validFrom`, `validThrough`, `observedAt`,
   `stalenessPolicy`, and `refreshDueAt`. Old intelligence can remain useful,
   but it must advertise its age.

10. **Run influence must be observable.**
    If retrieved knowledge changes a run, the run emits events showing what was
    retrieved, why it was selected, how much context budget it consumed, and
    which candidate or score it influenced.

## Design Taste

- Prefer small durable objects over giant summaries.
- Prefer graph relationships for "why is this connected?" and embeddings for
  "what else is semantically similar?"
- Prefer local-first storage while preserving a hosted migration path.
- Prefer retrieval packets that are inspectable by humans.
- Prefer explicit uncertainty over confident memory laundering.

## Forbidden Moves

- No Neo4j-as-authoritative-runtime unless the Doppl architecture is explicitly
  reopened.
- No opaque vector-only memory that cannot explain why a result was retrieved.
- No fine-tuning on unreviewed raw run logs.
- No storing secrets, raw credentials, or private connector payloads in prompts,
  traces, knowledge nodes, or exports.
- No automatic promotion of model-written summaries into trusted doctrine.
- No retrieval injection that bypasses the held-out fitness anchor.

