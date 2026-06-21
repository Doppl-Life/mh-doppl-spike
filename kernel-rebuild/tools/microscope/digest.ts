// Renders compact text digests from RunTrace for optional microscope output.
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
  return replaced.map((contrast) => `${titleFor(trace, contrast.selectedId)} -> ${contrast.alternateId ? titleFor(trace, contrast.alternateId) : 'none'}`).join('; ');
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

function generationLine(trace: RunTrace): string {
  const generation = trace.generations.find((item) => item.index === 2);
  if (!generation) return 'not run';
  return `${generation.quality}: ${generation.detail}`;
}

function lensLine(trace: RunTrace): string {
  const result = trace.lensResults[0];
  if (!result) return 'none';
  const best = result.scores.slice().sort((a, b) => b.score - a.score)[0];
  if (!best) return `${result.label}: no selected candidates`;
  return `${result.label}: ${best.candidateId} ${best.score.toFixed(2)}`;
}

function decayLine(trace: RunTrace): string {
  const selected = trace.comparison.focus.selected[0];
  if (!selected) return 'none';
  return `${selected.id} factor ${selected.fitness.decay.factor.toFixed(2)}; adjusted=${selected.selection.decayAdjustedScore.toFixed(2)}`;
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
    `Generation 2: ${generationLine(trace)}`,
    `Decay: ${decayLine(trace)}`,
    `Lens: ${lensLine(trace)}`,
    `Failed checks: ${failedChecks(trace)}`,
    'Boundary path: fixture/source packets -> generate/lineage -> fitness/decay -> select -> lens -> trace -> human',
    'Stop here unless a line surprises you; rerun with `pnpm proof:export` for run-trace.json.',
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
    `GEN2: ${generationLine(trace)}`,
    `DECAY/LENS: ${decayLine(trace)}; ${lensLine(trace)}`,
    'MORE: `pnpm walkthrough`.',
  ].join('\n');
}
