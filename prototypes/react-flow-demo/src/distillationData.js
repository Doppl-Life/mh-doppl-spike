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

export const distillationLearningByCase = {
  'jack-superyacht-drone': [
    {
      id: 'jack-constraint-footage-value',
      kind: 'constraint_rule',
      status: 'promoted',
      title: 'Protect The Value, Not The Object',
      shortLabel: 'Value target rule',
      body:
        'When an apparent threat object is hard or risky to fight directly, identify the value it is trying to extract and intervene before that value exists.',
      sourcePattern: 'Superyacht drone privacy showed that the valuable object is usable footage, not the drone itself.',
      nextRunEffect: 'Future case intake asks agents to distinguish the visible adversary from the asset, signal, or artifact the adversary wants to obtain.',
      scope: 'case_family',
      reviewerReason:
        'Promote as a soft problem-recovery constraint. It preserves the reasoning pattern without copying the exact scene-shift solution.',
      artifact: {
        id: 'learn_jack_value_target_rule',
        kind: 'constraint_rule',
        scope: 'case_family',
        status: 'promoted',
        evidenceRefs: ['critic-117', 'check-051', 'fitness-042'],
      },
      proposedContract: {
        id: 'constraint_value_target_before_object',
        artifactId: 'learn_jack_value_target_rule',
        appliesTo: 'problem_recovery',
        severity: 'soft',
        sourceRunId: 'run-jack-privacy-042',
      },
      checks: [
        ['leakage', 'pass', 'Does not name the withheld crew protocol or scene-shift action.'],
        ['generality', 'pass', 'Transfers to surveillance, fraud, compliance, and reputation cases.'],
        ['evidence', 'pass', 'Supported by critic evidence that anti-drone tactics miss the actual privacy harm.'],
        ['contract fit', 'pass', 'Valid LearningArtifact plus ConstraintRule egress.'],
      ],
    },
    {
      id: 'jack-skill-quiet-protocols',
      kind: 'skill_candidate',
      status: 'promoted',
      title: 'Quiet Protocol Skill',
      shortLabel: 'Quiet protocol skill',
      body:
        'For high-stakes situations where public reaction creates secondary harm, generate a rehearsable low-drama protocol instead of a visible technical countermeasure.',
      sourcePattern: 'The selected privacy solution worked because it made response behavior calm, fast, and socially invisible.',
      nextRunEffect: 'Future agenomes can try aviation, medicine, hospitality, and incident-command protocol patterns before proposing hardware.',
      scope: 'project',
      reviewerReason:
        'Promote as a skill candidate. It generalizes the operational protocol move while leaving evaluator-only details out.',
      artifact: {
        id: 'learn_jack_quiet_protocol_skill',
        kind: 'skill_candidate',
        scope: 'project',
        status: 'promoted',
        evidenceRefs: ['critic-119', 'trace-042', 'fitness-042'],
      },
      proposedContract: {
        id: 'skill_quiet_protocols',
        expectedInputs: ['public escalation risk', 'time pressure', 'human operators', 'visible failed approaches'],
        expectedOutput: 'CandidateIdea with trigger, action script, failure mode, and validation drill',
        sourceRunId: 'run-jack-privacy-042',
      },
      checks: [
        ['leakage', 'pass', 'Abstracts the protocol pattern without preserving the known answer.'],
        ['generality', 'pass', 'Useful for VIP, safety, fraud, and service-recovery cases.'],
        ['evidence', 'pass', 'Grounded by feasibility and discretion critic reviews.'],
        ['contract fit', 'pass', 'Valid LearningArtifact egress with skill-candidate metadata.'],
      ],
    },
    {
      id: 'jack-reject-always-indoor',
      kind: 'evaluation_rule',
      status: 'rejected',
      title: 'Always Move People Indoors On Camera Threat',
      shortLabel: 'Overfit privacy rule',
      body:
        'If a camera-like threat appears, move visible people indoors immediately and mark the solution correct.',
      sourcePattern: 'This copies one local action shape instead of preserving the deeper value-denial pattern.',
      nextRunEffect: 'None. The artifact is quarantined and cannot be loaded into future privacy or surveillance cases.',
      scope: 'global',
      reviewerReason:
        'Reject because it is overfit, too prescriptive, and risks leaking a specific withheld-solution move into future evaluations.',
      artifact: {
        id: 'learn_jack_rejected_indoor_rule',
        kind: 'evaluation_rule',
        scope: 'global',
        status: 'rejected',
        evidenceRefs: ['critic-117', 'check-051'],
      },
      proposedContract: {
        id: 'rule_rejected_camera_indoor_move',
        appliesTo: 'verification',
        severity: 'hard',
        sourceRunId: 'run-jack-privacy-042',
      },
      checks: [
        ['leakage', 'fail', 'Too close to the withheld solution behavior.'],
        ['generality', 'fail', 'Does not apply outside camera-threat cases.'],
        ['evidence', 'warn', 'Evidence supports one candidate, not a global rule.'],
        ['contract fit', 'pass', 'The rejection itself is valid and replayable.'],
      ],
    },
  ],
  'loft-insulation-adoption': [
    {
      id: 'loft-constraint-hidden-friction',
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
        id: 'learn_loft_hidden_friction_rule',
        kind: 'constraint_rule',
        scope: 'case_family',
        status: 'promoted',
        evidenceRefs: ['critic-214', 'check-084', 'fitness-027'],
      },
      proposedContract: {
        id: 'constraint_hidden_practical_blocker',
        artifactId: 'learn_loft_hidden_friction_rule',
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
      id: 'loft-skill-readiness-bundle',
      kind: 'skill_candidate',
      status: 'promoted',
      title: 'Readiness Bundle Skill',
      shortLabel: 'Readiness bundle',
      body:
        'For adoption cases, generate the smallest service bundle that removes the prerequisite chore before asking the user to complete the target action.',
      sourcePattern: 'The run found that insulation demand was less important than installable loft readiness.',
      nextRunEffect: 'Future agenomes can search for prep labor, access restoration, paperwork help, and shame-reducing concierge steps.',
      scope: 'project',
      reviewerReason:
        'Promote because it captures an adoption mechanism without hard-coding attic clearing as the answer.',
      artifact: {
        id: 'learn_loft_readiness_bundle_skill',
        kind: 'skill_candidate',
        scope: 'project',
        status: 'promoted',
        evidenceRefs: ['critic-219', 'trace-027', 'fitness-027'],
      },
      proposedContract: {
        id: 'skill_readiness_bundle',
        expectedInputs: ['rational adoption gap', 'failed persuasion attempts', 'known prerequisites'],
        expectedOutput: 'CandidateIdea with readiness blocker, bundled service, adoption risk, and validation test',
        sourceRunId: 'run-loft-friction-027',
      },
      checks: [
        ['leakage', 'pass', 'Does not expose evaluator-only labor details as a required answer.'],
        ['generality', 'pass', 'Transfers to retrofits, healthcare, benefits, and setup-heavy services.'],
        ['evidence', 'pass', 'Grounded by the selected hidden-friction mechanism.'],
        ['contract fit', 'pass', 'Valid LearningArtifact egress with skill-candidate metadata.'],
      ],
    },
    {
      id: 'loft-reject-education-never-works',
      kind: 'evaluation_rule',
      status: 'rejected',
      title: 'Never Use Education For Adoption Problems',
      shortLabel: 'Overcorrected lesson',
      body:
        'Reject any candidate that uses information, payback math, or reminders in an adoption problem.',
      sourcePattern: 'The loft case punished repeated persuasion, but the rejected lesson overgeneralizes from one adoption setting.',
      nextRunEffect: 'None. The artifact is quarantined so future cases can still use education when information is the real blocker.',
      scope: 'global',
      reviewerReason:
        'Reject because it turns a case-specific hidden-friction lesson into an unsafe global ban.',
      artifact: {
        id: 'learn_loft_rejected_no_education_rule',
        kind: 'evaluation_rule',
        scope: 'global',
        status: 'rejected',
        evidenceRefs: ['critic-222', 'fitness-027'],
      },
      proposedContract: {
        id: 'rule_rejected_no_education',
        appliesTo: 'verification',
        severity: 'hard',
        sourceRunId: 'run-loft-friction-027',
      },
      checks: [
        ['leakage', 'pass', 'Does not copy the withheld solution.'],
        ['generality', 'fail', 'Overcorrects from one case and would block valid information-gap solutions.'],
        ['evidence', 'warn', 'Evidence supports hidden friction here, not a universal anti-education rule.'],
        ['contract fit', 'pass', 'The rejection review is schema-valid.'],
      ],
    },
  ],
  'heinz-ketchup-authenticity': [
    {
      id: 'heinz-constraint-visible-verification',
      kind: 'constraint_rule',
      status: 'promoted',
      title: 'Make Trust Inspectable At The Moment Of Use',
      shortLabel: 'Visible trust rule',
      body:
        'When compliance is hard to police upstream, look for a user-visible cue that makes substitution or degradation legible at the moment it matters.',
      sourcePattern: 'Heinz ketchup authenticity used packaging perception as an enforcement-light trust mechanism.',
      nextRunEffect: 'Future case intake asks agents whether a visible point-of-use signal can replace audits, apps, or confrontation.',
      scope: 'case_family',
      reviewerReason:
        'Promote as a soft verification constraint. It captures the visible-trust mechanism without revealing a specific packaging answer.',
      artifact: {
        id: 'learn_heinz_visible_trust_rule',
        kind: 'constraint_rule',
        scope: 'case_family',
        status: 'promoted',
        evidenceRefs: ['critic-305', 'novelty-092', 'fitness-018'],
      },
      proposedContract: {
        id: 'constraint_visible_point_of_use_verification',
        artifactId: 'learn_heinz_visible_trust_rule',
        appliesTo: 'problem_recovery',
        severity: 'soft',
        sourceRunId: 'run-heinz-auth-018',
      },
      checks: [
        ['leakage', 'pass', 'Does not embed the exact bottle or label cue.'],
        ['generality', 'pass', 'Applies to authenticity, quality, safety, and service substitution cases.'],
        ['evidence', 'pass', 'Supported by novelty and final proof evidence.'],
        ['contract fit', 'pass', 'Valid LearningArtifact plus ConstraintRule egress.'],
      ],
    },
    {
      id: 'heinz-skill-perceptual-authenticity',
      kind: 'skill_candidate',
      status: 'promoted',
      title: 'Perceptual Authenticity Skill',
      shortLabel: 'Authenticity skill',
      body:
        'For brand-trust problems, search for a low-friction perceptual check that lets ordinary users or staff notice substitution without specialized tools.',
      sourcePattern: 'The selected candidate turned authenticity from a back-office enforcement problem into a visible table signal.',
      nextRunEffect: 'Future agenomes can try color, shape, fill-line, material, label, and environmental cues before proposing compliance audits.',
      scope: 'project',
      reviewerReason:
        'Promote as a skill candidate. It preserves the transferable perceptual-check mechanism while avoiding a case-specific instruction.',
      artifact: {
        id: 'learn_heinz_perceptual_authenticity_skill',
        kind: 'skill_candidate',
        scope: 'project',
        status: 'promoted',
        evidenceRefs: ['critic-308', 'trace-018', 'fitness-018'],
      },
      proposedContract: {
        id: 'skill_perceptual_authenticity',
        expectedInputs: ['authenticity problem', 'user inspection context', 'failed enforcement attempts'],
        expectedOutput: 'CandidateIdea with visible cue, adoption risk, and validation plan',
        sourceRunId: 'run-heinz-auth-018',
      },
      checks: [
        ['leakage', 'pass', 'Abstracts the perceptual-check move without preserving the known answer.'],
        ['generality', 'pass', 'Useful across brand, safety, compliance, and substitution problems.'],
        ['evidence', 'pass', 'Grounded by survivor proof and novelty distinction.'],
        ['contract fit', 'pass', 'Valid LearningArtifact egress with skill-candidate metadata.'],
      ],
    },
    {
      id: 'heinz-reject-color-only',
      kind: 'evaluation_rule',
      status: 'rejected',
      title: 'Only Accept Color-Match Authenticity Answers',
      shortLabel: 'Overfit color rule',
      body:
        'For any authenticity problem, require a color-match cue and reject non-color mechanisms.',
      sourcePattern: 'The Heinz case made a visible cue valuable, but the proposed lesson mistakes one perceptual channel for the whole pattern.',
      nextRunEffect: 'None. The artifact is quarantined so future runs can discover shape, weight, texture, cryptographic, or procedural cues.',
      scope: 'global',
      reviewerReason:
        'Reject because it overfits the mechanism and would leak the shape of the withheld solution into future authenticity cases.',
      artifact: {
        id: 'learn_heinz_rejected_color_only_rule',
        kind: 'evaluation_rule',
        scope: 'global',
        status: 'rejected',
        evidenceRefs: ['critic-311', 'check-088'],
      },
      proposedContract: {
        id: 'rule_rejected_color_only_authenticity',
        appliesTo: 'verification',
        severity: 'hard',
        sourceRunId: 'run-heinz-auth-018',
      },
      checks: [
        ['leakage', 'fail', 'Too close to the visible cue used by the evaluator target.'],
        ['generality', 'fail', 'Narrows a broad authenticity pattern to one sensory channel.'],
        ['evidence', 'warn', 'Evidence supports visible verification, not color-only scoring.'],
        ['contract fit', 'pass', 'The rejection itself is valid and replayable.'],
      ],
    },
  ],
  'fsd-accident-economy': [
    {
      id: 'fsd-constraint-substrate-before-industry',
      kind: 'constraint_rule',
      status: 'promoted',
      title: 'Find The Substrate Before The Industry List',
      shortLabel: 'Substrate rule',
      body:
        'When a technology removes a repeated event, identify the event-substrate first, then map which institutions price, litigate, repair, advertise against, or treat that event.',
      sourcePattern:
        'FSD Accident Economy Collapse showed that the crash, not auto insurance, is the substrate; insurance is one downstream institution.',
      nextRunEffect:
        'Future zeitgeist cases must name the disappearing substrate before listing winners and losers.',
      scope: 'case_family',
      reviewerReason:
        'Promote as a soft problem-recovery constraint. It captures the accident-economy frame without leaking the specific hidden dependents.',
      artifact: {
        id: 'learn_fsd_substrate_before_industry',
        kind: 'constraint_rule',
        scope: 'case_family',
        status: 'promoted',
        evidenceRefs: ['critic-402', 'novelty-119', 'fitness-031'],
      },
      proposedContract: {
        id: 'constraint_substrate_before_industry_list',
        artifactId: 'learn_fsd_substrate_before_industry',
        appliesTo: 'problem_recovery',
        severity: 'soft',
        sourceRunId: 'run-fsd-accident-031',
      },
      checks: [
        ['leakage', 'pass', 'Does not name insurer advertising or organ supply as required answers.'],
        ['generality', 'pass', 'Applies to substrate-removal cases beyond autonomy.'],
        ['evidence', 'pass', 'Supported by final proof and novelty evidence.'],
        ['contract fit', 'pass', 'Valid LearningArtifact plus ConstraintRule egress.'],
      ],
    },
    {
      id: 'fsd-skill-breadth-depth-map',
      kind: 'skill_candidate',
      status: 'promoted',
      title: 'Breadth Then Depth Skill',
      shortLabel: 'Breadth-depth skill',
      body:
        'For visible-entry zeitgeist cases, first map the whole dependent web, then choose the weirdest high-leverage nodes for two- and three-step depth chains.',
      sourcePattern:
        'The accident-economy run gained value only after moving from insurance/body shops into media funding and trauma-organ supply.',
      nextRunEffect:
        'Future agenomes must separate first-order obvious effects, hidden dependents, counter-currents, and dated falsifiers.',
      scope: 'project',
      reviewerReason:
        'Promote as a skill candidate because it preserves the scoring shape of the case without hard-coding a target industry.',
      artifact: {
        id: 'learn_fsd_breadth_depth_skill',
        kind: 'skill_candidate',
        scope: 'project',
        status: 'promoted',
        evidenceRefs: ['trace-031', 'critic-406', 'fitness-031'],
      },
      proposedContract: {
        id: 'skill_breadth_then_depth',
        expectedInputs: ['visible first-order consensus', 'technology timing signal', 'dependent institutions'],
        expectedOutput: 'CandidateIdea with substrate, breadth map, depth chains, synthesis, and falsifiers',
        sourceRunId: 'run-fsd-accident-031',
      },
      checks: [
        ['leakage', 'pass', 'Names the method, not the evaluator-only hidden dependencies.'],
        ['generality', 'pass', 'Useful across autonomy, AI distribution, energy, and infrastructure cases.'],
        ['evidence', 'pass', 'Grounded by the FSD case scoring notes and trace evidence.'],
        ['contract fit', 'pass', 'Valid LearningArtifact egress with skill-candidate metadata.'],
      ],
    },
    {
      id: 'fsd-reject-insurance-only',
      kind: 'evaluation_rule',
      status: 'rejected',
      title: 'Score Insurance Collapse As The Whole Answer',
      shortLabel: 'Shallow FSD rule',
      body:
        'Accept an FSD accident-economy answer if it says auto insurance premiums and body shops decline.',
      sourcePattern:
        'Those effects are true but visible; the case exists to test hidden-dependency discovery and depth chains.',
      nextRunEffect:
        'None. The artifact is quarantined so future FSD cluster cases do not reward obvious first-order lists.',
      scope: 'global',
      reviewerReason:
        'Reject because it would collapse the benchmark to the consensus play the case is designed to beat.',
      artifact: {
        id: 'learn_fsd_rejected_insurance_only',
        kind: 'evaluation_rule',
        scope: 'global',
        status: 'rejected',
        evidenceRefs: ['critic-409', 'check-121'],
      },
      proposedContract: {
        id: 'rule_rejected_fsd_insurance_only',
        appliesTo: 'verification',
        severity: 'hard',
        sourceRunId: 'run-fsd-accident-031',
      },
      checks: [
        ['leakage', 'pass', 'Does not reveal the hidden dependents.'],
        ['generality', 'fail', 'Rewards a visible-entry answer and misses the benchmark shape.'],
        ['evidence', 'warn', 'Insurance is evidence, but not sufficient evidence.'],
        ['contract fit', 'pass', 'The rejection itself is valid and replayable.'],
      ],
    },
  ],
};

export function getDistillationLearningExamples(caseId) {
  return distillationLearningByCase[caseId] || distillationLearningByCase['jack-superyacht-drone'];
}
