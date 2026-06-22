# Knowledge Space Radial Memory Flow Design

## Purpose

The hosted Knowledge Space workbench should make the architecture obvious at a
glance. The current graph proves that data exists and is connected, but its
mostly equidistant layout does not show which memory is closest to a problem,
which records were retrieved, which records were excluded, or how prior
knowledge influenced solutioning.

Add a new workbench mode that demonstrates Doppl's durable memory loop:

1. A prior problem teaches the knowledge graph durable items.
2. A later problem retrieves selected items from that graph.
3. Doppl combines prior memory with new case context during candidate
   generation.
4. The runtime records injection, citation, influence, and credit outcomes.
5. The graph can evolve through collapse and gated promotion.

## Recommended Approach

Use a hybrid radial graph with two layout modes:

- **Relevance View** is the default. The active case or run sits at the center,
  and nodes are placed closer when they are more useful to the active problem.
- **Process View** is the explainer mode. Rings represent Doppl memory stages:
  ingest, extract, retrieve, inject, cite, credit, and promote.

The first implementation should use deterministic SVG layout rather than D3,
Cytoscape, or a force simulation. A stable layout is easier to test, easier to
publish to GitHub Pages, and easier to reason about while the data contracts are
still evolving.

## User Experience

Add a fifth segmented workbench mode: **Memory Flow**.

The mode has two parts:

- A vertical narrative rail with five concise steps.
- A radial SVG graph that updates with the active case.

The narrative rail should avoid generic product copy. It should use real case
names and real packet data where possible. Example:

- For `fsd-accident-economy`, the graph learns accident-dependent economy
  warnings, claims, and source-backed signals.
- For `fsd-ownership-unwind`, the gateway retrieves accident-economy memory and
  combines it with ownership-specific records.
- Candidate artifacts cite packet handles.
- Influence and credit events prove whether memory affected the run.

The graph should remain inspectable: clicking a node updates the existing
inspector with provenance, trust tier, citation, score, and retrieval reason
where available.

## Radial Layout

### Relevance View Rings

- **Center:** active problem or run.
- **Ring 1:** selected packet records for the active case.
- **Ring 2:** source cases and direct source-backed claims behind the packet.
- **Ring 3:** related records, run artifacts, candidates, critic reviews, and
  embeddings.
- **Outer Ring:** exclusions, withheld evaluator-only items, stale records, or
  lower-trust distant records.

Distance communicates usefulness to the active problem. Nodes with higher packet
score, selected packet membership, or influence/credit events should be closer
to the center. Excluded and withheld nodes should be visibly farther out.

### Process View Rings

- **Ingest:** case docs, source chunks, run receipts.
- **Extract:** claims, hidden variables, warnings, negative findings.
- **Retrieve:** packet-selected items and excluded items.
- **Inject:** `knowledge.item_injected` recipients.
- **Cite:** candidate artifacts that cite packet handles.
- **Credit:** `knowledge.influence_recorded` and `knowledge.credit_recorded`
  outcomes.
- **Promote:** gated future promotion path.

Process View can use the same graph records, but ring placement comes from stage
rather than relevance.

## Visual Encoding

- Node distance: retrieval relevance or process stage.
- Node angle: thematic cluster, such as accident economy, ownership,
  enforcement, mobility/time, finance, or warnings.
- Node color: existing record/case/run type palette.
- Node stroke: selected packet membership, active case, source case, or
  excluded status.
- Edge thickness: influence or credit strength when available.
- Dashed edges: excluded, withheld, stale, or future-gated relationships.
- Highlight path: active case -> selected packet item -> candidate citation ->
  influence -> credit.

The first slice may approximate clusters with deterministic keyword/theme
matching. It does not need model-driven clustering.

## Data Flow

The feature should consume existing static exports under
`prototypes/knowledge-space/data/`:

- `graph.json`
- `knowledge_packets_by_case.json`
- `knowledge_packet.json`
- `knowledge_packet_event.json`
- `collapse_packet.json`
- `summary.json`

If influence and credit events are not yet exported into the hosted data, the
first implementation should still render the path with packet and retrieval
data, then show influence/credit as "runtime event available in kernel trace" or
`not exported yet`. Later slices can export kernel run traces into the workbench
data directory.

No Neo4j driver should be used in the web prototype. The hosted workbench remains
static and GitHub Pages-compatible.

## Components

- `VIEW_COPY.memoryFlow`: mode title, eyebrow, and note.
- `renderMemoryFlow()`: main renderer for narrative and radial graph.
- `buildMemoryFlowModel(activeCase, graph, packet)`: converts static exports
  into radial nodes, edges, rings, clusters, and path annotations.
- `layoutRadialNodes(model, mode)`: deterministic layout by ring and angle.
- `renderRadialGraph(model)`: SVG nodes, edges, labels, rings, and legend.
- `inspectFlowNode(nodeId)`: reuses the existing inspector patterns.

## Testing

Add lightweight browser-free tests where practical:

- model builder assigns selected packet items to Ring 1;
- excluded items are assigned to the outer ring;
- active case is centered;
- URL state supports `?view=memory-flow`;
- rendered HTML contains the narrative steps and radial SVG container.

If the current prototype has no test harness, add a small Node-based test for
pure model helpers before wiring DOM rendering.

## Acceptance Criteria

- The hosted workbench has a fifth **Memory Flow** mode.
- The mode is reachable by URL state and does not break existing views.
- A visitor can understand a cross-problem loop without reading the spec:
  prior case learns memory, later case retrieves it, Doppl uses it, outcomes are
  recorded.
- The radial graph places selected packet memory closer to the active case than
  excluded or distant records.
- Existing graph, packet, exclusions, and collapse modes still work.
- Static export and GitHub Pages compatibility are preserved.

## Out Of Scope For First Slice

- Force-directed physics layout.
- Live Neo4j Browser embedding.
- Model-generated semantic clustering.
- Editing or promoting knowledge from the graph.
- Persisting new influence/credit exports from kernel traces into hosted data.

Those are appropriate follow-up slices once the radial architecture proof is
visible and stable.
