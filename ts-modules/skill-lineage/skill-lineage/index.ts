/**
 * skill-lineage — the public boundary.
 *
 * The only surface consumers import. Everything is pure: parsing takes
 * strings, never disk; the host adapter (readDir/readFile) stays outside.
 */

export {
  BoundaryContract,
  ContractRef,
  DriftReport,
  Lineage,
  LineageGraphProjection,
  Skill,
  SkillStatus,
  SpaceRef,
  StudbookEdge,
  StudbookEdgeKind,
  StudbookNode,
} from './contract/index';

export {
  boundary,
  buildStudbook,
  diffStudbook,
  parseFrontmatter,
  parseLineage,
  parseSkill,
  renderLineageTable,
  toReactFlow,
} from './core/index';

export type { ReactFlowEdge, ReactFlowNode } from './core/index';
