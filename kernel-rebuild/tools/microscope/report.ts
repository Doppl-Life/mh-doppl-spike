// Renders a markdown drill-down report from RunTrace.
import type { RunTrace, ScoredCandidate, SelectedCandidate } from '../../src/contracts/index.ts';

function pass(value: boolean): string {
  return value ? 'PASS' : 'FAIL';
}

function score(value: number): string {
  return value.toFixed(2);
}

function candidateRow(candidate: ScoredCandidate): string {
  return `| ${candidate.id} | g${candidate.generation} | ${candidate.parent.kind}:${candidate.parent.id} | ${candidate.title} | ${candidate.substrate} | ${score(candidate.fitness.novelty)} | ${score(candidate.fitness.grounding)} | ${score(candidate.fitness.decay.factor)} | ${candidate.fitness.reasons.novelty} | ${candidate.fitness.reasons.grounding} | ${candidate.fitness.reasons.decay} |`;
}

function selectedRow(candidate: SelectedCandidate): string {
  return `| ${candidate.selection.rank} | ${candidate.id} | g${candidate.generation} | ${candidate.title} | ${score(candidate.fitness.novelty)} | ${score(candidate.fitness.grounding)} | ${score(candidate.selection.decayAdjustedScore)} | ${candidate.selection.reason} |`;
}

function lineageRow(node: RunTrace['lineage']['generated'][number]): string {
  const delta = node.delta ? node.delta.summary : node.rejectionReason || '';
  return `| ${node.id} | ${node.status} | g${node.generation} | ${node.parent.kind}:${node.parent.id} | ${node.operatorLabel} | ${node.sourcePacketIds.join(', ')} | ${delta} |`;
}

function lensRows(trace: RunTrace): string[] {
  return trace.lensResults.flatMap((result) =>
    result.scores.map((item) => `| ${result.label} | ${item.candidateId} | ${score(item.score)} | ${item.passed ? 'yes' : 'no'} | demo ${score(item.components.demoFit)}, evidence ${score(item.components.evidenceFit)}, scope ${score(item.components.scopeFit)}, risk ${score(item.components.riskFit)} | ${item.reasons.join('; ')} |`),
  );
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
  lines.push('## Run Caps');
  lines.push('');
  lines.push(`- maxGenerations: ${trace.caps.maxGenerations}`);
  lines.push(`- maxChildrenPerParent: ${trace.caps.maxChildrenPerParent}`);
  lines.push(`- maxPopulation: ${trace.caps.maxPopulation}`);
  lines.push('');
  lines.push('## Boundary Contracts');
  lines.push('');
  lines.push('| Module | Enters from | Input | Output | Exits to |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const boundary of trace.boundaryContracts) {
    lines.push(`| ${boundary.module} | ${boundary.entersFrom.label} | ${boundary.input.name} | ${boundary.output.name} | ${boundary.exitsTo.label} |`);
  }
  lines.push('');
  lines.push('## Lineage');
  lines.push('');
  lines.push(`Generated children: ${trace.lineage.generated.length}`);
  lines.push(`No-delta rejects: ${trace.lineage.rejected.length}`);
  lines.push('');
  lines.push('| Node | Status | Generation | Parent | Operator | Source packet | Delta / rejection |');
  lines.push('| --- | --- | ---: | --- | --- | --- | --- |');
  for (const node of trace.lineage.generated.concat(trace.lineage.rejected)) {
    lines.push(lineageRow(node));
  }
  lines.push('');
  lines.push('## Generation Summary');
  lines.push('');
  lines.push('| Generation | Parents | Generated | Selected | Rejected nodes | Quality | Detail |');
  lines.push('| ---: | --- | --- | --- | --- | --- | --- |');
  for (const generation of trace.generations) {
    lines.push(`| ${generation.index} | ${generation.parentCandidateIds.join(', ') || 'seed'} | ${generation.generatedCandidateIds.join(', ') || 'none'} | ${generation.selectedCandidateIds.join(', ') || 'none'} | ${generation.rejectedNodeIds.join(', ') || 'none'} | ${generation.quality} | ${generation.detail} |`);
  }
  lines.push('');
  lines.push('## Candidate Pool');
  lines.push('');
  lines.push('| ID | Generation | Parent | Candidate | Substrate | Novelty | Grounding | Decay | Novelty reason | Grounding reason | Decay reason |');
  lines.push('| --- | ---: | --- | --- | --- | ---: | ---: | ---: | --- | --- | --- |');
  for (const candidate of allCandidates) {
    lines.push(candidateRow(candidate));
  }
  lines.push('');
  lines.push(`## Focus Selection: ${trace.comparison.focus.schedule.dial}`);
  lines.push('');
  lines.push(trace.comparison.focus.schedule.description);
  lines.push('');
  lines.push('| Rank | ID | Generation | Candidate | Novelty | Grounding | Decay-adjusted | Why kept |');
  lines.push('| ---: | --- | ---: | --- | ---: | ---: | ---: | --- |');
  for (const candidate of trace.comparison.focus.selected) {
    lines.push(selectedRow(candidate));
  }
  lines.push('');
  lines.push(`## Contrast Selection: ${trace.comparison.alternate.schedule.dial}`);
  lines.push('');
  lines.push(trace.comparison.alternate.schedule.description);
  lines.push('');
  lines.push('| Rank | ID | Generation | Candidate | Novelty | Grounding | Decay-adjusted | Why kept |');
  lines.push('| ---: | --- | ---: | --- | ---: | ---: | ---: | --- |');
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
  lines.push('## Lens Results');
  lines.push('');
  lines.push('Feasibility is shown here as a post-selection lens. It is not part of `FitnessScore`.');
  lines.push('');
  lines.push('| Lens | Candidate | Score | Passed | Components | Reasons |');
  lines.push('| --- | --- | ---: | --- | --- | --- |');
  const rows = lensRows(trace);
  for (const row of rows.length ? rows : ['| none | none | 0.00 | no | none | no lens results |']) {
    lines.push(row);
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
  return lines.join('\n');
}
