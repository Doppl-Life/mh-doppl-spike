"""The fetch ladder — cheapest tool that works, escalate only when forced.

    try FREE (already-have API/RSS, or a plain httpx GET)
      -> if thin / blocked, FIRECRAWL (cheap, per-page, clean markdown)
        -> if JS / auth / anti-bot, BROWSER (browser-use / Browserbase — costly, last resort)

Why a ladder, not a single tool (researched June 2026):
  - Static/API sources: a plain GET or the source's JSON API is free and fast. Paying here is waste.
  - Firecrawl: ~1 credit/page, returns clean markdown/JSON — ideal for "fetch the body so
    Problem Recovery has something to chew on." This is the thin-headline fix.
  - browser-use (89% WebVoyager, OSS) / Browserbase (hosted Chrome via Playwright): handle
    JS-heavy / login-walled / anti-bot pages (X.com is the canonical case) but cost per-step /
    per-browser-hour and are slow. Reserve for sources that can't be had any cheaper.

The tier used is RECORDED on the item (`fetch_tier`) so cost can weigh into source scoring:
a well that only pays off via expensive browser automation has a worse *effective* hit-rate
than a free one (cost-as-a-vector, PROPOSAL.md).

This module degrades gracefully: with no keys set, only the FREE tier runs and everything
still works — the paid tiers light up when their env keys are present.
"""

from __future__ import annotations

import os
import re

import httpx

UA = {"User-Agent": "doppl-discovery-spike/0.2 (capstone research; contact via repo)"}

# A body is "thin" if shorter than this — triggers an enrichment attempt up the ladder.
THIN_CHARS = 240


def _strip_html(html: str) -> str:
    html = re.sub(r"<script.*?</script>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<style.*?</style>", " ", html, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\s+", " ", text).strip()


# --------------------------------------------------------------------------- #
# Tier 1 — FREE: a plain GET, HTML stripped to text.
# --------------------------------------------------------------------------- #

def fetch_free(url: str, timeout: int = 12) -> str | None:
    if not url.startswith("http"):
        return None
    try:
        r = httpx.get(url, headers=UA, timeout=timeout, follow_redirects=True)
        r.raise_for_status()
        ct = r.headers.get("content-type", "")
        if "html" not in ct and "text" not in ct and "json" not in ct:
            return None
        text = _strip_html(r.text)
        return text[:6000] if text else None
    except Exception:
        return None


# --------------------------------------------------------------------------- #
# Tier 2 — FIRECRAWL: clean markdown, per-page. Gated behind FIRECRAWL_API_KEY.
# Stub-but-real: the call is implemented; without a key it returns None (seam open).
# --------------------------------------------------------------------------- #

def fetch_firecrawl(url: str, timeout: int = 30) -> str | None:
    key = os.environ.get("FIRECRAWL_API_KEY", "").strip()
    if not key or not url.startswith("http"):
        return None
    try:
        r = httpx.post(
            "https://api.firecrawl.dev/v1/scrape",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={"url": url, "formats": ["markdown"], "onlyMainContent": True},
            timeout=timeout,
        )
        r.raise_for_status()
        data = r.json().get("data", {})
        md = data.get("markdown") or data.get("content") or ""
        return md[:6000] if md else None
    except Exception:
        return None


# --------------------------------------------------------------------------- #
# Tier 3 — BROWSER: JS / auth / anti-bot. Documented SEAM, off by default.
# Wire one of: browser-use (OSS, run locally) or Browserbase (hosted Chrome).
# Gated behind BROWSER_FETCH=1 so it never fires accidentally (it's slow + costly).
# --------------------------------------------------------------------------- #

def fetch_browser(url: str) -> str | None:
    if os.environ.get("BROWSER_FETCH", "") != "1":
        return None
    # SEAM: implement with browser-use or Browserbase here. Intentionally not wired
    # in the spike — it's the expensive last resort (per-step LLM / per-browser-hour),
    # reserved for sources that genuinely can't be had any cheaper (e.g. X.com).
    #
    # Example (browser-use, pseudocode):
    #   from browser_use import Agent
    #   return Agent(task=f"open {url}, return the main article text").run()
    return None


# --------------------------------------------------------------------------- #
# The ladder.
# --------------------------------------------------------------------------- #

def fetch_body(url: str) -> tuple[str | None, str]:
    """Return (body_text, tier_used). Walks free -> firecrawl -> browser."""
    body = fetch_free(url)
    if body and len(body) >= THIN_CHARS:
        return body, "free"
    fc = fetch_firecrawl(url)
    if fc and len(fc) >= THIN_CHARS:
        return fc, "firecrawl"
    br = fetch_browser(url)
    if br and len(br) >= THIN_CHARS:
        return br, "browser"
    # nothing better than the free attempt (possibly thin/None)
    return (body or fc or br), ("free" if body else "firecrawl" if fc else "browser" if br else "none")


def enrich_thin_items(items: list[dict], enabled: bool = True) -> list[dict]:
    """For items whose raw_text is thin, fetch the body via the ladder and append it.

    Records `fetch_tier` on every item. Only escalates for genuinely thin items
    (a bare headline) — rich items (curated corpus, full RFS) are left alone at 'free'.
    """
    for it in items:
        it.setdefault("fetch_tier", "free")
        if not enabled:
            continue
        if it.get("surface_metrics", {}).get("curated") or it.get("known_subtype"):
            continue  # corpus / curated — already rich
        if len(it.get("raw_text", "")) >= THIN_CHARS:
            continue  # already substantial
        url = it.get("url", "")
        if not url.startswith("http"):
            continue
        body, tier = fetch_body(url)
        it["fetch_tier"] = tier
        if body and len(body) > len(it.get("raw_text", "")):
            it["raw_text"] = f"{it['title']}\n\n{body}"
    return items
