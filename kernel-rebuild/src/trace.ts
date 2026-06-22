// Builds a complete machine trace for one kernel run.
import type {
  Candidate,
  CandidatePool,
  Dial,
  GenerationQuality,
  GenerationSummary,
  KnowledgeGateway,
  KnowledgePacket,
  KnowledgePacketItem,
  KnowledgePacketRequest,
  LensConfig,
  MemoryMode,
  RunCaps,
  RunTrace,
  ScoredCandidate,
  ScoredCandidatePool,
  SelectionComparison,
  SeedFixture,
  TraceEvent,
} from './contracts/index.ts';
import { RUN_TRACE_SCHEMA_VERSION, boundaryContracts, defaultRunCaps, getBoundary } from './contracts/index.ts';
import { scoreCandidatePool } from './fitness.ts';
import { generateCandidatePool } from './generate.ts';
import { applyLenses } from './lens.ts';
import { compareSelections } from './select.ts';

function generatedRunId(dial: Dial): string {
  return `kernel-${dial}-${new Date().toISOString().replace(/[:.]/g, '-')}`;
}

function mergeCaps(caps?: Partial<RunCaps>): RunCaps {
  return {
    ...defaultRunCaps,
    ...caps,
  };
}

function mergePools(seed: SeedFixture['seed'], pools: CandidatePool[]): CandidatePool {
  return {
    seed,
    candidates: pools.flatMap((pool) => pool.candidates),
    lineage: {
      seedId: seed.id,
      generated: pools.flatMap((pool) => pool.lineage.generated),
      rejected: pools.flatMap((pool) => pool.lineage.rejected),
    },
  };
}

function mergeScoredPools(seed: SeedFixture['seed'], pools: ScoredCandidatePool[]): ScoredCandidatePool {
  return {
    seed,
    candidates: pools.flatMap((pool) => pool.candidates),
  };
}

function eventPayload(event: TraceEvent): Record<string, any> {
  return event.payload || {};
}

function knowledgeRequestPayload(request: KnowledgePacketRequest): Record<string, any> {
  return {
    request_id: request.requestId,
    run_id: request.runId,
    target_case: request.targetCase,
    problem_summary: request.problemSummary,
    memory_mode: request.memoryMode,
    role: request.role,
    max_items: request.maxItems,
  };
}

function knowledgeItemPayload(item: KnowledgePacketItem): Record<string, any> {
  return {
    record_id: item.recordId,
    cite_handle: item.citeHandle,
    kind: item.kind,
    text: item.text,
    source_case: item.sourceCase,
    citation: item.citation,
    trust_tier: item.trustTier,
    visibility: item.visibility,
  };
}

function knowledgePacketPayload(packet: KnowledgePacket): Record<string, any> {
  return {
    packet_id: packet.id,
    request: knowledgeRequestPayload(packet.request),
    items: packet.items.map(knowledgeItemPayload),
    excluded: packet.excluded.map((item) => ({
      record_id: item.recordId,
      case: item.case,
      reason: item.reason,
      kind: item.kind,
      visibility: item.visibility,
    })),
  };
}

function packetFromSelectedEvent(event: TraceEvent): KnowledgePacket | undefined {
  const payload = eventPayload(event);
  const request = payload.request;
  const items = payload.items;
  if (!request || !Array.isArray(items)) return undefined;
  return {
    id: String(payload.packet_id || `packet:${request.run_id || 'replay'}`),
    request: {
      requestId: String(request.request_id || 'replay-request'),
      runId: String(request.run_id || ''),
      targetCase: String(request.target_case || ''),
      problemSummary: String(request.problem_summary || ''),
      memoryMode: (request.memory_mode || 'auto') as MemoryMode,
      role: 'candidate',
      maxItems: Number(request.max_items || items.length),
    },
    items: items.map((item: Record<string, any>) => ({
      recordId: String(item.record_id || ''),
      citeHandle: String(item.cite_handle || ''),
      kind: String(item.kind || ''),
      text: String(item.text || ''),
      sourceCase: String(item.source_case || ''),
      citation: String(item.citation || ''),
      trustTier: String(item.trust_tier || ''),
      visibility: String(item.visibility || ''),
    })),
    excluded: Array.isArray(payload.excluded)
      ? payload.excluded.map((item: Record<string, any>) => ({
          recordId: item.record_id ? String(item.record_id) : undefined,
          case: item.case ? String(item.case) : undefined,
          reason: String(item.reason || ''),
          kind: item.kind ? String(item.kind) : undefined,
          visibility: item.visibility ? String(item.visibility) : undefined,
        }))
      : [],
  };
}

function persistedKnowledgeEvents(replayEvents: TraceEvent[] | undefined): TraceEvent[] {
  return (replayEvents || []).filter((event) => event.type?.startsWith('knowledge.'));
}

function candidateCitesItem(candidate: Candidate, item: KnowledgePacketItem): boolean {
  const contextHandles = candidate.knowledgeContext?.citeHandles || [];
  if (contextHandles.includes(item.citeHandle)) return true;
  return candidate.evidence.some((evidence) => evidence.includes(`[${item.citeHandle}]`));
}

function influenceEvents(packet: KnowledgePacket | undefined, candidates: Candidate[]): TraceEvent[] {
  if (!packet) return [];
  const events: TraceEvent[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    for (const item of packet.items) {
      if (!candidateCitesItem(candidate, item)) continue;
      const key = `${candidate.id}:${item.recordId}:${item.citeHandle}`;
      if (seen.has(key)) continue;
      seen.add(key);
      events.push({
        type: 'knowledge.influence_recorded',
        stage: 'knowledge',
        input: packet.id,
        decision: `Record ${item.citeHandle} influence on ${candidate.id}.`,
        reason: 'Candidate artifact cited an injected knowledge handle.',
        output: `${candidate.id}:${item.recordId}`,
        payload: {
          packet_id: packet.id,
          record_id: item.recordId,
          cite_handle: item.citeHandle,
          artifact_id: candidate.id,
          candidate_id: candidate.id,
          influence: 'cited',
          role: 'candidate',
        },
        goalChecks: [
          {
            id: 'knowledge-influence-recorded',
            label: 'Cited memory items produce influence records for downstream credit.',
            passed: Boolean(item.recordId && item.citeHandle && candidate.id),
            detail: `${item.citeHandle} -> ${candidate.id}`,
          },
        ],
      });
    }
  }
  return events;
}

function creditForCandidate(candidate: ScoredCandidate, comparison: SelectionComparison): {
  credit: 'positive' | 'neutral' | 'negative';
  selectionStatus: 'selected' | 'rejected';
  alternateStatus: 'selected' | 'rejected';
} {
  const focusSelected = comparison.focus.selected.some((item) => item.id === candidate.id);
  const alternateSelected = comparison.alternate.selected.some((item) => item.id === candidate.id);
  return {
    credit: focusSelected ? 'positive' : alternateSelected ? 'neutral' : 'negative',
    selectionStatus: focusSelected ? 'selected' : 'rejected',
    alternateStatus: alternateSelected ? 'selected' : 'rejected',
  };
}

function creditEvents(
  packet: KnowledgePacket | undefined,
  candidates: ScoredCandidate[],
  comparison: SelectionComparison,
): TraceEvent[] {
  if (!packet) return [];
  const events: TraceEvent[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    for (const item of packet.items) {
      if (!candidateCitesItem(candidate, item)) continue;
      const key = `${candidate.id}:${item.recordId}:${item.citeHandle}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const credit = creditForCandidate(candidate, comparison);
      events.push({
        type: 'knowledge.credit_recorded',
        stage: 'knowledge',
        input: `${candidate.id}:${item.recordId}`,
        decision: `Record ${credit.credit} credit for ${item.citeHandle} on ${candidate.id}.`,
        reason: 'Post-selection credit links cited memory to candidate fitness and survival outcome.',
        output: `${item.recordId}:${credit.credit}`,
        payload: {
          packet_id: packet.id,
          record_id: item.recordId,
          cite_handle: item.citeHandle,
          artifact_id: candidate.id,
          candidate_id: candidate.id,
          credit: credit.credit,
          selection_status: credit.selectionStatus,
          alternate_selection_status: credit.alternateStatus,
          novelty: candidate.fitness.novelty,
          grounding: candidate.fitness.grounding,
          fitness_policy_id: candidate.fitness.policyId,
        },
        goalChecks: [
          {
            id: 'knowledge-credit-recorded',
            label: 'Cited memory receives post-selection credit context.',
            passed: Boolean(item.recordId && item.citeHandle && candidate.fitness.policyId),
            detail: `${item.citeHandle} -> ${candidate.id}:${credit.credit}`,
          },
        ],
      });
    }
  }
  return events;
}

function resolveKnowledge(
  fixture: SeedFixture,
  runId: string,
  memoryMode: MemoryMode,
  targetCase: string,
  gateway?: KnowledgeGateway,
  pinnedPacket?: KnowledgePacket,
  replayEvents?: TraceEvent[],
): { packet?: KnowledgePacket; events: TraceEvent[]; replayed: boolean } {
  const replayKnowledgeEvents = persistedKnowledgeEvents(replayEvents);
  if (replayKnowledgeEvents.length) {
    const selected = replayKnowledgeEvents.find((event) => event.type === 'knowledge.packet_selected');
    return {
      packet: selected ? packetFromSelectedEvent(selected) : undefined,
      events: replayKnowledgeEvents,
      replayed: true,
    };
  }

  if (memoryMode === 'off') return { events: [], replayed: false };

  const request: KnowledgePacketRequest = {
    requestId: `kreq:${runId}`,
    runId,
    targetCase,
    problemSummary: fixture.seed.prompt,
    memoryMode,
    role: 'candidate',
    maxItems: 6,
  };
  const packet = memoryMode === 'pinned'
    ? pinnedPacket
    : gateway?.selectPacket(request);
  if (!packet) return { events: [], replayed: false };

  const requestEvent: TraceEvent = {
    type: 'knowledge.packet_requested',
    stage: 'knowledge',
    input: 'RunConfig',
    decision: `Request ${memoryMode} memory for ${fixture.seed.id}.`,
    reason: 'Knowledge retrieval happens after run configuration and before generation.',
    output: request.requestId,
    payload: knowledgeRequestPayload(request),
    goalChecks: [
      {
        id: 'knowledge-request-before-generation',
        label: 'Knowledge packet is requested before candidate generation.',
        passed: true,
        detail: `${request.requestId} targets ${request.targetCase}.`,
      },
    ],
  };
  const selectedEvent: TraceEvent = {
    type: 'knowledge.packet_selected',
    stage: 'knowledge',
    input: request.requestId,
    decision: `Select ${packet.items.length} knowledge item(s).`,
    reason: 'The selected packet is persisted so replay does not query mutable memory.',
    output: packet.id,
    payload: knowledgePacketPayload(packet),
    goalChecks: [
      {
        id: 'knowledge-packet-persisted',
        label: 'Selected knowledge packet is persisted before generation.',
        passed: true,
        detail: `${packet.id} contains ${packet.items.length} items and ${packet.excluded.length} exclusions.`,
      },
    ],
  };
  const injectionEvents = packet.items.map((item): TraceEvent => ({
    type: 'knowledge.item_injected',
    stage: 'knowledge',
    input: packet.id,
    decision: `Inject ${item.citeHandle} into candidate role context.`,
    reason: 'Agenome/candidate roles receive cited packet slices, not the whole graph.',
    output: `${packet.id}:${item.recordId}:candidate`,
    payload: {
      packet_id: packet.id,
      record_id: item.recordId,
      cite_handle: item.citeHandle,
      recipient_role: 'candidate',
      injected_text: item.text,
    },
    goalChecks: [
      {
        id: 'knowledge-item-injected',
        label: 'Each injected memory item has a citation handle and recipient role.',
        passed: Boolean(item.citeHandle && item.recordId),
        detail: `${item.citeHandle} -> candidate`,
      },
    ],
  }));

  return {
    packet,
    events: [requestEvent, selectedEvent, ...injectionEvents],
    replayed: false,
  };
}

function sequenceEvents(events: TraceEvent[]): TraceEvent[] {
  return events.map((event, index) => ({
    ...event,
    sequence: event.sequence || index + 1,
  }));
}

function total(candidate: ScoredCandidate): number {
  return candidate.fitness.novelty + candidate.fitness.grounding;
}

function tokenSet(value: string): Set<string> {
  return new Set(value.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((token) => token.length > 2));
}

function overlap(a: string, b: string): number {
  const left = tokenSet(a);
  const right = tokenSet(b);
  if (!left.size || !right.size) return 0;
  let shared = 0;
  for (const item of left) {
    if (right.has(item)) shared += 1;
  }
  return shared / Math.min(left.size, right.size);
}

function generationQuality(children: ScoredCandidate[], parents: ScoredCandidate[]): { quality: GenerationQuality; detail: string } {
  if (!children.length) return { quality: 'not_run', detail: 'No selected parent produced a generation-2 child under caps.' };
  const parentsById = new Map(parents.map((parent) => [parent.id, parent]));
  const assessments = children.map((child) => {
    const parent = parentsById.get(child.parentId);
    if (!parent) return 'drifted';
    if (overlap(`${child.title} ${child.thesis}`, `${parent.title} ${parent.thesis}`) > 0.72) return 'duplicated';
    if (total(child) > total(parent) + 0.03) return 'improved';
    return 'drifted';
  });

  if (assessments.includes('improved')) {
    return { quality: 'improved', detail: `${assessments.filter((item) => item === 'improved').length}/${children.length} generation-2 child candidate(s) improved on parent combined novelty+grounding.` };
  }
  if (assessments.every((item) => item === 'duplicated')) {
    return { quality: 'duplicated', detail: 'Generation-2 children mostly repeated parent thesis language.' };
  }
  return { quality: 'drifted', detail: 'Generation-2 children changed direction without improving combined novelty+grounding.' };
}

function generationSummary(
  index: number,
  parents: ScoredCandidate[],
  generated: CandidatePool,
  selectedIds: string[],
  quality: GenerationQuality,
  detail: string,
): GenerationSummary {
  return {
    index,
    parentCandidateIds: parents.map((candidate) => candidate.id),
    generatedCandidateIds: generated.candidates.map((candidate) => candidate.id),
    selectedCandidateIds: selectedIds,
    rejectedNodeIds: generated.lineage.rejected.map((node) => node.id),
    quality,
    detail,
  };
}

export function buildRunTrace(fixture: SeedFixture, dial: Dial, options: {
  caps?: Partial<RunCaps>;
  lenses?: LensConfig[];
  runId?: string;
  memoryMode?: MemoryMode;
  knowledgeGateway?: KnowledgeGateway;
  pinnedKnowledgePacket?: KnowledgePacket;
  replayEvents?: TraceEvent[];
  knowledgeTargetCase?: string;
} = {}): RunTrace {
  const caps = mergeCaps(options.caps);
  const events: TraceEvent[] = [];
  const generationSummaries: GenerationSummary[] = [];
  const id = options.runId || generatedRunId(dial);
  const memoryMode = options.memoryMode || 'off';

  events.push({
    type: 'run.configured',
    stage: 'configure',
    input: fixture.seed.id,
    decision: `Configure ${dial} run with memoryMode=${memoryMode}.`,
    reason: 'Run configuration freezes caps, dial, seed, and memory policy before generation.',
    output: id,
    payload: {
      run_id: id,
      dial,
      seed_id: fixture.seed.id,
      memory_mode: memoryMode,
      caps,
    },
    goalChecks: [
      {
        id: 'run-configured-before-generation',
        label: 'Run configuration is emitted before generation.',
        passed: true,
        detail: `${id} configured for ${fixture.seed.id}.`,
      },
    ],
  });

  const knowledge = resolveKnowledge(
    fixture,
    id,
    memoryMode,
    options.knowledgeTargetCase || fixture.seed.id,
    options.knowledgeGateway,
    options.pinnedKnowledgePacket,
    options.replayEvents,
  );
  events.push(...knowledge.events);

  const generated1 = generateCandidatePool(fixture, { generation: 1, caps, knowledgePacket: knowledge.packet });
  events.push(generated1.event);

  const scored1 = scoreCandidatePool(generated1.pool, { asOf: fixture.asOf });
  events.push(scored1.event);

  const parentSelection = compareSelections(scored1.scoredPool, dial);
  const parents = parentSelection.comparison.focus.selected;
  generationSummaries.push(generationSummary(1, [], generated1.pool, parents.map((candidate) => candidate.id), 'not_run', `Generation 1 selected [${parents.map((candidate) => candidate.id).join(', ')}] as parents for fixture child expansion.`));

  const pools = [generated1.pool];
  const scoredPools = [scored1.scoredPool];

  if (caps.maxGenerations >= 2 && parents.length > 0) {
    const generated2 = generateCandidatePool(fixture, {
      generation: 2,
      parentCandidateIds: parents.map((candidate) => candidate.id),
      caps,
      existingCandidateCount: generated1.pool.candidates.length,
      knowledgePacket: knowledge.packet,
    });
    events.push(generated2.event);
    pools.push(generated2.pool);

    if (generated2.pool.candidates.length > 0) {
      const scored2 = scoreCandidatePool(generated2.pool, { asOf: fixture.asOf });
      events.push(scored2.event);
      scoredPools.push(scored2.scoredPool);
      const quality = generationQuality(scored2.scoredPool.candidates, parents);
      generationSummaries.push(generationSummary(2, parents, generated2.pool, scored2.scoredPool.candidates.map((candidate) => candidate.id), quality.quality, quality.detail));
    } else {
      generationSummaries.push(generationSummary(2, parents, generated2.pool, [], 'not_run', 'No generation-2 candidates available for selected parents.'));
    }
  }

  const combinedPool = mergePools(fixture.seed, pools);
  const combinedScored = mergeScoredPools(fixture.seed, scoredPools);
  if (!knowledge.replayed) {
    events.push(...influenceEvents(knowledge.packet, combinedPool.candidates));
  }
  const selected = compareSelections(combinedScored, dial);
  events.push(selected.event);
  if (!knowledge.replayed) {
    events.push(...creditEvents(knowledge.packet, combinedScored.candidates, selected.comparison));
  }

  const selectedIds = new Set(selected.comparison.focus.selected.map((candidate) => candidate.id));
  const finalGenerationSummaries = generationSummaries.map((summary) => ({
    ...summary,
    selectedCandidateIds: summary.generatedCandidateIds.filter((id) => selectedIds.has(id)),
  }));

  const lensed = applyLenses(combinedScored, selected.comparison, options.lenses || []);
  events.push(lensed.event);

  const traceEvent: TraceEvent = {
    stage: 'trace',
    input: 'SelectionComparison + LensResult[] + boundary contracts + goal checks',
    decision: 'Emit the machine trace for tools and replay.',
    reason: 'The kernel emits process facts; microscope tools translate those facts for humans.',
    output: 'RunTrace',
    goalChecks: [
      {
        id: 'machine-trace-emitted',
        label: 'The kernel emits a machine trace without requiring a human projection in the engine contract.',
        passed: true,
        detail: 'RunTrace contains lineage, generation summaries, lens results, goal checks, and selection comparison.',
      },
      {
        id: 'bounded-recursion',
        label: 'Recursion is bounded by explicit caps.',
        passed: combinedPool.candidates.length <= caps.maxPopulation &&
          finalGenerationSummaries.length <= caps.maxGenerations &&
          finalGenerationSummaries.every((summary) => summary.index <= caps.maxGenerations),
        detail: `generations=${finalGenerationSummaries.length}; candidates=${combinedPool.candidates.length}; caps=${JSON.stringify(caps)}`,
      },
      {
        id: 'replay-uses-persisted-knowledge',
        label: 'Replay uses persisted knowledge events and performs no fresh retrieval.',
        passed: !options.replayEvents || knowledge.replayed || memoryMode === 'off',
        detail: options.replayEvents
          ? `replayKnowledgeEvents=${persistedKnowledgeEvents(options.replayEvents).length}`
          : 'live run',
      },
    ],
    boundary: getBoundary('trace'),
  };
  events.push(traceEvent);

  const sequencedEvents = sequenceEvents(events);
  const goalChecks = sequencedEvents.flatMap((event) => event.goalChecks);

  return {
    schemaVersion: RUN_TRACE_SCHEMA_VERSION,
    runId: id,
    dial,
    memoryMode,
    seed: fixture.seed,
    caps,
    knowledgePacket: knowledge.packet,
    candidateCount: combinedPool.candidates.length,
    lineage: combinedPool.lineage,
    generations: finalGenerationSummaries,
    boundaryContracts,
    events: sequencedEvents,
    goalChecks,
    comparison: selected.comparison,
    lensResults: lensed.lensResults,
    terminalReason: 'completed under finite caps',
  };
}
