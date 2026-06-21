import type { CandidatePool, SeedFixture, TraceEvent } from './contracts/index.ts';
import { getBoundary } from './contracts/index.ts';

export function generateCandidatePool(fixture: SeedFixture): {
  pool: CandidatePool;
  event: TraceEvent;
} {
  const pool = {
    seed: fixture.seed,
    candidates: fixture.candidates.map((candidate) => ({
      ...candidate,
      parentId: candidate.parentId || fixture.seed.id,
    })),
  };

  return {
    pool,
    event: {
      stage: 'generate',
      input: `${fixture.seed.id}: ${fixture.seed.title}`,
      decision: `Loaded ${pool.candidates.length} fixture candidates from one shared seed.`,
      reason: 'The first kernel slice isolates selection, so generation is deterministic fixture I/O.',
      output: `CandidatePool(${pool.candidates.map((candidate) => candidate.id).join(', ')})`,
      goalChecks: [
        {
          id: 'shared-pool',
          label: 'One shared candidate pool exists before dial-specific selection.',
          passed: pool.candidates.length > 0,
          detail: `${pool.candidates.length} candidates are available to both dials.`,
        },
      ],
      boundary: getBoundary('generate'),
    },
  };
}
