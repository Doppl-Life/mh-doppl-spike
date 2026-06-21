import type { RunTrace, ScoredCandidate, SelectedCandidate } from './contracts/index.ts';

function pass(value: boolean): string {
  return value ? 'PASS' : 'FAIL';
}

function score(value: number): string {
  return value.toFixed(2);
}

function candidateRow(candidate: ScoredCandidate): string {
  return `| ${candidate.id} | ${candidate.title} | ${candidate.substrate} | ${score(candidate.fitness.novelty)} | ${score(candidate.fitness.grounding)} | ${candidate.fitness.reasons.novelty} | ${candidate.fitness.reasons.grounding} |`;
}

function selectedRow(candidate: SelectedCandidate): string {
  return `| ${candidate.selection.rank} | ${candidate.id} | ${candidate.title} | ${score(candidate.fitness.novelty)} | ${score(candidate.fitness.grounding)} | ${candidate.selection.reason} |`;
}

export function renderReport(trace: RunTrace): string {
  const allCandidates = trace.comparison.focus.selected
    .concat(trace.comparison.focus.rejected)
    .sort((a, b) => a.id.localeCompare(b.id));

  const lines: string[] = [];
  lines.push(`# Kernel Run Report`);
  lines.push('');
  lines.push(`Run: \`${trace.runId}\``);
  lines.push(`Focus dial: \`${trace.dial}\``);
  lines.push('');
  lines.push('## Seed');
  lines.push('');
  lines.push(`- **Title:** ${trace.seed.title}`);
  lines.push(`- **Thesis:** ${trace.seed.thesis}`);
  lines.push(`- **Prompt:** ${trace.seed.prompt}`);
  lines.push('');
  lines.push('## Boundary Contracts');
  lines.push('');
  lines.push('| Module | Enters from | Input | Output | Exits to |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const boundary of trace.boundaryContracts) {
    lines.push(`| ${boundary.module} | ${boundary.entersFrom.label} | ${boundary.input.name} | ${boundary.output.name} | ${boundary.exitsTo.label} |`);
  }
  lines.push('');
  lines.push('## Candidate Pool');
  lines.push('');
  lines.push('| ID | Candidate | Substrate | Novelty | Grounding | Novelty reason | Grounding reason |');
  lines.push('| --- | --- | --- | ---: | ---: | --- | --- |');
  for (const candidate of allCandidates) {
    lines.push(candidateRow(candidate));
  }
  lines.push('');
  lines.push(`## Focus Selection: ${trace.comparison.focus.schedule.dial}`);
  lines.push('');
  lines.push(trace.comparison.focus.schedule.description);
  lines.push('');
  lines.push('| Rank | ID | Candidate | Novelty | Grounding | Why kept |');
  lines.push('| ---: | --- | --- | ---: | ---: | --- |');
  for (const candidate of trace.comparison.focus.selected) {
    lines.push(selectedRow(candidate));
  }
  lines.push('');
  lines.push(`## Contrast Selection: ${trace.comparison.alternate.schedule.dial}`);
  lines.push('');
  lines.push(trace.comparison.alternate.schedule.description);
  lines.push('');
  lines.push('| Rank | ID | Candidate | Novelty | Grounding | Why kept |');
  lines.push('| ---: | --- | --- | ---: | ---: | --- |');
  for (const candidate of trace.comparison.alternate.selected) {
    lines.push(selectedRow(candidate));
  }
  lines.push('');
  lines.push('## Cross-Dial Contrast');
  lines.push('');
  lines.push('| Focus kept | Other dial state | Reason |');
  lines.push('| --- | --- | --- |');
  for (const contrast of trace.comparison.contrasts) {
    const state = contrast.status === 'stable' ? `stable as ${contrast.alternateId}` : `replaced by ${contrast.alternateId}`;
    lines.push(`| ${contrast.selectedId} | ${state} | ${contrast.reason} |`);
  }
  lines.push('');
  lines.push('## Goal Checks');
  lines.push('');
  lines.push('| Status | Goal | Detail |');
  lines.push('| --- | --- | --- |');
  for (const check of trace.goalChecks) {
    lines.push(`| ${pass(check.passed)} | ${check.label} | ${check.detail} |`);
  }
  lines.push('');
  lines.push('## Trace Timeline');
  lines.push('');
  lines.push('| Stage | Input | Decision | Reason | Output |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const event of trace.events) {
    lines.push(`| ${event.stage} | ${event.input} | ${event.decision} | ${event.reason} | ${event.output} |`);
  }
  lines.push('');
  lines.push('## What To Inspect');
  lines.push('');
  lines.push('- If `dial-changes-survivors` fails, the kernel did not prove direction matters.');
  lines.push('- If the same candidate wins both dials too often, the axes may not be independent.');
  lines.push('- If novelty reasons do not cite absence-from-record, novelty is drifting back into model self-grading.');
  lines.push('- If cross-dial contrasts are unconvincing, the demo does not yet make the dial visible.');
  lines.push('');
  return lines.join('\n');
}
