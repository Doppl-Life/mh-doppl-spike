import test from "node:test";
import assert from "node:assert/strict";
import { buildUsedFocusScope, filterGraphToFocusScope } from "./focus-model.mjs";

const graph = {
  nodes: [
    { id: "case:target", type: "Case", label: "target" },
    { id: "case:source", type: "Case", label: "source" },
    { id: "record:used", type: "KnowledgeRecord", label: "used memory" },
    { id: "record:unused", type: "KnowledgeRecord", label: "unused memory" },
    { id: "record:excluded", type: "KnowledgeRecord", label: "excluded memory" },
    { id: "embedding:used", type: "Embedding", label: "embedding" },
    { id: "tag:signal", type: "Tag", label: "signal" },
  ],
  edges: [
    { source: "record:used", target: "case:source", type: "FROM_CASE" },
    { source: "embedding:used", target: "record:used", type: "EMBEDS_RECORD" },
    { source: "record:used", target: "tag:signal", type: "HAS_TAG" },
    { source: "record:unused", target: "case:source", type: "FROM_CASE" },
    { source: "record:excluded", target: "case:target", type: "FROM_CASE" },
  ],
};

const packet = {
  items: [
    {
      record: {
        id: "used",
        source_case: "source",
      },
    },
  ],
  excluded: [
    {
      record_id: "excluded",
      case: "target",
      reason: "withheld from candidate-producing role",
    },
  ],
};

test("used focus scope keeps packet records and direct provenance but excludes unused and held-back records", () => {
  const scope = buildUsedFocusScope({ graph, packet, activeCase: "target" });
  const focused = filterGraphToFocusScope(graph, scope);
  const nodeIds = focused.nodes.map((node) => node.id).sort();
  const edgeTypes = focused.edges.map((edge) => edge.type).sort();

  assert.deepEqual(nodeIds, [
    "case:source",
    "case:target",
    "embedding:used",
    "record:used",
    "tag:signal",
  ]);
  assert.deepEqual(edgeTypes, ["EMBEDS_RECORD", "FROM_CASE", "HAS_TAG"]);
  assert.equal(scope.packetRecordIds.has("record:used"), true);
  assert.equal(scope.visibleNodeIds.has("record:excluded"), false);
  assert.equal(scope.visibleNodeIds.has("record:unused"), false);
});
