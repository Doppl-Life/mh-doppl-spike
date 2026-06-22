import test from 'node:test';
import assert from 'node:assert/strict';
import type { KnowledgeGateway, SeedFixture } from '../src/contracts/index.ts';
import { buildRunTrace } from '../src/trace.ts';
import { buildSnapshot, renderBoard } from './run.ts';

const fixture: SeedFixture = {
  seed: {
    id: 'fsd-ownership-unwind',
    title: 'FSD ownership unwind',
    prompt: 'Find ownership effects.',
    thesis: 'Autonomy changes ownership.',
    goals: ['show memory in proof board'],
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
      id: 'sp-memory-proof',
      operatorId: 'hidden-dependent',
      candidateId: 'candidate-memory-proof',
      title: 'Memory proof candidate',
      substrate: 'crash events',
      mechanism: 'Accident removal changes ownership demand.',
      candidate: {
        title: 'Ownership shifts after crash collapse',
        thesis: 'Removing crash risk changes insurance, repair, and ownership incentives.',
      },
      delta: {
        summary: 'Moved from ownership to accident-dependent incentives.',
        changes: ['ownership -> crash-dependent incentive stack'],
      },
      claims: ['Crash-dependent costs influence ownership.'],
      evidence: ['source fixture'],
      metrics: {
        sourceAbsence: 0.7,
        substrateDistance: 0.7,
        hiddenDependents: 0.7,
        signalStrength: 0.8,
        mechanismClarity: 0.8,
        falsifiability: 0.7,
        riskPenalty: 0.1,
      },
    },
  ],
};

const gateway: KnowledgeGateway = {
  selectPacket(request) {
    return {
      id: 'packet-fsd',
      request,
      items: [
        {
          recordId: 'ks_accident_prior',
          citeHandle: 'KACCID',
          kind: 'warning',
          text: 'Accident economy prior.',
          sourceCase: 'fsd-accident-economy',
          citation: 'case-studies/fsd-accident-economy/problem-statement.md:15-19',
          trustTier: 'candidate',
          visibility: 'public',
        },
      ],
      excluded: [
        {
          recordId: 'ks_withheld',
          reason: 'withheld from candidate-producing role',
          visibility: 'withheld_evaluator',
        },
      ],
    };
  },
};

test('proof board summary exposes memory packet, citations, injections, exclusions, and replay proof', () => {
  const liveTrace = buildRunTrace(fixture, 'diverge', {
    runId: 'run-summary-test',
    memoryMode: 'auto',
    knowledgeGateway: gateway,
  });
  const replayTrace = buildRunTrace(fixture, 'diverge', {
    runId: 'run-summary-test',
    memoryMode: 'auto',
    replayEvents: liveTrace.events,
    knowledgeGateway: {
      selectPacket() {
        throw new Error('replay must not call gateway');
      },
    },
  });
  const snapshot = buildSnapshot([replayTrace]);

  assert.equal(snapshot.cases[0].memoryMode, 'auto');
  assert.equal(snapshot.cases[0].knowledgePacketId, 'packet-fsd');
  assert.deepEqual(snapshot.cases[0].citationHandles, ['KACCID']);
  assert.deepEqual(snapshot.cases[0].memoryRecipients, ['candidate']);
  assert.equal(snapshot.cases[0].exclusions, 1);
  assert.equal(snapshot.cases[0].freshKnowledgeRetrievals, 0);

  const board = renderBoard(snapshot);
  assert.match(board, /memory/);
  assert.match(board, /packet-fsd/);
  assert.match(board, /KACCID/);
  assert.match(board, /fresh retrievals 0/);
});
