import { describe, expect, it } from "vitest";

import { runLeastActionReview } from "./least-action-review";

describe("runLeastActionReview", () => {
  it("accepts lazy breadth when the anti-pattern inversion is explicit", () => {
    const review = runLeastActionReview({
      candidateId: "lazy-breadth",
      title: "Breadth-first agent shell",
      summary: "Covers broad workflow surface and generates depth only after demand.",
      usefulOutcomeScore: 8,
      requiredMechanisms: ["task schema", "plugin registry", "cap-limited generation loop"],
      speculativeMechanisms: ["marketplace"],
      nativeAlternatives: ["hosted auth", "platform deployment"],
      hiddenHumanLabor: ["review generated depth before activation"],
      deferredMechanisms: [
        {
          name: "marketplace",
          ceiling: "manual review",
          upgradeWhen: "three unrelated users request the same generated vertical",
        },
      ],
      unsafeDeletions: [],
      antiPattern: {
        oldTaboo: "do not boil the ocean",
        oldConstraint: "breadth was expensive to build and deploy",
        substrateRemoved: "agentic codegen makes shallow breadth cheap",
        newStrategy: "broad shells with on-demand depth",
        currentSignals: ["agentic loops generate working app slices quickly"],
        falsifier: "generated long-tail depth remains too unreliable by 2027",
      },
    });

    expect(review.verdict).toBe("promote");
    expect(review.antiPatternInversion.passes).toBe(true);
  });

  it("rejects unsafe smallness", () => {
    const review = runLeastActionReview({
      candidateId: "skip-redaction",
      title: "Skip redaction",
      summary: "Persist raw prompts and provider metadata directly.",
      usefulOutcomeScore: 6,
      requiredMechanisms: ["append-only event log"],
      unsafeDeletions: ["secret redaction", "safe observability boundary"],
    });

    expect(review.verdict).toBe("reject");
    expect(review.leastActionFitness).toBeLessThan(0);
    expect(review.reasons.join(" ")).toContain("secret redaction");
  });

  it("penalizes missing deferral triggers", () => {
    const review = runLeastActionReview({
      candidateId: "neo4j-runtime",
      title: "Neo4j runtime",
      summary: "Make Neo4j required for MVP lineage.",
      usefulOutcomeScore: 6,
      requiredMechanisms: ["Postgres", "Neo4j", "dual-write pipeline"],
      speculativeMechanisms: ["interactive graph queries"],
      nativeAlternatives: ["Postgres projection"],
      deferredMechanisms: [{ name: "runtime graph database" }],
    });

    expect(review.verdict).toBe("reject");
    expect(review.missingDeferralTriggers).toEqual(["runtime graph database"]);
  });
});

