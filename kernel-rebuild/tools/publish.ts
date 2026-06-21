import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'out');
const publishedDir = path.join(root, 'published');

// out/** is ephemeral and gitignored; published/** is the committed, deployable
// surface that build_index.py discovers and links from the root hub. Filenames are
// flattened so none collide with the repo-wide gitignored `index.html` rule. `label`
// drives the shared cross-page nav bar so a visitor can move between views (and back to
// the hub) without knowing any paths.
type Page = { from: string; to: string; label: string; blurb: string };

const pages: Page[] = [
  { from: 'microscope/index.html', to: 'microscope.html', label: 'Microscope', blurb: 'single-run trace' },
  { from: 'microscope/architecture.html', to: 'architecture.html', label: 'Architecture', blurb: 'system diagram' },
  { from: 'assay/index.html', to: 'assay.html', label: 'Assay', blurb: 'outcome discovery' },
];

const NAV_STYLE = `
<style>
.kx-nav{position:sticky;top:0;z-index:2147483647;display:flex;gap:.3rem;align-items:center;
flex-wrap:wrap;padding:.55rem .8rem;background:#0b0e13;border-bottom:1px solid #2a3544;
font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:.85rem;line-height:1.2;}
.kx-nav .kx-brand{color:#8b9bb0;font-weight:600;margin-right:.4rem;text-transform:uppercase;
letter-spacing:.06em;font-size:.7rem;}
.kx-nav a{color:#e8edf4;text-decoration:none;padding:.3rem .6rem;border-radius:6px;white-space:nowrap;}
.kx-nav a small{color:#8b9bb0;font-weight:400;margin-left:.35rem;}
.kx-nav a:hover{background:#1b232e;color:#c084fc;}
.kx-nav a:hover small{color:#c084fc;}
.kx-nav a.kx-active{background:#c084fc;color:#0b0e13;font-weight:650;}
.kx-nav a.kx-active small{color:#0b0e13;}
.kx-nav .kx-hub{margin-left:auto;color:#8b9bb0;}
</style>`;

function buildNav(activeFile: string): string {
  const links = pages
    .map((page) => {
      const active = page.to === activeFile ? ' kx-active' : '';
      return `<a class="kx-link${active}" href="${page.to}">${page.label}<small>${page.blurb}</small></a>`;
    })
    .join('');
  return (
    `${NAV_STYLE}` +
    `<nav class="kx-nav"><span class="kx-brand">Kernel views</span>${links}` +
    `<a class="kx-hub" href="/">All runs (hub) &rsaquo;</a></nav>`
  );
}

function injectNav(html: string, activeFile: string): string {
  const nav = buildNav(activeFile);
  const bodyOpen = /<body[^>]*>/i.exec(html);
  if (bodyOpen) {
    const insertAt = bodyOpen.index + bodyOpen[0].length;
    return html.slice(0, insertAt) + nav + html.slice(insertAt);
  }
  // No <body> (unexpected) — prepend so the nav is never lost.
  return nav + html;
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
      await writeFile(dest, injectNav(html, page.to), 'utf8');
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
