import { copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'out');
const publishedDir = path.join(root, 'published');

// out/** is ephemeral and gitignored; published/** is the committed, deployable
// surface that build_index.py discovers and links from the root hub. Filenames are
// flattened so none collide with the repo-wide gitignored `index.html` rule.
const pages: Array<{ from: string; to: string }> = [
  { from: 'microscope/index.html', to: 'microscope.html' },
  { from: 'microscope/architecture.html', to: 'architecture.html' },
  { from: 'assay/index.html', to: 'assay.html' },
];

async function main(): Promise<void> {
  await mkdir(publishedDir, { recursive: true });
  const copied: string[] = [];
  const missing: string[] = [];
  for (const page of pages) {
    const src = path.join(outDir, page.from);
    const dest = path.join(publishedDir, page.to);
    try {
      await copyFile(src, dest);
      copied.push(page.to);
    } catch {
      missing.push(page.from);
    }
  }

  for (const name of copied) {
    console.log(`published: ${path.relative(root, path.join(publishedDir, name))}`);
  }
  if (missing.length > 0) {
    console.warn(
      `skipped (regenerate first): ${missing.join(', ')}`,
    );
  }

  const live = (await readdir(publishedDir)).filter((f) => f.endsWith('.html')).sort();
  console.log(`published/ now holds ${live.length} page(s): ${live.join(', ')}`);
}

await main();
