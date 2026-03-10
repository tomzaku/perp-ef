---
id: ai-8
title: Token Management and Context Windows
category: AI
subcategory: Fundamentals
difficulty: Easy
pattern: Token Optimization
companies: [OpenAI, Anthropic, Google]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Context window is the maximum input+output tokens an LLM can process. Managing it involves chunking, summarization, sliding windows, and strategic placement of important content. Token count directly impacts cost and latency."
similarProblems: [Prompt Optimization, Cost Management, Chunking Strategies]
---

**How do tokens and context windows work, and how do you manage them in production?**

Tokens are the atomic units LLMs process — roughly 3/4 of a word in English. Context windows define the total tokens (input + output) a model can handle per request.

## Solution

```text
TOKEN BASICS
════════════

"Hello, world!" → ["Hello", ",", " world", "!"] → 4 tokens
"Tokenization"  → ["Token", "ization"]           → 2 tokens

Rule of thumb: 1 token ≈ 4 characters ≈ 0.75 words (English)

Common context window sizes (2025):
  - GPT-4o:              128K tokens
  - Claude Sonnet/Opus:  200K tokens
  - Gemini 1.5 Pro:      2M tokens


CONTEXT WINDOW MANAGEMENT STRATEGIES
═════════════════════════════════════

1. Chunking and Retrieval (RAG)
   Don't stuff everything in context — retrieve only what's needed.

2. Summarization
   For long conversations, periodically summarize earlier turns.
   Turns 1-20:  [Summarized to 200 tokens]
   Turns 21-25: [Full messages, 800 tokens]
   Current turn: [User's new message]

3. Sliding Window
   Keep the most recent N messages and a system prompt.

4. Strategic Placement
   - Important instructions at BEGINNING and END (primacy/recency bias)
   - "Lost in the middle" — models pay less attention to middle content

5. Token Budget Allocation
   System prompt:     ~500 tokens  (instructions, persona)
   Retrieved context: ~2000 tokens (RAG results)
   Conversation:      ~1000 tokens (recent messages)
   Output buffer:     ~1000 tokens (reserved for response)
   ────────────────────────────
   Total:             ~4500 tokens per request


COST IMPLICATIONS
═════════════════
- Input tokens are cheaper than output tokens (typically 3-5x)
- Caching system prompts saves money on repeated calls
- Shorter prompts = lower latency (TTFT scales with input length)
- Batch processing is cheaper than real-time for non-urgent tasks
```

## Explanation

Think of the context window as the model's **working memory** — everything it needs to know must fit inside. Effective token management is about making the best use of this limited space.

**Key principles:**
- Put the most important information at the **beginning and end** of the prompt
- Remove irrelevant content — every token costs money and dilutes attention
- Balance cost against quality — longer context = better answers but higher cost
- Reserve tokens for output — if you use 95% of the window on input, the response will be cut short

**The "lost in the middle" effect** is well-documented: LLMs pay more attention to the start and end of long contexts. Place critical instructions and key information in those positions.

## ELI5

Imagine you can only fit one page of notes into an exam room. You'd want to write the most important stuff, use abbreviations, and put key formulas at the top where you'll see them first. That's what token management is — making the most of the AI's limited reading space.
