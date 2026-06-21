// Runs a discovery-first outcome assay over selected kernel case fixtures.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSeedFixture } from '../src/contracts/index.ts';
import type { Dial, RunTrace, SelectedCandidate, SelectionResult } from '../src/contracts/index.ts';
import { buildRunTrace } from '../src/trace.ts';
import { capstoneDemoLens } from './lens-config.ts';
import { renderViewNav } from './view-nav.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const ASSAY_SCHEMA_VERSION = 'kernel.discovery-assay.v1';
const FEEDBACK_SCHEMA_VERSION = 'kernel.assay-feedback.v1';

type Verdict = 'dead' | 'obvious' | 'interesting' | 'investigate' | 'keeper';

type AssayCaseDefinition = {
  slug: string;
  label: string;
  caseStudyPath: string;
  fixturePath: string;
  controlPath?: string;
  fixedDefault?: boolean;
};

type Args = {
  count: number;
  all: boolean;
  random: boolean;
  seed: string;
  cases: string[];
  outDir: string;
  list: boolean;
};

type AssayCandidate = {
  id: string;
  title: string;
  thesis: string;
  generation: number;
  parentId: string;
  lineage: string;
  operator: string;
  substrate: string;
  delta: string;
  novelty: number;
  grounding: number;
  decay: number;
  lens: number | null;
  selectedByExplore: boolean;
  selectedByProof: boolean;
  status: 'stable' | 'explore-only' | 'proof-only' | 'not-selected';
  ratingReason: string;
};

type AssayResult = {
  definition: AssayCaseDefinition;
  trace: RunTrace;
  candidates: AssayCandidate[];
  convergence: ConvergenceGroup[];
  control?: CleanControl;
  bestConclusion?: AssayCandidate;
  bestOutlier?: AssayCandidate;
  gen2: string;
  failedChecks: string[];
};

type ConvergenceGroup = {
  label: string;
  count: number;
  candidates: string[];
};

type FeedbackTemplate = {
  schemaVersion: string;
  assaySchemaVersion: string;
  generatedAt: string;
  verdictScale: Array<{
    value: Verdict;
    meaning: string;
  }>;
  cases: Array<{
    slug: string;
    label: string;
    caseVerdict: Verdict | null;
    controlVerdict: Verdict | null;
    notes: string;
    candidates: Array<{
      id: string;
      title: string;
      verdict: Verdict | null;
      notes: string;
    }>;
  }>;
};

type CleanControl = {
  schemaVersion: string;
  caseSlug: string;
  label: string;
  source: string;
  actualProblem: string;
  discoveryInsights: Array<{
    title: string;
    detail: string;
  }>;
  ideas: Array<{
    title: string;
    detail: string;
  }>;
  nextTests: string[];
};

const registry: AssayCaseDefinition[] = [
  {
    slug: 'jack-drone-privacy',
    label: 'Jack drone privacy',
    caseStudyPath: 'case-studies/jack-drone-privacy/',
    fixturePath: 'fixtures/assay/jack-drone-privacy.json',
    controlPath: 'fixtures/controls/jack-drone-privacy.clean-agent.json',
    fixedDefault: true,
  },
  {
    slug: 'jack-yacht-perimeter-intrusion',
    label: 'Jack security swimmer',
    caseStudyPath: 'case-studies/jack-yacht-perimeter-intrusion/',
    fixturePath: 'fixtures/assay/jack-yacht-perimeter-intrusion.json',
    fixedDefault: true,
  },
  {
    slug: 'fsd-accident-economy',
    label: 'Tesla FSD accident economy',
    caseStudyPath: 'case-studies/fsd-accident-economy/',
    fixturePath: 'fixtures/assay/fsd-accident-economy.json',
    fixedDefault: true,
  },
  {
    slug: 'starship-launch-cost-collapse',
    label: 'SpaceX launch-cost collapse',
    caseStudyPath: 'case-studies/starship-launch-cost-collapse/',
    fixturePath: 'fixtures/starship-seed.json',
    fixedDefault: true,
  },
  {
    slug: 'ai-firm-power-constraint',
    label: 'AI datacenter power constraint',
    caseStudyPath: 'case-studies/ai-firm-power-constraint/',
    fixturePath: 'fixtures/ai-power-seed.json',
  },
  {
    slug: 'full-self-driving-unlock',
    label: 'Full self-driving unlock',
    caseStudyPath: 'case-studies/full-self-driving-unlock/',
    fixturePath: 'fixtures/fsd-seed.json',
  },
  {
    slug: 'glp1-snack-demand-destruction',
    label: 'GLP-1 appetite shock',
    caseStudyPath: 'case-studies/glp1-snack-demand-destruction/',
    fixturePath: 'fixtures/glp1-seed.json',
  },
];

const verdictHelp: Record<Verdict, string> = {
  dead: 'No useful signal. Do not revisit unless new evidence changes the case.',
  obvious: 'True or plausible, but already visible from the scenario. Not discovery.',
  interesting: 'Worth thinking about. It changed your attention, but does not yet demand action.',
  investigate: 'Worth a follow-up search, case split, red-team test, or falsification pass. This button does not launch that work.',
  keeper: 'Strong signal. Preserve it as a candidate insight or future seed.',
};

const verdictScale: Verdict[] = ['dead', 'obvious', 'interesting', 'investigate', 'keeper'];

function parseArgs(argv: string[]): Args {
  const args: Args = {
    count: 5,
    all: false,
    random: true,
    seed: Date.now().toString(36),
    cases: [],
    outDir: path.join(root, 'out', 'assay'),
    list: false,
  };

  for (const arg of argv) {
    if (arg === '--') {
      continue;
    } else if (arg === '--all') {
      args.all = true;
    } else if (arg === '--random') {
      args.random = true;
    } else if (arg === '--deterministic') {
      args.random = false;
    } else if (arg === '--list') {
      args.list = true;
    } else if (arg.startsWith('--count=')) {
      const count = Number(arg.slice('--count='.length));
      if (!Number.isInteger(count) || count < 1) throw new Error(`Bad --count value: ${arg}`);
      args.count = count;
    } else if (arg.startsWith('--case=')) {
      args.cases.push(arg.slice('--case='.length));
    } else if (arg.startsWith('--cases=')) {
      args.cases.push(...arg.slice('--cases='.length).split(',').map((item) => item.trim()).filter(Boolean));
    } else if (arg.startsWith('--seed=')) {
      args.seed = arg.slice('--seed='.length) || args.seed;
    } else if (arg.startsWith('--out-dir=')) {
      args.outDir = path.resolve(root, arg.slice('--out-dir='.length));
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function findCase(slug: string): AssayCaseDefinition {
  const found = registry.find((item) => item.slug === slug);
  if (!found) throw new Error(`Unknown assay case: ${slug}. Run pnpm assay -- --list.`);
  return found;
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: string): () => number {
  let state = hashSeed(seed) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 1_000_000) / 1_000_000;
  };
}

function shuffled<T>(items: T[], seed: string): T[] {
  const random = seededRandom(seed);
  const copy = items.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function selectCases(args: Args): AssayCaseDefinition[] {
  if (args.all) return registry.slice();
  if (args.cases.length) return unique(args.cases).map(findCase);

  const fixed = registry.filter((item) => item.fixedDefault);
  if (args.count <= fixed.length) return fixed.slice(0, args.count);

  const remaining = registry.filter((item) => !item.fixedDefault);
  const fill = args.random
    ? shuffled(remaining, args.seed)
    : remaining.slice().sort((a, b) => a.slug.localeCompare(b.slug));
  return fixed.concat(fill).slice(0, Math.min(args.count, registry.length));
}

async function loadTrace(definition: AssayCaseDefinition): Promise<RunTrace> {
  const raw = JSON.parse(await readFile(path.join(root, definition.fixturePath), 'utf8'));
  const fixture = assertSeedFixture(raw);
  return buildRunTrace(fixture, 'diverge', { lenses: [capstoneDemoLens] });
}

async function loadControl(definition: AssayCaseDefinition): Promise<CleanControl | undefined> {
  if (!definition.controlPath) return undefined;
  const raw = JSON.parse(await readFile(path.join(root, definition.controlPath), 'utf8')) as CleanControl;
  if (raw.caseSlug !== definition.slug) {
    throw new Error(`Control ${definition.controlPath} is for ${raw.caseSlug}, not ${definition.slug}.`);
  }
  return raw;
}

function selectionForDial(trace: RunTrace, dial: Dial): SelectionResult {
  return trace.comparison.focus.schedule.dial === dial ? trace.comparison.focus : trace.comparison.alternate;
}

function allSelectedCandidates(trace: RunTrace): SelectedCandidate[] {
  const byId = new Map<string, SelectedCandidate>();
  for (const candidate of selectionForDial(trace, 'diverge').selected.concat(selectionForDial(trace, 'diverge').rejected)) {
    byId.set(candidate.id, candidate);
  }
  return Array.from(byId.values());
}

function lensScore(trace: RunTrace, candidateId: string): number | null {
  const score = trace.lensResults.flatMap((result) => result.scores).find((item) => item.candidateId === candidateId);
  return score ? score.score : null;
}

function candidateStatus(candidate: SelectedCandidate, exploreIds: Set<string>, proofIds: Set<string>): AssayCandidate['status'] {
  const explore = exploreIds.has(candidate.id);
  const proof = proofIds.has(candidate.id);
  if (explore && proof) return 'stable';
  if (explore) return 'explore-only';
  if (proof) return 'proof-only';
  return 'not-selected';
}

function toAssayCandidate(trace: RunTrace, candidate: SelectedCandidate): AssayCandidate {
  const exploreIds = new Set(selectionForDial(trace, 'diverge').selected.map((item) => item.id));
  const proofIds = new Set(selectionForDial(trace, 'converge').selected.map((item) => item.id));
  return {
    id: candidate.id,
    title: candidate.title,
    thesis: candidate.thesis,
    generation: candidate.generation,
    parentId: `${candidate.parent.kind}:${candidate.parent.id}`,
    lineage: `${candidate.parent.kind}:${candidate.parent.id} -> ${candidate.id}`,
    operator: candidate.operatorLabel,
    substrate: candidate.substrate,
    delta: candidate.delta.summary,
    novelty: candidate.fitness.novelty,
    grounding: candidate.fitness.grounding,
    decay: candidate.fitness.decay.factor,
    lens: lensScore(trace, candidate.id),
    selectedByExplore: exploreIds.has(candidate.id),
    selectedByProof: proofIds.has(candidate.id),
    status: candidateStatus(candidate, exploreIds, proofIds),
    ratingReason: `${candidate.fitness.reasons.novelty}; ${candidate.fitness.reasons.grounding}; ${candidate.selection.reason}`,
  };
}

function convergenceGroups(candidates: AssayCandidate[]): ConvergenceGroup[] {
  const groups = new Map<string, AssayCandidate[]>();
  for (const candidate of candidates) {
    const key = candidate.operator;
    groups.set(key, (groups.get(key) || []).concat(candidate));
  }
  return Array.from(groups.entries())
    .map(([label, group]) => ({
      label,
      count: group.length,
      candidates: group.map((candidate) => candidate.title),
    }))
    .filter((group) => group.count >= 2)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function scoreForConclusion(candidate: AssayCandidate): number {
  const selectedBonus = candidate.status === 'stable' ? 0.3 : candidate.status === 'explore-only' || candidate.status === 'proof-only' ? 0.15 : 0;
  const lens = candidate.lens || 0;
  return candidate.novelty + candidate.grounding + selectedBonus + (lens * 0.2);
}

function bestConclusion(candidates: AssayCandidate[]): AssayCandidate | undefined {
  return candidates.slice().sort((a, b) => scoreForConclusion(b) - scoreForConclusion(a))[0];
}

function bestOutlier(candidates: AssayCandidate[]): AssayCandidate | undefined {
  return candidates
    .filter((candidate) => candidate.status !== 'stable')
    .sort((a, b) => (b.novelty - b.grounding) - (a.novelty - a.grounding) || b.novelty - a.novelty)[0];
}

function generationLine(trace: RunTrace): string {
  const generation = trace.generations.find((item) => item.index === 2);
  if (!generation) return 'not run';
  return `${generation.quality}: ${generation.detail}`;
}

function assayResult(definition: AssayCaseDefinition, trace: RunTrace, control?: CleanControl): AssayResult {
  const candidates = allSelectedCandidates(trace).map((candidate) => toAssayCandidate(trace, candidate));
  return {
    definition,
    trace,
    candidates,
    convergence: convergenceGroups(candidates),
    control,
    bestConclusion: bestConclusion(candidates),
    bestOutlier: bestOutlier(candidates),
    gen2: generationLine(trace),
    failedChecks: trace.goalChecks.filter((check) => !check.passed).map((check) => check.id),
  };
}

function compact(value: string, max = 72): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length <= max ? normalized : `${normalized.slice(0, max - 3)}...`;
}

function tableCell(value: string): string {
  return compact(value.replace(/\|/g, '/'), 96);
}

function renderConsole(results: AssayResult[], args: Args): string {
  const controlCount = results.filter((result) => result.control).length;
  const lines = [
    'case -> conclusion -> control -> convergence -> outlier -> gen2 -> failed checks',
    `selection: count=${results.length}; controls=${controlCount}; mode=${args.random ? 'random-fill' : 'deterministic-fill'}; seed=${args.seed}; cases=${results.map((item) => item.definition.slug).join(', ')}`,
    '| case | conclusion | control | convergence | outlier | gen2 | failed checks |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ];
  for (const result of results) {
    const convergence = result.convergence.length
      ? result.convergence.map((group) => `${group.label} x${group.count}`).join('; ')
      : 'none';
    lines.push(`| ${tableCell(result.definition.label)} | ${tableCell(result.bestConclusion?.title || 'none')} | ${tableCell(result.control?.actualProblem || 'none')} | ${tableCell(convergence)} | ${tableCell(result.bestOutlier?.title || 'none')} | ${tableCell(result.gen2)} | ${tableCell(result.failedChecks.join(', ') || 'none')} |`);
  }
  return lines.join('\n');
}

function feedbackTemplate(results: AssayResult[]): FeedbackTemplate {
  return {
    schemaVersion: FEEDBACK_SCHEMA_VERSION,
    assaySchemaVersion: ASSAY_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    verdictScale: verdictScale.map((value) => ({ value, meaning: verdictHelp[value] })),
    cases: results.map((result) => ({
      slug: result.definition.slug,
      label: result.definition.label,
      caseVerdict: null,
      controlVerdict: null,
      notes: '',
      candidates: result.candidates.map((candidate) => ({
        id: candidate.id,
        title: candidate.title,
        verdict: null,
        notes: '',
      })),
    })),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function help(label: string, tip: string): string {
  return `<span class="help" tabindex="0" title="${escapeHtml(tip)}" data-tip="${escapeHtml(tip)}">${escapeHtml(label)}</span>`;
}

function metric(value: number | null): string {
  return value === null ? 'n/a' : value.toFixed(2);
}

function statusLabel(candidate: AssayCandidate): string {
  if (candidate.status === 'stable') return 'kept by Explore and Proof';
  if (candidate.status === 'explore-only') return 'Explore only';
  if (candidate.status === 'proof-only') return 'Proof only';
  return 'not selected';
}

function candidateCard(result: AssayResult, candidate: AssayCandidate): string {
  return `
    <article class="idea-card ${candidate.status}" data-card="${escapeHtml(`${result.definition.slug}:${candidate.id}`)}">
      <div class="idea-head">
        <div>
          <div class="kicker">${escapeHtml(statusLabel(candidate))} - g${candidate.generation}</div>
          <h4>${escapeHtml(candidate.title)}</h4>
        </div>
        <code>${escapeHtml(candidate.id)}</code>
      </div>
      <p>${escapeHtml(candidate.thesis)}</p>
      <dl>
        <div><dt>lineage</dt><dd>${escapeHtml(candidate.lineage)}</dd></div>
        <div><dt>operator</dt><dd>${escapeHtml(candidate.operator)}</dd></div>
        <div><dt>substrate</dt><dd>${escapeHtml(candidate.substrate)}</dd></div>
        <div><dt>delta</dt><dd>${escapeHtml(candidate.delta)}</dd></div>
      </dl>
      <div class="scores">
        <span>novelty ${metric(candidate.novelty)}</span>
        <span>grounding ${metric(candidate.grounding)}</span>
        <span>decay ${metric(candidate.decay)}</span>
        <span>lens ${metric(candidate.lens)}</span>
      </div>
      <details>
        <summary>Why it rated this way</summary>
        <p>${escapeHtml(candidate.ratingReason)}</p>
      </details>
      <div class="verdict-row" aria-label="Human verdict for ${escapeHtml(candidate.title)}">
        ${verdictScale.map((verdict) => `<button type="button" title="${escapeHtml(verdictHelp[verdict])}" data-case="${escapeHtml(result.definition.slug)}" data-candidate="${escapeHtml(candidate.id)}" data-verdict="${verdict}">${verdict}</button>`).join('')}
      </div>
    </article>`;
}

function controlBlock(result: AssayResult): string {
  const control = result.control;
  if (!control) {
    return '<p class="empty">No clean-agent control is attached to this case yet.</p>';
  }

  return `
    <section class="control-panel">
      <div class="control-head">
        <div>
          <div class="kicker">${escapeHtml(control.source)}</div>
          <h3>Clean-Agent Control</h3>
        </div>
        <div class="verdict-row control-verdict" aria-label="Control verdict for ${escapeHtml(result.definition.label)}">
          ${verdictScale.map((verdict) => `<button type="button" title="${escapeHtml(verdictHelp[verdict])}" data-control-case="${escapeHtml(result.definition.slug)}" data-control-verdict="${verdict}">${verdict}</button>`).join('')}
        </div>
      </div>
      <article class="control-problem">
        <div class="kicker">actual problem</div>
        <p>${escapeHtml(control.actualProblem)}</p>
      </article>
      <div class="control-grid">
        <div>
          <h4>Discovery Insights</h4>
          ${control.discoveryInsights.map((item) => `
            <article class="mini-card control-card">
              <h5>${escapeHtml(item.title)}</h5>
              <p>${escapeHtml(item.detail)}</p>
            </article>`).join('')}
        </div>
        <div>
          <h4>Ideas / Opportunities</h4>
          ${control.ideas.map((item) => `
            <article class="mini-card control-card">
              <h5>${escapeHtml(item.title)}</h5>
              <p>${escapeHtml(item.detail)}</p>
            </article>`).join('')}
        </div>
        <div>
          <h4>Next Tests</h4>
          <ul class="test-list">
            ${control.nextTests.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      </div>
    </section>`;
}

function convergenceBlock(result: AssayResult): string {
  if (!result.convergence.length) return '<p class="empty">No repeated operator theme reached two candidates.</p>';
  return result.convergence.map((group) => `
    <article class="mini-card">
      <h4>${escapeHtml(group.label)} x${group.count}</h4>
      <p>${escapeHtml(group.candidates.join('; '))}</p>
    </article>`).join('');
}

function rejectedBlock(trace: RunTrace): string {
  if (!trace.lineage.rejected.length) return '<p class="empty">No no-delta rejects.</p>';
  return trace.lineage.rejected.map((node) => `
    <article class="mini-card rejected">
      <h4>${escapeHtml(node.title)}</h4>
      <p>${escapeHtml(node.rejectionReason || 'Rejected before scoring.')}</p>
      <code>${escapeHtml(`${node.parent.kind}:${node.parent.id} -> ${node.id}`)}</code>
    </article>`).join('');
}

function caseSection(result: AssayResult): string {
  const selected = result.candidates.filter((candidate) => candidate.status !== 'not-selected');
  const outliers = result.bestOutlier ? [result.bestOutlier] : [];
  const convergence = result.convergence.length
    ? result.convergence.map((group) => `${group.label} x${group.count}`).join('; ')
    : 'none';
  const hasControl = Boolean(result.control);
  const controlProblem = result.control?.actualProblem || 'no clean-agent control yet';
  return `
    <details class="case-section" id="${escapeHtml(result.definition.slug)}">
      <summary class="case-head">
        <div class="case-title">
          <div class="kicker">${escapeHtml(result.definition.caseStudyPath)}</div>
          <h2>${escapeHtml(result.definition.label)}</h2>
        </div>
        <div class="headline-grid">
          <div><span>${help('kernel', 'The kernel result from this assay run.')}</span><strong>${escapeHtml(result.bestConclusion?.title || 'none')}</strong></div>
          <div class="${hasControl ? 'has-control' : ''}"><span>${help('control', 'A clean-context agent answer for comparison, when available.')}</span><strong>${escapeHtml(compact(controlProblem, 82))}</strong>${hasControl ? '<em>clean-agent attached</em>' : ''}</div>
          <div><span>${help('convergence', 'Repeated themes or operators across candidates. Useful when several ideas point at the same hidden variable.')}</span><strong>${escapeHtml(compact(convergence, 82))}</strong></div>
          <div><span>${help('gen2', 'Whether generation-2 children improved, drifted, duplicated, or did not run.')}</span><strong>${escapeHtml(compact(result.gen2, 82))}</strong></div>
        </div>
      </summary>
      <div class="case-body">
      <div class="case-summary">
        <article>
          <div class="kicker">${help('strongest conclusion', 'The current best kernel-nominated discovery for this case. Human verdict can override it.')}</div>
          <h3>${escapeHtml(result.bestConclusion?.title || 'none')}</h3>
          <p>${escapeHtml(result.bestConclusion?.thesis || 'No candidates generated.')}</p>
        </article>
        <article>
          <div class="kicker">${help('clean-agent control', 'A single clean-context answer produced without kernel machinery. It is a baseline, not a judge.')}</div>
          <h3>${hasControl ? 'attached' : 'none attached'}</h3>
          <p>${escapeHtml(controlProblem)}</p>
        </article>
        <article>
          <div class="kicker">${help('generation 2', 'A bounded child generation from selected parents. Improved means child beat parent score; drifted means it changed without beating parent.')}</div>
          <h3>${escapeHtml(result.gen2.split(':')[0])}</h3>
          <p>${escapeHtml(result.gen2)}</p>
        </article>
        <article>
          <div class="kicker">${help('failed checks', 'Run-level contract/proof failures. Passing checks does not mean the ideas are true.')}</div>
          <h3>${escapeHtml(result.failedChecks.length ? `${result.failedChecks.length}` : 'none')}</h3>
          <p>${escapeHtml(result.failedChecks.join(', ') || 'Goal checks passed.')}</p>
        </article>
      </div>
      ${controlBlock(result)}
      <div class="scan-grid">
        <div>
          <h3>${help('What It Found', 'Repeated discovery terrain. Start here when scanning for soil enrichment.')}</h3>
          <div class="mini-grid">${convergenceBlock(result)}</div>
        </div>
        <div>
          <h3>${help('Interesting Outlier', 'A high-novelty or non-stable candidate that may be fertile even if it did not win.')}</h3>
          <div class="idea-list">${outliers.map((candidate) => candidateCard(result, candidate)).join('') || '<p class="empty">No outlier selected.</p>'}</div>
        </div>
      </div>
      <h3>${help('Promising Entries', 'Candidates selected by Explore, Proof, or both. These are nominated, not proven.')}</h3>
      <div class="idea-list">${selected.map((candidate) => candidateCard(result, candidate)).join('') || '<p class="empty">No selected candidates.</p>'}</div>
      <h3>${help('All Candidates', 'Every scored candidate in the combined pool. Use this when you want to audit what the kernel considered.')}</h3>
      <div class="idea-list">${result.candidates.map((candidate) => candidateCard(result, candidate)).join('')}</div>
      <h3>${help('Rejected Before Scoring', 'Source packets inspected but rejected because they produced no useful delta.')}</h3>
      <div class="mini-grid">${rejectedBlock(result.trace)}</div>
      </div>
    </details>`;
}

function renderHtml(results: AssayResult[], template: FeedbackTemplate, args: Args): string {
  const failed = results.reduce((sum, result) => sum + result.failedChecks.length, 0);
  const controlCount = results.filter((result) => result.control).length;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Discovery Assay</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #18211c;
      --muted: #607067;
      --line: #cfdbd3;
      --bg: #f6f8f4;
      --panel: #ffffff;
      --good: #dff4e6;
      --good-line: #46945c;
      --warn: #fff1d4;
      --warn-line: #b97919;
      --odd: #e8edff;
      --odd-line: #586fc0;
      --reject: #ecefec;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font: 14px/1.38 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main {
      width: min(1280px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 24px 0 40px;
    }
    h1, h2, h3, h4, h5, p { margin-top: 0; }
    h1 { margin-bottom: 4px; font-size: 27px; letter-spacing: 0; }
    h2 { font-size: 22px; letter-spacing: 0; }
    h3 { margin-bottom: 10px; font-size: 15px; letter-spacing: 0; text-transform: uppercase; color: var(--muted); }
    h4 { margin-bottom: 6px; font-size: 16px; letter-spacing: 0; }
    h5 { margin-bottom: 4px; font-size: 14px; letter-spacing: 0; }
    p { color: #34443b; }
    code {
      padding: 2px 5px;
      border: 1px solid var(--line);
      border-radius: 4px;
      background: #f3f6f1;
      color: #2f4237;
      font: 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }
    .hero, .case-section, .feedback-panel {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      padding: 16px;
      box-shadow: 2px 2px 0 rgba(24,33,28,.08);
    }
    .hero {
      margin-bottom: 14px;
      border-width: 2px;
      border-color: #25362c;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 12px;
    }
    .hero-card, .case-summary article, .mini-card, .idea-card {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      padding: 12px;
    }
    .kicker {
      margin-bottom: 5px;
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .facts {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 10px;
    }
    .facts span {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 5px 8px;
      background: #f8faf6;
      color: #34443b;
      font-size: 12px;
    }
    .case-section {
      margin-top: 14px;
      padding: 0;
      overflow: visible;
    }
    .case-section[open] {
      border-color: #25362c;
    }
    .case-head {
      position: relative;
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 14px;
      align-items: stretch;
      padding: 14px 16px;
      cursor: pointer;
      list-style: none;
    }
    .case-head::-webkit-details-marker { display: none; }
    .case-head::before {
      content: "+";
      position: absolute;
      right: 18px;
      margin-top: 3px;
      width: 23px;
      height: 23px;
      border: 1px solid var(--line);
      border-radius: 999px;
      text-align: center;
      line-height: 20px;
      background: #fff;
      font-weight: 800;
    }
    .case-section[open] .case-head::before { content: "-"; }
    .case-title h2 { margin-bottom: 0; padding-right: 24px; }
    .headline-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      padding-right: 30px;
    }
    .headline-grid div {
      border: 1px solid var(--line);
      border-radius: 7px;
      padding: 8px;
      background: #f8faf6;
      min-height: 72px;
    }
    .headline-grid .has-control {
      border-color: #25362c;
      background: #f8fbff;
    }
    .headline-grid span {
      display: block;
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .headline-grid strong {
      display: block;
      margin-top: 4px;
      color: #26362d;
      font-size: 13px;
      line-height: 1.24;
    }
    .headline-grid em {
      display: inline-block;
      margin-top: 6px;
      border: 1px solid #b8c8dd;
      border-radius: 999px;
      padding: 2px 6px;
      color: #2f4a64;
      background: #fff;
      font-size: 11px;
      font-style: normal;
    }
    .case-body {
      border-top: 1px solid var(--line);
      padding: 16px;
    }
    .case-summary {
      display: grid;
      grid-template-columns: 1.25fr 1.05fr .85fr .65fr;
      gap: 10px;
      margin-bottom: 14px;
    }
    .case-summary h3 {
      margin-bottom: 6px;
      color: var(--ink);
      text-transform: none;
      font-size: 18px;
    }
    .scan-grid {
      display: grid;
      grid-template-columns: .9fr 1.1fr;
      gap: 12px;
      margin-bottom: 14px;
    }
    .control-panel {
      border: 2px solid #25362c;
      border-radius: 8px;
      background: #f8fbff;
      padding: 12px;
      margin-bottom: 14px;
    }
    .control-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: start;
      margin-bottom: 10px;
    }
    .control-problem {
      border: 1px solid #b8c8dd;
      border-radius: 8px;
      background: #fff;
      padding: 10px;
      margin-bottom: 10px;
    }
    .control-problem p { margin-bottom: 0; }
    .control-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }
    .control-card {
      margin-bottom: 8px;
      border-color: #b8c8dd;
    }
    .test-list {
      display: grid;
      gap: 6px;
      margin: 0;
      padding-left: 18px;
      color: #34443b;
    }
    .mini-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .mini-card p { margin-bottom: 0; }
    .mini-card.rejected { background: var(--reject); }
    .idea-list {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 14px;
    }
    .idea-card { border-left-width: 5px; }
    .idea-card.stable { background: var(--good); border-color: var(--good-line); }
    .idea-card.explore-only, .idea-card.proof-only { background: var(--warn); border-color: var(--warn-line); }
    .idea-card.not-selected { background: var(--panel); border-color: var(--line); }
    .idea-card[data-marked="keeper"], .idea-card[data-marked="investigate"] { outline: 3px solid rgba(70,148,92,.35); }
    .idea-card[data-marked="dead"], .idea-card[data-marked="obvious"] { opacity: .78; }
    .idea-head {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: start;
    }
    dl {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin: 0 0 10px;
    }
    dt {
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    dd { margin: 2px 0 0; color: #2f4237; }
    .scores {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin: 9px 0;
    }
    .scores span {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 4px 7px;
      background: #f8faf6;
      color: #34443b;
      font-size: 12px;
    }
    details {
      margin-top: 8px;
      color: var(--muted);
    }
    summary { cursor: pointer; }
    .verdict-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }
    button {
      border: 1px solid var(--line);
      border-radius: 999px;
      background: #fff;
      color: #26362d;
      padding: 5px 8px;
      cursor: pointer;
      font: inherit;
      font-size: 12px;
    }
    button.active {
      border-color: #26362d;
      background: #26362d;
      color: #fff;
    }
    .help {
      position: relative;
      border-bottom: 1px dotted #69786e;
      cursor: help;
    }
    .help:focus {
      outline: 2px solid rgba(70,148,92,.35);
      outline-offset: 2px;
    }
    .help::after {
      position: absolute;
      left: 0;
      bottom: calc(100% + 7px);
      z-index: 20;
      width: 250px;
      padding: 8px;
      border: 1px solid #25362c;
      border-radius: 6px;
      background: #18211c;
      color: #fff;
      content: attr(data-tip);
      font: 12px/1.3 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      opacity: 0;
      pointer-events: none;
      transform: translateY(4px);
      transition: opacity .12s ease, transform .12s ease;
      text-transform: none;
      letter-spacing: 0;
    }
    .help:hover::after, .help:focus::after {
      opacity: 1;
      transform: translateY(0);
    }
    .feedback-panel {
      margin-top: 14px;
    }
    .feedback-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    .feedback-note {
      margin-bottom: 8px;
      color: var(--muted);
      font-size: 13px;
    }
    .feedback-status {
      color: #315d40;
      font-weight: 700;
    }
    textarea {
      width: 100%;
      min-height: 180px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px;
      font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      color: #1f2b24;
      background: #fbfdf9;
    }
    .empty {
      border: 1px dashed var(--line);
      border-radius: 8px;
      padding: 12px;
      color: var(--muted);
      background: #fbfcfa;
    }
    @media (max-width: 900px) {
      .hero-grid, .case-head, .headline-grid, .case-summary, .scan-grid, .mini-grid, .idea-list, dl, .control-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  ${renderViewNav('assay', {
    assay: 'index.html',
    microscope: '../microscope/index.html',
    architecture: '../microscope/architecture.html',
  }, { hubHref: '../../index.html', hubLabel: 'Root hub' })}
  <main>
    <section class="hero">
      <h1>Discovery Assay</h1>
      <p>This run asks whether the kernel makes five cases more fertile. It is not asking whether the machine solved them. Case rows are collapsed by default; expand only the ones worth inspecting.</p>
      <div class="facts">
        <span>schema ${escapeHtml(ASSAY_SCHEMA_VERSION)}</span>
        <span>cases ${results.length}</span>
        <span>controls ${controlCount}/${results.length}</span>
        <span>mode ${escapeHtml(args.random ? 'random fill' : 'deterministic fill')}</span>
        <span>seed ${escapeHtml(args.seed)}</span>
        <span>failed checks ${failed}</span>
      </div>
      <div class="hero-grid">
        <article class="hero-card">
          <h3>Outcome Gate</h3>
          <p>After these cases, did the run surface at least 3-5 entries you would mark ${help('interesting', verdictHelp.interesting)}, ${help('investigate', verdictHelp.investigate)}, or ${help('keeper', verdictHelp.keeper)}?</p>
        </article>
        <article class="hero-card">
          <h3>Controls</h3>
          <p>${controlCount}/${results.length} cases have a clean-agent control. In the collapsed rows, look for the <strong>control</strong> cell; open that row to compare the kernel output against the baseline and rate both.</p>
        </article>
      </div>
    </section>

    ${results.map(caseSection).join('')}

    <section class="feedback-panel" id="feedback">
      <h2>Feedback</h2>
      <p class="feedback-note">Verdict buttons update this JSON locally in your browser. They do not save to the repo or server until you copy/download the JSON and decide to preserve it. <span class="feedback-status" id="feedback-status">No verdicts marked yet.</span></p>
      <div class="feedback-actions">
        <button type="button" id="copy-feedback">Copy JSON</button>
        <button type="button" id="download-feedback">Download JSON</button>
      </div>
      <textarea id="feedback-json" spellcheck="false"></textarea>
    </section>
  </main>
  <script>
    const feedback = ${jsonForScript(template)};

    function findCandidate(caseSlug, candidateId) {
      const foundCase = feedback.cases.find((item) => item.slug === caseSlug);
      if (!foundCase) return undefined;
      return foundCase.candidates.find((candidate) => candidate.id === candidateId);
    }

    function findCase(caseSlug) {
      return feedback.cases.find((item) => item.slug === caseSlug);
    }

    function verdictCount() {
      return feedback.cases.reduce((sum, item) => {
        const caseCount = item.caseVerdict ? 1 : 0;
        const controlCount = item.controlVerdict ? 1 : 0;
        const candidateCount = item.candidates.filter((candidate) => candidate.verdict).length;
        return sum + caseCount + controlCount + candidateCount;
      }, 0);
    }

    function renderFeedback() {
      document.getElementById('feedback-json').value = JSON.stringify(feedback, null, 2);
      const count = verdictCount();
      document.getElementById('feedback-status').textContent = count ? count + ' verdict(s) marked locally.' : 'No verdicts marked yet.';
    }

    function markCard(caseSlug, candidateId, verdict) {
      document.querySelectorAll('[data-card="' + caseSlug + ':' + candidateId + '"]').forEach((card) => {
        card.dataset.marked = verdict;
      });
      document.querySelectorAll('[data-case="' + caseSlug + '"][data-candidate="' + candidateId + '"]').forEach((button) => {
        button.classList.toggle('active', button.dataset.verdict === verdict);
      });
    }

    document.querySelectorAll('[data-verdict]').forEach((button) => {
      button.addEventListener('click', () => {
        const candidate = findCandidate(button.dataset.case, button.dataset.candidate);
        if (!candidate) return;
        candidate.verdict = button.dataset.verdict;
        markCard(button.dataset.case, button.dataset.candidate, button.dataset.verdict);
        renderFeedback();
      });
    });

    document.querySelectorAll('[data-control-verdict]').forEach((button) => {
      button.addEventListener('click', () => {
        const foundCase = findCase(button.dataset.controlCase);
        if (!foundCase) return;
        foundCase.controlVerdict = button.dataset.controlVerdict;
        document.querySelectorAll('[data-control-case="' + button.dataset.controlCase + '"]').forEach((item) => {
          item.classList.toggle('active', item.dataset.controlVerdict === button.dataset.controlVerdict);
        });
        renderFeedback();
      });
    });

    document.getElementById('copy-feedback').addEventListener('click', async () => {
      renderFeedback();
      await navigator.clipboard.writeText(document.getElementById('feedback-json').value);
    });

    document.getElementById('download-feedback').addEventListener('click', () => {
      renderFeedback();
      const blob = new Blob([document.getElementById('feedback-json').value], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'assay-feedback.json';
      link.click();
      URL.revokeObjectURL(url);
    });

    renderFeedback();
  </script>
</body>
</html>`;
}

async function writeOutputs(args: Args, results: AssayResult[]): Promise<void> {
  const template = feedbackTemplate(results);
  await mkdir(args.outDir, { recursive: true });
  await writeFile(path.join(args.outDir, 'index.html'), renderHtml(results, template, args), 'utf8');
  await writeFile(path.join(args.outDir, 'feedback-template.json'), JSON.stringify(template, null, 2), 'utf8');
  await writeFile(path.join(args.outDir, 'assay-summary.json'), JSON.stringify({
    schemaVersion: ASSAY_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    cases: results.map((result) => ({
      slug: result.definition.slug,
      label: result.definition.label,
      fixturePath: result.definition.fixturePath,
      caseStudyPath: result.definition.caseStudyPath,
      controlPath: result.definition.controlPath || null,
      controlActualProblem: result.control?.actualProblem || null,
      bestConclusion: result.bestConclusion?.title || null,
      bestOutlier: result.bestOutlier?.title || null,
      convergence: result.convergence,
      gen2: result.gen2,
      failedChecks: result.failedChecks,
    })),
  }, null, 2), 'utf8');
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.list) {
    for (const item of registry) {
      console.log(`${item.slug} -> ${item.fixturePath}${item.controlPath ? `; control=${item.controlPath}` : ''}${item.fixedDefault ? ' (fixed default)' : ''}`);
    }
    return;
  }

  const definitions = selectCases(args);
  const traces = await Promise.all(definitions.map(loadTrace));
  const controls = await Promise.all(definitions.map(loadControl));
  const results = definitions.map((definition, index) => assayResult(definition, traces[index], controls[index]));
  await writeOutputs(args, results);
  console.log(renderConsole(results, args));
  console.log(`html: ${path.relative(root, path.join(args.outDir, 'index.html'))}`);
  console.log(`feedback: ${path.relative(root, path.join(args.outDir, 'feedback-template.json'))}`);

  if (results.some((result) => result.failedChecks.length > 0)) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
