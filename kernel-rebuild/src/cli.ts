import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Dial } from './contracts/index.ts';
import { assertSeedFixture } from './contracts/index.ts';
import { renderConsoleDigest, renderDigest } from './digest.ts';
import { renderReport } from './report.ts';
import { buildRunTrace } from './trace.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

type Args = {
  dial: Dial;
  fixture: string;
  outDir: string;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    dial: 'diverge',
    fixture: path.join(root, 'fixtures', 'fsd-seed.json'),
    outDir: path.join(root, 'out'),
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
    } else if (arg.startsWith('--out-dir=')) {
      args.outDir = path.resolve(root, arg.slice('--out-dir='.length));
    }
  }

  return args;
}

function displayPath(filePath: string): string {
  return path.relative(root, filePath);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const raw = JSON.parse(await readFile(args.fixture, 'utf8'));
  const fixture = assertSeedFixture(raw);
  const trace = buildRunTrace(fixture, args.dial);
  const digest = renderDigest(trace);
  const report = renderReport(trace);

  await mkdir(args.outDir, { recursive: true });
  const digestPath = path.join(args.outDir, 'run-digest.md');
  const tracePath = path.join(args.outDir, 'run-trace.json');
  const reportPath = path.join(args.outDir, 'run-report.md');
  await writeFile(digestPath, digest, 'utf8');
  await writeFile(tracePath, JSON.stringify(trace, null, 2), 'utf8');
  await writeFile(reportPath, report, 'utf8');

  const failed = trace.goalChecks.filter((check) => !check.passed);

  console.log(renderConsoleDigest(trace));
  console.log(`artifacts: ${displayPath(digestPath)} first; drill-down ${displayPath(reportPath)}, ${displayPath(tracePath)}`);
  if (failed.length) {
    console.log(`failed goal checks: ${failed.map((check) => check.id).join(', ')}`);
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
