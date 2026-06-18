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
    label: 'seed prompt',
    title: 'Vague Question Enters',
    body: 'A messy question or idea enters the crucible. The point is not to answer immediately; it is to create a room where belief can be pressured and revised.',
    bullets: ['input: prompt', 'cap: metabolism budget', 'output: debate plan'],
  },
  spawner: {
    label: 'l2 spawner',
    title: 'Room Is Composed',
    body: 'The spawner chooses the number of debaters, archetypes, and model substrates. It pays for each spawncidence, so variety has a cost.',
    bullets: ['picks debaters', 'selects models', 'keeps room finite'],
  },
  transfer: {
    label: 'debater',
    title: 'Transfer Hunter',
    body: 'Looks for patterns from other domains that might transfer into the current problem without pretending the analogy is proof.',
    bullets: ['opening position', 'object to peers', 'steal useful moves'],
  },
  hawk: {
    label: 'debater',
    title: 'Feasibility Hawk',
    body: 'Protects against beautiful nonsense. This debater asks what can actually be built, tested, paid for, or operated.',
    bullets: ['constraint pressure', 'cost awareness', 'operational realism'],
  },
  falsifier: {
    label: 'debater',
    title: 'Falsifier',
    body: 'Names what would break the idea. The falsifier is valuable when it changes the room without simply saying no.',
    bullets: ['counterexamples', 'failure tests', 'anti-herding'],
  },
  turn1: {
    label: 'turn rule',
    title: 'Object',
    body: 'Each debater must name a peer and object to a specific claim. This prevents polite parallel monologues.',
    bullets: ['targeted disagreement', 'specific claim', 'visible pressure'],
  },
  turn2: {
    label: 'turn rule',
    title: 'Steal',
    body: 'Each debater must take one good point from another debater. This makes revision possible without forcing fake consensus.',
    bullets: ['earned borrowing', 'cross-pollination', 'preserved tension'],
  },
  turn3: {
    label: 'turn rule',
    title: 'Change-Test',
    body: 'Each debater must say what evidence would move them. This separates real conviction from theatrical stubbornness.',
    bullets: ['testable belief', 'revision threshold', 'evidence hook'],
  },
  ledger: {
    label: 'first-class artifact',
    title: 'Revision Ledger',
    body: 'The key output is not who won the loudest. It is what each participant held, what changed, what evidence moved them, and what they still reject.',
    bullets: ['held belief', 'changed belief', 'still rejected'],
  },
  judge: {
    label: 'held-out judge',
    title: 'Conversation Scored',
    body: 'A held-out judge scores surviving idea quality, earned revision, unresolved tension, and performative flips.',
    bullets: ['not in debate', 'scores transcript', 'guards against herding'],
  },
  verdict: {
    label: 'surviving idea',
    title: 'Pressure-Tested Verdict',
    body: 'The output is a more defensible idea: not necessarily consensus, but a position that survived objections and incorporated useful pressure.',
    bullets: ['survives critique', 'names residual risk', 'ready for next loop'],
  },
};

const nodes = [
  { id: 'prompt', type: 'crucibleNode', position: { x: -40, y: 170 }, data: { id: 'prompt', tone: 'seed', icon: '?' } },
  { id: 'spawner', type: 'crucibleNode', position: { x: 300, y: 170 }, data: { id: 'spawner', tone: 'spawn', icon: '+' } },
  { id: 'transfer', type: 'crucibleNode', position: { x: 690, y: -40 }, data: { id: 'transfer', tone: 'debater', icon: 'T' } },
  { id: 'hawk', type: 'crucibleNode', position: { x: 690, y: 170 }, data: { id: 'hawk', tone: 'debater', icon: 'F' } },
  { id: 'falsifier', type: 'crucibleNode', position: { x: 690, y: 380 }, data: { id: 'falsifier', tone: 'debater', icon: 'X' } },
  { id: 'turn1', type: 'ruleNode', position: { x: 1100, y: -50 }, data: { id: 'turn1', step: '01' } },
  { id: 'turn2', type: 'ruleNode', position: { x: 1100, y: 170 }, data: { id: 'turn2', step: '02' } },
  { id: 'turn3', type: 'ruleNode', position: { x: 1100, y: 390 }, data: { id: 'turn3', step: '03' } },
  { id: 'ledger', type: 'crucibleNode', position: { x: 1510, y: 170 }, data: { id: 'ledger', tone: 'artifact', icon: 'L', wide: true } },
  { id: 'judge', type: 'crucibleNode', position: { x: 1900, y: 170 }, data: { id: 'judge', tone: 'judge', icon: 'J' } },
  { id: 'verdict', type: 'crucibleNode', position: { x: 2290, y: 170 }, data: { id: 'verdict', tone: 'verdict', icon: '✓', wide: true } },
];

const STORAGE_KEY = 'doppl-crucible-react-flow-layout-v1';

const edges = [
  ['prompt', 'spawner'],
  ['spawner', 'transfer'],
  ['spawner', 'hawk'],
  ['spawner', 'falsifier'],
  ['transfer', 'turn1'],
  ['hawk', 'turn1'],
  ['falsifier', 'turn1'],
  ['turn1', 'turn2'],
  ['turn2', 'turn3'],
  ['turn3', 'ledger'],
  ['ledger', 'judge'],
  ['judge', 'verdict'],
  ['judge', 'spawner'],
].map(([source, target], index) => ({
  id: `${source}-${target}`,
  source,
  target,
  animated: index >= 8 || source === 'judge',
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
  style: {
    stroke: source === 'judge' ? '#ff5d8f' : index >= 8 ? '#45e4ff' : '#5d6bff',
    strokeWidth: source === 'judge' ? 2.4 : 2,
  },
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

function CrucibleNode({ data, selected }) {
  const item = details[data.id];
  return (
    <article className={`flow-node tone-${data.tone} ${data.wide ? 'wide' : ''} ${selected ? 'selected' : ''}`}>
      <NodeHandles />
      <div className="node-top">
        <span className="sigil">{data.icon}</span>
        <span>{item.label}</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
    </article>
  );
}

function RuleNode({ data, selected }) {
  const item = details[data.id];
  return (
    <article className={`rule-node ${selected ? 'selected' : ''}`}>
      <NodeHandles />
      <span className="step">{data.step}</span>
      <div>
        <p>{item.label}</p>
        <h3>{item.title}</h3>
        <span>{item.body}</span>
      </div>
    </article>
  );
}

function App() {
  const [selected, setSelected] = useState('spawner');
  const initialNodes = useMemo(getInitialNodes, []);
  const [flowNodes, setFlowNodes] = useNodesState(initialNodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(applyEdgeSides(initialNodes, edges));
  const nodeTypes = useMemo(() => ({ crucibleNode: CrucibleNode, ruleNode: RuleNode }), []);
  const active = details[selected] || details.spawner;
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
          <p className="eyebrow">Crucible spike</p>
          <h1>Belief revision under pressure.</h1>
          <p>
            A structured argument room where cheap models do not merely vote. They object, steal,
            change-test, and leave behind a revision ledger a held-out judge can score.
          </p>
        </div>
        <aside className="metrics" aria-label="Crucible loop facts">
          <div><span>loop</span><strong>5 stages</strong></div>
          <div><span>room</span><strong>3-5 debaters</strong></div>
          <div><span>artifact</span><strong>revision ledger</strong></div>
        </aside>
      </header>

      <section className="workspace" aria-label="Crucible React Flow visualization">
        <ReactFlowProvider>
          <div className="flow-wrap">
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              onNodesChange={onSmartNodesChange}
              onEdgesChange={onEdgesChange}
              nodesDraggable
              fitView
              fitViewOptions={{ padding: 0.18 }}
              minZoom={0.25}
              maxZoom={1.4}
              onNodeClick={(_, node) => setSelected(node.id)}
            >
              <Background color="#26336b" gap={22} size={1.4} />
              <Controls />
            </ReactFlow>
          </div>
        </ReactFlowProvider>

        <aside className="inspector">
          <button className="reset-button" type="button" onClick={resetLayout}>Reset layout</button>
          <p className="eyebrow">selected component</p>
          <h2>{active.title}</h2>
          <p>{active.body}</p>
          <ul>
            {active.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <div className="mini-ledger">
            <span>held</span>
            <span>changed</span>
            <span>still rejects</span>
          </div>
        </aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
