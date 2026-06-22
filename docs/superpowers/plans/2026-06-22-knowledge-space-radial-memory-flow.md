# Knowledge Space Radial Memory Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hosted **Memory Flow** tab that proves the knowledge graph architecture with a radial relevance graph and a short cross-problem narrative.

**Architecture:** Keep the GitHub Pages prototype static and deterministic. Put graph semantics in a pure helper module, test that module with Node, then wire the helper into the existing `prototypes/knowledge-space/app.js` renderer and `styles.css` surface.

**Tech Stack:** Plain HTML, CSS, vanilla browser JavaScript modules, Node's built-in test runner, static JSON exports under `prototypes/knowledge-space/data/`.

---

## File Structure

- Create `prototypes/knowledge-space/flow-model.mjs`
  - Pure model helpers for Memory Flow.
  - No DOM access.
  - Exports `buildMemoryFlowModel`, `layoutRadialNodes`, `memoryFlowSteps`, and `themeForFlowNode`.
- Create `prototypes/knowledge-space/flow-model.test.mjs`
  - Node tests for ring assignment, active case center, exclusions, and process-view stage placement.
- Modify `prototypes/knowledge-space/index.html`
  - Add a fifth segmented button: `data-mode="memory-flow"`.
  - Add `<div id="memoryFlowView" class="memory-flow-view hidden"></div>`.
- Modify `prototypes/knowledge-space/app.js`
  - Import flow helpers.
  - Add `memory-flow` view copy.
  - Add `state.flowLayoutMode`.
  - Render narrative steps and radial SVG.
  - Reuse the existing inspector when a flow node is clicked.
- Modify `prototypes/knowledge-space/styles.css`
  - Add radial graph, narrative rail, process/relevance toggle, rings, node, edge, and responsive styles.
- Modify `prototypes/knowledge-space/README.md`
  - Document `?view=memory-flow`.
- Modify `spikes/knowledge-space/tasks.md`
  - Mark the hosted radial architecture proof slice complete after implementation.

## Task 1: Pure Memory Flow Model

**Files:**
- Create: `prototypes/knowledge-space/flow-model.mjs`
- Create: `prototypes/knowledge-space/flow-model.test.mjs`

- [ ] **Step 1: Write the failing model tests**

Create `prototypes/knowledge-space/flow-model.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { buildMemoryFlowModel, layoutRadialNodes, memoryFlowSteps } from "./flow-model.mjs";

const graph = {
  nodes: [
    { id: "case:fsd-ownership-unwind", type: "Case", label: "fsd-ownership-unwind" },
    { id: "case:fsd-accident-economy", type: "Case", label: "fsd-accident-economy" },
    { id: "record:ks_accident_warning", type: "KnowledgeRecord", label: "warning", kind: "warning", text: "Accident economy warning", source_case: "fsd-accident-economy" },
    { id: "record:ks_excluded", type: "KnowledgeRecord", label: "withheld", kind: "signal", text: "Withheld evaluator-only solution", source_case: "fsd-ownership-unwind" },
  ],
  edges: [
    { source: "record:ks_accident_warning", target: "case:fsd-accident-economy", type: "SOURCED_FROM_CASE" },
    { source: "record:ks_accident_warning", target: "case:fsd-ownership-unwind", type: "RELEVANT_TO" },
  ],
};

const packet = {
  request: { target_case: "fsd-ownership-unwind" },
  items: [
    {
      cite_handle: "KACCID",
      final_score: 0.91,
      reason: "Relevant accident-economy warning.",
      record: {
        id: "ks_accident_warning",
        kind: "warning",
        source_case: "fsd-accident-economy",
        heading: "Accident economy warning",
        text: "Do not treat autonomy as only safer roads.",
      },
    },
  ],
  excluded: [
    {
      record_id: "ks_excluded",
      case: "fsd-ownership-unwind",
      reason: "withheld from candidate-producing role",
      visibility: "withheld_evaluator",
    },
  ],
};

test("relevance model centers active case and pulls selected packet records into ring 1", () => {
  const model = buildMemoryFlowModel({ activeCase: "fsd-ownership-unwind", graph, packet, mode: "relevance" });

  assert.equal(model.center.id, "case:fsd-ownership-unwind");
  assert.equal(model.nodes.find((node) => node.id === "record:ks_accident_warning")?.ring, 1);
  assert.equal(model.nodes.find((node) => node.id === "case:fsd-accident-economy")?.ring, 2);
  assert.equal(model.nodes.find((node) => node.id === "record:ks_excluded")?.ring, 4);
});

test("process model assigns selected memory to retrieve stage and exclusions to retrieve outer status", () => {
  const model = buildMemoryFlowModel({ activeCase: "fsd-ownership-unwind", graph, packet, mode: "process" });

  assert.equal(model.nodes.find((node) => node.id === "record:ks_accident_warning")?.stage, "retrieve");
  assert.equal(model.nodes.find((node) => node.id === "record:ks_excluded")?.stage, "retrieve");
  assert.equal(model.nodes.find((node) => node.id === "record:ks_excluded")?.status, "excluded");
});

test("radial layout places the center at canvas center and ring 1 closer than ring 4", () => {
  const model = buildMemoryFlowModel({ activeCase: "fsd-ownership-unwind", graph, packet, mode: "relevance" });
  const laidOut = layoutRadialNodes(model, { width: 800, height: 600 });
  const center = laidOut.nodes.find((node) => node.id === "case:fsd-ownership-unwind");
  const selected = laidOut.nodes.find((node) => node.id === "record:ks_accident_warning");
  const excluded = laidOut.nodes.find((node) => node.id === "record:ks_excluded");

  assert.equal(center.x, 400);
  assert.equal(center.y, 300);
  assert.ok(selected.distanceFromCenter < excluded.distanceFromCenter);
});

test("narrative steps describe prior learning, retrieval, injection, citation, and graph evolution", () => {
  const steps = memoryFlowSteps({ activeCase: "fsd-ownership-unwind", packet });

  assert.equal(steps.length, 5);
  assert.match(steps[0].title, /learns/i);
  assert.match(steps[1].title, /retrieves/i);
  assert.match(steps[3].body, /cite/i);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike/prototypes/knowledge-space
/Users/dalton/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test flow-model.test.mjs
```

Expected: FAIL with a module-not-found or missing-export error for `flow-model.mjs`.

- [ ] **Step 3: Implement the pure model helper**

Create `prototypes/knowledge-space/flow-model.mjs`:

```js
const STAGE_RING = {
  ingest: 1,
  extract: 2,
  retrieve: 3,
  inject: 4,
  cite: 5,
  credit: 6,
  promote: 7,
};

const THEME_KEYWORDS = [
  ["accident", ["accident", "crash", "insurance", "repair", "legal"]],
  ["ownership", ["ownership", "dealer", "financing", "household", "loan"]],
  ["enforcement", ["enforcement", "traffic", "police", "compliance", "registration"]],
  ["mobility", ["mobility", "time", "commute", "driver", "rideshare", "trucking"]],
  ["warning", ["warning", "negative", "withheld", "stale", "risk"]],
];

function recordNodeId(recordId) {
  return String(recordId || "").startsWith("record:") ? String(recordId) : `record:${recordId}`;
}

function caseNodeId(caseId) {
  return String(caseId || "").startsWith("case:") ? String(caseId) : `case:${caseId}`;
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function graphNodeById(graph) {
  return new Map((graph.nodes || []).map((node) => [node.id, node]));
}

function packetRecords(packet) {
  return (packet.items || []).map((item, index) => ({
    id: recordNodeId(item.record?.id),
    type: "KnowledgeRecord",
    label: item.record?.heading || item.record?.kind || item.cite_handle || item.record?.id,
    ring: 1,
    stage: "retrieve",
    status: "selected",
    theme: themeForFlowNode(item.record || item),
    score: Number(item.final_score ?? item.score ?? 0),
    citeHandle: item.cite_handle,
    reason: item.reason,
    packetItem: item,
  }));
}

function sourceCaseNodes(packet) {
  return (packet.items || []).map((item) => ({
    id: caseNodeId(item.record?.source_case),
    type: "Case",
    label: item.record?.source_case,
    ring: 2,
    stage: "ingest",
    status: "source",
    theme: themeForFlowNode(item.record || item),
    score: 0.65,
  }));
}

function excludedNodes(packet, byId) {
  return (packet.excluded || [])
    .filter((item) => item.record_id)
    .map((item) => {
      const graphNode = byId.get(recordNodeId(item.record_id));
      return {
        ...(graphNode || {}),
        id: recordNodeId(item.record_id),
        type: graphNode?.type || "KnowledgeRecord",
        label: graphNode?.label || item.record_id,
        ring: 4,
        stage: "retrieve",
        status: "excluded",
        theme: themeForFlowNode(graphNode || item),
        score: 0.15,
        exclusion: item,
      };
    });
}

function relatedNodes(graph, packet, selectedIds, excludedIds) {
  const sourceCases = new Set((packet.items || []).map((item) => caseNodeId(item.record?.source_case)));
  return (graph.nodes || [])
    .filter((node) => !selectedIds.has(node.id) && !excludedIds.has(node.id) && !sourceCases.has(node.id))
    .filter((node) => node.type === "Run" || node.type === "Candidate" || node.type === "CriticReview" || node.type === "RunEventReceipt")
    .slice(0, 18)
    .map((node) => ({
      ...node,
      ring: 3,
      stage: node.type === "RunEventReceipt" ? "ingest" : node.type === "Candidate" ? "cite" : "extract",
      status: "related",
      theme: themeForFlowNode(node),
      score: 0.35,
    }));
}

function flowEdges(activeCase, packet) {
  const centerId = caseNodeId(activeCase);
  const selectedEdges = (packet.items || []).flatMap((item) => [
    {
      source: centerId,
      target: recordNodeId(item.record?.id),
      type: "RETRIEVES",
      status: "selected",
      weight: Number(item.final_score ?? item.score ?? 0.7),
    },
    {
      source: recordNodeId(item.record?.id),
      target: caseNodeId(item.record?.source_case),
      type: "SOURCED_FROM_CASE",
      status: "source",
      weight: 0.55,
    },
  ]);
  const excludedEdges = (packet.excluded || [])
    .filter((item) => item.record_id)
    .map((item) => ({
      source: centerId,
      target: recordNodeId(item.record_id),
      type: "EXCLUDES",
      status: "excluded",
      weight: 0.25,
    }));
  return [...selectedEdges, ...excludedEdges];
}

export function themeForFlowNode(node) {
  const text = [node?.label, node?.kind, node?.text, node?.source_case, node?.reason]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const match = THEME_KEYWORDS.find(([, keywords]) => keywords.some((keyword) => text.includes(keyword)));
  return match ? match[0] : "general";
}

export function buildMemoryFlowModel({ activeCase, graph, packet, mode = "relevance" }) {
  const byId = graphNodeById(graph);
  const center = {
    ...(byId.get(caseNodeId(activeCase)) || {}),
    id: caseNodeId(activeCase),
    type: "Case",
    label: activeCase,
    ring: 0,
    stage: mode === "process" ? "retrieve" : "center",
    status: "active",
    theme: themeForFlowNode({ label: activeCase }),
    score: 1,
  };
  const selected = packetRecords(packet);
  const sourceCases = sourceCaseNodes(packet);
  const excluded = excludedNodes(packet, byId);
  const selectedIds = new Set(selected.map((node) => node.id));
  const excludedIds = new Set(excluded.map((node) => node.id));
  const related = relatedNodes(graph, packet, selectedIds, excludedIds);
  const nodes = uniqueById([center, ...selected, ...sourceCases, ...related, ...excluded]).map((node) => (
    mode === "process" ? { ...node, ring: node.status === "active" ? 0 : STAGE_RING[node.stage] || 7 } : node
  ));
  return {
    mode,
    activeCase,
    center,
    nodes,
    edges: flowEdges(activeCase, packet),
    rings: mode === "process"
      ? ["center", "ingest", "extract", "retrieve", "inject", "cite", "credit", "promote"]
      : ["center", "selected memory", "source cases", "related run artifacts", "excluded/distant memory"],
  };
}

export function layoutRadialNodes(model, { width, height }) {
  const centerX = Math.round(width / 2);
  const centerY = Math.round(height / 2);
  const maxRing = Math.max(...model.nodes.map((node) => node.ring), 1);
  const ringStep = Math.min(width, height) / (2 * (maxRing + 1));
  const grouped = new Map();
  for (const node of model.nodes) {
    grouped.set(node.ring, [...(grouped.get(node.ring) || []), node]);
  }
  const nodes = model.nodes.map((node) => {
    if (node.ring === 0) {
      return { ...node, x: centerX, y: centerY, radius: 18, distanceFromCenter: 0 };
    }
    const peers = [...(grouped.get(node.ring) || [])].sort((a, b) => String(a.label || a.id).localeCompare(String(b.label || b.id)));
    const index = peers.findIndex((peer) => peer.id === node.id);
    const angle = ((Math.PI * 2) / Math.max(1, peers.length)) * index - Math.PI / 2;
    const distance = Math.round(ringStep * node.ring);
    const radius = node.status === "selected" ? 12 : node.status === "excluded" ? 8 : 10;
    return {
      ...node,
      x: Math.round(centerX + Math.cos(angle) * distance),
      y: Math.round(centerY + Math.sin(angle) * distance),
      radius,
      angle,
      distanceFromCenter: distance,
    };
  });
  return { ...model, width, height, centerX, centerY, ringStep, nodes };
}

export function memoryFlowSteps({ activeCase, packet }) {
  const sourceCases = [...new Set((packet.items || []).map((item) => item.record?.source_case).filter(Boolean))];
  const citations = (packet.items || []).map((item) => item.cite_handle).filter(Boolean).join(", ") || "no packet handles";
  const excludedCount = (packet.excluded || []).length;
  return [
    {
      title: "Prior problems teach the graph",
      body: `${sourceCases[0] || "Prior cases"} contributes durable claims, warnings, and source-backed signals.`,
    },
    {
      title: `${activeCase} retrieves scoped memory`,
      body: `The gateway selects ${packet.items?.length || 0} item(s), including ${citations}, and holds back ${excludedCount} item(s).`,
    },
    {
      title: "Doppl combines old memory with new context",
      body: "Packet records are injected as cited slices rather than as hidden mutable state.",
    },
    {
      title: "Candidates cite and earn credit",
      body: "Runtime traces can record citation, influence, and positive/neutral/negative credit outcomes.",
    },
    {
      title: "Collapse can grow the graph",
      body: "Useful cold-agenome findings become future memory only through receipts and gated promotion.",
    },
  ];
}
```

- [ ] **Step 4: Run model tests to verify they pass**

Run:

```bash
cd /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike/prototypes/knowledge-space
/Users/dalton/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test flow-model.test.mjs
```

Expected: PASS with 4 tests.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git -C /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike add prototypes/knowledge-space/flow-model.mjs prototypes/knowledge-space/flow-model.test.mjs
git -C /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike diff --cached | rg -n 'OpenRouter key prefix|OPENROUTER_API_KEY with a value' || true
git -C /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike commit -m "feat: model radial memory flow"
```

Expected: commit succeeds and the secret scan prints no matches.

## Task 2: Wire Memory Flow Mode Into The Hosted Workbench

**Files:**
- Modify: `prototypes/knowledge-space/index.html`
- Modify: `prototypes/knowledge-space/app.js`
- Test: `prototypes/knowledge-space/flow-model.test.mjs`

- [ ] **Step 1: Add the Memory Flow container and button**

In `prototypes/knowledge-space/index.html`, add the button inside `#viewMode` after Graph:

```html
<button type="button" data-mode="memory-flow">Memory Flow</button>
```

Add the container inside `.main-panel` after `#graphView`:

```html
<div id="memoryFlowView" class="memory-flow-view hidden"></div>
```

- [ ] **Step 2: Import helpers and add view state**

At the top of `prototypes/knowledge-space/app.js`, add:

```js
import { buildMemoryFlowModel, layoutRadialNodes, memoryFlowSteps } from "./flow-model.mjs";
```

Add this entry to `labels`:

```js
"memory-flow": {
  eyebrow: "Memory Flow",
  title: "Radial architecture proof",
  note: "Shows how prior case memory is retrieved, injected, cited, credited, and preserved for later Doppl runs.",
},
```

Add to `state`:

```js
flowLayoutMode: "relevance",
```

Add to `els`:

```js
memoryFlowView: document.querySelector("#memoryFlowView"),
```

- [ ] **Step 3: Render the Memory Flow mode**

In `render()`, add:

```js
renderMemoryFlow();
```

In `setMode(mode)`, add:

```js
els.memoryFlowView.classList.toggle("hidden", mode !== "memory-flow");
```

In the case select change handler, add:

```js
renderMemoryFlow();
```

Create this function in `app.js` after `renderCollapse()`:

```js
function renderMemoryFlow() {
  const packet = activePacket();
  const model = buildMemoryFlowModel({
    activeCase: state.activeCase,
    graph: state.graph,
    packet,
    mode: state.flowLayoutMode,
  });
  const width = Math.max(760, els.memoryFlowView.clientWidth - 2 || 900);
  const height = 680;
  const laidOut = layoutRadialNodes(model, { width, height });
  const byId = new Map(laidOut.nodes.map((node) => [node.id, node]));
  const steps = memoryFlowSteps({ activeCase: state.activeCase, packet });

  els.memoryFlowView.innerHTML = `
    <div class="flow-layout">
      <aside class="flow-steps">
        <div class="flow-toggle" role="group" aria-label="Memory flow layout">
          <button type="button" data-flow-mode="relevance" class="${state.flowLayoutMode === "relevance" ? "active" : ""}">Relevance</button>
          <button type="button" data-flow-mode="process" class="${state.flowLayoutMode === "process" ? "active" : ""}">Process</button>
        </div>
        ${steps.map((step, index) => `
          <article class="flow-step">
            <span>${index + 1}</span>
            <h3>${escapeHtml(step.title)}</h3>
            <p>${escapeHtml(step.body)}</p>
          </article>
        `).join("")}
      </aside>
      <div class="flow-graph" aria-label="Radial memory flow graph">
        <svg class="flow-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Radial knowledge graph">
          ${renderFlowRings(laidOut)}
          ${laidOut.edges.map((edge) => renderFlowEdge(edge, byId)).join("")}
          ${laidOut.nodes.map(renderFlowNode).join("")}
        </svg>
      </div>
    </div>
  `;
}
```

- [ ] **Step 4: Add SVG render helpers**

Add these helpers after `renderMemoryFlow()`:

```js
function renderFlowRings(model) {
  const maxRing = Math.max(...model.nodes.map((node) => node.ring), 1);
  return Array.from({ length: maxRing }, (_, index) => {
    const ring = index + 1;
    const radius = Math.round(model.ringStep * ring);
    const label = model.rings[ring] || `ring ${ring}`;
    return `
      <circle class="flow-ring" cx="${model.centerX}" cy="${model.centerY}" r="${radius}"></circle>
      <text class="flow-ring-label" x="${model.centerX + 8}" y="${model.centerY - radius + 16}">${escapeHtml(label)}</text>
    `;
  }).join("");
}

function renderFlowEdge(edge, byId) {
  const source = byId.get(edge.source);
  const target = byId.get(edge.target);
  if (!source || !target) return "";
  return `<line class="flow-edge ${edge.status || ""}" x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" style="stroke-width:${1 + Number(edge.weight || 0) * 3}"></line>`;
}

function renderFlowNode(node) {
  const label = truncate(node.label || node.id, node.ring === 0 ? 26 : 20);
  return `
    <g class="flow-node-group" tabindex="0" role="button" data-flow-id="${escapeAttr(node.id)}">
      <circle class="flow-node ${escapeAttr(node.status || "")} theme-${escapeAttr(node.theme || "general")}" cx="${node.x}" cy="${node.y}" r="${node.radius}"></circle>
      <text class="flow-node-label" x="${node.x + node.radius + 6}" y="${node.y + 4}">${escapeHtml(label)}</text>
    </g>
  `;
}
```

- [ ] **Step 5: Add click handlers**

Add after the existing `els.viewMode` click handler:

```js
els.memoryFlowView.addEventListener("click", (event) => {
  const modeButton = event.target.closest("button[data-flow-mode]");
  if (modeButton) {
    state.flowLayoutMode = modeButton.dataset.flowMode;
    renderMemoryFlow();
    return;
  }
  const group = event.target.closest(".flow-node-group");
  if (group) inspectFlowNode(group.dataset.flowId);
});

els.memoryFlowView.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const group = event.target.closest(".flow-node-group");
  if (group) inspectFlowNode(group.dataset.flowId);
});
```

Add this helper after `inspectNode()`:

```js
function inspectFlowNode(id) {
  if (id.startsWith("record:")) {
    inspectPacketRecord(id.replace(/^record:/, ""));
    return;
  }
  inspectNode(id);
}
```

Update resize handler:

```js
window.addEventListener("resize", () => {
  if (state.graph.nodes.length) {
    renderGraph();
    renderMemoryFlow();
  }
});
```

- [ ] **Step 6: Run focused tests and a local browser smoke check**

Run:

```bash
cd /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike/prototypes/knowledge-space
/Users/dalton/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test flow-model.test.mjs
```

Expected: PASS with 4 tests.

Open locally:

```bash
open /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike/prototypes/knowledge-space/index.html
```

Expected: the page loads, the **Memory Flow** button appears, and `?view=memory-flow` displays narrative steps plus a radial graph.

- [ ] **Step 7: Commit Task 2**

Run:

```bash
git -C /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike add prototypes/knowledge-space/index.html prototypes/knowledge-space/app.js prototypes/knowledge-space/flow-model.mjs prototypes/knowledge-space/flow-model.test.mjs
git -C /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike diff --cached | rg -n 'OpenRouter key prefix|OPENROUTER_API_KEY with a value' || true
git -C /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike commit -m "feat: add memory flow workbench mode"
```

Expected: commit succeeds and the secret scan prints no matches.

## Task 3: Style The Radial Graph For Readability

**Files:**
- Modify: `prototypes/knowledge-space/styles.css`

- [ ] **Step 1: Add Memory Flow layout styles**

Append this CSS before `.hidden`:

```css
.memory-flow-view {
  min-height: 680px;
}

.flow-layout {
  display: grid;
  grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
  gap: 16px;
}

.flow-steps {
  display: grid;
  align-content: start;
  gap: 10px;
}

.flow-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 4px;
}

.flow-toggle button {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  padding: 10px 12px;
  color: var(--ink);
  font-weight: 900;
}

.flow-toggle button.active {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
}

.flow-step {
  border: 1px solid var(--line);
  background: #fbfdff;
  padding: 14px;
}

.flow-step span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-bottom: 10px;
  background: var(--ink);
  color: white;
  font-weight: 900;
}

.flow-step p {
  margin-bottom: 0;
  color: #344054;
  line-height: 1.45;
}

.flow-graph {
  min-height: 680px;
  border: 1px solid var(--line);
  overflow: hidden;
  background:
    radial-gradient(circle at center, rgba(15, 118, 110, 0.06), transparent 42%),
    #fbfdff;
}

.flow-svg {
  height: 680px;
}

.flow-ring {
  fill: none;
  stroke: #d8dee8;
  stroke-width: 1.2;
  stroke-dasharray: 5 5;
}

.flow-ring-label {
  fill: #667085;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.flow-edge {
  stroke: #9aa8bd;
  opacity: 0.42;
}

.flow-edge.selected,
.flow-edge.source {
  stroke: var(--accent);
  opacity: 0.72;
}

.flow-edge.excluded {
  stroke: var(--rose);
  stroke-dasharray: 6 6;
  opacity: 0.68;
}

.flow-node {
  stroke: white;
  stroke-width: 2.5;
  filter: drop-shadow(0 2px 5px rgba(23, 32, 51, 0.22));
}

.flow-node.active {
  fill: var(--ink);
  stroke: var(--rose);
  stroke-width: 5;
}

.flow-node.selected {
  fill: var(--blue);
  stroke: var(--accent);
  stroke-width: 4;
}

.flow-node.source {
  fill: var(--accent);
}

.flow-node.related {
  fill: #64748b;
}

.flow-node.excluded {
  fill: white;
  stroke: var(--rose);
  stroke-width: 4;
}

.flow-node-label {
  fill: #172033;
  font-size: 11px;
  font-weight: 900;
  paint-order: stroke;
  stroke: #fbfdff;
  stroke-width: 4px;
  stroke-linejoin: round;
}
```

- [ ] **Step 2: Add responsive styles**

Inside `@media (max-width: 1120px)`, add:

```css
.flow-layout {
  grid-template-columns: 1fr;
}
```

Inside `@media (max-width: 640px)`, add:

```css
.flow-graph,
.flow-svg {
  min-height: 560px;
  height: 560px;
}
```

- [ ] **Step 3: Run visual smoke check**

Run:

```bash
open /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike/prototypes/knowledge-space/index.html?case=fsd-ownership-unwind\\&view=memory-flow
```

Expected:
- narrative rail does not overlap graph;
- center node is visible;
- selected packet records are near the center;
- excluded nodes appear farther out with dashed red edges;
- mobile-width browser still shows one-column flow without overlap.

- [ ] **Step 4: Commit Task 3**

Run:

```bash
git -C /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike add prototypes/knowledge-space/styles.css
git -C /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike diff --cached | rg -n 'OpenRouter key prefix|OPENROUTER_API_KEY with a value' || true
git -C /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike commit -m "style: make memory flow graph readable"
```

Expected: commit succeeds and the secret scan prints no matches.

## Task 4: Documentation, Task List, And Verification

**Files:**
- Modify: `prototypes/knowledge-space/README.md`
- Modify: `spikes/knowledge-space/tasks.md`

- [ ] **Step 1: Update prototype README permalink docs**

Add this example under `## Permalinks` in `prototypes/knowledge-space/README.md`:

```markdown
`?case=fsd-ownership-unwind&view=memory-flow`
```

- [ ] **Step 2: Update knowledge-space tasks**

In `spikes/knowledge-space/tasks.md`, under `Phase 1 Walking Notes`, add:

```markdown
- [x] Add hosted Memory Flow mode with radial relevance layout proving
      cross-problem knowledge reuse.
```

Under `Phase 5 Walking Notes`, add:

```markdown
- [x] Surface influence/credit architecture in the hosted Memory Flow view when
      exported runtime events are available.
```

- [ ] **Step 3: Run full verification**

Run:

```bash
cd /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike/prototypes/knowledge-space
/Users/dalton/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test flow-model.test.mjs
```

Expected: PASS.

Run:

```bash
cd /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike/kernel-rebuild
/Users/dalton/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --experimental-strip-types --test src/*.test.ts tools/*.test.ts
/Users/dalton/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm typecheck
/Users/dalton/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm proof
```

Expected: kernel tests, typecheck, and proof render pass.

Run:

```bash
cd /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike/spikes/knowledge-space
python3 -m unittest test_knowledge_space.py
```

Expected: all Python tests pass.

- [ ] **Step 4: Commit Task 4**

Run:

```bash
git -C /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike add prototypes/knowledge-space/README.md spikes/knowledge-space/tasks.md
git -C /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike diff --cached | rg -n 'OpenRouter key prefix|OPENROUTER_API_KEY with a value' || true
git -C /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike commit -m "docs: document memory flow workbench"
```

Expected: commit succeeds and the secret scan prints no matches.

- [ ] **Step 5: Push all commits**

Run:

```bash
git -C /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike push
git -C /Users/dalton/Desktop/GauntletAI/capstone/mh-doppl-spike status --short
```

Expected: push succeeds and `status --short` prints nothing.

## Self-Review Notes

- Spec coverage: the plan covers the fifth mode, radial relevance layout, process toggle, narrative rail, SVG graph, static data compatibility, inspector reuse, URL state, tests, docs, and task list updates.
- Scope control: live Neo4j embedding, force-directed physics, model-generated clustering, editing, and promotion workflows remain out of scope.
- Type consistency: view mode uses the URL value `memory-flow`; the helper mode uses `relevance` or `process`; record IDs are normalized with `record:` and case IDs with `case:`.
