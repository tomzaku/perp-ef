---
id: ai-5
title: Fine-Tuning vs RAG vs Prompt Engineering
category: AI
subcategory: Strategy
difficulty: Medium
pattern: Decision Framework
companies: [OpenAI, Anthropic, Google, Amazon]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Choose prompt engineering first (cheapest, fastest iteration), RAG when you need current/private knowledge, and fine-tuning when you need consistent style/format or specialized behavior. These techniques are complementary and often combined."
similarProblems: [Model Selection, Cost Optimization, Knowledge Management]
---

**When should you use prompt engineering vs RAG vs fine-tuning? How do they compare?**

These three techniques are the main levers for customizing LLM behavior. Understanding when to use each (and when to combine them) is essential for building effective AI products.

## Solution

```text
COMPARISON MATRIX
═════════════════

Criteria          │ Prompt Engineering │ RAG              │ Fine-Tuning
──────────────────┼────────────────────┼──────────────────┼──────────────────
Setup time        │ Minutes            │ Hours-Days       │ Days-Weeks
Cost              │ Token cost only    │ Infra + tokens   │ Training + inference
Knowledge update  │ Edit prompt        │ Update KB        │ Retrain model
Best for          │ Behavior/format    │ External knowledge│ Style/specialized tasks
Hallucination     │ Higher             │ Lower (grounded) │ Medium
Latency           │ Lowest             │ Medium (retrieval)│ Lowest
Data needed       │ 0 examples         │ Documents        │ 100-10,000+ examples


DECISION FRAMEWORK
══════════════════

Start with PROMPT ENGINEERING when:
  ✓ Quick iteration and experimentation needed
  ✓ Task is within the base model's capabilities
  ✓ Need specific output formats or personas
  ✓ Requirements might change frequently

Add RAG when:
  ✓ Model needs access to private/current information
  ✓ Need source attribution and citations
  ✓ Knowledge changes frequently
  ✓ Want to reduce hallucination on factual questions

Use FINE-TUNING when:
  ✓ Need consistent style, tone, or domain-specific language
  ✓ Prompt engineering can't reliably produce desired behavior
  ✓ High-volume, repetitive tasks (amortize training cost)
  ✓ Need to reduce prompt size (bake instructions into weights)
  ✓ Need specialized capabilities (e.g., code for specific framework)


COMBINING ALL THREE (Production Best Practice)
═══════════════════════════════════════════════

  Fine-tuned model (consistent style + domain knowledge)
      ↕
  RAG pipeline (current, private information)
      ↕
  Optimized prompts (task-specific instructions + few-shot examples)

Example — Customer Support Bot:
  1. Fine-tune on your company's support conversations → consistent tone
  2. RAG from knowledge base → accurate product information
  3. Prompt with specific instructions → handle edge cases, escalation
```

## Explanation

Think of it as three layers of customization:

- **Prompt engineering** = giving someone detailed instructions for a task
- **RAG** = giving them a reference library to look things up
- **Fine-tuning** = putting them through a training program so they internalize your way of doing things

Each has different costs, timelines, and strengths. The art is knowing which to apply and when to combine them. The most effective production systems often use all three together.

**Common mistake:** Jumping to fine-tuning too early. Always start with prompt engineering, add RAG if needed, and only fine-tune when the other two aren't sufficient.

## ELI5

Imagine you hired a smart new employee. Prompt engineering is like giving them a detailed task description each morning. RAG is like giving them access to your company handbook to look things up. Fine-tuning is like putting them through a training program so they naturally speak and act like your company. You'd probably use all three!
