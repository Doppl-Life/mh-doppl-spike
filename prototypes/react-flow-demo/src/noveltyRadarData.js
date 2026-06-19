export const noveltyBoundary = {
  upstreamModules: ['Subtype Check Lab', 'Critic Council', 'Model Gateway', 'Retrieval Grounding'],
  upstreamContracts: ['CandidateIdea', 'CheckResult', 'EvidenceRef', 'ModelGatewayResponse'],
  downstreamContracts: ['NoveltyScore', 'novelty.scored', 'FitnessScore.components.novelty', 'novelty_scoring_degraded'],
  downstreamModules: ['Selection / Scoring', 'Fusion Lab', 'Replay Spine', 'Final Survivor Proof Panel'],
  invariants: [
    'novelty is inspectable, not a magic number',
    'nearest neighbors and prior-art matches are persisted evidence',
    'embedding vectors are authoritative once computed',
    'degraded retrieval or embeddings are labeled',
    'novelty feeds fitness without overpowering feasibility',
  ],
};

export const noveltyContractShapes = {
  ingress: [
    {
      name: 'NoveltyInput',
      anchor: 'ARCHITECTURE.md section 8 + Appendix A',
      fields: [
        ['candidate', 'CandidateIdea'],
        ['priorCandidates', 'CandidateIdea[]'],
        ['priorArtEvidence', 'EvidenceRef[]'],
        ['currentSignals?', 'EvidenceRef[]'],
        ['embeddingModelId', 'string'],
      ],
    },
    {
      name: 'SimilarityMatch',
      anchor: 'prototype-local persisted comparison row',
      fields: [
        ['id', 'string'],
        ['kind', 'prior_candidate | prior_art | current_signal'],
        ['label', 'string'],
        ['similarity', 'number'],
        ['evidenceRef', 'EvidenceRef'],
      ],
    },
  ],
  egress: [
    {
      name: 'NoveltyScore',
      anchor: 'ARCHITECTURE.md Appendix A',
      fields: [
        ['id', 'string'],
        ['candidateId', 'string'],
        ['vector', 'number[] persisted'],
        ['embeddingModelId', 'string'],
        ['comparisonSet', 'SimilarityMatch[]'],
        ['method', 'embedding_cosine | lexical_fallback'],
        ['score', 'number'],
        ['explanation', 'string'],
      ],
    },
    {
      name: 'novelty.scored',
      anchor: 'RunEventEnvelope narrowed payload',
      fields: [
        ['type', 'novelty.scored | novelty_scoring_degraded'],
        ['runId', 'string'],
        ['sequence', 'integer'],
        ['payload', 'NoveltyScore'],
        ['sourceModule', 'selection.novelty'],
      ],
    },
  ],
};

export const noveltyCandidates = [
  {
    id: 'cand_scene_shift',
    title: 'Discreet Scene-Shift Protocol',
    subtype: 'cross_domain_transfer',
    summary:
      'Detect an incoming drone, trigger a quiet onboard signal, and move exposed guests before useful footage exists.',
    method: 'embedding_cosine',
    embeddingModelId: 'text-embedding-3-small',
    score: 0.78,
    confidence: 'supported',
    explanation:
      'The mechanism differs from jamming/takedown prior art by targeting footage value rather than the drone object.',
    components: [
      { label: 'Distance from prior candidates', value: 0.74, detail: 'Nearest in-run idea is a generic privacy alert.' },
      { label: 'Prior-art separation', value: 0.81, detail: 'Known anti-drone art clusters around detection, jamming, nets, or legal deterrence.' },
      { label: 'Mechanism distinctness', value: 0.86, detail: 'Scene-shift protocol changes the filmed scene instead of fighting the drone.' },
      { label: 'Evidence quality', value: 0.71, detail: 'Prior-art retrieval is good; yacht-specific SOP evidence remains partial.' },
    ],
    neighbors: [
      { id: 'prior_alert', kind: 'prior_candidate', label: 'Generic VIP privacy alert', similarity: 0.66, note: 'Similar alert shape, weaker footage-denial mechanism.' },
      { id: 'prior_decoy', kind: 'prior_candidate', label: 'Signal Decoy Watch Pattern', similarity: 0.54, note: 'Shares blindside cue concerns, different main action.' },
      { id: 'prior_route', kind: 'prior_candidate', label: 'Drone route prediction', similarity: 0.42, note: 'Same detection premise, no scene control.' },
    ],
    priorArt: [
      { id: 'art_jam', kind: 'prior_art', label: 'RF jamming / spoofing systems', similarity: 0.31, note: 'Different because it avoids active countermeasures.' },
      { id: 'art_net', kind: 'prior_art', label: 'Physical net capture drones', similarity: 0.27, note: 'Different because it avoids takedown and spectacle.' },
      { id: 'art_detection', kind: 'prior_art', label: 'Drone detection alerts', similarity: 0.58, note: 'Overlap on detection; novelty depends on what the alert triggers.' },
    ],
    signals: [
      { id: 'sig_discretion', kind: 'current_signal', label: 'Luxury discretion norms', similarity: 0.63, note: 'Supports quiet response over visible defense.' },
      { id: 'sig_surveillance', kind: 'current_signal', label: 'Anti-surveillance fatigue', similarity: 0.48, note: 'Relevant but not central to transfer subtype.' },
    ],
    degrade: null,
  },
  {
    id: 'cand_privacy_theater',
    title: 'Privacy Theater Exhaustion',
    subtype: 'zeitgeist_synthesis',
    summary:
      'Frame the winning move as anti-spectacle: privacy works best when it creates no dramatic anti-drone story.',
    method: 'lexical_fallback',
    embeddingModelId: 'text-embedding-3-small unavailable',
    score: 0.56,
    confidence: 'degraded',
    explanation:
      'The framing may be distinct, but embedding comparison degraded to lexical fallback and signal recency is thin.',
    components: [
      { label: 'Distance from prior candidates', value: 0.59, detail: 'Lexical fallback sees different wording but cannot prove semantic distance.' },
      { label: 'Prior-art separation', value: 0.62, detail: 'Less overlap with hardware prior art, more overlap with generic privacy-positioning ideas.' },
      { label: 'Current-signal fit', value: 0.68, detail: 'Signals support anti-spectacle framing but require fresher retrieval.' },
      { label: 'Evidence quality', value: 0.36, detail: 'Embedding call failed; current signal set is incomplete.' },
    ],
    neighbors: [
      { id: 'prior_scene', kind: 'prior_candidate', label: 'Discreet Scene-Shift Protocol', similarity: 0.71, note: 'Strong thematic overlap around quiet operational privacy.' },
      { id: 'prior_no_panic', kind: 'prior_candidate', label: 'No-visible-panic crew cue', similarity: 0.62, note: 'Similar anti-spectacle behavior, weaker cultural thesis.' },
      { id: 'prior_legal', kind: 'prior_candidate', label: 'Legal deterrence memo', similarity: 0.28, note: 'Different mechanism and audience posture.' },
    ],
    priorArt: [
      { id: 'art_brand', kind: 'prior_art', label: 'Luxury discretion brand positioning', similarity: 0.64, note: 'Prior-art risk: the framing may already be common in luxury comms.' },
      { id: 'art_counter', kind: 'prior_art', label: 'Counter-surveillance PR playbooks', similarity: 0.49, note: 'Some overlap with avoiding visible security theater.' },
    ],
    signals: [
      { id: 'sig_backlash', kind: 'current_signal', label: 'Backlash to surveillance spectacle', similarity: 0.72, note: 'Supports the thesis but source freshness is degraded.' },
      { id: 'sig_attention', kind: 'current_signal', label: 'Attention-economy skepticism', similarity: 0.57, note: 'Fits the idea that non-events can be protective.' },
      { id: 'sig_luxury', kind: 'current_signal', label: 'Private luxury minimalism', similarity: 0.53, note: 'Suggests quiet response is culturally legible.' },
    ],
    degrade: 'Embedding route timed out; novelty.scored uses lexical_fallback and marks evidence quality low.',
  },
  {
    id: 'cand_drone_jamming',
    title: 'Soft Jamming Umbrella',
    subtype: 'cross_domain_transfer',
    summary:
      'Deploy a temporary interference umbrella that prevents drone camera transmission near the vessel.',
    method: 'embedding_cosine',
    embeddingModelId: 'text-embedding-3-small',
    score: 0.22,
    confidence: 'low novelty',
    explanation:
      'The candidate looks different in wording but sits close to common anti-drone jamming prior art.',
    components: [
      { label: 'Distance from prior candidates', value: 0.41, detail: 'Several generated ideas already proposed signal interference.' },
      { label: 'Prior-art separation', value: 0.12, detail: 'Known prior art heavily overlaps with jamming/spoofing.' },
      { label: 'Mechanism distinctness', value: 0.18, detail: 'The mechanism controls the drone channel, not the scene or incentives.' },
      { label: 'Evidence quality', value: 0.82, detail: 'Retrieval confidence is high, and it is bad news for novelty.' },
    ],
    neighbors: [
      { id: 'prior_spoof', kind: 'prior_candidate', label: 'Spoof return-to-home', similarity: 0.77, note: 'Very similar active signal-control approach.' },
      { id: 'prior_jam', kind: 'prior_candidate', label: 'Directional jammer mast', similarity: 0.73, note: 'Same anti-drone family.' },
    ],
    priorArt: [
      { id: 'art_jam', kind: 'prior_art', label: 'Commercial drone jamming systems', similarity: 0.88, note: 'High overlap and legal/safety concerns.' },
      { id: 'art_spoof', kind: 'prior_art', label: 'GNSS spoofing counter-UAS', similarity: 0.74, note: 'Same signal-interference mechanism class.' },
    ],
    signals: [],
    degrade: null,
  },
];

export function buildNoveltyEvent(candidate) {
  return {
    type: candidate.degrade ? 'novelty_scoring_degraded' : 'novelty.scored',
    candidateId: candidate.id,
    score: candidate.score,
    method: candidate.method,
    embeddingModelId: candidate.embeddingModelId,
    comparisonSetSize: candidate.neighbors.length + candidate.priorArt.length + candidate.signals.length,
    explanation: candidate.explanation,
  };
}
