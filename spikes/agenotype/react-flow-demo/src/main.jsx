import React, { useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  applyNodeChanges,
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './styles.css';

const details = {
  prompt: {
    label: 'seed',
    title: 'Prompt + Constraints',
    body: 'A vague problem enters with enough domain context and constraints to make generic answers fail. This is the environment the agenomes must survive.',
    bullets: ['problem instance', 'constraints as environment', 'energy budget'],
  },
  parentA: {
    label: 'parent agenome',
    title: 'Transfer Hunter',
    body: 'Parent A searches across domains for patterns that can transfer. It is strong when an answer needs analogy, reframing, or precedent from somewhere else.',
    bullets: ['cross-domain moves', 'novel pattern search', 'score: 80% example'],
  },
  parentB: {
    label: 'parent agenome',
    title: 'Feasibility Hawk',
    body: 'Parent B protects against ideas that sound brilliant but cannot survive cost, operations, or implementation reality.',
    bullets: ['operational realism', 'budget pressure', 'score: 40% example'],
  },
  artifactA: {
    label: 'artifact',
    title: 'Parent A Output',
    body: 'Each parent produces its own artifact first. This matters: the parent is evaluated individually before any pairing or fusion happens.',
    bullets: ['own answer', 'own trace', 'own score'],
  },
  artifactB: {
    label: 'artifact',
    title: 'Parent B Output',
    body: 'The second parent also earns its own record. A weaker parent can still contribute a useful trait if it covers a blind spot.',
    bullets: ['own answer', 'own trace', 'own score'],
  },
  judge: {
    label: 'fusion judge',
    title: 'Consensus + Contradictions',
    body: 'The judge compares parent artifacts, names consensus, contradictions, clarifying questions, and blind spots.',
    bullets: ['consensus', 'contradictions', 'blind spots'],
  },
  critic: {
    label: 'critic',
    title: 'Critic Pressure',
    body: 'The critic scores the fused decision and asks what it glossed over. A failure is not just retried; it becomes breeding material.',
    bullets: ['scores artifact', 'finds omissions', 'creates pressure'],
  },
  weights: {
    label: 'inheritance',
    title: 'Weighted Parent Mix',
    body: 'Fusion should not be naïve 50/50 averaging. If Parent A scores twice Parent B, the child should inherit roughly two-thirds from A and one-third from B.',
    bullets: ['80:40 -> 2:1', 'stronger parent dominates', 'weaker parent can rescue blind spots'],
  },
  child: {
    label: 'offspring',
    title: 'Child Agenome',
    body: 'The child is bred on blind spots, not merely prompted again. It inherits a mandate, critique style, and targeted corrections from the parents.',
    bullets: ['bred, not retried', 'primary mandate', 'blind-spot patch'],
  },
  run: {
    label: 'generation 2',
    title: 'Offspring Run',
    body: 'The child answers the same problem under a sharper mandate. Its artifact is then criticized again to see whether the lineage improved.',
    bullets: ['new answer', 'critic again', 'fitness lift'],
  },
  trace: {
    label: 'witnessable output',
    title: 'Fusion Trace',
    body: 'The HTML trace exists so the room can inspect lineage, parent records, critic pressure, and whether the child actually improved.',
    bullets: ['lineage visible', 'scores visible', 'decision audit'],
  },
};

const nodes = [
  { id: 'prompt', type: 'geneNode', position: { x: -80, y: 220 }, data: { id: 'prompt', tone: 'seed', glyph: '◎' } },
  { id: 'parentA', type: 'geneNode', position: { x: 330, y: 20 }, data: { id: 'parentA', tone: 'parentA', glyph: 'A' } },
  { id: 'parentB', type: 'geneNode', position: { x: 330, y: 420 }, data: { id: 'parentB', tone: 'parentB', glyph: 'B' } },
  { id: 'artifactA', type: 'artifactNode', position: { x: 710, y: 30 }, data: { id: 'artifactA', score: '80%' } },
  { id: 'artifactB', type: 'artifactNode', position: { x: 710, y: 430 }, data: { id: 'artifactB', score: '40%' } },
  { id: 'judge', type: 'geneNode', position: { x: 1090, y: 220 }, data: { id: 'judge', tone: 'judge', glyph: 'J', wide: true } },
  { id: 'critic', type: 'geneNode', position: { x: 1480, y: 20 }, data: { id: 'critic', tone: 'critic', glyph: '!' } },
  { id: 'weights', type: 'ratioNode', position: { x: 1480, y: 420 }, data: { id: 'weights' } },
  { id: 'child', type: 'geneNode', position: { x: 1880, y: 220 }, data: { id: 'child', tone: 'child', glyph: 'C', wide: true } },
  { id: 'run', type: 'geneNode', position: { x: 2290, y: 120 }, data: { id: 'run', tone: 'run', glyph: '2' } },
  { id: 'trace', type: 'geneNode', position: { x: 2290, y: 390 }, data: { id: 'trace', tone: 'trace', glyph: 'T' } },
];

const STORAGE_KEY = 'doppl-agenotype-react-flow-layout-v1';

const edges = [
  ['prompt', 'parentA', '#6ee7ff'],
  ['prompt', 'parentB', '#6ee7ff'],
  ['parentA', 'artifactA', '#59ffad'],
  ['parentB', 'artifactB', '#f4c15d'],
  ['artifactA', 'judge', '#9bb5ff'],
  ['artifactB', 'judge', '#9bb5ff'],
  ['judge', 'critic', '#ff5d8f'],
  ['judge', 'weights', '#7bf6c7'],
  ['critic', 'child', '#ff5d8f'],
  ['weights', 'child', '#7bf6c7'],
  ['child', 'run', '#6ee7ff'],
  ['run', 'trace', '#6ee7ff'],
  ['trace', 'critic', '#7c8dff'],
].map(([source, target, color], index) => ({
  id: `${source}-${target}`,
  source,
  target,
  animated: index >= 8,
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
  style: { stroke: color, strokeWidth: 2.2 },
}));

const HANDLE_SLOTS = [28, 38, 48, 58, 68, 78];

function applyEdgeSides(currentNodes, currentEdges) {
  const nodesById = new Map(currentNodes.map((node) => [node.id, node]));
  const endpointGroups = new Map();
  const plannedEdges = currentEdges.map((edge) => {
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    const sourceIsLeft = !source || !target || source.position.x <= target.position.x;
    const sourceSide = sourceIsLeft ? 'right' : 'left';
    const targetSide = sourceIsLeft ? 'left' : 'right';
    return { edge, source, target, sourceSide, targetSide };
  });

  plannedEdges.forEach(({ edge, source, target, sourceSide, targetSide }) => {
    [
      {
        key: `${edge.id}:source`,
        nodeId: edge.source,
        side: sourceSide,
        role: 'source',
        otherY: target?.position.y ?? 0,
      },
      {
        key: `${edge.id}:target`,
        nodeId: edge.target,
        side: targetSide,
        role: 'target',
        otherY: source?.position.y ?? 0,
      },
    ].forEach((endpoint) => {
      const groupKey = `${endpoint.nodeId}:${endpoint.side}`;
      endpointGroups.set(groupKey, [...(endpointGroups.get(groupKey) || []), endpoint]);
    });
  });

  const slotByEndpoint = new Map();
  endpointGroups.forEach((group) => {
    const sorted = [...group].sort((a, b) => a.otherY - b.otherY);
    sorted.forEach((endpoint, index) => {
      const offset = Math.max(0, Math.floor((HANDLE_SLOTS.length - sorted.length) / 2));
      slotByEndpoint.set(endpoint.key, Math.min(HANDLE_SLOTS.length - 1, offset + index));
    });
  });

  return plannedEdges.map(({ edge, sourceSide, targetSide }) => {
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    const sourceIsLeft = !source || !target || source.position.x <= target.position.x;

    return {
      ...edge,
      sourceHandle: `source-${sourceSide}-${slotByEndpoint.get(`${edge.id}:source`) ?? 0}`,
      targetHandle: `target-${targetSide}-${slotByEndpoint.get(`${edge.id}:target`) ?? 0}`,
    };
  });
}

function NodeHandles() {
  return (
    <>
      {HANDLE_SLOTS.map((top, index) => (
        <React.Fragment key={`left-${index}`}>
          <Handle id={`target-left-${index}`} type="target" position={Position.Left} style={{ top: `${top}%` }} />
          <Handle id={`source-left-${index}`} type="source" position={Position.Left} style={{ top: `${top}%` }} />
        </React.Fragment>
      ))}
      {HANDLE_SLOTS.map((top, index) => (
        <React.Fragment key={`right-${index}`}>
          <Handle id={`target-right-${index}`} type="target" position={Position.Right} style={{ top: `${top}%` }} />
          <Handle id={`source-right-${index}`} type="source" position={Position.Right} style={{ top: `${top}%` }} />
        </React.Fragment>
      ))}
    </>
  );
}

function getInitialNodes() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return nodes;
    return nodes.map((node) => ({
      ...node,
      position: saved[node.id] || node.position,
    }));
  } catch {
    return nodes;
  }
}

function persistNodePositions(nextNodes) {
  const positions = Object.fromEntries(nextNodes.map((node) => [node.id, node.position]));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

function GeneNode({ data, selected }) {
  const item = details[data.id];
  return (
    <article className={`gene-node tone-${data.tone} ${data.wide ? 'wide' : ''} ${selected ? 'selected' : ''}`}>
      <NodeHandles />
      <div className="gene-head">
        <span className="glyph">{data.glyph}</span>
        <span>{item.label}</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
    </article>
  );
}

function ArtifactNode({ data, selected }) {
  const item = details[data.id];
  return (
    <article className={`artifact-node ${selected ? 'selected' : ''}`}>
      <NodeHandles />
      <div className="score-ring">
        <span>{data.score}</span>
      </div>
      <div>
        <p>{item.label}</p>
        <h3>{item.title}</h3>
        <span>{item.body}</span>
      </div>
    </article>
  );
}

function RatioNode({ data, selected }) {
  const item = details[data.id];
  return (
    <article className={`ratio-node ${selected ? 'selected' : ''}`}>
      <NodeHandles />
      <p>{item.label}</p>
      <h3>{item.title}</h3>
      <div className="chromosome">
        <span className="a">A</span>
        <span className="a">A</span>
        <span className="b">B</span>
      </div>
      <span className="ratio-copy">80:40 fitness becomes 2:1 inheritance pressure.</span>
    </article>
  );
}

function App() {
  const [selected, setSelected] = useState('weights');
  const initialNodes = useMemo(getInitialNodes, []);
  const [flowNodes, setFlowNodes] = useNodesState(initialNodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(applyEdgeSides(initialNodes, edges));
  const active = details[selected] || details.weights;
  const nodeTypes = useMemo(
    () => ({ geneNode: GeneNode, artifactNode: ArtifactNode, ratioNode: RatioNode }),
    [],
  );
  const onSmartNodesChange = useCallback(
    (changes) => {
      setFlowNodes((currentNodes) => {
        const nextNodes = applyNodeChanges(changes, currentNodes);
        setFlowEdges(applyEdgeSides(nextNodes, edges));
        persistNodePositions(nextNodes);
        return nextNodes;
      });
    },
    [setFlowEdges, setFlowNodes],
  );
  const resetLayout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setFlowNodes(nodes);
    setFlowEdges(applyEdgeSides(nodes, edges));
  }, [setFlowEdges, setFlowNodes]);

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Agenotype spike</p>
          <h1>Parent agenomes breed on blind spots.</h1>
          <p>
            Two parent strategies produce artifacts, earn individual fitness records, fuse through
            judgment, and breed a child agenome that carries forward the best traits under pressure.
          </p>
        </div>
        <aside className="legend">
          <span><b className="green" /> parent strength</span>
          <span><b className="pink" /> critic pressure</span>
          <span><b className="blue" /> lineage flow</span>
        </aside>
      </header>

      <section className="workspace">
        <ReactFlowProvider>
          <div className="flow-frame">
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              onNodesChange={onSmartNodesChange}
              onEdgesChange={onEdgesChange}
              nodesDraggable
              fitView
              fitViewOptions={{ padding: 0.16 }}
              minZoom={0.24}
              maxZoom={1.35}
              onNodeClick={(_, node) => setSelected(node.id)}
            >
              <Background color="#294360" gap={24} size={1.5} />
              <Controls />
            </ReactFlow>
          </div>
        </ReactFlowProvider>

        <aside className="inspector">
          <button className="reset-button" type="button" onClick={resetLayout}>Reset layout</button>
          <p className="eyebrow">selected layer</p>
          <h2>{active.title}</h2>
          <p>{active.body}</p>
          <ul>
            {active.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <div className="inheritance-card">
            <span>parent A</span>
            <div><b style={{ width: '66%' }} /></div>
            <span>parent B</span>
            <div><b className="b" style={{ width: '33%' }} /></div>
          </div>
        </aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
