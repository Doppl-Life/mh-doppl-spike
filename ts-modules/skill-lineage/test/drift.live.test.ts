import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildStudbook, diffStudbook } from '../skill-lineage/index';
import { collectSkills, repoRootFrom } from '../scripts/collect-skills';

/**
 * Live CI gate (authored-and-audited model): the studbook derived from the real
 * `.cursor/skills/*` frontmatter must stay in sync with `skills/LINEAGE.md`.
 * Runs as part of the normal suite; skips if the skills dir is absent (e.g.
 * once this folder is promoted into Doppl-Prime).
 */

const collected = collectSkills(repoRootFrom(import.meta.url));

// Skills knowingly accepted as carrying no `lineage:` block. A NEW unlineaged
// skill fails the gate until it gets a pedigree or is added here on purpose.
const KNOWN_UNLINEAGED = ['transcript-to-case-study'];

if (!collected.hasSkills) {
  describe.skip('drift gate (no .cursor/skills present — promoted context)', () => {
    it('skipped', () => undefined);
  });
} else {
  describe('drift gate — frontmatter ⇆ skills/LINEAGE.md', () => {
    const graph = buildStudbook(collected.skills);
    const drift = diffStudbook(graph, readFileSync(collected.lineageMdPath, 'utf8'));

    it('LINEAGE.md is in sync with skill frontmatter', () => {
      expect(drift.ok, `drift detected:\n${JSON.stringify(drift, null, 2)}`).toBe(true);
    });

    it('only the known-accepted skills are unlineaged', () => {
      expect([...collected.unlineaged.map((u) => u.name)].sort()).toEqual(
        [...KNOWN_UNLINEAGED].sort(),
      );
    });
  });
}
