import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import data from './skillLineageData.generated.json';

const C = {
  bg: '#0a0f1c',
  panel: '#0e1626',
  space: '#1c2a3a',
  spaceLine: '#2f4a63',
  contract: '#10212b',
  contractLine: '#1f8a8a',
  module: '#1a1330',
  moduleLine: '#7c5cff',
  cyan: '#39d0d8',
  text: '#dce6f2',
  dim: '#7e8ca3',
  ok: '#39d98a',
  warn: '#f5b14c',
};

const STATUS_COLOR = {
  stable: '#39d98a',
  working: '#39d0d8',
  coined: '#f5b14c',
  deprecated: '#8a7a7a',
};

function shell(line) {
  return {
    background: C.panel,
    border: `1px solid ${line}`,
    borderRadius: 10,
    padding: '10px 14px',
    minWidth: 180,
    color: C.text,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    boxShadow: `0 0 0 1px rgba(0,0,0,0.3), 0 8px 24px -12px ${line}`,
  };
}

function kicker(text, color) {
  return (
    <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color }}>
      {text}
    </div>
  );
}

const sideHandles = (
  <>
    <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
    <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
  </>
);

function SpaceNode({ data: d }) {
  return (
    <div style={{ ...shell(C.spaceLine), background: C.space }}>
      {sideHandles}
      {kicker(d.direction === 'in' ? 'enters from · space' : 'exits to · space', C.dim)}
      <div style={{ fontWeight: 600, marginTop: 4, fontSize: 13 }}>{d.label}</div>
      <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>kind: {d.kind}</div>
    </div>
  );
}

function ContractNode({ data: d }) {
  return (
    <div style={{ ...shell(C.contractLine), background: C.contract }}>
      {sideHandles}
      {kicker(`boundary contract · ${d.direction}`, C.cyan)}
      <div style={{ fontWeight: 700, marginTop: 4, fontSize: 13, color: C.cyan }}>⟦ {d.name} ⟧</div>
      <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{d.schemaId}</div>
    </div>
  );
}

function ModuleNode({ data: d }) {
  return (
    <div style={{ ...shell(C.moduleLine), background: C.module, minWidth: 150 }}>
      {sideHandles}
      {kicker('the module', '#a78bfa')}
      <div style={{ fontWeight: 700, marginTop: 4, fontSize: 15 }}>{d.label}</div>
      <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>parse → graph → diff</div>
    </div>
  );
}

function SkillNode({ data: d }) {
  const sc = STATUS_COLOR[d.status] ?? C.dim;
  return (
    <div style={{ ...shell(sc), minWidth: 170 }}>
      {sideHandles}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{d.label}</span>
        <span style={{ fontSize: 9, color: sc, border: `1px solid ${sc}`, borderRadius: 999, padding: '1px 7px' }}>
          {d.status}
        </span>
      </div>
      <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>gen {d.generation}</div>
      {d.mutagenClass && (
        <div style={{ fontSize: 10, color: C.cyan, marginTop: 2 }}>{d.mutagenClass}</div>
      )}
    </div>
  );
}

const nodeTypes = { space: SpaceNode, contract: ContractNode, module: ModuleNode, skill: SkillNode };

const LANE_Y = 80;
const boundaryNodes = [
  { id: 'enters', type: 'space', position: { x: 0, y: LANE_Y }, data: { ...data.boundary.entersFrom, direction: 'in' } },
  { id: 'input', type: 'contract', position: { x: 280, y: LANE_Y }, data: data.boundary.input },
  { id: 'module', type: 'module', position: { x: 560, y: LANE_Y }, data: { label: data.boundary.module } },
  { id: 'output', type: 'contract', position: { x: 800, y: LANE_Y }, data: data.boundary.output },
  { id: 'exits', type: 'space', position: { x: 1080, y: LANE_Y }, data: { ...data.boundary.exitsTo, direction: 'out' } },
];

const arrow = { markerEnd: { type: MarkerType.ArrowClosed, color: C.contractLine }, style: { stroke: C.contractLine, strokeWidth: 1.5 } };
const boundaryEdges = [
  { id: 'e1', source: 'enters', target: 'input', animated: true, ...arrow },
  { id: 'e2', source: 'input', target: 'module', ...arrow },
  { id: 'e3', source: 'module', target: 'output', ...arrow },
  { id: 'e4', source: 'output', target: 'exits', animated: true, ...arrow },
];

const studbookEdges = data.studbook.edges.map((e) => ({
  ...e,
  markerEnd: { type: MarkerType.ArrowClosed, color: C.moduleLine },
  style: { stroke: C.moduleLine, strokeWidth: 1.5 },
  labelStyle: { fill: C.dim, fontSize: 10 },
}));

function Panel({ title, sub, height, children }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h2 style={{ color: C.text, fontSize: 15, margin: '0 0 2px', fontFamily: 'ui-sans-serif, system-ui' }}>{title}</h2>
      <p style={{ color: C.dim, fontSize: 12, margin: '0 0 10px' }}>{sub}</p>
      <div style={{ height, border: `1px solid #1b2740`, borderRadius: 12, overflow: 'hidden', background: C.bg }}>
        <ReactFlowProvider>{children}</ReactFlowProvider>
      </div>
    </section>
  );
}

function DriftBanner() {
  const { drift, unlineaged } = data;
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
      <span style={{ color: drift.ok ? C.ok : C.warn, border: `1px solid ${drift.ok ? C.ok : C.warn}`, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontFamily: 'ui-monospace, monospace' }}>
        {drift.ok ? '✓ frontmatter ⇆ LINEAGE.md: in sync' : `⚠ drift: ${drift.missingFromTable.length + drift.missingFromGraph.length + drift.mismatches.length} issue(s)`}
      </span>
      {unlineaged.map((u) => (
        <span key={u.name} style={{ color: C.warn, border: `1px solid ${C.warn}`, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontFamily: 'ui-monospace, monospace' }}>
          ⚠ unlineaged: {u.name}
        </span>
      ))}
    </div>
  );
}

function App() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '28px 32px', boxSizing: 'border-box' }}>
      <h1 style={{ color: C.text, fontSize: 26, margin: '0 0 4px', fontFamily: 'ui-sans-serif, system-ui' }}>
        skill-lineage — module boundary
      </h1>
      <p style={{ color: C.dim, fontSize: 13, margin: '0 0 18px', maxWidth: 720 }}>
        The 5-node boundary contract (space → contract → module → contract → space), and the studbook
        it derives from the real <code style={{ color: C.cyan }}>.cursor/skills/*</code> frontmatter.
        Generated {new Date(data.generatedAt).toLocaleString()}.
      </p>
      <DriftBanner />
      <Panel title="Boundary contract" sub="What enters, the typed seam, what exits — one Doppl-Prime DAG edge." height={260}>
        <ReactFlow nodes={boundaryNodes} edges={boundaryEdges} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }} nodesDraggable={false}>
          <Background color="#16223a" gap={22} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </Panel>
      <Panel title="Studbook" sub="7 lineaged skills · 6 progenitor edges to rule-of-cool (the conserved skeleton)." height={620}>
        <ReactFlow nodes={data.studbook.nodes.map((n) => ({ ...n, type: 'skill' }))} edges={studbookEdges} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }} nodesDraggable={false}>
          <Background color="#16223a" gap={22} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </Panel>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
