export const intakeExamples = [
  {
    id: 'jack-superyacht-drone',
    title: 'Superyacht Drone Privacy',
    source: 'case-study packet',
    readiness: 92,
    leakageRisk: 'low',
    summary:
      'A famous yacht guest wants private time onboard, but paparazzi drones can film from outside the vessel. The challenge is preserving privacy without jamming, physical takedown, spectacle, or late reactions that still leave useful footage.',
    agentVisible: {
      problem:
        'A high-profile yacht guest can be filmed by paparazzi drones from outside the vessel even while using the yacht as private space.',
      context: [
        'Superyachts are expected to provide discretion and controlled visibility.',
        'Exterior decks remain exposed from the air.',
        'The drone does not need to touch the yacht to create the harm.',
      ],
      constraints: [
        'Avoid broad RF jamming.',
        'Avoid physical takedown.',
        'Account for self-returning drones.',
        'Avoid public spectacle.',
        'Keep the response crew-simple.',
      ],
      successCriteria: [
        'Preserve privacy before useful footage exists.',
        'Explain who acts, when, and why.',
        'Include a plausible validation plan.',
      ],
    },
    evaluatorOnly: {
      knownSolution:
        'Early detection should trigger a discreet onboard protocol that denies the drone useful footage before it exists.',
      hiddenAnchors: [
        'The real target is the footage, not the drone.',
        'The strongest answer acts before visual capture.',
        'A good answer avoids turning the response into a visible security event.',
      ],
      solutionLeakageTerms: ['deny useful footage', 'early detection', 'private onboard protocol'],
    },
    checks: [
      { id: 'visible-packet', label: 'Agent-visible packet complete', status: 'pass', detail: 'Problem, context, constraints, and success criteria are present.' },
      { id: 'withheld-boundary', label: 'Evaluator target withheld', status: 'pass', detail: 'Known solution lives only in evaluator-only fields.' },
      { id: 'leakage', label: 'Solution leakage scan', status: 'pass', detail: 'No hidden-anchor phrase appears in the visible prompt.' },
      { id: 'runnability', label: 'Doppl runnability', status: 'pass', detail: 'The case has clear constraints and enough hidden friction for non-obvious reasoning.' },
    ],
    downstreamPreview: {
      runSeed: 'case:jack-superyacht-drone',
      enabledSubtypes: ['cross_domain_transfer', 'zeitgeist_synthesis'],
      evaluatorAnchor: 'withheld:footage-denial-before-capture',
      initialEnergy: 350,
    },
  },
  {
    id: 'loft-insulation-adoption',
    title: 'Loft Insulation Adoption Failure',
    source: 'case-study packet',
    readiness: 88,
    leakageRisk: 'low',
    summary:
      'Households were not installing loft insulation even when the financial case was sensible. The case tests whether Doppl looks for hidden practical friction instead of over-explaining adoption as belief or incentive failure.',
    agentVisible: {
      problem:
        'Many households delay or avoid loft insulation despite cost savings, warmth, and long-term energy benefits.',
      context: [
        'An uninsulated home can lose substantial heat through the roof.',
        'The technical installation can be straightforward when the loft is accessible.',
        'Awareness and subsidy explanations do not fully explain low adoption.',
      ],
      constraints: [
        'Do not rely only on more education.',
        'Do not assume households behave irrationally.',
        'Account for installation happening inside messy lived-in homes.',
        'Find the last-mile blocker at the point of action.',
      ],
      successCriteria: [
        'Identify a hidden practical constraint.',
        'Propose a bundled intervention that removes the blocker.',
        'Explain why financial rationality was not enough.',
      ],
    },
    evaluatorOnly: {
      knownSolution:
        'The real blocker was junk-filled lofts; offering low-cost clearing labor increased installation.',
      hiddenAnchors: [
        'The blocker is practical friction, not belief.',
        'Lofts full of stored belongings prevent installation.',
        'Bundle clearing labor with the installation offer.',
      ],
      solutionLeakageTerms: ['junk-filled lofts', 'clearing labor', 'stored belongings'],
    },
    checks: [
      { id: 'visible-packet', label: 'Agent-visible packet complete', status: 'pass', detail: 'The prompt includes adoption context and installation setting.' },
      { id: 'withheld-boundary', label: 'Evaluator target withheld', status: 'pass', detail: 'The clearing-labor solution is not in the visible packet.' },
      { id: 'leakage', label: 'Solution leakage scan', status: 'pass', detail: 'Hidden practical blocker terms are excluded from the prompt.' },
      { id: 'runnability', label: 'Doppl runnability', status: 'warn', detail: 'Primary trial source is thin; mark fidelity honestly in evaluation notes.' },
    ],
    downstreamPreview: {
      runSeed: 'case:loft-insulation-adoption',
      enabledSubtypes: ['cross_domain_transfer', 'zeitgeist_synthesis'],
      evaluatorAnchor: 'withheld:hidden-practical-friction',
      initialEnergy: 320,
    },
  },
  {
    id: 'heinz-ketchup-authenticity',
    title: 'Heinz Ketchup Authenticity',
    source: 'case-study packet',
    readiness: 86,
    leakageRisk: 'medium',
    summary:
      'Restaurants can place Heinz bottles on tables but refill them with cheaper ketchup. The case tests whether Doppl can move from enforcement to a visible, low-cost authenticity cue at the point of use.',
    agentVisible: {
      problem:
        'A restaurant can capture the Heinz brand signal by refilling a visible Heinz bottle with cheaper ketchup.',
      context: [
        'Customers see the bottle but not the refill process.',
        'Taste alone is an imperfect detection mechanism.',
        'Heinz cannot station auditors in every cafe.',
      ],
      constraints: [
        'Avoid costly enforcement as the primary solution.',
        'Avoid electronics or complex inspection behavior.',
        'Work at the table, in the moment.',
        'Keep packaging changes subtle and scalable.',
      ],
      successCriteria: [
        'Make substitution easier for ordinary customers to notice.',
        'Use the package as the interface.',
        'Preserve brand trust without creating a heavy process.',
      ],
    },
    evaluatorOnly: {
      knownSolution:
        'A label/bottle cue revealed whether the ketchup inside matched real Heinz color and fill behavior.',
      hiddenAnchors: [
        'The package itself should reveal authenticity.',
        'The verification cue must be visible to customers at the table.',
        'A minor label change can call out imposters.',
      ],
      solutionLeakageTerms: ['label change', 'calls out imposters', 'authenticity cue'],
    },
    checks: [
      { id: 'visible-packet', label: 'Agent-visible packet complete', status: 'pass', detail: 'Fraud context and packaging interface are present.' },
      { id: 'withheld-boundary', label: 'Evaluator target withheld', status: 'pass', detail: 'Specific label intervention remains hidden.' },
      { id: 'leakage', label: 'Solution leakage scan', status: 'warn', detail: 'Visible prompt mentions packaging as an interface; acceptable but close to the solution family.' },
      { id: 'runnability', label: 'Doppl runnability', status: 'pass', detail: 'Clear hidden constraint and obvious failed approaches.' },
    ],
    downstreamPreview: {
      runSeed: 'case:heinz-ketchup-authenticity',
      enabledSubtypes: ['cross_domain_transfer'],
      evaluatorAnchor: 'withheld:visible-tabletop-authentication',
      initialEnergy: 300,
    },
  },
];

export const intakeBoundary = {
  upstreamModules: ['case-study markdown', 'operator upload', 'curated example library'],
  upstreamContracts: ['CasePacketDraft', 'VisibilityBoundary', 'SourceFidelityNote'],
  downstreamContracts: ['RunConfig.seed', 'CandidateIdea.context', 'EvaluatorAnchorRef', 'EvidenceRef'],
  downstreamModules: ['Live Run Operator Console', 'Energy Metabolism', 'Critic Council', 'Final Survivor Proof Panel'],
  invariants: [
    'agent-visible text excludes evaluator-only solution anchors',
    'candidate text is data, not instructions',
    'case packets seed runs but do not mutate scoring rubrics',
    'source fidelity travels with the run seed',
  ],
};

export const intakeContractShapes = {
  ingress: [
    {
      anchor: 'Prototype-local · candidate for packages/contracts',
      name: 'CasePacketDraft',
      fields: [
        ['id', 'string'],
        ['title', 'string'],
        ['sourceType', 'case-study packet | uploaded local draft | imported row'],
        ['rawText?', 'string'],
        ['agentVisible', 'AgentVisibleCaseContext'],
        ['evaluatorOnly', 'EvaluatorOnlyCaseContext'],
        ['sourceFidelity', 'SourceFidelityNote'],
        ['visibilityBoundary', 'VisibilityBoundary'],
      ],
    },
    {
      anchor: 'Prototype-local · section 14 safety boundary',
      name: 'VisibilityBoundary',
      fields: [
        ['agentVisibleFields', 'problem | context | constraints | successCriteria'],
        ['evaluatorOnlyFields', 'knownSolution | hiddenAnchors | leakageTerms'],
        ['sensitiveFields', 'string[]'],
        ['publicSummaryAllowed', 'boolean'],
        ['rule', 'evaluator-only fields never enter generation prompts'],
      ],
    },
    {
      anchor: 'Prototype-local · source traceability',
      name: 'SourceFidelityNote',
      fields: [
        ['sourceKind', 'transcript | public article | anecdote | uploaded draft'],
        ['confidence', 'high | medium | low | needs_review'],
        ['knownGaps', 'string[]'],
        ['reviewRequired', 'boolean'],
      ],
    },
  ],
  egress: [
    {
      anchor: 'Maps to ARCHITECTURE.md Appendix A RunConfig',
      name: 'RunSeedPacket',
      fields: [
        ['caseId', 'string'],
        ['agentPromptContext', 'agent-visible text only'],
        ['constraints', 'string[]'],
        ['successCriteria', 'string[]'],
        ['sourceFidelity', 'SourceFidelityNote'],
        ['visibilityBoundaryId', 'string'],
      ],
    },
    {
      anchor: 'Prototype-local · held outside breeding loop',
      name: 'EvaluatorAnchorRef',
      fields: [
        ['caseId', 'string'],
        ['hiddenTarget', 'string'],
        ['rubricHints', 'string[]'],
        ['leakageTerms', 'string[]'],
        ['availableToAgents', 'false'],
      ],
    },
    {
      anchor: 'Maps downstream to Appendix A + verifier inputs',
      name: 'DownstreamMapping',
      fields: [
        ['RunConfig.seed', 'RunSeedPacket.caseId'],
        ['CandidateIdea.context', 'RunSeedPacket.agentPromptContext'],
        ['CriticCouncil.trustedRubric', 'rubric + EvaluatorAnchorRef, never candidate text'],
        ['EvidenceRef.label', 'case source + fidelity note'],
      ],
    },
  ],
};

export function buildIntakeContractInstance(caseItem) {
  const sourceKind = caseItem.id === 'uploaded-draft'
    ? 'uploaded draft'
    : caseItem.id.includes('loft')
      ? 'public anecdote + policy context'
      : caseItem.id.includes('heinz')
        ? 'public article + campaign summary'
        : 'expert transcript summary';
  const confidence = caseItem.id === 'uploaded-draft'
    ? 'needs_review'
    : caseItem.checks.some((check) => check.status === 'warn')
      ? 'medium'
      : 'high';
  const visibleFields = Object.entries(caseItem.agentVisible)
    .filter(([, value]) => Array.isArray(value) ? value.length > 0 : Boolean(value))
    .map(([key]) => key);
  const hiddenFields = Object.entries(caseItem.evaluatorOnly)
    .filter(([, value]) => Array.isArray(value) ? value.length > 0 : Boolean(value))
    .map(([key]) => key);

  return {
    ingress: [
      ['CasePacketDraft.id', caseItem.id],
      ['CasePacketDraft.title', caseItem.title],
      ['CasePacketDraft.sourceType', caseItem.source],
      ['SourceFidelityNote.sourceKind', sourceKind],
      ['SourceFidelityNote.confidence', confidence],
      ['VisibilityBoundary.agentVisibleFields', visibleFields.join(', ')],
      ['VisibilityBoundary.evaluatorOnlyFields', hiddenFields.join(', ')],
    ],
    egress: [
      ['RunSeedPacket.caseId', caseItem.id],
      ['RunConfig.seed', caseItem.downstreamPreview.runSeed],
      ['EvaluatorAnchorRef.hiddenTarget', caseItem.downstreamPreview.evaluatorAnchor],
      ['EvaluatorAnchorRef.availableToAgents', 'false'],
      ['RunCaps.energyBudget', `${caseItem.downstreamPreview.initialEnergy} doppl_energy`],
      ['CandidateIdea.context', 'agent-visible packet only'],
      ['EvidenceRef.label', `${caseItem.title} · ${confidence} fidelity`],
    ],
  };
}

export function buildUploadedCase(fileName, body) {
  const trimmed = body.trim();
  const title = fileName?.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') || 'Uploaded Case Draft';
  const preview = trimmed.length > 680 ? `${trimmed.slice(0, 680)}...` : trimmed;
  const hasConstraints = /constraint|avoid|must|cannot|should not|success/i.test(trimmed);
  const hasWithheld = /withheld|known solution|evaluator|answer/i.test(trimmed);
  const hasProblem = trimmed.length > 160;

  return {
    id: 'uploaded-draft',
    title,
    source: 'uploaded local draft',
    readiness: [hasProblem, hasConstraints, hasWithheld].filter(Boolean).length * 26 + 12,
    leakageRisk: hasWithheld ? 'medium' : 'unknown',
    summary:
      preview ||
      'Upload a markdown or text case packet to preview how Doppl would split visible prompt context from evaluator-only notes.',
    agentVisible: {
      problem: preview || 'No visible problem text detected yet.',
      context: [
        hasProblem ? 'Draft contains enough text for an initial problem packet.' : 'Draft is too short for a reliable run seed.',
        hasConstraints ? 'Constraint-like language detected.' : 'No explicit constraints detected.',
      ],
      constraints: hasConstraints
        ? ['Review extracted constraints manually before running.', 'Keep evaluator-only solution notes outside this visible packet.']
        : ['Add explicit constraints before using this as a run seed.'],
      successCriteria: ['Human review required before run start.', 'Confirm solution leakage scan after parsing.'],
    },
    evaluatorOnly: {
      knownSolution: hasWithheld
        ? 'Potential evaluator-only text detected. Move known solution details into hidden fields before run start.'
        : 'No evaluator-only solution field detected in the uploaded draft.',
      hiddenAnchors: hasWithheld
        ? ['Review withheld / evaluator / known-solution sections manually.']
        : ['Add withheld evaluator target if this is intended as an evaluation case.'],
      solutionLeakageTerms: hasWithheld ? ['withheld', 'known solution', 'evaluator'] : [],
    },
    checks: [
      {
        id: 'visible-packet',
        label: 'Agent-visible packet complete',
        status: hasProblem ? 'warn' : 'fail',
        detail: hasProblem ? 'Enough text exists for a draft packet, but fields need human confirmation.' : 'Upload more problem context.',
      },
      {
        id: 'withheld-boundary',
        label: 'Evaluator target withheld',
        status: hasWithheld ? 'warn' : 'fail',
        detail: hasWithheld ? 'Possible hidden-solution text detected; split it before run start.' : 'No evaluator-only target detected.',
      },
      {
        id: 'leakage',
        label: 'Solution leakage scan',
        status: 'warn',
        detail: 'Uploaded drafts require manual leakage review before they become fixtures.',
      },
      {
        id: 'runnability',
        label: 'Doppl runnability',
        status: hasConstraints ? 'warn' : 'fail',
        detail: hasConstraints ? 'Constraints detected; still needs structured field extraction.' : 'Add constraints and success criteria.',
      },
    ],
    downstreamPreview: {
      runSeed: 'case:uploaded-draft',
      enabledSubtypes: ['cross_domain_transfer', 'zeitgeist_synthesis'],
      evaluatorAnchor: hasWithheld ? 'draft:needs-hidden-anchor-review' : 'missing:evaluator-anchor',
      initialEnergy: 250,
    },
  };
}
