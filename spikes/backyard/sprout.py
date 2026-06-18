#!/usr/bin/env python3
"""Backyard sprout loop — the cheapest end-to-end idea pipe we could glue together.

Throwaway garage parts. The point is NOT quality; it's to prove the pipe carries
water: generate -> score -> surface, between you and me, no Agora.

  1. GENERATE: a cheap model coughs up N candidate ideas (sprouts) for a seed,
     each with why-it's-non-obvious + how-to-verify.
  2. SCORE: a DIFFERENT cheap lab (held-out judge homology) rates each on
     novelty + verifiability and says why in one line.
  3. SURFACE: rank, print to the terminal (the local "Agora" = us), tag the
     winners afrit / the noise weed.
  4. LOG: append-only JSONL with stable IDs. Read path stays lazy; the *write
     schema* is disciplined so any future substrate can read it.

Run:
  ../../.venv/bin/python sprout.py --seed "where is biotech compute underpriced?"
  ../../.venv/bin/python sprout.py --n 6 --runs 2
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

import httpx
from dotenv import load_dotenv

# Line-buffer stdout so progress is visible live even when redirected to a file.
try:
    sys.stdout.reconfigure(line_buffering=True)
except AttributeError:
    pass

# Load a key from the backyard, repo root, or sibling spikes — whatever's lying around.
HERE = Path(__file__).resolve().parent
for candidate in (HERE / ".env", HERE.parent.parent / ".env", HERE.parent / "agenotype" / ".env"):
    if candidate.exists():
        load_dotenv(candidate)

LEDGER = HERE / "sprouts.jsonl"
AGORA = HERE / "agora_surfaced.jsonl"
BASE_URL = "https://openrouter.ai/api/v1"

# Cheap, cross-lab on purpose: generator and scorer come from different labs so
# the scorer isn't just grading its own priors (held-out-judge homology).
GEN_MODEL = "deepseek/deepseek-v4-flash"
SCORE_MODEL = "qwen/qwen3.7-plus"

# Surfacing gates (the weed knob). Combined score = novelty + verifiability, 2..10.
AFRIT_BAR = 8   # >= this -> afrit (worth harvesting)
WEED_BAR = 5    # <  this -> weed (surfaced but shouldn't have)


def make_client() -> httpx.Client:
    key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not key:
        raise SystemExit("Missing OPENROUTER_API_KEY — add it to .env (backyard or repo root).")
    return httpx.Client(
        base_url=BASE_URL,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "X-Title": "Doppl Backyard Sprout",
        },
        timeout=180.0,
    )


def chat(client: httpx.Client, *, model: str, system: str, user: str, temperature: float) -> str:
    last_err: Exception | None = None
    for attempt in range(3):
        try:
            resp = client.post(
                "/chat/completions",
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    "temperature": temperature,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:  # noqa: BLE001 — throwaway rig; we want to see + survive any failure
            last_err = e
            detail = getattr(getattr(e, "response", None), "text", "")
            print(f"    [chat retry {attempt + 1}/3] {model}: {e} {detail[:200]}")
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"chat failed after 3 tries: {last_err}")


def parse_json(raw: str):
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
    start = cleaned.find("[")
    if start == -1:
        start = cleaned.find("{")
    if start > 0:
        cleaned = cleaned[start:]
    return json.loads(cleaned)


GEN_SYSTEM = (
    "You are a non-obvious idea surfacer. Favor ideas that are HARD TO FIND but EASY "
    "TO VERIFY. Simple, direct ideas are welcome IF they are special; the sin is being "
    "CONTRIVED or crowded, not being simple. Avoid generic 'build an AI tool that...' "
    "filler unless the angle is genuinely sharp. Return STRICT JSON only."
)


def generate(
    client: httpx.Client,
    seed: str,
    n: int,
    model: str,
    avoid: list[str] | None = None,
    lessons: list[str] | None = None,
) -> list[dict]:
    # Amemetics: feed prior ideas back so it doesn't repeat, and prior weed-reasons
    # back as failure modes to dodge. This is the loop that makes it better, not busier.
    avoid_block = ""
    if avoid:
        recent = avoid[-30:]
        avoid_block = "\nAlready proposed — do NOT repeat these, go somewhere new:\n" + "\n".join(
            f"- {a}" for a in recent
        )
    lessons_block = ""
    if lessons:
        lessons_block = (
            "\nA stingy held-out judge rejected earlier ideas for these reasons. "
            "Simple/direct is fine; contrived/crowded is not. Dodge these failure modes:\n"
            + "\n".join(f"- {l}" for l in lessons[-12:])
        )
    user = (
        f"Seed: {seed}\n\n"
        f"Surface {n} genuinely non-obvious ideas. For each, return an object with keys:\n"
        '  "idea": one sentence, concrete.\n'
        '  "why_nonobvious": why a smart person would miss it.\n'
        '  "how_to_verify": the cheapest test that could prove it wrong.\n'
        f"Return a JSON array of exactly {n} such objects. No prose outside the JSON."
        + avoid_block
        + lessons_block
    )
    raw = chat(client, model=model, system=GEN_SYSTEM, user=user, temperature=0.95)
    data = parse_json(raw)
    return data if isinstance(data, list) else [data]


SCORE_SYSTEM = (
    "You are a held-out judge from a different lab than the idea's author. You are "
    "stingy. Reward non-obviousness AND cheap falsifiability. Return STRICT JSON only."
)


def score(client: httpx.Client, seed: str, sprouts: list[dict], model: str) -> list[dict]:
    listing = "\n".join(
        f"{i}. idea: {s.get('idea','')}\n   verify: {s.get('how_to_verify','')}"
        for i, s in enumerate(sprouts)
    )
    user = (
        f"Seed: {seed}\n\nScore each idea below. Return a JSON array; for each, an object with keys:\n"
        '  "i": the index integer.\n'
        '  "novelty": 1-5 (5 = genuinely surprising).\n'
        '  "verifiability": 1-5 (5 = cheap, decisive test exists).\n'
        '  "reason": one stingy line.\n\n'
        f"Ideas:\n{listing}"
    )
    raw = chat(client, model=model, system=SCORE_SYSTEM, user=user, temperature=0.2)
    data = parse_json(raw)
    return data if isinstance(data, list) else [data]


def classify(total: int) -> str:
    if total >= AFRIT_BAR:
        return "afrit"
    if total < WEED_BAR:
        return "weed"
    return "sprout"


GLYPH = {"afrit": "[*]", "sprout": "[~]", "weed": "[x]"}


def surface_to_agora(rows: list[dict], generation: int) -> list[dict]:
    """Simulated Agora: surface the picks to us (terminal + file). Blueprint for the
    real channel later — for now it just 'sends out' and tells you and me."""
    picks = [r for r in rows if r["kind"] == "afrit"]
    if not picks:  # nothing cleared the bar — still surface the single best sprout
        picks = rows[:1]
    with AGORA.open("a") as fh:
        for r in picks:
            fh.write(
                json.dumps(
                    {
                        "surfaced_ts": datetime.now(timezone.utc).isoformat(),
                        "generation": generation,
                        "sprout_id": r["sprout_id"],
                        "kind": r["kind"],
                        "score": r["score"],
                        "idea": r["idea"],
                    }
                )
                + "\n"
            )
    print("  >> SURFACED TO Lα (simulated Agora):")
    for r in picks:
        print(f"     {GLYPH[r['kind']]} [{r['score']}] {r['idea']}")
    return picks


def run_once(
    client: httpx.Client,
    seed: str,
    n: int,
    gen_model: str,
    score_model: str,
    generation: int = 0,
    avoid: list[str] | None = None,
    lessons: list[str] | None = None,
) -> dict:
    run_id = uuid.uuid4().hex[:8]
    sprouts = generate(client, seed, n, gen_model, avoid=avoid, lessons=lessons)
    scores = {int(s.get("i", idx)): s for idx, s in enumerate(score(client, seed, sprouts, score_model))}

    rows = []
    for idx, sp in enumerate(sprouts):
        sc = scores.get(idx, {})
        nov = int(sc.get("novelty", 0) or 0)
        ver = int(sc.get("verifiability", 0) or 0)
        total = nov + ver
        rows.append(
            {
                "ts": datetime.now(timezone.utc).isoformat(),
                "run_id": run_id,
                "generation": generation,
                "sprout_id": f"{run_id}-{idx}",
                "seed": seed,
                "gen_model": gen_model,
                "score_model": score_model,
                "idea": sp.get("idea", ""),
                "why_nonobvious": sp.get("why_nonobvious", ""),
                "how_to_verify": sp.get("how_to_verify", ""),
                "novelty": nov,
                "verifiability": ver,
                "score": total,
                "reason": sc.get("reason", ""),
                "kind": classify(total),
            }
        )

    rows.sort(key=lambda r: r["score"], reverse=True)
    with LEDGER.open("a") as fh:
        for r in rows:
            fh.write(json.dumps(r) + "\n")

    print(f"\n=== gen {generation} · run {run_id} · seed: {seed!r} ===")
    print(f"    gen={gen_model}  score={score_model}\n")
    for r in rows:
        print(f"  {GLYPH[r['kind']]} [{r['score']:>2}] nov{r['novelty']}/ver{r['verifiability']}  {r['idea']}")
        print(f"        why: {r['why_nonobvious']}")
        print(f"     verify: {r['how_to_verify']}")
        print(f"      judge: {r['reason']}\n")

    counts = {k: sum(1 for r in rows if r["kind"] == k) for k in ("afrit", "sprout", "weed")}
    avg = sum(r["score"] for r in rows) / len(rows) if rows else 0
    print(f"  -> afrits={counts['afrit']} sprouts={counts['sprout']} weeds={counts['weed']}"
          f"  (weed ratio {counts['weed']}/{len(rows)}, avg score {avg:.1f})")
    surface_to_agora(rows, generation)
    return {"run_id": run_id, "rows": rows, "counts": counts, "avg": avg}


def main() -> None:
    ap = argparse.ArgumentParser(description="Backyard sprout loop — cheapest idea pipe.")
    ap.add_argument("--seed", default="Where is the next 10x cheap-to-verify edge in AI tooling?")
    ap.add_argument("--n", type=int, default=5, help="sprouts per generation")
    ap.add_argument("--generations", type=int, default=1, help="how many generations to cook")
    ap.add_argument("--gen-model", default=GEN_MODEL)
    ap.add_argument("--score-model", default=SCORE_MODEL)
    args = ap.parse_args()

    client = make_client()
    t0 = time.time()
    seen: list[str] = []     # idea memory — don't repeat
    lessons: list[str] = []  # weed-reasons fed back as failure modes (amemetics)
    history = []
    for g in range(args.generations):
        try:
            res = run_once(
                client, args.seed, args.n, args.gen_model, args.score_model,
                generation=g, avoid=seen, lessons=lessons,
            )
        except Exception as e:  # noqa: BLE001 — keep cooking even if a generation fails
            print(f"  !! gen {g} failed: {e}")
            continue
        seen.extend(r["idea"] for r in res["rows"])
        lessons.extend(r["reason"] for r in res["rows"] if r["kind"] == "weed")
        history.append(res)

    print("\n=== cook summary (does it get better, not just busier?) ===")
    for g, res in enumerate(history):
        c = res["counts"]
        print(f"  gen {g}: avg {res['avg']:.1f}  afrit={c['afrit']} sprout={c['sprout']} weed={c['weed']}")
    print(f"\nledger -> {LEDGER}\nagora  -> {AGORA}\n({time.time() - t0:.0f}s total)")


if __name__ == "__main__":
    main()


if __name__ == "__main__":
    main()
