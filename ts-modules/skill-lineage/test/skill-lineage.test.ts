import { describe, expect, it } from 'vitest';
import {
  boundary,
  buildStudbook,
  diffStudbook,
  parseLineage,
  parseSkill,
  renderLineageTable,
  toReactFlow,
} from '../skill-lineage/index';

const BREAKTHROUGH = `---
name: breakthrough
description: >
  Use this skill when the user wants a breakthrough idea.
lineage:
  id: rule-of-cool
  aka: breakthrough
  parent: null
  generation: 0
  mutation: null
  stratum: "Lα"
  status: stable
  bedrock: []
  note: "Phenotype renamed Rule of Cool → Breakthrough."
---

# Breakthrough

Body text.
`;

const POLYMATH = `---
name: polymath
description: >
  Import a proven mechanism from another field — the Medici Effect.
lineage:
  id: polymath
  parent: null
  progenitor: rule-of-cool
  generation: 1
  mutagen_class: domain-transfer
  mutation: "domain-transfer: import a proven technique from field B to crack field A"
  stratum: "Lα / L1 (ideation)"
  status: coined
  bedrock: []
---

# Polymath
`;

describe('parseLineage / parseSkill', () => {
  it('parses a gen-0 root', () => {
    const l = parseLineage(BREAKTHROUGH);
    expect(l.id).toBe('rule-of-cool');
    expect(l.aka).toBe('breakthrough');
    expect(l.generation).toBe(0);
    expect(l.parent).toBeNull();
    expect(l.status).toBe('stable');
    expect(l.bedrock).toEqual([]);
  });

  it('parses a gen-1 child and maps snake_case → camelCase', () => {
    const skill = parseSkill(POLYMATH, { expressesAt: ['.cursor/skills/polymath'] });
    expect(skill.name).toBe('polymath');
    expect(skill.description).toContain('Medici Effect');
    expect(skill.lineage.progenitor).toBe('rule-of-cool');
    expect(skill.lineage.mutagenClass).toBe('domain-transfer');
    expect(skill.expressesAt).toEqual(['.cursor/skills/polymath']);
  });

  it('throws on missing frontmatter', () => {
    expect(() => parseLineage('# no frontmatter')).toThrow(/frontmatter/);
  });
});

describe('buildStudbook', () => {
  it('builds nodes and a progenitor edge', () => {
    const skills = [parseSkill(BREAKTHROUGH), parseSkill(POLYMATH)];
    const graph = buildStudbook(skills);
    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toEqual([
      { from: 'rule-of-cool', to: 'polymath', kind: 'progenitor' },
    ]);
  });

  it('collapses the same lineage expressed in multiple hosts', () => {
    const graph = buildStudbook([
      parseSkill(POLYMATH, { expressesAt: ['.cursor/skills/polymath'] }),
      parseSkill(POLYMATH, { expressesAt: ['.claude/skills/polymath'] }),
    ]);
    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0]?.expressesAt).toEqual([
      '.cursor/skills/polymath',
      '.claude/skills/polymath',
    ]);
  });
});

describe('diffStudbook', () => {
  const graph = buildStudbook([parseSkill(BREAKTHROUGH), parseSkill(POLYMATH)]);

  it('reports ok against a faithful table', () => {
    const table = renderLineageTable(graph);
    expect(diffStudbook(graph, table).ok).toBe(true);
  });

  it('flags a row missing from the table', () => {
    const table = `
| Lineage id | Gen | Parent | Mutation | Stratum | Status | Expresses at | Bedrock |
| --- | --- | --- | --- | --- | --- | --- | --- |
| \`polymath\` | 1 | — | domain-transfer | Lα / L1 | coined | — | — |
`;
    const drift = diffStudbook(graph, table);
    expect(drift.ok).toBe(false);
    expect(drift.missingFromTable).toContain('rule-of-cool');
  });

  it('flags a status mismatch', () => {
    const table = `
| Lineage id | Gen | Parent | Mutation | Stratum | Status | Expresses at | Bedrock |
| --- | --- | --- | --- | --- | --- | --- | --- |
| \`rule-of-cool\` (aka **breakthrough**) | 0 | — | — | Lα | stable | — | — |
| \`polymath\` | 1 | — | domain-transfer | Lα / L1 | stable | — | — |
`;
    const drift = diffStudbook(graph, table);
    expect(drift.ok).toBe(false);
    expect(drift.mismatches).toContainEqual({
      id: 'polymath',
      field: 'status',
      frontmatter: 'coined',
      table: 'stable',
    });
  });
});

describe('renderLineageTable', () => {
  it('round-trips: rendered table diffs clean against its own graph', () => {
    const graph = buildStudbook([parseSkill(BREAKTHROUGH), parseSkill(POLYMATH)]);
    const table = renderLineageTable(graph);
    expect(table).toContain('`rule-of-cool`');
    expect(table).toContain('`polymath`');
    expect(diffStudbook(graph, table).ok).toBe(true);
  });
});

describe('toReactFlow', () => {
  it('lays out by generation and keeps only resolvable edges', () => {
    const graph = buildStudbook([parseSkill(BREAKTHROUGH), parseSkill(POLYMATH)]);
    const { nodes, edges } = toReactFlow(graph);
    expect(nodes).toHaveLength(2);
    const polymathNode = nodes.find((n) => n.id === 'polymath');
    expect(polymathNode?.position.x).toBe(260); // generation 1 → x = 260
    expect(edges).toHaveLength(1);
    expect(edges[0]?.animated).toBe(true); // progenitor edge
  });
});

describe('boundary', () => {
  it('exposes a valid 5-node boundary contract', () => {
    expect(boundary.module).toBe('skill-lineage');
    expect(boundary.entersFrom.kind).toBe('datastore');
    expect(boundary.output.name).toBe('LineageGraphProjection');
  });
});
