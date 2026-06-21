import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSeedFixture } from '../../src/contracts/index.ts';
import type { Dial, RunTrace, SelectedCandidate } from '../../src/contracts/index.ts';
import { buildRunTrace } from '../../src/trace.ts';
import { ideaSentence } from './glossary.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');

type Args = {
  dial: Dial;
  fixture: string;
  outDir: string;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    dial: 'diverge',
    fixture: path.join(root, 'fixtures', 'fsd-seed.json'),
    outDir: path.join(root, 'out', 'microscope'),
  };

  for (const arg of argv) {
    if (arg.startsWith('--dial=')) {
      const dial = arg.slice('--dial='.length);
      if (dial !== 'diverge' && dial !== 'converge') throw new Error(`Bad --dial value: ${dial}`);
      args.dial = dial;
    } else if (arg.startsWith('--fixture=')) {
      args.fixture = path.resolve(root, arg.slice('--fixture='.length));
    } else if (arg.startsWith('--out-dir=')) {
      args.outDir = path.resolve(root, arg.slice('--out-dir='.length));
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

function replacement(trace: RunTrace): { from?: SelectedCandidate; to?: SelectedCandidate } {
  const replaced = trace.comparison.contrasts.find((contrast) => contrast.status === 'replaced');
  if (!replaced) return {};
  return {
    from: trace.comparison.focus.selected.find((candidate) => candidate.id === replaced.selectedId),
    to: trace.comparison.alternate.selected.find((candidate) => candidate.id === replaced.alternateId),
  };
}

function stableIds(trace: RunTrace): Set<string> {
  return new Set(
    trace.comparison.contrasts
      .filter((contrast) => contrast.status === 'stable')
      .map((contrast) => contrast.selectedId),
  );
}

function card(candidate: SelectedCandidate, tone: 'stable' | 'swap' | 'normal'): string {
  const title = `${candidate.title}: novelty ${candidate.fitness.novelty.toFixed(2)}, grounding ${candidate.fitness.grounding.toFixed(2)}`;
  return `
    <article class="card ${tone}" title="${escapeHtml(title)}">
      <p>${escapeHtml(ideaSentence(candidate))}</p>
      <div class="scores">
        <span>surprise ${candidate.fitness.novelty.toFixed(2)}</span>
        <span>evidence ${candidate.fitness.grounding.toFixed(2)}</span>
      </div>
    </article>`;
}

function renderCards(trace: RunTrace, side: 'focus' | 'alternate'): string {
  const stable = stableIds(trace);
  const swap = replacement(trace);
  return trace.comparison[side].selected
    .map((candidate) => {
      const tone = stable.has(candidate.id) ? 'stable' : candidate.id === swap.from?.id || candidate.id === swap.to?.id ? 'swap' : 'normal';
      return card(candidate, tone);
    })
    .join('\n');
}

function term(label: string, tip: string): string {
  const safeTip = escapeHtml(tip);
  return `<span class="term" tabindex="0" title="${safeTip}" data-tip="${safeTip}">${escapeHtml(label)}</span>`;
}

function architectureCounts(trace: RunTrace): { sourcePackets: number; operators: number } {
  const nodes = trace.lineage.generated.concat(trace.lineage.rejected);
  return {
    sourcePackets: new Set(nodes.flatMap((node) => node.sourcePacketIds)).size,
    operators: new Set(nodes.map((node) => node.operatorId)).size,
  };
}

function codeLine(name: string, type: string, note?: string): string {
  return `
    <div class="code-line">
      <span class="code-field">${escapeHtml(name)}</span><span class="code-punct">:</span>
      <span class="code-type">${escapeHtml(type)}</span><span class="code-punct">;</span>
      ${note ? `<span class="code-note">// ${escapeHtml(note)}</span>` : ''}
    </div>`;
}

function contractBlock(name: string, tip: string, lines: string[], meta: string): string {
  return `
    <article class="contract-card">
      <div class="card-label">boundary contract</div>
      <div class="interface-code" aria-label="${escapeHtml(name)} TypeScript contract">
        <div><span class="code-keyword">interface</span> ${term(name, tip)} <span class="code-punct">{</span></div>
        ${lines.join('')}
        <div><span class="code-punct">}</span></div>
      </div>
      <p class="contract-meta">${escapeHtml(meta)}</p>
    </article>`;
}

function moduleBlock(name: string, description: string, steps: string[]): string {
  return `
    <article class="module-card">
      <div class="card-label">module</div>
      <h3>${escapeHtml(name)}</h3>
      <p>${description}</p>
      <ol class="work-steps">
        ${steps.map((step) => `<li>${step}</li>`).join('')}
      </ol>
    </article>`;
}

function flowArrow(label: string): string {
  return `<div class="flow-arrow" aria-hidden="true"><span>${escapeHtml(label)}</span></div>`;
}

function renderArchitecture(trace: RunTrace): string {
  const generated = trace.lineage.generated.length;
  const rejected = trace.lineage.rejected.length;
  const stable = trace.comparison.contrasts.filter((contrast) => contrast.status === 'stable').length;
  const replaced = trace.comparison.contrasts.filter((contrast) => contrast.status === 'replaced').length;
  const focusDial = trace.comparison.focus.schedule.dial;
  const alternateDial = trace.comparison.alternate.schedule.dial;
  const counts = architectureCounts(trace);
  const seedFixture = contractBlock(
    'SeedFixture',
    'The input contract loaded from the fixture file before the kernel starts.',
    [
      codeLine('seed', 'Seed', trace.seed.title),
      codeLine('sourcePackets', 'SourcePacket[]', `${counts.sourcePackets} packets`),
      codeLine('operators', 'ReproductionOperator[]', `${counts.operators} rules`),
    ],
    'This is the same input shown in the top-left card.',
  );
  const candidatePool = contractBlock(
    'CandidatePool',
    'Generate output: the seed, generated candidates, and the lineage ledger.',
    [
      codeLine('seed', 'Seed'),
      codeLine('candidates', 'Candidate[]', `${generated} kept`),
      codeLine('lineage', 'LineageLedger', `${rejected} rejected`),
    ],
    'No-delta rejects are kept in lineage, not scored as candidates.',
  );
  const scoredPool = contractBlock(
    'ScoredCandidatePool',
    'Fitness output: the same candidates with novelty and grounding attached.',
    [
      codeLine('seed', 'Seed'),
      codeLine('candidates', 'ScoredCandidate[]', 'fitness added'),
    ],
    'Selection reads this pool; it does not generate new candidates.',
  );
  const comparison = contractBlock(
    'SelectionComparison',
    'Select output: both dial results plus the direct contrast between them.',
    [
      codeLine('focus', 'SelectionResult', focusDial),
      codeLine('alternate', 'SelectionResult', alternateDial),
      codeLine('contrasts', 'DialContrast[]', `${stable} stable, ${replaced} replaced`),
    ],
    'The swap summary above is a projection of this contract.',
  );
  const runTrace = contractBlock(
    'RunTrace',
    'Final kernel artifact: serializable facts about the whole run.',
    [
      codeLine('runId', 'string'),
      codeLine('lineage', 'LineageLedger'),
      codeLine('events', 'TraceEvent[]'),
      codeLine('comparison', 'SelectionComparison'),
    ],
    'Human views read this after the kernel finishes.',
  );
  const generate = moduleBlock(
    'Generate',
    'Build candidate ideas from source packets that contain a real change.',
    [
      `read ${term('sourcePackets', 'Source-backed packets containing a substrate, mechanism, and either candidate data or a no-delta reason.')}`,
      `use ${term('operators', 'Named transformation rules such as Substrate removal or Hidden dependent.')} to produce candidate deltas`,
      `send ${generated} candidates forward; record ${rejected} ${term('no-delta rejects', 'Packets inspected but rejected because they did not create a useful change.')} in lineage`,
    ],
  );
  const fitness = moduleBlock(
    'Fitness',
    'Attach two scores to every generated candidate.',
    [
      `${term('novelty', 'How far the idea moves from the obvious reading of the seed.')} uses source absence, substrate distance, and hidden dependents`,
      `${term('grounding', 'How well the idea is supported and testable.')} uses signal strength, mechanism clarity, falsifiability, minus risk penalty`,
      'emit the same pool with scores and short reasons attached',
    ],
  );
  const select = moduleBlock(
    'Select',
    'Run two selectors over the same scored candidates.',
    [
      `${escapeHtml(focusDial)} prioritizes ${escapeHtml(trace.comparison.focus.schedule.priorityAxis)} with a ${escapeHtml(trace.comparison.focus.schedule.floorAxis)} floor`,
      `${escapeHtml(alternateDial)} prioritizes ${escapeHtml(trace.comparison.alternate.schedule.priorityAxis)} with a ${escapeHtml(trace.comparison.alternate.schedule.floorAxis)} floor`,
      `compare winners: ${stable} stable, ${replaced} replaced`,
    ],
  );
  const traceModule = moduleBlock(
    'Trace',
    'Package the run so tools can inspect it without rerunning the kernel.',
    [
      'copy lineage, boundary contracts, events, and goal checks',
      'attach the selection comparison',
      'emit one JSON-safe run record',
    ],
  );

  return `
    <section class="architecture" aria-label="Architecture walkthrough">
      <div class="section-title">
        <h2>Architecture Walkthrough</h2>
        <p>Contracts cross boundaries. Modules transform them.</p>
      </div>
      <div class="arch-key" aria-label="Architecture legend">
        <span><span class="key-shape module-shape"></span>module</span>
        <span><span class="key-shape contract-shape"></span>TypeScript contract</span>
        <span><span class="key-shape arrow-shape"></span>data flow</span>
      </div>
      <div class="arch-frame">
        <div class="boundary kernel-boundary">kernel boundary</div>
        <div class="arch-flow">
          ${seedFixture}
          ${flowArrow('into Generate')}
          ${generate}
          ${flowArrow('emits')}
          ${candidatePool}
          ${flowArrow('into Fitness')}
          ${fitness}
          ${flowArrow('emits')}
          ${scoredPool}
          ${flowArrow('into Select')}
          ${select}
          ${flowArrow('emits')}
          ${comparison}
          ${flowArrow('into Trace')}
          ${traceModule}
          ${flowArrow('emits')}
          ${runTrace}
        </div>
        <p class="arch-footnote">This HTML page is a separate view over the final artifact, not a kernel stage.</p>
      </div>
    </section>`;
}

function renderHtml(trace: RunTrace): string {
  const swap = replacement(trace);
  const swapText = swap.from && swap.to
    ? `${ideaSentence(swap.from)} -> ${ideaSentence(swap.to)}`
    : 'No swap';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Kernel Microscope</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #17201b;
      --muted: #637066;
      --line: #cdd8d0;
      --bg: #f7f8f5;
      --panel: #ffffff;
      --stable: #d9f2df;
      --stable-line: #4a9a5c;
      --swap: #ffe2bd;
      --swap-line: #bf6b14;
      --reject: #ecefec;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font: 15px/1.35 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main {
      max-width: 1180px;
      margin: 0 auto;
      padding: 28px;
    }
    h1 {
      margin: 0 0 4px;
      font-size: 24px;
      letter-spacing: 0;
    }
    .sub {
      margin: 0 0 20px;
      color: var(--muted);
    }
    .pipeline {
      display: grid;
      grid-template-columns: 1fr 1fr 1.4fr 1.4fr;
      gap: 14px;
      align-items: stretch;
    }
    .box, .lane {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      min-height: 142px;
    }
    .box h2, .lane h2 {
      margin: 0 0 10px;
      font-size: 13px;
      text-transform: uppercase;
      color: var(--muted);
      letter-spacing: .04em;
    }
    .big {
      font-size: 30px;
      font-weight: 700;
      margin: 4px 0 2px;
    }
    .caption {
      color: var(--muted);
      margin: 0;
    }
    .contract-link {
      margin: 10px 0 0;
      color: var(--muted);
      font-size: 12px;
    }
    .contract-link code {
      padding: 2px 5px;
      border: 1px solid var(--line);
      border-radius: 4px;
      background: #f4f7f2;
      color: #344139;
      font: 11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }
    .cards {
      display: grid;
      gap: 8px;
    }
    .card {
      border: 1px solid var(--line);
      border-left-width: 5px;
      border-radius: 7px;
      padding: 9px 10px;
      background: #fff;
    }
    .card p {
      margin: 0 0 8px;
      font-size: 14px;
    }
    .card.stable {
      background: var(--stable);
      border-color: var(--stable-line);
    }
    .card.swap {
      background: var(--swap);
      border-color: var(--swap-line);
    }
    .scores {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      color: var(--muted);
      font-size: 12px;
    }
    .summary {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-top: 14px;
    }
    .architecture {
      margin-top: 18px;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
    }
    .section-title {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: baseline;
      margin-bottom: 12px;
    }
    .section-title h2 {
      margin: 0;
      font-size: 16px;
    }
    .section-title p {
      margin: 0;
      color: var(--muted);
      font-size: 13px;
    }
    .arch-key {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      margin: -2px 0 12px;
      color: var(--muted);
      font-size: 12px;
    }
    .arch-key span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .key-shape {
      width: 18px;
      height: 12px;
      border-radius: 3px;
      border: 1px solid var(--line);
      background: #fff;
    }
    .module-shape {
      border: 2px solid #2f3d34;
      background: #fffefb;
    }
    .contract-shape {
      background: #17201b;
      border-color: #17201b;
    }
    .arrow-shape {
      position: relative;
      border: 0;
      background: transparent;
    }
    .arrow-shape::before {
      content: "↓";
      position: absolute;
      inset: -4px 0 auto;
      color: #2f3d34;
      font: 18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      text-align: center;
    }
    .arch-frame {
      position: relative;
      border: 1px dashed #9fb0a5;
      border-radius: 8px;
      padding: 24px 14px 12px;
      background:
        linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.75)),
        repeating-linear-gradient(-2deg, transparent 0 13px, rgba(23,32,27,.035) 13px 14px);
    }
    .boundary {
      position: absolute;
      left: 12px;
      top: -10px;
      padding: 2px 8px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--panel);
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .05em;
    }
    .arch-flow {
      display: grid;
      gap: 6px;
    }
    .contract-card, .module-card {
      border-radius: 8px;
      padding: 12px 14px;
    }
    .contract-card {
      border: 1px solid #9fb0a5;
      background: #f7faf7;
    }
    .module-card {
      border: 2px solid #2f3d34;
      background: #fffefb;
      box-shadow: 2px 2px 0 rgba(23,32,27,.12);
    }
    .card-label {
      margin-bottom: 8px;
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .05em;
    }
    .interface-code {
      overflow-x: auto;
      border-radius: 6px;
      padding: 10px 12px;
      background: #17201b;
      color: #eaf2ec;
      font: 12px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      white-space: nowrap;
    }
    .code-line {
      padding-left: 14px;
    }
    .code-keyword {
      color: #92d48a;
    }
    .code-field {
      color: #f3d28c;
    }
    .code-type {
      color: #91c7ef;
    }
    .code-punct {
      color: #cbd8ce;
    }
    .code-note {
      color: #9daaa1;
      margin-left: 8px;
    }
    .contract-meta {
      margin: 8px 0 0;
      color: var(--muted);
      font-size: 12px;
    }
    .module-card h3 {
      margin: 0 0 4px;
      font-size: 16px;
    }
    .module-card p {
      margin: 0 0 8px;
      color: var(--muted);
      font-size: 13px;
    }
    .work-steps {
      display: grid;
      gap: 5px;
      margin: 0;
      padding-left: 18px;
      color: #26332b;
      font-size: 13px;
    }
    .work-steps li {
      padding-left: 2px;
    }
    .flow-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #2f3d34;
      font: 11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      text-transform: uppercase;
      letter-spacing: .06em;
    }
    .flow-arrow::before, .flow-arrow::after {
      content: "";
      width: 34px;
      height: 1px;
      background: var(--line);
    }
    .flow-arrow span::after {
      content: " ↓";
      font-size: 15px;
      letter-spacing: 0;
      vertical-align: -1px;
    }
    .term {
      position: relative;
      border-bottom: 1px dotted #69766d;
      cursor: help;
    }
    .term:focus {
      outline: 2px solid rgba(74,154,92,.35);
      outline-offset: 2px;
    }
    .term::after {
      position: absolute;
      left: 0;
      bottom: calc(100% + 7px);
      z-index: 20;
      width: 220px;
      padding: 7px 8px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: #17201b;
      color: #fff;
      content: attr(data-tip);
      font: 12px/1.3 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      opacity: 0;
      pointer-events: none;
      transform: translateY(4px);
      transition: opacity .12s ease, transform .12s ease;
    }
    .term:hover::after, .term:focus::after {
      opacity: 1;
      transform: translateY(0);
    }
    .arch-footnote {
      margin: 8px 0 0;
      color: var(--muted);
      font-size: 12px;
    }
    .legend {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 14px;
      color: var(--muted);
      font-size: 13px;
    }
    .key {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .swatch {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border: 1px solid var(--line);
    }
    .swatch.stable { background: var(--stable); border-color: var(--stable-line); }
    .swatch.swap { background: var(--swap); border-color: var(--swap-line); }
    .swatch.reject { background: var(--reject); }
    @media (max-width: 900px) {
      .pipeline, .summary { grid-template-columns: 1fr; }
      .section-title { display: block; }
      .section-title h2 { margin-bottom: 4px; }
      .interface-code { font-size: 11px; }
      main { padding: 18px; }
    }
  </style>
</head>
<body>
  <main>
    <h1>Kernel Microscope</h1>
    <p class="sub">One seed, one generated pool, two selectors.</p>

    <section class="pipeline" aria-label="Kernel flow">
      <div class="box">
        <h2>Input</h2>
        <p><strong>${escapeHtml(trace.seed.title)}</strong></p>
        <p class="caption">${escapeHtml(trace.seed.thesis)}</p>
        <p class="contract-link" title="The architecture diagram below shows this as SeedFixture.seed.">maps to <code>SeedFixture.seed</code></p>
      </div>
      <div class="box">
        <h2>Generate</h2>
        <div class="big">${trace.lineage.generated.length}</div>
        <p class="caption">ideas kept</p>
        <div class="big">${trace.lineage.rejected.length}</div>
        <p class="caption">repeats rejected</p>
      </div>
      <div class="lane">
        <h2>Explore Keeps</h2>
        <div class="cards">${renderCards(trace, 'focus')}</div>
      </div>
      <div class="lane">
        <h2>Proof Keeps</h2>
        <div class="cards">${renderCards(trace, 'alternate')}</div>
      </div>
    </section>

    <section class="summary">
      <div class="box">
        <h2>The Swap</h2>
        <p>${escapeHtml(swapText)}</p>
      </div>
      <div class="box">
        <h2>Meaning</h2>
        <p>Same generated pool. Explore keeps the weirder idea. Proof swaps in the better-supported idea.</p>
      </div>
    </section>

    ${renderArchitecture(trace)}

    <footer class="legend">
      <span class="key"><span class="swatch swap"></span>Changed between selectors</span>
      <span class="key"><span class="swatch stable"></span>Survived both selectors</span>
      <span class="key"><span class="swatch reject"></span>Rejected before scoring</span>
      <span title="Surprise is the microscope label for novelty. Evidence is the microscope label for grounding.">surprise/evidence: translated score labels</span>
    </footer>
  </main>
</body>
</html>`;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const raw = JSON.parse(await readFile(args.fixture, 'utf8'));
  const fixture = assertSeedFixture(raw);
  const trace = buildRunTrace(fixture, args.dial);
  await mkdir(args.outDir, { recursive: true });
  const htmlPath = path.join(args.outDir, 'index.html');
  await writeFile(htmlPath, renderHtml(trace), 'utf8');
  console.log(`microscope: ${path.relative(root, htmlPath)}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
