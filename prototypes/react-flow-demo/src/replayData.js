export const replayBoundary = {
  upstreamModules: ['Runtime Kernel', 'Model Gateway', 'Verifier Council', 'Fusion / Mutation'],
  upstreamContracts: ['RunEventEnvelope', 'ModelGatewayResponse', 'CriticReview', 'FusionCreatedPayload'],
  downstreamContracts: ['RunStateProjection', 'LineageGraphProjection', 'SpendProjection', 'CandidateProjection'],
  downstreamModules: ['Trace Viewer', 'Spend Ledger', 'Final Survivor Proof Panel', 'Demo Fallback Ladder'],
  invariants: [
    'run_events is authoritative',
    'replay uses stored events only',
    'per-run sequence orders events',
    'invalid events are quarantined',
  ],
};

export const replayContractShapes = {
  ingress: [
    {
      name: 'RunEventEnvelope',
      anchor: 'ARCHITECTURE.md section 4 + Appendix A',
      fields: [
        ['id', 'string'],
        ['runId', 'string'],
        ['sequence', 'integer'],
        ['type', 'closed RunEventType'],
        ['schemaVersion', 'string'],
        ['occurredAt', 'ISO timestamp'],
        ['sourceModule', 'runtime | gateway | verifier | fusion | scorer'],
        ['payload', 'schema-valid event payload'],
      ],
    },
    {
      name: 'ReplayReadRequest',
      anchor: 'ARCHITECTURE.md section 9',
      fields: [
        ['runId', 'string'],
        ['fromSequence?', 'integer'],
        ['mode', 'live_fold | replay_fold'],
        ['allowFreshCalls', 'false'],
      ],
    },
  ],
  egress: [
    {
      name: 'ProjectionBundle',
      anchor: 'ARCHITECTURE.md section 9 + section 13',
      fields: [
        ['runState', 'RunStateProjection'],
        ['lineage', 'LineageGraphProjection'],
        ['spend', 'SpendProjection'],
        ['candidates', 'CandidateProjection[]'],
        ['quarantine', 'QuarantinedEvent[]'],
      ],
    },
    {
      name: 'ReplayEquivalenceReport',
      anchor: 'Prototype-local replay proof',
      fields: [
        ['canonicalHash.live', 'string'],
        ['canonicalHash.replay', 'string'],
        ['equivalent', 'boolean'],
        ['freshCallsDuringReplay', '0'],
      ],
    },
  ],
};

const cleanEvents = [
  {
    id: 'evt-001',
    sequence: 1,
    type: 'run.created',
    sourceModule: 'Runtime Kernel',
    occurredAt: '2026-06-18T21:00:00.000Z',
    payload: { runId: 'run-jack-privacy-042', status: 'running', budgetUsd: 2.5 },
  },
  {
    id: 'evt-002',
    sequence: 2,
    type: 'case.seeded',
    sourceModule: 'Case Study Intake',
    occurredAt: '2026-06-18T21:00:02.000Z',
    payload: {
      caseTitle: 'Superyacht Drone Privacy',
      agentVisibleRef: 'casepkt_jack_public_v3',
      evaluatorAnchorRef: 'eval_anchor_jack_private_v3',
    },
  },
  {
    id: 'evt-003',
    sequence: 3,
    type: 'agenome.spawned',
    sourceModule: 'Runtime Kernel',
    occurredAt: '2026-06-18T21:00:05.000Z',
    payload: { agenomeId: 'ag_breakthrough', label: 'Breakthrough', energy: 90 },
  },
  {
    id: 'evt-004',
    sequence: 4,
    type: 'agenome.spawned',
    sourceModule: 'Runtime Kernel',
    occurredAt: '2026-06-18T21:00:06.000Z',
    payload: { agenomeId: 'ag_blindside', label: 'Blindside', energy: 72 },
  },
  {
    id: 'evt-005',
    sequence: 5,
    type: 'candidate.created',
    sourceModule: 'Model Gateway',
    occurredAt: '2026-06-18T21:00:18.000Z',
    payload: {
      candidateId: 'cand_discreet_protocol',
      agenomeId: 'ag_breakthrough',
      title: 'Discreet Scene-Shift Protocol',
      status: 'under_review',
    },
  },
  {
    id: 'evt-006',
    sequence: 6,
    type: 'energy.spent',
    sourceModule: 'Model Gateway',
    occurredAt: '2026-06-18T21:00:19.000Z',
    payload: { agenomeId: 'ag_breakthrough', candidateId: 'cand_discreet_protocol', costUsd: 0.32, energy: 11 },
  },
  {
    id: 'evt-007',
    sequence: 7,
    type: 'critic.completed',
    sourceModule: 'Verifier Council',
    occurredAt: '2026-06-18T21:00:36.000Z',
    payload: {
      candidateId: 'cand_discreet_protocol',
      critic: 'Feasibility Critic',
      verdict: 'pass',
      score: 88,
    },
  },
  {
    id: 'evt-008',
    sequence: 8,
    type: 'candidate.created',
    sourceModule: 'Model Gateway',
    occurredAt: '2026-06-18T21:00:48.000Z',
    payload: {
      candidateId: 'cand_signal_decoy',
      agenomeId: 'ag_blindside',
      title: 'Signal Decoy Watch Pattern',
      status: 'under_review',
    },
  },
  {
    id: 'evt-009',
    sequence: 9,
    type: 'fusion.created',
    sourceModule: 'Fusion / Mutation',
    occurredAt: '2026-06-18T21:01:12.000Z',
    payload: {
      childAgenomeId: 'ag_protocol_skeptic',
      parentIds: ['ag_breakthrough', 'ag_blindside'],
      inheritance: '66% breakthrough protocol, 34% blindside failure sensing',
    },
  },
  {
    id: 'evt-010',
    sequence: 10,
    type: 'candidate.selected',
    sourceModule: 'Selection / Scoring',
    occurredAt: '2026-06-18T21:01:38.000Z',
    payload: {
      candidateId: 'cand_discreet_protocol',
      reason: 'Best feasibility and privacy-preserving evidence after critic pass.',
      fitness: 91,
    },
  },
  {
    id: 'evt-011',
    sequence: 11,
    type: 'run.completed',
    sourceModule: 'Runtime Kernel',
    occurredAt: '2026-06-18T21:01:45.000Z',
    payload: { status: 'completed', survivorId: 'cand_discreet_protocol', finalFitness: 91 },
  },
];

const faultEvents = cleanEvents.map((event) => ({ ...event, payload: { ...event.payload } }));

faultEvents.splice(7, 0, {
  id: 'evt-007b',
  sequence: 7,
  type: 'critic.completed',
  sourceModule: 'Verifier Council',
  occurredAt: '2026-06-18T21:00:41.000Z',
  payload: {
    candidateId: 'cand_discreet_protocol',
    critic: 'Novelty Critic',
    verdict: 'pass',
    score: 82,
  },
});

faultEvents.splice(9, 1);

faultEvents.push({
  id: 'evt-012',
  sequence: 12,
  type: 'candidate.selected',
  sourceModule: 'Selection / Scoring',
  occurredAt: '2026-06-18T21:01:50.000Z',
  schemaVersion: '2026-05-legacy',
  payload: {
    candidateId: 'cand_signal_decoy',
    reason: 'Legacy fixture with stale schema version.',
    fitness: 84,
  },
});

export const replayFixtures = [
  {
    id: 'clean',
    label: 'Healthy replay',
    runId: 'run-jack-privacy-042',
    schemaVersion: '2026-06-run-events-v1',
    description: 'Ordered event fixture with projection parity between live fold and replay fold.',
    events: cleanEvents,
  },
  {
    id: 'fault',
    label: 'Fault inspection',
    runId: 'run-jack-privacy-042',
    schemaVersion: '2026-06-run-events-v1',
    description: 'Duplicate sequence, missing event, and stale schema are quarantined instead of guessed.',
    events: faultEvents,
  },
];

export const replayEventTypes = new Set([
  'run.created',
  'case.seeded',
  'agenome.spawned',
  'candidate.created',
  'energy.spent',
  'critic.completed',
  'fusion.created',
  'candidate.selected',
  'run.completed',
]);
