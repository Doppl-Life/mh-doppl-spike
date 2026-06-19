import { z } from 'zod';

/**
 * The boundary contracts for `skill-lineage`.
 *
 * Authored in Zod (types via `z.infer`) to match Doppl-Prime's contract
 * language (ARCHITECTURE.md §4). On promotion these land in
 * `packages/contracts`; `LineageGraphProjection` already sits on Prime's
 * contract-freeze list (docs/prds/01-contract-freeze-prd.md).
 */

export const SkillStatus = z.enum(['coined', 'working', 'stable', 'deprecated']);
export type SkillStatus = z.infer<typeof SkillStatus>;

/**
 * Raw `lineage:` frontmatter as written in a SKILL.md — snake_case on the
 * wire, lenient about unknown keys so new fields never hard-fail a parse.
 */
const LineageRaw = z
  .object({
    id: z.string(),
    aka: z.string().nullable().default(null),
    parent: z.string().nullable().default(null),
    progenitor: z.string().nullable().default(null),
    generation: z.number().int(),
    mutagen_class: z.string().nullable().default(null),
    mutation: z.string().nullable().default(null),
    stratum: z.string(),
    status: SkillStatus,
    bedrock: z.array(z.string()).default([]),
    note: z.string().nullable().default(null),
  })
  .passthrough();

/** One skill's heritable pedigree, normalized to camelCase. */
export const Lineage = LineageRaw.transform((r) => ({
  id: r.id,
  aka: r.aka,
  parent: r.parent,
  progenitor: r.progenitor,
  generation: r.generation,
  mutagenClass: r.mutagen_class,
  mutation: r.mutation,
  stratum: r.stratum,
  status: r.status,
  bedrock: r.bedrock,
  note: r.note,
}));
export type Lineage = z.infer<typeof Lineage>;

/** A parsed skill = its phenotype name + description + its pedigree. */
export const Skill = z.object({
  name: z.string(),
  description: z.string().nullable().default(null),
  lineage: Lineage,
  /** Host paths where this expression was found (`.cursor/skills/...`). */
  expressesAt: z.array(z.string()).default([]),
});
export type Skill = z.infer<typeof Skill>;

export const StudbookNode = z.object({
  id: z.string(),
  label: z.string(),
  generation: z.number().int(),
  parent: z.string().nullable(),
  progenitor: z.string().nullable(),
  mutagenClass: z.string().nullable(),
  mutation: z.string().nullable(),
  stratum: z.string(),
  status: SkillStatus,
  bedrock: z.array(z.string()),
  expressesAt: z.array(z.string()),
});
export type StudbookNode = z.infer<typeof StudbookNode>;

export const StudbookEdgeKind = z.enum(['parent', 'progenitor']);
export type StudbookEdgeKind = z.infer<typeof StudbookEdgeKind>;

export const StudbookEdge = z.object({
  from: z.string(),
  to: z.string(),
  kind: StudbookEdgeKind,
});
export type StudbookEdge = z.infer<typeof StudbookEdge>;

/** The derived family tree. Mirrors Prime's frozen `LineageGraphProjection`. */
export const LineageGraphProjection = z.object({
  nodes: z.array(StudbookNode),
  edges: z.array(StudbookEdge),
});
export type LineageGraphProjection = z.infer<typeof LineageGraphProjection>;

/** Where frontmatter (source of truth) and a hand-maintained LINEAGE.md disagree. */
export const DriftReport = z.object({
  ok: z.boolean(),
  /** Lineage ids present in frontmatter but absent from the table. */
  missingFromTable: z.array(z.string()),
  /** Lineage ids present in the table but absent from frontmatter. */
  missingFromGraph: z.array(z.string()),
  /** Per-field disagreements for ids present in both. */
  mismatches: z.array(
    z.object({
      id: z.string(),
      field: z.string(),
      frontmatter: z.string(),
      table: z.string(),
    }),
  ),
});
export type DriftReport = z.infer<typeof DriftReport>;

/**
 * The reusable module boundary descriptor. One per ts-module: it renders as
 * the 5-node React Flow diagram (space → contract → module → contract → space),
 * encodes the promotion gate's "typed public API + injected I/O", and maps 1:1
 * onto a Prime import-direction DAG edge.
 */
export const SpaceRef = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(['datastore', 'stratum', 'module', 'external']),
});
export type SpaceRef = z.infer<typeof SpaceRef>;

export const ContractRef = z.object({
  name: z.string(),
  /** Stable id; maps to a Prime frozen contract when one exists. */
  schemaId: z.string(),
  direction: z.enum(['in', 'out']),
});
export type ContractRef = z.infer<typeof ContractRef>;

export const BoundaryContract = z.object({
  module: z.string(),
  entersFrom: SpaceRef,
  input: ContractRef,
  output: ContractRef,
  exitsTo: SpaceRef,
});
export type BoundaryContract = z.infer<typeof BoundaryContract>;
