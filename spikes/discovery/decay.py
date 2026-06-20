"""Why-now decay — the feed gets a metabolism.

The two subtypes age completely differently:
  - cross_domain_transfer is TIMING-AGNOSTIC: the airport-liquid nudge is as good
    next year as today. It barely decays.
  - zeitgeist_synthesis is built on a DATED signal — its whole value is "true right
    now because a threshold just crossed." Its why-now window is short, so it ROTS:
    weeks later it may be consensus (priced in) or falsified.

Without decay, an always-on hourly harvester just accumulates an ever-staler pile.
With it, the feed self-freshens: fresh signal rises, dead signal sinks — exactly the
organism metaphor doppl is built on. This is the metabolic counterpart to the
±5-year discriminator: that test *classifies* timing-dependence; this one *acts* on it.

Decay multiplies the (signed) lens score by an age factor in (0, 1]:
    effective = lens_score * 0.5 ** (age_days / half_life_days[subtype])
Positive scores fade toward 0; negative (trap) scores also fade toward 0 — a trap
flagged long ago is less urgent than a fresh one, which is the right behavior.

Pure function over the `harvested_at` timestamp already in the feed. No deps.
"""

from __future__ import annotations

from datetime import datetime, timezone

# Half-life in DAYS, by subtype. Tunable. The gap is the whole point:
#   zeitgeist windows are short (a why-now goes consensus in weeks);
#   transfers are durable (a mechanism analogy lasts years).
HALF_LIFE_DAYS = {
    "zeitgeist_synthesis": 14.0,      # ~2 weeks: half its value gone in a fortnight
    "cross_domain_transfer": 3650.0,  # ~10 years: effectively timeless
    "neither": 60.0,                  # moderate: a non-thesis item goes stale-ish
}

# A zeitgeist candidate whose effective score falls below this AND was never
# promoted is considered to have missed its window -> auto-expire (see ledgers).
EXPIRE_FLOOR = 1.0
EXPIRE_MIN_AGE_DAYS = 21.0  # don't expire anything younger than this, regardless


def _parse(ts: str) -> datetime | None:
    if not ts:
        return None
    try:
        # tolerate trailing Z
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except ValueError:
        return None


def age_days(harvested_at: str, now: datetime | None = None) -> float:
    now = now or datetime.now(timezone.utc)
    t = _parse(harvested_at)
    if t is None:
        return 0.0
    if t.tzinfo is None:
        t = t.replace(tzinfo=timezone.utc)
    return max(0.0, (now - t).total_seconds() / 86400.0)


def decay_factor(subtype: str, age: float) -> float:
    hl = HALF_LIFE_DAYS.get(subtype, HALF_LIFE_DAYS["neither"])
    return 0.5 ** (age / hl)


def effective_score(lens_score: float, subtype: str, harvested_at: str, now: datetime | None = None) -> float:
    """Signed lens score scaled by age-decay. Rounded to 2dp."""
    age = age_days(harvested_at, now)
    return round(lens_score * decay_factor(subtype, age), 2)


def annotate(item_row: dict, now: datetime | None = None) -> dict:
    """Add age_days, decay_factor, effective_score to a candidate-feed row."""
    age = age_days(item_row.get("harvested_at", ""), now)
    st = item_row.get("subtype", "neither")
    df = decay_factor(st, age)
    eff = round(item_row.get("lens_score", 0) * df, 2)
    return {**item_row, "age_days": round(age, 2), "decay_factor": round(df, 3), "effective_score": eff}


def should_expire(item_row: dict, status: str | None, now: datetime | None = None) -> bool:
    """A zeitgeist candidate that missed its window: decayed past the floor, old
    enough to judge, and never promoted. Transfers never expire on timing."""
    if item_row.get("subtype") != "zeitgeist_synthesis":
        return False
    if status == "promoted":
        return False  # a promoted idea is out of the pool; don't expire it
    age = age_days(item_row.get("harvested_at", ""), now)
    if age < EXPIRE_MIN_AGE_DAYS:
        return False
    eff = effective_score(item_row.get("lens_score", 0), item_row["subtype"], item_row.get("harvested_at", ""), now)
    return eff < EXPIRE_FLOOR
