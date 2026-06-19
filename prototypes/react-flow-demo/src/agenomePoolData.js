import { fusionAgenomes } from './fusionData.js';

export const agenomePoolBoundary = {
  upstreamModules: ['Curated Mutagen Library', 'Historical Run Projections', 'Operator Run Config'],
  upstreamContracts: ['Agenome', 'fitness.scored', 'novelty.scored', 'energy.spent'],
  downstreamContracts: ['RunConfig.startingPopulation', 'agenome.spawned', 'MutationPolicy', 'ToolPermissionSet'],
  downstreamModules: ['Runtime Kernel', 'Energy Metabolism', 'Fusion Lab', 'Critic Council'],
  invariants: [
    'starting population is bounded',
    'tool permissions are explicit',
    'pool diversity is visible before run start',
    'history informs selection without guaranteeing future winners',
  ],
};

export const agenomeContractShapes = {
  ingress: [
    {
      name: 'Agenome',
      anchor: 'ARCHITECTURE.md Appendix A candidate contract family',
      fields: [
        ['id', 'string'],
        ['title', 'string'],
        ['strategy', 'mutagen strategy description'],
        ['traits', 'string[]'],
        ['toolPermissions', 'ToolPermissionSet'],
        ['history', 'fitness/novelty/energy prior events'],
        ['mutationHints', 'preferred mutation/fusion metadata'],
      ],
    },
    {
      name: 'HistoricalScoreProjection',
      anchor: 'Derived from stored score and spend events',
      fields: [
        ['agenomeId', 'string'],
        ['fitness', 'number'],
        ['novelty', 'number'],
        ['energyEfficiency', 'number'],
        ['subtypeFit', 'cross_domain_transfer | zeitgeist_synthesis | mixed'],
      ],
    },
  ],
  egress: [
    {
      name: 'RunConfig.startingPopulation',
      anchor: 'Runtime Kernel ingress',
      fields: [
        ['caseId', 'string'],
        ['selectedAgenomeIds', 'string[]'],
        ['populationCap', 'integer'],
        ['toolCaps', 'per-agenome permissions'],
        ['diversityWarnings', 'string[]'],
      ],
    },
    {
      name: 'agenome.spawned',
      anchor: 'run_events lifecycle event',
      fields: [
        ['runId', 'string'],
        ['agenomeId', 'string'],
        ['generationId', 'string'],
        ['initialEnergy', 'number'],
        ['mutationPolicyRef', 'string'],
      ],
    },
  ],
};

const enrichment = {
  'addition-by-subtraction': {
    traits: ['subtractive', 'de-escalating', 'operationally quiet'],
    tools: ['case_memory', 'critic_read'],
    subtypeFit: 'cross_domain_transfer',
    energyEfficiency: 82,
    mutationHint: 'Mutates well with hidden-constraint hunters and risk reducers.',
    risk: 'Can over-remove useful context if paired with another minimalist.',
  },
  blindside: {
    traits: ['failure-seeking', 'adversarial', 'edge-case sensitive'],
    tools: ['critic_read', 'prior_art_lookup', 'case_memory'],
    subtypeFit: 'mixed',
    energyEfficiency: 74,
    mutationHint: 'Best used as a pressure parent or verifier-side ancestor.',
    risk: 'Can slow runs by finding too many possible failure paths.',
  },
  breakout: {
    traits: ['frame-breaking', 'high-novelty', 'boundary-questioning'],
    tools: ['case_memory', 'retrieval'],
    subtypeFit: 'zeitgeist_synthesis',
    energyEfficiency: 61,
    mutationHint: 'Useful early for exploration, then needs grounding pressure.',
    risk: 'High novelty can outrun feasibility without critic support.',
  },
  breakthrough: {
    traits: ['mechanism-finding', 'synthesis-oriented', 'practical surprise'],
    tools: ['case_memory', 'retrieval', 'critic_read'],
    subtypeFit: 'mixed',
    energyEfficiency: 86,
    mutationHint: 'Strong parent for final-generation fusion.',
    risk: 'Can collapse the pool if selected too often from early wins.',
  },
  'constraint-injection': {
    traits: ['constraint-heavy', 'safety-aware', 'scope-bounding'],
    tools: ['case_memory', 'policy_check'],
    subtypeFit: 'cross_domain_transfer',
    energyEfficiency: 88,
    mutationHint: 'Stabilizes high-novelty parents with hard caps.',
    risk: 'May prematurely reject weird-but-useful candidates.',
  },
  'first-principles': {
    traits: ['decomposition', 'root-cause', 'asset-focused'],
    tools: ['case_memory'],
    subtypeFit: 'mixed',
    energyEfficiency: 91,
    mutationHint: 'Good seed ancestor for most cases; keeps objective clean.',
    risk: 'Can produce obvious answers if not paired with novelty pressure.',
  },
  polymath: {
    traits: ['cross-domain', 'analogy-driven', 'pattern-importing'],
    tools: ['retrieval', 'prior_art_lookup', 'case_memory'],
    subtypeFit: 'cross_domain_transfer',
    energyEfficiency: 79,
    mutationHint: 'Pairs well with constraint and feasibility critics.',
    risk: 'Analogies need source-domain validation.',
  },
};

export const agenomePoolLibrary = fusionAgenomes.map((agenome) => {
  const extra = enrichment[agenome.id];
  return {
    ...agenome,
    traits: extra.traits,
    tools: extra.tools,
    subtypeFit: extra.subtypeFit,
    energyEfficiency: extra.energyEfficiency,
    mutationHint: extra.mutationHint,
    risk: extra.risk,
    fitness: Math.round(
      (agenome.scores.grounding + agenome.scores.feasibility + agenome.scores.operationalFit) / 3,
    ),
    novelty: agenome.scores.novelty,
    pressure: agenome.hardestPressure,
    priorEvents: [
      `fitness.scored:${Math.round((agenome.scores.grounding + agenome.scores.feasibility) / 2)}`,
      `novelty.scored:${agenome.scores.novelty}`,
      `energy.spent:${Math.max(8, Math.round((100 - extra.energyEfficiency) / 2))}`,
    ],
  };
});

export const defaultStartingPool = ['first-principles', 'constraint-injection', 'polymath', 'breakthrough'];
export const minimumPoolSize = 3;
export const maximumPoolSize = 5;

export function evaluateStartingPool(selectedIds) {
  const selected = agenomePoolLibrary.filter((agenome) => selectedIds.includes(agenome.id));
  const subtypeSet = new Set(selected.map((agenome) => agenome.subtypeFit));
  const toolSet = new Set(selected.flatMap((agenome) => agenome.tools));
  const traitCount = new Set(selected.flatMap((agenome) => agenome.traits)).size;
  const avgFitness = average(selected.map((agenome) => agenome.fitness));
  const avgNovelty = average(selected.map((agenome) => agenome.novelty));
  const avgEfficiency = average(selected.map((agenome) => agenome.energyEfficiency));
  const warnings = [];

  if (selected.length < minimumPoolSize) warnings.push('Pool is too small for meaningful selection pressure.');
  if (selected.length > maximumPoolSize) warnings.push('Pool exceeds MVP population cap.');
  if (!subtypeSet.has('cross_domain_transfer')) warnings.push('Missing cross-domain transfer pressure.');
  if (!subtypeSet.has('zeitgeist_synthesis') && !subtypeSet.has('mixed')) warnings.push('Missing zeitgeist or mixed synthesis pressure.');
  if (traitCount < 8) warnings.push('Trait diversity is narrow; mutation may collapse early.');
  if (!toolSet.has('critic_read')) warnings.push('No selected agenome can read critic feedback.');

  return {
    selected,
    subtypeSet,
    toolSet,
    traitCount,
    avgFitness,
    avgNovelty,
    avgEfficiency,
    warnings,
    ready: warnings.length === 0,
  };
}

function average(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}
