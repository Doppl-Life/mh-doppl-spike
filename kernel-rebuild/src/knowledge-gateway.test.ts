import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createJsonKnowledgeGateway } from './knowledge-gateway.ts';

test('JSON knowledge gateway adapts knowledge-space packet exports into kernel packets', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'kernel-knowledge-gateway-'));
  const packetPath = path.join(dir, 'knowledge_packets_by_case.json');
  await writeFile(
    packetPath,
    JSON.stringify({
      'fsd-ownership-unwind': {
        request: {
          target_case: 'fsd-ownership-unwind',
          max_items: 2,
        },
        items: [
          {
            cite_handle: 'KACCID',
            record_id: 'ks_accident_prior',
            record: {
              id: 'ks_accident_prior',
              kind: 'warning',
              text: 'Do not miss the accident-dependent economy prior.',
              source_case: 'fsd-accident-economy',
              trust_tier: 'candidate',
              visibility: 'public',
            },
            citation: 'case-studies/fsd-accident-economy/problem-statement.md:15-19',
          },
        ],
        excluded: [
          {
            record_id: 'ks_withheld',
            reason: 'withheld from candidate-producing role',
            visibility: 'withheld_evaluator',
          },
        ],
      },
    }),
    'utf8',
  );

  const gateway = await createJsonKnowledgeGateway(packetPath);
  const packet = gateway.selectPacket({
    requestId: 'kreq-adapter',
    runId: 'run-adapter',
    targetCase: 'fsd-ownership-unwind',
    problemSummary: 'Find ownership effects.',
    memoryMode: 'auto',
    role: 'candidate',
    maxItems: 1,
  });

  assert.equal(packet.id, 'packet:run-adapter:fsd-ownership-unwind');
  assert.equal(packet.request.requestId, 'kreq-adapter');
  assert.equal(packet.items[0].citeHandle, 'KACCID');
  assert.equal(packet.items[0].recordId, 'ks_accident_prior');
  assert.equal(packet.items[0].sourceCase, 'fsd-accident-economy');
  assert.equal(packet.excluded[0].reason, 'withheld from candidate-producing role');
});
