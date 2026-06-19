export const subtypeCheckBoundary = {
  upstreamModules: ['Critic Council', 'Model Gateway', 'Retrieval Grounding', 'Case Study Intake'],
  upstreamContracts: ['CandidateIdea', 'EvidenceRef', 'ModelGatewayResponse', 'trustedRubric'],
  downstreamContracts: ['CheckResult', 'check.completed', 'NoveltyScoreInput', 'FitnessScoreInput'],
  downstreamModules: ['Novelty Radar', 'Selection / Scoring', 'Replay Spine', 'Final Survivor Proof Panel'],
  invariants: [
    'subtype labels change required evidence',
    'skipped checks are visible and penalizable',
    'check runners are allowlisted',
    'candidate text is untrusted data',
    'all check outcomes persist as check.completed events',
  ],
};

export const subtypeCheckContractShapes = {
  ingress: [
    {
      name: 'CandidateIdea',
      anchor: 'ARCHITECTURE.md Appendix A',
      fields: [
        ['id', 'string'],
        ['subtype', 'cross_domain_transfer | zeitgeist_synthesis'],
        ['title', 'string'],
        ['summary', 'string'],
        ['claims', 'string[]'],
        ['subtypePayload', 'CrossDomainTransferPayload | ZeitgeistSynthesisPayload'],
      ],
    },
    {
      name: 'CheckRunnerAdapter',
      anchor: 'ARCHITECTURE.md section 14 safety boundary',
      fields: [
        ['id', 'string'],
        ['subtype', 'CandidateIdea.subtype'],
        ['allowlisted', 'boolean'],
        ['requiresRetrieval', 'boolean'],
        ['executionPolicy', 'no_code_exec | retrieval_only | deterministic_math'],
      ],
    },
  ],
  egress: [
    {
      name: 'CheckResult',
      anchor: 'ARCHITECTURE.md Appendix A',
      fields: [
        ['id', 'string'],
        ['candidateId', 'string'],
        ['checkType', 'string'],
        ['status', 'pass | fail | skipped | degraded'],
        ['score', 'number | null'],
        ['evidenceRefs', 'EvidenceRef[]'],
        ['explanation', 'string'],
      ],
    },
    {
      name: 'check.completed',
      anchor: 'RunEventEnvelope narrowed payload',
      fields: [
        ['type', 'check.completed'],
        ['runId', 'string'],
        ['sequence', 'integer'],
        ['payload', 'CheckResult'],
        ['sourceModule', 'verifier.checks'],
      ],
    },
  ],
};

export const subtypeCandidates = [
  {
    id: 'cross-domain-transfer',
    subtype: 'cross_domain_transfer',
    label: 'Cross-domain transfer',
    shortLabel: 'Transfer',
    title: 'Discreet Scene-Shift Protocol',
    summary:
      'Borrow quiet-alert patterns from aviation sterile-cockpit and hospital code protocols to move yacht guests out of visual range before drone footage has value.',
    payloadLabel: 'CrossDomainTransferPayload',
    payload: {
      sourceDomain: 'aviation + hospital operations',
      targetDomain: 'superyacht privacy operations',
      transferMechanism: 'quiet coded alert that triggers rehearsed scene change',
      adaptationRisk: 'crew signal may become legible if overused',
    },
    obligations: [
      'source-domain validity',
      'target fit',
      'mapping quality',
      'prior-art conflict',
      'executable check idea',
    ],
    checks: [
      {
        id: 'cdt-source',
        dimension: 'Source validity',
        runner: 'retrieval.source_domain.v1',
        status: 'pass',
        score: 0.86,
        detail: 'Quiet-alert protocols are established in aviation and clinical operations.',
        evidenceRefs: ['Sterile cockpit rule', 'Hospital color-code policies'],
      },
      {
        id: 'cdt-target',
        dimension: 'Target fit',
        runner: 'rubric.target_fit.v1',
        status: 'pass',
        score: 0.82,
        detail: 'Yacht crew can rehearse a brief private signal without new exotic hardware.',
        evidenceRefs: ['Case constraints', 'Crew SOP assumption'],
      },
      {
        id: 'cdt-map',
        dimension: 'Mapping quality',
        runner: 'mapping.cross_domain.v1',
        status: 'pass',
        score: 0.78,
        detail: 'The transfer maps interruption discipline to privacy-preserving scene control.',
        evidenceRefs: ['Candidate claim c1', 'Critic feasibility note'],
      },
      {
        id: 'cdt-prior',
        dimension: 'Prior art risk',
        runner: 'retrieval.prior_art.v1',
        status: 'degraded',
        score: 0.52,
        detail: 'Search was partial; generic VIP security protocols create some overlap risk.',
        evidenceRefs: ['Partial web retrieval', 'Novelty critic caveat'],
      },
      {
        id: 'cdt-exec',
        dimension: 'Executable check',
        runner: 'simulation.protocol_latency.v1',
        status: 'skipped',
        score: null,
        detail: 'Requires timing simulation fixture not available in this local prototype.',
        evidenceRefs: ['Skipped with reason'],
      },
    ],
  },
  {
    id: 'zeitgeist-synthesis',
    subtype: 'zeitgeist_synthesis',
    label: 'Zeitgeist synthesis',
    shortLabel: 'Zeitgeist',
    title: 'Privacy Theater Exhaustion',
    summary:
      'Frame the drone problem around public fatigue with conspicuous security theater, then propose a privacy move that feels boring, invisible, and hard to narrativize.',
    payloadLabel: 'ZeitgeistSynthesisPayload',
    payload: {
      signals: ['anti-surveillance fatigue', 'luxury discretion preference', 'attention-economy skepticism'],
      thesis: 'the best privacy response is one that creates no spectacle',
      timingClaim: 'public appetite favors quiet operational competence over visible countermeasures',
      falsifier: 'if audiences reward dramatic anti-drone conflict, the thesis weakens',
    },
    obligations: [
      'current signals',
      'timing fit',
      'novel framing',
      'internal coherence',
      'falsifiability',
    ],
    checks: [
      {
        id: 'zs-signals',
        dimension: 'Current signals',
        runner: 'retrieval.current_signals.v1',
        status: 'pass',
        score: 0.74,
        detail: 'Signals support fatigue with visible surveillance and counter-surveillance drama.',
        evidenceRefs: ['Privacy discourse signals', 'Luxury discretion pattern'],
      },
      {
        id: 'zs-timing',
        dimension: 'Timing fit',
        runner: 'rubric.timing_fit.v1',
        status: 'pass',
        score: 0.69,
        detail: 'The framing is plausible now, but would need fresher signal monitoring in production.',
        evidenceRefs: ['Signal recency note'],
      },
      {
        id: 'zs-novel',
        dimension: 'Novel framing',
        runner: 'semantic.novelty_proxy.v1',
        status: 'degraded',
        score: 0.61,
        detail: 'Embedding service unavailable; lexical fallback says it differs from generic anti-drone answers.',
        evidenceRefs: ['Lexical fallback comparison'],
      },
      {
        id: 'zs-coherence',
        dimension: 'Coherence',
        runner: 'rubric.coherence.v1',
        status: 'pass',
        score: 0.81,
        detail: 'The thesis, mechanism, and proposed yacht action reinforce the same anti-spectacle claim.',
        evidenceRefs: ['Candidate summary', 'Critic council note'],
      },
      {
        id: 'zs-falsify',
        dimension: 'Falsifiability',
        runner: 'rubric.falsification.v1',
        status: 'fail',
        score: 0.34,
        detail: 'The candidate names a falsifier but does not specify how Doppl would measure it.',
        evidenceRefs: ['Falsification critic warning'],
      },
    ],
  },
];

export function summarizeSubtypeChecks(candidate) {
  const counts = candidate.checks.reduce(
    (acc, check) => ({ ...acc, [check.status]: (acc[check.status] || 0) + 1 }),
    { pass: 0, fail: 0, skipped: 0, degraded: 0 },
  );
  const scoredChecks = candidate.checks.filter((check) => typeof check.score === 'number');
  const averageScore = scoredChecks.length
    ? scoredChecks.reduce((sum, check) => sum + check.score, 0) / scoredChecks.length
    : 0;
  const penalty = counts.skipped * 0.08 + counts.degraded * 0.05 + counts.fail * 0.18;
  return {
    ...counts,
    averageScore,
    readiness: Math.max(0, Math.round((averageScore - penalty) * 100)),
    completed: candidate.checks.length,
  };
}
