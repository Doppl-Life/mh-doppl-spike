#!/usr/bin/env python3
"""Backtest the engine against reality — was it right?

Reads resolved candidates from `resolved.json` (known-outcome corpus or settled
markets) and reports calibration: do higher-scored theses come true more often?
Live resolution accrues as hourly runs age; this runs on what's already resolvable.

Each resolved entry: {title, lens_score, prediction, outcome: true|false|unknown}.

Usage:  ./backtest          (or python backtest.py)
"""

from __future__ import annotations

import json
import os
from pathlib import Path

from dotenv import load_dotenv

from reality import backtest

HERE = Path(__file__).resolve().parent


def main() -> None:
    load_dotenv(HERE / ".env")
    load_dotenv(HERE.parents[1] / ".env")
    key = os.environ.get("OPENROUTER_API_KEY", "")

    resolved_path = HERE / "resolved.json"
    if not resolved_path.exists():
        print("No resolved.json — create one with entries like:")
        print(json.dumps([{"title": "...", "lens_score": 4, "prediction": "...", "outcome": "true"}], indent=2))
        return
    resolved = json.loads(resolved_path.read_text(encoding="utf-8"))
    report = backtest(key, resolved)

    try:
        from rich.console import Console
        from rich.table import Table
        from rich.panel import Panel
        c = Console()
        c.print(Panel.fit(f"[bold]Backtest — was it right?[/]  ({report['n']} resolved candidates)", border_style="cyan"))
        t = Table(title="Calibration by score band", expand=True)
        for col in ["score band", "n", "resolved", "came true", "hit-rate"]:
            t.add_column(col)
        for band, d in report["bands"].items():
            t.add_row(band, str(d["n"]), str(d["resolved"]), str(d["came_true"]), str(d["hit_rate"]))
        c.print(t)
        verdict_color = "green" if report.get("calibrated") else "yellow"
        c.print(f"[{verdict_color}]• {report['verdict']}[/]")
        if report["fixtures"]:
            c.print(f"\n[bold]Benchmark fixtures[/] (resolved-correct, ≥+3) — feed these to doppl-prime's eval set:")
            for f in report["fixtures"]:
                c.print(f"  [green]✓[/] (+{f['lens_score']}) {f['title']}")
    except ImportError:
        print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
