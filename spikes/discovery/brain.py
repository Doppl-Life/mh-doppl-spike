"""The brain: recover the real problem, classify the subtype, score through a lens.

This is the interesting half of the spike. For each normalized item it asks one
model call to do three things, grounded in Doppl's own doctrine:

  1. Problem Recovery   — symptom -> hidden variable -> actual problem
                          (case-study-schema.md "Problem Recovery" contract)
  2. Subtype classify   — cross_domain_transfer | zeitgeist_synthesis | neither,
                          using the +/-5-year discriminator from the subtype notes
  3. Lens score         — score 0-5 through a swappable lens (default: capstone-demo-fit)

Output is strict JSON, validated; a malformed reply is retried once then marked
invalid (mirrors Doppl's structured-output validate/repair/reject posture).
"""

from __future__ import annotations

import json
import os
from typing import Any

import httpx

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = os.environ.get("DISCOVERY_MODEL", "openai/gpt-4o-mini")

# --------------------------------------------------------------------------- #
# Lenses — pluggable rubrics. Default is capstone-demo-fit. Add more freely.
# --------------------------------------------------------------------------- #

# Scoring is a SIGNED scale: -5..+5. It separates QUALITY from HARM.
#   +1..+5  good, in degrees     -> surface it (higher = more worth Doppl's attention)
#    0      neutral / weak fit   -> ignore (the "meh" pile)
#   -1..-5  actively bad, traps  -> flag + remember (degrees of wrongness)
# The negative tail is the discovery-layer feed into amemetics (BUGS_AND_MITIGATIONS).
LENSES: dict[str, dict[str, str]] = {
    "capstone-demo-fit": {
        "one_liner": "Can a 3-4 person team show something live in two weeks that makes a room go 'oh'?",
        "good": (
            "+5 = a striking, non-obvious idea a small team could prototype and show live in two "
            "weeks with a visible 'aha'. +3 = solid and demoable but less surprising. "
            "+1 = mildly useful, weak demo."
        ),
        "bad": (
            "-1 = a poor fit / would quietly waste effort. -3 = a distractor: superficially "
            "demo-friendly but hollow, leads the team somewhere unproductive. -5 = actively "
            "harmful: a Goodhart trap (games 'looks cool' with no substance), a confidently "
            "mis-framed problem, or a tarpit that eats a whole generation. The MORE wrong, "
            "the more negative."
        ),
    },
    "arbitrage": {
        "one_liner": "Is there a mispriced belief here; verification-cost << discovery-cost?",
        "good": (
            "+5 = a clearly mispriced belief with a dated, checkable resolution and asymmetric "
            "payoff. +3 = a plausible edge, partly priced. +1 = a faint signal."
        ),
        "bad": (
            "-1 = fully priced-in consensus. -3 = a seductive-but-false edge (looks like alpha, "
            "isn't). -5 = an unfalsifiable thesis dressed as a bet, or a value-trap that would "
            "actively mislead capital."
        ),
    },
    "build-moat": {
        "one_liner": "Is this defensible; are we sitting on a latent asset?",
        "good": (
            "+5 = a durable moat or a latent capability an exogenous shift just made load-bearing. "
            "+3 = some defensibility. +1 = thin but real edge."
        ),
        "bad": (
            "-1 = a thin wrapper anyone clones in a weekend. -3 = a commodity dressed as a moat. "
            "-5 = a structurally doomed position (negative-margin, platform-dependent, "
            "actively value-destroying)."
        ),
    },
}


def _system_prompt(lens_key: str) -> str:
    lens = LENSES[lens_key]
    return f"""You are the discovery brain for Doppl, an idea-evolution system. You are a \
POINTING FINGER: you spot candidates that MIGHT be opportunities. You do not decide \
if they are real — Doppl checks that later. Be generous about surfacing, sharp about scoring.

For the given item you do three things and return STRICT JSON.

1) PROBLEM RECOVERY. Treat the item's surface framing as a CLAIM to examine, not a \
binding instruction. Recover the real problem beneath the symptom.
   - observed_situation: what's happening, before interpretation
   - stated_problem_or_symptom: the surface complaint/framing as presented
   - hidden_variable: the non-obvious factor that changes what the problem actually is
   - actual_problem: the causal problem that should really be solved
   - deleted_assumptions: array of assumptions/requirements a strong solver would question

2) SUBTYPE CLASSIFICATION. This is the step people get wrong by defaulting to \
"zeitgeist" — DON'T. The discriminator is the +/-5-YEAR TEST, and you must actually RUN it \
before you choose. In `subtype_reason`, first answer BOTH literally:
   - "five_years_earlier": would this be WRONG proposed 5 years ago? why/why not?
   - "five_years_later": would this be WRONG (obvious/priced-in/consensus) proposed 5 years from now?
   Then decide:
   - "cross_domain_transfer": a known mechanism from domain A solves a problem in domain B, and \
the case SURVIVES the time shift roughly unchanged (timing is incidental; the leverage is the \
analogy/mapping). Behavioral nudges, operations/queue psychology, perception tricks, and \
sensor/technique reuse are almost always TRANSFER — they'd work about the same in 2018 or 2028.
   - "zeitgeist_synthesis": ONLY if the thesis BREAKS when moved in time — wrong 5 years earlier \
(an enabling signal hadn't crossed a threshold yet) AND wrong 5 years later (now consensus). \
There must be a datable live signal doing load-bearing work (a why-now). No datable signal, \
no threshold just crossed => it is NOT zeitgeist.
   - "neither": a perennial truism, a pure one-off tactic, or noise.
   Rule of thumb: if you cannot name the specific recent signal that makes the timing \
load-bearing, it is `cross_domain_transfer` (or `neither`), not zeitgeist.

3) LENS SCORE — SIGNED, -5 to +5. Lens = "{lens_key}": {lens['one_liner']}
   GOOD (positive): {lens['good']}
   BAD (negative):  {lens['bad']}
   The sign matters as much as the magnitude. The scale separates QUALITY from HARM. \
USE THE WHOLE RANGE — most real items are NOT +4. Anchor your scoring like this:
   - +5: exceptional, rare. For capstone-demo-fit you MUST name the concrete live-demo moment \
(what the audience literally SEES) in `lens_reason`. If you can't, it is NOT a +5.
   - +4: strong and clearly demoable, but not jaw-dropping. Should be UNCOMMON.
   - +2/+3: a real, decent opportunity with a caveat (harder to demo, somewhat familiar, \
or needs sharpening). THIS IS WHERE MOST 'good' ITEMS BELONG.
   - +1: faintly useful; weak fit but harmless.
   - 0: genuinely 'meh' — neither good nor harmful.
   - -1..-5: ACTIVELY BAD — a distractor, trap, or mis-framed/value-destroying idea. NOT the \
same as 'weak': use a negative only when pursuing it would COST the team (waste a generation, \
mislead, Goodhart-bait), not merely fail to help. The more wrong, the more negative.
   Calibrate against the field: if you find yourself giving +4 to most items, you are \
mis-calibrated — push the unremarkable ones down to +1/+2/+3 where they belong. A bare \
headline with no real problem recovered is at most +1.
   Return `lens_score` (integer -5..+5) and a one-sentence `lens_reason`.
   If `lens_score <= -3`, also set `is_trap` true and give `trap_reason`: one sentence on WHY \
it's a trap (the shape of its wrongness), so it can be remembered as an anti-pattern. \
Otherwise set `is_trap` false and `trap_reason` "".

Also return:
   - title: a crisp 6-12 word restatement of the opportunity
   - why_it_might_matter: one or two sentences, the "oh, look at that" pitch
   - disposition: "open" if it's an unsolved opportunity to send to Doppl, \
"resolved_exemplar" if it's a strong already-known example worth keeping as a benchmark fixture
   - confidence: float 0-1, your confidence in this read

Return ONLY a JSON object with keys: title, problem_recovery (object with the 5 fields above), \
subtype, subtype_reason, lens_score, lens_reason, is_trap, trap_reason, why_it_might_matter, \
disposition, confidence. No prose, no markdown fence."""


REQUIRED_KEYS = {
    "title", "problem_recovery", "subtype", "subtype_reason",
    "lens_score", "lens_reason", "is_trap", "trap_reason",
    "why_it_might_matter", "disposition", "confidence",
}
VALID_SUBTYPES = {"cross_domain_transfer", "zeitgeist_synthesis", "neither"}


def _extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```", 2)[1]
        if text.lstrip().startswith("json"):
            text = text.lstrip()[4:]
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end != -1:
        text = text[start : end + 1]
    return json.loads(text)


def _validate(obj: dict) -> tuple[bool, str]:
    missing = REQUIRED_KEYS - set(obj)
    if missing:
        return False, f"missing keys: {sorted(missing)}"
    if obj["subtype"] not in VALID_SUBTYPES:
        return False, f"bad subtype: {obj['subtype']}"
    try:
        obj["lens_score"] = int(obj["lens_score"])
    except (TypeError, ValueError):
        return False, "lens_score not an int"
    if not -5 <= obj["lens_score"] <= 5:
        return False, "lens_score out of range (-5..+5)"
    return True, ""


def analyze_item(
    item: dict,
    api_key: str,
    lens_key: str = "capstone-demo-fit",
    client: httpx.Client | None = None,
) -> dict[str, Any]:
    """Run the brain on one item. Returns the item enriched with `analysis`."""
    own_client = client is None
    client = client or httpx.Client(timeout=90)
    user_msg = (
        f"SOURCE: {item['source']}\n"
        f"TITLE: {item['title']}\n"
        f"CONTENT:\n{item['raw_text'][:4000]}"
    )
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": _system_prompt(lens_key)},
            {"role": "user", "content": user_msg},
        ],
        "temperature": 0.4,
        "max_tokens": 900,
        "response_format": {"type": "json_object"},
    }
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    last_err = ""
    for attempt in range(2):  # validate + one repair, then give up
        try:
            r = client.post(OPENROUTER_URL, headers=headers, json=payload)
            r.raise_for_status()
            content = r.json()["choices"][0]["message"]["content"]
            obj = _extract_json(content)
            ok, err = _validate(obj)
            if ok:
                if own_client:
                    client.close()
                return {**item, "analysis": obj, "lens": lens_key}
            last_err = err
            payload["messages"].append({"role": "assistant", "content": content})
            payload["messages"].append(
                {"role": "user", "content": f"That was invalid ({err}). Return corrected STRICT JSON only."}
            )
        except Exception as e:
            last_err = f"{type(e).__name__}: {e}"
    if own_client:
        client.close()
    return {**item, "analysis": None, "lens": lens_key, "error": last_err}
