import generated from './fusionRuns.generated.json';

const RUBRIC_VERSION = 'space-opening.v0';

export const costLedger = buildCostLedger(generated);

export function formatUsd(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'metering pending';
  if (value === 0) return '$0.00';
  if (Math.abs(value) < 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(2)}`;
}

export function formatMaybeNumber(value, fallback = 'pending') {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : fallback;
}

function buildCostLedger(source) {
  const generationRun = normalizeGenerationRun(source.generationRun);
  const parentOutputs = Object.values(source.agenomes || {}).map(parentOutput);
  const childOutputs = Object.entries(source.runs || {}).map(([key, run]) => childOutput(key, run));
  const derivedOutputs = [...parentOutputs, ...childOutputs];
  const outputs = generationRun.outputs.length > 0
    ? mergeOutputCosts(generationRun.outputs, derivedOutputs, generationRun.costEvents)
    : mergeOutputCosts(derivedOutputs, derivedOutputs, generationRun.costEvents);

  const paidCallCount = generationRun.costEvents.length || estimatePaidCalls(parentOutputs.length, childOutputs.length);
  const fruits = outputs.filter((output) => output.kind === 'fruit');
  const selectedFruits = fruits.filter((output) => output.selected);
  const sprouts = outputs.filter((output) => output.kind === 'sprout');
  const totalCostUsd = generationRun.totalCostUsd;
  const exactCost = generationRun.totalCostExact && typeof totalCostUsd === 'number';
  const averageFruitQuality = average(fruits.map((output) => output.qualityScore));
  const averageSpaceOpening = average(fruits.map((output) => output.spaceOpeningScore));
  const costPerSelectedFruit = exactCost && selectedFruits.length > 0 ? totalCostUsd / selectedFruits.length : null;
  const spaceOpeningPerDollar = exactCost && totalCostUsd > 0 ? averageSpaceOpening / totalCostUsd : null;

  const strategySummaries = buildStrategySummaries(
    Object.keys(source.agenomes || {}),
    childOutputs,
    generationRun.costEvents,
  );

  return {
    id: generationRun.id || `fixture:${source.caseId}`,
    objective:
      generationRun.objective ||
      `Breed mutagen agenomes against ${source.caseTitle || 'a withheld-solution case'}.`,
    startedAt: generationRun.startedAt || source.generatedAt,
    endedAt: generationRun.endedAt || source.generatedAt,
    arcadeId: generationRun.arcadeId || 'fusion-lab',
    currency: generationRun.currency || 'USD',
    totalCostUsd,
    totalCostExact: exactCost,
    paidCallCount,
    meteringStatus: exactCost ? 'exact' : 'unmetered historical fixture',
    meteringNote: exactCost
      ? 'OpenRouter response usage.cost captured per paid call.'
      : 'This saved batch predates cost-event capture. Regenerate to append exact OpenRouter charges.',
    sprouts: sprouts.length,
    fruits: fruits.length,
    selectedFruits: selectedFruits.length,
    averageFruitQuality,
    averageSpaceOpening,
    costPerSelectedFruit,
    spaceOpeningPerDollar,
    outputs,
    outputById: Object.fromEntries(outputs.map((output) => [output.id, output])),
    costEvents: generationRun.costEvents,
    strategySummaries,
    marginalSignals: strategySummaries.slice(0, 4),
    notifications: buildNotifications({
      exactCost,
      paidCallCount,
      selectedFruits,
      averageSpaceOpening,
      strategySummaries,
    }),
    rubricVersion: RUBRIC_VERSION,
  };
}

function normalizeGenerationRun(run = {}) {
  const costEvents = (run.cost_events || run.costEvents || []).map(normalizeCostEvent);
  const totalCostUsd = numberOrNull(run.total_cost_usd ?? run.totalCostUsd);
  return {
    id: run.run_id || run.runId || '',
    objective: run.objective || '',
    startedAt: run.started_at || run.startedAt || '',
    endedAt: run.ended_at || run.endedAt || '',
    arcadeId: run.arcade_id || run.arcadeId || '',
    currency: run.currency || 'USD',
    totalCostUsd,
    totalCostExact: Boolean(run.total_cost_exact ?? run.totalCostExact),
    outputs: (run.outputs || []).map(normalizeOutput),
    costEvents,
  };
}

function normalizeCostEvent(event) {
  return {
    id: event.event_id || event.eventId || '',
    provider: event.provider || 'unknown',
    modelOrTool: event.model_or_tool || event.modelOrTool || '',
    stage: event.stage || '',
    outputId: event.output_id || event.outputId || '',
    strategyLabels: event.strategy_labels || event.strategyLabels || [],
    totalCostUsd: numberOrNull(event.total_cost_usd ?? event.totalCostUsd),
    exact: Boolean(event.exact),
    units: event.units || {},
    source: event.source || '',
    providerRequestId: event.provider_request_id || event.providerRequestId || '',
    ts: event.ts || '',
  };
}

function normalizeOutput(output) {
  return {
    id: output.output_id || output.outputId || output.id || '',
    kind: output.kind || 'sprout',
    title: output.title || '',
    selected: Boolean(output.selected),
    carriedForwardTo: output.carried_forward_to || output.carriedForwardTo || '',
    strategyLabels: output.strategy_labels || output.strategyLabels || [],
    qualityScore: numberOrNull(output.quality_score ?? output.qualityScore),
    spaceOpeningScore: numberOrNull(output.space_opening_score ?? output.spaceOpeningScore),
    costUsd: numberOrNull(output.cost_usd ?? output.costUsd),
  };
}

function parentOutput(parent) {
  return normalizeOutput({
    output_id: `parent:${parent.id}`,
    kind: 'sprout',
    title: parent.title,
    selected: false,
    strategy_labels: [parent.id],
    quality_score: averageScore(parent.scores),
    space_opening_score: spaceOpening(parent.scores),
  });
}

function childOutput(key, run) {
  const qualityScore = averageScore(run.child.scores);
  return normalizeOutput({
    output_id: `child:${key}`,
    kind: 'fruit',
    title: run.child.title,
    selected: qualityScore >= 90,
    carried_forward_to: qualityScore >= 90 ? 'candidate-fruit' : '',
    strategy_labels: run.ids,
    quality_score: qualityScore,
    space_opening_score: spaceOpening(run.child.scores),
  });
}

function mergeOutputCosts(outputs, derivedOutputs, costEvents) {
  const derivedById = new Map(derivedOutputs.map((output) => [output.id, output]));
  const costByOutput = groupCostByOutput(costEvents);
  return outputs.map((output) => {
    const derived = derivedById.get(output.id) || {};
    return {
      ...derived,
      ...output,
      costUsd: output.costUsd ?? costByOutput.get(output.id) ?? null,
    };
  });
}

function groupCostByOutput(costEvents) {
  const costs = new Map();
  costEvents.forEach((event) => {
    if (!event.outputId || typeof event.totalCostUsd !== 'number') return;
    costs.set(event.outputId, (costs.get(event.outputId) || 0) + event.totalCostUsd);
  });
  return costs;
}

function buildStrategySummaries(strategyIds, childOutputs, costEvents) {
  const costByStrategy = groupCostByStrategy(costEvents);
  return strategyIds.map((id) => {
    const children = childOutputs.filter((output) => output.strategyLabels.includes(id));
    const quality = average(children.map((output) => output.qualityScore));
    const spaceOpeningScore = average(children.map((output) => output.spaceOpeningScore));
    const fruitCount = children.filter((output) => output.selected).length;
    const exactCostUsd = costByStrategy.get(id) ?? null;
    return {
      id,
      attempts: children.length,
      fruitCount,
      quality,
      spaceOpeningScore,
      exactCostUsd,
      fruitPerDollar: exactCostUsd && exactCostUsd > 0 ? fruitCount / exactCostUsd : null,
      spaceOpeningPerDollar: exactCostUsd && exactCostUsd > 0 ? spaceOpeningScore / exactCostUsd : null,
    };
  }).sort((a, b) => {
    const spaceDelta = (b.spaceOpeningScore || 0) - (a.spaceOpeningScore || 0);
    if (spaceDelta !== 0) return spaceDelta;
    return (b.quality || 0) - (a.quality || 0);
  });
}

function groupCostByStrategy(costEvents) {
  const costs = new Map();
  costEvents.forEach((event) => {
    if (typeof event.totalCostUsd !== 'number' || event.strategyLabels.length === 0) return;
    const share = event.totalCostUsd / event.strategyLabels.length;
    event.strategyLabels.forEach((id) => {
      costs.set(id, (costs.get(id) || 0) + share);
    });
  });
  return costs;
}

function buildNotifications({ exactCost, paidCallCount, selectedFruits, averageSpaceOpening, strategySummaries }) {
  const notifications = [];
  if (!exactCost) {
    notifications.push({
      tone: 'warn',
      title: 'Cost capture starts on the next run',
      body: `${paidCallCount} paid OpenRouter calls are inferred here, but this fixture has no saved usage.cost rows.`,
    });
  }
  if (selectedFruits.length > 0) {
    notifications.push({
      tone: 'good',
      title: 'Fruit yield is measurable',
      body: `${selectedFruits.length} candidate fruits clear the v0 quality gate; cost per fruit becomes exact once metered.`,
    });
  }
  if (averageSpaceOpening >= 88) {
    notifications.push({
      tone: 'good',
      title: 'Space-opening signal is strong',
      body: `Average fruit space-opening is ${averageSpaceOpening}; keep collecting before letting it steer allocation.`,
    });
  }
  if (strategySummaries[0]) {
    notifications.push({
      tone: 'info',
      title: 'Current marginal bet',
      body: `${strategySummaries[0].id} leads the v0 space-opening proxy across fusion children.`,
    });
  }
  return notifications;
}

function estimatePaidCalls(parentCount, childCount) {
  return parentCount * 2 + childCount * 2;
}

function averageScore(scores = {}) {
  return average(Object.values(scores).map(Number));
}

function spaceOpening(scores = {}) {
  return Math.round(
    (Number(scores.novelty) || 0) * 0.35 +
    (Number(scores.falsification) || 0) * 0.25 +
    (Number(scores.operationalFit) || 0) * 0.2 +
    (Number(scores.grounding) || 0) * 0.1 +
    (Number(scores.feasibility) || 0) * 0.1,
  );
}

function average(values) {
  const finite = values.map(Number).filter(Number.isFinite);
  if (finite.length === 0) return null;
  return Math.round(finite.reduce((sum, value) => sum + value, 0) / finite.length);
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
