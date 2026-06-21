import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Dial, RunTrace, SeedFixture } from '../../src/contracts/index.ts';
import { assertSeedFixture } from '../../src/contracts/index.ts';
import { buildRunTrace } from '../../src/trace.ts';
import { ideaSentence, ideaText, modeName, scoreLine, selectedLines } from './glossary.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');

type Args = {
  dial: Dial;
  fixture: string;
  detail: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    dial: 'diverge',
    fixture: path.join(root, 'fixtures', 'fsd-seed.json'),
    detail: false,
  };

  for (const arg of argv) {
    if (arg.startsWith('--dial=')) {
      const dial = arg.slice('--dial='.length);
      if (dial !== 'diverge' && dial !== 'converge') {
        throw new Error(`Bad --dial value: ${dial}`);
      }
      args.dial = dial;
    } else if (arg.startsWith('--fixture=')) {
      args.fixture = path.resolve(root, arg.slice('--fixture='.length));
    } else if (arg === '--detail') {
      args.detail = true;
    }
  }

  return args;
}

function replacementLine(trace: RunTrace): string {
  const replaced = trace.comparison.contrasts.find((contrast) => contrast.status === 'replaced');
  if (!replaced) return 'No replacement: both modes kept the same survivor set.';

  const focus = trace.comparison.focus.selected.find((candidate) => candidate.id === replaced.selectedId);
  const alternate = trace.comparison.alternate.selected.find((candidate) => candidate.id === replaced.alternateId);
  if (!focus || !alternate) return `${replaced.selectedId} -> ${replaced.alternateId}`;

  return `${modeName(trace.comparison.focus.schedule.dial)} kept ${scoreLine(focus)}; ${modeName(trace.comparison.alternate.schedule.dial)} swapped in ${scoreLine(alternate)}`;
}

function replacementPlain(trace: RunTrace): string {
  const replaced = trace.comparison.contrasts.find((contrast) => contrast.status === 'replaced');
  if (!replaced) return 'No swap: both modes kept the same ideas.';

  const focus = trace.comparison.focus.selected.find((candidate) => candidate.id === replaced.selectedId);
  const alternate = trace.comparison.alternate.selected.find((candidate) => candidate.id === replaced.alternateId);
  if (!focus || !alternate) return `Swapped ${replaced.selectedId} for ${replaced.alternateId}.`;

  return `"${ideaSentence(focus)}" -> "${ideaSentence(alternate)}"`;
}

function stableLine(trace: RunTrace): string {
  const stableIds = trace.comparison.contrasts
    .filter((contrast) => contrast.status === 'stable')
    .map((contrast) => contrast.selectedId);
  if (!stableIds.length) return 'none';

  return trace.comparison.focus.selected
    .filter((candidate) => stableIds.includes(candidate.id))
    .map(ideaText)
    .join('; ');
}

function stablePlain(trace: RunTrace): string {
  const stableIds = trace.comparison.contrasts
    .filter((contrast) => contrast.status === 'stable')
    .map((contrast) => contrast.selectedId);
  if (!stableIds.length) return 'none';

  return trace.comparison.focus.selected
    .filter((candidate) => stableIds.includes(candidate.id))
    .map((candidate) => `"${ideaSentence(candidate)}"`)
    .join('; ');
}

function firstLineage(trace: RunTrace): string {
  const firstSelected = trace.comparison.focus.selected[0];
  const node = trace.lineage.generated.find((item) => item.id === firstSelected?.id);
  if (!node?.delta || !firstSelected) return 'none';
  return `${node.parentId} -> ${ideaText(firstSelected)} via ${node.operatorLabel}: ${node.delta.summary}`;
}

function failedChecks(trace: RunTrace): string {
  const failed = trace.goalChecks.filter((check) => !check.passed);
  if (!failed.length) return 'none';
  return failed.map((check) => check.id).join(', ');
}

function operatorList(fixture: SeedFixture): string {
  return fixture.operators.map((operator) => operator.label).join(', ');
}

function renderWalkthrough(trace: RunTrace, fixture: SeedFixture): string {
  const generated = trace.lineage.generated.length;
  const rejected = trace.lineage.rejected.length;
  const focus = trace.comparison.focus.schedule;
  const alternate = trace.comparison.alternate.schedule;

  return [
    'Kernel Microscope',
    '',
    'This is a disposable view. It translates the kernel trace for humans; it is not the kernel contract.',
    '',
    'What you do:',
    '1. Run `pnpm walkthrough` when you want to understand the mechanism.',
    '2. Run `pnpm build` when you only want the pass/fail proof.',
    '3. Open `out/compare/run-report.md` only if a line surprises you or a check fails.',
    '',
    'What happened:',
    `- Input: ${trace.seed.title}`,
    `- Starting material: ${fixture.sourcePackets.length} possible consequences of the seed`,
    `- Idea-making moves: ${operatorList(fixture)}`,
    `- Produced: ${generated} real candidate ideas`,
    `- Rejected before scoring: ${rejected} repeats or no-change ideas`,
    '',
    'Mechanism:',
    `1. Generate: the system tried ${fixture.sourcePackets.length} possible consequences and kept ${generated} that changed the seed in a real way.`,
    `2. Reject: it threw out ${rejected} ideas that only repeated the seed.`,
    '3. Score: every remaining idea got two visible scores: surprise and evidence.',
    `4. ${modeName(focus.dial)}: reward surprise, but require evidence of at least ${focus.floor.toFixed(2)}.`,
    `5. ${modeName(alternate.dial)}: use the same idea pool, but reward evidence more heavily.`,
    '',
    'Concrete example:',
    `- ${firstLineage(trace)}`,
    '',
    'Selection result:',
    `- ${modeName(focus.dial)} kept:`,
    ...selectedLines(trace.comparison.focus.selected),
    `- ${modeName(alternate.dial)} kept:`,
    ...selectedLines(trace.comparison.alternate.selected),
    `- Changed when mode changed: ${replacementLine(trace)}`,
    `- Survived both modes: ${stableLine(trace)}`,
    '',
    'What this means:',
    '- The kernel is no longer just sorting a hand-authored list.',
    '- It now proves: source material -> generated children -> explicit deltas -> two-axis fitness -> dial-specific survivors.',
    '- The interesting tension: Explore mode keeps the speculative infrastructure idea; Proof mode swaps it for the more grounded accident-economy idea.',
    '',
    `Failed checks: ${failedChecks(trace)}`,
    '',
  ].join('\n');
}

function renderShort(trace: RunTrace): string {
  const failed = failedChecks(trace);
  return [
    `PASS: ${trace.lineage.generated.length} ideas; ${trace.lineage.rejected.length} repeats rejected; failed: ${failed}.`,
    `SWAP: ${replacementPlain(trace)}`,
    `STABLE: ${stablePlain(trace)}.`,
    'WHY: same pool, different selector.',
    'MORE: `pnpm walkthrough:detail`.',
  ].join('\n');
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const raw = JSON.parse(await readFile(args.fixture, 'utf8'));
  const fixture = assertSeedFixture(raw);
  const trace = buildRunTrace(fixture, args.dial);
  console.log(args.detail ? renderWalkthrough(trace, fixture) : renderShort(trace));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
