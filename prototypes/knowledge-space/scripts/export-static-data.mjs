#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const sourceOut = path.join(root, "spikes/knowledge-space/out");
const targetData = path.resolve(here, "../data");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(sourceOut, file), "utf8"));
}

function readSnapshotJsonl(file) {
  const rows = fs
    .readFileSync(path.join(sourceOut, file), "utf8")
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  return {
    nodes: rows.filter((row) => row.row_type === "snapshot_node").map((row) => row.node),
    edges: rows.filter((row) => row.row_type === "snapshot_edge").map((row) => row.edge),
  };
}

function writeJson(file, data) {
  fs.mkdirSync(targetData, { recursive: true });
  fs.writeFileSync(path.join(targetData, file), `${JSON.stringify(data, null, 2)}\n`);
}

const graph = readSnapshotJsonl("graph_snapshot.jsonl");
const packet = readJson("knowledge_packet.json");
const packetsByCase = readJson("knowledge_packets_by_case.json");
const packetEvent = readJson("knowledge_packet_event.json");
const collapsePacket = readJson("collapse_packet.json");
const researchReport = readJson("research_report.json");
const records = graph.nodes.filter((node) => node.type === "KnowledgeRecord");
const cases = graph.nodes.filter((node) => node.type === "Case");
const receipts = graph.nodes.filter((node) => node.type === "RunEventReceipt");
const embeddings = graph.nodes.filter((node) => node.type === "Embedding");
const embeddedRecordIds = new Set(embeddings.map((node) => node.sourceRecordId));

writeJson("graph.json", graph);
writeJson("knowledge_packet.json", packet);
writeJson("knowledge_packets_by_case.json", packetsByCase);
writeJson("knowledge_packet_event.json", packetEvent);
writeJson("collapse_packet.json", collapsePacket);
writeJson("research_report.json", researchReport);
writeJson("summary.json", {
  generatedFrom: "spikes/knowledge-space/out",
  url: "https://doppl-life.github.io/mh-doppl-spike/prototypes/knowledge-space/",
  counts: {
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    records: records.length,
    embeddings: embeddings.length,
    embeddingCoverage: records.length ? Math.round((embeddedRecordIds.size / records.length) * 100) : 0,
    cases: cases.length,
    receipts: receipts.length,
    packetItems: packet.items.length,
    casePackets: Object.keys(packetsByCase).length,
    collapsedItems: collapsePacket.items.length,
  },
  kinds: [...new Set(records.map((record) => record.kind))].sort(),
  embeddingModels: [...new Set(embeddings.map((node) => `${node.modelId}:${node.dimension}`))].sort(),
  cases: cases.map((item) => item.label).sort(),
});

console.log(`Exported knowledge-space static data to ${path.relative(root, targetData)}`);
