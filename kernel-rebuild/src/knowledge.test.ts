import test from 'node:test';
import assert from 'node:assert/strict';
import type { KnowledgeGateway, SeedFixture } from './contracts/index.ts';
import { buildRunTrace } from './trace.ts';

const fixture: SeedFixture = {
  seed: {
    id: 'seed-fsd-memory',
    title: 'FSD memory integration',
    prompt: 'Find second-order effects of full self-driving.',
    thesis: 'Autonomy removes crash and driver substrates.',
    goals: ['use prior memory before generation'],
  },
  asOf: '2026-06-22',
  operators: [
    {
      id: 'hidden-dependent',
      label: 'Hidden dependent',
      description: 'Find dependent markets.',
      defaultSubtype: 'zeitgeist_synthesis',
    },
  ],
  sourcePackets: [
    {
      id: 'sp-memory-1',
      operatorId: 'hidden-dependent',
      candidateId: 'candidate-memory-1',
      title: 'Insurance substrate',
      substrate: 'crash events',
      mechanism: 'Accident removal changes insurance, repair, and legal demand.',
      candidate: {
        title: 'Accident economy dries up',
        thesis: 'Removing human crash risk also removes the businesses organized around crash volume.',
      },
      delta: {
        summary: 'Moved from safety to crash-dependent markets.',
        changes: ['safety -> accident substrate'],
      },
      claims: ['Crash-dependent businesses shrink.'],
      evidence: ['source fixture'],
      metrics: {
        sourceAbsence: 0.6,
        substrateDistance: 0.7,
        hiddenDependents: 0.8,
        signalStrength: 0.8,
        mechanismClarity: 0.8,
        falsifiability: 0.7,
        riskPenalty: 0.1,
      },
    },
  ],
};

function gateway(): KnowledgeGateway {
  return {
    selectPacket(request) {
      return {
        id: `packet-${request.runId}`,
        request,
        items: [
          {
            recordId: 'ks_prior_accident',
            citeHandle: 'KACCID',
            kind: 'warning',
            text: 'Do not frame the FSD crash collapse as only safer roads; model the accident-dependent economy.',
            sourceCase: 'fsd-accident-economy',
            citation: 'case-studies/fsd-accident-economy/problem-statement.md:15-19',
            trustTier: 'candidate',
            visibility: 'public',
          },
        ],
        excluded: [],
      };
    },
  };
}

test('buildRunTrace selects and injects a knowledge packet before generation', () => {
  const trace = buildRunTrace(fixture, 'diverge', {
    runId: 'run-memory-live',
    memoryMode: 'auto',
    knowledgeGateway: gateway(),
  });

  assert.equal(trace.memoryMode, 'auto');
  assert.equal(trace.knowledgePacket?.items[0].citeHandle, 'KACCID');

  const eventTypes = trace.events.map((event) => event.type);
  assert.deepEqual(eventTypes.slice(0, 4), [
    'run.configured',
    'knowledge.packet_requested',
    'knowledge.packet_selected',
    'knowledge.item_injected',
  ]);

  assert.equal(trace.events[1].payload?.memory_mode, 'auto');
  assert.equal(trace.events[2].payload?.items?.[0]?.cite_handle, 'KACCID');
  assert.equal(trace.events[3].payload?.recipient_role, 'candidate');

  const generated = trace.comparison.focus.selected[0] || trace.comparison.focus.rejected[0];
  assert.ok(generated.knowledgeContext);
  assert.deepEqual(generated.knowledgeContext?.citeHandles, ['KACCID']);
  assert.ok(generated.evidence.some((item) => item.includes('[KACCID]')));

  const influence = trace.events.find((event) => (
    event.type === 'knowledge.influence_recorded' &&
    event.payload?.artifact_id === generated.id
  ));
  assert.ok(influence);
  assert.equal(influence.payload?.packet_id, trace.knowledgePacket?.id);
  assert.equal(influence.payload?.record_id, 'ks_prior_accident');
  assert.equal(influence.payload?.cite_handle, 'KACCID');
  assert.equal(influence.payload?.artifact_id, generated.id);
  assert.equal(influence.payload?.influence, 'cited');

  const survivor = trace.comparison.focus.selected.find((candidate) => (
    candidate.evidence.some((item) => item.includes('[KACCID]'))
  ));
  assert.ok(survivor);
  const credit = trace.events.find((event) => (
    event.type === 'knowledge.credit_recorded' &&
    event.payload?.artifact_id === survivor.id
  ));
  assert.ok(credit);
  assert.equal(credit.payload?.record_id, 'ks_prior_accident');
  assert.equal(credit.payload?.cite_handle, 'KACCID');
  assert.equal(credit.payload?.selection_status, 'selected');
  assert.equal(credit.payload?.credit, 'positive');
  assert.equal(typeof credit.payload?.novelty, 'number');
  assert.equal(typeof credit.payload?.grounding, 'number');
});

test('memoryMode off emits no packet and does not call the gateway', () => {
  let calls = 0;
  const trace = buildRunTrace(fixture, 'diverge', {
    runId: 'run-memory-off',
    memoryMode: 'off',
    knowledgeGateway: {
      selectPacket() {
        calls += 1;
        throw new Error('gateway should not be called when memory is off');
      },
    },
  });

  assert.equal(calls, 0);
  assert.equal(trace.memoryMode, 'off');
  assert.equal(trace.knowledgePacket, undefined);
  assert.equal(trace.events.some((event) => event.type?.startsWith('knowledge.')), false);
});

test('memoryMode pinned injects the provided packet without gateway retrieval', () => {
  const pinnedPacket = gateway().selectPacket({
    requestId: 'kreq:pinned',
    runId: 'run-memory-pinned',
    targetCase: fixture.seed.id,
    problemSummary: fixture.seed.prompt,
    memoryMode: 'pinned',
    role: 'candidate',
    maxItems: 1,
  });

  const trace = buildRunTrace(fixture, 'diverge', {
    runId: 'run-memory-pinned',
    memoryMode: 'pinned',
    pinnedKnowledgePacket: pinnedPacket,
    knowledgeGateway: {
      selectPacket() {
        throw new Error('pinned memory must not call live gateway');
      },
    },
  });

  assert.equal(trace.memoryMode, 'pinned');
  assert.equal(trace.knowledgePacket?.id, pinnedPacket.id);
  assert.equal(trace.events.find((event) => event.type === 'knowledge.packet_selected')?.payload?.packet_id, pinnedPacket.id);
});

test('replay reuses persisted knowledge packet events without fresh gateway retrieval', () => {
  const liveTrace = buildRunTrace(fixture, 'diverge', {
    runId: 'run-memory-replay',
    memoryMode: 'auto',
    knowledgeGateway: gateway(),
  });

  const replayed = buildRunTrace(fixture, 'diverge', {
    runId: 'run-memory-replay',
    memoryMode: 'auto',
    replayEvents: liveTrace.events,
    knowledgeGateway: {
      selectPacket() {
        throw new Error('replay must not call knowledge gateway');
      },
    },
  });

  assert.equal(replayed.knowledgePacket?.id, liveTrace.knowledgePacket?.id);
  assert.deepEqual(
    replayed.events.filter((event) => event.type?.startsWith('knowledge.')).map((event) => event.payload),
    liveTrace.events.filter((event) => event.type?.startsWith('knowledge.')).map((event) => event.payload),
  );
  assert.ok(replayed.goalChecks.find((check) => check.id === 'replay-uses-persisted-knowledge')?.passed);
});
