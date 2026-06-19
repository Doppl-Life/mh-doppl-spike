# Case Study: Superyacht Connectivity Continuity After Starlink

## Summary

A charter guest paying roughly $2 million a week expects land-identical internet everywhere the yacht goes — their Instagram, calls, and streams must never stutter. Starlink collapsed the old economics of yacht connectivity, taking what used to cost about $30,000 a month on bulky VSAT domes down to a couple hundred dollars a month. So the obvious move is "just install Starlink and rip out the old gear." But Starlink does not cover everywhere, and for this guest a single dropped connection is a failure. The non-obvious reframe is that the product was never cheap, fast internet — it is uninterrupted experience. The real solution keeps redundant links and adds an automatic, invisible failover layer so the connection never perceptibly drops, which means you deliberately keep paying for the "obsolete" expensive backup precisely because seamlessness, not bandwidth or price, is the deliverable.

This is a strong Doppl case study because the cheap, obvious answer is technically correct yet solves the wrong objective, the constraints are real, and there is a known, defensible solution to validate against.

## Source

### Type

Transcript and expert recollection.

### Origin

Derived from a conversation with a superyacht-industry domain expert describing how Starlink decimated the VSAT segment, and how the real engineering problem shifted from raw connectivity to guaranteed continuity for guests with extreme expectations.

### Source File

`scratchpad/case-studies/Jack-syn-6-18`

### Derived By

Doppl capstone team.

### Fidelity

Summarized.

### Source Notes

The source transcript is conversational and spans many yacht topics. This writeup isolates the connectivity-continuity case while preserving the core problem, constraints, failed approach, and known solution pattern.

## Visibility

### Level

Internal.

### Anonymized

Yes.

### Public Summary Allowed

Yes, if framed as a hypothetical but realistic superyacht connectivity case and stripped of identifying details.

### Sensitive Details

- Names or identifying details of owners, guests, charter clients, or vendors.
- Exact pricing, contracts, or operating details that could identify a real client.

### Sharing Notes

Use as a capstone evaluation case and demo artifact. Public versions should keep the scenario anonymized and emphasize the reasoning pattern rather than specific commercial terms.

## Problem

### Statement

A guest paying enormous sums expects the same uninterrupted internet they have at home, everywhere the yacht travels. Starlink now provides cheap, fast connectivity, but it has coverage gaps, and even a momentary drop is unacceptable. How do you guarantee continuity rather than just provide connectivity?

### Background

For decades, yacht internet meant expensive VSAT — large tracking domes and dedicated satellite capacity costing tens of thousands per month. Starlink upended that, delivering comparable everyday performance for a tiny fraction of the price. The temptation is to treat connectivity as a solved, commoditized problem. But yachts travel to places Starlink does not reliably cover, and the guest's expectation is land parity with zero perceptible interruption.

### Why It Matters

The superyacht promise is that nothing onboard feels worse than home. A guest paying $2 million a week who watches their feed freeze experiences a product failure, regardless of how cheap the underlying bandwidth became. The job to be done is continuity, not megabits.

### Current State

Operators either keep legacy VSAT, adopt Starlink, or run both without an intelligent layer that hands off between them seamlessly. A naive single-link setup drops when that link loses coverage.

### Impact

If unsolved:

- The guest experiences visible outages and judges the entire vessel by them.
- Operators may over-invest in a single technology and still fail in coverage gaps.
- The business misreads a price collapse as a reason to stop engineering for reliability.

### Scope

This case focuses on guaranteeing continuous connectivity for guests aboard a moving yacht with extreme uptime expectations. It does not cover cybersecurity, onboard network design beyond continuity, or shoreside infrastructure.

## Purpose

### Goal

Use the Starlink disruption to test whether Doppl can see past the cheap, obvious answer and identify the real objective — continuity — and a constraint-aware solution.

### Questions

- Can a system recognize that "just use Starlink" solves the wrong objective?
- Can it identify continuity and seamless failover as the actual requirement?
- Can it justify deliberately keeping an expensive backup for reliability?

### Success Criteria

A strong generated answer should:

- Reframe the goal from cheap/fast connectivity to uninterrupted experience.
- Propose multiple bearers (Starlink plus VSAT and/or cellular) with automatic failover.
- Prioritize seamless, session-preserving handoff so apps do not drop.
- Explain why the redundant expensive link is retained on purpose.

### Audience

Doppl builders and evaluators who need a realistic, expert-grounded problem/solution pair for testing idea generation.

## User

### Name Or Role

Yacht owner, charter manager, or AV/IT integrator responsible for guest connectivity.

### Goals

- Deliver land-identical, uninterrupted internet everywhere the yacht goes.
- Avoid any perceptible outage for guests.
- Control cost without sacrificing reliability.

### Needs

- Coverage across regions where any single provider has gaps.
- Automatic, invisible switching between links.
- Session persistence so streams and calls do not drop on handoff.

### Pain Points

- Starlink alone has coverage gaps.
- Manual switching is too slow; the guest notices.
- A price collapse tempts operators to drop redundancy entirely.

## Environment

### Setting

A yacht underway across varied regions and latitudes, carrying guests with extreme uptime expectations.

### Tools Or Systems

- Starlink terminal(s).
- Legacy VSAT and/or alternative satellite capacity.
- Cellular (4G/5G) near shore.
- A routing/steering layer capable of multi-bearer bonding and failover.

### Inputs

- Knowledge that Starlink is cheap and fast but not universal.
- A guest expectation of zero perceptible downtime.
- Existing onboard network and provider options.

### External Factors

- Satellite coverage maps and regional availability.
- Maritime licensing and IMO regulation.
- Rapidly shifting provider economics.

### Assumptions

- Multiple bearers are available to combine.
- Handoff between bearers can be made fast enough to be imperceptible.
- The guest values reliability over cost.

## Constraints

### Coverage Gaps

No single provider — including Starlink — covers everywhere the yacht goes.

**Rationale:** A single-bearer solution will eventually enter a region where that bearer is weak or absent, producing exactly the outage the guest will not tolerate.

### Zero Perceptible Downtime

The guest's standard is land parity: the connection must never visibly drop, even for seconds.

**Rationale:** The product is the experience; a perceptible gap is a product failure regardless of underlying cost or speed.

### Seamless Handoff, Not Just Redundancy

Having multiple links is insufficient if switching between them drops active sessions.

**Rationale:** Manual or slow failover still interrupts streams and calls; the value is in invisible, session-preserving handoff.

### Cost And Footprint Are Secondary But Real

Reliability outranks cost, but hardware footprint (domes) and licensing still matter.

**Rationale:** Owners want reliability without an ugly or non-compliant installation; the solution must respect physical and regulatory limits.

## Failed Attempts

### Starlink-Only Replacement

**Approach:** Rip out VSAT and rely solely on Starlink because it is far cheaper and fast.

**Outcome:** Works most of the time, fails in coverage gaps.

**Why It Failed:** A single dropped connection violates the actual requirement; cheap and fast solved the wrong objective.

**Lesson:** The goal is continuity, not the lowest-cost pipe.

### Manual Switching Between Links

**Approach:** Keep multiple links and switch manually when one degrades.

**Outcome:** The guest experiences a visible gap during the switch.

**Why It Failed:** Human-speed failover is too slow to be imperceptible.

**Lesson:** Continuity requires automatic, session-preserving handoff.

### Single-Provider Redundancy

**Approach:** Add a second terminal from the same provider for resilience.

**Outcome:** Improves hardware resilience but not coverage diversity.

**Why It Failed:** Shares the same coverage profile, so regional gaps remain.

**Lesson:** Redundancy must span different bearers, not just duplicate one.

## Solution

### Summary

Treat connectivity as a continuity problem. Run multiple diverse bearers — Starlink plus VSAT and/or cellular near shore — behind an intelligent routing layer that bonds and steers traffic and fails over automatically, preserving sessions so apps never visibly drop. Keep the expensive backup on purpose: it is insurance for the coverage gaps where the cheap link fails. The deliverable is invisible seamlessness, and the value migrates from the pipe to the switching.

### Details

1. Provision diverse bearers with complementary coverage (Starlink, VSAT/alternative satellite, cellular near shore).
2. Place an SD-WAN-style routing/steering layer in front that monitors link health continuously.
3. Bond or prioritize links and fail over automatically when one degrades, preserving active sessions.
4. Retain the higher-cost backup specifically for regions where the primary bearer is weak.
5. Tune for latency-sensitive applications (calls, live streams) so handoff is imperceptible.

### Why This Solution

"Just use Starlink" optimizes cost and speed, which were never the real objective. The objective is uninterrupted experience for a guest who will judge the entire vessel by a single dropped frame. Multi-bearer connectivity with automatic, session-preserving failover delivers continuity, and deliberately keeping the expensive backup is the rational price of guaranteeing it. The insight is that a price collapse in bandwidth did not eliminate the hard problem; it moved the problem from the pipe to the seamless switching between pipes.

### Tradeoffs

- Higher cost than Starlink-only, by design.
- Requires an intelligent routing layer and ongoing tuning.
- Hardware footprint and licensing must be managed.

### Expected Outcome

The guest experiences continuous, land-parity connectivity everywhere the yacht travels, with no perceptible outage, because the system fails over invisibly between diverse bearers.

### Next Steps

- Select the bearer mix appropriate to the yacht's itinerary.
- Choose a routing/steering platform that preserves sessions on failover.
- Define latency budgets for calls and live streaming.
- Validate against the regions and conditions where outages are most likely.

## Reproducible

### Is Reproducible

Yes, approximately.

### Reproducibility Level

Approximate.

### Steps

1. Provide the problem: a guest expects land-identical, uninterrupted internet everywhere; Starlink exists but has coverage gaps and any drop is unacceptable.
2. Give the constraints: coverage gaps, zero perceptible downtime, seamless handoff required, cost secondary to reliability.
3. Ask a model or team to propose solutions without the known answer.
4. Score whether the answer reframes the goal to continuity and proposes multi-bearer automatic failover.
5. Compare against the known solution: diverse bearers plus a session-preserving steering/failover layer, with the expensive backup retained on purpose.

### Required Inputs

- The connectivity-continuity problem statement.
- Itinerary and coverage context.
- Constraints around downtime, handoff, and cost priority.
- The known solution for evaluator-only comparison.

### Expected Result

A strong system should converge on continuity via multi-bearer automatic failover rather than recommending "just install Starlink."

### Known Variability

Generated answers may differ in the specific bearer mix and routing platform. These can still be directionally correct if they reframe the objective to uninterrupted experience and propose seamless, diverse-bearer failover.

## Validator

### Name Or Role

Superyacht-industry connectivity domain expert or AV/IT integrator.

### Relationship To Case

Supplied the original disruption story and can judge whether proposed answers are plausible for real guest expectations and operating conditions.

### Can Validate

- Domain plausibility.
- Whether the answer reframes connectivity as continuity.
- Operational fit for guest expectations and yacht itineraries.
- Whether the solution is meaningfully better than the cheap, obvious answer.

### Validation Method

Async feedback or live review.

### Notes

The validator is useful for judging directionality and realism, not as an authority on specific commercial terms or licensing.

## Open Questions

- Which bearer mix best fits a given itinerary and budget?
- How seamless does handoff need to be for latency-sensitive apps to feel uninterrupted?
- What is the acceptable cost envelope for retained redundancy?
- How should the design change for remote regions with poor coverage of every bearer?

## Notes

This case should be handled carefully because the superyacht domain is secretive and NDA-constrained. Frame it as a hypothetical but realistic connectivity scenario inspired by expert conversation. The useful evaluation target is the reframe from connectivity to continuity, not any identifying commercial detail.
