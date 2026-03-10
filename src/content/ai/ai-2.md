---
id: ai-2
title: Retrieval-Augmented Generation (RAG)
category: AI
subcategory: RAG
difficulty: Medium
pattern: RAG Pipeline
companies: [OpenAI, Google, Amazon, Microsoft]
timeComplexity: N/A - architectural
spaceComplexity: N/A - architectural
keyTakeaway: "RAG combines retrieval from a knowledge base with LLM generation, grounding responses in real data. The pipeline is: query → embed → retrieve → rerank → augment prompt → generate. This reduces hallucination and keeps knowledge up-to-date without retraining."
similarProblems: [Vector Databases, Embedding Models, Chunking Strategies]
---

**What is RAG and how do you architect a production RAG pipeline?**

Retrieval-Augmented Generation (RAG) enhances LLM responses by first retrieving relevant documents from a knowledge base, then including them in the prompt context for generation. It reduces hallucination and keeps knowledge up-to-date without retraining.

## Solution

```text
RAG PIPELINE ARCHITECTURE
══════════════════════════

User Query
    ↓
[1. Query Processing]   → Rephrase, expand, or decompose the query
    ↓
[2. Embedding]          → Convert query to vector (e.g., text-embedding-3-small)
    ↓
[3. Retrieval]          → Search vector DB for top-k similar chunks
                           (Pinecone, Weaviate, pgvector, Qdrant)
    ↓
[4. Reranking]          → Score and reorder results by relevance
                           (Cohere Rerank, cross-encoder)
    ↓
[5. Prompt Augmentation]→ Insert retrieved chunks into system/user prompt
    ↓
[6. Generation]         → LLM generates answer grounded in retrieved context
    ↓
[7. Post-processing]    → Citation extraction, fact verification, formatting


KEY DESIGN DECISIONS
════════════════════

Chunking Strategy:
  - Fixed-size (512 tokens, 50-token overlap): Simple, predictable
  - Semantic chunking: Split by paragraphs/sections/sentences
  - Recursive: Try large chunks first, split further if needed
  - Tradeoff: Smaller = more precise retrieval, larger = more context

Embedding Model:
  - OpenAI: text-embedding-3-small / text-embedding-3-large
  - Open-source: bge-large, e5-large-v2, Cohere embed
  - MUST match embedding model between indexing and query time

Retrieval Strategy:
  - Dense retrieval: Vector similarity (cosine, dot product)
  - Sparse retrieval: BM25, TF-IDF (keyword-heavy queries)
  - Hybrid: Dense + sparse with reciprocal rank fusion (RRF) ← best

Context Window Management:
  - Stuff all chunks? Map-reduce? Iterative refinement?
  - Consider token limits and cost


WHY RAG?
════════
- Reduces hallucination: Grounds answers in actual documents
- Up-to-date knowledge: No retraining needed for new info
- Source attribution: Can cite where information came from
- Cost-effective: Cheaper than fine-tuning for domain knowledge
```

## Explanation

The core insight is that LLMs have a knowledge cutoff and can hallucinate. By fetching relevant documents at query time and injecting them into the prompt, you get the reasoning power of an LLM combined with the accuracy of a search engine.

**The quality of your RAG system depends primarily on retrieval quality** — if you retrieve the wrong documents, even the best LLM will give poor answers.

**Common pitfalls:**

1. **Chunks too large or too small** — experiment with 256-1024 tokens
2. **No reranking** — embedding similarity alone isn't enough for relevance
3. **Ignoring metadata** — filter by date, source, category before vector search
4. **Single retrieval pass** — use multi-step retrieval for complex queries
5. **No evaluation** — measure retrieval recall, answer faithfulness, and relevance

## ELI5

Imagine you're taking an open-book exam. Instead of memorizing everything (which might lead to remembering things wrong), you look up the relevant pages in your textbook first, then write your answer based on what you found. RAG is like giving the AI an open book — it searches for relevant information first, then uses that to answer your question.
