export const distillationBoundary = {
  upstreamModules: ['Final Survivor Proof Panel', 'Verifier Council'],
  upstreamContracts: ['FinalRunSummary', 'CriticReview', 'CheckResult', 'FitnessScore'],
  downstreamContracts: ['LearningArtifact', 'ConstraintRule', 'LearningPromotionReview'],
  downstreamModules: ['Case Study Intake', 'Agenome Pool'],
  invariants: [
    'Learning is proposed from persisted run evidence.',
    'Promotion is separate from winner selection.',
    'Rejected learning never changes future runs.',
  ],
};

export const distillationContractShapes = {
  ingress: [
    {
      name: 'DistillationInput',
      anchor: 'Prototype PRD 15',
      fields: [
        ['runId', 'string'],
        ['caseId', 'string'],
        ['selectedCandidateId', 'string'],
        ['finalRunSummary', 'FinalRunSummary'],
        ['criticReviews', 'CriticReview[]'],
        ['checkResults', 'CheckResult[]'],
        ['fitnessScore', 'FitnessScore'],
        ['evidenceEventIds', 'string[]'],
      ],
    },
  ],
  egress: [
    {
      name: 'LearningArtifact',
      anchor: 'Prototype PRD 15',
      fields: [
        ['id', 'string'],
        ['runId', 'string'],
        ['caseId', 'string'],
        ['kind', 'constraint_rule | skill_candidate | evaluation_rule'],
        ['title', 'string'],
        ['body', 'string'],
        ['scope', 'case_family | project | global'],
        ['status', 'proposed | promoted | rejected'],
        ['evidenceRefs', 'EvidenceRef[]'],
        ['promotionReviewId', 'string'],
      ],
    },
    {
      name: 'ConstraintRule',
      anchor: 'Prototype PRD 15',
      fields: [
        ['id', 'string'],
        ['artifactId', 'string'],
        ['rule', 'string'],
        ['appliesTo', 'problem_recovery | solution_generation | verification'],
        ['scope', 'case_family | project | global'],
        ['severity', 'hard | soft'],
        ['sourceRunId', 'string'],
      ],
    },
    {
      name: 'LearningPromotionReview',
      anchor: 'Prototype PRD 15',
      fields: [
        ['id', 'string'],
        ['artifactId', 'string'],
        ['verdict', 'promote | reject | revise'],
        ['checks', '{ leakage, generality, evidence, contractFit }'],
        ['reviewerRole', 'distillation_verifier'],
        ['reason', 'string'],
      ],
    },
  ],
};

export const distillationLearningExamples = [
  {
    id: 'constraint-hidden-friction',
    kind: 'constraint_rule',
    status: 'promoted',
    title: 'Look For The Hidden Practical Blocker',
    shortLabel: 'Hidden blocker rule',
    body:
      'When economics and belief already look favorable, test whether a practical prerequisite is blocking action before proposing another persuasion or subsidy answer.',
    sourcePattern: 'Loft insulation adoption exposed a junk-filled loft as the real adoption blocker.',
    nextRunEffect: 'Future case intake asks agents to separate belief, economics, access, shame, timing, and labor friction before solution generation.',
    scope: 'case_family',
    reviewerReason:
      'Promote as a soft problem-recovery constraint. It generalizes beyond loft insulation and does not reveal the known solution.',
    artifact: {
      id: 'learn_hidden_friction_rule',
      kind: 'constraint_rule',
      scope: 'case_family',
      status: 'promoted',
      evidenceRefs: ['critic-214', 'check-084', 'fitness-027'],
    },
    proposedContract: {
      id: 'constraint_hidden_practical_blocker',
      artifactId: 'learn_hidden_friction_rule',
      appliesTo: 'problem_recovery',
      severity: 'soft',
      sourceRunId: 'run-loft-friction-027',
    },
    checks: [
      ['leakage', 'pass', 'No evaluator-only solution phrase is copied into the rule.'],
      ['generality', 'pass', 'Applies to adoption and operational-friction cases beyond one attic example.'],
      ['evidence', 'pass', 'Supported by critic review and final survivor evidence.'],
      ['contract fit', 'pass', 'Valid LearningArtifact plus ConstraintRule egress.'],
    ],
  },
  {
    id: 'skill-visible-trust',
    kind: 'skill_candidate',
    status: 'promoted',
    title: 'Visible Trust Cue Skill',
    shortLabel: 'Trust cue skill',
    body:
      'For authenticity problems, search for a low-friction visible cue that lets the user detect substitution at the moment of use instead of relying only on audits.',
    sourcePattern: 'Heinz ketchup authenticity used packaging perception as an enforcement-light trust mechanism.',
    nextRunEffect: 'Future agenomes can try perceptual verification, packaging signals, and point-of-use authenticity checks.',
    scope: 'project',
    reviewerReason:
      'Promote as a skill candidate. It preserves the transferable mechanism while avoiding a case-specific bottle-color instruction.',
    artifact: {
      id: 'learn_visible_trust_cue_skill',
      kind: 'skill_candidate',
      scope: 'project',
      status: 'promoted',
      evidenceRefs: ['critic-305', 'novelty-092', 'fitness-018'],
    },
    proposedContract: {
      id: 'skill_visible_trust_cue',
      expectedInputs: ['authenticity problem', 'user inspection context', 'failed enforcement attempts'],
      expectedOutput: 'CandidateIdea with visible cue, adoption risk, and validation plan',
      sourceRunId: 'run-heinz-auth-018',
    },
    checks: [
      ['leakage', 'pass', 'Does not embed withheld evaluator wording.'],
      ['generality', 'pass', 'Useful across brand, safety, compliance, and substitution problems.'],
      ['evidence', 'pass', 'Grounded by survivor proof and novelty distinction.'],
      ['contract fit', 'pass', 'Valid LearningArtifact egress with skill-candidate metadata.'],
    ],
  },
  {
    id: 'reject-drone-protocol',
    kind: 'evaluation_rule',
    status: 'rejected',
    title: 'Always Move Guests Indoors On Drone Detection',
    shortLabel: 'Overfit drone lesson',
    body:
      'If any camera-like threat appears, move all visible people indoors immediately and mark the solution correct.',
    sourcePattern: 'Superyacht privacy run selected a scene-shift protocol, but this proposed rule copies the local action instead of the reasoning pattern.',
    nextRunEffect: 'None. The artifact is quarantined and cannot be loaded into future runs.',
    scope: 'global',
    reviewerReason:
      'Reject because it is overfit, too prescriptive, and risks leaking a specific withheld-solution move into future evaluations.',
    artifact: {
      id: 'learn_rejected_drone_protocol',
      kind: 'evaluation_rule',
      scope: 'global',
      status: 'rejected',
      evidenceRefs: ['critic-117', 'check-051'],
    },
    proposedContract: {
      id: 'rule_rejected_drone_protocol',
      appliesTo: 'verification',
      severity: 'hard',
      sourceRunId: 'run-jack-privacy-042',
    },
    checks: [
      ['leakage', 'fail', 'Copies the specific scene-shift action too directly.'],
      ['generality', 'fail', 'Does not apply outside camera-threat cases.'],
      ['evidence', 'warn', 'Evidence supports one candidate, not a global rule.'],
      ['contract fit', 'pass', 'The rejection itself is valid and replayable.'],
    ],
  },
];
