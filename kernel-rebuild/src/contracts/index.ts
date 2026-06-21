export type Dial = 'diverge' | 'converge';

export type CandidateSubtype = 'cross_domain_transfer' | 'zeitgeist_synthesis';

export type SpaceKind = 'datastore' | 'module' | 'human' | 'artifact';

export type SpaceRef = {
  id: string;
  label: string;
  kind: SpaceKind;
};

export type ContractRef = {
  name: string;
  schemaId: string;
  direction: 'in' | 'out';
};

export type BoundaryContract = {
  module: string;
  entersFrom: SpaceRef;
  input: ContractRef;
  output: ContractRef;
  exitsTo: SpaceRef;
};

export type Seed = {
  id: string;
  title: string;
  prompt: string;
  thesis: string;
  goals: string[];
};

export type CandidateMetricInputs = {
  sourceAbsence: number;
  substrateDistance: number;
  hiddenDependents: number;
  signalStrength: number;
  mechanismClarity: number;
  falsifiability: number;
  riskPenalty: number;
};

export type Candidate = {
  id: string;
  parentId: string;
  subtype: CandidateSubtype;
  title: string;
  thesis: string;
  substrate: string;
  claims: string[];
  evidence: string[];
  metrics: CandidateMetricInputs;
};

export type SeedFixture = {
  seed: Seed;
  candidates: Candidate[];
};

export type CandidatePool = {
  seed: Seed;
  candidates: Candidate[];
};

export type FitnessScore = {
  novelty: number;
  grounding: number;
  components: {
    sourceAbsence: number;
    substrateDistance: number;
    hiddenDependents: number;
    signalStrength: number;
    mechanismClarity: number;
    falsifiability: number;
    riskPenalty: number;
  };
  reasons: {
    novelty: string;
    grounding: string;
  };
};

export type ScoredCandidate = Candidate & {
  fitness: FitnessScore;
};

export type ScoredCandidatePool = {
  seed: Seed;
  candidates: ScoredCandidate[];
};

export type SelectionSchedule = {
  dial: Dial;
  keep: number;
  priorityAxis: 'novelty' | 'grounding';
  floorAxis: 'novelty' | 'grounding';
  floor: number;
  description: string;
};

export type SelectedCandidate = ScoredCandidate & {
  selection: {
    front: number;
    rank: number;
    directionalScore: number;
    reason: string;
  };
};

export type DialContrast = {
  selectedId: string;
  status: 'stable' | 'replaced';
  alternateId: string;
  reason: string;
};

export type SelectionResult = {
  schedule: SelectionSchedule;
  selected: SelectedCandidate[];
  rejected: SelectedCandidate[];
};

export type SelectionComparison = {
  focus: SelectionResult;
  alternate: SelectionResult;
  contrasts: DialContrast[];
};

export type GoalCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

export type TraceEvent = {
  stage: string;
  input: string;
  decision: string;
  reason: string;
  output: string;
  goalChecks: GoalCheck[];
  boundary?: BoundaryContract;
};

export type RunTrace = {
  runId: string;
  dial: Dial;
  seed: Seed;
  candidateCount: number;
  boundaryContracts: BoundaryContract[];
  events: TraceEvent[];
  goalChecks: GoalCheck[];
  comparison: SelectionComparison;
};

export const boundaryContracts: BoundaryContract[] = [
  {
    module: 'generate',
    entersFrom: { id: 'fixture-seed-store', label: 'FixtureSeedStore', kind: 'datastore' },
    input: { name: 'SeedFixture', schemaId: 'kernel.seed-fixture.v1', direction: 'in' },
    output: { name: 'CandidatePool', schemaId: 'kernel.candidate-pool.v1', direction: 'out' },
    exitsTo: { id: 'fitness', label: 'fitness', kind: 'module' },
  },
  {
    module: 'fitness',
    entersFrom: { id: 'generate', label: 'generate', kind: 'module' },
    input: { name: 'CandidatePool', schemaId: 'kernel.candidate-pool.v1', direction: 'in' },
    output: { name: 'ScoredCandidatePool', schemaId: 'kernel.scored-candidate-pool.v1', direction: 'out' },
    exitsTo: { id: 'select', label: 'select', kind: 'module' },
  },
  {
    module: 'select',
    entersFrom: { id: 'fitness', label: 'fitness', kind: 'module' },
    input: { name: 'ScoredCandidatePool + SelectionSchedule', schemaId: 'kernel.selection-input.v1', direction: 'in' },
    output: { name: 'SelectionComparison', schemaId: 'kernel.selection-comparison.v1', direction: 'out' },
    exitsTo: { id: 'trace-report', label: 'trace/report', kind: 'module' },
  },
  {
    module: 'trace/report',
    entersFrom: { id: 'select', label: 'select', kind: 'module' },
    input: { name: 'KernelRun', schemaId: 'kernel.run.v1', direction: 'in' },
    output: { name: 'RunDigest + RunReport + RunTrace', schemaId: 'kernel.visibility-artifacts.v1', direction: 'out' },
    exitsTo: { id: 'human-reviewer', label: 'HumanReviewer', kind: 'human' },
  },
];

export function getBoundary(module: string): BoundaryContract {
  const boundary = boundaryContracts.find((item) => item.module === module);
  if (!boundary) {
    throw new Error(`Unknown boundary: ${module}`);
  }
  return boundary;
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(3))));
}

export function assertSeedFixture(value: unknown): SeedFixture {
  if (!value || typeof value !== 'object') {
    throw new Error('Seed fixture must be an object.');
  }
  const fixture = value as SeedFixture;
  if (!fixture.seed || !Array.isArray(fixture.candidates)) {
    throw new Error('Seed fixture must contain seed and candidates.');
  }
  if (!fixture.seed.id || !fixture.seed.title || !fixture.seed.prompt) {
    throw new Error('Seed is missing id, title, or prompt.');
  }
  for (const candidate of fixture.candidates) {
    if (!candidate.id || !candidate.title || !candidate.thesis || !candidate.metrics) {
      throw new Error(`Candidate is missing required fields: ${candidate.id || '<unknown>'}`);
    }
  }
  return fixture;
}
