"""Harvest + normalize layer.

Every source collapses into one record shape so everything downstream can treat a
Polymarket contract and an HN thread identically:

    Item = {
        id, source, url, title, raw_text, timestamp,
        surface_metrics: {...},      # source-specific popularity signals
        known_subtype: str | None,   # held-out ground truth, corpus only
    }

Live sources fail soft: if a fetch errors or times out, the source yields nothing
and the run continues (and the source registry records the miss). Fixtures-first
is the demo posture — the corpus alone is enough to prove the brain.
"""

from __future__ import annotations

import hashlib
import re
from pathlib import Path
from typing import Any

import httpx

REPO_ROOT = Path(__file__).resolve().parents[2]
CASE_STUDIES = REPO_ROOT / "case-studies"

UA = {"User-Agent": "doppl-discovery-spike/0.1 (capstone research; contact via repo)"}


def _hid(*parts: str) -> str:
    return hashlib.sha1("::".join(parts).encode()).hexdigest()[:12]


def _item(
    source: str,
    url: str,
    title: str,
    raw_text: str,
    timestamp: str = "",
    surface_metrics: dict | None = None,
    known_subtype: str | None = None,
) -> dict[str, Any]:
    return {
        "id": _hid(source, url, title),
        "source": source,
        "url": url,
        "title": title,
        "raw_text": raw_text.strip(),
        "timestamp": timestamp,
        "surface_metrics": surface_metrics or {},
        "known_subtype": known_subtype,
    }


# --------------------------------------------------------------------------- #
# Source 1: existing case-studies corpus (the held-out ground truth)
# --------------------------------------------------------------------------- #

_SUBTYPE_RE = re.compile(r"subtype:\*\*\s*`?(cross_domain_transfer|zeitgeist_synthesis)`?", re.I)


def harvest_corpus(limit: int | None = None) -> list[dict]:
    """Load each case-study's problem-statement.md as an item.

    The declared subtype (parsed from the file header) is carried as
    `known_subtype` so the run can score the classifier against ground truth —
    but it is NOT shown to the LLM.
    """
    items: list[dict] = []
    if not CASE_STUDIES.exists():
        return items
    for ps in sorted(CASE_STUDIES.glob("*/problem-statement.md")):
        text = ps.read_text(encoding="utf-8", errors="ignore")
        m = _SUBTYPE_RE.search(text)
        known = m.group(1).lower() if m else None
        # title: first markdown heading, stripped of the "Problem Statement:" prefix
        title_m = re.search(r"^#\s+(.*)$", text, re.M)
        title = title_m.group(1).strip() if title_m else ps.parent.name
        title = re.sub(r"^problem statement:\s*", "", title, flags=re.I)
        # body: drop the heading + the subtype blockquote line; keep the meat,
        # cut the "## Source Notes" tail so we don't leak eval framing
        body = re.sub(r"^#\s+.*$", "", text, flags=re.M)
        body = re.sub(r"^>\s*\*\*Doppl subtype.*$", "", body, flags=re.M | re.I)
        body = body.split("## Source Notes")[0]
        body = re.sub(r"\n{3,}", "\n\n", body).strip()
        items.append(
            _item(
                source="corpus:case-studies",
                url=f"file://case-studies/{ps.parent.name}/problem-statement.md",
                title=title,
                raw_text=body,
                surface_metrics={"curated": True},
                known_subtype=known,
            )
        )
    if limit:
        items = items[:limit]
    return items


# --------------------------------------------------------------------------- #
# Source 2: Hacker News (Algolia API — no auth, reliable)
# --------------------------------------------------------------------------- #

def harvest_hn(limit: int = 8, query: str = "") -> list[dict]:
    """Front-page-ish HN stories via the Algolia API.

    Default: top stories by points in the last few days. Optional query narrows it.
    """
    items: list[dict] = []
    try:
        url = "https://hn.algolia.com/api/v1/search"
        if query:
            params = {"query": query, "tags": "story", "hitsPerPage": limit}
        else:
            # current front page — high-signal problems/launches/discussion
            params = {"tags": "front_page", "hitsPerPage": limit}
        r = httpx.get(url, params=params, headers=UA, timeout=15)
        r.raise_for_status()
        for hit in r.json().get("hits", []):
            title = hit.get("title") or hit.get("story_title") or ""
            if not title:
                continue
            story_url = hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID')}"
            blurb = title
            if hit.get("story_text"):
                blurb = f"{title}\n\n{re.sub('<[^>]+>', '', hit['story_text'])}"
            items.append(
                _item(
                    source="hackernews",
                    url=story_url,
                    title=title,
                    raw_text=blurb,
                    timestamp=hit.get("created_at", ""),
                    surface_metrics={
                        "points": hit.get("points", 0),
                        "num_comments": hit.get("num_comments", 0),
                    },
                )
            )
    except Exception as e:  # fail soft
        return [{"__error__": f"hackernews: {type(e).__name__}: {e}"}]
    return items


# --------------------------------------------------------------------------- #
# Source 3: YC RFS (we already fetched it; ship a small curated fixture so the
# spike is self-contained and offline-safe). These are real Summer-2026 RFS items.
# --------------------------------------------------------------------------- #

_YC_RFS_FIXTURE = [
    (
        "AI-Native Service Companies",
        "https://www.ycombinator.com/rfs",
        "AI-native companies that don't sell software, they sell the service: do the "
        "work instead of giving a tool. Total services spend dwarfs software spend, and "
        "much of it is already outsourced and easy to replace. Especially: insurance "
        "brokerage, accounting/tax/audit, compliance, healthcare administration.",
    ),
    (
        "Company Brain",
        "https://www.ycombinator.com/rfs",
        "The blocker to AI automation is no longer models, it's domain knowledge "
        "scattered across people's heads, old email, Slack threads, support tickets, "
        "and databases. A new primitive: a system that pulls knowledge out of "
        "fragmented sources, structures it, keeps it current, and turns it into an "
        "executable skills file AI can use to do the work safely and consistently.",
    ),
    (
        "SaaS Challengers",
        "https://www.ycombinator.com/rfs",
        "AI collapsed the cost of producing software 10-100x, so the moat of legacy "
        "SaaS (millions of lines built over decades) is gone. Build AI-native "
        "challengers to invulnerable-seeming products: chip design software, ERPs, "
        "industrial control systems, supply chain management.",
    ),
    (
        "AI-Native Discovery Engines",
        "https://www.ycombinator.com/rfs",
        "Frontier models hit PhD-level scientific reasoning. The frontier is shifting "
        "from copilot research assistants to intelligent systems that run closed "
        "discovery loops: propose hypotheses, generate experiments, analyze data, "
        "suggest next steps, in drug discovery, materials science, protein engineering.",
    ),
    (
        "Software for Agents",
        "https://www.ycombinator.com/rfs",
        "The next trillion internet users are AI agents, browsing and buying on top of "
        "software designed for humans clicking buttons. Agents need machine-readable "
        "interfaces (APIs, MCPs, CLIs) and docs to discover and use tools without a "
        "human in the loop. Every major software category needs rebuilding for agents.",
    ),
]


def harvest_yc_rfs(limit: int = 5) -> list[dict]:
    items = [
        _item(
            source="yc-rfs",
            url=url,
            title=title,
            raw_text=f"{title}\n\n{body}",
            timestamp="2026-summer",
            surface_metrics={"curated": True, "batch": "Summer 2026"},
        )
        for (title, url, body) in _YC_RFS_FIXTURE
    ]
    return items[:limit]


# --------------------------------------------------------------------------- #
# Source 4: Product Hunt (RSS — light, no auth; fixture fallback)
# --------------------------------------------------------------------------- #

_PH_FALLBACK = [
    (
        "An AI that turns your meeting recordings into an updatable team wiki",
        "https://www.producthunt.com/",
        "Records every meeting, extracts decisions and action items, and keeps a living "
        "company wiki current automatically so nobody has to write docs.",
    ),
    (
        "Agent-first CRM with an API agents sign up for themselves",
        "https://www.producthunt.com/",
        "A CRM built for AI agents as first-class users: no dashboard-first UI, just a "
        "documented API and MCP an agent can discover, authenticate to, and operate.",
    ),
]


def harvest_lobsters(limit: int = 6) -> list[dict]:
    """Lobsters hottest — JSON, no auth. Tech-leaning, higher signal-to-noise than HN."""
    try:
        r = httpx.get("https://lobste.rs/hottest.json", headers=UA, timeout=15)
        r.raise_for_status()
        out = []
        for s in r.json()[:limit]:
            title = s.get("title", "")
            if not title:
                continue
            body = title
            if s.get("description_plain"):
                body = f"{title}\n\n{s['description_plain']}"
            elif s.get("description"):
                body = f"{title}\n\n{re.sub('<[^>]+>', '', s['description'])}"
            out.append(
                _item(
                    source="lobsters",
                    url=s.get("url") or s.get("short_id_url", "https://lobste.rs"),
                    title=title,
                    raw_text=body,
                    timestamp=s.get("created_at", ""),
                    surface_metrics={"score": s.get("score", 0), "comments": s.get("comment_count", 0)},
                )
            )
        return out
    except Exception as e:
        return [{"__error__": f"lobsters: {type(e).__name__}: {e}"}]


def harvest_github_trending(limit: int = 6) -> list[dict]:
    """Recently-created repos by stars — a proxy for 'what builders just shipped'."""
    try:
        # repos created in the trailing ~3 weeks, most-starred first
        import datetime as _dt
        since = (_dt.date.today() - _dt.timedelta(days=21)).isoformat()
        r = httpx.get(
            "https://api.github.com/search/repositories",
            params={"q": f"created:>{since}", "sort": "stars", "order": "desc", "per_page": limit},
            headers={**UA, "Accept": "application/vnd.github+json"},
            timeout=15,
        )
        r.raise_for_status()
        out = []
        for repo in r.json().get("items", [])[:limit]:
            desc = repo.get("description") or ""
            title = repo.get("full_name", "")
            out.append(
                _item(
                    source="github-trending",
                    url=repo.get("html_url", ""),
                    title=f"{title} — {desc[:80]}" if desc else title,
                    raw_text=f"{title}\n\n{desc}\n\nLanguage: {repo.get('language')}. "
                    f"A newly-popular open-source project (signal: what builders are starring now).",
                    timestamp=repo.get("created_at", ""),
                    surface_metrics={"stars": repo.get("stargazers_count", 0)},
                )
            )
        return out
    except Exception as e:
        return [{"__error__": f"github-trending: {type(e).__name__}: {e}"}]


def harvest_arxiv(limit: int = 5, category: str = "cs.AI") -> list[dict]:
    """Most-recent arXiv submissions in a category — frontier-research signal."""
    try:
        r = httpx.get(
            "https://export.arxiv.org/api/query",
            params={
                "search_query": f"cat:{category}",
                "sortBy": "submittedDate",
                "sortOrder": "descending",
                "max_results": limit,
            },
            headers=UA,
            timeout=20,
        )
        r.raise_for_status()
        entries = re.findall(r"<entry>(.*?)</entry>", r.text, re.S)
        out = []
        for e in entries[:limit]:
            ti = re.search(r"<title>(.*?)</title>", e, re.S)
            su = re.search(r"<summary>(.*?)</summary>", e, re.S)
            link = re.search(r'<id>(.*?)</id>', e, re.S)
            if not ti:
                continue
            title = re.sub(r"\s+", " ", ti.group(1)).strip()
            abstract = re.sub(r"\s+", " ", su.group(1)).strip() if su else ""
            out.append(
                _item(
                    source="arxiv",
                    url=link.group(1).strip() if link else "https://arxiv.org",
                    title=title,
                    raw_text=f"{title}\n\n{abstract}",
                    surface_metrics={"category": category},
                )
            )
        return out
    except Exception as e:
        return [{"__error__": f"arxiv: {type(e).__name__}: {e}"}]


def harvest_reddit(limit: int = 5, subreddit: str = "startups") -> list[dict]:
    """Reddit top posts. Reddit 403s plain requests — this source needs the BROWSER
    fetch tier (BROWSER_FETCH=1) to work, and is the canonical demonstration of why
    the fetch ladder exists. Without the browser tier it reports unreachable, and the
    source registry correctly records the cost of reaching it."""
    try:
        r = httpx.get(
            f"https://www.reddit.com/r/{subreddit}/top.json",
            params={"t": "week", "limit": limit},
            headers=UA,
            timeout=15,
        )
        r.raise_for_status()
        out = []
        for c in r.json().get("data", {}).get("children", [])[:limit]:
            d = c.get("data", {})
            title = d.get("title", "")
            if not title:
                continue
            body = f"{title}\n\n{d.get('selftext', '')[:1500]}".strip()
            out.append(
                _item(
                    source=f"reddit:{subreddit}",
                    url=f"https://reddit.com{d.get('permalink', '')}",
                    title=title,
                    raw_text=body,
                    surface_metrics={"ups": d.get("ups", 0), "comments": d.get("num_comments", 0)},
                )
            )
        return out
    except Exception as e:
        return [{"__error__": f"reddit:{subreddit}: {type(e).__name__}: {e} (needs BROWSER_FETCH=1)"}]


def harvest_sec_edgar(limit: int = 6, query: str = "artificial intelligence") -> list[dict]:
    """SEC EDGAR full-text search — recent filings mentioning a thesis term.

    Latent-asset unlocks surface in 8-K/10-K language before the market reprices —
    on-thesis for the 'bishop nobody saw' arbitrage pattern. Free, official API."""
    try:
        import datetime as _dt
        end = _dt.date.today()
        start = end - _dt.timedelta(days=30)
        r = httpx.get(
            "https://efts.sec.gov/LATEST/search-index",
            params={"q": f'"{query}"', "forms": "8-K", "startdt": start.isoformat(), "enddt": end.isoformat()},
            headers={"User-Agent": "doppl-discovery research michaelghabermas@gmail.com"},
            timeout=20,
        )
        r.raise_for_status()
        hits = r.json().get("hits", {}).get("hits", [])
        out = []
        for h in hits[:limit]:
            s = h.get("_source", {})
            names = "; ".join(s.get("display_names", [])) or "Unknown filer"
            acc = h.get("_id", "")
            out.append(
                _item(
                    source="sec-edgar",
                    url=f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&output=atom",
                    title=f"{names} — {s.get('file_type','filing')} mentioning '{query}'",
                    raw_text=f"{names} filed a {s.get('file_type','')} on {s.get('file_date','')} "
                    f"whose text references '{query}'. A filing-level signal that this company is "
                    f"positioning around the theme — potential latent-asset / re-rating candidate.",
                    timestamp=s.get("file_date", ""),
                    surface_metrics={"form": s.get("file_type"), "accession": acc[:30]},
                )
            )
        if not out:
            raise ValueError("no hits")
        return out
    except Exception as e:
        return [{"__error__": f"sec-edgar: {type(e).__name__}: {e}"}]


def harvest_youtube(limit: int = 5, query: str = "AI startup ideas") -> list[dict]:
    """YouTube — two signals. The FREE Data API gives the trend signal (what's
    surging); Gemini CLI (dispatch tier) digests the few videos worth understanding.

    Without a YOUTUBE_API_KEY this reports unreachable and the recipe flags the
    dispatch/connector need — exactly the 'route to Gemini' design."""
    import os
    key = os.environ.get("YOUTUBE_API_KEY", "").strip()
    if not key:
        return [{"__error__": "youtube: no YOUTUBE_API_KEY (recipe: dispatch:gemini-cli or add key)"}]
    try:
        r = httpx.get(
            "https://www.googleapis.com/youtube/v3/search",
            params={"part": "snippet", "q": query, "maxResults": limit, "order": "viewCount",
                    "type": "video", "key": key},
            headers=UA, timeout=15,
        )
        r.raise_for_status()
        out = []
        for it in r.json().get("items", [])[:limit]:
            sn = it.get("snippet", {})
            vid = it.get("id", {}).get("videoId", "")
            title = sn.get("title", "")
            out.append(
                _item(
                    source="youtube",
                    url=f"https://www.youtube.com/watch?v={vid}",
                    title=title,
                    raw_text=f"{title}\n\n{sn.get('description','')}\n\nChannel: {sn.get('channelTitle','')}. "
                    f"(For deep content, the recipe routes transcript digestion to Gemini CLI.)",
                    timestamp=sn.get("publishedAt", ""),
                    surface_metrics={"channel": sn.get("channelTitle")},
                )
            )
        return out
    except Exception as e:
        return [{"__error__": f"youtube: {type(e).__name__}: {e}"}]


def harvest_google_trends(limit: int = 6, geo: str = "US") -> list[dict]:
    """Google Trends daily trending — the purest datable why-now signal.

    Uses the unofficial daily-trends endpoint (fragile by nature; the recipe
    self-heal exists precisely for when Google changes it)."""
    try:
        r = httpx.get(
            "https://trends.google.com/trends/api/dailytrends",
            params={"hl": "en-US", "tz": "-120", "geo": geo},
            headers=UA, timeout=15,
        )
        r.raise_for_status()
        # Google prefixes JSON with ")]}'," — strip it
        text = r.text
        text = text[text.find("{"):]
        data = json.loads(text)
        days = data.get("default", {}).get("trendingSearchesDays", [])
        out = []
        for day in days[:1]:
            for t in day.get("trendingSearches", [])[:limit]:
                title = t.get("title", {}).get("query", "")
                if not title:
                    continue
                traffic = t.get("formattedTraffic", "")
                snippet = ""
                arts = t.get("articles", [])
                if arts:
                    snippet = arts[0].get("title", "") + " — " + arts[0].get("snippet", "")
                out.append(
                    _item(
                        source="google-trends",
                        url=f"https://trends.google.com/trends/explore?q={title.replace(' ', '+')}",
                        title=f"Breakout search: {title} ({traffic})",
                        raw_text=f"'{title}' is a breakout search term right now ({traffic} searches). "
                        f"A datable why-now signal: something just crossed a threshold of public attention. "
                        f"Context: {snippet}",
                        surface_metrics={"traffic": traffic},
                    )
                )
        if not out:
            raise ValueError("no trends parsed")
        return out
    except Exception as e:
        return [{"__error__": f"google-trends: {type(e).__name__}: {e}"}]


def harvest_producthunt(limit: int = 4) -> list[dict]:
    items: list[dict] = []
    try:
        r = httpx.get("https://www.producthunt.com/feed", headers=UA, timeout=15)
        r.raise_for_status()
        # crude RSS parse — title + description per <item>
        entries = re.findall(r"<item>(.*?)</item>", r.text, re.S)
        for e in entries[:limit]:
            t = re.search(r"<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</title>", e, re.S)
            link = re.search(r"<link>(.*?)</link>", e, re.S)
            desc = re.search(r"<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</description>", e, re.S)
            if not t:
                continue
            title = re.sub("<[^>]+>", "", t.group(1)).strip()
            body = re.sub("<[^>]+>", "", desc.group(1)).strip() if desc else title
            items.append(
                _item(
                    source="producthunt",
                    url=link.group(1).strip() if link else "https://www.producthunt.com/",
                    title=title,
                    raw_text=f"{title}\n\n{body}",
                    surface_metrics={},
                )
            )
        if not items:
            raise ValueError("empty feed")
    except Exception:
        # fail soft to a tiny fixture so the demo always has a PH lane
        return [
            _item(
                source="producthunt",
                url=url,
                title=title,
                raw_text=f"{title}\n\n{body}",
                surface_metrics={"fixture": True},
            )
            for (title, url, body) in _PH_FALLBACK[:limit]
        ]
    return items
