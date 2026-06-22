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
  return (packet.items || []).map((item) => ({
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
      title: "A prior problem learns into the graph",
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
      body: "Runtime traces record when candidates cite memory, show influence, and earn positive/neutral/negative credit outcomes.",
    },
    {
      title: "Collapse can grow the graph",
      body: "Useful cold-agenome findings become future memory only through receipts and gated promotion.",
    },
  ];
}
