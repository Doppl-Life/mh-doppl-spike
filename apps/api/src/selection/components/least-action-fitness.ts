import type { LeastActionReviewEvidence } from "../../../verifier/council/least-action-review";

export type FitnessComponent = {
  raw: number;
  weight: number;
  contribution: number;
  explanation: string;
};

export type LeastActionFitnessComponents = {
  mechanismCost: FitnessComponent;
  leastActionFitness: FitnessComponent;
  dangerousUnderbuilding: FitnessComponent;
  antiPatternInversion: FitnessComponent;
};

export type LeastActionComponentWeights = {
  mechanismCost?: number;
  leastActionFitness?: number;
  dangerousUnderbuilding?: number;
  antiPatternInversion?: number;
};

const DEFAULT_WEIGHTS = {
  mechanismCost: -1,
  leastActionFitness: 1,
  dangerousUnderbuilding: -1,
  antiPatternInversion: 0.5,
} as const;

export function buildLeastActionFitnessComponents(
  evidence: LeastActionReviewEvidence,
  weights: LeastActionComponentWeights = {},
): LeastActionFitnessComponents {
  const resolvedWeights = { ...DEFAULT_WEIGHTS, ...weights };
  const unsafeDeletionCount = evidence.unsafeDeletions.length;
  const antiPatternRaw = evidence.antiPatternInversion.passes
    ? evidence.antiPatternInversion.score
    : Math.min(0, evidence.antiPatternInversion.score);

  return {
    mechanismCost: component(
      evidence.mechanismCost,
      resolvedWeights.mechanismCost,
      "Owned mechanism load: dependencies, speculative machinery, hidden labor, and undisciplined deferrals.",
    ),
    leastActionFitness: component(
      evidence.leastActionFitness,
      resolvedWeights.leastActionFitness,
      "Useful outcome minus unjustified mechanism cost and unsafe deletion penalty.",
    ),
    dangerousUnderbuilding: component(
      unsafeDeletionCount,
      resolvedWeights.dangerousUnderbuilding,
      "Load-bearing safety/evidence/replay mechanisms proposed for deletion.",
    ),
    antiPatternInversion: component(
      antiPatternRaw,
      resolvedWeights.antiPatternInversion,
      evidence.antiPatternInversion.passes
        ? "Old taboo has explicit constraint, substrate removal, current signal, and falsifier."
        : "No complete anti-pattern inversion signal.",
    ),
  };
}

export function leastActionComponentTotal(components: LeastActionFitnessComponents): number {
  return roundTwo(
    Object.values(components).reduce((total, item) => total + item.contribution, 0),
  );
}

function component(raw: number, weight: number, explanation: string): FitnessComponent {
  return {
    raw,
    weight,
    contribution: roundTwo(raw * weight),
    explanation,
  };
}

function roundTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

