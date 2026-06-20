import { LEAST_ACTION_REVIEW_VERSION, SAFETY_EXEMPTIONS } from "../prompts/least-action";

export type DeferredMechanism = {
  name: string;
  ceiling?: string;
  upgradeWhen?: string;
};

export type AntiPatternInversionEvidence = {
  oldTaboo?: string;
  oldConstraint?: string;
  substrateRemoved?: string;
  newStrategy?: string;
  currentSignals?: readonly string[];
  falsifier?: string;
};

export type LeastActionReviewInput = {
  candidateId: string;
  title: string;
  summary: string;
  usefulOutcomeScore?: number;
  requiredMechanisms?: readonly string[];
  speculativeMechanisms?: readonly string[];
  nativeAlternatives?: readonly string[];
  hiddenHumanLabor?: readonly string[];
  deferredMechanisms?: readonly DeferredMechanism[];
  unsafeDeletions?: readonly string[];
  antiPattern?: AntiPatternInversionEvidence | null;
};

export type LeastActionVerdict = "promote" | "keep" | "reject";

export type LeastActionReviewEvidence = {
  version: typeof LEAST_ACTION_REVIEW_VERSION;
  candidateId: string;
  requiredMechanisms: readonly string[];
  speculativeMechanisms: readonly string[];
  nativeAlternatives: readonly string[];
  hiddenHumanLabor: readonly string[];
  deferredMechanisms: readonly DeferredMechanism[];
  unsafeDeletions: readonly string[];
  disciplinedDeferrals: readonly string[];
  missingDeferralTriggers: readonly string[];
  safetyExemptions: typeof SAFETY_EXEMPTIONS;
  antiPatternInversion: {
    score: number;
    passes: boolean;
    missing: readonly string[];
  };
  mechanismCost: number;
  leastActionFitness: number;
  verdict: LeastActionVerdict;
  reasons: readonly string[];
};

const LOAD_BEARING_TERMS = [
  "accessibility",
  "allowlist",
  "arbitrary code",
  "falsifiable",
  "grounding",
  "prediction",
  "prompt-injection",
  "redaction",
  "replay",
  "secret",
  "security",
  "state-equivalence",
  "validation",
] as const;

function entries(items: readonly string[] | undefined): readonly string[] {
  return items?.map((item) => item.trim()).filter(Boolean) ?? [];
}

function hasText(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasLoadBearingDeletion(deletion: string): boolean {
  const normalized = deletion.toLowerCase();
  return LOAD_BEARING_TERMS.some((term) => normalized.includes(term));
}

function antiPatternScore(evidence: AntiPatternInversionEvidence | null | undefined): {
  score: number;
  passes: boolean;
  missing: readonly string[];
} {
  if (!evidence) {
    return { score: 0, passes: false, missing: [] };
  }

  const requiredFields = [
    ["oldTaboo", evidence.oldTaboo],
    ["oldConstraint", evidence.oldConstraint],
    ["substrateRemoved", evidence.substrateRemoved],
    ["newStrategy", evidence.newStrategy],
    ["falsifier", evidence.falsifier],
  ] as const;
  const missing = requiredFields
    .filter(([, value]) => !hasText(value))
    .map(([field]) => field);
  const hasCurrentSignal = (evidence.currentSignals ?? []).some((signal) => signal.trim().length > 0);

  if (missing.length > 0 || !hasCurrentSignal) {
    return {
      score: -2,
      passes: false,
      missing: hasCurrentSignal ? missing : [...missing, "currentSignals"],
    };
  }

  return { score: 2, passes: true, missing: [] };
}

export function runLeastActionReview(input: LeastActionReviewInput): LeastActionReviewEvidence {
  const requiredMechanisms = entries(input.requiredMechanisms);
  const speculativeMechanisms = entries(input.speculativeMechanisms);
  const nativeAlternatives = entries(input.nativeAlternatives);
  const hiddenHumanLabor = entries(input.hiddenHumanLabor);
  const deferredMechanisms = input.deferredMechanisms ?? [];
  const unsafeDeletions = entries(input.unsafeDeletions);

  const disciplinedDeferrals = deferredMechanisms
    .filter((item) => hasText(item.ceiling) && hasText(item.upgradeWhen))
    .map((item) => item.name);
  const missingDeferralTriggers = deferredMechanisms
    .filter((item) => !hasText(item.ceiling) || !hasText(item.upgradeWhen))
    .map((item) => item.name);
  const unsafeLoadBearingDeletions = unsafeDeletions.filter(hasLoadBearingDeletion);
  const antiPatternInversion = antiPatternScore(input.antiPattern);

  const mechanismCost = Math.max(
    0,
    roundTwo(
      requiredMechanisms.length * 0.8 +
        speculativeMechanisms.length * 2.2 +
        hiddenHumanLabor.length * 1.5 +
        missingDeferralTriggers.length * 1.8 -
        nativeAlternatives.length * 0.9 -
        disciplinedDeferrals.length * 0.5,
    ),
  );
  const safetyPenalty = unsafeLoadBearingDeletions.length > 0 ? 8 : 0;
  const usefulOutcomeScore = input.usefulOutcomeScore ?? 0;
  const leastActionFitness = roundTwo(
    usefulOutcomeScore + antiPatternInversion.score - mechanismCost - safetyPenalty,
  );

  const reasons: string[] = [];
  let verdict: LeastActionVerdict;
  if (unsafeLoadBearingDeletions.length > 0) {
    verdict = "reject";
    reasons.push(`cuts load-bearing safety/evidence: ${unsafeLoadBearingDeletions.join(", ")}`);
  } else if (leastActionFitness >= 6) {
    verdict = "promote";
    reasons.push("high useful outcome with justified mechanism load");
  } else if (leastActionFitness >= 3) {
    verdict = "keep";
    reasons.push("usable but mechanism load needs pressure");
  } else {
    verdict = "reject";
    reasons.push("mechanism load outweighs useful outcome");
  }

  if (speculativeMechanisms.length > 0) {
    reasons.push(`${speculativeMechanisms.length} speculative mechanism(s)`);
  }
  if (nativeAlternatives.length > 0) {
    reasons.push(`${nativeAlternatives.length} native/platform alternative(s)`);
  }
  if (missingDeferralTriggers.length > 0) {
    reasons.push("deferred mechanism missing ceiling or upgrade trigger");
  }
  if (antiPatternInversion.score > 0) {
    reasons.push("passes anti-pattern inversion shape");
  } else if (antiPatternInversion.score < 0) {
    reasons.push("claims inversion without signal/falsifier");
  }

  return {
    version: LEAST_ACTION_REVIEW_VERSION,
    candidateId: input.candidateId,
    requiredMechanisms,
    speculativeMechanisms,
    nativeAlternatives,
    hiddenHumanLabor,
    deferredMechanisms,
    unsafeDeletions,
    disciplinedDeferrals,
    missingDeferralTriggers,
    safetyExemptions: SAFETY_EXEMPTIONS,
    antiPatternInversion,
    mechanismCost,
    leastActionFitness,
    verdict,
    reasons,
  };
}

function roundTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

