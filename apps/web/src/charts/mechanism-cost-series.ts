export type FitnessScoreLike = {
  candidateId: string;
  generationIndex: number;
  components: Record<string, number | { raw?: number; contribution?: number }>;
};

export type MechanismCostPoint = {
  candidateId: string;
  generationIndex: number;
  mechanismCost: number;
  leastActionFitness: number;
  energyCost: number;
};

export function buildMechanismCostSeries(scores: readonly FitnessScoreLike[]): MechanismCostPoint[] {
  return scores.map((score) => ({
    candidateId: score.candidateId,
    generationIndex: score.generationIndex,
    mechanismCost: componentValue(score.components.mechanismCost),
    leastActionFitness: componentValue(score.components.leastActionFitness),
    energyCost: componentValue(score.components.energyEfficiency),
  }));
}

export function hasMechanismSignal(point: MechanismCostPoint): boolean {
  return point.mechanismCost !== 0 || point.leastActionFitness !== 0;
}

function componentValue(component: number | { raw?: number; contribution?: number } | undefined): number {
  if (typeof component === "number") {
    return component;
  }
  if (!component) {
    return 0;
  }
  return component.raw ?? component.contribution ?? 0;
}

