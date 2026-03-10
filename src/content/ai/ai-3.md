---
id: ai-3
title: AI Agents and Tool Use
category: AI
subcategory: Agents
difficulty: Hard
pattern: Agent Architecture
companies: [OpenAI, Anthropic, Google, LangChain]
timeComplexity: N/A - architectural
spaceComplexity: N/A - architectural
keyTakeaway: "AI agents use an LLM as a reasoning engine that can plan, use tools, and iterate. The core loop is: observe → think → act → observe. Key patterns include ReAct (reasoning + acting), tool use via function calling, and multi-agent orchestration."
similarProblems: [Function Calling, Multi-Agent Systems, Planning Algorithms]
---

**What are AI agents, how do they work, and what are the key architectural patterns?**

An AI agent is a system where an LLM acts as a reasoning engine that can autonomously plan and execute multi-step tasks by using tools and observing results.

## Solution

```text
CORE AGENT LOOP
════════════════

        ┌──────────────────────┐
        │    User Task/Goal    │
        └──────────┬───────────┘
                   ↓
        ┌──────────────────────┐
   ┌───→│   Think / Plan       │ ← LLM reasons about next step
   │    └──────────┬───────────┘
   │               ↓
   │    ┌──────────────────────┐
   │    │   Select Action      │ ← Choose tool or respond
   │    └──────────┬───────────┘
   │               ↓
   │    ┌──────────────────────┐
   │    │   Execute Tool       │ ← API call, code execution, search, etc.
   │    └──────────┬───────────┘
   │               ↓
   │    ┌──────────────────────┐
   └────│   Observe Result     │ ← Feed result back to LLM
        └──────────────────────┘


KEY PATTERNS
════════════

1. ReAct (Reasoning + Acting)
   Model alternates between reasoning and acting.
   Each step: Thought → Action → Observation

2. Function Calling / Tool Use
   LLMs natively support structured tool use via JSON schemas:
   {
     "tools": [{
       "name": "search_web",
       "description": "Search the web for current information",
       "parameters": {
         "type": "object",
         "properties": { "query": { "type": "string" } }
       }
     }]
   }

3. Planning Patterns
   - Plan-then-execute: Full plan first, then execute steps
   - Iterative refinement: Plan one step, execute, replan
   - Tree of Thoughts: Explore multiple reasoning paths

4. Multi-Agent Systems
   - Supervisor pattern: One agent delegates to sub-agents
   - Debate pattern: Agents argue perspectives, converge
   - Pipeline pattern: Each agent handles one stage


MEMORY IN AGENTS
════════════════
- Short-term: Conversation context / scratchpad within session
- Long-term: Persisted knowledge across sessions (vector store, DB)
- Episodic: Past task outcomes to improve future performance


COMMON CHALLENGES
═════════════════
- Infinite loops: Agent gets stuck retrying failed actions
- Cost explosion: Each iteration costs tokens — set max iterations
- Tool selection errors: Model calls wrong tool or wrong params
- Hallucinated actions: Model invents tools that don't exist
- Context overflow: Long conversations exceed token limits
```

## Explanation

Agents extend LLMs from passive text generators to active problem solvers. The key innovation is the **feedback loop** — instead of generating one response, the agent can take actions, observe results, and adjust its approach.

This enables complex workflows like "research a topic, write code, test it, fix bugs, and deploy" — all autonomously.

**Design considerations:**
- **Max iterations**: Always set a limit to prevent runaway costs
- **Tool permissions**: Principle of least privilege — only give tools the agent actually needs
- **Human-in-the-loop**: For high-stakes actions, require human approval
- **Observability**: Log every thought/action/observation for debugging

## ELI5

Think of an AI agent like a smart assistant with a phone and a toolbox. When you give it a task, it thinks about what to do first, picks up a tool (like searching the web or running code), sees what happens, and then decides the next step. It keeps doing this until the task is done — just like how you'd solve a complex problem step by step, using different tools along the way.
