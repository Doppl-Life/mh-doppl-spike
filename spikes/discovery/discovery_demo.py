#!/usr/bin/env python3
"""Discovery spike — the pointing finger, end to end.

  harvest (corpus + YC/HN/PH)  ->  brain (recover + classify + score)
  ->  ledgers (feed / source registry / exemplar keep)  ->  ranked feed + HTML trace

The spike proves the INTERESTING half — the classify-and-rank brain — on a known
corpus plus a small live batch, with zero scraper-plumbing risk. A held-out check
scores the subtype classifier against the corpus's own declared tags.

Usage:
  ./demo                          # corpus + live YC/HN/PH, capstone-demo-fit lens
  ./demo --lens arbitrage         # swap the scoring lens
  ./demo --corpus-only            # offline: corpus fixtures only
  ./demo --limit-corpus 8         # cap corpus items (speed)
  ./demo --no-open                # don't open the HTML trace
"""

from __future__ import annotations

import argparse
import os
import sys
import webbrowser
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import httpx
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

import harvest
import recipes as recipe_ledger
from brain import LENSES, analyze_item
from fetch import enrich_thin_items
from ledgers import (
    promotion_rates,
    update_source_registry,
    write_candidate_feed,
    write_exemplar_keep,
    write_trap_register,
)

console = Console()
HERE = Path(__file__).resolve().parent


def load_key() -> str:
    load_dotenv(HERE / ".env")
    load_dotenv(HERE.parents[1] / ".env")  # repo-root fallback
    key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not key:
        console.print("[red]Missing OPENROUTER_API_KEY[/] — cp .env.example .env and add your key.")
        sys.exit(1)
    return key


def gather_items(args) -> tuple[list[dict], dict[str, str]]:
    items: list[dict] = []
    errors: dict[str, str] = {}

    if args.limit_corpus == 0:
        console.print("  corpus:case-studies  [dim]skipped (--limit-corpus 0)[/]")
    else:
        corpus = harvest.harvest_corpus(limit=args.limit_corpus)
        items += corpus
        console.print(f"  corpus:case-studies  [green]{len(corpus)}[/] items")

    if not args.corpus_only:
        roster = [
            ("yc-rfs", lambda: harvest.harvest_yc_rfs(limit=5)),
            ("hackernews", lambda: harvest.harvest_hn(limit=args.limit_hn)),
            ("lobsters", lambda: harvest.harvest_lobsters(limit=6)),
            ("github-trending", lambda: harvest.harvest_github_trending(limit=6)),
            ("arxiv", lambda: harvest.harvest_arxiv(limit=5)),
            ("sec-edgar", lambda: harvest.harvest_sec_edgar(limit=5)),
            ("google-trends", lambda: harvest.harvest_google_trends(limit=5)),
            ("youtube", lambda: harvest.harvest_youtube(limit=5)),
            ("producthunt", lambda: harvest.harvest_producthunt(limit=4)),
            ("reddit:startups", lambda: harvest.harvest_reddit(limit=5, subreddit="startups")),
        ]
        recipe_ledger.ensure_seeded()
        for name, fn in roster:
            got = fn()
            if got and isinstance(got[0], dict) and got[0].get("__error__"):
                errors[name] = got[0]["__error__"]
                recipe_ledger.record_outcome(name, ok=False, detail=got[0]["__error__"][:120])
                console.print(f"  {name:20} [yellow]unreachable[/] ({got[0]['__error__'][:48]})")
                continue
            items += got
            recipe_ledger.record_outcome(name, ok=True)
            console.print(f"  {name:20} [green]{len(got)}[/] items")

    # fetch ladder: enrich thin items (free -> firecrawl -> browser seam)
    if not args.no_enrich:
        with console.status("[cyan]Enriching thin items via the fetch ladder…"):
            items = enrich_thin_items(items, enabled=True)
        tiers = {}
        for it in items:
            tiers[it.get("fetch_tier", "free")] = tiers.get(it.get("fetch_tier", "free"), 0) + 1
        if any(t != "free" for t in tiers):
            console.print(f"  [dim]fetch tiers: {tiers}[/]")
    return items, errors


def run_brain(items: list[dict], key: str, lens: str) -> list[dict]:
    out: list[dict] = []
    with console.status(f"[cyan]Running the brain on {len(items)} items (lens: {lens})…"):
        with httpx.Client(timeout=90) as client:
            with ThreadPoolExecutor(max_workers=6) as pool:
                futs = [pool.submit(analyze_item, it, key, lens, client) for it in items]
                for f in futs:
                    out.append(f.result())
    return out


def verify_classifier(analyzed: list[dict]) -> tuple[int, int, list[str]]:
    """Held-out check: classifier vs the corpus's own declared subtype tags."""
    correct = total = 0
    misses: list[str] = []
    for it in analyzed:
        known = it.get("known_subtype")
        a = it.get("analysis")
        if not known or not a:
            continue
        total += 1
        if a["subtype"] == known:
            correct += 1
        else:
            misses.append(f"{it['title'][:42]} — got {a['subtype']}, expected {known}")
    return correct, total, misses


def print_feed(analyzed: list[dict], lens: str) -> None:
    ranked = sorted(
        [a for a in analyzed if a.get("analysis")],
        key=lambda x: (x["analysis"]["lens_score"], x["analysis"]["confidence"]),
        reverse=True,
    )  # signed sort: negatives sink to the bottom
    table = Table(title=f"Ranked candidate feed — lens: {lens}", show_lines=False, expand=True)
    table.add_column("#", justify="right", style="dim", width=3)
    table.add_column("Score", justify="center", width=5)
    table.add_column("Subtype", width=12)
    table.add_column("Disp", width=9)
    table.add_column("Source", width=18)
    table.add_column("Opportunity", overflow="fold")

    subtype_short = {"cross_domain_transfer": "transfer", "zeitgeist_synthesis": "zeitgeist", "neither": "—"}
    disp_short = {"open": "→ Doppl", "resolved_exemplar": "→ keep"}
    for i, it in enumerate(ranked, 1):
        a = it["analysis"]
        score = a["lens_score"]
        if score >= 4:
            color, sign = "green", f"+{score}"
        elif score >= 1:
            color, sign = "yellow", f"+{score}"
        elif score == 0:
            color, sign = "white", "0"
        else:
            color, sign = "red", str(score)  # negative already has its sign
        trap = " [red]⚠[/]" if a.get("is_trap") else ""
        table.add_row(
            str(i),
            f"[{color}]{sign}[/]{trap}",
            subtype_short.get(a["subtype"], a["subtype"]),
            disp_short.get(a["disposition"], a["disposition"]),
            it["source"].replace("corpus:case-studies", "corpus"),
            f"[bold]{a['title']}[/]\n[dim]{a['why_it_might_matter']}[/]",
        )
    console.print(table)


def write_html(analyzed: list[dict], lens: str, registry: dict, acc: tuple) -> Path:
    ranked = sorted(
        [a for a in analyzed if a.get("analysis")],
        key=lambda x: x["analysis"]["lens_score"],
        reverse=True,
    )
    correct, total, misses = acc
    acc_str = f"{correct}/{total} ({round(100*correct/total) if total else 0}%)"

    def esc(s) -> str:
        if isinstance(s, dict):
            s = " · ".join(f"{k}: {v}" for k, v in s.items())
        elif isinstance(s, (list, tuple)):
            s = "; ".join(str(x) for x in s)
        return (str(s) if s is not None else "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    cards = []
    for it in ranked:
        a = it["analysis"]
        pr = a["problem_recovery"]
        score = a["lens_score"]
        if score >= 4:
            color = "#1b5e20"
        elif score >= 1:
            color = "#8a6d00"
        elif score == 0:
            color = "#30363d"
        else:
            color = "#7d1a1a"  # negative = trap
        disp_score = f"+{score}" if score > 0 else str(score)
        trap_badge = ' <span class="known miss">⚠ trap</span>' if a.get("is_trap") else ""
        known = it.get("known_subtype")
        tag = ""
        if known:
            ok = known == a["subtype"]
            tag = f'<span class="known {"ok" if ok else "miss"}">ground truth: {known} {"✓" if ok else "✗"}</span>'
        cards.append(f"""
        <div class="card">
          <div class="head">
            <span class="score" style="background:{color}">{disp_score}</span>
            <span class="title">{esc(a['title'])}{trap_badge}</span>
            <span class="pills">
              <span class="pill">{a['subtype']}</span>
              <span class="pill disp">{a['disposition']}</span>
              <span class="pill src">{esc(it['source'])}</span>
              {tag}
            </span>
          </div>
          <p class="why">{esc(a['why_it_might_matter'])}</p>
          <div class="pr">
            <div><b>stated symptom</b> {esc(pr.get('stated_problem_or_symptom',''))}</div>
            <div><b>hidden variable</b> {esc(pr.get('hidden_variable',''))}</div>
            <div><b>actual problem</b> {esc(pr.get('actual_problem',''))}</div>
          </div>
          <div class="meta">lens: {esc(a['lens_reason'])} · subtype: {esc(a['subtype_reason'])}</div>
        </div>""")

    reg_rows = "".join(
        f"<tr><td>{esc(r['source'])} <span class='lenscol'>@ {esc(r['lens'])}</span></td>"
        f"<td>{r['cumulative_volume']}</td><td>{r['cumulative_hits']}</td>"
        f"<td>{r.get('cumulative_traps',0)}</td><td>{r.get('avg_score')}</td>"
        f"<td class='st-{r['status']}'>{r['status']}</td></tr>"
        for _, r in sorted(registry.items(), key=lambda kv: (kv[1].get("avg_score") or -99), reverse=True)
    )

    html = f"""<!doctype html><html><head><meta charset="utf-8">
<title>Doppl Discovery — ranked feed</title>
<style>
  body {{ font:15px/1.5 -apple-system,system-ui,sans-serif; background:#0d1117; color:#e6edf3; margin:0; padding:32px; }}
  h1 {{ font-size:22px; margin:0 0 4px; }}
  .sub {{ color:#8b949e; margin:0 0 24px; }}
  .banner {{ background:#161b22; border:1px solid #30363d; border-radius:8px; padding:12px 16px; margin-bottom:24px; }}
  .banner b {{ color:#58a6ff; }}
  .card {{ background:#161b22; border:1px solid #30363d; border-radius:10px; padding:16px 18px; margin-bottom:14px; }}
  .head {{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; }}
  .score {{ color:#fff; font-weight:700; width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; }}
  .title {{ font-size:17px; font-weight:600; }}
  .pills {{ display:flex; gap:6px; flex-wrap:wrap; margin-left:auto; }}
  .pill {{ font-size:11px; padding:3px 8px; border-radius:20px; background:#21262d; color:#8b949e; border:1px solid #30363d; }}
  .pill.disp {{ color:#7ee787; }} .pill.src {{ color:#79c0ff; }}
  .known {{ font-size:11px; padding:3px 8px; border-radius:20px; }}
  .known.ok {{ background:#0f3d1a; color:#7ee787; }} .known.miss {{ background:#3d1a1a; color:#ff7b72; }}
  .why {{ margin:10px 0; }}
  .pr {{ background:#0d1117; border-radius:8px; padding:10px 12px; font-size:13px; color:#c9d1d9; }}
  .pr div {{ margin:3px 0; }} .pr b {{ color:#8b949e; display:inline-block; min-width:120px; }}
  .meta {{ font-size:12px; color:#6e7681; margin-top:8px; font-style:italic; }}
  table {{ width:100%; border-collapse:collapse; background:#161b22; border-radius:8px; overflow:hidden; margin-top:8px; }}
  th,td {{ text-align:left; padding:8px 12px; border-bottom:1px solid #21262d; font-size:13px; }}
  th {{ color:#8b949e; }}
  .st-productive {{ color:#7ee787; }} .st-looks_good_but_isnt,.st-polluting {{ color:#ff7b72; }}
  .st-unproven,.st-marginal {{ color:#d29922; }} .st-unreachable {{ color:#6e7681; }}
  .lenscol {{ color:#6e7681; font-size:12px; }}
  h2 {{ font-size:16px; margin:28px 0 4px; }}
</style></head><body>
  <h1>Doppl Discovery — the pointing finger</h1>
  <p class="sub">harvest → recover the real problem → classify subtype → score through a lens</p>
  <div class="banner">
    Lens: <b>{lens}</b> — {esc(LENSES[lens]['one_liner'])}<br>
    Held-out classifier check (vs corpus ground-truth tags): <b>{acc_str}</b> ·
    {len(ranked)} candidates ranked
  </div>
  {''.join(cards)}
  <h2>Source registry — score the wells, per (source × lens)</h2>
  <p class="sub">where to look, learned from hit-rate. <b>polluting</b> = produces more traps than hits.</p>
  <table><tr><th>source @ lens</th><th>volume</th><th>hits</th><th>traps</th><th>avg</th><th>status</th></tr>{reg_rows}</table>
</body></html>"""
    path = HERE / "discovery_trace.html"
    path.write_text(html, encoding="utf-8")
    return path


def main() -> None:
    ap = argparse.ArgumentParser(description="Doppl discovery spike — the pointing finger")
    ap.add_argument("--lens", default="capstone-demo-fit", choices=list(LENSES))
    ap.add_argument("--corpus-only", action="store_true", help="offline: corpus fixtures only")
    ap.add_argument("--limit-corpus", type=int, default=10, help="cap corpus items (speed)")
    ap.add_argument("--limit-hn", type=int, default=6)
    ap.add_argument("--no-open", action="store_true")
    ap.add_argument("--no-enrich", action="store_true", help="skip the fetch-ladder enrichment pass")
    ap.add_argument("--reset", action="store_true", help="clear ledgers before running")
    args = ap.parse_args()

    if args.reset:
        from ledgers import LEDGER_DIR
        if LEDGER_DIR.exists():
            for p in LEDGER_DIR.iterdir():
                # truncate rather than unlink — works even when the sandbox
                # forbids deleting files created by a prior subprocess
                try:
                    p.write_text("" if p.suffix == ".jsonl" else "{}", encoding="utf-8")
                except OSError:
                    try:
                        p.unlink()
                    except OSError:
                        pass
            console.print("[dim]ledgers reset[/]")

    key = load_key()
    console.print(Panel.fit("[bold]Doppl Discovery Spike[/] — point → (Doppl checks) → (expressions validate)", border_style="cyan"))

    console.print("[bold]Harvesting…[/]")
    items, errors = gather_items(args)
    if not items:
        console.print("[red]No items harvested.[/]")
        sys.exit(1)
    console.print(f"  [bold]{len(items)}[/] items total\n")

    analyzed = run_brain(items, key, args.lens)
    n_ok = sum(1 for a in analyzed if a.get("analysis"))
    n_bad = len(analyzed) - n_ok
    console.print(f"Analyzed [green]{n_ok}[/] ok" + (f", [red]{n_bad}[/] failed" if n_bad else "") + "\n")

    feed_path = write_candidate_feed(analyzed)
    reg_path, registry = update_source_registry(analyzed, errors)
    exe_path = write_exemplar_keep(analyzed)
    trap_path, n_traps = write_trap_register(analyzed)

    # why-now decay sweep: auto-expire zeitgeist candidates that missed their window
    from ledgers import sweep_expired
    n_expired = sweep_expired()
    if n_expired:
        console.print(f"[dim]⏳ {n_expired} stale zeitgeist candidate(s) auto-expired (why-now window closed)[/]")

    print_feed(analyzed, args.lens)

    acc = verify_classifier(analyzed)
    correct, total, misses = acc
    console.print()
    if total:
        pct = round(100 * correct / total)
        col = "green" if pct >= 80 else "yellow" if pct >= 60 else "red"
        console.print(Panel.fit(
            f"[bold]Held-out classifier check[/] (vs corpus ground-truth tags)\n"
            f"[{col}]{correct}/{total} correct ({pct}%)[/]"
            + ("\n[dim]misses:\n  " + "\n  ".join(misses) + "[/]" if misses else ""),
            border_style=col,
        ))

    # trap register summary
    if n_traps:
        traps = sorted(
            [a for a in analyzed if a.get("analysis") and a["analysis"].get("is_trap")],
            key=lambda x: x["analysis"]["lens_score"],
        )
        lines = [
            f"[red]{t['analysis']['lens_score']}[/] {t['analysis']['title'][:48]} "
            f"[dim]({t['source']})[/]\n    [dim]{t['analysis'].get('trap_reason','')[:90]}[/]"
            for t in traps[:6]
        ]
        console.print(Panel("\n".join(lines), title=f"⚠ Trap register — {n_traps} flagged (fed to amemetics)", border_style="red"))

    # source registry summary — per (source x lens), the "where to look" answer
    reg_tbl = Table(title="Source registry — score the wells, per lens", expand=True)
    for c in ["source @ lens", "vol", "hits", "traps", "avg", "status"]:
        reg_tbl.add_column(c)
    status_color = {
        "productive": "green", "looks_good_but_isnt": "red", "polluting": "red",
        "unproven": "yellow", "marginal": "yellow", "unreachable": "dim",
    }
    for key, r in sorted(registry.items(), key=lambda kv: (kv[1].get("avg_score") or -99), reverse=True):
        c = status_color.get(r["status"], "white")
        label = f"{r['source']} @ {r['lens']}"
        reg_tbl.add_row(
            label, str(r["cumulative_volume"]), str(r["cumulative_hits"]),
            str(r.get("cumulative_traps", 0)), str(r.get("avg_score")),
            f"[{c}]{r['status']}[/]",
        )
    console.print(reg_tbl)

    # MCP/connector backlog — sources worth a dedicated integration (evidence-based)
    backlog = recipe_ledger.mcp_backlog(registry)
    if backlog:
        lines = [f"[yellow]{b['source']}[/] ([dim]{b['tier']}/{b['status']}[/]) → {b['mcp_candidate']}" for b in backlog]
        console.print(Panel("\n".join(lines), title="🔌 Connector backlog (valuable but hard to traverse)", border_style="yellow"))

    # evidence-gated unlock: walled sources that PROVED they pay (promotion rate)
    rates = promotion_rates()
    unlock = recipe_ledger.worth_unlocking(rates)
    if unlock:
        lines = [
            f"[green]{u['source']}[/] (promo-rate {u['promotion_rate']}, {u['tier']}-tier) "
            f"→ worth the cost: {u['mcp_candidate'] or 'unlock access'}"
            for u in unlock
        ]
        console.print(Panel("\n".join(lines), title="💎 Worth unlocking — evidence says spend the expensive access", border_style="green"))

    # realized value: promotion rate per source (if anything's been marked)
    if rates:
        pr_tbl = Table(title="Realized value — promotion rate per source", expand=True)
        for c in ["source", "marked", "promoted", "rejected", "promo-rate"]:
            pr_tbl.add_column(c)
        for src, d in sorted(rates.items(), key=lambda kv: kv[1]["promotion_rate"], reverse=True):
            pr_tbl.add_row(src, str(d["marked"]), str(d["promoted"]), str(d["rejected"]), str(d["promotion_rate"]))
        console.print(pr_tbl)
    else:
        console.print("[dim]No promotions yet — use ./mark <id> promoted|rejected (./mark --list to see ids)[/]")

    html = write_html(analyzed, args.lens, registry, acc)
    console.print(f"\n[dim]ledgers → {feed_path.parent}/  ·  trace → {html}[/]")
    if not args.no_open:
        webbrowser.open(f"file://{html}")


if __name__ == "__main__":
    main()
