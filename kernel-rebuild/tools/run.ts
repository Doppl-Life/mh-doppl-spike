// Runs seed fixtures and renders the compact proof board.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Dial, RunTrace, SeedFixture, SelectionResult } from '../src/contracts/index.ts';
import { assertSeedFixture } from '../src/contracts/index.ts';
import { createJsonKnowledgeGateway } from '../src/knowledge-gateway.ts';
import { buildRunTrace } from '../src/trace.ts';
import { capstoneDemoLens } from './lens-config.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const PROOF_BOARD_SCHEMA_VERSION = 'kernel.proof-board.v1';

type ProofCaseSummary = {
  seed: string;
  generated: number;
  rejected: number;
  memoryMode: string;
  knowledgePacketId: string;
  citationHandles: string[];
  memoryRecipients: string[];
  exclusions: number;
  freshKnowledgeRetrievals: number;
  exploreKeeps: string[];
  proofKeeps: string[];
  swap: string;
  failedChecks: string[];
};

type ProofBoardSnapshot = {
  schemaVersion: string;
  cases: ProofCaseSummary[];
  aggregate: {
    seeds: number;
    generated: number;
    rejected: number;
    failedChecks: number;
  };
};

type Args = {
  dial: Dial;
  fixture?: string;
  fixturesDir: string;
  outDir: string;
  exportProofBoard: boolean;
  memoryMode: 'off' | 'auto' | 'pinned';
  knowledgePacketsFile?: string;
  knowledgeTargetCase?: string;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    dial: 'diverge',
    fixturesDir: path.join(root, 'fixtures'),
    outDir: path.join(root, 'out', 'proof-board'),
    exportProofBoard: false,
    memoryMode: 'off',
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
    } else if (arg.startsWith('--fixtures-dir=')) {
      args.fixturesDir = path.resolve(root, arg.slice('--fixtures-dir='.length));
    } else if (arg.startsWith('--out-dir=')) {
      args.outDir = path.resolve(root, arg.slice('--out-dir='.length));
    } else if (arg === '--export-proof-board') {
      args.exportProofBoard = true;
    } else if (arg.startsWith('--memory-mode=')) {
      const memoryMode = arg.slice('--memory-mode='.length);
      if (memoryMode !== 'off' && memoryMode !== 'auto' && memoryMode !== 'pinned') {
        throw new Error(`Bad --memory-mode value: ${memoryMode}`);
      }
      args.memoryMode = memoryMode;
    } else if (arg.startsWith('--knowledge-packets-file=')) {
      args.knowledgePacketsFile = path.resolve(root, arg.slice('--knowledge-packets-file='.length));
    } else if (arg.startsWith('--knowledge-target-case=')) {
      args.knowledgeTargetCase = arg.slice('--knowledge-target-case='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function displayPath(filePath: string): string {
  return path.relative(root, filePath);
}

async function fixturePaths(args: Args): Promise<string[]> {
  if (args.fixture) return [args.fixture];
  const entries = await readdir(args.fixturesDir, { withFileTypes: true });
  const paths = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(args.fixturesDir, entry.name))
    .sort();
  if (!paths.length) {
    throw new Error(`No fixture JSON files found in ${displayPath(args.fixturesDir)}.`);
  }
  return paths;
}

async function loadFixture(filePath: string): Promise<SeedFixture> {
  const raw = JSON.parse(await readFile(filePath, 'utf8'));
  return assertSeedFixture(raw);
}

function selectionForDial(trace: RunTrace, dial: Dial): SelectionResult {
  if (trace.comparison.focus.schedule.dial === dial) return trace.comparison.focus;
  return trace.comparison.alternate;
}

function selectedTitles(selection: SelectionResult): string[] {
  return selection.selected.map((candidate) => `${candidate.title} (g${candidate.generation})`);
}

function memoryRecipients(trace: RunTrace): string[] {
  return [
    ...new Set(
      trace.events
        .filter((event) => event.type === 'knowledge.item_injected')
        .map((event) => String(event.payload?.recipient_role || 'unknown')),
    ),
  ].sort();
}

function freshKnowledgeRetrievals(trace: RunTrace): number {
  const replayCheck = trace.goalChecks.find((check) => check.id === 'replay-uses-persisted-knowledge');
  if (replayCheck?.passed && replayCheck.detail.includes('replayKnowledgeEvents=')) return 0;
  if (replayCheck?.detail.includes('freshKnowledgeRetrievals=0')) return 0;
  return trace.events.some((event) => event.type === 'knowledge.packet_requested') ? 1 : 0;
}

function titleFor(trace: RunTrace, id: string): string {
  const candidates = [
    ...trace.comparison.focus.selected,
    ...trace.comparison.focus.rejected,
    ...trace.comparison.alternate.selected,
    ...trace.comparison.alternate.rejected,
  ];
  const candidate = candidates.find((item) => item.id === id);
  return candidate ? `${candidate.title} (g${candidate.generation})` : id;
}

function swap(trace: RunTrace): string {
  const explore = selectionForDial(trace, 'diverge').selected;
  const proof = selectionForDial(trace, 'converge').selected;
  const exploreIds = new Set(explore.map((candidate) => candidate.id));
  const proofIds = new Set(proof.map((candidate) => candidate.id));
  const replaced = explore.find((candidate) => !proofIds.has(candidate.id));
  if (replaced) {
    const replacement = proof.find((candidate) => !exploreIds.has(candidate.id)) || proof[explore.indexOf(replaced)];
    return replacement ? `${titleFor(trace, replaced.id)} -> ${titleFor(trace, replacement.id)}` : `${titleFor(trace, replaced.id)} -> none`;
  }

  const rankShift = explore.find((candidate, index) => proof[index] && proof[index].id !== candidate.id);
  if (!rankShift) return 'none';
  const index = explore.indexOf(rankShift);
  return `rank: ${titleFor(trace, rankShift.id)} <> ${titleFor(trace, proof[index].id)}`;
}

function summarize(trace: RunTrace): ProofCaseSummary {
  const explore = selectionForDial(trace, 'diverge');
  const proof = selectionForDial(trace, 'converge');
  return {
    seed: trace.seed.title,
    generated: trace.lineage.generated.length,
    rejected: trace.lineage.rejected.length,
    memoryMode: trace.memoryMode,
    knowledgePacketId: trace.knowledgePacket?.id || 'none',
    citationHandles: trace.knowledgePacket?.items.map((item) => item.citeHandle) || [],
    memoryRecipients: memoryRecipients(trace),
    exclusions: trace.knowledgePacket?.excluded.length || 0,
    freshKnowledgeRetrievals: freshKnowledgeRetrievals(trace),
    exploreKeeps: selectedTitles(explore),
    proofKeeps: selectedTitles(proof),
    swap: swap(trace),
    failedChecks: trace.goalChecks.filter((check) => !check.passed).map((check) => check.id),
  };
}

export function buildSnapshot(traces: RunTrace[]): ProofBoardSnapshot {
  const cases = traces.map(summarize);
  return {
    schemaVersion: PROOF_BOARD_SCHEMA_VERSION,
    cases,
    aggregate: {
      seeds: cases.length,
      generated: cases.reduce((sum, item) => sum + item.generated, 0),
      rejected: cases.reduce((sum, item) => sum + item.rejected, 0),
      failedChecks: cases.reduce((sum, item) => sum + item.failedChecks.length, 0),
    },
  };
}

function compactList(items: string[]): string {
  if (!items.length) return 'none';
  return items.join('; ');
}

export function renderBoard(snapshot: ProofBoardSnapshot): string {
  const lines = [
    'seed -> generated -> rejected -> memory -> Explore keeps -> Proof keeps -> swap -> failed checks',
    '| seed | generated | rejected | memory | Explore keeps | Proof keeps | swap | failed checks |',
    '| --- | ---: | ---: | --- | --- | --- | --- |',
  ];
  for (const row of snapshot.cases) {
    const memory = `${row.memoryMode}; ${row.knowledgePacketId}; citations ${compactList(row.citationHandles)}; recipients ${compactList(row.memoryRecipients)}; exclusions ${row.exclusions}; fresh retrievals ${row.freshKnowledgeRetrievals}`;
    lines.push(`| ${row.seed} | ${row.generated} | ${row.rejected} | ${memory} | ${compactList(row.exploreKeeps)} | ${compactList(row.proofKeeps)} | ${row.swap} | ${compactList(row.failedChecks)} |`);
  }
  lines.push(`aggregate: seeds=${snapshot.aggregate.seeds}; generated=${snapshot.aggregate.generated}; rejected=${snapshot.aggregate.rejected}; failedChecks=${snapshot.aggregate.failedChecks}`);
  return lines.join('\n');
}

async function writeArtifacts(args: Args, traces: RunTrace[], snapshot: ProofBoardSnapshot): Promise<void> {
  await mkdir(args.outDir, { recursive: true });
  const boardPath = path.join(args.outDir, 'proof-board.json');
  await writeFile(boardPath, JSON.stringify(snapshot, null, 2), 'utf8');

  for (const trace of traces) {
    const traceDir = path.join(args.outDir, trace.seed.id);
    await mkdir(traceDir, { recursive: true });
    await writeFile(path.join(traceDir, 'run-trace.json'), JSON.stringify(trace, null, 2), 'utf8');
  }

  console.log(`artifacts: ${displayPath(boardPath)}; traces under ${displayPath(args.outDir)}/<seed>/run-trace.json`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const paths = await fixturePaths(args);
  const fixtures = await Promise.all(paths.map(loadFixture));
  const knowledgeGateway = args.knowledgePacketsFile
    ? await createJsonKnowledgeGateway(args.knowledgePacketsFile)
    : undefined;
  const traces = fixtures.map((fixture) => buildRunTrace(fixture, args.dial, {
    lenses: [capstoneDemoLens],
    memoryMode: args.memoryMode,
    knowledgeGateway,
    knowledgeTargetCase: args.knowledgeTargetCase,
  }));
  const snapshot = buildSnapshot(traces);

  console.log(renderBoard(snapshot));
  if (args.exportProofBoard) {
    await writeArtifacts(args, traces, snapshot);
  } else {
    console.log('drill-down: run `pnpm proof:export` to write out/proof-board/*.json');
  }

  if (snapshot.aggregate.failedChecks > 0) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
