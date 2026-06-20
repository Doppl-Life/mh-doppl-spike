"""Source-recipe ledger — learned access recipes, self-correcting.

The registry answers "is this well worth drinking from." This answers "and here's
HOW you draw from it." Together they're the complete picture of a source:
registry = value, recipe = access.

The point (the compounding win): the engine re-derives how to traverse each source
only when the world CHANGES, not every run. A working recipe is reused for free; a
BROKEN one is the trigger to re-derive once, write the new recipe, and move on.
That's O(when-it-breaks) instead of O(every-run) — the time/cycle/token saving.

This is the natural home for the "should this be an MCP / plugin?" decision: a
source that is valuable (registry) but expensive/hard to traverse (recipe.tier ==
"browser") carries an `mcp_candidate` flag — a prioritized integration backlog
generated from evidence. (Conceptually the same bet as YC's "Company Brain":
turn scattered rediscovery into an executable, current access recipe.)

Append-only in spirit (we keep `tried_and_failed` history); the JSON is the current
view. When this graduates to the TypeScript rebuild, this file is the spec.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

LEDGER_DIR = Path(__file__).resolve().parent / "ledgers"
RECIPES_PATH = LEDGER_DIR / "source_recipes.json"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# Seed recipes — what we learned (often the hard way) building the harvesters.
# These are the starting knowledge; the engine keeps them current from here.
SEED_RECIPES: dict[str, dict] = {
    "hackernews": {
        "tier": "free",
        "method": "Algolia API: GET https://hn.algolia.com/api/v1/search?tags=front_page",
        "tried_and_failed": ["numericFilters=points>150 -> 400 (attr not filterable)"],
        "mcp_candidate": None,
        "notes": "Clean JSON, no auth, reliable. The cheap baseline.",
    },
    "lobsters": {
        "tier": "free",
        "method": "GET https://lobste.rs/hottest.json",
        "tried_and_failed": [],
        "mcp_candidate": None,
        "notes": "JSON, no auth. Higher signal-to-noise than HN.",
    },
    "arxiv": {
        "tier": "free",
        "method": "GET https://export.arxiv.org/api/query (Atom); parse <entry> tags",
        "tried_and_failed": ["http:// (not https) -> empty/!200"],
        "mcp_candidate": None,
        "notes": "Must use https. Atom XML, regex <entry>/<title>/<summary>.",
    },
    "github-trending": {
        "tier": "free",
        "method": "Search API: GET /search/repositories?q=created:>DATE&sort=stars",
        "tried_and_failed": [],
        "mcp_candidate": "github (a GitHub MCP exists; would lift rate limits + give richer metadata)",
        "notes": "Unauthed search is rate-limited (~10/min). A token or MCP raises it.",
    },
    "yc-rfs": {
        "tier": "free",
        "method": "Fetched once; shipped as a curated fixture (RFS changes ~quarterly)",
        "tried_and_failed": [],
        "mcp_candidate": None,
        "notes": "Static-ish. Re-fetch on each new YC batch, not each run.",
    },
    "producthunt": {
        "tier": "free",
        "method": "RSS: GET https://www.producthunt.com/feed; parse <item>",
        "tried_and_failed": [],
        "mcp_candidate": "producthunt (official API needs OAuth; an MCP would simplify auth)",
        "notes": "RSS is shallow; the official GraphQL API (OAuth) gives votes/topics.",
    },
    "reddit": {
        "tier": "curl_cffi",
        "method": "JSON endpoints 403 a plain GET (TLS/JA3 wall); curl_cffi (chrome impersonate) should pass without a full browser",
        "tried_and_failed": ["plain httpx GET -> 403", "custom UA -> 403"],
        "mcp_candidate": "curl_cffi (cheap stealth GET) — else a Reddit MCP/OAuth app",
        "notes": "Was browser-tier; curl_cffi is the cheaper attempt (chrome TLS impersonate). NOTE: tested from a datacenter IP it still 403s — Reddit also blocks by IP, so curl_cffi may need a residential proxy, else falls through to browser. The ladder tries cheap-first and escalates correctly.",
    },
    "x": {
        "tier": "dispatch",
        "method": "dispatch:grok-cli — Grok has native live-firehose access (beats scraping); flat-rate on SuperGrok/X Premium+",
        "tried_and_failed": [],
        "mcp_candidate": "grok-cli (native X access) — else x/twitter MCP or browser-use",
        "notes": "Highest-value zeitgeist source. Grok (xAI) is the right traversal: privileged firehose, subscription-priced. Build/turn on here first.",
    },
    "youtube": {
        "tier": "dispatch",
        "method": "Data API (free) for trend signal; dispatch:gemini-cli for transcript digest",
        "tried_and_failed": [],
        "mcp_candidate": "gemini-cli (native YT access; flat-rate) or YouTube Data API key",
        "notes": "Two signals: trend-surge (free Data API, datable why-now) + content "
        "(Gemini digests the few videos that matter). Google's own model traverses YT best.",
    },
    "google-trends": {
        "tier": "free",
        "method": "Unofficial trends endpoint / pytrends; daily/realtime trending + breakout terms",
        "tried_and_failed": [],
        "mcp_candidate": None,
        "notes": "Purest why-now instrument: a breakout term IS a dated threshold-crossing. "
        "High value for the zeitgeist lens. Unofficial API; rate-limit carefully.",
    },
    "sec-edgar": {
        "tier": "free",
        "method": "EDGAR full-text search API: efts.sec.gov/LATEST/search-index?q=...",
        "tried_and_failed": [],
        "mcp_candidate": None,
        "notes": "Latent-asset unlocks show up in 8-K/10-K language before the market reprices. "
        "On-thesis for the 'bishop nobody saw' arbitrage pattern. Free, official.",
    },
    "papers-with-code": {
        "tier": "free",
        "method": "GET https://paperswithcode.com/api/v1/ (trending papers + code)",
        "tried_and_failed": [],
        "mcp_candidate": None,
        "notes": "Frontier tech crossing research->buildable. Transfer-lens signal.",
    },
}


def load_recipes() -> dict:
    if RECIPES_PATH.exists():
        txt = RECIPES_PATH.read_text(encoding="utf-8").strip()
        if txt:
            return json.loads(txt)
    return {}


def _save(recipes: dict) -> None:
    RECIPES_PATH.parent.mkdir(parents=True, exist_ok=True)
    RECIPES_PATH.write_text(json.dumps(recipes, indent=2, ensure_ascii=False), encoding="utf-8")


def _base_key(source: str) -> str:
    # collapse "reddit:startups" -> "reddit" so the recipe is per-platform
    return source.split(":")[0]


def ensure_seeded() -> dict:
    """Merge any missing seed recipes into the ledger (idempotent)."""
    recipes = load_recipes()
    changed = False
    for key, seed in SEED_RECIPES.items():
        if key not in recipes:
            recipes[key] = {
                **seed,
                "source": key,
                "status": "untested",
                "last_verified": None,
                "updated_at": _now(),
            }
            changed = True
    if changed:
        _save(recipes)
    return recipes


def record_outcome(source: str, ok: bool, detail: str = "") -> None:
    """The self-heal hook. Call after every harvest attempt.

    ok=True  -> recipe is working; stamp last_verified.
    ok=False -> recipe is BROKEN; flip status and append the failure. The broken
                status is the signal to re-derive the method on the next pass
                (re-derivation itself is a TODO seam — for the spike we record the
                break so a human/agent fixes the recipe once, not every run).
    """
    recipes = ensure_seeded()
    key = _base_key(source)
    r = recipes.get(key)
    if r is None:
        r = recipes[key] = {
            "source": key, "tier": "unknown", "method": "(discovered at runtime)",
            "tried_and_failed": [], "mcp_candidate": None, "notes": "", "updated_at": _now(),
        }
    if ok:
        r["status"] = "working"
        r["last_verified"] = _now()
    else:
        was = r.get("status")
        r["status"] = "broken"
        if detail and detail not in r.get("tried_and_failed", []):
            r.setdefault("tried_and_failed", []).append(detail)
        r["needs_rederivation"] = True
        r["broke_at"] = _now()
        if was == "working":
            r["regressed"] = True  # it used to work — the world changed
    r["updated_at"] = _now()
    _save(recipes)


def mcp_backlog(registry: dict | None = None) -> list[dict]:
    """Sources that warrant a dedicated MCP/connector, prioritized by evidence.

    A source is a connector candidate when it carries an `mcp_candidate` AND
    (it's browser-tier OR broken OR — if a registry is given — it's a productive
    well). 'Valuable but hard to reach' = worth the integration.
    """
    recipes = load_recipes()
    out = []
    for key, r in recipes.items():
        if not r.get("mcp_candidate"):
            continue
        valuable = False
        if registry:
            valuable = any(
                v.get("source", "").split(":")[0] == key and v.get("status") == "productive"
                for v in registry.values()
            )
        hard = r.get("tier") in ("browser", "dispatch") or r.get("status") == "broken"
        if hard or valuable:
            out.append({
                "source": key,
                "tier": r.get("tier"),
                "status": r.get("status"),
                "mcp_candidate": r["mcp_candidate"],
                "reason": f"{r.get('tier')}-tier/broken" if hard else "productive well",
            })
    # hardest-to-reach first: browser, then dispatch, then the rest
    tier_rank = {"browser": 0, "dispatch": 1}
    out.sort(key=lambda x: tier_rank.get(x["tier"], 2))
    return out


def worth_unlocking(promo_rates: dict, threshold: float = 0.5, min_marked: int = 2) -> list[dict]:
    """Evidence-gated access: a walled/expensive source that PROVES it pays.

    The budgeted-bandit ('is the juice worth the squeeze') made real, with promotion
    rate as the payoff signal. A source whose recipe is browser/dispatch/broken but
    whose promotion rate clears `threshold` is the engine saying: *spend the costly
    access here* (Grok for X, curl_cffi/browser for Reddit). Takes the promotion_rates
    dict from ledgers.promotion_rates().
    """
    recipes = load_recipes()
    out = []
    for src, d in promo_rates.items():
        if d.get("marked", 0) < min_marked or d.get("promotion_rate", 0) < threshold:
            continue
        key = src.split(":")[0]
        r = recipes.get(key, {})
        tier = r.get("tier")
        if tier in ("browser", "dispatch") or r.get("status") == "broken":
            out.append({
                "source": src,
                "tier": tier,
                "promotion_rate": d["promotion_rate"],
                "marked": d["marked"],
                "mcp_candidate": r.get("mcp_candidate"),
            })
    out.sort(key=lambda x: x["promotion_rate"], reverse=True)
    return out
