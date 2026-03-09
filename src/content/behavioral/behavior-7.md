---
id: behavior-7
title: Describe a Time You Led a Project or Initiative
category: Behavioral
subcategory: Leadership
difficulty: Medium
pattern: STAR Method
companies: [Google, Meta, Amazon, Microsoft, Apple]
timeComplexity: "3-4 minutes"
spaceComplexity: N/A
keyTakeaway: Leadership isn't about a title — show how you identified a need, rallied people around it, navigated obstacles, and delivered results. Emphasize influence over authority.
similarProblems: [behavior-3, behavior-8]
---

Even for IC (individual contributor) roles, companies want to see leadership potential. This question tests whether you can drive outcomes beyond just writing code.

## Examples

**Input:** "Tell me about a time you led a project."
**Output:** A story showing initiative, influence, and delivery.

## Solution

```text
Framework: STAR with focus on influence and people

SITUATION: "Our team's CI pipeline took 45 minutes per build.
Engineers were context-switching constantly while waiting, and
it was slowing feature velocity. Leadership was focused on
product features, so no one had bandwidth to address it."

TASK: "This wasn't assigned to me — I saw the problem and
decided to champion a fix. I needed to convince my manager
to allocate time for it and get buy-in from 3 teams whose
configs would need to change."

ACTION: "First, I gathered data: I tracked the team's idle
time during CI waits over 2 weeks and calculated the
productivity cost (~15 engineering hours/week lost).

I presented this to my manager with a concrete proposal:
give me 2 weeks to optimize the pipeline, and I'd deliver
a 50% reduction. The data made it an easy yes.

I formed a working group with one engineer from each affected
team. We met twice a week for 30-minute syncs. I broke the
work into parallel tracks:
- Test parallelization and caching (my track)
- Docker layer optimization (Team B)
- Selective test running based on changed files (Team C)

When Team B hit a blocker with Docker caching in our
specific K8s setup, I pair-programmed with their engineer
for an afternoon to unblock them."

RESULT: "We cut CI time from 45 to 12 minutes — a 73% reduction.
Developer satisfaction surveys showed a measurable improvement.
The approach became a template for cross-team initiatives, and
I was asked to lead the next quarter's platform improvements."
```

## Explanation

**What makes a strong leadership story:**
- You **identified the problem proactively** (not just assigned)
- You **influenced without authority** (cross-team coordination)
- You **removed blockers** for others (servant leadership)
- You delivered **measurable results**
- Others benefited (impact beyond yourself)

**Leadership signals interviewers look for:**
1. **Initiative** — you saw a need and acted
2. **Communication** — you sold the vision with data
3. **Coordination** — you organized multiple people/teams
4. **Unblocking** — you helped others succeed
5. **Accountability** — you owned the outcome

**For IC roles:**
You don't need a "tech lead" title. Leading a design doc review, championing a testing strategy, mentoring a junior engineer, or driving a migration all count as leadership.
