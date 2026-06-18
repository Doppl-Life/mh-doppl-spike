# Case Study Schema

This schema defines the information needed to describe a case study clearly and consistently. It is intentionally simple: the case study should explain the situation, the person or group affected, the surrounding conditions, what was tried, what solution emerged, and whether someone else could reproduce the result.

## Case Study

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `title` | string | Yes | Short human-readable title for the case study. |
| `summary` | text | Yes | Brief overview of the case study in three to six sentences. |
| `problem` | object | Yes | The problem being studied. |
| `purpose` | object | Yes | Why this case study exists and what it is meant to show. |
| `constraints` | list<object> | Yes | Important limits, requirements, or tradeoffs. |
| `failed_attempts` | list<object> | Recommended | Prior approaches that did not work or were insufficient. |
| `user` | object | Yes | The person, group, or role affected by the problem. |
| `environment` | object | Yes | The context in which the problem and solution exist. |
| `solution` | object | Yes | The resulting answer, design, intervention, or recommendation. |
| `reproducible` | object | Yes | Whether and how the case study can be reproduced. |
| `notes` | text | Optional | Extra context that does not fit elsewhere. |

## Problem

The `problem` section explains what is wrong, missing, painful, confusing, expensive, risky, or unresolved.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `statement` | text | Yes | Plain-language description of the problem. |
| `background` | text | Recommended | Context someone needs before the problem makes sense. |
| `why_it_matters` | text | Yes | Why the problem is worth solving. |
| `current_state` | text | Recommended | How things work before the solution. |
| `impact` | text | Recommended | Consequences of leaving the problem unsolved. |
| `scope` | text | Recommended | What is included and excluded from this case study. |

## Purpose

The `purpose` section explains what the case study is trying to demonstrate or learn.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `goal` | text | Yes | Main goal of the case study. |
| `questions` | list<string> | Recommended | Questions the case study should answer. |
| `success_criteria` | list<string> | Recommended | Conditions that would make the case study successful. |
| `audience` | string | Optional | Who the case study is meant to inform. |

## Constraints

The `constraints` section records limits that shaped the solution.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | Yes | Short name for the constraint. |
| `description` | text | Yes | What the constraint is. |
| `type` | enum | Recommended | One of `time`, `budget`, `technical`, `legal`, `ethical`, `organizational`, `data`, `user`, `other`. |
| `effect` | text | Recommended | How the constraint changed the solution or process. |

## Failed Attempts

The `failed_attempts` section records approaches that were tried before or considered and rejected.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | Yes | Name or short label for the attempt. |
| `approach` | text | Yes | What was tried. |
| `outcome` | text | Yes | What happened. |
| `why_it_failed` | text | Yes | Why it did not solve the problem well enough. |
| `lesson` | text | Recommended | What the failure taught. |

## User

The `user` section describes who experiences the problem or benefits from the solution.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name_or_role` | string | Yes | Person, persona, group, or role. |
| `goals` | list<string> | Yes | What the user is trying to accomplish. |
| `needs` | list<string> | Recommended | What the user needs from a solution. |
| `pain_points` | list<string> | Recommended | Specific frustrations or blockers. |
| `level_of_expertise` | string | Optional | Relevant experience level or background. |

## Environment

The `environment` section describes the surrounding context.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `setting` | text | Yes | Where the case takes place: team, product, market, workflow, classroom, organization, etc. |
| `tools_or_systems` | list<string> | Recommended | Tools, platforms, datasets, policies, or systems involved. |
| `inputs` | list<string> | Recommended | Information available at the start. |
| `external_factors` | list<string> | Optional | Market, timing, social, technical, or organizational factors. |
| `assumptions` | list<string> | Recommended | Assumptions the case study depends on. |

## Solution

The `solution` section describes what was produced or recommended.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `summary` | text | Yes | Short explanation of the solution. |
| `details` | markdown | Yes | The actual solution, artifact, plan, design, recommendation, or answer. |
| `why_this_solution` | text | Recommended | Why this solution fits the problem and constraints. |
| `tradeoffs` | list<string> | Recommended | What the solution gives up or risks. |
| `expected_outcome` | text | Recommended | What should happen if the solution works. |
| `next_steps` | list<string> | Optional | Concrete follow-up actions. |

## Reproducible

The `reproducible` section explains whether someone else could recreate the case study or verify the result.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `is_reproducible` | boolean | Yes | Whether the case study can be reproduced. |
| `reproducibility_level` | enum | Recommended | One of `exact`, `approximate`, `manual`, `not_reproducible`, `unknown`. |
| `steps` | list<string> | Recommended | Steps needed to recreate the case study. |
| `required_inputs` | list<string> | Recommended | Inputs, files, prompts, data, or context needed. |
| `expected_result` | text | Recommended | What a reproducer should expect to see. |
| `known_variability` | text | Optional | Reasons a repeated attempt might differ. |

## Minimal Example

```yaml
title: Reducing review queue overload
summary: >
  A review team was overwhelmed by incoming cases and needed a way to choose
  what to inspect first. The case study compares the status quo with a proposed
  triage method designed around urgency, uncertainty, and user impact.
problem:
  statement: The team cannot review every case quickly enough.
  why_it_matters: Delayed high-risk cases create user harm and operational debt.
purpose:
  goal: Identify a more defensible triage process.
  questions:
    - Which cases should be inspected first?
    - What signals should determine priority?
constraints:
  - name: Limited reviewer time
    type: time
    description: Humans can only inspect a small fraction of cases each day.
failed_attempts:
  - name: First-in-first-out queue
    approach: Review cases in arrival order.
    outcome: Simple to operate but missed urgent cases.
    why_it_failed: Arrival time did not reflect risk or importance.
user:
  name_or_role: Review operations lead
  goals:
    - Reduce backlog
    - Catch urgent cases earlier
environment:
  setting: Internal review workflow
  tools_or_systems:
    - Case queue
    - Reviewer dashboard
solution:
  summary: Prioritize cases by urgency, uncertainty, and potential impact.
  details: >
    Create a queue score that combines severity signals, confidence gaps,
    affected-user count, and time sensitivity.
reproducible:
  is_reproducible: true
  reproducibility_level: approximate
  steps:
    - Gather a sample of past cases.
    - Score them with the proposed triage factors.
    - Compare ordering against the original queue.
```
