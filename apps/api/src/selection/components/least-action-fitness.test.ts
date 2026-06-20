import { describe, expect, it } from "vitest";

import { runLeastActionReview } from "../../../verifier/council/least-action-review";
import {
  buildLeastActionFitnessComponents,
  leastActionComponentTotal,
} from "./least-action-fitness";

describe("buildLeastActionFitnessComponents", () => {
  it("separates mechanism cost from least-action fitness", () => {
    const evidence = runLeastActionReview({
      candidateId: "projection",
      title: "Postgres projection",
      summary: "Use event-log-derived projection before graph runtime.",
      usefulOutcomeScore: 8,
      requiredMechanisms: ["event log", "projection builder"],
      nativeAlternatives: ["Postgres JSONB"],
      deferredMechanisms: [
        {
          name: "runtime graph database",
          ceiling: "export only",
          upgradeWhen: "interactive graph traversal is required during a run",
        },
      ],
    });

    const components = buildLeastActionFitnessComponents(evidence);

    expect(components.mechanismCost.raw).toBe(evidence.mechanismCost);
    expect(components.leastActionFitness.raw).toBe(evidence.leastActionFitness);
    expect(components.mechanismCost.contribution).toBeLessThan(0);
    expect(components.dangerousUnderbuilding.raw).toBe(0);
    expect(leastActionComponentTotal(components)).toBeGreaterThan(0);
  });

  it("penalizes unsafe underbuilding even when mechanism cost is low", () => {
    const evidence = runLeastActionReview({
      candidateId: "skip-replay",
      title: "Skip replay",
      summary: "Delete replay fixture for a live-only demo.",
      usefulOutcomeScore: 5,
      requiredMechanisms: ["live model calls"],
      unsafeDeletions: ["replay fallback", "state-equivalence proof"],
    });

    const components = buildLeastActionFitnessComponents(evidence);

    expect(evidence.mechanismCost).toBeLessThan(2);
    expect(components.dangerousUnderbuilding.contribution).toBeLessThan(0);
    expect(leastActionComponentTotal(components)).toBeLessThan(0);
  });
});

