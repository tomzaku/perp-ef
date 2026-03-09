---
id: behavior-6
title: Tell Me About a Time You Failed
category: Behavioral
subcategory: Resilience
difficulty: Medium
pattern: STAR Method
companies: [Amazon, Google, Meta, Microsoft]
timeComplexity: "3-4 minutes"
spaceComplexity: N/A
keyTakeaway: Own the failure completely — no excuses. Focus on what you learned and how it changed your approach. The best answers show a failure that made you a significantly better engineer.
similarProblems: [behavior-3, behavior-5]
---

Everyone fails. The interviewer wants to see that you take ownership, learn from mistakes, and apply those lessons going forward. Deflecting blame is a major red flag.

## Examples

**Input:** "Tell me about a time you failed."
**Output:** A story of genuine failure with full ownership and meaningful lessons learned.

## Solution

```text
Framework: STAR + Lessons Learned

SITUATION: "I was leading the frontend migration of our main
product from a monolithic React app to a micro-frontend architecture.
The project had a 3-month timeline and high visibility."

TASK: "I was responsible for the architecture decisions, the
migration plan, and coordinating across 4 teams."

ACTION: "I made several mistakes. First, I underestimated the
complexity of shared state between micro-frontends and chose a
solution that didn't scale. Second, I didn't run a proper proof-
of-concept — I was overconfident because I'd read about the
pattern extensively.

When we hit integration issues at month 2, I tried to push through
rather than stepping back to reassess. We missed the deadline by
6 weeks, and two teams had to redo significant work because of
the shared state issues."

RESULT: "The migration eventually succeeded, but the delay impacted
the product roadmap and team morale.

I took full ownership in the retro. Three things changed permanently:

1. I now always build a working proof-of-concept before committing
   to architectural decisions — no matter how well-read I am.
2. I set up 'checkpoint reviews' at the 25% and 50% marks for any
   project over 1 month. If we're blocked, we reassess early.
3. I learned that 'pushing through' is sometimes the worst choice.
   Pausing to re-evaluate saves more time than stubbornness."
```

## Explanation

**Choosing the right failure:**
- Pick something **real** — minor inconveniences don't count
- It should be **your fault**, not someone else's
- The failure should have had **real consequences**
- Most importantly: you should have **genuinely learned** from it

**How to tell the story:**
- Own it completely — "I failed" not "we failed" or "it didn't work out"
- Be specific about what went wrong and why
- Don't make excuses or blame circumstances
- Spend 40% of the time on the lessons and how you changed

**Amazon Leadership Principles connection:**
This maps directly to "Learn and Be Curious" and "Bias for Action." Amazon especially values this question — they want to see ownership and learning velocity.
