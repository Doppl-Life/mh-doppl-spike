/**
 * Shared crucible-side harness helper: read the repo's real `.cursor/skills/*`
 * frontmatter into parsed skills (+ a list of unlineaged ones). Used by both the
 * view-data generator and the live drift gate. Not part of the portable folder.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSkill } from '../skill-lineage/index';
import type { Skill } from '../skill-lineage/index';

/** Resolve the repo root from a harness file's `import.meta.url`. */
export function repoRootFrom(metaUrl: string): string {
  // <repo>/ts-modules/skill-lineage/{scripts|test}/<file> → up 3 dirs
  return resolve(dirname(fileURLToPath(metaUrl)), '../../..');
}

export interface Unlineaged {
  name: string;
  reason: string;
}

export interface Collected {
  repoRoot: string;
  skillsDir: string;
  lineageMdPath: string;
  hasSkills: boolean;
  skills: Skill[];
  unlineaged: Unlineaged[];
}

export function collectSkills(repoRoot: string): Collected {
  const skillsDir = join(repoRoot, '.cursor/skills');
  const lineageMdPath = join(repoRoot, 'skills/LINEAGE.md');
  const skills: Skill[] = [];
  const unlineaged: Unlineaged[] = [];
  const hasSkills = existsSync(skillsDir);

  if (hasSkills) {
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
  }

  return { repoRoot, skillsDir, lineageMdPath, hasSkills, skills, unlineaged };
}
