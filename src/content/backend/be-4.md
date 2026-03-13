---
id: be-4
title: SQL vs NoSQL (When to Use What)
category: Backend
subcategory: Database
difficulty: Easy
pattern: Architecture Decision
companies: [Google, Amazon, Meta, Netflix, MongoDB]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "SQL databases (PostgreSQL, MySQL) excel at structured data with relationships and ACID transactions. NoSQL databases (MongoDB, Redis, DynamoDB) excel at flexible schemas, horizontal scaling, and specific access patterns. The choice depends on your data model, consistency requirements, and scale needs — not hype."
similarProblems: [SQL Fundamentals, Schema Design, Caching Strategies]
---

**When should you choose SQL vs NoSQL, and what are the real trade-offs?**

This is one of the most common backend architecture questions. The answer is never "always SQL" or "always NoSQL" — it depends on your data and access patterns.

## Solution

```text
SQL vs NoSQL COMPARISON
═══════════════════════

                  │ SQL (Relational)        │ NoSQL                      │
──────────────────┼─────────────────────────┼────────────────────────────┤
Data model        │ Tables, rows, columns   │ Documents, key-value,      │
                  │ Fixed schema            │ columns, graphs            │
Schema            │ Strict (predefined)     │ Flexible (schema-on-read)  │
Relationships     │ JOINs, foreign keys     │ Embedded/denormalized      │
Transactions      │ Full ACID               │ Varies (some support ACID) │
Scaling           │ Primarily vertical      │ Primarily horizontal       │
Query language    │ SQL (standardized)      │ Varies per database        │
Consistency       │ Strong by default       │ Eventual or tunable        │


NoSQL TYPES
═══════════

1. DOCUMENT STORE (MongoDB, CouchDB)
   {
     "_id": "user123",
     "name": "Alice",
     "orders": [                    ← Embedded subdocuments
       { "item": "laptop", "total": 999 },
       { "item": "mouse", "total": 29 }
     ]
   }
   Best for: Content management, user profiles, catalogs
   Access pattern: Read/write entire documents

2. KEY-VALUE STORE (Redis, DynamoDB, Memcached)
   "session:abc123" → { userId: 5, expires: "2024-12-31" }
   Best for: Caching, sessions, real-time data, leaderboards
   Access pattern: GET/SET by key, very fast

3. WIDE-COLUMN STORE (Cassandra, ScyllaDB, HBase)
   Row key → { column_family: { col1: val1, col2: val2, ... } }
   Best for: Time-series, IoT data, analytics at massive scale
   Access pattern: Write-heavy, time-ordered queries

4. GRAPH DATABASE (Neo4j, Amazon Neptune)
   (Alice)-[:FRIENDS_WITH]->(Bob)-[:WORKS_AT]->(Google)
   Best for: Social networks, recommendation engines, fraud detection
   Access pattern: Traverse relationships


CHOOSE SQL WHEN
═══════════════

✓ Data is structured with clear relationships
  → E-commerce: users, orders, products, reviews (all interrelated)

✓ You need ACID transactions
  → Financial systems, inventory, booking systems

✓ You need complex queries (JOINs, aggregations, reporting)
  → Analytics dashboards, reporting systems

✓ Data integrity is critical (constraints, foreign keys)
  → Healthcare, compliance-heavy industries

✓ Schema is well-defined and unlikely to change dramatically
  → Core business data, established domains

Examples: PostgreSQL, MySQL, SQLite


CHOOSE NoSQL WHEN
═════════════════

✓ Schema varies between records or evolves rapidly
  → CMS with different content types, user-generated content

✓ Data is naturally hierarchical/nested (fits documents)
  → Product catalogs with varying attributes, JSON configs

✓ You need horizontal scaling for massive throughput
  → Real-time feeds, IoT sensor data, logging

✓ Access patterns are simple (key lookup, not complex JOINs)
  → Session store, caching layer, feature flags

✓ You need specific data model support (graph, time-series)
  → Social graph traversal, metrics at scale

Examples: MongoDB, Redis, DynamoDB, Cassandra


REAL-WORLD PATTERNS
═══════════════════

Pattern: POLYGLOT PERSISTENCE (use both)

Most production systems use multiple databases:

┌──────────────┐     ┌───────────────────┐
│  PostgreSQL  │     │  Redis            │
│  (primary)   │     │  (cache/sessions) │
│  Users       │     │  Hot data         │
│  Orders      │     │  Rate limits      │
│  Products    │     │  Pub/Sub          │
└──────────────┘     └───────────────────┘
        │                    │
        └───── Application ──┘
                    │
        ┌───────────────────┐
        │  Elasticsearch    │
        │  (search)         │
        │  Full-text search │
        │  Faceted browsing │
        └───────────────────┘


COMMON MISTAKES
═══════════════

✗ Choosing NoSQL because "it scales" when you have 10K records
  → PostgreSQL handles millions of rows easily with proper indexing

✗ Using MongoDB for highly relational data
  → Constant $lookup (MongoDB's JOIN) defeats the purpose

✗ Not considering operational complexity
  → Running a Cassandra cluster requires significant expertise

✗ Choosing based on trends instead of requirements
  → Analyze your data model and access patterns first
```

## Explanation

The key insight is to **choose based on your data model and access patterns, not technology preferences**.

**Start with PostgreSQL** for most applications. It handles JSON (JSONB), full-text search, and scales vertically to millions of rows. Only reach for NoSQL when you have a specific need:
- Redis for caching/sessions
- Elasticsearch for full-text search
- DynamoDB/Cassandra for massive write throughput
- Neo4j for graph traversal

Most real production systems use **polyglot persistence** — multiple databases, each used for what it does best.

## ELI5

SQL databases are like a spreadsheet — everything has neat rows and columns, and you can easily connect data between different sheets. NoSQL databases are like a filing cabinet with folders — each folder can have different stuff inside, and it's easy to add new folders, but harder to find connections between them. Most offices use both: the spreadsheet for organized data and the filing cabinet for everything else.
