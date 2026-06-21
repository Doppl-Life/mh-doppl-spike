import type { CandidatePool, ScoredCandidate, ScoredCandidatePool, TraceEvent } from './contracts/index.ts';
import { clampScore, getBoundary } from './contracts/index.ts';

function scoreNovelty(candidate: CandidatePool['candidates'][number]): number {
  const m = candidate.metrics;
  return clampScore((m.sourceAbsence * 0.5) + (m.substrateDistance * 0.3) + (m.hiddenDependents * 0.2));
}

function scoreGrounding(candidate: CandidatePool['candidates'][number]): number {
  const m = candidate.metrics;
  return clampScore((m.signalStrength * 0.4) + (m.mechanismClarity * 0.25) + (m.falsifiability * 0.25) - (m.riskPenalty * 0.1));
}

function scoreCandidate(candidate: CandidatePool['candidates'][number]): ScoredCandidate {
  const novelty = scoreNovelty(candidate);
  const grounding = scoreGrounding(candidate);
  const m = candidate.metrics;

  return {
    ...candidate,
    fitness: {
      novelty,
      grounding,
      components: {
        sourceAbsence: m.sourceAbsence,
        substrateDistance: m.substrateDistance,
        hiddenDependents: m.hiddenDependents,
        signalStrength: m.signalStrength,
        mechanismClarity: m.mechanismClarity,
        falsifiability: m.falsifiability,
        riskPenalty: m.riskPenalty,
      },
      reasons: {
        novelty: `absence-from-record ${m.sourceAbsence}, substrate distance ${m.substrateDistance}, hidden dependents ${m.hiddenDependents}`,
        grounding: `signal strength ${m.signalStrength}, mechanism clarity ${m.mechanismClarity}, falsifiability ${m.falsifiability}, risk penalty ${m.riskPenalty}`,
      },
    },
  };
}

export function scoreCandidatePool(pool: CandidatePool): {
  scoredPool: ScoredCandidatePool;
  event: TraceEvent;
} {
  const candidates = pool.candidates.map(scoreCandidate);
  const scoredPool = { seed: pool.seed, candidates };

  return {
    scoredPool,
    event: {
      stage: 'fitness',
      input: `CandidatePool(${pool.candidates.length})`,
      decision: 'Scored every candidate on novelty and grounding without collapsing them into one fitness total.',
      reason: 'The two-axis claim must stay visible until selection decides how to use it.',
      output: `ScoredCandidatePool(${candidates.length})`,
      goalChecks: [
        {
          id: 'two-axis-visible',
          label: 'Every candidate carries novelty and grounding separately.',
          passed: candidates.every((candidate) => Number.isFinite(candidate.fitness.novelty) && Number.isFinite(candidate.fitness.grounding)),
          detail: 'No candidate has only a scalar total.',
        },
        {
          id: 'externalized-novelty',
          label: 'Novelty includes absence-from-record, not only embedding distance.',
          passed: candidates.every((candidate) => Number.isFinite(candidate.fitness.components.sourceAbsence)),
          detail: 'The novelty component exposes sourceAbsence for panel critique visibility.',
        },
      ],
      boundary: getBoundary('fitness'),
    },
  };
}
