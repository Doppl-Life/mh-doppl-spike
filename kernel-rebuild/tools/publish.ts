import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSeedFixture } from '../src/contracts/index.ts';
import { buildRunTrace } from '../src/trace.ts';
import { capstoneDemoLens } from './lens-config.ts';
import { renderAssayPage } from './assay.ts';
import { renderArchitecture } from './microscope/architecture.ts';
import { renderHtml as renderMicroscope } from './microscope/view.ts';
import { renderViewNav, stripViewNav, type KernelView, type KernelViewHrefs } from './view-nav.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixturesDir = path.join(root, 'fixtures');
const publishedDir = path.join(root, 'published');
const defaultFixturePath = path.join(fixturesDir, 'fsd-seed.json');
const architectureV2Path = path.join(root, 'tools', 'microscope', 'architecture-v2.html');

// published/** is the committed deployable surface that build_index.py discovers
// and links from the root hub. Filenames are flattened so none collide with the
// repo-wide gitignored `index.html` rule.
type Page = { to: string; view: KernelView; render: () => Promise<string> };

const publishedHrefs: KernelViewHrefs = {
  assay: 'assay.html',
  microscope: 'microscope.html',
  architecture: 'architecture.html',
  'architecture-v2': 'architecture-v2.html',
};

async function defaultTrace() {
  const raw = JSON.parse(await readFile(defaultFixturePath, 'utf8'));
  const fixture = assertSeedFixture(raw);
  return buildRunTrace(fixture, 'diverge', { lenses: [capstoneDemoLens] });
}

async function countFixtures(): Promise<number> {
  return (await readdir(fixturesDir)).filter((entry) => entry.endsWith('.json')).length;
}

function injectNav(html: string, active: KernelView): string {
  const nav = renderViewNav(active, publishedHrefs, { hubHref: '/', hubLabel: 'Root hub' });
  const cleanHtml = stripViewNav(html);
  const bodyOpen = /<body[^>]*>/i.exec(cleanHtml);
  if (bodyOpen) {
    const insertAt = bodyOpen.index + bodyOpen[0].length;
    return cleanHtml.slice(0, insertAt) + nav + cleanHtml.slice(insertAt);
  }
  return nav + cleanHtml;
}

function assertNav(html: string, dest: string): void {
  const count = html.match(/class="kernel-view-nav"/g)?.length || 0;
  if (count !== 1) {
    throw new Error(`Published page must have exactly one kernel view header: ${dest} (${count})`);
  }
}

async function pages(): Promise<Page[]> {
  const trace = await defaultTrace();
  const fixtureCount = await countFixtures();
  return [
    { to: 'assay.html', view: 'assay', render: renderAssayPage },
    { to: 'microscope.html', view: 'microscope', render: async () => renderMicroscope(trace) },
    { to: 'architecture.html', view: 'architecture', render: async () => renderArchitecture(trace, fixtureCount) },
    { to: 'architecture-v2.html', view: 'architecture-v2', render: async () => readFile(architectureV2Path, 'utf8') },
  ];
}

async function main(): Promise<void> {
  await mkdir(publishedDir, { recursive: true });
  const published: string[] = [];

  for (const page of await pages()) {
    const dest = path.join(publishedDir, page.to);
    const output = injectNav(await page.render(), page.view);
    assertNav(output, path.relative(root, dest));
    await writeFile(dest, output, 'utf8');
    published.push(page.to);
  }

  for (const name of published) {
    console.log(`published: ${path.relative(root, path.join(publishedDir, name))}`);
  }

  const live = (await readdir(publishedDir)).filter((f) => f.endsWith('.html')).sort();
  console.log(`published/ now holds ${live.length} page(s): ${live.join(', ')}`);
}

await main();
