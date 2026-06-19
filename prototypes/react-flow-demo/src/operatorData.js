import { defaultStartingPool } from './agenomePoolData.js';

export const operatorBoundary = {
  upstreamModules: ['Case Study Intake', 'Agenome Pool', 'Operator Run Config'],
  upstreamContracts: ['RunConfig.seed', 'RunConfig.startingPopulation', 'RunCaps', 'RunMode'],
  downstreamContracts: ['RunCommand', 'RunStateProjection', 'RunEventEnvelope', 'HealthProjection'],
  downstreamModules: ['Runtime Kernel', 'Gateway Forge', 'Energy Metabolism', 'Replay Spine'],
  invariants: [
    'caps fail closed before run start',
    'operator commands append events, not hidden state',
    'candidate text and scores are read-only from console',
    'kill switch is available during active runs',
  ],
};

export const operatorContractShapes = {
  ingress: [
    {
      name: 'RunConfig',
      anchor: 'ARCHITECTURE.md sections 5, 8, 10',
      fields: [
        ['caseId', 'string'],
        ['startingPopulation', 'agenome ids'],
        ['mode', 'live | replay | fallback'],
        ['caps', 'RunCaps'],
        ['scoringPolicyVersion', 'string'],
      ],
    },
    {
      name: 'RunCommand',
      anchor: 'Backend API command surface',
      fields: [
        ['type', 'create_run | pause_run | stop_run | kill_run | switch_fallback'],
        ['runId?', 'string'],
        ['idempotencyKey', 'string'],
        ['requestedBy', 'operator'],
      ],
    },
  ],
  egress: [
    {
      name: 'RunStateProjection',
      anchor: 'Derived from run_events only',
      fields: [
        ['status', 'configured | running | paused | stopped | killed | completed'],
        ['generation', 'integer'],
        ['activeAgenomes', 'integer'],
        ['queuedGatewayCalls', 'integer'],
        ['lastEvent', 'RunEventEnvelope summary'],
      ],
    },
    {
      name: 'HealthProjection',
      anchor: 'GET /runs/:id/health',
      fields: [
        ['providerHealth', 'healthy | degraded | failing'],
        ['eventLagMs', 'integer'],
        ['schemaRejects', 'integer'],
        ['fallbackAvailable', 'boolean'],
      ],
    },
  ],
};

export const operatorCasePresets = [
  { id: 'jack-superyacht-drone', title: 'Superyacht Drone Privacy', readiness: 92 },
  { id: 'loft-insulation-adoption', title: 'Loft Insulation Adoption Failure', readiness: 88 },
  { id: 'heinz-ketchup-authenticity', title: 'Heinz Ketchup Authenticity', readiness: 86 },
];

export const operatorPoolPresets = [
  {
    id: 'balanced',
    title: 'Balanced Explorer',
    agenomeIds: defaultStartingPool,
    note: 'General starting pool with decomposition, constraints, cross-domain transfer, and synthesis.',
  },
  {
    id: 'novelty',
    title: 'Novelty Pressure',
    agenomeIds: ['breakout', 'blindside', 'polymath', 'breakthrough'],
    note: 'Higher variance pool for cases where obvious answers are likely to plateau.',
  },
  {
    id: 'safe',
    title: 'Constraint Heavy',
    agenomeIds: ['first-principles', 'constraint-injection', 'addition-by-subtraction'],
    note: 'Lower-risk pool for live demos that need feasibility and bounded spend.',
  },
];

export const defaultRunCaps = {
  populationCap: 4,
  generationCap: 3,
  energyBudget: 350,
  wallClockMinutes: 12,
  toolCallCap: 40,
  repairAttempts: 1,
};

export const operatorModes = [
  { id: 'live', label: 'Live', detail: 'real gateway calls with hard caps' },
  { id: 'replay', label: 'Replay', detail: 'stored events only' },
  { id: 'fallback', label: 'Fallback', detail: 'prepared run fixture' },
];

export function validateRunCaps(caps) {
  const warnings = [];
  if (caps.populationCap < 3) warnings.push('Population cap must be at least 3.');
  if (caps.populationCap > 7) warnings.push('Population cap exceeds prototype safety limit.');
  if (caps.generationCap < 1) warnings.push('Generation cap must be at least 1.');
  if (caps.energyBudget < 120) warnings.push('Energy budget is too low for critic and repair coverage.');
  if (caps.wallClockMinutes < 4) warnings.push('Wall-clock cap is too short for a visible run.');
  if (caps.toolCallCap < caps.populationCap * 3) warnings.push('Tool cap is lower than basic generation + review coverage.');
  if (caps.repairAttempts !== 1) warnings.push('Structured-output repair attempts must remain fixed at 1.');
  return warnings;
}

export function buildOperatorEvents(status, mode) {
  const base = [
    { type: 'run.configured', source: 'Operator Console', detail: 'RunConfig validated and staged.' },
    { type: 'run.started', source: 'Runtime Kernel', detail: 'Generation 0 agenomes spawned.' },
  ];
  if (mode === 'fallback') {
    base.push({ type: 'fallback.selected', source: 'Operator Console', detail: 'Prepared fixture selected explicitly.' });
  }
  if (status === 'running') {
    base.push(
      { type: 'gateway.call_queued', source: 'Model Gateway', detail: 'Candidate generation calls in flight.' },
      { type: 'energy.spent', source: 'Energy Metabolism', detail: 'Productive spend recorded.' },
    );
  }
  if (status === 'paused') base.push({ type: 'run.paused', source: 'Runtime Kernel', detail: 'Pause accepted at generation boundary.' });
  if (status === 'stopped') base.push({ type: 'run.stopped', source: 'Runtime Kernel', detail: 'Stop command idempotently closed the run.' });
  if (status === 'killed') base.push({ type: 'run.killed', source: 'Runtime Kernel', detail: 'Kill switch terminated active work.' });
  return base;
}
