/**
 * Live generator + drift check.
 *
 * Reads the real `.cursor/skills/*` frontmatter, builds the studbook, diffs it
 * against `skills/LINEAGE.md`, and writes the React Flow view data. Run with:
 *
 *   npx tsx scripts/build-view-data.ts
 *
 * Not part of the portable folder — it's a crucible-side harness tool.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  boundary,
  buildStudbook,
  diffStudbook,
  parseSkill,
  toReactFlow,
} from '../skill-lineage/index';
import type { Skill } from '../skill-lineage/index';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');
const skillsDir = join(repoRoot, '.cursor/skills');
const lineageMdPath = join(repoRoot, 'skills/LINEAGE.md');
const outPath = join(repoRoot, 'prototypes/react-flow-demo/src/skillLineageData.generated.json');

const skills: Skill[] = [];
const unlineaged: Array<{ name: string; reason: string }> = [];
for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = join(skillsDir, entry.name, 'SKILL.md');
  if (!existsSync(file)) continue;
  try {
    skills.push(
      parseSkill(readFileSync(file, 'utf8'), {
        expressesAt: [`.cursor/skills/${entry.name}`],
      }),
    );
  } catch (err) {
    unlineaged.push({ name: entry.name, reason: (err as Error).message });
  }
}

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
