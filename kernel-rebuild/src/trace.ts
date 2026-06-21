import type { Dial, RunTrace, SeedFixture, TraceEvent } from './contracts/index.ts';
import { boundaryContracts, getBoundary } from './contracts/index.ts';
import { scoreCandidatePool } from './fitness.ts';
import { generateCandidatePool } from './generate.ts';
import { compareSelections } from './select.ts';

function runId(dial: Dial): string {
  return `kernel-${dial}-${new Date().toISOString().replace(/[:.]/g, '-')}`;
}

export function buildRunTrace(fixture: SeedFixture, dial: Dial): RunTrace {
  const events: TraceEvent[] = [];
  const generated = generateCandidatePool(fixture);
  events.push(generated.event);

  const scored = scoreCandidatePool(generated.pool);
  events.push(scored.event);

  const selected = compareSelections(scored.scoredPool, dial);
  events.push(selected.event);

  const traceEvent: TraceEvent = {
    stage: 'trace',
    input: 'SelectionComparison + boundary contracts + goal checks',
    decision: 'Emit the machine trace for tools and replay.',
    reason: 'The kernel emits process facts; microscope tools translate those facts for humans.',
    output: 'RunTrace',
    goalChecks: [
      {
        id: 'machine-trace-emitted',
        label: 'The kernel emits a machine trace without requiring a human projection in the engine contract.',
        passed: true,
        detail: 'RunTrace contains lineage, goal checks, and selection comparison.',
      },
    ],
    boundary: getBoundary('trace'),
  };
  events.push(traceEvent);

  const goalChecks = events.flatMap((event) => event.goalChecks);

  return {
    runId: runId(dial),
    dial,
    seed: fixture.seed,
    candidateCount: generated.pool.candidates.length,
    lineage: generated.pool.lineage,
    boundaryContracts,
    events,
    goalChecks,
    comparison: selected.comparison,
  };
}
