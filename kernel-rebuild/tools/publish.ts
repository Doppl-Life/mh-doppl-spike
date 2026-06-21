import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderViewNav, stripViewNav, type KernelView } from './view-nav.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'out');
const publishedDir = path.join(root, 'published');

// out/** is ephemeral and gitignored; published/** is the committed, deployable
// surface that build_index.py discovers and links from the root hub. Filenames are
// flattened so none collide with the repo-wide gitignored `index.html` rule.
type Page = { from: string; to: string; view: KernelView };

const pages: Page[] = [
  { from: 'assay/index.html', to: 'assay.html', view: 'assay' },
  { from: 'microscope/index.html', to: 'microscope.html', view: 'microscope' },
  { from: 'microscope/architecture.html', to: 'architecture.html', view: 'architecture' },
];

const publishedHrefs = {
  assay: 'assay.html',
  microscope: 'microscope.html',
  architecture: 'architecture.html',
};

function injectNav(html: string, active: KernelView): string {
  const nav = renderViewNav(active, publishedHrefs, { hubHref: '/', hubLabel: 'Root hub' });
  const cleanHtml = stripViewNav(html);
  const bodyOpen = /<body[^>]*>/i.exec(cleanHtml);
  if (bodyOpen) {
    const insertAt = bodyOpen.index + bodyOpen[0].length;
    return cleanHtml.slice(0, insertAt) + nav + cleanHtml.slice(insertAt);
  }
  // No <body> (unexpected) — prepend so the nav is never lost.
  return nav + cleanHtml;
}

function assertNav(html: string, dest: string): void {
  if (!html.includes('class="kernel-view-nav"')) {
    throw new Error(`Published page is missing kernel view header: ${dest}`);
  }
}

async function main(): Promise<void> {
  await mkdir(publishedDir, { recursive: true });
  const published: string[] = [];
  const missing: string[] = [];
  for (const page of pages) {
    const src = path.join(outDir, page.from);
    const dest = path.join(publishedDir, page.to);
    try {
      const html = await readFile(src, 'utf8');
      const output = injectNav(html, page.view);
      assertNav(output, path.relative(root, dest));
      await writeFile(dest, output, 'utf8');
      published.push(page.to);
    } catch {
      missing.push(page.from);
    }
  }

  for (const name of published) {
    console.log(`published: ${path.relative(root, path.join(publishedDir, name))}`);
  }
  if (missing.length > 0) {
    console.warn(`skipped (regenerate first): ${missing.join(', ')}`);
  }

  const live = (await readdir(publishedDir)).filter((f) => f.endsWith('.html')).sort();
  console.log(`published/ now holds ${live.length} page(s): ${live.join(', ')}`);
}

await main();
