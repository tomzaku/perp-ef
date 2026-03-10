---
id: ai-1
title: Prompt Engineering Fundamentals
category: AI
subcategory: Prompt Engineering
difficulty: Easy
pattern: Prompting
companies: [OpenAI, Anthropic, Google, Meta]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Effective prompts have clear instructions, context, examples, and output format. Techniques like few-shot prompting, chain-of-thought, and role-based prompting dramatically improve LLM output quality."
similarProblems: [Chain-of-Thought Prompting, Few-Shot Learning, System Prompts]
---

**What are the core prompt engineering techniques and when should you use each one?**

Prompt engineering is the practice of designing inputs to LLMs to get desired outputs. It's a critical skill for building AI-powered applications.

## Solution

```text
PROMPT ENGINEERING TECHNIQUES
═══════════════════════════════

1. ZERO-SHOT PROMPTING
   Give the model a task with no examples.
   Works well for simple, well-defined tasks.

   Example:
   "Classify the sentiment of this review as positive, negative, or neutral:
    'The product arrived on time and works great!' → positive"

2. FEW-SHOT PROMPTING
   Provide 2-5 examples before the actual task.
   Helps the model understand the desired format and reasoning pattern.

   Example:
   "Extract the product and price:
    'I bought a laptop for $999' → {product: 'laptop', price: 999}
    'She ordered 2 coffees at $4.50 each' → {product: 'coffee', price: 4.50}
    'The new phone costs $1,199' → ?"

3. CHAIN-OF-THOUGHT (CoT)
   Ask the model to reason step-by-step.
   Dramatically improves accuracy on complex reasoning tasks.

   Example:
   "Q: If a store has 3 shelves with 8 items each, and 5 items are sold, how many remain?
    Let's think step by step:
    1. Total items = 3 × 8 = 24
    2. Items sold = 5
    3. Remaining = 24 - 5 = 19"

4. ROLE / SYSTEM PROMPTING
   Assign a persona or role to guide the model's behavior and tone.

   Example:
   "You are a senior code reviewer. Review the following code for
    security vulnerabilities, performance issues, and best practices."

5. OUTPUT FORMAT SPECIFICATION
   Explicitly define the expected output structure (JSON, markdown, specific schema).

BEST PRACTICES
═══════════════
- Be specific: "List 5 items" beats "list some items"
- Provide context: Tell the model what it's doing and why
- Use delimiters: Separate instructions from content with ---, """, or XML tags
- Iterate: Prompt engineering is experimental — test and refine
- Temperature: Lower (0-0.3) for factual, higher (0.7-1.0) for creative
```

## Explanation

The key insight is that LLMs are highly sensitive to how inputs are framed. Small changes in prompt structure can lead to dramatically different outputs.

**Core principles:**

- **Be specific** — vague instructions get vague results
- **Provide context** — the model has no idea what you're building unless you say so
- **Use delimiters** — clearly separate instructions from user content with `---`, `"""`, or XML tags like `<context>...</context>`
- **Iterate** — prompt engineering is experimental; test and refine
- **Control temperature** — lower (0-0.3) for factual tasks, higher (0.7-1.0) for creative tasks

**Choosing a technique:**

| Technique | When to use | Cost |
|---|---|---|
| Zero-shot | Simple, well-defined tasks | Lowest |
| Few-shot | Need specific format/style | Low-Medium |
| Chain-of-Thought | Complex reasoning, math, logic | Medium |
| Role prompting | Need specific tone/expertise | Low |
| Output format | Need structured/parseable output | Low |

## ELI5

Imagine you're asking a very smart friend for help, but they can only read your text message — they can't see your face or hear your tone. The better you explain what you want (with examples, step-by-step instructions, and the format you need), the better answer you'll get. That's prompt engineering — writing really clear instructions for an AI.
