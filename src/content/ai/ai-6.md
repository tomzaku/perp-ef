---
id: ai-6
title: LLM Hallucination and Evaluation
category: AI
subcategory: Evaluation
difficulty: Medium
pattern: Quality Assurance
companies: [OpenAI, Anthropic, Google, Meta]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Hallucination occurs when LLMs generate plausible but incorrect information. Mitigations include RAG grounding, structured output validation, confidence calibration, and multi-model consensus. Evaluation frameworks (like RAGAS) measure faithfulness, relevance, and correctness."
similarProblems: [RAG Evaluation, Output Validation, Guardrails]
---

**What causes LLM hallucination, how do you detect it, and what evaluation metrics matter?**

Hallucination is when an LLM generates content that is factually incorrect, fabricated, or inconsistent with the provided context. It's one of the biggest challenges in deploying LLMs to production.

## Solution

```text
TYPES OF HALLUCINATION
══════════════════════
1. Factual:      Generating false facts ("Eiffel Tower built in 1920")
2. Faithfulness: Generating content not supported by provided context
3. Instruction:  Not following given instructions or constraints
4. Consistency:  Contradicting itself within the same response


MITIGATION STRATEGIES
═════════════════════

1. RAG Grounding
   Retrieve real documents; instruct model to only answer from context.

2. Structured Output
   Force JSON or schema-constrained output — easier to validate.

3. Self-Consistency / Chain-of-Verification
   - Generate multiple answers → check for consensus
   - Ask the model to verify its own claims step by step

4. Guardrails
   - Input/output validation: regex, JSON schema, LLM-as-judge
   - Block or flag responses that fail checks

5. Temperature and Sampling
   - Lower temperature → less creative but less hallucinated
   - top_p sampling → limit token selection range


EVALUATION METRICS
══════════════════

For RAG systems (RAGAS framework):
  - Faithfulness:       Is the answer supported by retrieved context?
  - Answer Relevance:   Does the answer address the question?
  - Context Precision:  Are retrieved documents relevant?
  - Context Recall:     Were all needed documents retrieved?

General LLM evaluation:
  - Accuracy:           Correctness on known-answer benchmarks
  - LLM-as-Judge:       Use strong model to evaluate weaker model
  - Human evaluation:   Gold standard but expensive and slow
  - Rubric-based:       Define criteria, score each dimension


EVAL PIPELINE
═════════════

Test Dataset (questions + expected answers)
    ↓
Run LLM pipeline → generated answers
    ↓
Automated scoring (exact match, BLEU, LLM-as-judge)
    ↓
Aggregate metrics → dashboard
    ↓
Regression detection → CI/CD alerts
```

## Explanation

LLMs are fundamentally **next-token predictors** — they generate what sounds plausible, not what's true. Hallucination is a natural consequence of this architecture.

The key to production deployment is building layers of verification:
- **Ground in real data** (RAG)
- **Validate outputs** (guardrails)
- **Measure quality continuously** (evals)
- **Set user expectations** (confidence indicators)

**Building an eval pipeline is non-negotiable** for production AI. Without it, you're flying blind — you won't know if a prompt change or model upgrade improved or degraded quality until users complain.

## ELI5

LLMs are like a very confident student who always raises their hand, even when they're not sure of the answer. Sometimes they make up something that sounds right but isn't. To handle this, we give them a textbook to reference (RAG), double-check their answers (guardrails), and regularly test them (evaluation) to make sure they're getting things right.
