import type { RunTrace } from './contracts/index.ts';

function selectedIds(trace: RunTrace, side: 'focus' | 'alternate'): string {
  return trace.comparison[side].selected.map((candidate) => `${candidate.id} ${candidate.title}`).join('; ');
}

function titleFor(trace: RunTrace, id: string): string {
  const candidates = [
    ...trace.comparison.focus.selected,
    ...trace.comparison.focus.rejected,
    ...trace.comparison.alternate.selected,
    ...trace.comparison.alternate.rejected,
  ];
  const candidate = candidates.find((item) => item.id === id);
  return candidate ? `${candidate.id} ${candidate.title}` : id;
}

function changedByDial(trace: RunTrace): string {
  const replaced = trace.comparison.contrasts.filter((contrast) => contrast.status === 'replaced');
  if (!replaced.length) return 'none';
  return replaced.map((contrast) => `${titleFor(trace, contrast.selectedId)} -> ${titleFor(trace, contrast.alternateId)}`).join('; ');
}

function stableAcrossDials(trace: RunTrace): string {
  const stable = trace.comparison.contrasts.filter((contrast) => contrast.status === 'stable');
  if (!stable.length) return 'none';
  return stable.map((contrast) => titleFor(trace, contrast.selectedId)).join('; ');
}

function failedChecks(trace: RunTrace): string {
  const failed = trace.goalChecks.filter((check) => !check.passed);
  if (!failed.length) return 'none';
  return failed.map((check) => check.id).join(', ');
}

function verdict(trace: RunTrace): string {
  const passed = trace.goalChecks.filter((check) => check.passed).length;
  return failedChecks(trace) === 'none' ? `PASS (${passed}/${trace.goalChecks.length})` : `FAIL (${passed}/${trace.goalChecks.length})`;
}

export function renderDigest(trace: RunTrace): string {
  const focus = trace.comparison.focus.schedule.dial;
  const alternate = trace.comparison.alternate.schedule.dial;
  return [
    '# Kernel Digest',
    `Run: ${trace.runId}`,
    `Verdict: ${verdict(trace)}`,
    `Input: ${trace.seed.title}; shared pool=${trace.candidateCount}`,
    `${focus}: kept [${selectedIds(trace, 'focus')}]`,
    `${alternate}: kept [${selectedIds(trace, 'alternate')}]`,
    `Changed by dial: ${changedByDial(trace)}`,
    `Stable across dials: ${stableAcrossDials(trace)}`,
    `Failed checks: ${failedChecks(trace)}`,
    'Boundary path: fixture -> generate -> fitness -> select -> digest/report/trace -> human',
    'Stop here unless a line surprises you; drill down with run-report.md or run-trace.json.',
    '',
  ].join('\n');
}

export function renderConsoleDigest(trace: RunTrace): string {
  const focus = trace.comparison.focus.schedule.dial;
  const alternate = trace.comparison.alternate.schedule.dial;
  return [
    `kernel ${focus}: ${verdict(trace)}; pool=${trace.candidateCount}`,
    `${focus}: [${selectedIds(trace, 'focus')}]`,
    `${alternate}: [${selectedIds(trace, 'alternate')}]`,
    `changed: ${changedByDial(trace)}`,
    `stable: ${stableAcrossDials(trace)}`,
    `failed: ${failedChecks(trace)}`,
  ].join('\n');
}
