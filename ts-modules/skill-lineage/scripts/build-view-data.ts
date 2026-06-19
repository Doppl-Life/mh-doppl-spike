/**
 * Live generator + drift check.
 *
 * Reads the real `.cursor/skills/*` frontmatter, builds the studbook, diffs it
 * against `skills/LINEAGE.md`, and writes the React Flow view data. Run with:
 *
 *   GEN_VIEW=1 node ./node_modules/vitest/vitest.mjs run test/generator.test.ts
 *
 * (or `npx tsx scripts/build-view-data.ts` in a normal terminal). Not part of
 * the portable folder — it's a crucible-side harness tool.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { boundary, buildStudbook, diffStudbook, toReactFlow } from '../skill-lineage/index';
import { collectSkills, repoRootFrom } from './collect-skills';

const repoRoot = repoRootFrom(import.meta.url);
const { skills, unlineaged, lineageMdPath } = collectSkills(repoRoot);
const outPath = join(repoRoot, 'prototypes/react-flow-demo/src/skillLineageData.generated.json');

const graph = buildStudbook(skills);
const drift = diffStudbook(graph, readFileSync(lineageMdPath, 'utf8'));
const studbook = toReactFlow(graph);

writeFileSync(
  outPath,
  JSON.stringify(
    { generatedAt: new Date().toISOString(), boundary, studbook, drift, unlineaged },
    null,
    2,
  ),
);

console.log(`parsed ${skills.length} skills → ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
console.log(`wrote ${outPath}`);
if (unlineaged.length) {
  console.log('--- UNLINEAGED (skills with no `lineage:` block) ---');
  console.log(JSON.stringify(unlineaged, null, 2));
}
console.log('--- DRIFT REPORT (frontmatter is source of truth) ---');
console.log(JSON.stringify(drift, null, 2));
