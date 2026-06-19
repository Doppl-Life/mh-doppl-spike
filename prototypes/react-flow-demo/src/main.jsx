import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
import {
  agenomeContractShapes,
  agenomePoolBoundary,
  agenomePoolLibrary,
  defaultStartingPool,
  evaluateStartingPool,
  maximumPoolSize,
  minimumPoolSize,
} from './agenomePoolData.js';
import { fusionAgenomes, fusionMetadata, getFusionRun, makeFusionPairId } from './fusionData.js';
import { costLedger, formatMaybeNumber, formatUsd } from './costLedger.js';
import { gatewayBoundary, gatewayContractShapes, gatewayFixtures } from './gatewayData.js';
import {
  buildIntakeContractInstance,
  buildUploadedCase,
  intakeBoundary,
  intakeContractShapes,
  intakeExamples,
} from './caseIntakeData.js';
import { replayBoundary, replayContractShapes, replayEventTypes, replayFixtures } from './replayData.js';
import {
  buildOperatorEvents,
  defaultRunCaps,
  operatorBoundary,
  operatorCasePresets,
  operatorContractShapes,
  operatorModes,
  operatorPoolPresets,
  validateRunCaps,
} from './operatorData.js';
import {
  buildFallbackEvents,
  fallbackBoundary,
  fallbackContractShapes,
  fallbackRehearsals,
  fallbackRungs,
} from './fallbackData.js';
import {
  subtypeCandidates,
  subtypeCheckBoundary,
  subtypeCheckContractShapes,
  summarizeSubtypeChecks,
} from './subtypeCheckData.js';
import {
  buildNoveltyEvent,
  noveltyBoundary,
  noveltyCandidates,
  noveltyContractShapes,
} from './noveltyRadarData.js';
import {
  survivorBoundary,
  survivorContractShapes,
  survivorRuns,
} from './survivorProofData.js';
import TraceViewer from './trace/TraceViewer.jsx';
import { sampleTrace } from './trace/sampleTrace.js';

const HANDLE_SLOTS = [25, 37, 49, 61, 73];
const PrototypeNavigationContext = createContext(() => {});
const prototypeModuleTargets = {
  'Agenome Pool': { tabId: 'agenomes', label: 'Agenome pool' },
  'Case Study Intake': { tabId: 'intake', label: 'Case intake' },
  'Critic Council': { tabId: 'critic', label: 'Critic council' },
  'Demo Fallback Ladder': { tabId: 'fallback', label: 'Fallback ladder' },
  'Energy Metabolism': { tabId: 'energy', label: 'Energy metabolism' },
  'Final Survivor Proof Panel': { tabId: 'survivor', label: 'Survivor proof' },
  'Fusion / Mutation': { tabId: 'fusion', label: 'Fusion lab' },
  'Fusion Lab': { tabId: 'fusion', label: 'Fusion lab' },
  'Gateway Forge': { tabId: 'gateway', label: 'Gateway forge' },
  'Model Gateway': { tabId: 'gateway', label: 'Gateway forge' },
  'Novelty Radar': { tabId: 'novelty', label: 'Novelty radar' },
  'Operator Console': { tabId: 'operator', label: 'Operator console' },
  'Replay Spine': { tabId: 'replay', label: 'Replay spine' },
  'Spend Ledger': { tabId: 'spend', label: 'Spend ledger' },
  'Subtype Check Lab': { tabId: 'subtype', label: 'Subtype checks' },
  'Trace Viewer': { tabId: 'trace', label: 'Trace viewer' },
};

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
  node('sinkCritic', 'moduleNode', 2790, 95, { tone: 'cyan', direction: 'out' }),
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
  node('sourceEnergy', 'moduleNode', -560, 265, { tone: 'blue', direction: 'in' }),
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
  node('sinkFusion', 'moduleNode', 2010, 35, { tone: 'green', direction: 'out' }),
  node('sinkTrace', 'moduleNode', 2010, 265, { tone: 'blue', direction: 'out' }),
  node('sinkSpend', 'moduleNode', 2010, 495, { tone: 'gold', direction: 'out' }),
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
      <span className="contract-stamp">contract</span>
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
    <article className={`module-node dir-${data.direction || 'out'} tone-${data.tone || 'default'} ${selected ? 'selected' : ''}`}>
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
                  <pre className="contract-interface">{formatContractInterface(contractItem)}</pre>
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

function formatContractInterface(contract) {
  const interfaceName = contract.name.replace(/[^A-Za-z0-9_$]/g, '');
  const lines = contract.fields.map((field) =>
    field.includes(': ') ? `  ${field};` : `  // ${field}`,
  );
  return `interface ${interfaceName} {\n${lines.join('\n')}\n}`;
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

function CaseStudyIntake() {
  const [selectedCaseId, setSelectedCaseId] = useState(intakeExamples[0].id);
  const [uploadedCase, setUploadedCase] = useState(null);
  const [activePane, setActivePane] = useState('visible');
  const cases = uploadedCase ? [...intakeExamples, uploadedCase] : intakeExamples;
  const selectedCase = cases.find((item) => item.id === selectedCaseId) || cases[0];
  const passCount = selectedCase.checks.filter((check) => check.status === 'pass').length;
  const contractInstance = useMemo(() => buildIntakeContractInstance(selectedCase), [selectedCase]);

  const handleFile = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const draft = buildUploadedCase(file.name, String(reader.result || ''));
      setUploadedCase(draft);
      setSelectedCaseId(draft.id);
      setActivePane('visible');
    };
    reader.readAsText(file);
  }, []);

  return (
    <section className="prototype intake-prototype">
      <div className="prototype-heading">
        <div>
          <p className="eyebrow">prototype 06 · case intake</p>
          <h2>Withheld-Solution Harness</h2>
          <p>
            Prepare a case for a fair Doppl run. The workbench separates what agents may see from
            evaluator-only anchors, checks for solution leakage, and previews the boundary contracts
            that downstream prototypes consume.
          </p>
        </div>
        <div className="case-card">
          <span>{selectedCase.source} · {selectedCase.leakageRisk} leakage risk</span>
          <strong>{selectedCase.title}</strong>
          <p>{passCount}/{selectedCase.checks.length} intake checks passing · readiness {selectedCase.readiness}%</p>
          <div className="readiness-meter">
            <i><b style={{ width: `${Math.min(100, selectedCase.readiness)}%` }} /></i>
          </div>
        </div>
      </div>

      <div className="intake-layout">
        <aside className="intake-case-list">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">example packets</p>
              <h3>Choose Input</h3>
            </div>
          </div>
          <div className="intake-examples">
            {cases.map((example) => (
              <button
                key={example.id}
                type="button"
                aria-selected={selectedCase.id === example.id}
                onClick={() => {
                  setSelectedCaseId(example.id);
                  setActivePane('visible');
                }}
              >
                <span>{example.source}</span>
                <strong>{example.title}</strong>
                <small>readiness {example.readiness}% · {example.leakageRisk} risk</small>
              </button>
            ))}
          </div>

          <label className="upload-drop">
            <span>Upload markdown/text case</span>
            <strong>Local draft parser</strong>
            <small>Creates an untrusted draft preview. Nothing leaves the browser.</small>
            <input type="file" accept=".md,.txt,text/markdown,text/plain" onChange={handleFile} />
          </label>
        </aside>

        <div className="intake-main">
          <section className="intake-summary">
            <p className="eyebrow">case packet</p>
            <h3>{selectedCase.title}</h3>
            <p>{selectedCase.summary}</p>
          </section>

          <section className="intake-packet">
            <div className="intake-tabs" aria-label="Case packet panes">
              {[
                ['visible', 'Agent-visible'],
                ['hidden', 'Evaluator-only'],
                ['run', 'Run seed'],
                ['contracts', 'Contracts'],
              ].map(([id, label]) => (
                <button key={id} type="button" aria-selected={activePane === id} onClick={() => setActivePane(id)}>
                  {label}
                </button>
              ))}
            </div>
            {activePane === 'visible' && <AgentVisiblePane packet={selectedCase.agentVisible} />}
            {activePane === 'hidden' && <EvaluatorPane packet={selectedCase.evaluatorOnly} />}
            {activePane === 'run' && <RunSeedPane caseItem={selectedCase} />}
            {activePane === 'contracts' && <IntakeContractsPane instance={contractInstance} />}
          </section>

          <section className="intake-checks">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">leakage + runnability</p>
                <h3>Intake Checks</h3>
              </div>
              <strong>{passCount}/{selectedCase.checks.length}</strong>
            </div>
            <div className="check-grid">
              {selectedCase.checks.map((check) => (
                <article key={check.id} className={`check-card status-${check.status}`}>
                  <span>{check.status}</span>
                  <strong>{check.label}</strong>
                  <p>{check.detail}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <BoundaryPanel />
      </div>
    </section>
  );
}

function IntakeContractsPane({ instance }) {
  return (
    <div className="contract-pane">
      <div className="contract-column">
        <p className="contract-note">
          Stable prototype-local shapes. These are candidates for frozen contracts, not Appendix A
          contracts until promoted.
        </p>
        <ContractShapeGroup label="Ingress" shapes={intakeContractShapes.ingress} />
        <ContractShapeGroup label="Egress" shapes={intakeContractShapes.egress} />
      </div>
      <div className="contract-column contract-instance-column">
        <p className="contract-note">
          Selected-case instance values. These change when a different case packet or uploaded draft is chosen.
        </p>
        <ContractInstanceGroup label="Ingress Instance" rows={instance.ingress} />
        <ContractInstanceGroup label="Egress Instance" rows={instance.egress} />
      </div>
    </div>
  );
}

function ContractShapeGroup({ label, shapes }) {
  return (
    <section className="contract-group">
      <p className="eyebrow">{label}</p>
      {shapes.map((shape) => (
        <article key={shape.name} className="contract-shape">
          <span>{shape.anchor}</span>
          <h4>{shape.name}</h4>
          <dl>
            {shape.fields.map(([field, type]) => (
              <React.Fragment key={field}>
                <dt>{field}</dt>
                <dd>{type}</dd>
              </React.Fragment>
            ))}
          </dl>
        </article>
      ))}
    </section>
  );
}

function ContractInstanceGroup({ label, rows }) {
  return (
    <section className="contract-group">
      <p className="eyebrow">{label}</p>
      <div className="contract-instance">
        {rows.map(([field, value]) => (
          <React.Fragment key={field}>
            <span>{field}</span>
            <strong>{value}</strong>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

function AgentVisiblePane({ packet }) {
  return (
    <div className="packet-pane">
      <PacketBlock label="problem" body={packet.problem} />
      <PacketList label="context" items={packet.context} />
      <PacketList label="constraints" items={packet.constraints} />
      <PacketList label="success criteria" items={packet.successCriteria} />
    </div>
  );
}

function EvaluatorPane({ packet }) {
  return (
    <div className="packet-pane evaluator-pane">
      <PacketBlock label="withheld known target" body={packet.knownSolution} />
      <PacketList label="hidden anchors" items={packet.hiddenAnchors} />
      <PacketList label="leakage terms" items={packet.solutionLeakageTerms} emptyText="No exact leakage terms saved." />
    </div>
  );
}

function RunSeedPane({ caseItem }) {
  const preview = caseItem.downstreamPreview;
  return (
    <div className="run-seed">
      <div>
        <span>RunConfig.seed</span>
        <strong>{preview.runSeed}</strong>
      </div>
      <div>
        <span>enabled subtypes</span>
        <strong>{preview.enabledSubtypes.join(' + ')}</strong>
      </div>
      <div>
        <span>EvaluatorAnchorRef</span>
        <strong>{preview.evaluatorAnchor}</strong>
      </div>
      <div>
        <span>initial energy</span>
        <strong>{preview.initialEnergy} doppl_energy</strong>
      </div>
    </div>
  );
}

function PacketBlock({ label, body }) {
  return (
    <article className="packet-block">
      <span>{label}</span>
      <p>{body}</p>
    </article>
  );
}

function PacketList({ label, items, emptyText = 'None provided.' }) {
  return (
    <article className="packet-block">
      <span>{label}</span>
      {items?.length ? (
        <ul>
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : (
        <p>{emptyText}</p>
      )}
    </article>
  );
}

function BoundaryPanel() {
  return (
    <aside className="boundary-panel">
      <p className="eyebrow">boundary contracts</p>
      <h3>Where Intake Fits</h3>
      <BoundaryGroup title="Upstream Modules" items={intakeBoundary.upstreamModules} />
      <BoundaryGroup title="Upstream Boundary Contracts" items={intakeBoundary.upstreamContracts} />
      <BoundaryGroup title="Downstream Boundary Contracts" items={intakeBoundary.downstreamContracts} />
      <BoundaryGroup title="Downstream Modules" items={intakeBoundary.downstreamModules} />
      <BoundaryGroup title="Invariants Exercised" items={intakeBoundary.invariants} tone="strong" />
    </aside>
  );
}

function BoundaryGroup({ title, items, tone = 'default' }) {
  const navigatePrototype = useContext(PrototypeNavigationContext);
  const navigableItems = title.includes('Modules')
    ? [
        ...new Map(
          items
            .map((item) => prototypeModuleTargets[item])
            .filter(Boolean)
            .map((target) => [target.tabId, target]),
        ).values(),
      ]
    : [];

  return (
    <div className={`boundary-group tone-${tone}`}>
      <span>{title}</span>
      <div>
        {items.map((item) => <b key={item}>{item}</b>)}
      </div>
      {navigableItems.length > 0 && (
        <div className="boundary-nav-buttons">
          {navigableItems.map(({ label, tabId }) => (
            <button key={`${label}-${tabId}`} type="button" onClick={() => navigatePrototype(tabId)}>
              Open {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AgenomePool() {
  const [selectedIds, setSelectedIds] = useState(defaultStartingPool);
  const [activeId, setActiveId] = useState(defaultStartingPool[0]);
  const pool = useMemo(() => evaluateStartingPool(selectedIds), [selectedIds]);
  const activeAgenome = agenomePoolLibrary.find((agenome) => agenome.id === activeId) || agenomePoolLibrary[0];

  const toggleAgenome = (agenomeId) => {
    setSelectedIds((current) => {
      const exists = current.includes(agenomeId);
      if (exists) return current.filter((id) => id !== agenomeId);
      return [...current, agenomeId];
    });
    setActiveId(agenomeId);
  };

  return (
    <section className="prototype agenome-prototype">
      <div className="prototype-heading">
        <div>
          <p className="eyebrow">prototype 07 · agenome pool</p>
          <h2>Mutagen Starting Population</h2>
          <p>
            Compose the bounded set of agenomes that enter a run. Each mutagen carries strategy,
            traits, tool permissions, prior performance, and mutation hints before the runtime
            spawns generation zero.
          </p>
        </div>
        <div className="case-card">
          <span>RunConfig.startingPopulation</span>
          <strong>{pool.selected.length}/{maximumPoolSize} selected</strong>
          <p>{pool.ready ? 'ready for runtime spawn' : `${pool.warnings.length} pool warning${pool.warnings.length === 1 ? '' : 's'}`}</p>
          <div className="readiness-meter">
            <i><b style={{ width: `${pool.ready ? 100 : Math.max(35, 100 - pool.warnings.length * 18)}%` }} /></i>
          </div>
        </div>
      </div>

      <div className="agenome-layout">
        <aside className="agenome-library-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">mutagen library</p>
              <h3>Choose Pool</h3>
            </div>
          </div>
          <div className="agenome-card-list">
            {agenomePoolLibrary.map((agenome) => {
              const selected = selectedIds.includes(agenome.id);
              return (
                <button
                  key={agenome.id}
                  type="button"
                  className={`tone-${agenome.tone}`}
                  aria-selected={activeAgenome.id === agenome.id}
                  onClick={() => setActiveId(agenome.id)}
                >
                  <span>{agenome.subtypeFit}</span>
                  <strong>{agenome.title}</strong>
                  <small>{agenome.description}</small>
                  <b>{selected ? 'in pool' : 'available'}</b>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="agenome-inspector-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">agenome inspector</p>
              <h3>{activeAgenome.title}</h3>
            </div>
            <button type="button" className="pool-toggle-button" onClick={() => toggleAgenome(activeAgenome.id)}>
              {selectedIds.includes(activeAgenome.id) ? 'Remove' : 'Add'}
            </button>
          </div>
          <p className="agenome-role">{activeAgenome.description}</p>
          <div className="agenome-score-grid">
            <AgenomeMetric label="fitness" value={activeAgenome.fitness} />
            <AgenomeMetric label="novelty" value={activeAgenome.novelty} />
            <AgenomeMetric label="efficiency" value={activeAgenome.energyEfficiency} />
          </div>
          <div className="agenome-detail-grid">
            <AgenomePillGroup title="Traits" items={activeAgenome.traits} />
            <AgenomePillGroup title="Tool Permissions" items={activeAgenome.tools} />
            <AgenomePillGroup title="Prior Events" items={activeAgenome.priorEvents} />
          </div>
          <div className="agenome-notes">
            <article>
              <span>mutation hint</span>
              <p>{activeAgenome.mutationHint}</p>
            </article>
            <article>
              <span>selection risk</span>
              <p>{activeAgenome.risk}</p>
            </article>
          </div>
        </section>

        <section className="pool-diagnostics-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">pool diagnostics</p>
              <h3>Run Readiness</h3>
            </div>
            <strong className={pool.ready ? 'status-good' : 'status-bad'}>
              {pool.ready ? 'ready' : 'needs review'}
            </strong>
          </div>
          <div className="projection-grid">
            <ProjectionCard label="Fitness Avg" value={pool.avgFitness} detail="historical fixture projection" />
            <ProjectionCard label="Novelty Avg" value={pool.avgNovelty} detail="anti-collapse pressure" />
            <ProjectionCard label="Efficiency Avg" value={pool.avgEfficiency} detail="energy behavior prior" />
            <ProjectionCard label="Trait Count" value={pool.traitCount} detail={`${pool.toolSet.size} tool permissions covered`} />
          </div>
          <div className="selected-pool-list">
            {pool.selected.map((agenome) => (
              <article key={agenome.id}>
                <span>{agenome.subtypeFit}</span>
                <strong>{agenome.title}</strong>
                <p>{agenome.traits.slice(0, 2).join(' · ')}</p>
              </article>
            ))}
          </div>
          <div className="quarantine-list pool-warning-list">
            <span>composition guardrails</span>
            {pool.warnings.length ? (
              pool.warnings.map((warning) => <b key={warning}>{warning}</b>)
            ) : (
              <b>Pool meets size, subtype, trait, and critic-readiness constraints.</b>
            )}
          </div>
        </section>

        <aside className="boundary-panel agenome-boundary-panel">
          <p className="eyebrow">boundary contracts</p>
          <h3>Where Pool Fits</h3>
          <BoundaryGroup title="Upstream Modules" items={agenomePoolBoundary.upstreamModules} />
          <BoundaryGroup title="Upstream Boundary Contracts" items={agenomePoolBoundary.upstreamContracts} />
          <BoundaryGroup title="Downstream Boundary Contracts" items={agenomePoolBoundary.downstreamContracts} />
          <BoundaryGroup title="Downstream Modules" items={agenomePoolBoundary.downstreamModules} />
          <BoundaryGroup title="Invariants Exercised" items={agenomePoolBoundary.invariants} tone="strong" />
        </aside>

        <section className="agenome-runconfig-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">runtime egress</p>
              <h3>Spawn Preview</h3>
            </div>
            <strong>gen-0</strong>
          </div>
          <pre className="payload-preview">{JSON.stringify(buildAgenomeRunConfig(pool), null, 2)}</pre>
        </section>

        <section className="agenome-contract-panel">
          <div className="contract-pane">
            <ContractShapeGroup label="Ingress" shapes={agenomeContractShapes.ingress} />
            <ContractShapeGroup label="Egress" shapes={agenomeContractShapes.egress} />
          </div>
        </section>
      </div>
    </section>
  );
}

function AgenomeMetric({ label, value }) {
  return (
    <article className="agenome-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <i><b style={{ width: `${value}%` }} /></i>
    </article>
  );
}

function AgenomePillGroup({ title, items }) {
  return (
    <article className="agenome-pill-group">
      <span>{title}</span>
      <div>
        {items.map((item) => <b key={item}>{item}</b>)}
      </div>
    </article>
  );
}

function buildAgenomeRunConfig(pool) {
  return {
    caseId: 'case_superyacht_drone_privacy',
    populationCap: maximumPoolSize,
    minimumPoolSize,
    selectedAgenomeIds: pool.selected.map((agenome) => agenome.id),
    spawnEvents: pool.selected.map((agenome, index) => ({
      type: 'agenome.spawned',
      generationId: 'gen-0',
      sequenceHint: index + 1,
      agenomeId: agenome.id,
      initialEnergy: Math.max(60, agenome.energyEfficiency),
      mutationPolicyRef: `mutation_policy.${agenome.id}`,
      toolPermissions: agenome.tools,
    })),
    diversityWarnings: pool.warnings,
  };
}

function OperatorConsole() {
  const [caseId, setCaseId] = useState(operatorCasePresets[0].id);
  const [poolId, setPoolId] = useState(operatorPoolPresets[0].id);
  const [mode, setMode] = useState('live');
  const [caps, setCaps] = useState(defaultRunCaps);
  const [status, setStatus] = useState('configured');
  const selectedCase = operatorCasePresets.find((item) => item.id === caseId) || operatorCasePresets[0];
  const selectedPool = operatorPoolPresets.find((item) => item.id === poolId) || operatorPoolPresets[0];
  const capWarnings = validateRunCaps(caps);
  const events = buildOperatorEvents(status, mode);
  const canStart = status === 'configured' && capWarnings.length === 0;
  const isActive = status === 'running' || status === 'paused';
  const progress = status === 'configured' ? 0 : status === 'running' ? 42 : status === 'paused' ? 46 : 100;
  const generation = status === 'configured' ? 0 : status === 'running' ? 1 : status === 'paused' ? 1 : 2;

  const setCap = (key, value) => {
    setCaps((current) => ({ ...current, [key]: Number(value) }));
    if (status !== 'configured') setStatus('configured');
  };

  const startRun = () => {
    if (canStart) setStatus('running');
  };

  return (
    <section className="prototype operator-prototype">
      <div className="prototype-heading">
        <div>
          <p className="eyebrow">prototype 10 · operator console</p>
          <h2>Run Control Room</h2>
          <p>
            Configure a bounded Doppl run, start it, monitor health, and intervene safely. The console
            exposes operator commands without allowing edits to candidates, scores, lineage, or event truth.
          </p>
        </div>
        <div className="case-card">
          <span>{mode} mode · {status}</span>
          <strong>{selectedCase.title}</strong>
          <p>generation {generation}/{caps.generationCap} · energy {Math.max(0, caps.energyBudget - 146)}/{caps.energyBudget}</p>
          <div className="readiness-meter">
            <i><b style={{ width: `${progress}%` }} /></i>
          </div>
        </div>
      </div>

      <div className="operator-layout">
        <section className="operator-config-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">pre-run config</p>
              <h3>RunConfig</h3>
            </div>
            <strong className={capWarnings.length ? 'status-bad' : 'status-good'}>
              {capWarnings.length ? 'blocked' : 'valid'}
            </strong>
          </div>
          <OperatorSelect label="case packet" value={caseId} options={operatorCasePresets} onChange={setCaseId} disabled={isActive} />
          <OperatorSelect label="agenome pool" value={poolId} options={operatorPoolPresets} onChange={setPoolId} disabled={isActive} />
          <div className="operator-mode-row" aria-label="Run mode">
            {operatorModes.map((item) => (
              <button key={item.id} type="button" aria-selected={mode === item.id} disabled={isActive} onClick={() => setMode(item.id)}>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="operator-caps-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">hard caps</p>
              <h3>Fail-Closed Limits</h3>
            </div>
            <strong>{capWarnings.length}/{6}</strong>
          </div>
          <div className="cap-grid">
            <CapControl label="population" value={caps.populationCap} min={2} max={7} onChange={(value) => setCap('populationCap', value)} disabled={isActive} />
            <CapControl label="generations" value={caps.generationCap} min={1} max={6} onChange={(value) => setCap('generationCap', value)} disabled={isActive} />
            <CapControl label="energy" value={caps.energyBudget} min={80} max={600} step={10} onChange={(value) => setCap('energyBudget', value)} disabled={isActive} />
            <CapControl label="minutes" value={caps.wallClockMinutes} min={2} max={30} onChange={(value) => setCap('wallClockMinutes', value)} disabled={isActive} />
            <CapControl label="tool calls" value={caps.toolCallCap} min={8} max={90} onChange={(value) => setCap('toolCallCap', value)} disabled={isActive} />
            <CapControl label="repairs" value={caps.repairAttempts} min={0} max={2} onChange={(value) => setCap('repairAttempts', value)} disabled={isActive} />
          </div>
        </section>

        <section className="operator-command-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">operator commands</p>
              <h3>Start / Stop</h3>
            </div>
            <strong>{status}</strong>
          </div>
          <div className="operator-command-grid">
            <button type="button" className="command-primary" disabled={!canStart} onClick={startRun}>Start Run</button>
            <button type="button" disabled={status !== 'running'} onClick={() => setStatus('paused')}>Pause</button>
            <button type="button" disabled={status !== 'paused'} onClick={() => setStatus('running')}>Resume</button>
            <button type="button" disabled={!isActive && status !== 'stopped'} onClick={() => setStatus('stopped')}>Stop</button>
            <button type="button" className="command-danger" disabled={!isActive} onClick={() => setStatus('killed')}>Kill Switch</button>
            <button type="button" onClick={() => setStatus('configured')}>Reset Config</button>
          </div>
          <div className="quarantine-list operator-warning-list">
            <span>command guardrails</span>
            {capWarnings.length ? capWarnings.map((warning) => <b key={warning}>{warning}</b>) : <b>Caps valid. Candidate text, scores, lineage, and event sequence remain read-only.</b>}
          </div>
        </section>

        <section className="operator-health-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">live health</p>
              <h3>Run State</h3>
            </div>
            <strong className={status === 'killed' ? 'status-bad' : 'status-good'}>
              {status === 'running' ? 'healthy' : status}
            </strong>
          </div>
          <div className="projection-grid">
            <ProjectionCard label="Active Agenomes" value={status === 'configured' ? 0 : selectedPool.agenomeIds.length} detail={selectedPool.title} />
            <ProjectionCard label="Gateway Queue" value={status === 'running' ? 3 : 0} detail={mode === 'replay' ? 'replay mode uses no fresh calls' : 'bounded provider calls'} />
            <ProjectionCard label="Event Lag" value={status === 'running' ? '420ms' : '0ms'} detail="SSE delivery, event log remains truth" />
            <ProjectionCard label="Schema Rejects" value={status === 'running' ? 1 : 0} detail="visible, not hidden" />
          </div>
          <div className="operator-event-list">
            {events.map((event) => (
              <article key={`${event.type}-${event.detail}`}>
                <span>{event.source}</span>
                <strong>{event.type}</strong>
                <p>{event.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="boundary-panel operator-boundary-panel">
          <p className="eyebrow">boundary contracts</p>
          <h3>Where Console Fits</h3>
          <BoundaryGroup title="Upstream Modules" items={operatorBoundary.upstreamModules} />
          <BoundaryGroup title="Upstream Boundary Contracts" items={operatorBoundary.upstreamContracts} />
          <BoundaryGroup title="Downstream Boundary Contracts" items={operatorBoundary.downstreamContracts} />
          <BoundaryGroup title="Downstream Modules" items={operatorBoundary.downstreamModules} />
          <BoundaryGroup title="Invariants Exercised" items={operatorBoundary.invariants} tone="strong" />
        </aside>

        <section className="operator-payload-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">command preview</p>
              <h3>RunCommand</h3>
            </div>
            <strong>{status === 'configured' ? 'create_run' : `run.${status}`}</strong>
          </div>
          <pre className="payload-preview">{JSON.stringify(buildRunCommandPreview({ selectedCase, selectedPool, caps, mode, status }), null, 2)}</pre>
        </section>

        <section className="operator-contract-panel">
          <div className="contract-pane">
            <ContractShapeGroup label="Ingress" shapes={operatorContractShapes.ingress} />
            <ContractShapeGroup label="Egress" shapes={operatorContractShapes.egress} />
          </div>
        </section>
      </div>
    </section>
  );
}

function OperatorSelect({ label, value, options, onChange, disabled }) {
  return (
    <label className="operator-select">
      <span>{label}</span>
      <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        {options.map((item) => (
          <option key={item.id} value={item.id}>{item.title}</option>
        ))}
      </select>
    </label>
  );
}

function CapControl({ label, value, min, max, step = 1, onChange, disabled }) {
  return (
    <label className="cap-control">
      <span>{label}</span>
      <strong>{value}</strong>
      <input type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function buildRunCommandPreview({ selectedCase, selectedPool, caps, mode, status }) {
  return {
    type: status === 'configured' ? 'create_run' : `run.${status}`,
    idempotencyKey: `operator:${selectedCase.id}:${selectedPool.id}:${mode}`,
    requestedBy: 'operator',
    runConfig: {
      caseId: selectedCase.id,
      startingPopulation: selectedPool.agenomeIds,
      mode,
      caps,
      scoringPolicyVersion: 'mvp-held-out-v1',
    },
  };
}

function GatewayForge() {
  const [fixtureId, setFixtureId] = useState('clean');
  const fixture = gatewayFixtures.find((item) => item.id === fixtureId) || gatewayFixtures[0];
  const accepted = fixture.response.accepted;
  const repairLabel = fixture.response.repairAttempted ? 'repair attempted' : 'no repair';

  return (
    <section className="prototype gateway-prototype">
      <div className="prototype-heading">
        <div>
          <p className="eyebrow">prototype 08 · gateway forge</p>
          <h2>Structured Output Discipline</h2>
          <p>
            Route every model call through one accountable boundary. The forge validates raw model
            output, allows one auditable repair, rejects unsafe payloads, preserves provider metadata,
            and emits sanitized events for Replay Spine.
          </p>
        </div>
        <div className="case-card">
          <span>{fixture.role} · {fixture.schemaName}</span>
          <strong>{fixture.label}</strong>
          <p>{accepted ? 'accepted' : 'rejected'} · {repairLabel} · {fixture.providerMeta.latencyMs}ms</p>
          <div className="readiness-meter">
            <i><b style={{ width: `${accepted ? 100 : 58}%` }} /></i>
          </div>
        </div>
      </div>

      <div className="gateway-layout">
        <aside className="gateway-scenario-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">recorded calls</p>
              <h3>Choose Scenario</h3>
            </div>
          </div>
          <div className="gateway-fixtures">
            {gatewayFixtures.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-selected={fixture.id === item.id}
                onClick={() => setFixtureId(item.id)}
              >
                <span className={`gateway-status-dot status-${item.status}`} />
                <strong>{item.label}</strong>
                <small>{item.headline}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="gateway-request-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">gateway ingress</p>
              <h3>ModelGatewayRequest</h3>
            </div>
            <strong>{fixture.request.id}</strong>
          </div>
          <div className="gateway-request-grid">
            <GatewayField label="runId" value={fixture.request.runId} />
            <GatewayField label="role" value={fixture.role} />
            <GatewayField label="schema" value={fixture.schemaName} />
            <GatewayField label="route" value={fixture.route} />
            <GatewayField label="traceId" value={fixture.request.traceId} />
          </div>
          <GatewayList title="trusted instructions" items={fixture.request.trustedInstructions} />
          <article className="gateway-payload-box">
            <span>untrusted payload</span>
            <p>{fixture.request.untrustedPayload}</p>
          </article>
        </section>

        <section className="gateway-pipeline-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">validation pipeline</p>
              <h3>Parse → Validate → Repair → Persist</h3>
            </div>
            <strong className={accepted ? 'status-good' : 'status-bad'}>
              {accepted ? 'accepted' : 'rejected'}
            </strong>
          </div>
          <div className="gateway-stage-list">
            {fixture.stages.map((stage, index) => (
              <article key={stage.id} className={`gateway-stage status-${stage.status}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{stage.label}</strong>
                  <p>{stage.detail}</p>
                </div>
                <b>{stage.status}</b>
              </article>
            ))}
          </div>
          <div className="gateway-response-columns">
            <GatewayCodeBlock title="raw response" body={fixture.rawResponse} />
            {fixture.repairPrompt && <GatewayCodeBlock title="repair prompt" body={fixture.repairPrompt} />}
            {fixture.repairedResponse && <GatewayCodeBlock title="repaired response" body={fixture.repairedResponse} />}
            {fixture.fallbackResponse && <GatewayCodeBlock title="fallback response" body={fixture.fallbackResponse} />}
          </div>
        </section>

        <section className="gateway-result-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">gateway egress</p>
              <h3>Response + Event</h3>
            </div>
            <strong>{fixture.response.eventType}</strong>
          </div>
          <div className="gateway-result-grid">
            <ProjectionCard label="Accepted" value={accepted ? 'true' : 'false'} detail={fixture.response.rejectionReason || fixture.response.outputTitle} />
            <ProjectionCard label="Repair" value={fixture.response.repairAttempted ? '1 / 1' : '0 / 1'} detail="repair budget is capped" />
            <ProjectionCard label="Cost" value={formatUsd(fixture.providerMeta.costUsd)} detail={`${fixture.providerMeta.promptTokens + fixture.providerMeta.completionTokens} tokens`} />
            <ProjectionCard label="Latency" value={`${fixture.providerMeta.latencyMs}ms`} detail={`${fixture.providerMeta.provider} · ${fixture.providerMeta.model}`} />
          </div>
          <pre className="payload-preview gateway-event-preview">
            {JSON.stringify(buildGatewayEvent(fixture), null, 2)}
          </pre>
        </section>

        <aside className="boundary-panel gateway-boundary-panel">
          <p className="eyebrow">boundary contracts</p>
          <h3>Where Gateway Fits</h3>
          <BoundaryGroup title="Upstream Modules" items={gatewayBoundary.upstreamModules} />
          <BoundaryGroup title="Upstream Boundary Contracts" items={gatewayBoundary.upstreamContracts} />
          <BoundaryGroup title="Downstream Boundary Contracts" items={gatewayBoundary.downstreamContracts} />
          <BoundaryGroup title="Downstream Modules" items={gatewayBoundary.downstreamModules} />
          <BoundaryGroup title="Invariants Exercised" items={gatewayBoundary.invariants} tone="strong" />
        </aside>

        <section className="gateway-contract-panel">
          <div className="contract-pane">
            <ContractShapeGroup label="Ingress" shapes={gatewayContractShapes.ingress} />
            <ContractShapeGroup label="Egress" shapes={gatewayContractShapes.egress} />
          </div>
        </section>
      </div>
    </section>
  );
}

function GatewayField({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function GatewayList({ title, items }) {
  return (
    <article className="gateway-list">
      <span>{title}</span>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}

function GatewayCodeBlock({ title, body }) {
  return (
    <article className="gateway-code-card">
      <span>{title}</span>
      <pre>{body}</pre>
    </article>
  );
}

function buildGatewayEvent(fixture) {
  return {
    type: fixture.response.eventType,
    requestId: fixture.request.id,
    runId: fixture.request.runId,
    role: fixture.role,
    accepted: fixture.response.accepted,
    repairAttempted: fixture.response.repairAttempted,
    rejectionReason: fixture.response.rejectionReason || undefined,
    providerMeta: {
      provider: fixture.providerMeta.provider,
      model: fixture.providerMeta.model,
      promptTokens: fixture.providerMeta.promptTokens,
      completionTokens: fixture.providerMeta.completionTokens,
      costUsd: fixture.providerMeta.costUsd,
      latencyMs: fixture.providerMeta.latencyMs,
      traceId: fixture.request.traceId,
    },
    secretPolicy: 'scrubbed before run_events append',
  };
}

function SubtypeCheckLab() {
  const [candidateId, setCandidateId] = useState(subtypeCandidates[0].id);
  const candidate = subtypeCandidates.find((item) => item.id === candidateId) || subtypeCandidates[0];
  const summary = summarizeSubtypeChecks(candidate);
  const [selectedCheckId, setSelectedCheckId] = useState(candidate.checks[0].id);
  const selectedCheck = candidate.checks.find((check) => check.id === selectedCheckId) || candidate.checks[0];

  useEffect(() => {
    setSelectedCheckId(candidate.checks[0].id);
  }, [candidate.id]);

  return (
    <section className="prototype subtype-prototype">
      <div className="prototype-heading">
        <div>
          <p className="eyebrow">prototype 11 · subtype check lab</p>
          <h2>Subtype-Specific Evidence</h2>
          <p>
            Show that candidate subtype changes the required checks. Cross-domain transfer and
            zeitgeist synthesis produce different evidence, penalties, and check.completed events.
          </p>
        </div>
        <div className="case-card">
          <span>{candidate.subtype}</span>
          <strong>{candidate.shortLabel} checks</strong>
          <p>{summary.pass}/{summary.completed} passing · readiness {summary.readiness}%</p>
          <div className="readiness-meter">
            <i><b style={{ width: `${summary.readiness}%` }} /></i>
          </div>
        </div>
      </div>

      <div className="subtype-layout">
        <aside className="subtype-selector-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">candidate subtype</p>
              <h3>Choose Check Set</h3>
            </div>
          </div>
          <div className="subtype-candidate-list">
            {subtypeCandidates.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-selected={candidate.id === item.id}
                onClick={() => setCandidateId(item.id)}
              >
                <span>{item.subtype}</span>
                <strong>{item.label}</strong>
                <small>{item.title}</small>
              </button>
            ))}
          </div>
          <article className="subtype-summary-card">
            <span>{candidate.payloadLabel}</span>
            <pre>{JSON.stringify(candidate.payload, null, 2)}</pre>
          </article>
        </aside>

        <section className="subtype-candidate-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">candidate idea</p>
              <h3>{candidate.title}</h3>
            </div>
            <strong>{candidate.shortLabel}</strong>
          </div>
          <p className="subtype-summary-text">{candidate.summary}</p>
          <div className="subtype-obligation-grid">
            {candidate.obligations.map((obligation) => (
              <article key={obligation}>
                <span>required</span>
                <strong>{obligation}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="subtype-checks-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">check results</p>
              <h3>Evidence Obligations</h3>
            </div>
            <strong>{summary.pass} pass · {summary.degraded} degraded · {summary.skipped} skipped</strong>
          </div>
          <div className="subtype-check-list">
            {candidate.checks.map((check) => (
              <button
                key={check.id}
                type="button"
                className={`status-${check.status}`}
                aria-selected={selectedCheck.id === check.id}
                onClick={() => setSelectedCheckId(check.id)}
              >
                <span>{check.status}</span>
                <strong>{check.dimension}</strong>
                <small>{check.runner}</small>
                <b>{check.score === null ? 'penalty' : `${Math.round(check.score * 100)}%`}</b>
              </button>
            ))}
          </div>
        </section>

        <section className="subtype-detail-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">selected check</p>
              <h3>{selectedCheck.dimension}</h3>
            </div>
            <strong className={selectedCheck.status === 'fail' ? 'status-bad' : 'status-good'}>
              {selectedCheck.status}
            </strong>
          </div>
          <div className="event-envelope subtype-check-envelope">
            <ReplayRow label="runner" value={selectedCheck.runner} />
            <ReplayRow label="status" value={selectedCheck.status} />
            <ReplayRow label="score" value={selectedCheck.score === null ? 'null' : selectedCheck.score.toFixed(2)} />
            <ReplayRow label="event" value="check.completed" />
          </div>
          <article className="subtype-explanation-card">
            <span>explanation</span>
            <p>{selectedCheck.detail}</p>
          </article>
          <div className="subtype-evidence-list">
            {selectedCheck.evidenceRefs.map((item) => (
              <article key={item}>
                <span>EvidenceRef</span>
                <strong>{item}</strong>
              </article>
            ))}
          </div>
        </section>

        <aside className="boundary-panel subtype-boundary-panel">
          <p className="eyebrow">boundary contracts</p>
          <h3>Where Checks Fit</h3>
          <BoundaryGroup title="Upstream Modules" items={subtypeCheckBoundary.upstreamModules} />
          <BoundaryGroup title="Upstream Boundary Contracts" items={subtypeCheckBoundary.upstreamContracts} />
          <BoundaryGroup title="Downstream Boundary Contracts" items={subtypeCheckBoundary.downstreamContracts} />
          <BoundaryGroup title="Downstream Modules" items={subtypeCheckBoundary.downstreamModules} />
          <BoundaryGroup title="Invariants Exercised" items={subtypeCheckBoundary.invariants} tone="strong" />
        </aside>

        <section className="subtype-contract-panel">
          <div className="contract-pane">
            <ContractShapeGroup label="Ingress" shapes={subtypeCheckContractShapes.ingress} />
            <ContractShapeGroup label="Egress" shapes={subtypeCheckContractShapes.egress} />
          </div>
        </section>
      </div>
    </section>
  );
}

function NoveltyRadar() {
  const [candidateId, setCandidateId] = useState(noveltyCandidates[0].id);
  const candidate = noveltyCandidates.find((item) => item.id === candidateId) || noveltyCandidates[0];
  const event = buildNoveltyEvent(candidate);
  const maxSimilarity = Math.max(
    0,
    ...candidate.neighbors.map((item) => item.similarity),
    ...candidate.priorArt.map((item) => item.similarity),
  );
  const riskLabel = candidate.degrade ? 'degraded' : maxSimilarity > 0.75 ? 'prior-art risk' : 'supported';

  return (
    <section className="prototype novelty-prototype">
      <div className="prototype-heading">
        <div>
          <p className="eyebrow">prototype 12 · novelty radar</p>
          <h2>Similarity Is Evidence</h2>
          <p>
            Inspect whether a candidate is genuinely new against prior candidates, known prior art,
            and current signals. Degraded embedding or retrieval states stay visible.
          </p>
        </div>
        <div className="case-card">
          <span>{candidate.method} · {riskLabel}</span>
          <strong>{Math.round(candidate.score * 100)} novelty</strong>
          <p>{candidate.comparisonSetSize || candidate.neighbors.length + candidate.priorArt.length + candidate.signals.length} persisted comparisons</p>
          <div className="readiness-meter">
            <i><b style={{ width: `${Math.round(candidate.score * 100)}%` }} /></i>
          </div>
        </div>
      </div>

      <div className="novelty-layout">
        <aside className="novelty-candidate-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">candidate idea</p>
              <h3>Choose Radar Target</h3>
            </div>
          </div>
          <div className="novelty-candidate-list">
            {noveltyCandidates.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-selected={candidate.id === item.id}
                onClick={() => setCandidateId(item.id)}
              >
                <span>{item.subtype}</span>
                <strong>{item.title}</strong>
                <small>{item.confidence}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="novelty-score-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">NoveltyScore</p>
              <h3>{candidate.title}</h3>
            </div>
            <strong className={candidate.degrade ? 'status-bad' : 'status-good'}>
              {candidate.degrade ? 'degraded' : 'scored'}
            </strong>
          </div>
          <p className="novelty-summary">{candidate.summary}</p>
          <div className="novelty-component-grid">
            {candidate.components.map((component) => (
              <article key={component.label}>
                <span>{component.label}</span>
                <strong>{Math.round(component.value * 100)}%</strong>
                <i><b style={{ width: `${Math.round(component.value * 100)}%` }} /></i>
                <p>{component.detail}</p>
              </article>
            ))}
          </div>
          {candidate.degrade && (
            <article className="quarantine-callout novelty-degrade-card">
              <span>degraded scoring</span>
              <p>{candidate.degrade}</p>
            </article>
          )}
        </section>

        <section className="novelty-match-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">nearest neighbors</p>
              <h3>Prior Candidates</h3>
            </div>
          </div>
          <NoveltyMatchList items={candidate.neighbors} />
        </section>

        <section className="novelty-prior-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">known prior art</p>
              <h3>Overlap Risk</h3>
            </div>
          </div>
          <NoveltyMatchList items={candidate.priorArt} />
        </section>

        <section className="novelty-signal-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">current signals</p>
              <h3>Signal Fit</h3>
            </div>
          </div>
          {candidate.signals.length ? (
            <NoveltyMatchList items={candidate.signals} />
          ) : (
            <article className="novelty-empty-card">
              <span>not required</span>
              <p>Current-signal evidence is optional for this cross-domain candidate.</p>
            </article>
          )}
        </section>

        <section className="novelty-event-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">persisted event</p>
              <h3>{event.type}</h3>
            </div>
            <strong>{candidate.embeddingModelId}</strong>
          </div>
          <pre className="payload-preview novelty-event-preview">{JSON.stringify(event, null, 2)}</pre>
        </section>

        <aside className="boundary-panel novelty-boundary-panel">
          <p className="eyebrow">boundary contracts</p>
          <h3>Where Novelty Fits</h3>
          <BoundaryGroup title="Upstream Modules" items={noveltyBoundary.upstreamModules} />
          <BoundaryGroup title="Upstream Boundary Contracts" items={noveltyBoundary.upstreamContracts} />
          <BoundaryGroup title="Downstream Boundary Contracts" items={noveltyBoundary.downstreamContracts} />
          <BoundaryGroup title="Downstream Modules" items={noveltyBoundary.downstreamModules} />
          <BoundaryGroup title="Invariants Exercised" items={noveltyBoundary.invariants} tone="strong" />
        </aside>

        <section className="novelty-contract-panel">
          <div className="contract-pane">
            <ContractShapeGroup label="Ingress" shapes={noveltyContractShapes.ingress} />
            <ContractShapeGroup label="Egress" shapes={noveltyContractShapes.egress} />
          </div>
        </section>
      </div>
    </section>
  );
}

function NoveltyMatchList({ items }) {
  return (
    <div className="novelty-match-list">
      {items.map((item) => (
        <article key={item.id}>
          <div>
            <span>{item.kind}</span>
            <strong>{item.label}</strong>
          </div>
          <b>{Math.round(item.similarity * 100)}%</b>
          <i><em style={{ width: `${Math.round(item.similarity * 100)}%` }} /></i>
          <p>{item.note}</p>
        </article>
      ))}
    </div>
  );
}

function FinalSurvivorProofPanel() {
  const navigatePrototype = useContext(PrototypeNavigationContext);
  const [runId, setRunId] = useState(survivorRuns[0].id);
  const run = survivorRuns.find((item) => item.id === runId) || survivorRuns[0];
  const isAccepted = run.status === 'accepted';

  return (
    <section className="prototype survivor-prototype">
      <div className="prototype-heading">
        <div>
          <p className="eyebrow">prototype 13 · final survivor proof panel</p>
          <h2>{isAccepted ? 'Why This Idea Won' : 'No Winner Fabricated'}</h2>
          <p>
            End a Doppl run with one audience-ready proof artifact. The panel gathers lineage,
            critic pressure, subtype checks, novelty, spend, replay truth, unresolved risks, and
            the validation plan in one place.
          </p>
        </div>
        <div className="case-card">
          <span>{run.caseStudy} · {run.mode}</span>
          <strong>{run.label}</strong>
          <p>{run.runId} · {run.status}</p>
          <div className="readiness-meter">
            <i><b style={{ width: `${isAccepted ? 91 : 38}%` }} /></i>
          </div>
        </div>
      </div>

      <div className="survivor-layout">
        <aside className="survivor-run-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">terminal run</p>
              <h3>Select State</h3>
            </div>
          </div>
          <div className="survivor-run-list">
            {survivorRuns.map((item) => (
              <button key={item.id} type="button" aria-selected={run.id === item.id} onClick={() => setRunId(item.id)}>
                <span>{item.status}</span>
                <strong>{item.label}</strong>
                <small>{item.caseStudy}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="survivor-claim-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">surviving candidate</p>
              <h3>{run.title}</h3>
            </div>
            <strong className={isAccepted ? 'status-good' : 'status-bad'}>{run.status}</strong>
          </div>
          <p className="survivor-summary">{run.summary}</p>
          <article className="survivor-improvement-card">
            <span>improvement claim</span>
            <strong>{run.improvementClaim}</strong>
            <p>{run.terminalReason}</p>
          </article>
        </section>

        <section className="survivor-metric-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">proof metrics</p>
              <h3>Evidence Bundle</h3>
            </div>
          </div>
          <div className="survivor-metric-grid">
            {run.metrics.map((metric) => (
              <ProjectionCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
            ))}
          </div>
        </section>

        <section className="survivor-evidence-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">resolving proof links</p>
              <h3>Click Through Evidence</h3>
            </div>
            <strong>{run.evidence.length} links</strong>
          </div>
          <div className="survivor-evidence-list">
            {run.evidence.map((item) => (
              <article key={`${run.id}-${item.label}`}>
                <div>
                  <span>{item.status}</span>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                </div>
                <button type="button" onClick={() => navigatePrototype(item.tab)}>
                  Open {item.label}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="survivor-risk-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">not hidden</p>
              <h3>Risks + Validation</h3>
            </div>
          </div>
          <div className="survivor-risk-grid">
            <PacketList label="open risks" items={run.risks} />
            <PacketList label="validation plan" items={run.validationPlan} />
          </div>
        </section>

        <aside className="boundary-panel survivor-boundary-panel">
          <p className="eyebrow">boundary contracts</p>
          <h3>Where Proof Fits</h3>
          <BoundaryGroup title="Upstream Modules" items={survivorBoundary.upstreamModules} />
          <BoundaryGroup title="Upstream Boundary Contracts" items={survivorBoundary.upstreamContracts} />
          <BoundaryGroup title="Downstream Boundary Contracts" items={survivorBoundary.downstreamContracts} />
          <BoundaryGroup title="Downstream Modules" items={survivorBoundary.downstreamModules} />
          <BoundaryGroup title="Invariants Exercised" items={survivorBoundary.invariants} tone="strong" />
        </aside>

        <section className="survivor-contract-panel">
          <div className="contract-pane">
            <ContractShapeGroup label="Ingress" shapes={survivorContractShapes.ingress} />
            <ContractShapeGroup label="Egress" shapes={survivorContractShapes.egress} />
          </div>
        </section>
      </div>
    </section>
  );
}

function ReplaySpine() {
  const [fixtureId, setFixtureId] = useState('clean');
  const [foldMode, setFoldMode] = useState('replay');
  const fixture = replayFixtures.find((item) => item.id === fixtureId) || replayFixtures[0];
  const replay = useMemo(() => foldReplayFixture(fixture), [fixture]);
  const [selectedEventId, setSelectedEventId] = useState(fixture.events[0].id);
  const selectedEvent = fixture.events.find((event) => event.id === selectedEventId) || fixture.events[0];
  const selectedIssue = replay.quarantine.find((issue) => issue.eventId === selectedEvent.id);
  const validEventCount = replay.validEvents.length;
  const parity = replay.quarantine.length === 0 && replay.missingSequences.length === 0;

  return (
    <section className="prototype replay-prototype">
      <div className="prototype-heading">
        <div>
          <p className="eyebrow">prototype 09 · replay spine</p>
          <h2>Event Truth Workbench</h2>
          <p>
            Prove that every visible run state is a projection of append-only events. Live fold and
            replay fold use the same envelopes; replay never calls models, tools, embeddings, or RNG.
          </p>
        </div>
        <div className="case-card">
          <span>{fixture.schemaVersion}</span>
          <strong>{fixture.label}</strong>
          <p>{validEventCount}/{fixture.events.length} events accepted · {replay.quarantine.length} quarantined</p>
          <div className="readiness-meter">
            <i><b style={{ width: `${parity ? 100 : 74}%` }} /></i>
          </div>
        </div>
      </div>

      <div className="replay-layout">
        <aside className="replay-control-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">fixture</p>
              <h3>Replay Source</h3>
            </div>
          </div>
          <div className="replay-fixtures">
            {replayFixtures.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-selected={fixture.id === item.id}
                onClick={() => {
                  setFixtureId(item.id);
                  setSelectedEventId(item.events[0].id);
                }}
              >
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </button>
            ))}
          </div>
          <div className="replay-mode-toggle" aria-label="Fold mode">
            {[
              ['live', 'Live ingest'],
              ['replay', 'Replay only'],
            ].map(([id, label]) => (
              <button key={id} type="button" aria-selected={foldMode === id} onClick={() => setFoldMode(id)}>
                {label}
              </button>
            ))}
          </div>
          <div className="replay-proof-card">
            <span>Fresh calls during replay</span>
            <strong>0</strong>
            <p>Projection state is reconstructed from stored event payloads only.</p>
          </div>
        </aside>

        <section className="event-stream-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">append-only run_events</p>
              <h3>{fixture.runId}</h3>
            </div>
            <strong>{foldMode === 'live' ? 'live fold' : 'replay fold'}</strong>
          </div>
          <div className="event-stream">
            {fixture.events.map((event) => {
              const issue = replay.quarantine.find((item) => item.eventId === event.id);
              return (
                <button
                  key={event.id}
                  type="button"
                  className={issue ? 'is-quarantined' : 'is-accepted'}
                  aria-selected={selectedEvent.id === event.id}
                  onClick={() => setSelectedEventId(event.id)}
                >
                  <span>#{event.sequence}</span>
                  <strong>{event.type}</strong>
                  <small>{event.sourceModule}</small>
                  {issue && <b>{issue.reason}</b>}
                </button>
              );
            })}
          </div>
        </section>

        <section className="replay-detail-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">selected envelope</p>
              <h3>{selectedEvent.type}</h3>
            </div>
            <strong className={selectedIssue ? 'status-bad' : 'status-good'}>
              {selectedIssue ? 'quarantined' : 'accepted'}
            </strong>
          </div>
          <div className="event-envelope">
            <ReplayRow label="id" value={selectedEvent.id} />
            <ReplayRow label="sequence" value={selectedEvent.sequence} />
            <ReplayRow label="schemaVersion" value={selectedEvent.schemaVersion || fixture.schemaVersion} />
            <ReplayRow label="sourceModule" value={selectedEvent.sourceModule} />
            <ReplayRow label="occurredAt" value={selectedEvent.occurredAt} />
          </div>
          {selectedIssue && (
            <article className="quarantine-callout">
              <span>quarantine reason</span>
              <p>{selectedIssue.reason}. Replay keeps the event visible and refuses to silently repair state.</p>
            </article>
          )}
          <pre className="payload-preview">{JSON.stringify(selectedEvent.payload, null, 2)}</pre>
        </section>

        <section className="projection-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">derived projections</p>
              <h3>Fold Result</h3>
            </div>
            <strong>{parity ? 'equivalent' : 'degraded'}</strong>
          </div>
          <div className="projection-grid">
            <ProjectionCard label="Run State" value={replay.projections.runState.status} detail={replay.projections.runState.caseTitle} />
            <ProjectionCard label="Lineage Edges" value={replay.projections.lineage.edges.length} detail={replay.projections.lineage.lastFusion || 'no fusion yet'} />
            <ProjectionCard label="Candidates" value={replay.projections.candidates.length} detail={`${replay.projections.candidates.filter((item) => item.status === 'selected').length} selected`} />
            <ProjectionCard label="Spend" value={formatUsd(replay.projections.spend.totalCostUsd)} detail={`${replay.projections.spend.energySpent} energy spent`} />
          </div>
          <div className="candidate-projection-list">
            {replay.projections.candidates.map((candidate) => (
              <article key={candidate.id}>
                <span>{candidate.status}</span>
                <strong>{candidate.title}</strong>
                <p>{candidate.reviews} critic review{candidate.reviews === 1 ? '' : 's'} · fitness {candidate.fitness || 'pending'}</p>
              </article>
            ))}
          </div>
          <div className="quarantine-list">
            <span>Replay guardrails</span>
            {replay.missingSequences.length > 0 && <b>Missing sequence: {replay.missingSequences.join(', ')}</b>}
            {replay.quarantine.length === 0 && replay.missingSequences.length === 0 ? (
              <b>All envelopes accepted in sequence order.</b>
            ) : (
              replay.quarantine.map((issue) => <b key={issue.eventId}>{issue.eventId}: {issue.reason}</b>)
            )}
          </div>
        </section>

        <aside className="boundary-panel replay-boundary-panel">
          <p className="eyebrow">boundary contracts</p>
          <h3>Where Replay Fits</h3>
          <BoundaryGroup title="Upstream Modules" items={replayBoundary.upstreamModules} />
          <BoundaryGroup title="Upstream Boundary Contracts" items={replayBoundary.upstreamContracts} />
          <BoundaryGroup title="Downstream Boundary Contracts" items={replayBoundary.downstreamContracts} />
          <BoundaryGroup title="Downstream Modules" items={replayBoundary.downstreamModules} />
          <BoundaryGroup title="Invariants Exercised" items={replayBoundary.invariants} tone="strong" />
        </aside>

        <section className="replay-contract-panel">
          <div className="contract-pane">
            <ContractShapeGroup label="Ingress" shapes={replayContractShapes.ingress} />
            <ContractShapeGroup label="Egress" shapes={replayContractShapes.egress} />
          </div>
        </section>
      </div>
    </section>
  );
}

function ReplayRow({ label, value }) {
  return (
    <>
      <span>{label}</span>
      <strong>{String(value)}</strong>
    </>
  );
}

function DemoFallbackLadder() {
  const [rungId, setRungId] = useState('live');
  const activeRung = fallbackRungs.find((rung) => rung.id === rungId) || fallbackRungs[0];
  const activeEvents = buildFallbackEvents(activeRung.id);
  const activeIndex = fallbackRungs.findIndex((rung) => rung.id === activeRung.id);
  const readiness = activeRung.id === 'live' ? 82 : activeRung.id === 'prepared' ? 92 : 100;

  return (
    <section className="prototype fallback-prototype">
      <div className="prototype-heading">
        <div>
          <p className="eyebrow">prototype 14 · demo fallback ladder</p>
          <h2>Honest Demo Survival</h2>
          <p>
            Keep the showcase alive without lying about liveness. The operator can move from
            low-cap live to prepared run to labeled replay, while every rung preserves event truth.
          </p>
        </div>
        <div className="case-card">
          <span>{activeRung.mode} · {activeRung.status}</span>
          <strong>{activeRung.label}</strong>
          <p>{activeRung.freshCallsAllowed ? 'fresh calls allowed' : 'fresh calls disabled'} · readiness {readiness}%</p>
          <div className="readiness-meter">
            <i><b style={{ width: `${readiness}%` }} /></i>
          </div>
        </div>
      </div>

      <div className="fallback-layout">
        <aside className="fallback-rung-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">operator choice</p>
              <h3>Fallback Rungs</h3>
            </div>
            <strong>{activeIndex + 1}/3</strong>
          </div>
          <div className="fallback-rung-list">
            {fallbackRungs.map((rung, index) => (
              <button
                key={rung.id}
                type="button"
                aria-selected={activeRung.id === rung.id}
                onClick={() => setRungId(rung.id)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{rung.label}</strong>
                <small>{rung.headline}</small>
              </button>
            ))}
          </div>
          <article className="fallback-disclosure-card">
            <span>audience disclosure</span>
            <p>{activeRung.disclosure}</p>
          </article>
        </aside>

        <section className="fallback-mode-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{activeRung.eyebrow}</p>
              <h3>{activeRung.headline}</h3>
            </div>
            <strong className={activeRung.id === 'live' ? 'status-good' : 'status-bad'}>
              {activeRung.freshCallsAllowed ? 'live' : 'not live'}
            </strong>
          </div>
          <div className="projection-grid">
            <ProjectionCard label="Provider" value={activeRung.health.provider} detail="from health projection" />
            <ProjectionCard label="Gateway Queue" value={activeRung.health.gatewayQueue} detail="in-flight fresh calls" />
            <ProjectionCard label="Event Lag" value={`${activeRung.health.eventLagMs}ms`} detail="delivery lag, not truth lag" />
            <ProjectionCard label="Langfuse" value={activeRung.health.langfuse} detail="optional and non-authoritative" />
          </div>
          <div className="fallback-cap-grid">
            {Object.entries(activeRung.caps).map(([key, value]) => (
              <article key={key}>
                <span>{formatFallbackCapLabel(key)}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="fallback-actions-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">allowed actions</p>
              <h3>What The Operator May Do</h3>
            </div>
          </div>
          <div className="fallback-action-list">
            {activeRung.allowedActions.map((action) => (
              <article key={action}>
                <span>allowed</span>
                <strong>{action}</strong>
              </article>
            ))}
          </div>
          <div className="quarantine-list fallback-warning-list">
            <span>hard rule</span>
            <b>Fallback changes append new control events. They never edit prior run_events or hide the current mode label.</b>
            {activeRung.id === 'live' && <b>Low-cap override can only lower caps from the prepared default.</b>}
          </div>
        </section>

        <section className="fallback-rehearsal-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">runbook rehearsals</p>
              <h3>Failure Drills</h3>
            </div>
            <strong>{activeRung.label}</strong>
          </div>
          <div className="gateway-stage-list">
            {fallbackRehearsals.map((item, index) => {
              const status = item.statusByRung[activeRung.id] || 'skip';
              return (
                <article key={item.id} className={`gateway-stage status-${status === 'warn' ? 'skip' : status}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <b>{status}</b>
                </article>
              );
            })}
          </div>
        </section>

        <section className="fallback-event-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">append-only evidence</p>
              <h3>Decision Events</h3>
            </div>
            <strong>{activeEvents.length} events</strong>
          </div>
          <div className="operator-event-list fallback-event-list">
            {activeEvents.map((event) => (
              <article key={`${event.sequence}-${event.type}`}>
                <span>#{event.sequence} · {event.source}</span>
                <strong>{event.type}</strong>
                <p>{event.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="boundary-panel fallback-boundary-panel">
          <p className="eyebrow">boundary contracts</p>
          <h3>Where Fallback Fits</h3>
          <BoundaryGroup title="Upstream Modules" items={fallbackBoundary.upstreamModules} />
          <BoundaryGroup title="Upstream Boundary Contracts" items={fallbackBoundary.upstreamContracts} />
          <BoundaryGroup title="Downstream Boundary Contracts" items={fallbackBoundary.downstreamContracts} />
          <BoundaryGroup title="Downstream Modules" items={fallbackBoundary.downstreamModules} />
          <BoundaryGroup title="Invariants Exercised" items={fallbackBoundary.invariants} tone="strong" />
        </aside>

        <section className="fallback-contract-panel">
          <div className="contract-pane">
            <ContractShapeGroup label="Ingress" shapes={fallbackContractShapes.ingress} />
            <ContractShapeGroup label="Egress" shapes={fallbackContractShapes.egress} />
          </div>
        </section>
      </div>
    </section>
  );
}

function formatFallbackCapLabel(key) {
  return {
    populationCap: 'Population',
    generationCap: 'Generations',
    energyBudget: 'Energy',
    wallClockMinutes: 'Minutes',
    toolCallCap: 'Tool calls',
  }[key] || key;
}

function ProjectionCard({ label, value, detail }) {
  return (
    <article className="projection-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function foldReplayFixture(fixture) {
  const seenSequences = new Set();
  const validEvents = [];
  const quarantine = [];

  fixture.events.forEach((event) => {
    const schemaVersion = event.schemaVersion || fixture.schemaVersion;
    let reason = '';
    if (!Number.isInteger(event.sequence) || event.sequence < 1) {
      reason = 'invalid sequence';
    } else if (seenSequences.has(event.sequence)) {
      reason = 'duplicate sequence';
    } else if (schemaVersion !== fixture.schemaVersion) {
      reason = 'schema version mismatch';
    } else if (!replayEventTypes.has(event.type)) {
      reason = 'unknown event type';
    } else if (!event.payload || typeof event.payload !== 'object') {
      reason = 'invalid payload';
    }

    if (reason) {
      quarantine.push({ eventId: event.id, sequence: event.sequence, reason });
      return;
    }

    seenSequences.add(event.sequence);
    validEvents.push(event);
  });

  const sortedEvents = [...validEvents].sort((a, b) => a.sequence - b.sequence);
  const missingSequences = [];
  const maxSequence = Math.max(0, ...fixture.events.map((event) => event.sequence || 0));
  for (let sequence = 1; sequence <= maxSequence; sequence += 1) {
    if (!seenSequences.has(sequence)) missingSequences.push(sequence);
  }

  return {
    validEvents: sortedEvents,
    quarantine,
    missingSequences,
    projections: projectRunEvents(sortedEvents),
  };
}

function projectRunEvents(events) {
  const runState = { status: 'pending', caseTitle: 'unseeded', survivorId: null, finalFitness: null };
  const agenomes = new Map();
  const candidates = new Map();
  const lineage = { edges: [], lastFusion: '' };
  const spend = { totalCostUsd: 0, energySpent: 0 };

  events.forEach((event) => {
    const payload = event.payload;
    if (event.type === 'run.created') {
      runState.status = payload.status;
      runState.budgetUsd = payload.budgetUsd;
    }
    if (event.type === 'case.seeded') {
      runState.caseTitle = payload.caseTitle;
    }
    if (event.type === 'agenome.spawned') {
      agenomes.set(payload.agenomeId, { id: payload.agenomeId, label: payload.label, energy: payload.energy });
    }
    if (event.type === 'candidate.created') {
      candidates.set(payload.candidateId, {
        id: payload.candidateId,
        title: payload.title,
        agenomeId: payload.agenomeId,
        status: payload.status,
        reviews: 0,
        fitness: null,
      });
    }
    if (event.type === 'energy.spent') {
      spend.totalCostUsd += payload.costUsd;
      spend.energySpent += payload.energy;
    }
    if (event.type === 'critic.completed') {
      const candidate = candidates.get(payload.candidateId);
      if (candidate) {
        candidate.reviews += 1;
        candidate.lastVerdict = payload.verdict;
      }
    }
    if (event.type === 'fusion.created') {
      payload.parentIds.forEach((parentId) => {
        lineage.edges.push({ from: parentId, to: payload.childAgenomeId });
      });
      lineage.lastFusion = payload.inheritance;
    }
    if (event.type === 'candidate.selected') {
      const candidate = candidates.get(payload.candidateId);
      if (candidate) {
        candidate.status = 'selected';
        candidate.fitness = payload.fitness;
      }
      runState.survivorId = payload.candidateId;
    }
    if (event.type === 'run.completed') {
      runState.status = payload.status;
      runState.survivorId = payload.survivorId;
      runState.finalFitness = payload.finalFitness;
    }
  });

  return {
    runState,
    lineage,
    spend,
    candidates: [...candidates.values()],
    agenomes: [...agenomes.values()],
  };
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

const prototypeStages = [
  {
    label: 'Seed',
    items: [
      { id: 'intake', label: 'Case intake' },
      { id: 'agenomes', label: 'Agenome pool' },
    ],
  },
  {
    label: 'Operate',
    items: [{ id: 'operator', label: 'Operator console' }],
  },
  {
    label: 'Route',
    items: [{ id: 'gateway', label: 'Gateway forge' }],
  },
  {
    label: 'Evolve',
    items: [
      { id: 'energy', label: 'Energy metabolism' },
      { id: 'fusion', label: 'Fusion lab' },
    ],
  },
  {
    label: 'Judge',
    items: [
      { id: 'critic', label: 'Critic council' },
      { id: 'subtype', label: 'Subtype checks' },
      { id: 'novelty', label: 'Novelty radar' },
    ],
  },
  {
    label: 'Explain',
    items: [
      { id: 'survivor', label: 'Survivor proof' },
      { id: 'fallback', label: 'Fallback ladder' },
      { id: 'replay', label: 'Replay spine' },
      { id: 'trace', label: 'Trace viewer' },
      { id: 'spend', label: 'Spend ledger' },
    ],
  },
];

const prototypeStageRows = [
  prototypeStages.slice(0, 4),
  prototypeStages.slice(4),
];

const prototypeTabStorageKey = 'doppl-prototype-suite.active-tab';
const prototypeTabIds = new Set(prototypeStages.flatMap((stage) => stage.items.map((item) => item.id)));
const prototypeCaseStudyLabels = {
  intake: 'Selectable case-study packets',
  agenomes: 'Superyacht Drone Privacy',
  operator: 'Superyacht Drone Privacy',
  gateway: 'Superyacht Drone Privacy',
  energy: 'Superyacht Drone Privacy',
  fusion: 'Superyacht Drone Privacy',
  critic: 'Superyacht Drone Privacy',
  subtype: 'Superyacht Drone Privacy',
  novelty: 'Superyacht Drone Privacy',
  survivor: 'Selectable terminal proof runs',
  fallback: 'Superyacht Drone Privacy',
  replay: 'Superyacht Drone Privacy',
  trace: 'Superyacht Drone Privacy',
  spend: 'Superyacht Drone Privacy',
};
const prototypeLabels = Object.fromEntries(
  prototypeStages.flatMap((stage) => stage.items.map((item) => [item.id, item.label])),
);

function getInitialPrototypeTab() {
  try {
    const savedTab = window.localStorage.getItem(prototypeTabStorageKey);
    return prototypeTabIds.has(savedTab) ? savedTab : 'intake';
  } catch {
    return 'intake';
  }
}

function App() {
  const [tab, setTab] = useState(getInitialPrototypeTab);

  useEffect(() => {
    try {
      window.localStorage.setItem(prototypeTabStorageKey, tab);
    } catch {
      // Ignore storage failures; tab navigation should still work.
    }
  }, [tab]);

  return (
    <PrototypeNavigationContext.Provider value={setTab}>
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
          <nav className="tabs process-tabs" aria-label="Prototype tabs by Doppl process stage">
            {prototypeStageRows.map((row, rowIndex) => (
              <div className="process-tab-row" key={`prototype-row-${rowIndex}`}>
                {row.map((stage) => (
                  <div className={`process-tab-stage item-count-${stage.items.length}`} key={stage.label}>
                    <span>{stage.label}</span>
                    <div>
                      {stage.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          aria-selected={tab === item.id}
                          onClick={() => setTab(item.id)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </nav>
        </header>

        <section className="prototype-context-strip" aria-label="Prototype case study context">
          <span>active prototype</span>
          <strong>{prototypeLabels[tab]}</strong>
          <span>case study</span>
          <strong>{prototypeCaseStudyLabels[tab] || 'Prototype fixture'}</strong>
        </section>

        {tab === 'intake' && <CaseStudyIntake />}
        {tab === 'agenomes' && <AgenomePool />}
        {tab === 'operator' && <OperatorConsole />}
        {tab === 'gateway' && <GatewayForge />}
        {tab === 'fusion' && <FusionLab />}
        {tab === 'survivor' && <FinalSurvivorProofPanel />}
        {tab === 'fallback' && <DemoFallbackLadder />}
        {tab === 'replay' && <ReplaySpine />}
        {tab === 'trace' && <TraceViewer trace={sampleTrace} />}
        {tab === 'spend' && <SpendLedgerView />}
        {tab === 'subtype' && <SubtypeCheckLab />}
        {tab === 'novelty' && <NoveltyRadar />}
        {(tab === 'energy' || tab === 'critic') && <FlowPrototype key={tab} kind={tab} onNavigate={setTab} />}
      </main>
    </PrototypeNavigationContext.Provider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
