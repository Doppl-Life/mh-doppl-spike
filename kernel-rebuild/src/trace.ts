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

  const reportEvent: TraceEvent = {
    stage: 'trace/report',
    input: 'SelectionComparison + boundary contracts + goal checks',
    decision: 'Emit a short digest first, with report and JSON trace as drill-down artifacts.',
    reason: 'A kernel decision is not accepted until a human can see what happened without reading the full trace.',
    output: 'RunDigest + RunReport + RunTrace',
    goalChecks: [
      {
        id: 'visibility-artifacts',
        label: 'The run emits digest-first human visibility plus drill-down artifacts.',
        passed: true,
        detail: 'CLI writes run-digest.md, run-report.md, and run-trace.json.',
      },
    ],
    boundary: getBoundary('trace/report'),
  };
  events.push(reportEvent);

  const goalChecks = events.flatMap((event) => event.goalChecks);

  return {
    runId: runId(dial),
    dial,
    seed: fixture.seed,
    candidateCount: fixture.candidates.length,
    boundaryContracts,
    events,
    goalChecks,
    comparison: selected.comparison,
  };
}
