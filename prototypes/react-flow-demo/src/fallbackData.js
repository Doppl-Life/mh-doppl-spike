export const fallbackBoundary = {
  upstreamModules: ['Operator Console', 'Replay Spine', 'Model Gateway', 'Runtime Health'],
  upstreamContracts: ['RunConfig', 'RunCaps', 'HealthProjection', 'ReplayFixtureMetadata'],
  downstreamContracts: ['DemoModeState', 'FallbackDecisionEvent', 'RunCommand', 'ReplayReadRequest'],
  downstreamModules: ['Operator Console', 'Dashboard Mode Indicator', 'Trace Viewer', 'Final Survivor Proof Panel'],
  invariants: [
    'fallback is operator-driven',
    'replay is explicitly labeled',
    'switching rungs appends events instead of rewriting history',
    'low-cap live overrides can only lower caps',
    'providers and Langfuse may be unavailable at boot',
  ],
};

export const fallbackContractShapes = {
  ingress: [
    {
      name: 'HealthProjection',
      anchor: 'GET /runs/:id/health',
      fields: [
        ['providerHealth', 'healthy | degraded | failing'],
        ['eventLagMs', 'integer'],
        ['schemaRejects', 'integer'],
        ['gatewayQueueDepth', 'integer'],
        ['fallbackAvailable', 'boolean'],
      ],
    },
    {
      name: 'ReplayFixtureMetadata',
      anchor: 'Demo fallback fixture manifest',
      fields: [
        ['fixtureId', 'string'],
        ['runId', 'string'],
        ['schemaVersion', 'string'],
        ['eventCount', 'integer'],
        ['provenance', 'committed_fixture | generated_fixture'],
      ],
    },
  ],
  egress: [
    {
      name: 'DemoModeState',
      anchor: 'Dashboard mode indicator',
      fields: [
        ['mode', 'low_cap_live | prepared_run | labeled_replay'],
        ['label', 'string shown in UI'],
        ['reason', 'operator-authored string'],
        ['freshCallsAllowed', 'boolean'],
        ['audienceDisclosure', 'string'],
      ],
    },
    {
      name: 'FallbackDecisionEvent',
      anchor: 'run_events append-only demo control event',
      fields: [
        ['type', 'fallback.selected | fallback.rehearsal_passed | fallback.replay_started'],
        ['runId', 'string'],
        ['fromMode', 'DemoModeState.mode'],
        ['toMode', 'DemoModeState.mode'],
        ['decisionReason', 'string'],
        ['requestedBy', 'operator'],
      ],
    },
  ],
};

export const fallbackRungs = [
  {
    id: 'live',
    mode: 'low_cap_live',
    label: 'Low-cap live',
    eyebrow: 'honest live mode',
    headline: 'Providers are online, but caps are intentionally tiny.',
    status: 'ready',
    freshCallsAllowed: true,
    disclosure: 'Live run with hard caps. If provider health drops, switch rungs explicitly.',
    health: {
      provider: 'healthy',
      gatewayQueue: 2,
      eventLagMs: 310,
      schemaRejects: 0,
      langfuse: 'optional offline',
    },
    caps: {
      populationCap: 3,
      generationCap: 1,
      energyBudget: 120,
      wallClockMinutes: 5,
      toolCallCap: 12,
    },
    allowedActions: [
      'start low-cap run',
      'stop run',
      'lower caps only',
      'switch to prepared run',
      'switch to labeled replay',
    ],
  },
  {
    id: 'prepared',
    mode: 'prepared_run',
    label: 'Prepared run',
    eyebrow: 'known-good fixture',
    headline: 'Use a rehearsed fixture when live timing gets risky.',
    status: 'fallback',
    freshCallsAllowed: false,
    disclosure: 'Prepared run selected by operator. Events are committed fixture data, not fresh provider calls.',
    health: {
      provider: 'degraded',
      gatewayQueue: 0,
      eventLagMs: 0,
      schemaRejects: 1,
      langfuse: 'unavailable',
    },
    caps: {
      populationCap: 3,
      generationCap: 2,
      energyBudget: 240,
      wallClockMinutes: 0,
      toolCallCap: 0,
    },
    allowedActions: [
      'announce prepared mode',
      'open trace viewer',
      'show gateway reject',
      'continue to replay proof',
    ],
  },
  {
    id: 'replay',
    mode: 'labeled_replay',
    label: 'Labeled replay',
    eyebrow: 'stored events only',
    headline: 'Walk the audience through proof when providers fail.',
    status: 'replay',
    freshCallsAllowed: false,
    disclosure: 'Replay mode. No models, retrieval, embeddings, tools, or RNG are called.',
    health: {
      provider: 'failing',
      gatewayQueue: 0,
      eventLagMs: 0,
      schemaRejects: 0,
      langfuse: 'unavailable',
    },
    caps: {
      populationCap: 0,
      generationCap: 0,
      energyBudget: 0,
      wallClockMinutes: 0,
      toolCallCap: 0,
    },
    allowedActions: [
      'announce replay mode',
      'fold events from Replay Spine',
      'inspect trace atoms',
      'show final survivor proof',
    ],
  },
];

export const fallbackRehearsals = [
  {
    id: 'boot',
    label: 'Boot without providers',
    statusByRung: { live: 'warn', prepared: 'pass', replay: 'pass' },
    detail: 'Hosted providers and Langfuse can be absent without blocking local demo boot.',
  },
  {
    id: 'provider_failure',
    label: 'Provider failure drill',
    statusByRung: { live: 'fail', prepared: 'pass', replay: 'pass' },
    detail: 'The operator can leave live mode before a timeout destroys the room-facing flow.',
  },
  {
    id: 'event_truth',
    label: 'Event truth proof',
    statusByRung: { live: 'pass', prepared: 'pass', replay: 'pass' },
    detail: 'Every rung appends visible control events and preserves earlier run history.',
  },
  {
    id: 'audience_label',
    label: 'Audience label check',
    statusByRung: { live: 'pass', prepared: 'pass', replay: 'pass' },
    detail: 'The top-level mode label never disguises fixture or replay state as live.',
  },
];

export function buildFallbackEvents(activeRungId) {
  const activeIndex = Math.max(0, fallbackRungs.findIndex((rung) => rung.id === activeRungId));
  const selected = fallbackRungs[activeIndex];
  const events = [
    {
      sequence: 1,
      type: 'demo.boot_checked',
      source: 'Demo Fallback Ladder',
      detail: 'Local demo boot confirmed with hosted providers optional.',
    },
    {
      sequence: 2,
      type: 'run.configured',
      source: 'Operator Console',
      detail: 'Low-cap RunConfig staged with caps below default production settings.',
    },
  ];

  if (activeIndex >= 1) {
    events.push({
      sequence: 3,
      type: 'fallback.selected',
      source: 'Operator Console',
      detail: 'Operator selected prepared run because provider health degraded.',
    });
  }

  if (activeIndex >= 2) {
    events.push({
      sequence: 4,
      type: 'fallback.replay_started',
      source: 'Replay Spine',
      detail: 'Operator switched to labeled replay; fresh calls disabled.',
    });
  }

  events.push({
    sequence: activeIndex + 3,
    type: 'demo.mode_state_emitted',
    source: 'Dashboard Mode Indicator',
    detail: `${selected.label} displayed with audience disclosure.`,
  });

  return events;
}
