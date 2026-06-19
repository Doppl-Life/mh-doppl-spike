import { describe, expect, it } from 'vitest';
import {
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
} from '../skill-lineage/index';

/**
 * Prime-style contract freeze (docs/prds/01-contract-freeze-prd.md): a frozen
 * field-name set per seam model, plus closed-enum rejection. A rename or new
 * field fails here, forcing a conscious update before it can drift into Prime.
 */

function shapeKeys(shape: Record<string, unknown>): string[] {
  return Object.keys(shape).sort();
}

describe('field-name sets (frozen)', () => {
  it('Lineage', () => {
    const parsed = Lineage.parse({ id: 'x', generation: 0, stratum: 'Lα', status: 'stable' });
    expect(Object.keys(parsed).sort()).toEqual([
      'aka',
      'bedrock',
      'generation',
      'id',
      'mutagenClass',
      'mutation',
      'note',
      'parent',
      'progenitor',
      'status',
      'stratum',
    ]);
  });

  it('Skill', () => {
    expect(shapeKeys(Skill.shape)).toEqual(['description', 'expressesAt', 'lineage', 'name']);
  });

  it('StudbookNode', () => {
    expect(shapeKeys(StudbookNode.shape)).toEqual([
      'bedrock',
      'expressesAt',
      'generation',
      'id',
      'label',
      'mutagenClass',
      'mutation',
      'parent',
      'progenitor',
      'status',
      'stratum',
    ]);
  });

  it('StudbookEdge', () => {
    expect(shapeKeys(StudbookEdge.shape)).toEqual(['from', 'kind', 'to']);
  });

  it('LineageGraphProjection', () => {
    expect(shapeKeys(LineageGraphProjection.shape)).toEqual(['edges', 'nodes']);
  });

  it('DriftReport', () => {
    expect(shapeKeys(DriftReport.shape)).toEqual([
      'mismatches',
      'missingFromGraph',
      'missingFromTable',
      'ok',
    ]);
  });

  it('BoundaryContract', () => {
    expect(shapeKeys(BoundaryContract.shape)).toEqual([
      'entersFrom',
      'exitsTo',
      'input',
      'module',
      'output',
    ]);
  });

  it('SpaceRef', () => {
    expect(shapeKeys(SpaceRef.shape)).toEqual(['id', 'kind', 'label']);
  });

  it('ContractRef', () => {
    expect(shapeKeys(ContractRef.shape)).toEqual(['direction', 'name', 'schemaId']);
  });
});

describe('closed enums reject unknown members', () => {
  it('SkillStatus', () => {
    for (const s of ['coined', 'working', 'stable', 'deprecated']) {
      expect(SkillStatus.safeParse(s).success).toBe(true);
    }
    expect(SkillStatus.safeParse('bogus').success).toBe(false);
  });

  it('StudbookEdgeKind', () => {
    expect(StudbookEdgeKind.safeParse('parent').success).toBe(true);
    expect(StudbookEdgeKind.safeParse('progenitor').success).toBe(true);
    expect(StudbookEdgeKind.safeParse('sibling').success).toBe(false);
  });

  it('SpaceRef.kind', () => {
    expect(SpaceRef.safeParse({ id: 'a', label: 'b', kind: 'datastore' }).success).toBe(true);
    expect(SpaceRef.safeParse({ id: 'a', label: 'b', kind: 'cloud' }).success).toBe(false);
  });

  it('ContractRef.direction', () => {
    expect(ContractRef.safeParse({ name: 'n', schemaId: 's', direction: 'in' }).success).toBe(true);
    expect(ContractRef.safeParse({ name: 'n', schemaId: 's', direction: 'sideways' }).success).toBe(
      false,
    );
  });
});
