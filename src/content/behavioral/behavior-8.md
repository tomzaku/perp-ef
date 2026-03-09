---
id: behavior-8
title: How Do You Handle Tight Deadlines and Pressure?
category: Behavioral
subcategory: Time Management
difficulty: Medium
pattern: STAR Method
companies: [Amazon, Google, Meta, Microsoft]
timeComplexity: "2-3 minutes"
spaceComplexity: N/A
keyTakeaway: Show that you stay calm, prioritize ruthlessly, communicate proactively with stakeholders, and know when to cut scope vs. push through.
similarProblems: [behavior-6, behavior-7]
---

Engineering often involves tight deadlines. The interviewer wants to see that you can manage pressure without burning out or delivering low-quality work.

## Examples

**Input:** "How do you handle tight deadlines?"
**Output:** A concrete example of working effectively under pressure.

## Solution

```text
Framework: STAR with focus on prioritization and communication

SITUATION: "Two weeks before a major product launch, we discovered
that the new checkout flow had critical accessibility issues.
Our a11y audit flagged 23 WCAG violations, and the legal team
said we couldn't launch without fixing them."

TASK: "I needed to triage and fix 23 accessibility issues in
10 business days while also completing the remaining feature
work for the launch."

ACTION: "First, I stayed calm and broke the problem down:

1. TRIAGE: I categorized the 23 issues by severity — 8 were
   critical (keyboard navigation broken), 10 were major
   (screen reader issues), 5 were minor (color contrast).

2. NEGOTIATE SCOPE: I met with the PM and proposed: fix all
   critical and major issues before launch, defer minor issues
   to a fast-follow. They agreed.

3. DIVIDE AND DELEGATE: I wrote clear tickets for each issue
   with reproduction steps and proposed fixes. I took the 5
   hardest ones and distributed the rest to 3 teammates who
   volunteered to help.

4. DAILY STANDUPS: I set up a 15-minute daily check-in
   specifically for a11y progress, separate from our regular
   standup.

5. PROTECT QUALITY: Despite the pressure, I insisted on code
   reviews and manual testing for each fix. Rushing would
   just create new bugs."

RESULT: "We fixed all 18 critical and major issues in 8 days
with 2 days to spare for integration testing. Launched on time.
The minor issues were fixed the following week. I also created
an a11y checklist that we now run during development, not just
before launch."
```

## Explanation

**Key principles under pressure:**
- **Don't panic** — take 30 minutes to assess before acting
- **Prioritize ruthlessly** — not everything needs to be done
- **Communicate early** — tell stakeholders the real situation
- **Protect quality** — cutting corners creates more pressure later
- **Ask for help** — delegation is strength, not weakness

**What NOT to do:**
- Pull all-nighters and brag about it (signals poor planning)
- Skip testing to meet the deadline (creates technical debt)
- Suffer in silence (stakeholders need to know the risks)
- Say yes to everything (learn to negotiate scope)
