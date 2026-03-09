---
id: behavior-4
title: Describe a Time You Disagreed With a Teammate
category: Behavioral
subcategory: Conflict Resolution
difficulty: Medium
pattern: STAR Method
companies: [Amazon, Google, Meta, Microsoft]
timeComplexity: "3-4 minutes"
spaceComplexity: N/A
keyTakeaway: Show that you can disagree respectfully, listen to other perspectives, and reach a resolution that's best for the team — even if it means your original idea wasn't chosen.
similarProblems: [behavior-7, behavior-8]
---

Conflict is inevitable in engineering teams. The interviewer wants to see emotional maturity, communication skills, and the ability to prioritize team outcomes over ego.

## Examples

**Input:** "Tell me about a time you had a disagreement with a colleague."
**Output:** A story showing respectful disagreement, active listening, and a positive resolution.

## Solution

```text
Framework: STAR with emphasis on empathy and resolution

SITUATION: "During a sprint planning, a senior engineer proposed
migrating our component library from CSS Modules to Tailwind CSS.
I had concerns about the migration cost and the impact on our
existing design tokens."

TASK: "As the design system lead, I needed to either align with
the proposal or present a compelling alternative — without creating
a rift in the team."

ACTION: "Instead of opposing it in the meeting, I asked to schedule
a 1-on-1 to understand their reasoning better. In that conversation,
I learned their main pain point was the verbose className logic in
our components — a valid concern I hadn't considered.

I proposed a compromise: we'd keep our token system but adopt
Tailwind's utility-first approach through a custom Tailwind config
that mapped to our design tokens. I built a small proof-of-concept
over a weekend showing both approaches side by side.

We presented the options to the team and let everyone vote. The
hybrid approach won because it addressed the verbosity concern
while preserving our existing token infrastructure."

RESULT: "The migration took 3 weeks instead of the estimated 8,
and developer satisfaction scores for the component library went
from 6.2 to 8.4. More importantly, the senior engineer and I
built a stronger working relationship — we now regularly bounce
ideas off each other before bringing proposals to the team."
```

## Explanation

**What interviewers look for:**
- You can **disagree without being disagreeable**
- You **seek to understand** before pushing your view
- You prioritize the **team's outcome** over being right
- You can find **creative compromises**

**Key principles:**
1. **Assume good intent** — the other person has valid reasons
2. **Separate the idea from the person** — critique proposals, not people
3. **Use data, not opinions** — build prototypes, gather metrics
4. **Know when to commit** — disagree and commit is a real skill

**Red flags to avoid:**
- Badmouthing the other person
- Framing yourself as always right
- Showing no willingness to compromise
- Escalating unnecessarily to management
