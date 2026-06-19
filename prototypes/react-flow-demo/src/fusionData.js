import generated from './fusionRuns.generated.json';

export const caseFixture = {
  id: generated.caseId,
  title: generated.caseTitle,
  note: generated.method,
};

export const fusionMetadata = {
  generatedAt: generated.generatedAt,
  generationModel: generated.generationModel,
  criticModel: generated.criticModel,
  method: generated.method,
  parentCount: Object.keys(generated.agenomes).length,
  runCount: Object.keys(generated.runs).length,
};

export const fusionAgenomes = Object.values(generated.agenomes);
export const fusionRuns = generated.runs;
export const fusionPairs = Object.values(generated.runs).map(pairFixture);
export const fusionPairsById = Object.fromEntries(fusionPairs.map((pair) => [pair.id, pair]));
export const criticScoreKeys = generated.scoreNames;

const byId = generated.agenomes;

export function getFusionPair(firstId, secondId) {
  return fusionPairsById[makeFusionPairId(firstId, secondId)] ?? null;
}

export function makeFusionPairId(firstId, secondId) {
  const first = normalizeAgenomeId(firstId);
  const second = normalizeAgenomeId(secondId);
  if (!first || !second || first === second) return null;
  return pairKey(first, second);
}

export function getAgenome(id) {
  return byId[normalizeAgenomeId(id)] ?? null;
}

export function normalizeAgenomeId(id) {
  if (!id) return null;
  const kebab = String(id)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
  return byId[kebab] ? kebab : null;
}

export function getFusionRun(firstId, secondId) {
  const first = normalizeAgenomeId(firstId);
  const second = normalizeAgenomeId(secondId);
  const key = makeFusionPairId(first, second);
  const run = fusionRuns[key];
  if (!run) return fusionRuns[pairKey('first-principles', 'breakthrough')];
  return orientRun(run, first, second);
}

function pairFixture(run) {
  return {
    id: pairKey(run.ids[0], run.ids[1]),
    caseId: caseFixture.id,
    parentA: run.ids[0],
    parentB: run.ids[1],
    parentProposals: {
      [run.ids[0]]: run.parentA.proposal,
      [run.ids[1]]: run.parentB.proposal,
    },
    parentCritics: {
      [run.ids[0]]: {
        scores: run.parentA.scores,
        verdict: run.parentA.verdict,
      },
      [run.ids[1]]: {
        scores: run.parentB.scores,
        verdict: run.parentB.verdict,
      },
    },
    parents: [run.parentA, run.parentB],
    fusionRatio: run.fusionRatio,
    inheritanceLogic: run.inheritanceLogic,
    childTitle: run.child.title,
    childProposal: run.child.proposal,
    childCriticScores: run.child.scores,
    childVerdict: run.child.verdict,
    inheritedTraits: run.child.inheritedTraits,
    child: run.child,
  };
}

function pairKey(firstId, secondId) {
  return [firstId, secondId].sort().join('__');
}

function orientRun(run, firstId, secondId) {
  if (run.ids[0] === firstId && run.ids[1] === secondId) return run;
  if (run.ids[0] === secondId && run.ids[1] === firstId) {
    return {
      ...run,
      parentA: run.parentB,
      parentB: run.parentA,
      fusionRatio: run.fusionRatio.split(':').reverse().join(':'),
    };
  }
  return run;
}
