---
id: be-1
title: SQL Fundamentals (JOINs, Subqueries, GROUP BY)
category: Backend
subcategory: SQL & Querying
difficulty: Easy
pattern: Query Patterns
companies: [Google, Amazon, Meta, Stripe, Shopify]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Master the core SQL operations: JOINs combine rows from multiple tables, GROUP BY aggregates data, and subqueries nest queries within queries. Understanding when to use each — and how they affect performance — is fundamental to backend development."
similarProblems: [Database Indexing, Schema Design, ORMs vs Raw SQL]
---

**Explain SQL JOINs, subqueries, and GROUP BY — when do you use each and what are the performance implications?**

SQL is the foundation of relational data access. These three operations cover 90% of real-world queries.

## Solution

```sql
-- ═══════════════════════════════════
-- JOINs — Combine rows from multiple tables
-- ═══════════════════════════════════

-- Sample tables:
-- users: id, name, email
-- orders: id, user_id, total, created_at
-- products: id, name, price
-- order_items: order_id, product_id, quantity

-- INNER JOIN: Only matching rows from both tables
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
-- Users without orders are excluded

-- LEFT JOIN: All rows from left table + matching right
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;
-- Users with 0 orders show as order_count = 0

-- RIGHT JOIN: All from right + matching left (rarely used)
-- FULL OUTER JOIN: All from both sides (Postgres, not MySQL)

-- Multiple JOINs
SELECT u.name, p.name AS product, oi.quantity
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id;

-- SELF JOIN: Table joined to itself
-- Example: Find employees and their managers
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;


-- ═══════════════════════════════════
-- GROUP BY — Aggregate rows
-- ═══════════════════════════════════

-- Basic aggregation
SELECT category, COUNT(*) AS total, AVG(price) AS avg_price
FROM products
GROUP BY category;

-- HAVING: Filter groups (WHERE filters rows, HAVING filters groups)
SELECT user_id, SUM(total) AS lifetime_spend
FROM orders
GROUP BY user_id
HAVING SUM(total) > 1000;

-- Common aggregates: COUNT, SUM, AVG, MIN, MAX, ARRAY_AGG, STRING_AGG


-- ═══════════════════════════════════
-- SUBQUERIES — Queries within queries
-- ═══════════════════════════════════

-- Scalar subquery (returns one value)
SELECT name, total,
  (SELECT AVG(total) FROM orders) AS avg_total
FROM orders;

-- IN subquery (returns a list)
SELECT name FROM users
WHERE id IN (
  SELECT user_id FROM orders WHERE total > 500
);

-- EXISTS subquery (checks existence — often faster than IN)
SELECT name FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.total > 500
);

-- Derived table / FROM subquery
SELECT category, avg_price
FROM (
  SELECT category, AVG(price) AS avg_price
  FROM products
  GROUP BY category
) AS category_stats
WHERE avg_price > 50;

-- CTE (Common Table Expression) — cleaner than nested subqueries
WITH high_spenders AS (
  SELECT user_id, SUM(total) AS lifetime_spend
  FROM orders
  GROUP BY user_id
  HAVING SUM(total) > 1000
)
SELECT u.name, hs.lifetime_spend
FROM users u
JOIN high_spenders hs ON u.id = hs.user_id;


-- ═══════════════════════════════════
-- WINDOW FUNCTIONS — Aggregate without collapsing rows
-- ═══════════════════════════════════

-- Rank users by total spending
SELECT
  u.name,
  SUM(o.total) AS spend,
  RANK() OVER (ORDER BY SUM(o.total) DESC) AS rank
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- Running total
SELECT
  created_at,
  total,
  SUM(total) OVER (ORDER BY created_at) AS running_total
FROM orders;
```

## Explanation

**When to use what:**

| Operation | Use when | Watch out for |
|---|---|---|
| JOIN | Combining data from related tables | Cartesian explosion with bad ON clauses |
| LEFT JOIN | Need all rows from one side even without matches | NULL handling in results |
| GROUP BY | Aggregating (count, sum, avg) | Every non-aggregate column must be in GROUP BY |
| Subquery (IN) | Filtering by values from another table | Can be slow on large datasets |
| Subquery (EXISTS) | Checking existence (often faster than IN) | Correlated subqueries run per row |
| CTE | Complex multi-step queries | Not always optimized (Postgres materializes CTEs before v12) |
| Window function | Aggregation while keeping individual rows | Can be memory-intensive |

**Performance tips:**
- Prefer `EXISTS` over `IN` for large datasets
- Use CTEs for readability but know your database's optimization behavior
- Always check the query plan (`EXPLAIN ANALYZE`) for slow queries
- JOINs on indexed foreign keys are fast; without indexes they're table scans

## ELI5

Imagine you have a class roster (students) and a grade book (test scores). A JOIN is like matching each student to their test scores by name. GROUP BY is like asking "what's the average score per class?" A subquery is like first finding all students who scored above 90, then looking up their names. Each tool helps you ask a different kind of question about your data.
