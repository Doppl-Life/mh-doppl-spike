export const survivorBoundary = {
  upstreamModules: ['Replay Spine', 'Critic Council', 'Subtype Check Lab', 'Novelty Radar', 'Spend Ledger'],
  upstreamContracts: ['CandidateIdea', 'LineageGraphProjection', 'CriticReview', 'CheckResult', 'NoveltyScore', 'FitnessScore'],
  downstreamContracts: ['FinalRunSummary', 'ShareableProofArtifact', 'ReplayReadRequest'],
  downstreamModules: ['Demo Fallback Ladder', 'Trace Viewer', 'Operator Console'],
  invariants: [
    'winner is proven from persisted evidence',
    'no-survivor terminal runs do not fabricate a winner',
    'unresolved risks stay visible',
    'live and replay modes render the same proof semantics',
    'every proof link resolves to another prototype surface',
  ],
};

export const survivorContractShapes = {
  ingress: [
    {
      name: 'FinalProofInput',
      anchor: 'PRD 13 + ARCHITECTURE.md sections 8-10',
      fields: [
        ['candidate', 'CandidateIdea | null'],
        ['lineage', 'LineageGraphProjection'],
        ['criticReviews', 'CriticReview[]'],
        ['checkResults', 'CheckResult[]'],
        ['noveltyScore', 'NoveltyScore | null'],
        ['fitnessScore', 'FitnessScore | null'],
        ['spend', 'SpendProjection'],
      ],
    },
    {
      name: 'TerminalRunSummary',
      anchor: 'Runtime terminal projection',
      fields: [
        ['runId', 'string'],
        ['status', 'completed | failed | no_survivor'],
        ['generationCount', 'integer'],
        ['survivorId?', 'string'],
        ['terminalReason', 'string'],
      ],
    },
  ],
  egress: [
    {
      name: 'ShareableProofArtifact',
      anchor: 'Final survivor proof panel output',
      fields: [
        ['title', 'string'],
        ['verdict', 'accepted | no_survivor'],
        ['improvementClaim', 'string'],
        ['evidenceLinks', 'ProofLink[]'],
        ['openRisks', 'string[]'],
        ['validationPlan', 'string[]'],
      ],
    },
  ],
};

export const survivorRuns = [
  {
    id: 'completed',
    label: 'Completed survivor',
    runId: 'run-jack-privacy-042',
    mode: 'replay verified',
    caseStudy: 'Superyacht Drone Privacy',
    status: 'accepted',
    title: 'Discreet Scene-Shift Protocol',
    summary:
      'Detect the drone early, trigger a quiet onboard signal, and move exposed guests out of view before useful footage exists.',
    improvementClaim: 'Final generation beats gen-0 baseline by +23 fitness points with lower legal/safety risk.',
    terminalReason: 'candidate.selected and run.completed events replay to the same survivor.',
    metrics: [
      { label: 'Final fitness', value: '91', detail: '+23 vs gen-0 baseline' },
      { label: 'Held-out judge', value: '4.6/5', detail: 'immutable rubric, outside breeding loop' },
      { label: 'Novelty', value: '78', detail: 'mechanism distinct from anti-drone prior art' },
      { label: 'Spend', value: '$1.42', detail: 'productive calls only' },
    ],
    evidence: [
      { label: 'Lineage replay', tab: 'replay', status: 'proven', detail: 'Append-only events reconstruct the selected candidate without fresh calls.' },
      { label: 'Critic council', tab: 'critic', status: 'passed', detail: 'Factual, novelty, feasibility, falsification, and subtype critics produce defensible pressure.' },
      { label: 'Subtype checks', tab: 'subtype', status: 'mixed', detail: 'Transfer checks pass on source/target/mapping; executable timing check remains skipped.' },
      { label: 'Novelty radar', tab: 'novelty', status: 'supported', detail: 'Nearest prior-art overlap is detection alerts, not scene-shift action.' },
      { label: 'Energy metabolism', tab: 'energy', status: 'efficient', detail: 'Weak lineages were culled; survivor inherited useful critic pressure.' },
      { label: 'Spend ledger', tab: 'spend', status: 'bounded', detail: 'Cost is visible and tied to sprouts/fruits, not hidden model activity.' },
      { label: 'Trace atoms', tab: 'trace', status: 'inspectable', detail: 'Prompts, outputs, critic reasoning, and inheritance math remain auditable.' },
    ],
    risks: [
      'Detection range assumptions need yacht-specific validation.',
      'Crew cue must remain private and resistant to paparazzi pattern-learning.',
      'Late detection still fails because useful footage may already exist.',
    ],
    validationPlan: [
      'Run a timing drill from drone detection to guest relocation.',
      'Test cue secrecy across repeated rehearsals.',
      'Compare against visible anti-drone deterrence in held-out judge rubric.',
    ],
  },
  {
    id: 'no-survivor',
    label: 'No-survivor terminal',
    runId: 'run-heinz-auth-018',
    mode: 'failed replay',
    caseStudy: 'Heinz Ketchup Authenticity',
    status: 'no_survivor',
    title: 'No accepted survivor',
    summary:
      'The run ended without a selected candidate because all finalists either leaked the withheld solution or failed feasibility checks.',
    improvementClaim: 'No winner fabricated. The proof panel switches to terminal failure evidence.',
    terminalReason: 'run.completed status=no_survivor; candidate.selected never appears in replay.',
    metrics: [
      { label: 'Final fitness', value: 'none', detail: 'no selected score emitted' },
      { label: 'Held-out judge', value: 'reject', detail: 'withheld-solution leakage detected' },
      { label: 'Novelty', value: 'degraded', detail: 'prior-art retrieval incomplete' },
      { label: 'Spend', value: '$0.88', detail: 'bounded failed run' },
    ],
    evidence: [
      { label: 'Replay spine', tab: 'replay', status: 'terminal', detail: 'Replay proves no candidate.selected event exists.' },
      { label: 'Case intake', tab: 'intake', status: 'leakage', detail: 'Withheld anchors caught solution leakage in final candidates.' },
      { label: 'Critic council', tab: 'critic', status: 'rejected', detail: 'Falsification and feasibility reviewers block the run.' },
      { label: 'Spend ledger', tab: 'spend', status: 'bounded', detail: 'Failed run still has auditable spend and yield.' },
    ],
    risks: [
      'Input case packet may be too solution-revealing.',
      'Agenome pool may need more constraint-heavy mutagens.',
    ],
    validationPlan: [
      'Revise case intake to reduce leakage.',
      'Restart with constraint-heavy starting population.',
      'Keep terminal run available as honest demo failure path.',
    ],
  },
];
