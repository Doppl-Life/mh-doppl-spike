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
import shutil
import subprocess

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
# Tier 1.5 — CURL_CFFI: a stealth GET that mimics a real browser's TLS/JA3
# fingerprint. Defeats Cloudflare/Akamai/in-house bot walls that 403 a plain GET
# (Reddit is the canonical case) WITHOUT spinning up a full browser — so it sits
# between free and browser: cheap, fast, no JS engine. Optional dep (`curl_cffi`);
# if not installed, this rung is dark and the ladder falls through to browser.
# (Limitation: no JS, so it won't pass JS challenges like Turnstile — that's the
# browser tier's job.)
# --------------------------------------------------------------------------- #

def fetch_curl_cffi(url: str, timeout: int = 15) -> str | None:
    if not url.startswith("http"):
        return None
    try:
        from curl_cffi import requests as cffi_requests  # optional dep
    except Exception:
        return None
    try:
        r = cffi_requests.get(url, impersonate="chrome", timeout=timeout)
        if r.status_code != 200:
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
# DISPATCH tier — hand the job to another agent/CLI that's natively good at it
# (and that you already pay for flat-rate, so it's cheaper than metered tokens).
# The canonical case: YouTube -> Gemini CLI (Google owns YT; native transcript +
# search access). Gated behind the tool being on PATH, like the other tiers.
# --------------------------------------------------------------------------- #

def dispatch_available(tool: str) -> bool:
    """Is a dispatch target installed? e.g. dispatch_available('gemini')."""
    return shutil.which(tool) is not None


def fetch_via_gemini(url_or_query: str, instruction: str = "", timeout: int = 90) -> str | None:
    """Dispatch to the Gemini CLI. Reaches YouTube etc. natively and runs on your
    flat-rate Google subscription instead of metered API tokens.

    SEAM: requires `gemini` on PATH. Without it, returns None (tier stays dark).
    The exact CLI invocation/flags are pinned when you wire your real Gemini CLI;
    this is the integration point, intentionally conservative for the spike.
    """
    if not dispatch_available("gemini"):
        return None
    prompt = (
        f"{instruction or 'Summarize the key substantive content (problems, claims, techniques) of this source.'}\n"
        f"Source: {url_or_query}\nReturn plain text only."
    )
    try:
        # Common Gemini CLI shape: `gemini -p "<prompt>"`. Adjust to your install.
        proc = subprocess.run(
            ["gemini", "-p", prompt],
            capture_output=True, text=True, timeout=timeout,
        )
        out = (proc.stdout or "").strip()
        return out[:6000] if out else None
    except Exception:
        return None


def fetch_via_grok(url_or_query: str, instruction: str = "", timeout: int = 90) -> str | None:
    """Dispatch to Grok Build (xAI CLI). Grok has native, privileged access to the
    live X/Twitter firehose — which is exactly why it beats scraping for x.com — and
    runs flat-rate on a SuperGrok / X Premium+ subscription, not metered tokens.

    SEAM: requires the Grok CLI on PATH (`grok`). Without it, returns None. The exact
    invocation/flags are pinned when you wire your install; conservative for the spike.
    This is the X dispatch route the `worth_unlocking` signal will recommend turning on.
    """
    grok_bin = "grok" if dispatch_available("grok") else None
    if not grok_bin:
        return None
    prompt = (
        f"{instruction or 'Summarize the current X/Twitter discussion and live signal around this.'}\n"
        f"Topic/URL: {url_or_query}\nReturn plain text only."
    )
    try:
        proc = subprocess.run(
            [grok_bin, "-p", prompt],
            capture_output=True, text=True, timeout=timeout,
        )
        out = (proc.stdout or "").strip()
        return out[:6000] if out else None
    except Exception:
        return None


# --------------------------------------------------------------------------- #
# The ladder.
# --------------------------------------------------------------------------- #

def fetch_body(url: str) -> tuple[str | None, str]:
    """Return (body_text, tier_used). Walks free -> curl_cffi -> firecrawl -> browser."""
    body = fetch_free(url)
    if body and len(body) >= THIN_CHARS:
        return body, "free"
    cf = fetch_curl_cffi(url)        # stealth GET: defeats TLS-fingerprint walls
    if cf and len(cf) >= THIN_CHARS:
        return cf, "curl_cffi"
    fc = fetch_firecrawl(url)
    if fc and len(fc) >= THIN_CHARS:
        return fc, "firecrawl"
    br = fetch_browser(url)
    if br and len(br) >= THIN_CHARS:
        return br, "browser"
    best = body or cf or fc or br
    tier = ("free" if body else "curl_cffi" if cf else "firecrawl" if fc else "browser" if br else "none")
    return best, tier


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
