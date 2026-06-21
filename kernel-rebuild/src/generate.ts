import type { Candidate, CandidatePool, LineageLedger, LineageNode, ReproductionOperator, SeedFixture, SourcePacket, TraceEvent } from './contracts/index.ts';
import { getBoundary } from './contracts/index.ts';

function operatorFor(packet: SourcePacket, operators: ReproductionOperator[]): ReproductionOperator {
  const operator = operators.find((item) => item.id === packet.operatorId);
  if (!operator) {
    throw new Error(`Unknown reproduction operator for ${packet.id}: ${packet.operatorId}`);
  }
  return operator;
}

function rejectNode(seedId: string, packet: SourcePacket): LineageNode {
  return {
    id: `reject-${packet.id}`,
    parentId: seedId,
    generation: 1,
    operatorId: packet.operatorId,
    operatorLabel: packet.operatorId,
    sourcePacketIds: [packet.id],
    title: packet.title,
    status: 'rejected',
    rejectionReason: packet.noDeltaReason || 'No candidate delta was produced.',
  };
}

function generateCandidate(seedId: string, packet: SourcePacket, operators: ReproductionOperator[]): Candidate {
  const operator = operatorFor(packet, operators);
  if (!packet.candidateId || !packet.candidate || !packet.delta || !packet.metrics) {
    throw new Error(`Cannot generate candidate from incomplete source packet: ${packet.id}`);
  }

  return {
    id: packet.candidateId,
    parentId: seedId,
    generation: 1,
    operatorId: operator.id,
    operatorLabel: operator.label,
    sourcePacketIds: [packet.id],
    subtype: packet.candidate.subtype || operator.defaultSubtype,
    title: packet.candidate.title,
    thesis: packet.candidate.thesis,
    substrate: packet.substrate,
    delta: packet.delta,
    claims: packet.claims || [],
    evidence: packet.evidence || [],
    metrics: packet.metrics,
  };
}

function generatedNode(candidate: Candidate): LineageNode {
  return {
    id: candidate.id,
    parentId: candidate.parentId,
    generation: candidate.generation,
    operatorId: candidate.operatorId,
    operatorLabel: candidate.operatorLabel,
    sourcePacketIds: candidate.sourcePacketIds,
    title: candidate.title,
    delta: candidate.delta,
    status: 'generated',
  };
}

export function generateCandidatePool(fixture: SeedFixture): {
  pool: CandidatePool;
  event: TraceEvent;
} {
  const rejected = fixture.sourcePackets
    .filter((packet) => packet.noDeltaReason)
    .map((packet) => rejectNode(fixture.seed.id, packet));
  const candidates = fixture.sourcePackets
    .filter((packet) => !packet.noDeltaReason)
    .map((packet) => generateCandidate(fixture.seed.id, packet, fixture.operators));
  const lineage: LineageLedger = {
    seedId: fixture.seed.id,
    generated: candidates.map(generatedNode),
    rejected,
  };
  const pool = {
    seed: fixture.seed,
    candidates,
    lineage,
  };

  return {
    pool,
    event: {
      stage: 'generate',
      input: `${fixture.seed.id}: ${fixture.seed.title}`,
      decision: `Generated ${pool.candidates.length} children from ${fixture.sourcePackets.length} source packets; rejected ${rejected.length} no-delta packets.`,
      reason: 'Generation now applies named reproduction operators to source packets and records child deltas before selection.',
      output: `CandidatePool(${pool.candidates.map((candidate) => candidate.id).join(', ')})`,
      goalChecks: [
        {
          id: 'shared-pool',
          label: 'One shared candidate pool exists before dial-specific selection.',
          passed: pool.candidates.length > 0,
          detail: `${pool.candidates.length} candidates are available to both dials.`,
        },
        {
          id: 'lineage-delta-visible',
          label: 'Every generated child states what changed from its parent.',
          passed: pool.candidates.every((candidate) => candidate.delta.changes.length > 0),
          detail: `${pool.candidates.length} generated children carry explicit deltas.`,
        },
        {
          id: 'no-delta-rejects-visible',
          label: 'No-delta source packets are rejected before selection.',
          passed: rejected.every((node) => node.rejectionReason) &&
            rejected.every((node) => !pool.candidates.some((candidate) => candidate.sourcePacketIds.includes(node.sourcePacketIds[0]))),
          detail: `${rejected.length} no-delta packets rejected before fitness.`,
        },
        {
          id: 'operator-source-lineage',
          label: 'Generated candidates carry operator and source packet lineage.',
          passed: pool.candidates.every((candidate) => candidate.operatorId && candidate.sourcePacketIds.length > 0 && candidate.generation === 1),
          detail: pool.candidates.map((candidate) => `${candidate.id}:${candidate.operatorId}/${candidate.sourcePacketIds.join('+')}`).join(', '),
        },
      ],
      boundary: getBoundary('generate'),
    },
  };
}
