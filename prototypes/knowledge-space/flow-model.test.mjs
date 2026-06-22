import test from "node:test";
import assert from "node:assert/strict";
import { buildMemoryFlowModel, layoutRadialNodes, memoryFlowLegend, memoryFlowSteps } from "./flow-model.mjs";

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

test("memory flow legend explains radial distance and excluded memory", () => {
  const legend = memoryFlowLegend("relevance");

  assert.equal(legend.length, 4);
  assert.equal(legend[0].label, "Center");
  assert.match(legend[1].detail, /selected packet/i);
  assert.match(legend[3].detail, /excluded/i);
});

test("focus-only memory flow hides excluded and distant related nodes", () => {
  const model = buildMemoryFlowModel({
    activeCase: "fsd-ownership-unwind",
    graph: {
      nodes: [
        ...graph.nodes,
        { id: "candidate:distant", type: "Candidate", label: "Distant candidate" },
      ],
      edges: graph.edges,
    },
    packet,
    mode: "relevance",
    focusUsedOnly: true,
  });
  const nodeIds = model.nodes.map((node) => node.id).sort();

  assert.deepEqual(nodeIds, [
    "case:fsd-accident-economy",
    "case:fsd-ownership-unwind",
    "record:ks_accident_warning",
  ]);
});
