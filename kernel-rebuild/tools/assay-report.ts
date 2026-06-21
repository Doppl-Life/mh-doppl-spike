import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  isStrong,
  isUseful,
  latestJudgments,
  readJudgments,
  relativeLedgerPath,
  type JudgmentEvent,
  type Verdict,
} from './judgments.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outDir = path.join(root, 'out', 'assay-review');

type Args = {
  ledgerPath: string | undefined;
};

type CaseDigest = {
  caseSlug: string;
  control: Verdict[];
  kernel: Verdict[];
  candidate: Verdict[];
  reviewers: Set<string>;
};

const verdictOrder: Verdict[] = ['dead', 'obvious', 'interesting', 'investigate', 'keeper'];

function parseArgs(argv: string[]): Args {
  const args: Args = { ledgerPath: undefined };
  for (const arg of argv) {
    if (arg === '--') {
      continue;
    } else if (arg.startsWith('--ledger-path=')) {
      args.ledgerPath = path.resolve(root, arg.slice('--ledger-path='.length));
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function counts(verdicts: Verdict[]): Record<Verdict, number> {
  return Object.fromEntries(verdictOrder.map((verdict) => [verdict, verdicts.filter((item) => item === verdict).length])) as Record<Verdict, number>;
}

function countText(verdicts: Verdict[]): string {
  const byVerdict = counts(verdicts);
  return verdictOrder
    .map((verdict) => `${verdict}:${byVerdict[verdict]}`)
    .filter((item) => !item.endsWith(':0'))
    .join(' ') || 'none';
}

function actionFor(digest: CaseDigest): string {
  const controlStrong = digest.control.some(isStrong);
  const kernelStrong = digest.kernel.concat(digest.candidate).some(isStrong);
  const kernelUseful = digest.kernel.concat(digest.candidate).some(isUseful);

  if (kernelStrong && !controlStrong) return 'kernel ahead';
  if (kernelStrong && controlStrong) return 'compare deltas';
  if (!kernelUseful && controlStrong) return 'control ahead';
  if (kernelUseful) return 'watch';
  return 'needs signal';
}

function digestCases(events: JudgmentEvent[]): CaseDigest[] {
  const byCase = new Map<string, CaseDigest>();
  for (const event of events) {
    const digest = byCase.get(event.caseSlug) || {
      caseSlug: event.caseSlug,
      control: [],
      kernel: [],
      candidate: [],
      reviewers: new Set<string>(),
    };
    digest.reviewers.add(event.reviewer || 'local');
    if (event.targetKind === 'control') digest.control.push(event.verdict);
    else if (event.targetKind === 'candidate') digest.candidate.push(event.verdict);
    else digest.kernel.push(event.verdict);
    byCase.set(event.caseSlug, digest);
  }
  return Array.from(byCase.values()).sort((a, b) => a.caseSlug.localeCompare(b.caseSlug));
}

function renderConsole(allEvents: JudgmentEvent[], latest: JudgmentEvent[], cases: CaseDigest[], ledgerPath?: string): string {
  const reviewers = new Set(latest.map((event) => event.reviewer || 'local')).size;
  const runs = new Set(latest.map((event) => event.runId)).size;
  const useful = latest.filter((event) => isUseful(event.verdict)).length;
  const strong = latest.filter((event) => isStrong(event.verdict)).length;
  const lines = [
    'assay judgment digest',
    `ledger=${relativeLedgerPath(ledgerPath)}; events=${allEvents.length}; latest=${latest.length}; reviewers=${reviewers}; runs=${runs}; useful=${useful}; strong=${strong}`,
    '| case | control | kernel case | candidates | reviewers | action |',
    '| --- | --- | --- | --- | ---: | --- |',
  ];
  for (const item of cases) {
    lines.push(`| ${item.caseSlug} | ${countText(item.control)} | ${countText(item.kernel)} | ${countText(item.candidate)} | ${item.reviewers.size} | ${actionFor(item)} |`);
  }
  if (!cases.length) {
    lines.push('| none | none | none | none | 0 | run `pnpm serve` and mark verdicts |');
  }
  return lines.join('\n');
}

function bar(verdict: Verdict, count: number, total: number): string {
  const width = total ? Math.max(4, Math.round((count / total) * 100)) : 0;
  return `<div class="bar-row"><span>${escapeHtml(verdict)}</span><div><b style="width:${width}%"></b></div><em>${count}</em></div>`;
}

function renderHtml(allEvents: JudgmentEvent[], latest: JudgmentEvent[], cases: CaseDigest[], ledgerPath?: string): string {
  const byVerdict = counts(latest.map((event) => event.verdict));
  const total = latest.length;
  const reviewerCount = new Set(latest.map((event) => event.reviewer || 'local')).size;
  const runCount = new Set(latest.map((event) => event.runId)).size;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Assay Review Digest</title>
  <style>
    :root { color-scheme: light; --ink:#18211c; --muted:#657269; --line:#cfdbd3; --bg:#f6f8f4; --panel:#fff; --good:#dff4e6; --warn:#fff1d4; }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--bg); color:var(--ink); font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    .local-nav { position:sticky; top:0; z-index:20; display:flex; gap:8px; align-items:center; flex-wrap:wrap; padding:10px 14px; border-bottom:1px solid #2a3544; background:#0b0e13; }
    .local-nav strong { color:#8b9bb0; font-size:12px; text-transform:uppercase; letter-spacing:.07em; }
    .local-nav a { color:#e8edf4; text-decoration:none; border-radius:6px; padding:5px 9px; }
    .local-nav a:hover { background:#1b232e; color:#c084fc; }
    .local-nav a.active { background:#c084fc; color:#0b0e13; font-weight:700; }
    main { width:min(1180px, calc(100vw - 32px)); margin:0 auto; padding:28px 0 44px; }
    h1, h2, h3, p { margin-top:0; }
    .hero, .card { border:1px solid var(--line); border-radius:8px; background:var(--panel); box-shadow:2px 2px 0 rgba(24,33,28,.08); }
    .hero { border:2px solid #25362c; padding:16px; margin-bottom:14px; }
    .facts { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
    .facts span { border:1px solid var(--line); border-radius:999px; padding:5px 8px; background:#f8faf6; color:#34443b; font-size:12px; }
    .grid { display:grid; grid-template-columns: .8fr 1.2fr; gap:12px; }
    .card { padding:14px; margin-bottom:12px; }
    .bar-row { display:grid; grid-template-columns:90px 1fr 32px; gap:8px; align-items:center; margin:8px 0; }
    .bar-row span, .bar-row em { color:var(--muted); font-style:normal; font-size:12px; }
    .bar-row div { height:12px; border:1px solid var(--line); border-radius:999px; background:#f8faf6; overflow:hidden; }
    .bar-row b { display:block; height:100%; border-radius:999px; background:#315d40; }
    table { width:100%; border-collapse:collapse; background:var(--panel); border:1px solid var(--line); border-radius:8px; overflow:hidden; }
    th, td { border-bottom:1px solid var(--line); padding:9px; text-align:left; vertical-align:top; }
    th { color:var(--muted); text-transform:uppercase; font-size:11px; letter-spacing:.04em; background:#f8faf6; }
    tr:last-child td { border-bottom:0; }
    .action { display:inline-block; border:1px solid var(--line); border-radius:999px; padding:3px 7px; background:var(--warn); }
    .action.good { background:var(--good); }
    .empty-note { color:var(--muted); }
    code { font:12px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
    @media (max-width:800px) { .grid { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <nav class="local-nav" aria-label="Assay local navigation">
    <strong>Kernel local</strong>
    <a href="../assay/index.html">Assay</a>
    <a href="../assay-review/index.html" class="active">Review Digest</a>
    <a href="../microscope/architecture.html">Architecture</a>
    <a href="../microscope/index.html">Microscope</a>
  </nav>
  <main>
    <section class="hero">
      <h1>Assay Review Digest</h1>
      <p>Local readout from saved verdicts. It collapses repeated clicks to the latest verdict per reviewer and target; consensus only becomes meaningful once multiple reviewers mark the same surface.</p>
      <div class="facts">
        <span>ledger ${escapeHtml(relativeLedgerPath(ledgerPath))}</span>
        <span>events ${allEvents.length}</span>
        <span>latest ${latest.length}</span>
        <span>runs ${runCount}</span>
        <span>reviewers ${reviewerCount}</span>
      </div>
    </section>
    <div class="grid">
      <section class="card">
        <h2>Verdicts</h2>
        ${verdictOrder.map((verdict) => bar(verdict, byVerdict[verdict], total)).join('')}
      </section>
      <section class="card">
        <h2>What To Read</h2>
        <p><strong>kernel ahead</strong> means kernel verdicts reached investigate/keeper while control did not. <strong>control ahead</strong> means the clean answer is currently stronger. <strong>compare deltas</strong> means both have signal and need human contrast. <strong>needs signal</strong> means the ledger does not yet justify a conclusion.</p>
        ${cases.length ? '' : '<p class="empty-note">No judgments yet. This is the shape of the digest: mark assay rows, then reload this page to see actions fill in.</p>'}
      </section>
    </div>
    <table>
      <thead><tr><th>case</th><th>control</th><th>kernel case</th><th>candidates</th><th>reviewers</th><th>action</th></tr></thead>
      <tbody>
        ${(cases.length ? cases : [{
          caseSlug: 'none',
          control: [],
          kernel: [],
          candidate: [],
          reviewers: new Set<string>(),
        }]).map((item) => {
          const action = cases.length ? actionFor(item) : 'run pnpm serve';
          const good = action === 'kernel ahead';
          return `<tr><td>${escapeHtml(item.caseSlug)}</td><td>${escapeHtml(countText(item.control))}</td><td>${escapeHtml(countText(item.kernel))}</td><td>${escapeHtml(countText(item.candidate))}</td><td>${item.reviewers.size}</td><td><span class="action ${good ? 'good' : ''}">${escapeHtml(action)}</span></td></tr>`;
        }).join('')}
      </tbody>
    </table>
  </main>
</body>
</html>`;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const allEvents = await readJudgments(args.ledgerPath);
  const latest = latestJudgments(allEvents);
  const cases = digestCases(latest);
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'index.html'), renderHtml(allEvents, latest, cases, args.ledgerPath), 'utf8');
  console.log(renderConsole(allEvents, latest, cases, args.ledgerPath));
  console.log(`html: ${path.relative(root, path.join(outDir, 'index.html'))}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
