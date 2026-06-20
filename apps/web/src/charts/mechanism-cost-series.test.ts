import { describe, expect, it } from "vitest";

import { runLeastActionReview } from "../../../api/verifier/council/least-action-review";
import { buildLeastActionFitnessComponents } from "../../../api/src/selection/components/least-action-fitness";
import { buildMechanismCostSeries, hasMechanismSignal } from "./mechanism-cost-series";

describe("buildMechanismCostSeries", () => {
  it("distinguishes cheap to own from cheap to run", () => {
    const evidence = runLeastActionReview({
      candidateId: "lazy-breadth",
      title: "Lazy breadth",
      summary: "Wide shell, generated depth only after demand.",
      usefulOutcomeScore: 8,
      requiredMechanisms: ["task schema", "cap-limited generation loop"],
      speculativeMechanisms: ["plugin marketplace"],
      nativeAlternatives: ["platform auth"],
      antiPattern: {
        oldTaboo: "do not boil the ocean",
        oldConstraint: "breadth was expensive",
        substrateRemoved: "agent loops make shallow breadth cheap",
        newStrategy: "wide shell with on-demand depth",
        currentSignals: ["agentic codegen"],
        falsifier: "depth remains too unreliable by 2027",
      },
    });
    const components = buildLeastActionFitnessComponents(evidence);
    const [point] = buildMechanismCostSeries([
      {
        candidateId: "lazy-breadth",
        generationIndex: 1,
        components: {
          mechanismCost: components.mechanismCost,
          leastActionFitness: components.leastActionFitness,
          energyEfficiency: { raw: 0.9 },
        },
      },
    ]);

    expect(point).toEqual({
      candidateId: "lazy-breadth",
      generationIndex: 1,
      mechanismCost: evidence.mechanismCost,
      leastActionFitness: evidence.leastActionFitness,
      energyCost: 0.9,
    });
    expect(hasMechanismSignal(point)).toBe(true);
  });
});

