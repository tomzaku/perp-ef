---
id: be-2
title: Database Indexing & Query Optimization
category: Backend
subcategory: Indexing & Optimization
difficulty: Medium
pattern: Performance Optimization
companies: [Google, Amazon, Stripe, Shopify, Uber]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Indexes are data structures (usually B-trees) that speed up reads at the cost of slower writes and extra storage. The key to optimization is understanding how the query planner works: use EXPLAIN ANALYZE, index columns in WHERE/JOIN/ORDER BY, and avoid patterns that prevent index usage (functions on columns, leading wildcards, OR conditions)."
similarProblems: [SQL Fundamentals, Schema Design, ACID Transactions]
---

**How do database indexes work, and how do you optimize slow queries?**

Indexes are the single most impactful tool for database performance. Understanding them deeply separates junior from senior backend developers.

## Solution

```text
HOW INDEXES WORK
════════════════

Without index (full table scan):
  Table: [row1] → [row2] → [row3] → ... → [row1M]
  SELECT * FROM users WHERE email = 'x@y.com'
  → Must check ALL 1M rows → O(n)

With B-tree index on email:
         ┌─────── m ───────┐
         │                  │
    ┌── d ──┐          ┌── s ──┐
    │       │          │       │
  [a-c]  [e-l]      [n-r]  [t-z]
  → Traverse tree → O(log n)
  → 1M rows → ~20 comparisons instead of 1M


INDEX TYPES
═══════════

1. B-TREE (default, most common)
   - Equality (=) and range (<, >, BETWEEN, LIKE 'prefix%')
   - Supports ORDER BY
   CREATE INDEX idx_users_email ON users(email);

2. HASH
   - Only equality (=), faster than B-tree for exact lookups
   - No range queries, no sorting
   CREATE INDEX idx_users_email ON users USING hash(email);

3. GIN (Generalized Inverted Index)
   - Full-text search, JSONB, arrays
   CREATE INDEX idx_posts_tags ON posts USING gin(tags);

4. GiST (Generalized Search Tree)
   - Geometric/spatial data, full-text search
   CREATE INDEX idx_locations_geo ON locations USING gist(coordinates);


COMPOSITE INDEXES
═════════════════

-- Index on multiple columns (order matters!)
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- This index helps:
WHERE user_id = 5                           ✓ (leftmost prefix)
WHERE user_id = 5 AND created_at > '2024-01-01'  ✓ (both columns)
WHERE user_id = 5 ORDER BY created_at       ✓ (index covers sort)

-- This index does NOT help:
WHERE created_at > '2024-01-01'             ✗ (skips leftmost column)
ORDER BY created_at                         ✗ (skips leftmost column)

-- Rule: Composite indexes follow the "leftmost prefix" rule


QUERY OPTIMIZATION
══════════════════

Step 1: EXPLAIN ANALYZE (always start here)

  EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 5;

  Output tells you:
  - Seq Scan → No index used (bad for large tables)
  - Index Scan → Index used (good)
  - Bitmap Index Scan → Multiple index results merged
  - Nested Loop / Hash Join / Merge Join → How JOINs execute
  - Actual time / rows → Real performance data


Step 2: Common optimizations

  -- BAD: Function on indexed column prevents index use
  WHERE YEAR(created_at) = 2024
  -- GOOD: Range query uses index
  WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'

  -- BAD: Leading wildcard prevents index use
  WHERE email LIKE '%@gmail.com'
  -- GOOD: Prefix works with B-tree
  WHERE email LIKE 'john%'

  -- BAD: OR can prevent index use
  WHERE status = 'active' OR city = 'NYC'
  -- GOOD: Use UNION or separate indexed queries

  -- BAD: SELECT * fetches all columns
  SELECT * FROM users WHERE id = 5
  -- GOOD: Covering index (index includes all needed columns)
  CREATE INDEX idx_users_email_name ON users(email) INCLUDE (name);
  SELECT name FROM users WHERE email = 'x@y.com'  -- Index-only scan


Step 3: Common patterns

  -- Pagination: Use keyset pagination over OFFSET
  -- BAD (scans all skipped rows):
  SELECT * FROM posts ORDER BY id LIMIT 20 OFFSET 10000;
  -- GOOD (seeks directly):
  SELECT * FROM posts WHERE id > 10000 ORDER BY id LIMIT 20;

  -- N+1 query problem
  -- BAD: 1 query for users + N queries for orders
  users = SELECT * FROM users
  for user in users:
    orders = SELECT * FROM orders WHERE user_id = user.id

  -- GOOD: Single query with JOIN or IN
  SELECT u.*, o.*
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id;


WHEN NOT TO INDEX
═════════════════

- Small tables (<1000 rows) — full scan is fast enough
- Columns with low cardinality (e.g., boolean, status with 3 values)
- Write-heavy tables where read speed isn't critical
- Columns rarely used in WHERE/JOIN/ORDER BY
- Every index costs: disk space + slower INSERT/UPDATE/DELETE
```

## Explanation

Think of indexes as trade-offs: **faster reads, slower writes, more storage**. The art is indexing the right columns.

**Index selection checklist:**
1. Columns in `WHERE` clauses (especially equality conditions)
2. Columns in `JOIN` conditions (foreign keys)
3. Columns in `ORDER BY` (avoids filesort)
4. Columns in `GROUP BY`
5. High-cardinality columns (many unique values)

**The optimization workflow:**
1. Identify slow query (logging, APM tools)
2. Run `EXPLAIN ANALYZE`
3. Check for Seq Scans on large tables
4. Add appropriate index
5. Re-run `EXPLAIN ANALYZE` to verify improvement
6. Monitor write performance to ensure the index isn't hurting inserts

## ELI5

Imagine a library with 1 million books but no catalog. To find a specific book, you'd have to walk through every shelf. An index is like the library catalog — it tells you exactly which shelf and position to go to. The trade-off is that every time you add a new book, you also have to update the catalog. So you only make catalogs for the things people actually search for.
