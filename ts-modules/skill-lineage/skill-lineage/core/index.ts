import { parse as parseYaml } from 'yaml';
import { BoundaryContract, Lineage, Skill } from '../contract/index';
import type {
  DriftReport,
  LineageGraphProjection,
  StudbookEdge,
  StudbookNode,
} from '../contract/index';

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

/** Extract and YAML-parse the leading `---` frontmatter block of a markdown doc. */
export function parseFrontmatter(markdown: string): Record<string, unknown> {
  const match = FRONTMATTER_RE.exec(markdown.replace(/^\uFEFF/, '').trimStart());
  if (!match || match[1] === undefined) {
    throw new Error('skill-lineage: no leading `---` frontmatter block found');
  }
  const data = parseYaml(match[1]) as unknown;
  if (data === null || typeof data !== 'object') {
    throw new Error('skill-lineage: frontmatter did not parse to an object');
  }
  return data as Record<string, unknown>;
}

/** Parse one SKILL.md into a typed {@link Skill} (name + description + pedigree). */
export function parseSkill(
  markdown: string,
  opts: { expressesAt?: string[] } = {},
): Skill {
  const fm = parseFrontmatter(markdown);
  if (fm['lineage'] === undefined) {
    throw new Error('skill-lineage: frontmatter has no `lineage:` block');
  }
  // Pass the RAW lineage; Skill's `lineage: Lineage` runs the snake→camel
  // transform exactly once. (Pre-transforming here would double-parse and drop
  // renamed fields like mutagen_class → mutagenClass.)
  return Skill.parse({
    name: typeof fm['name'] === 'string' ? fm['name'] : '',
    description: typeof fm['description'] === 'string' ? fm['description'].trim() : null,
    lineage: fm['lineage'],
    expressesAt: opts.expressesAt ?? [],
  });
}

/** Parse just the `lineage:` pedigree from a SKILL.md. */
export function parseLineage(markdown: string): Skill['lineage'] {
  const fm = parseFrontmatter(markdown);
  if (fm['lineage'] === undefined) {
    throw new Error('skill-lineage: frontmatter has no `lineage:` block');
  }
  return Lineage.parse(fm['lineage']);
}

/**
 * Build the derived studbook graph from many parsed skills. Skills that share a
 * lineage id (the same organ expressed in multiple hosts) collapse to one node
 * whose `expressesAt` is the union of host paths.
 */
export function buildStudbook(skills: Skill[]): LineageGraphProjection {
  const byId = new Map<string, StudbookNode>();

  for (const skill of skills) {
    const l = skill.lineage;
    const existing = byId.get(l.id);
    if (existing) {
      for (const path of skill.expressesAt) {
        if (!existing.expressesAt.includes(path)) existing.expressesAt.push(path);
      }
      continue;
    }
    byId.set(l.id, {
      id: l.id,
      label: skill.name || l.aka || l.id,
      generation: l.generation,
      parent: l.parent,
      progenitor: l.progenitor,
      mutagenClass: l.mutagenClass,
      mutation: l.mutation,
      stratum: l.stratum,
      status: l.status,
      bedrock: [...l.bedrock],
      expressesAt: [...skill.expressesAt],
    });
  }

  const nodes = [...byId.values()];
  const edges: StudbookEdge[] = [];
  for (const node of nodes) {
    if (node.parent) edges.push({ from: node.parent, to: node.id, kind: 'parent' });
    if (node.progenitor && node.progenitor !== node.parent) {
      edges.push({ from: node.progenitor, to: node.id, kind: 'progenitor' });
    }
  }
  return { nodes, edges };
}

interface TableRow {
  id: string;
  generation: string;
  status: string;
}

/** Tolerant parse of the LINEAGE.md roster table into {id, gen, status} rows. */
function parseLineageTable(markdown: string): TableRow[] {
  const rows: TableRow[] = [];
  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    const cells = trimmed.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 6) continue;
    const idCell = cells[0] ?? '';
    if (idCell === '' || idCell.toLowerCase().startsWith('lineage id')) continue;
    if (/^-{2,}$/.test(idCell.replace(/[\s:]/g, ''))) continue; // separator row
    const idMatch = /`([^`]+)`/.exec(idCell);
    if (!idMatch || idMatch[1] === undefined) continue;
    rows.push({
      id: idMatch[1],
      generation: (cells[1] ?? '').replace(/[^0-9]/g, ''),
      status: (cells[5] ?? '').toLowerCase(),
    });
  }
  return rows;
}

/**
 * Diff the studbook graph (derived from frontmatter — the source of truth)
 * against a hand-maintained LINEAGE.md table. Reports drift, never mutates.
 */
export function diffStudbook(
  graph: LineageGraphProjection,
  lineageMdTable: string,
): DriftReport {
  const tableRows = parseLineageTable(lineageMdTable);
  const tableById = new Map(tableRows.map((r) => [r.id, r]));
  const graphIds = new Set(graph.nodes.map((n) => n.id));

  const missingFromTable = graph.nodes
    .map((n) => n.id)
    .filter((id) => !tableById.has(id));
  const missingFromGraph = tableRows.map((r) => r.id).filter((id) => !graphIds.has(id));

  const mismatches: DriftReport['mismatches'] = [];
  for (const node of graph.nodes) {
    const row = tableById.get(node.id);
    if (!row) continue;
    if (row.generation !== '' && row.generation !== String(node.generation)) {
      mismatches.push({
        id: node.id,
        field: 'generation',
        frontmatter: String(node.generation),
        table: row.generation,
      });
    }
    if (row.status !== '' && row.status !== node.status) {
      mismatches.push({
        id: node.id,
        field: 'status',
        frontmatter: node.status,
        table: row.status,
      });
    }
  }

  return {
    ok: missingFromTable.length === 0 && missingFromGraph.length === 0 && mismatches.length === 0,
    missingFromTable,
    missingFromGraph,
    mismatches,
  };
}

function cell(value: string | null | undefined): string {
  const v = (value ?? '').trim();
  return v === '' ? '—' : v;
}

function code(value: string | null | undefined): string {
  const v = (value ?? '').trim();
  return v === '' ? '—' : `\`${v}\``;
}

/** Regenerate the LINEAGE.md roster table from the graph (table becomes derived). */
export function renderLineageTable(graph: LineageGraphProjection): string {
  const header =
    '| Lineage id | Gen | Parent | Mutation (what changed) | Stratum (observed) | Status | Expresses at | Bedrock evidence |';
  const sep = '| ---------- | --- | ------ | ----------------------- | ------------------ | ------ | ------------ | ---------------- |';
  const sorted = [...graph.nodes].sort(
    (a, b) => a.generation - b.generation || a.id.localeCompare(b.id),
  );
  const rows = sorted.map((n) => {
    const expresses = n.expressesAt.length ? n.expressesAt.join(', ') : '—';
    const bedrock = n.bedrock.length ? n.bedrock.join(', ') : '—';
    return `| ${code(n.id)} | ${n.generation} | ${code(n.parent)} | ${cell(n.mutation)} | ${cell(n.stratum)} | ${cell(n.status)} | ${expresses} | ${bedrock} |`;
  });
  return [header, sep, ...rows].join('\n') + '\n';
}

export interface ReactFlowNode {
  id: string;
  position: { x: number; y: number };
  data: {
    label: string;
    status: StudbookNode['status'];
    generation: number;
    mutagenClass: string | null;
  };
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  animated: boolean;
}

/** Adapt the projection into a React Flow node/edge set with a layered layout. */
export function toReactFlow(graph: LineageGraphProjection): {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
} {
  const byGen = new Map<number, StudbookNode[]>();
  for (const node of graph.nodes) {
    const bucket = byGen.get(node.generation) ?? [];
    bucket.push(node);
    byGen.set(node.generation, bucket);
  }

  const nodes: ReactFlowNode[] = [];
  for (const [generation, bucket] of [...byGen.entries()].sort((a, b) => a[0] - b[0])) {
    bucket.sort((a, b) => a.id.localeCompare(b.id));
    bucket.forEach((node, i) => {
      nodes.push({
        id: node.id,
        position: { x: generation * 260, y: i * 110 },
        data: {
          label: node.label,
          status: node.status,
          generation: node.generation,
          mutagenClass: node.mutagenClass,
        },
      });
    });
  }

  const present = new Set(graph.nodes.map((n) => n.id));
  const edges: ReactFlowEdge[] = graph.edges
    .filter((e) => present.has(e.from) && present.has(e.to))
    .map((e) => ({
      id: `${e.from}->${e.to}:${e.kind}`,
      source: e.from,
      target: e.to,
      label: e.kind,
      animated: e.kind === 'progenitor',
    }));

  return { nodes, edges };
}

/**
 * This module's boundary contract — the 5-node React Flow diagram and the
 * Prime DAG edge it will become:
 *
 *   [host skill dirs] → ⟦Lineage⟧ → (skill-lineage) → ⟦LineageGraphProjection⟧ → [registry + dashboard]
 */
export const boundary: BoundaryContract = BoundaryContract.parse({
  module: 'skill-lineage',
  entersFrom: {
    id: 'host-skill-dirs',
    label: 'Host expression layer (.cursor / .claude / .codex skills)',
    kind: 'datastore',
  },
  input: { name: 'Lineage', schemaId: 'skill-lineage/Lineage', direction: 'in' },
  output: {
    name: 'LineageGraphProjection',
    schemaId: 'contracts/LineageGraphProjection',
    direction: 'out',
  },
  exitsTo: {
    id: 'lineage-registry',
    label: 'Lineage registry + React Flow dashboard',
    kind: 'datastore',
  },
});
