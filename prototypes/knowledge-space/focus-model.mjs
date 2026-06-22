export function recordNodeId(recordId) {
  return String(recordId || "").startsWith("record:") ? String(recordId) : `record:${recordId}`;
}

export function caseNodeId(caseId) {
  return String(caseId || "").startsWith("case:") ? String(caseId) : `case:${caseId}`;
}

export function buildUsedFocusScope({ graph, packet, activeCase }) {
  const activeCaseId = caseNodeId(activeCase);
  const packetRecordIds = new Set((packet.items || []).map((item) => recordNodeId(item.record?.id)));
  const sourceCaseIds = new Set((packet.items || []).map((item) => caseNodeId(item.record?.source_case)));
  const seedIds = new Set([activeCaseId, ...packetRecordIds, ...sourceCaseIds]);
  const visibleNodeIds = new Set(seedIds);
  const visibleEdgeIds = new Set();

  for (const edge of graph.edges || []) {
    const touchesPacketRecord = packetRecordIds.has(edge.source) || packetRecordIds.has(edge.target);
    if (!touchesPacketRecord) continue;
    visibleNodeIds.add(edge.source);
    visibleNodeIds.add(edge.target);
    visibleEdgeIds.add(edgeKey(edge));
  }

  return {
    activeCaseId,
    packetRecordIds,
    sourceCaseIds,
    seedIds,
    visibleNodeIds,
    visibleEdgeIds,
  };
}

export function filterGraphToFocusScope(graph, scope) {
  const visibleNodeIds = scope?.visibleNodeIds || new Set();
  const visibleEdgeIds = scope?.visibleEdgeIds || new Set();
  return {
    nodes: (graph.nodes || []).filter((node) => visibleNodeIds.has(node.id)),
    edges: (graph.edges || []).filter((edge) => visibleEdgeIds.has(edgeKey(edge))),
  };
}

export function edgeKey(edge) {
  return `${edge.source}->${edge.target}:${edge.type}`;
}
