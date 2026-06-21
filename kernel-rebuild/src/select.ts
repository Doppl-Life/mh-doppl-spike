import type {
  DialContrast,
  Dial,
  GoalCheck,
  ScoredCandidate,
  ScoredCandidatePool,
  SelectedCandidate,
  SelectionComparison,
  SelectionResult,
  SelectionSchedule,
  TraceEvent,
} from './contracts/index.ts';
import { clampScore, getBoundary } from './contracts/index.ts';

export function scheduleForDial(dial: Dial): SelectionSchedule {
  if (dial === 'diverge') {
    return {
      dial,
      keep: 3,
      priorityAxis: 'novelty',
      floorAxis: 'grounding',
      floor: 0.35,
      description: 'Keep frontier candidates that open the most new substrate while staying minimally grounded.',
    };
  }

  return {
    dial,
    keep: 3,
    priorityAxis: 'grounding',
    floorAxis: 'novelty',
    floor: 0.25,
    description: 'Keep frontier candidates with the strongest evidence and clearest mechanism while preserving some novelty.',
  };
}

function dominates(a: ScoredCandidate, b: ScoredCandidate): boolean {
  const aNovelty = a.fitness.novelty;
  const aGrounding = a.fitness.grounding;
  const bNovelty = b.fitness.novelty;
  const bGrounding = b.fitness.grounding;
  return aNovelty >= bNovelty && aGrounding >= bGrounding && (aNovelty > bNovelty || aGrounding > bGrounding);
}

function paretoFronts(candidates: ScoredCandidate[]): Map<string, number> {
  const remaining = new Set(candidates.map((candidate) => candidate.id));
  const frontById = new Map<string, number>();
  let front = 1;

  while (remaining.size > 0) {
    const frontIds: string[] = [];
    for (const id of remaining) {
      const candidate = candidates.find((item) => item.id === id);
      if (!candidate) continue;
      const dominated = candidates.some((other) => remaining.has(other.id) && other.id !== id && dominates(other, candidate));
      if (!dominated) {
        frontIds.push(id);
      }
    }
    for (const id of frontIds) {
      frontById.set(id, front);
      remaining.delete(id);
    }
    front += 1;
  }

  return frontById;
}

function axis(candidate: ScoredCandidate, name: 'novelty' | 'grounding'): number {
  return name === 'novelty' ? candidate.fitness.novelty : candidate.fitness.grounding;
}

function directionalScore(candidate: ScoredCandidate, schedule: SelectionSchedule): number {
  const primary = axis(candidate, schedule.priorityAxis);
  const secondary = axis(candidate, schedule.floorAxis);
  const balanceBonus = 1 - Math.abs(candidate.fitness.novelty - candidate.fitness.grounding);
  return clampScore((primary * 0.7) + (secondary * 0.2) + (balanceBonus * 0.1));
}

function reasonFor(candidate: ScoredCandidate, schedule: SelectionSchedule, front: number, score: number): string {
  const primary = axis(candidate, schedule.priorityAxis);
  const floor = axis(candidate, schedule.floorAxis);
  return `front ${front}; ${schedule.priorityAxis} ${primary.toFixed(2)} drove selection; ${schedule.floorAxis} ${floor.toFixed(2)} cleared floor ${schedule.floor.toFixed(2)}; directional score ${score.toFixed(2)}`;
}

export function selectCandidates(pool: ScoredCandidatePool, schedule: SelectionSchedule): SelectionResult {
  const fronts = paretoFronts(pool.candidates);
  const ranked = pool.candidates
    .map((candidate) => {
      const front = fronts.get(candidate.id) || 99;
      const score = directionalScore(candidate, schedule);
      return {
        ...candidate,
        selection: {
          front,
          rank: 0,
          directionalScore: score,
          reason: reasonFor(candidate, schedule, front, score),
        },
      };
    })
    .filter((candidate) => axis(candidate, schedule.floorAxis) >= schedule.floor)
    .sort((a, b) => {
      if (a.selection.front !== b.selection.front) return a.selection.front - b.selection.front;
      if (b.selection.directionalScore !== a.selection.directionalScore) {
        return b.selection.directionalScore - a.selection.directionalScore;
      }
      return b.fitness[schedule.priorityAxis] - a.fitness[schedule.priorityAxis];
    })
    .map((candidate, index) => ({
      ...candidate,
      selection: { ...candidate.selection, rank: index + 1 },
    }));

  const selected = ranked.slice(0, schedule.keep);
  const selectedIds = new Set(selected.map((candidate) => candidate.id));
  const rejected = ranked.filter((candidate) => !selectedIds.has(candidate.id));

  return { schedule, selected, rejected };
}

function contrastFor(focus: SelectionResult, alternate: SelectionResult): DialContrast[] {
  return focus.selected.map((selected, index) => {
    const alsoSelected = alternate.selected.find((candidate) => candidate.id === selected.id);
    if (alsoSelected) {
      return {
        selectedId: selected.id,
        status: 'stable',
        alternateId: alsoSelected.id,
        reason: `${selected.id} survived both ${focus.schedule.dial} and ${alternate.schedule.dial}; the dial did not change this survivor.`,
      };
    }

    const replacement =
      alternate.selected.find((candidate) => !focus.selected.some((item) => item.id === candidate.id)) ||
      alternate.selected[index] ||
      alternate.selected[0];
    return {
      selectedId: selected.id,
      status: 'replaced',
      alternateId: replacement.id,
      reason: `${alternate.schedule.dial} would replace ${selected.id} with ${replacement.id} because ${replacement.selection.reason}`,
    };
  });
}

function selectionGoalChecks(pool: ScoredCandidatePool, focus: SelectionResult, alternate: SelectionResult, contrasts: DialContrast[]): GoalCheck[] {
  const focusIds = focus.selected.map((candidate) => candidate.id).join(',');
  const alternateIds = alternate.selected.map((candidate) => candidate.id).join(',');
  return [
    {
      id: 'same-pool',
      label: 'Both dials selected from the exact same scored candidate pool.',
      passed: focus.selected.every((candidate) => pool.candidates.some((item) => item.id === candidate.id)) &&
        alternate.selected.every((candidate) => pool.candidates.some((item) => item.id === candidate.id)),
      detail: `pool=${pool.candidates.length}; focus=${focusIds}; alternate=${alternateIds}`,
    },
    {
      id: 'dial-changes-survivors',
      label: 'Changing only the selection schedule changes the survivor set.',
      passed: focusIds !== alternateIds,
      detail: `${focus.schedule.dial} kept [${focusIds}], ${alternate.schedule.dial} kept [${alternateIds}]`,
    },
    {
      id: 'contrast-visible',
      label: 'Every selected candidate has an explicit cross-dial contrast.',
      passed: contrasts.length === focus.selected.length && contrasts.every((item) => item.alternateId),
      detail: contrasts.map((item) => `${item.selectedId}:${item.status}->${item.alternateId}`).join(', '),
    },
    {
      id: 'frontier-before-scalar',
      label: 'Selection uses Pareto fronts before directional ranking.',
      passed: focus.selected.every((candidate) => candidate.selection.front <= 2),
      detail: 'The selector preserves the novelty/grounding tension before ranking within a front.',
    },
  ];
}

export function compareSelections(pool: ScoredCandidatePool, dial: Dial): {
  comparison: SelectionComparison;
  event: TraceEvent;
  goalChecks: GoalCheck[];
} {
  const focusSchedule = scheduleForDial(dial);
  const alternateSchedule = scheduleForDial(dial === 'diverge' ? 'converge' : 'diverge');
  const focus = selectCandidates(pool, focusSchedule);
  const alternate = selectCandidates(pool, alternateSchedule);
  const contrasts = contrastFor(focus, alternate);
  const goalChecks = selectionGoalChecks(pool, focus, alternate, contrasts);

  return {
    comparison: { focus, alternate, contrasts },
    goalChecks,
    event: {
      stage: 'select',
      input: `ScoredCandidatePool(${pool.candidates.length}) + ${focusSchedule.dial} schedule`,
      decision: `${focusSchedule.dial} kept ${focus.selected.map((candidate) => candidate.id).join(', ')}.`,
      reason: focusSchedule.description,
      output: `SelectionComparison(${focusSchedule.dial} vs ${alternateSchedule.dial})`,
      goalChecks,
      boundary: getBoundary('select'),
    },
  };
}
