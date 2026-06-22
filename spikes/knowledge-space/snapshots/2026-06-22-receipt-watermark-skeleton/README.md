# Knowledge Space Snapshot: Receipt/Watermark Skeleton

This snapshot preserves the local-first knowledge graph state before the more
robust Neo4j dev harness work.

It captures the receipt/watermark skeleton:

- JSONL remains the durable source of truth.
- Imported run events persist as `RunEventReceipt` rows keyed by `(runId, sequence)`.
- Each receipt stores stable event and payload hashes.
- Each run has a `RunEventWatermark` row with high-watermark, max sequence seen,
  missing sequence gaps, receipt count, and source paths.
- Collapse-derived knowledge records link back to the exact receipt sequence that
  produced them.
- `graph.html` and `neo4j.cypher` are rebuildable projections of the JSONL ledger.

## Files

- `knowledge.jsonl` - portable ledger snapshot.
- `graph.html` - local visual graph workbench snapshot.
- `neo4j.cypher` - Neo4j projection generated from the ledger.
- `collapse_packet.json` - collapse output from the culled run fixture.
- `knowledge_packet.json` - retrieval packet for the later FSD ownership problem.
- `knowledge_packet_event.json` - future-shaped packet-selected event.
- `report.md` - human-readable transfer proof.

## Inspect

Open `graph.html` and use the `Receipts` and `Watermarks` filters to see how raw
run events connect to runs, candidates, critics, and collapse-derived knowledge.
