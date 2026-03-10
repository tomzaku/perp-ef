---
id: ai-4
title: Embeddings and Vector Databases
category: AI
subcategory: Embeddings
difficulty: Medium
pattern: Vector Search
companies: [OpenAI, Google, Pinecone, Weaviate]
timeComplexity: N/A - architectural
spaceComplexity: N/A - architectural
keyTakeaway: "Embeddings are dense vector representations of text that capture semantic meaning. Similar texts have vectors close together in high-dimensional space. Vector databases enable fast approximate nearest neighbor (ANN) search over millions of embeddings using algorithms like HNSW."
similarProblems: [Semantic Search, Similarity Matching, Dimensionality Reduction]
---

**What are embeddings, how do vector databases work, and how are they used in AI applications?**

Embeddings convert text (or images, audio) into fixed-size numerical vectors where semantic similarity maps to geometric proximity. Vector databases enable fast search over millions of these vectors.

## Solution

```text
HOW EMBEDDINGS WORK
════════════════════

"The cat sat on the mat"    → [0.12, -0.34, 0.56, ..., 0.78]  (1536 dims)
"A kitten rested on a rug"  → [0.11, -0.32, 0.55, ..., 0.77]  (very similar!)
"Stock prices rose today"   → [-0.45, 0.67, -0.12, ..., 0.23] (very different)

- Similar meanings → vectors close together (high cosine similarity)
- Different meanings → vectors far apart (low cosine similarity)


VECTOR DATABASE ARCHITECTURE
═════════════════════════════

Key Components:
1. Index structures: HNSW, IVF (Inverted File Index), PQ (Product Quantization)
2. Similarity metrics: Cosine similarity, Euclidean distance, dot product
3. Metadata filtering: Filter by attributes before or after vector search
4. CRUD operations: Add, update, delete vectors with metadata

Popular Solutions:
- Managed:     Pinecone, Weaviate Cloud, Qdrant Cloud
- Self-hosted: Weaviate, Qdrant, Milvus, Chroma
- Extensions:  pgvector (PostgreSQL), Redis Vector Search


HNSW ALGORITHM (Most Common Index)
═══════════════════════════════════

Layer 2:  [A] ────────── [D]           (few nodes, long-range links)
           │               │
Layer 1:  [A] ── [B] ── [D] ── [F]    (more nodes, medium links)
           │      │       │      │
Layer 0:  [A]-[B]-[C]-[D]-[E]-[F]-[G]  (all nodes, local links)

- Navigate top-down from sparse to dense layers
- At each layer, greedily move toward query vector
- O(log N) search complexity with high recall


USE CASES
═════════
1. Semantic search: Find documents by meaning, not keywords
2. RAG retrieval: Core retrieval step in RAG pipelines
3. Recommendation: Find similar products, articles, users
4. Deduplication: Detect near-duplicate content
5. Clustering: Group similar items together
```

## Explanation

Traditional search relies on keyword matching — "car" won't match "automobile." Embeddings solve this by mapping text to a space where meaning is represented geometrically.

Vector databases make it practical to search over millions of these vectors in milliseconds using **approximate nearest neighbor (ANN)** algorithms that trade a tiny bit of accuracy for massive speed improvements.

**Key decisions when choosing a vector DB:**
- **Scale**: How many vectors? Millions → need HNSW/IVF indexing
- **Latency**: Real-time search vs batch processing?
- **Filtering**: Need metadata filters? Some DBs handle this better
- **Managed vs self-hosted**: Pinecone is easy; pgvector if you already use Postgres

## ELI5

Imagine every sentence is a point on a map. Sentences that mean similar things are placed close together on the map. A vector database is like a GPS that can instantly find the closest points to where you're looking. So when you ask a question, it finds the most relevant information by looking at what's nearby on the "meaning map."
