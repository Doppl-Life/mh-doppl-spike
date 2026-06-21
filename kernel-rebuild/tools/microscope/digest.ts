import type { RunTrace } from '../../src/contracts/index.ts';
import { ideaSentence, ideaText, modeName } from './glossary.ts';

function selectedSummaries(trace: RunTrace, side: 'focus' | 'alternate'): string {
  return trace.comparison[side].selected.map(ideaText).join('; ');
}

function titleFor(trace: RunTrace, id: string): string {
  const candidates = [
    ...trace.comparison.focus.selected,
    ...trace.comparison.focus.rejected,
    ...trace.comparison.alternate.selected,
    ...trace.comparison.alternate.rejected,
  ];
  const candidate = candidates.find((item) => item.id === id);
  return candidate ? ideaText(candidate) : id;
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

function lineageSample(trace: RunTrace): string {
  const firstSelected = trace.comparison.focus.selected[0];
  if (!firstSelected) return 'none';
  return `${firstSelected.parentId} -> ${ideaText(firstSelected)} via ${firstSelected.operatorLabel}`;
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
    `Generated: ${trace.lineage.generated.length} children; no-delta rejects=${trace.lineage.rejected.length}`,
    `${modeName(focus)} kept: ${selectedSummaries(trace, 'focus')}`,
    `${modeName(alternate)} kept: ${selectedSummaries(trace, 'alternate')}`,
    `Changed when mode changed: ${changedByDial(trace)}`,
    `Survived both modes: ${stableAcrossDials(trace)}`,
    `Lineage sample: ${lineageSample(trace)}`,
    `Failed checks: ${failedChecks(trace)}`,
    'Boundary path: fixture/source packets -> generate/lineage -> fitness -> select -> digest/report/trace -> human',
    'Stop here unless a line surprises you; drill down with run-report.md or run-trace.json.',
    '',
  ].join('\n');
}

export function renderConsoleDigest(trace: RunTrace): string {
  const replaced = trace.comparison.contrasts.find((contrast) => contrast.status === 'replaced');
  const focus = replaced
    ? trace.comparison.focus.selected.find((candidate) => candidate.id === replaced.selectedId)
    : undefined;
  const alternate = replaced
    ? trace.comparison.alternate.selected.find((candidate) => candidate.id === replaced.alternateId)
    : undefined;
  const swap = focus && alternate
    ? `"${ideaSentence(focus)}" -> "${ideaSentence(alternate)}"`
    : 'none';
  return [
    `PASS: ${trace.lineage.generated.length} ideas; ${trace.lineage.rejected.length} repeats rejected; checks ${verdict(trace)}.`,
    `SWAP: ${swap}`,
    `STABLE: ${stableAcrossDials(trace)}`,
    'MORE: `pnpm walkthrough`.',
  ].join('\n');
}
