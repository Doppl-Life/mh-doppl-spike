const colors = {
  Case: "#0f766e",
  KnowledgeRecord: "#2563eb",
  RunEventReceipt: "#475467",
  Candidate: "#be123c",
  CriticReview: "#b45309",
  Run: "#172033",
  Embedding: "#7c3aed",
  default: "#64748b",
};

const labels = {
  graph: {
    eyebrow: "Graph",
    title: "Operational memory map",
    note: "Graph-filtered knowledge records, cases, receipts, and run provenance. Click any visible node to inspect it.",
  },
  packet: {
    eyebrow: "Packet",
    title: "Selected runtime packet",
    note: "The memory slice that would be injected into a Doppl run, with citation handles and exclusion audit.",
  },
  exclusions: {
    eyebrow: "Exclusions",
    title: "Memory held back",
    note: "Records the gateway refused to inject, grouped by target-case, visibility, trust, budget, or graph-filter reason.",
  },
  collapse: {
    eyebrow: "Collapse",
    title: "Preserved cold-agenome intelligence",
    note: "Useful findings distilled from a culled candidate and retained for later runs.",
  },
};

const state = {
  graph: { nodes: [], edges: [] },
  packet: null,
  packetsByCase: {},
  collapse: null,
  summary: null,
  activeCase: "",
  selectedRecordId: "",
  search: "",
  activeTypes: new Set(["Case", "KnowledgeRecord", "Embedding", "RunEventReceipt", "Candidate", "CriticReview", "Run"]),
  mode: "graph",
};

const els = {
  statusStrip: document.querySelector("#statusStrip"),
  caseSelect: document.querySelector("#caseSelect"),
  searchInput: document.querySelector("#searchInput"),
  typeFilters: document.querySelector("#typeFilters"),
  viewMode: document.querySelector("#viewMode"),
  modeEyebrow: document.querySelector("#modeEyebrow"),
  modeTitle: document.querySelector("#modeTitle"),
  modeNote: document.querySelector("#modeNote"),
  graphView: document.querySelector("#graphView"),
  explanationView: document.querySelector("#explanationView"),
  packetView: document.querySelector("#packetView"),
  exclusionsView: document.querySelector("#exclusionsView"),
  collapseView: document.querySelector("#collapseView"),
  graphSvg: document.querySelector("#graphSvg"),
  inspectorTitle: document.querySelector("#inspectorTitle"),
  inspectorMeta: document.querySelector("#inspectorMeta"),
  inspectorBody: document.querySelector("#inspectorBody"),
};

async function loadData() {
  const [graph, packet, packetsByCase, collapse, summary] = await Promise.all([
    fetchJson("./data/graph.json"),
    fetchJson("./data/knowledge_packet.json"),
    fetchJson("./data/knowledge_packets_by_case.json"),
    fetchJson("./data/collapse_packet.json"),
    fetchJson("./data/summary.json"),
  ]);
  state.graph = graph;
  state.packet = packet;
  state.packetsByCase = packetsByCase;
  state.collapse = collapse;
  state.summary = summary;
  const params = new URLSearchParams(window.location.search);
  const caseParam = params.get("case");
  state.activeCase = packetsByCase[caseParam] ? caseParam : Object.keys(packetsByCase).sort()[0];
  const viewParam = params.get("view");
  if (labels[viewParam]) state.mode = viewParam;
  state.selectedRecordId = params.get("record") || "";
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url}`);
  return response.json();
}

function render() {
  renderStatus();
  renderCaseSelect();
  renderTypeFilters();
  setMode(state.mode);
  renderGraph();
  renderPacket();
  renderExclusions();
  renderCollapse();
}

function renderStatus() {
  const counts = state.summary.counts;
  els.statusStrip.innerHTML = [
    ["Nodes", counts.nodes],
    ["Edges", counts.edges],
    ["Records", counts.records],
    ["Embedded", `${counts.embeddingCoverage || 0}%`],
    ["Cases", counts.casePackets || state.summary.cases.length],
    ["Packet", activePacket().items.length],
  ]
    .map(([label, value]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");
}

function renderCaseSelect() {
  const cases = Object.keys(state.packetsByCase).sort();
  els.caseSelect.innerHTML = cases
    .map((caseName) => `<option value="${escapeAttr(caseName)}">${escapeHtml(caseName)}</option>`)
    .join("");
  els.caseSelect.value = state.activeCase;
}

function renderTypeFilters() {
  const types = ["Case", "KnowledgeRecord", "Embedding", "RunEventReceipt", "Candidate", "CriticReview", "Run"];
  els.typeFilters.innerHTML = types
    .map(
      (type) =>
        `<button type="button" class="${state.activeTypes.has(type) ? "active" : ""}" data-type="${type}">${typeLabel(type)}</button>`
    )
    .join("");
}

function setMode(mode) {
  state.mode = mode;
  const copy = labels[mode];
  els.modeEyebrow.textContent = copy.eyebrow;
  els.modeTitle.textContent = copy.title;
  els.modeNote.textContent = copy.note;
  els.graphView.classList.toggle("hidden", mode !== "graph");
  els.explanationView.classList.toggle("hidden", mode !== "packet" && mode !== "exclusions");
  els.packetView.classList.toggle("hidden", mode !== "packet");
  els.exclusionsView.classList.toggle("hidden", mode !== "exclusions");
  els.collapseView.classList.toggle("hidden", mode !== "collapse");
  els.viewMode.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  updatePermalink();
}

function renderGraph() {
  const visibleNodes = filteredNodes();
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = state.graph.edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
  const focus = focusIds();
  const width = Math.max(760, els.graphView.clientWidth - 2);
  const height = Number.parseInt(getComputedStyle(els.graphSvg).height, 10) || 650;
  const positioned = layoutNodes(visibleNodes, width, height);
  const byId = new Map(positioned.map((node) => [node.id, node]));

  els.graphSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  els.graphSvg.innerHTML = [
    ...visibleEdges.map((edge) => {
      const source = byId.get(edge.source);
      const target = byId.get(edge.target);
      if (!source || !target) return "";
      const focused = focus.edgeIds.has(edgeKey(edge));
      return `<line class="edge ${focused ? "focused" : ""}" x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}"></line>`;
    }),
    ...positioned.map((node) => renderNode(node, focus)),
  ].join("");
}

function layoutNodes(nodes, width, height) {
  const lanes = ["Case", "KnowledgeRecord", "Embedding", "RunEventReceipt", "Run", "Candidate", "CriticReview", "Agenome", "Generation"];
  const grouped = new Map(lanes.map((lane) => [lane, []]));
  nodes.forEach((node) => {
    const lane = grouped.has(node.type) ? node.type : "KnowledgeRecord";
    grouped.get(lane).push(node);
  });
  const activeLanes = [...grouped.entries()].filter(([, laneNodes]) => laneNodes.length);
  const laneGap = width / Math.max(1, activeLanes.length + 1);
  return activeLanes.flatMap(([lane, laneNodes], laneIndex) => {
    const sorted = [...laneNodes].sort((a, b) => String(a.label || a.id).localeCompare(String(b.label || b.id)));
    return sorted.map((node, index) => {
      const yGap = height / Math.max(2, sorted.length + 1);
      return {
        ...node,
        x: Math.round(laneGap * (laneIndex + 1)),
        y: Math.round(yGap * (index + 1)),
        radius: node.type === "KnowledgeRecord" || node.type === "Embedding" ? 8 : 10,
        lane,
      };
    });
  });
}

function renderNode(node, focus) {
  const label = truncate(node.label || node.id, node.type === "KnowledgeRecord" ? 18 : 22);
  const classes = [
    "node",
    focus.activeCaseId === node.id ? "active-case" : "",
    focus.sourceCaseIds.has(node.id) ? "source-case" : "",
    focus.packetRecordIds.has(node.id) ? "packet-record" : "",
    focus.selectedRecordNodeId === node.id ? "selected" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `
    <g class="node-group" tabindex="0" role="button" data-id="${escapeAttr(node.id)}">
      <circle class="${classes}" cx="${node.x}" cy="${node.y}" r="${node.radius}" fill="${colors[node.type] || colors.default}"></circle>
      <text class="node-label" x="${node.x + 13}" y="${node.y + 4}">${escapeHtml(label)}</text>
    </g>
  `;
}

function renderPacket() {
  const packet = activePacket();
  renderPacketExplanation(packet);
  els.packetView.innerHTML = packet.items
    .map((item, index) => {
      const record = item.record;
      return `
        <button type="button" class="row ${state.selectedRecordId === record.id ? "selected" : ""}" data-record-id="${escapeAttr(record.id)}">
          <small>${index + 1}. ${escapeHtml(item.cite_handle)} / ${escapeHtml(record.kind)} / ${escapeHtml(record.source_case)}</small>
          <h3>${escapeHtml(record.heading || record.citation)}</h3>
          <p>${escapeHtml(item.reason)}</p>
          <div class="tagline">${record.tags.slice(0, 8).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
        </button>
      `;
    })
    .join("");
}

function renderPacketExplanation(packet) {
  const request = packet.request || {};
  const excludedRecords = packet.excluded.filter((item) => item.record_id).length;
  const warningCount = packet.items.filter((item) => item.record.kind === "warning").length;
  const sourceCases = new Set(packet.items.map((item) => item.record.source_case)).size;
  const selected = selectedPacketItem();
  els.explanationView.innerHTML = [
    ["Target", request.target_case || state.activeCase],
    ["Items", `${packet.items.length}/${request.max_items || packet.items.length}`],
    ["Sources", sourceCases],
    ["Warnings", warningCount],
    ["Excluded", excludedRecords],
    ["Budget", request.max_tokens || "n/a"],
    ["Trust", request.min_trust_tier || "draft"],
    ["Role", request.role || "candidate"],
    ["Selected", selected ? selected.cite_handle : "none"],
  ]
    .map(([label, value]) => `<div class="explain-tile"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`)
    .join("");
}

function renderExclusions() {
  const packet = activePacket();
  const grouped = groupBy(packet.excluded, (item) => item.reason || "excluded");
  const rows = Object.entries(grouped).flatMap(([reason, items]) => [
    `<div class="reason-header"><strong>${escapeHtml(reason)}</strong><span>${items.length}</span></div>`,
    ...items.map((item, index) => {
      const recordNode = item.record_id ? findGraphRecord(item.record_id) : null;
      return `
        <button type="button" class="row excluded ${state.selectedRecordId === item.record_id ? "selected" : ""}" data-excluded-index="${index}" data-excluded-reason="${escapeAttr(reason)}">
          <small>${escapeHtml(item.case)}${item.kind ? ` / ${escapeHtml(item.kind)}` : ""}${item.visibility ? ` / ${escapeHtml(item.visibility)}` : ""}</small>
          <h3>${escapeHtml(item.record_id || "case-level exclusion")}</h3>
          <p>${escapeHtml(recordNode?.text || item.reason)}</p>
        </button>
      `;
    }),
  ]);
  els.exclusionsView.innerHTML = rows.join("");
}

function renderCollapse() {
  els.collapseView.innerHTML = state.collapse.items
    .map(
      (item, index) => `
        <button type="button" class="row" data-collapse-index="${index}">
          <small>${index + 1}. ${escapeHtml(item.kind)} / ${escapeHtml(item.trust_tier)} / ${escapeHtml(item.run_id)}</small>
          <h3>${escapeHtml(item.target_case)}</h3>
          <p>${escapeHtml(item.text)}</p>
          <div class="tagline">${item.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
        </button>
      `
    )
    .join("");
}

function filteredNodes() {
  const query = state.search.trim().toLowerCase();
  return state.graph.nodes
    .filter((node) => state.activeTypes.has(node.type) || node.type === "Agenome" || node.type === "Generation")
    .filter((node) => {
      if (!query) return true;
      return [node.id, node.label, node.type, node.text, node.citation, node.sourcePath, node.kind, node.eventType]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
}

function inspectNode(id) {
  const node = state.graph.nodes.find((item) => item.id === id);
  if (!node) return;
  if (node.id.startsWith("record:")) {
    state.selectedRecordId = node.id.replace(/^record:/, "");
    renderPacket();
    renderExclusions();
    renderGraph();
    updatePermalink();
  }
  els.inspectorTitle.textContent = node.label || node.id;
  els.inspectorMeta.textContent = `${typeLabel(node.type)}${node.kind ? ` / ${node.kind}` : ""}`;
  els.inspectorBody.innerHTML = [
    kv("ID", node.id),
    node.citation ? kv("Citation", node.citation) : "",
    node.sourceChunkId ? kv("Chunk", node.sourceChunkId) : "",
    node.trustTier ? kv("Trust", node.trustTier) : "",
    node.visibility ? kv("Visibility", node.visibility) : "",
    node.modelId ? kv("Embedding model", node.modelId) : "",
    node.dimension ? kv("Dimension", node.dimension) : "",
    node.sourceRecordId ? kv("Source record", node.sourceRecordId) : "",
    node.runId ? kv("Run", node.runId) : "",
    node.text ? `<p class="body-text">${escapeHtml(node.text)}</p>` : "",
  ].join("");
}

function inspectExclusion(reason, index) {
  const grouped = groupBy(activePacket().excluded, (item) => item.reason || "excluded");
  const item = grouped[reason]?.[index];
  if (!item) return;
  const recordNode = item.record_id ? findGraphRecord(item.record_id) : null;
  if (item.record_id) state.selectedRecordId = item.record_id;
  els.inspectorTitle.textContent = item.record_id || item.case;
  els.inspectorMeta.textContent = `${item.case} / ${item.reason}`;
  els.inspectorBody.innerHTML = [
    item.kind ? kv("Kind", item.kind) : "",
    item.visibility ? kv("Visibility", item.visibility) : "",
    recordNode?.citation ? kv("Citation", recordNode.citation) : "",
    recordNode?.sourceChunkId ? kv("Chunk", recordNode.sourceChunkId) : "",
    `<p class="body-text">${escapeHtml(recordNode?.text || item.reason)}</p>`,
  ].join("");
  renderExclusions();
  renderGraph();
  updatePermalink();
}

function inspectPacketRecord(recordId) {
  const item = activePacket().items.find((packetItem) => packetItem.record.id === recordId);
  if (!item) return;
  state.selectedRecordId = recordId;
  const record = item.record;
  els.inspectorTitle.textContent = `${item.cite_handle} ${record.kind}`;
  els.inspectorMeta.textContent = `${record.source_case} / score ${item.score}`;
  els.inspectorBody.innerHTML = [
    kv("Reason", item.reason),
    kv("Citation", item.citation),
    kv("Chunk", item.source_chunk_id),
    kv("Trust", record.trust_tier),
    kv("Visibility", record.visibility),
    `<p class="body-text">${escapeHtml(record.text)}</p>`,
  ].join("");
  renderPacket();
  renderExclusions();
  renderGraph();
  updatePermalink();
}

function inspectCollapse(index) {
  const item = state.collapse.items[index];
  if (!item) return;
  els.inspectorTitle.textContent = item.kind;
  els.inspectorMeta.textContent = `${item.run_id} / ${item.candidate_id}`;
  els.inspectorBody.innerHTML = [
    kv("Citation", item.citation),
    kv("Critic", item.critic_id),
    kv("Agenome", item.agenome_id),
    kv("Trust", item.trust_tier),
    `<p class="body-text">${escapeHtml(item.text)}</p>`,
  ].join("");
}

function kv(label, value) {
  return `<div class="kv"><span>${escapeHtml(label)}</span><code>${escapeHtml(String(value))}</code></div>`;
}

function groupBy(items, keyFn) {
  return items.reduce((groups, item) => {
    const key = keyFn(item);
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {});
}

function findGraphRecord(recordId) {
  return state.graph.nodes.find((node) => node.id === `record:${recordId}`);
}

function activePacket() {
  return state.packetsByCase[state.activeCase] || state.packet;
}

function selectedPacketItem() {
  return activePacket().items.find((item) => item.record.id === state.selectedRecordId) || null;
}

function focusIds() {
  const packet = activePacket();
  const activeCaseId = `case:${state.activeCase}`;
  const packetRecordIds = new Set(packet.items.map((item) => `record:${item.record.id}`));
  const sourceCaseIds = new Set(packet.items.map((item) => `case:${item.record.source_case}`));
  const edgeIds = new Set();
  state.graph.edges.forEach((edge) => {
    if (
      (packetRecordIds.has(edge.source) && (sourceCaseIds.has(edge.target) || edge.target === activeCaseId)) ||
      (packetRecordIds.has(edge.target) && (sourceCaseIds.has(edge.source) || edge.source === activeCaseId))
    ) {
      edgeIds.add(edgeKey(edge));
    }
  });
  return {
    activeCaseId,
    sourceCaseIds,
    packetRecordIds,
    selectedRecordNodeId: state.selectedRecordId ? `record:${state.selectedRecordId}` : "",
    edgeIds,
  };
}

function edgeKey(edge) {
  return `${edge.source}->${edge.target}:${edge.type}`;
}

function updatePermalink() {
  if (!state.activeCase) return;
  const params = new URLSearchParams();
  params.set("case", state.activeCase);
  params.set("view", state.mode);
  if (state.selectedRecordId) params.set("record", state.selectedRecordId);
  window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
}

function typeLabel(type) {
  return type.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function truncate(value, length) {
  const text = String(value || "");
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

els.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderGraph();
});

els.caseSelect.addEventListener("change", (event) => {
  state.activeCase = event.target.value;
  state.selectedRecordId = "";
  renderStatus();
  renderGraph();
  renderPacket();
  renderExclusions();
  updatePermalink();
  const firstPacket = activePacket().items[0];
  if (firstPacket) inspectPacketRecord(firstPacket.record.id);
});

els.typeFilters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-type]");
  if (!button) return;
  const type = button.dataset.type;
  if (state.activeTypes.has(type)) state.activeTypes.delete(type);
  else state.activeTypes.add(type);
  renderTypeFilters();
  renderGraph();
});

els.viewMode.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-mode]");
  if (!button) return;
  setMode(button.dataset.mode);
});

els.graphSvg.addEventListener("click", (event) => {
  const group = event.target.closest(".node-group");
  if (group) inspectNode(group.dataset.id);
});

els.graphSvg.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const group = event.target.closest(".node-group");
  if (group) inspectNode(group.dataset.id);
});

els.packetView.addEventListener("click", (event) => {
  const row = event.target.closest("[data-record-id]");
  if (row) inspectPacketRecord(row.dataset.recordId);
});

els.exclusionsView.addEventListener("click", (event) => {
  const row = event.target.closest("[data-excluded-index]");
  if (row) inspectExclusion(row.dataset.excludedReason, Number(row.dataset.excludedIndex));
});

els.collapseView.addEventListener("click", (event) => {
  const row = event.target.closest("[data-collapse-index]");
  if (row) inspectCollapse(Number(row.dataset.collapseIndex));
});

window.addEventListener("resize", () => {
  if (state.graph.nodes.length) renderGraph();
});

loadData()
  .then(() => {
    render();
    const linkedPacketItem = selectedPacketItem();
    const firstPacket = activePacket().items[0];
    if (linkedPacketItem) inspectPacketRecord(linkedPacketItem.record.id);
    else if (firstPacket) inspectPacketRecord(firstPacket.record.id);
  })
  .catch((error) => {
    els.modeTitle.textContent = "Problem loading knowledge data";
    els.modeNote.textContent = error.message;
  });
