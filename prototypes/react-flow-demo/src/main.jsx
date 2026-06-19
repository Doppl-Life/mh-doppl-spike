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
import { fusionAgenomes, fusionMetadata, getFusionRun, makeFusionPairId } from './fusionData.js';
import { costLedger, formatMaybeNumber, formatUsd } from './costLedger.js';
import TraceViewer from './trace/TraceViewer.jsx';
import { sampleTrace } from './trace/sampleTrace.js';

const HANDLE_SLOTS = [25, 37, 49, 61, 73];

const caseStudy = {
  title: 'Superyacht Drone Privacy Problem',
  prompt:
    'A high-profile person uses a superyacht as private space, but paparazzi drones can film from outside the vessel. Avoid jamming, avoid physical takedown, account for self-returning drones, preserve discretion, and keep the procedure crew-simple.',
  evaluatorAnchor:
    'Known evaluator target: early detection should trigger a discreet onboard protocol that denies the drone useful footage before it exists.',
};

const agenomes = {
  firstPrinciples: {
    label: 'first-principles',
    title: 'First Principles',
    tone: 'cyan',
    role: 'Strip the problem to bedrock.',
    output: 'The drone is not the real target; the valuable footage is.',
    energy: 88,
    fitness: 92,
    novelty: 76,
  },
  constraintInjection: {
    label: 'constraint-injection',
    title: 'Constraint Injection',
    tone: 'blue',
    role: 'Force sharper answers through limits.',
    output: 'Any plan must act before visual contact and cannot look like a security panic.',
    energy: 71,
    fitness: 86,
    novelty: 68,
  },
  polymath: {
    label: 'polymath',
    title: 'Polymath',
    tone: 'green',
    role: 'Import proven mechanisms from another field.',
    output: 'Borrow quiet-alert patterns from aviation sterile-cockpit and hospital code protocols.',
    energy: 64,
    fitness: 81,
    novelty: 83,
  },
  breakthrough: {
    label: 'breakthrough',
    title: 'Breakthrough',
    tone: 'gold',
    role: 'Find the best non-obvious addition.',
    output: 'Turn drone detection into a private signal layer, not an anti-drone battle.',
    energy: 79,
    fitness: 90,
    novelty: 88,
  },
  additionBySubtraction: {
    label: 'addition-by-subtraction',
    title: 'Addition By Subtraction',
    tone: 'mint',
    role: 'Remove the thing making the plan worse.',
    output: 'Delete every active counter-drone action after detection; the best response is non-engagement.',
    energy: 45,
    fitness: 78,
    novelty: 71,
  },
  blindside: {
    label: 'blindside',
    title: 'Blindside',
    tone: 'pink',
    role: 'Find the hidden failure mode.',
    output: 'If the alert is obvious, paparazzi learn the signal and wait for nonresponse moments.',
    energy: 52,
    fitness: 74,
    novelty: 69,
  },
  breakout: {
    label: 'breakout',
    title: 'Breakout',
    tone: 'violet',
    role: 'Escape the frame completely.',
    output: 'Make the drone footage worthless by changing the scene, not by controlling the drone.',
    energy: 36,
    fitness: 72,
    novelty: 94,
  },
};

const energyDetails = {
  case: {
    title: 'Withheld Case Enters',
    label: 'case input',
    body: caseStudy.prompt,
    bullets: ['solution hidden from agents', 'constraints are environment', 'known answer held by evaluator'],
  },
  budget: {
    title: 'Run Energy Budget',
    label: 'kernel cap',
    body: 'The run starts with a finite metabolism. Energy is successful productive spend only: candidate generation, critic work, and allowed reproduction.',
    bullets: ['350 doppl_energy', 'no failed-call debit', 'hard cap cannot be raised by an agenome'],
  },
  firstPrinciples: energyNodeDetails('firstPrinciples'),
  constraintInjection: energyNodeDetails('constraintInjection'),
  polymath: energyNodeDetails('polymath'),
  breakthrough: energyNodeDetails('breakthrough'),
  additionBySubtraction: energyNodeDetails('additionBySubtraction'),
  blindside: energyNodeDetails('blindside'),
  breakout: energyNodeDetails('breakout'),
  cull: {
    title: 'Culling Gate',
    label: 'selection',
    body: 'Weak or redundant lineages are not erased from history; they become replayable weeds with reasons attached.',
    bullets: ['breakout spends out', 'blindside survives as critic evidence', 'addition-by-subtraction donates a cut'],
  },
  fuse: {
    title: 'Reproduction: Fusion',
    label: 'selected parents',
    body: 'High-fitness and complementary lineages fuse. First Principles contributes the bedrock objective; Breakthrough contributes the private signal layer; Polymath contributes proven quiet-alert analogies.',
    bullets: ['parent mix: 40/38/22', 'mutation bounded', 'RNG outcome persisted'],
  },
  child: {
    title: 'Child Agenome',
    label: 'offspring',
    body: 'The child is not a retry. It is bred on the blind spots and energy evidence of the previous generation.',
    bullets: ['mandate: deny useful footage', 'constraint: no visible panic', 'energy: 96 / fitness: 94'],
  },
  artifact: {
    title: 'Candidate Artifact',
    label: 'run output',
    body: 'Proposed solution: detect the drone early, trigger a discreet private onboard protocol, move exposed people out of view, and close visual access before useful footage exists.',
    bullets: ['matches evaluator anchor', 'avoids takedown and jamming', 'simple enough for crew'],
  },
};

function energyNodeDetails(key) {
  const ag = agenomes[key];
  return {
    title: ag.title,
    label: ag.label,
    body: `${ag.role} Output: ${ag.output}`,
    bullets: [`energy ${ag.energy}`, `fitness ${ag.fitness}`, `novelty ${ag.novelty}`],
  };
}

const criticDetails = {
  artifact: {
    title: 'Candidate Artifact Under Review',
    label: 'untrusted candidate data',
    body:
      'Detect incoming paparazzi drone early, trigger a private onboard alert, move exposed people inside, close visual access, and let the drone arrive with nothing valuable to film.',
    bullets: ['generated by child agenome', 'candidate text is data', 'not allowed to instruct critics'],
  },
  factual: {
    title: 'Factual Grounding Critic',
    label: 'critic mandate',
    body: 'Checks whether the plan relies on plausible yacht systems and the case facts: early detection, onboard communications, crew action, and visual denial.',
    bullets: ['score 4.6/5', 'evidence: case constraints', 'asks for detection range assumptions'],
  },
  novelty: {
    title: 'Novelty / Prior Art Critic',
    label: 'critic mandate',
    body: 'Rejects generic anti-drone theater and rewards the reframing from object control to footage-value denial.',
    bullets: ['score 4.8/5', 'non-obvious but obvious-in-retrospect', 'prior-art risk: security alert protocols'],
  },
  feasibility: {
    title: 'Feasibility Critic',
    label: 'critic mandate',
    body: 'Tests whether a crew can execute the protocol quickly without new exotic hardware or dangerous active defenses.',
    bullets: ['score 4.4/5', 'dependency: early warning', 'requires rehearsal'],
  },
  falsification: {
    title: 'Falsification Critic',
    label: 'critic mandate',
    body: 'Names conditions where the artifact fails: late detection, publicized cue, owner noncompliance, or drone already holding useful footage.',
    bullets: ['score 3.9/5', 'strongest unresolved risk', 'asks for simulation test'],
  },
  subtype: {
    title: 'Subtype-Specific Critic',
    label: 'cross-domain transfer check',
    body: 'Checks whether the analogies from aviation/hospital quiet-alert practice actually map to superyacht crew behavior.',
    bullets: ['score 4.1/5', 'mapping plausible', 'needs yacht-specific SOP'],
  },
  judge: {
    title: 'Held-Out Judge',
    label: 'immutable anchor',
    body: 'The judge is outside the breeding loop. It compares the artifact against the fixed rubric and evaluator-only known solution pattern.',
    bullets: ['final: 91%', 'survives constraints', 'cannot be moved by agents'],
  },
  verdict: {
    title: 'Defensible Verdict',
    label: 'accepted artifact',
    body:
      'The candidate passes because it preserves privacy by denying useful footage, avoids illegal or unsafe countermeasures, and can be rehearsed as an operational protocol.',
    bullets: ['accepted for demo', 'open question: detection range', 'next: replay fixture'],
  },
};

const criticBoundaryDetails = {
  sourceEnergy: {
    title: 'Energy Metabolism Simulator',
    label: 'upstream module',
    body:
      'Best guess: the runtime and breeding pass emit a normalized candidate artifact plus metered evidence. This gauntlet consumes that output as untrusted data.',
    bullets: ['opens prototype 01', 'source event: candidate.created', 'candidate text cannot instruct critics'],
    targetTab: 'energy',
    targetLabel: 'Open Energy metabolism',
  },
  criticIngressContract: {
    title: 'Verifier Ingress Contract',
    label: 'boundary contract',
    body:
      'What the verifier council needs before it can review the artifact: a frozen candidate shape, internal evidence references, and gateway calls that return schema-valid critic outputs.',
    bullets: ['Prime anchors: architecture sections 3, 6, 7, 14, Appendix A', 'contract owner: verifier council consumes', 'risk focus: prompt-injection isolation'],
    source: 'Doppl Prime: ARCHITECTURE.md sections 3, 6, 7, 14, Appendix A; DATA_MODEL.md Candidate Idea Shape; PRD 03.',
    contracts: [
      {
        name: 'CandidateIdea',
        source: 'Appendix A + DATA_MODEL.md Candidate Idea Shape',
        fields: [
          'id: string',
          'runId: string',
          'generationId: string',
          'agenomeId: string',
          'subtype: cross_domain_transfer | zeitgeist_synthesis',
          'title: string',
          'summary: string',
          'claims: string[]',
          'evidenceRefs: EvidenceRef[]',
          'status: created | under_review | checked | scored | selected | rejected | culled | invalid',
          'subtypePayload: CrossDomainTransferPayload | ZeitgeistSynthesisPayload',
        ],
      },
      {
        name: 'EvidenceRef',
        source: 'Appendix A',
        fields: ['kind: trace | check_output | prior_art | signal | raw_output | other', 'eventId?: string', 'uri?: string', 'label?: string', 'langfuseObservationId?: string'],
      },
      {
        name: 'criticInput',
        source: 'ARCHITECTURE.md section 7 + section 14',
        fields: ['trustedRubric: structured reviewer instructions', 'untrustedCandidatePayload: delimited candidate data', 'rule: never interpolate candidate text into system instructions'],
      },
      {
        name: 'ModelGatewayRequest/Response',
        source: 'ARCHITECTURE.md section 6 + Appendix A',
        fields: ['request.role: critic | subtype_check | final_judge | retrieval', 'request.schema?: structured output schema', 'response.accepted: boolean', 'response.output?: schema-valid payload', 'response.providerMeta: provider/model/tokens/cost'],
      },
    ],
  },
  criticEgressContract: {
    title: 'Verifier Egress Contract',
    label: 'boundary contract',
    body:
      'The verifier council does not select winners. It emits structured evidence, skipped/degraded statuses, and held-out judge evidence that selection can turn into fitness.',
    bullets: ['Prime anchors: architecture sections 7 and 8, Appendix A', 'contract owner: verifier produces, selection consumes', 'hard rule: critics emit evidence only'],
    source: 'Doppl Prime: ARCHITECTURE.md sections 7, 8, Appendix A; PRD 03 handoffs; PRD 01 freeze list.',
    contracts: [
      {
        name: 'CriticReview',
        source: 'Appendix A',
        fields: ['id: string', 'candidateId: string', 'mandate: factual_grounding | novelty_prior_art | feasibility | falsification | subtype_specific', 'scores: Record<string, number>', 'critique: string', 'confidence: number', 'evidenceRefs: EvidenceRef[]'],
      },
      {
        name: 'CheckResult',
        source: 'Appendix A',
        fields: ['id: string', 'candidateId: string', 'checkType: string', 'status: passed | failed | skipped', 'score?: number', 'output?: unknown', 'skipReason?: string', 'evidenceRefs: EvidenceRef[]', 'error?: string'],
      },
      {
        name: 'FinalJudgeRubric',
        source: 'ARCHITECTURE.md section 7 + Appendix A',
        fields: ['axes: grounding, novelty, feasibility, falsification_survival, subtype_check_pass', 'weights: policy-versioned', 'immutableToAgents: true', 'role: final_judge, outside breeding loop'],
      },
      {
        name: 'Selection Input Surface',
        source: 'ARCHITECTURE.md section 8',
        fields: ['critic reviews', 'check results', 'held-out judge score', 'novelty score reference', 'energy efficiency reference', 'FitnessScore produced downstream, not by verifier'],
      },
    ],
  },
  sinkFusion: {
    title: 'Selection + Fusion',
    label: 'downstream module',
    body:
      'Consumes verifier evidence plus novelty and energy signals, computes decomposed fitness, culls weak lineages, and breeds surviving parents.',
    bullets: ['opens prototype 03', 'consumes CriticReview and CheckResult', 'produces FitnessScore, culling, parent selection, reproduction'],
    targetTab: 'fusion',
    targetLabel: 'Open Fusion lab',
  },
  sinkTrace: {
    title: 'Trace Viewer',
    label: 'downstream module',
    body:
      'Uses event and evidence references to explain why the artifact survived, failed, or moved into reproduction.',
    bullets: ['opens prototype 04', 'reads event-derived evidence', 'replay requires no new model or web calls'],
    targetTab: 'trace',
    targetLabel: 'Open Trace viewer',
  },
  sinkSpend: {
    title: 'Spend Ledger',
    label: 'downstream module',
    body:
      'Reads metered gateway and energy evidence so review quality can be compared against cost and yield.',
    bullets: ['opens prototype 05', 'reads provider metadata and energy events', 'useful for allocation decisions'],
    targetTab: 'spend',
    targetLabel: 'Open Spend ledger',
  },
};

const energyBoundaryDetails = {
  energyEgressContract: {
    title: 'Candidate Egress Contract',
    label: 'boundary contract',
    body:
      'Best guess: the energy flow hands the verifier a normalized candidate plus energy and lineage facts. The actual critic instructions live on the verifier side.',
    bullets: ['Prime anchors: architecture sections 3, 4, 5, Appendix A', 'candidate.created is the handoff event', 'energy and reproduction stay replayable'],
    source: 'Doppl Prime: ARCHITECTURE.md sections 3, 4, 5, Appendix A; PRD 01 freeze list.',
    contracts: [
      {
        name: 'CandidateIdea',
        source: 'Appendix A',
        fields: ['id, runId, generationId, agenomeId', 'subtype + subtypePayload', 'title, summary, claims[]', 'evidenceRefs[]', 'status: created before verifier ingress'],
      },
      {
        name: 'EnergyEvent',
        source: 'Appendix A',
        fields: ['id, runId, generationId?, agenomeId?', 'eventType: llm | tool | spawn', 'estimate + actual', 'unit: doppl_energy', 'reason', 'providerMeta?'],
      },
      {
        name: 'ReproductionEvent',
        source: 'Appendix A',
        fields: ['parentAgenomeIds[]', 'childAgenomeId', 'mode: fusion | crossover | output_synthesis | mutation_only', 'crossoverPoints', 'mutationSummary'],
      },
    ],
  },
  sinkCritic: {
    title: 'Critic Council Gauntlet',
    label: 'downstream module',
    body:
      'The next module treats the candidate as data and turns it into structured critic/check/judge evidence.',
    bullets: ['opens prototype 02', 'consumes CandidateIdea and EvidenceRef', 'produces CriticReview and CheckResult'],
    targetTab: 'critic',
    targetLabel: 'Open Critic council',
  },
};

const boundaryDetails = {
  ...criticBoundaryDetails,
  ...energyBoundaryDetails,
};

const energyNodes = [
  node('case', 'energyNode', -180, 35, { tone: 'case' }),
  node('budget', 'budgetNode', 220, 35, { level: 350 }),
  node('firstPrinciples', 'agenomeNode', 660, -930, { key: 'firstPrinciples' }),
  node('breakthrough', 'agenomeNode', 660, -610, { key: 'breakthrough' }),
  node('additionBySubtraction', 'agenomeNode', 660, -290, { key: 'additionBySubtraction' }),
  node('constraintInjection', 'agenomeNode', 660, 30, { key: 'constraintInjection' }),
  node('blindside', 'agenomeNode', 660, 350, { key: 'blindside' }),
  node('breakout', 'agenomeNode', 660, 670, { key: 'breakout' }),
  node('polymath', 'agenomeNode', 660, 990, { key: 'polymath' }),
  node('cull', 'energyNode', 1130, -110, { tone: 'danger' }),
  node('fuse', 'fusionNode', 1130, 270),
  node('child', 'agenomeNode', 1540, 95, { key: 'child', child: true }),
  node('artifact', 'energyNode', 1930, 95, { tone: 'success', wide: true }),
  node('energyEgressContract', 'contractNode', 2370, 95, { tone: 'gold' }),
  node('sinkCritic', 'moduleNode', 2790, 95, { tone: 'cyan' }),
];

const energyEdges = [
  edge('case', 'budget', '#6ee7ff'),
  edge('budget', 'firstPrinciples', '#6ee7ff'),
  edge('budget', 'constraintInjection', '#6ee7ff'),
  edge('budget', 'polymath', '#6ee7ff'),
  edge('budget', 'breakthrough', '#6ee7ff'),
  edge('budget', 'additionBySubtraction', '#6ee7ff'),
  edge('budget', 'blindside', '#6ee7ff'),
  edge('budget', 'breakout', '#6ee7ff'),
  edge('firstPrinciples', 'fuse', '#4fffb0', true),
  edge('breakthrough', 'fuse', '#ffd166', true),
  edge('polymath', 'fuse', '#4fffb0', true),
  edge('constraintInjection', 'cull', '#89a2ff'),
  edge('additionBySubtraction', 'fuse', '#b2ffd8'),
  edge('blindside', 'cull', '#ff5d8f'),
  edge('breakout', 'cull', '#b38cff'),
  edge('cull', 'fuse', '#ff5d8f', true),
  edge('fuse', 'child', '#6ee7ff', true),
  edge('child', 'artifact', '#4fffb0', true),
  edge('artifact', 'energyEgressContract', '#ffd166', true),
  edge('energyEgressContract', 'sinkCritic', '#6ee7ff', true),
];

const criticNodes = [
  node('sourceEnergy', 'moduleNode', -560, 265, { tone: 'blue' }),
  node('criticIngressContract', 'contractNode', -220, 265, { tone: 'cyan' }),
  node('artifact', 'artifactNode', 130, 265),
  node('factual', 'criticNode', 540, -260, { score: 92, tone: 'cyan' }),
  node('novelty', 'criticNode', 540, -20, { score: 96, tone: 'gold' }),
  node('feasibility', 'criticNode', 540, 220, { score: 88, tone: 'green' }),
  node('falsification', 'criticNode', 540, 460, { score: 78, tone: 'pink' }),
  node('subtype', 'criticNode', 540, 700, { score: 82, tone: 'violet' }),
  node('judge', 'judgeNode', 930, 265),
  node('verdict', 'artifactNode', 1280, 265, { verdict: true }),
  node('criticEgressContract', 'contractNode', 1700, 265, { tone: 'green' }),
  node('sinkFusion', 'moduleNode', 2010, 35, { tone: 'green' }),
  node('sinkTrace', 'moduleNode', 2010, 265, { tone: 'blue' }),
  node('sinkSpend', 'moduleNode', 2010, 495, { tone: 'gold' }),
];

const criticEdges = [
  edge('sourceEnergy', 'criticIngressContract', '#7ca7ff', true),
  edge('criticIngressContract', 'artifact', '#6ee7ff', true),
  edge('artifact', 'factual', '#6ee7ff'),
  edge('artifact', 'novelty', '#ffd166'),
  edge('artifact', 'feasibility', '#4fffb0'),
  edge('artifact', 'falsification', '#ff5d8f'),
  edge('artifact', 'subtype', '#b38cff'),
  edge('factual', 'judge', '#6ee7ff', true),
  edge('novelty', 'judge', '#ffd166', true),
  edge('feasibility', 'judge', '#4fffb0', true),
  edge('falsification', 'judge', '#ff5d8f', true),
  edge('subtype', 'judge', '#b38cff', true),
  edge('judge', 'verdict', '#4fffb0', true),
  edge('verdict', 'criticEgressContract', '#4fffb0', true),
  edge('criticEgressContract', 'sinkFusion', '#4fffb0', true),
  edge('criticEgressContract', 'sinkTrace', '#7ca7ff', true),
  edge('criticEgressContract', 'sinkSpend', '#ffd166', true),
];

function node(id, type, x, y, data = {}) {
  return { id, type, position: { x, y }, data: { id, ...data } };
}

function edge(source, target, color, animated = false) {
  return {
    id: `${source}-${target}`,
    source,
    target,
    animated,
    markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
    style: { stroke: color, strokeWidth: animated ? 2.5 : 2 },
  };
}

function applyEdgeSides(currentNodes, currentEdges) {
  const nodesById = new Map(currentNodes.map((item) => [item.id, item]));
  const endpointGroups = new Map();
  const plannedEdges = currentEdges.map((item) => {
    const source = nodesById.get(item.source);
    const target = nodesById.get(item.target);
    const sourceIsLeft = !source || !target || source.position.x <= target.position.x;
    const sourceSide = sourceIsLeft ? 'right' : 'left';
    const targetSide = sourceIsLeft ? 'left' : 'right';
    return { item, source, target, sourceSide, targetSide };
  });

  plannedEdges.forEach(({ item, source, target, sourceSide, targetSide }) => {
    [
      { key: `${item.id}:source`, nodeId: item.source, side: sourceSide, otherY: target?.position.y ?? 0 },
      { key: `${item.id}:target`, nodeId: item.target, side: targetSide, otherY: source?.position.y ?? 0 },
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

  return plannedEdges.map(({ item, sourceSide, targetSide }) => ({
    ...item,
    sourceHandle: `source-${sourceSide}-${slotByEndpoint.get(`${item.id}:source`) ?? 0}`,
    targetHandle: `target-${targetSide}-${slotByEndpoint.get(`${item.id}:target`) ?? 0}`,
  }));
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

function EnergyNode({ data, selected }) {
  const item = energyDetails[data.id];
  return (
    <article className={`node-card ${data.wide ? 'wide' : ''} tone-${data.tone || 'default'} ${selected ? 'selected' : ''}`}>
      <NodeHandles />
      <p className="node-label">{item.label}</p>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
    </article>
  );
}

function BudgetNode({ data, selected }) {
  return (
    <article className={`budget-node ${selected ? 'selected' : ''}`}>
      <NodeHandles />
      <p className="node-label">kernel metabolism</p>
      <h3>{data.level} doppl_energy</h3>
      <div className="budget-meter"><span style={{ width: '64%' }} /></div>
      <p>Finite successful productive spend. Caps fail closed; every spend is replayable.</p>
    </article>
  );
}

function AgenomeNode({ data, selected }) {
  const item = data.child
    ? { title: 'Child Agenome', label: 'offspring', tone: 'child', energy: 96, fitness: 94, novelty: 86, role: energyDetails.child.body }
    : agenomes[data.key];
  return (
    <article className={`agenome-node tone-${item.tone} ${selected ? 'selected' : ''}`}>
      <NodeHandles />
      <div className="node-row">
        <span className="sigil">{item.title.slice(0, 1)}</span>
        <div>
          <p className="node-label">{item.label}</p>
          <h3>{item.title}</h3>
        </div>
      </div>
      <p>{data.child ? item.role : item.output}</p>
      <div className="bars">
        <Metric label="energy" value={item.energy} />
        <Metric label="fitness" value={item.fitness} />
        <Metric label="novelty" value={item.novelty} />
      </div>
    </article>
  );
}

function FusionNode({ selected }) {
  return (
    <article className={`fusion-node ${selected ? 'selected' : ''}`}>
      <NodeHandles />
      <p className="node-label">reproduction event</p>
      <h3>Weighted Fusion</h3>
      <div className="chromosome">
        <span>FP</span>
        <span>BT</span>
        <span>PM</span>
        <span>ABS</span>
      </div>
      <p>Parents contribute by fitness, novelty distance, and blind-spot coverage.</p>
    </article>
  );
}

function ArtifactNode({ data, selected }) {
  const item = criticDetails[data.id] || energyDetails[data.id];
  return (
    <article className={`artifact-node ${data.verdict ? 'verdict' : ''} ${selected ? 'selected' : ''}`}>
      <NodeHandles />
      <p className="node-label">{item.label}</p>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
    </article>
  );
}

function CriticNode({ data, selected }) {
  const item = criticDetails[data.id];
  return (
    <article className={`critic-node tone-${data.tone} ${selected ? 'selected' : ''}`}>
      <NodeHandles />
      <div className="node-row">
        <span className="score">{data.score}</span>
        <div>
          <p className="node-label">{item.label}</p>
          <h3>{item.title}</h3>
        </div>
      </div>
      <p>{item.body}</p>
    </article>
  );
}

function JudgeNode({ selected }) {
  return (
    <article className={`judge-node ${selected ? 'selected' : ''}`}>
      <NodeHandles />
      <p className="node-label">held-out judge</p>
      <h3>Fixed Rubric: 91%</h3>
      <div className="rubric">
        <span>grounding</span><b>4.6</b>
        <span>novelty</span><b>4.8</b>
        <span>feasibility</span><b>4.4</b>
        <span>falsification</span><b>3.9</b>
        <span>subtype</span><b>4.1</b>
      </div>
    </article>
  );
}

function ContractNode({ data, selected }) {
  const item = boundaryDetails[data.id];
  return (
    <article className={`contract-node tone-${data.tone || 'default'} ${selected ? 'selected' : ''}`}>
      <NodeHandles />
      <p className="node-label">{item.label}</p>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
      <div className="contract-chip-list">
        {item.contracts.slice(0, 4).map((contractItem) => (
          <span key={contractItem.name}>{contractItem.name}</span>
        ))}
      </div>
    </article>
  );
}

function ModuleNode({ data, selected }) {
  const item = boundaryDetails[data.id];
  return (
    <article className={`module-node tone-${data.tone || 'default'} ${selected ? 'selected' : ''}`}>
      <NodeHandles />
      <p className="node-label">{item.label}</p>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
      <button
        className="node-action-button nodrag"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          data.onNavigate?.(item.targetTab);
        }}
      >
        {item.targetLabel}
      </button>
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <i><b style={{ width: `${value}%` }} /></i>
    </div>
  );
}

function FlowPrototype({ kind, onNavigate }) {
  const config = kind === 'energy'
    ? {
        title: 'Energy Metabolism Simulator',
        eyebrow: 'prototype 01',
        summary:
          'A finite Doppl run where real mutagen agenomes spend energy, compete under the Jack case constraints, get culled, and fuse into a stronger child.',
        nodes: energyNodes,
        edges: energyEdges,
        details: { ...energyDetails, ...energyBoundaryDetails },
        initial: 'budget',
        defaultViewport: { x: 110, y: 330, zoom: 0.28 },
      }
    : {
        title: 'Critic Council Gauntlet',
        eyebrow: 'prototype 02',
        summary:
          'A candidate artifact from the Jack case enters an adversarial council. Critics score evidence, name failure modes, and a held-out judge decides whether it survives.',
        nodes: criticNodes,
        edges: criticEdges,
        details: { ...criticDetails, ...criticBoundaryDetails },
        initial: 'criticIngressContract',
        defaultViewport: { x: 170, y: 300, zoom: 0.29 },
      };

  const storageKey = `doppl-prototype-${kind}-layout-v4`;
  const baseNodes = useMemo(
    () => config.nodes.map((item) => ({ ...item, data: { ...item.data, onNavigate } })),
    [config.nodes, onNavigate],
  );
  const initialNodes = useMemo(() => getInitialNodes(baseNodes, storageKey), [baseNodes, storageKey]);
  const [flowNodes, setFlowNodes] = useNodesState(initialNodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(applyEdgeSides(initialNodes, config.edges));
  const [selected, setSelected] = useState(config.initial);
  const active = config.details[selected] || config.details[config.initial];
  const nodeTypes = useMemo(
    () => ({
      energyNode: EnergyNode,
      budgetNode: BudgetNode,
      agenomeNode: AgenomeNode,
      fusionNode: FusionNode,
      artifactNode: ArtifactNode,
      criticNode: CriticNode,
      judgeNode: JudgeNode,
      contractNode: ContractNode,
      moduleNode: ModuleNode,
    }),
    [],
  );

  const onSmartNodesChange = useCallback(
    (changes) => {
      setFlowNodes((currentNodes) => {
        const nextNodes = applyNodeChanges(changes, currentNodes);
        setFlowEdges(applyEdgeSides(nextNodes, config.edges));
        persistNodePositions(nextNodes, storageKey);
        return nextNodes;
      });
    },
    [config.edges, setFlowEdges, setFlowNodes, storageKey],
  );

  const resetLayout = useCallback(() => {
    window.localStorage.removeItem(storageKey);
    setFlowNodes(baseNodes);
    setFlowEdges(applyEdgeSides(baseNodes, config.edges));
  }, [baseNodes, config.edges, setFlowEdges, setFlowNodes, storageKey]);

  return (
    <section className="prototype">
      <div className="prototype-heading">
        <div>
          <p className="eyebrow">{config.eyebrow}</p>
          <h2>{config.title}</h2>
          <p>{config.summary}</p>
        </div>
        <div className="case-card">
          <span>case</span>
          <strong>{caseStudy.title}</strong>
          <p>{caseStudy.evaluatorAnchor}</p>
        </div>
      </div>

      <div className="workspace">
        <ReactFlowProvider>
          <div className="flow-frame">
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              onNodesChange={onSmartNodesChange}
              onEdgesChange={onEdgesChange}
              nodesDraggable
              defaultViewport={config.defaultViewport}
              minZoom={0.22}
              maxZoom={1.4}
              onNodeClick={(_, nodeItem) => setSelected(nodeItem.id)}
            >
              <Background color="#294360" gap={24} size={1.5} />
              <Controls />
            </ReactFlow>
          </div>
        </ReactFlowProvider>

        <aside className="inspector">
          <button className="reset-button" type="button" onClick={resetLayout}>Reset layout</button>
          <p className="eyebrow">selected node</p>
          <h3>{active.title}</h3>
          <p>{active.body}</p>
          {active.source && <p className="contract-source">{active.source}</p>}
          {active.targetTab && (
            <button className="inspector-action" type="button" onClick={() => onNavigate?.(active.targetTab)}>
              {active.targetLabel}
            </button>
          )}
          {active.contracts?.length > 0 && (
            <div className="contract-stack">
              {active.contracts.map((contractItem) => (
                <article key={contractItem.name} className="contract-detail">
                  <span>{contractItem.source}</span>
                  <h4>{contractItem.name}</h4>
                  <div className="contract-fields">
                    {contractItem.fields.map((field) => (
                      <code key={field}>{field}</code>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
          <ul>
            {(active.bullets || []).map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

function CriticScoreGrid({ scores }) {
  return (
    <div className="critic-score-grid">
      {Object.entries(scores).map(([label, value]) => (
        <div key={label}>
          <span>{formatScoreLabel(label)}</span>
          <strong>{value}</strong>
          <i><b style={{ width: `${value}%` }} /></i>
        </div>
      ))}
    </div>
  );
}

function formatScoreLabel(label) {
  return label.replace(/([A-Z])/g, ' $1').toLowerCase();
}

function FusionReportCard({ title, subtitle, proposal, scores, verdict, traits, yieldData }) {
  return (
    <article className="fusion-report-card">
      <p className="node-label">{subtitle}</p>
      <h3>{title}</h3>
      <p>{proposal}</p>
      {yieldData && <YieldStrip yieldData={yieldData} />}
      <CriticScoreGrid scores={scores} />
      <div className="fusion-verdict">
        <span>critic verdict</span>
        <strong>{verdict}</strong>
      </div>
      {traits?.length > 0 && (
        <div className="trait-list">
          {traits.map((trait) => (
            <span key={trait}>{trait}</span>
          ))}
        </div>
      )}
    </article>
  );
}

function YieldStrip({ yieldData }) {
  return (
    <div className="yield-strip">
      <span>{yieldData.kind}</span>
      <strong>{formatUsd(yieldData.costUsd)}</strong>
      <span>quality {formatMaybeNumber(yieldData.qualityScore)}</span>
      <span>space {formatMaybeNumber(yieldData.spaceOpeningScore)}</span>
    </div>
  );
}

function FusionLab() {
  const [parentA, setParentA] = useState('first-principles');
  const [parentB, setParentB] = useState('breakthrough');
  const [draggingAgenome, setDraggingAgenome] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const run = getFusionRun(parentA, parentB);
  const selectedPairId = makeFusionPairId(parentA, parentB);
  const childYield = costLedger.outputById[`child:${selectedPairId}`];
  const parentAYield = costLedger.outputById[`parent:${run.parentA.agenome}`];
  const parentBYield = costLedger.outputById[`parent:${run.parentB.agenome}`];

  const placeAgenome = useCallback((slot, id) => {
    if (!id) return;
    if (slot === 'a') {
      if (id === parentB) setParentB(parentA);
      setParentA(id);
      return;
    }
    if (id === parentA) setParentA(parentB);
    setParentB(id);
  }, [parentA, parentB]);

  const handleDrop = useCallback((event, slot) => {
    event.preventDefault();
    placeAgenome(slot, event.dataTransfer.getData('text/agenome-id'));
    setDraggingAgenome(null);
    setHoveredSlot(null);
  }, [placeAgenome]);

  const handleDragEnd = useCallback(() => {
    setDraggingAgenome(null);
    setHoveredSlot(null);
  }, []);

  return (
    <section className="prototype fusion-lab">
      <div className="prototype-heading">
        <div>
          <p className="eyebrow">prototype 03</p>
          <h2>Fusion Lab</h2>
          <p>
            Pick any two mutagen agenomes for the withheld yacht case. The fixture shows what each
            parent proposes, how the critic council scores them, and what the bred child contributes
            after inheriting weighted traits from both parents.
          </p>
          <p className="problem-statement">
            Problem: a high-profile guest wants private time on a superyacht, but paparazzi drones
            can film from outside the vessel. The solution must avoid jamming, physical takedown,
            spectacle, and late reactions that still leave the drone with useful footage.
          </p>
        </div>
        <div className="case-card">
          <span>saved model batch · {costLedger.meteringStatus}</span>
          <strong>{caseStudy.title}</strong>
          <p>
            {fusionMetadata.parentCount} parent agenomes, {fusionMetadata.runCount} child fusions,
            generated by {fusionMetadata.generationModel}. No model calls happen in this browser demo.
          </p>
          <div className="cost-pills">
            <span>{formatUsd(costLedger.totalCostUsd)}</span>
            <span>{costLedger.paidCallCount} paid calls</span>
            <span>{costLedger.selectedFruits} fruits</span>
          </div>
        </div>
      </div>

      <div className="fusion-shell">
        <aside className="agenome-palette">
          <p className="eyebrow">drag agenomes</p>
          <div className="palette-heading">
            <h3>Current mutagen pool</h3>
            <p>Drag any card into Parent A or Parent B.</p>
          </div>
          <div className="palette-list">
            {fusionAgenomes.map((agenome) => (
              <button
                draggable
                type="button"
                key={agenome.id}
                className={`palette-card tone-${agenome.tone} ${parentA === agenome.id || parentB === agenome.id ? 'is-active' : ''}`}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/agenome-id', agenome.id);
                  setDraggingAgenome(agenome.id);
                }}
                onDragEnd={handleDragEnd}
                onClick={() => placeAgenome(parentA === agenome.id ? 'b' : 'a', agenome.id)}
              >
                <span>{agenome.label}</span>
                <strong>{agenome.title}</strong>
                <small>{agenome.description}</small>
              </button>
            ))}
          </div>
        </aside>

        <div className="fusion-stage">
          <div className="parent-sockets">
            <FusionSocket
              label="parent a"
              agenome={fusionAgenomes.find((item) => item.id === parentA)}
              isDragging={Boolean(draggingAgenome)}
              isHovering={hoveredSlot === 'a'}
              onDragEnter={() => setHoveredSlot('a')}
              onDragLeave={() => setHoveredSlot((slot) => (slot === 'a' ? null : slot))}
              onDrop={(event) => handleDrop(event, 'a')}
            />
            <div className="fusion-core">
              <span>fusion ratio</span>
              <strong>{run.fusionRatio}</strong>
              <p>{run.inheritanceLogic}</p>
            </div>
            <FusionSocket
              label="parent b"
              agenome={fusionAgenomes.find((item) => item.id === parentB)}
              isDragging={Boolean(draggingAgenome)}
              isHovering={hoveredSlot === 'b'}
              onDragEnter={() => setHoveredSlot('b')}
              onDragLeave={() => setHoveredSlot((slot) => (slot === 'b' ? null : slot))}
              onDrop={(event) => handleDrop(event, 'b')}
            />
          </div>

          <div className="fusion-results">
            <FusionReportCard
              title={run.parentA.title}
              subtitle={`${run.parentA.agenome} parent proposal`}
              proposal={run.parentA.proposal}
              scores={run.parentA.scores}
              verdict={run.parentA.verdict}
              yieldData={parentAYield}
            />
            <FusionReportCard
              title={run.child.title}
              subtitle="child agenome proposal"
              proposal={run.child.proposal}
              scores={run.child.scores}
              verdict={run.child.verdict}
              traits={run.child.inheritedTraits}
              yieldData={childYield}
            />
            <FusionReportCard
              title={run.parentB.title}
              subtitle={`${run.parentB.agenome} parent proposal`}
              proposal={run.parentB.proposal}
              scores={run.parentB.scores}
              verdict={run.parentB.verdict}
              yieldData={parentBYield}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SpendLedgerView() {
  const topOutputs = [...costLedger.outputs]
    .filter((output) => output.kind === 'fruit')
    .sort((a, b) => (b.spaceOpeningScore || 0) - (a.spaceOpeningScore || 0))
    .slice(0, 6);

  return (
    <section className="prototype spend-ledger">
      <div className="prototype-heading">
        <div>
          <p className="eyebrow">prototype 05 · spend/yield ledger</p>
          <h2>Juice Versus Squeeze</h2>
          <p>
            Run-level accounting for non-subscription spend: paid model calls, generated sprouts,
            selected fruits, and the first space-opening signal for future arcade allocation.
          </p>
        </div>
        <div className="case-card">
          <span>{costLedger.arcadeId} · {costLedger.meteringStatus}</span>
          <strong>{formatUsd(costLedger.totalCostUsd)}</strong>
          <p>{costLedger.meteringNote}</p>
        </div>
      </div>

      <div className="spend-grid">
        <SpendMetric label="total spend" value={formatUsd(costLedger.totalCostUsd)} detail={costLedger.totalCostExact ? 'exact provider usage' : 'awaiting metered rerun'} />
        <SpendMetric label="paid calls" value={costLedger.paidCallCount} detail="generation + critique calls" />
        <SpendMetric label="selected fruits" value={costLedger.selectedFruits} detail={`${costLedger.fruits} child fusions total`} />
        <SpendMetric label="space opening" value={formatMaybeNumber(costLedger.averageSpaceOpening)} detail={`rubric ${costLedger.rubricVersion}`} />

        <article className="spend-panel spend-wide">
          <div className="panel-heading">
            <p className="eyebrow">marginal allocation signals</p>
            <h3>Strategy Conversion</h3>
          </div>
          <div className="strategy-table">
            <span>strategy</span>
            <span>attempts</span>
            <span>fruits</span>
            <span>space</span>
            <span>cost</span>
            <span>space/$</span>
            {costLedger.strategySummaries.map((strategy) => (
              <React.Fragment key={strategy.id}>
                <strong>{strategy.id}</strong>
                <span>{strategy.attempts}</span>
                <span>{strategy.fruitCount}</span>
                <span>{formatMaybeNumber(strategy.spaceOpeningScore)}</span>
                <span>{formatUsd(strategy.exactCostUsd)}</span>
                <span>{formatRatio(strategy.spaceOpeningPerDollar)}</span>
              </React.Fragment>
            ))}
          </div>
        </article>

        <article className="spend-panel">
          <div className="panel-heading">
            <p className="eyebrow">notifications</p>
            <h3>Run Watch</h3>
          </div>
          <div className="notification-list">
            {costLedger.notifications.map((note) => (
              <div key={note.title} className={`notification tone-${note.tone}`}>
                <strong>{note.title}</strong>
                <p>{note.body}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="spend-panel spend-wide">
          <div className="panel-heading">
            <p className="eyebrow">fruit ledger</p>
            <h3>Top Space-Opening Outputs</h3>
          </div>
          <div className="output-list">
            {topOutputs.map((output) => (
              <div key={output.id} className="output-row">
                <div>
                  <strong>{output.title}</strong>
                  <span>{output.strategyLabels.join(' × ')}</span>
                </div>
                <span>quality {formatMaybeNumber(output.qualityScore)}</span>
                <span>space {formatMaybeNumber(output.spaceOpeningScore)}</span>
                <span>{formatUsd(output.costUsd)}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function SpendMetric({ label, value, detail }) {
  return (
    <article className="spend-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function formatRatio(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'pending';
  return value >= 100 ? Math.round(value).toLocaleString() : value.toFixed(1);
}

function FusionSocket({ label, agenome, isDragging, isHovering, onDragEnter, onDragLeave, onDrop }) {
  return (
    <div
      className={`fusion-socket tone-${agenome.tone} ${isDragging ? 'is-ready' : ''} ${isHovering ? 'is-hovering' : ''}`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }}
      onDrop={onDrop}
    >
      <span>{label}</span>
      <div className="drop-target" aria-hidden="true">
        <b>Drop agenome here</b>
      </div>
      <strong>{agenome.title}</strong>
      <p>{agenome.description}</p>
    </div>
  );
}

function getInitialNodes(baseNodes, storageKey) {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
    if (!saved || typeof saved !== 'object') return baseNodes;
    return baseNodes.map((item) => ({ ...item, position: saved[item.id] || item.position }));
  } catch {
    return baseNodes;
  }
}

function persistNodePositions(nextNodes, storageKey) {
  const positions = Object.fromEntries(nextNodes.map((item) => [item.id, item.position]));
  window.localStorage.setItem(storageKey, JSON.stringify(positions));
}

function App() {
  const [tab, setTab] = useState('fusion');

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Doppl prototype suite</p>
          <h1>Small organisms for the big organism.</h1>
          <p>
            An evolving shelf of Doppl product organisms: small, testable views of metabolism,
            criticism, selection, fusion, spend, and evaluation patterns that can grow as the live
            product learns what it needs.
          </p>
        </div>
        <nav className="tabs" aria-label="Prototype tabs">
          <button type="button" aria-selected={tab === 'energy'} onClick={() => setTab('energy')}>
            Energy metabolism
          </button>
          <button type="button" aria-selected={tab === 'critic'} onClick={() => setTab('critic')}>
            Critic council
          </button>
          <button type="button" aria-selected={tab === 'fusion'} onClick={() => setTab('fusion')}>
            Fusion lab
          </button>
          <button type="button" aria-selected={tab === 'trace'} onClick={() => setTab('trace')}>
            Trace viewer
          </button>
          <button type="button" aria-selected={tab === 'spend'} onClick={() => setTab('spend')}>
            Spend ledger
          </button>
        </nav>
      </header>

      {tab === 'fusion' && <FusionLab />}
      {tab === 'trace' && <TraceViewer trace={sampleTrace} />}
      {tab === 'spend' && <SpendLedgerView />}
      {(tab === 'energy' || tab === 'critic') && <FlowPrototype key={tab} kind={tab} onNavigate={setTab} />}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
