---
id: be-3
title: ACID Transactions & Isolation Levels
category: Backend
subcategory: Database
difficulty: Medium
pattern: Data Integrity
companies: [Google, Amazon, Stripe, Uber, Goldman Sachs]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "ACID guarantees data integrity: Atomicity (all-or-nothing), Consistency (valid state transitions), Isolation (concurrent transactions don't interfere), Durability (committed data survives crashes). Isolation levels trade correctness for performance — choose based on your tolerance for phantom reads, dirty reads, and non-repeatable reads."
similarProblems: [SQL Fundamentals, Database Indexing, Schema Design]
---

**What are ACID properties, and how do isolation levels affect concurrent database operations?**

ACID transactions are the foundation of reliable data systems. Understanding isolation levels is critical for building correct concurrent applications.

## Solution

```text
ACID PROPERTIES
═══════════════

A — ATOMICITY
  All operations in a transaction succeed or all fail.
  No partial updates.

  BEGIN;
    UPDATE accounts SET balance = balance - 100 WHERE id = 1;
    UPDATE accounts SET balance = balance + 100 WHERE id = 2;
  COMMIT;
  -- If either UPDATE fails, both are rolled back


C — CONSISTENCY
  Transaction moves database from one valid state to another.
  All constraints (NOT NULL, UNIQUE, FK, CHECK) are enforced.

  -- If balance has CHECK (balance >= 0):
  UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
  -- Fails if would make balance negative → transaction rolls back


I — ISOLATION
  Concurrent transactions behave as if they ran sequentially.
  (Level of isolation is configurable — see below)


D — DURABILITY
  Once COMMIT returns, the data survives system crashes.
  (Uses write-ahead log / WAL)


ISOLATION LEVELS
════════════════

From least to most strict:

┌──────────────────┬────────────┬─────────────────┬───────────────┐
│ Isolation Level  │ Dirty Read │ Non-Repeatable  │ Phantom Read  │
│                  │            │ Read            │               │
├──────────────────┼────────────┼─────────────────┼───────────────┤
│ READ UNCOMMITTED │ ✓ possible │ ✓ possible      │ ✓ possible    │
│ READ COMMITTED   │ ✗ prevented│ ✓ possible      │ ✓ possible    │
│ REPEATABLE READ  │ ✗ prevented│ ✗ prevented     │ ✓ possible    │
│ SERIALIZABLE     │ ✗ prevented│ ✗ prevented     │ ✗ prevented   │
└──────────────────┴────────────┴─────────────────┴───────────────┘


CONCURRENCY PROBLEMS EXPLAINED
═══════════════════════════════

1. DIRTY READ
   Reading uncommitted data from another transaction.

   Tx1: UPDATE users SET name = 'Bob' WHERE id = 1;  -- not committed
   Tx2: SELECT name FROM users WHERE id = 1;          -- reads 'Bob'
   Tx1: ROLLBACK;                                     -- reverts to 'Alice'
   Tx2 now has stale/wrong data ('Bob')

2. NON-REPEATABLE READ
   Same query returns different values within one transaction.

   Tx1: SELECT balance FROM accounts WHERE id = 1;   -- returns 1000
   Tx2: UPDATE accounts SET balance = 500 WHERE id = 1; COMMIT;
   Tx1: SELECT balance FROM accounts WHERE id = 1;   -- returns 500!

3. PHANTOM READ
   New rows appear that match a previous query's WHERE clause.

   Tx1: SELECT COUNT(*) FROM orders WHERE status = 'pending'; -- returns 5
   Tx2: INSERT INTO orders (status) VALUES ('pending'); COMMIT;
   Tx1: SELECT COUNT(*) FROM orders WHERE status = 'pending'; -- returns 6!


PRACTICAL USAGE
═══════════════

-- Set isolation level (PostgreSQL)
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
  -- your queries here
COMMIT;

-- Default isolation levels:
-- PostgreSQL: READ COMMITTED
-- MySQL/InnoDB: REPEATABLE READ
-- SQLite: SERIALIZABLE

-- Application code (Node.js with Prisma)
await prisma.$transaction(async (tx) => {
  const account = await tx.account.findUnique({ where: { id: 1 } });

  if (account.balance < amount) {
    throw new Error('Insufficient funds');
  }

  await tx.account.update({
    where: { id: 1 },
    data: { balance: { decrement: amount } }
  });

  await tx.account.update({
    where: { id: 2 },
    data: { balance: { increment: amount } }
  });
});


OPTIMISTIC vs PESSIMISTIC LOCKING
═════════════════════════════════

PESSIMISTIC (lock rows before reading):
  BEGIN;
  SELECT * FROM products WHERE id = 1 FOR UPDATE;  -- locks the row
  UPDATE products SET stock = stock - 1 WHERE id = 1;
  COMMIT;  -- releases lock
  -- Other transactions wait until lock is released

OPTIMISTIC (detect conflicts at write time):
  -- Uses a version column
  SELECT id, stock, version FROM products WHERE id = 1;
  -- version = 3, stock = 10

  UPDATE products
  SET stock = stock - 1, version = version + 1
  WHERE id = 1 AND version = 3;
  -- If affected_rows = 0 → someone else modified it → retry

  -- Better for low-contention workloads (most web apps)


WHEN TO USE WHAT
════════════════

READ COMMITTED (default for most apps):
  ✓ General CRUD operations
  ✓ Good balance of correctness and performance
  ✓ Most web applications

REPEATABLE READ:
  ✓ Reports that need consistent snapshot
  ✓ Long-running reads that must be consistent

SERIALIZABLE:
  ✓ Financial transactions
  ✓ Inventory management (preventing overselling)
  ✓ Any operation where correctness > performance

OPTIMISTIC LOCKING:
  ✓ Low contention (conflicts are rare)
  ✓ User edits (last-write-wins with conflict detection)

PESSIMISTIC LOCKING:
  ✓ High contention (many writers on same rows)
  ✓ Critical sections (payment processing)
```

## Explanation

ACID and isolation levels are about **trade-offs between correctness and performance**. Higher isolation = more correct but slower (more locking/blocking).

**For most web applications:** The default `READ COMMITTED` is sufficient. Use explicit transactions for multi-step operations (transfers, order placement) and optimistic locking for conflict detection.

**For financial/inventory systems:** Use `SERIALIZABLE` or pessimistic locking with `SELECT ... FOR UPDATE` for critical paths.

**Key mental model:** Think of isolation levels as "how much can other transactions interfere with mine?" READ UNCOMMITTED = total chaos, SERIALIZABLE = perfect isolation (but slowest).

## ELI5

Imagine you and your friend are both editing the same Google Doc. ACID is the set of rules that prevents the document from getting corrupted when you both type at the same time. "Atomicity" means your edits either fully appear or don't at all. "Isolation" is about how much you see each other's unfinished changes. A low isolation level is like seeing every letter as your friend types; a high level is like only seeing their changes once they click "Save."
