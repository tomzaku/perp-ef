---
id: be-6
title: Database Migrations & Schema Evolution
category: Backend
subcategory: Schema Design
difficulty: Easy
pattern: Operational Patterns
companies: [Shopify, Stripe, GitHub, Vercel, Netflix]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Database migrations are versioned, reversible changes to your schema. They enable team collaboration, reproducible environments, and safe production deployments. The key principle is: never make destructive changes in a single step — use expand-and-contract to achieve zero-downtime migrations."
similarProblems: [Schema Design, ACID Transactions, CI/CD Pipelines]
---

**How do database migrations work, and how do you safely evolve a production schema?**

As applications grow, schemas must change. Migrations provide a controlled, versioned approach to schema evolution.

## Solution

```text
WHAT ARE MIGRATIONS?
════════════════════

Migrations = versioned scripts that modify database schema.
Each migration has an UP (apply) and DOWN (rollback).

migrations/
├── 001_create_users.sql
├── 002_create_orders.sql
├── 003_add_phone_to_users.sql
├── 004_create_products.sql
└── 005_add_index_on_orders_user_id.sql

A migrations table tracks which have been applied:
| id  | name                           | applied_at          |
|-----|--------------------------------|---------------------|
| 001 | create_users                   | 2024-01-15 10:00:00 |
| 002 | create_orders                  | 2024-01-15 10:00:01 |
| 003 | add_phone_to_users             | 2024-02-01 14:30:00 |


MIGRATION EXAMPLE (Knex.js)
════════════════════════════

// migrations/20240115_create_users.ts
export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('email').unique().notNullable();
    table.string('name').notNullable();
    table.string('password_hash').notNullable();
    table.timestamps(true, true); // created_at, updated_at
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('users');
}


// migrations/20240201_add_phone_to_users.ts
export async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.string('phone', 20).nullable(); // nullable first!
  });
}

export async function down(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('phone');
  });
}


PRISMA MIGRATIONS
═════════════════

// schema.prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  phone     String?               // ← Add new field
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Generate and apply migration:
// npx prisma migrate dev --name add_phone_to_users
// Creates: prisma/migrations/20240201_add_phone_to_users/migration.sql


ZERO-DOWNTIME MIGRATION PATTERNS
═════════════════════════════════

Pattern: EXPAND AND CONTRACT

Problem: Rename column "name" → "full_name" without downtime

  ✗ BAD (breaks running app):
  ALTER TABLE users RENAME COLUMN name TO full_name;

  ✓ GOOD (3-step deploy):

  Step 1 — EXPAND (add new column):
    ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
    UPDATE users SET full_name = name;
    -- Deploy app v2: writes to BOTH name and full_name, reads from full_name

  Step 2 — MIGRATE (backfill + switch reads):
    -- Verify all rows have full_name populated
    -- Deploy app v3: writes to full_name only, reads from full_name

  Step 3 — CONTRACT (remove old column):
    ALTER TABLE users DROP COLUMN name;
    -- Only after app v3 is fully deployed and stable


SAFE MIGRATION RULES
════════════════════

✓ SAFE operations (no downtime):
  - ADD COLUMN (nullable or with default)
  - ADD INDEX CONCURRENTLY (PostgreSQL)
  - CREATE TABLE
  - ADD new enum value

✗ DANGEROUS operations (require expand-and-contract):
  - DROP COLUMN (running code may reference it)
  - RENAME COLUMN (same as drop for running code)
  - CHANGE column type (may fail on existing data)
  - ADD NOT NULL constraint (requires backfill first)
  - DROP TABLE (ensure nothing references it)

-- PostgreSQL: Create index without locking writes
CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders(user_id);
-- Regular CREATE INDEX locks writes for the duration!


MIGRATION BEST PRACTICES
═════════════════════════

1. One migration per change (small, focused)
2. Always write DOWN migrations (even if you rarely use them)
3. Test migrations against a copy of production data
4. Never edit an already-applied migration
5. Run migrations in CI/CD before deploying code
6. Use transactions where possible (DDL is transactional in PostgreSQL)
7. Large backfills: Do in batches, not one giant UPDATE
8. Lock timeouts: SET lock_timeout = '5s' to fail fast

-- Batch backfill pattern:
DO $$
DECLARE
  batch_size INT := 10000;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE users
    SET full_name = name
    WHERE full_name IS NULL
    LIMIT batch_size;

    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;

    PERFORM pg_sleep(0.1); -- brief pause to reduce load
  END LOOP;
END $$;
```

## Explanation

Migrations solve the **"works on my machine" problem** for databases. Instead of manually running SQL on production, every schema change is:
- **Versioned** — tracked in git alongside application code
- **Reproducible** — any developer can run all migrations to get an identical schema
- **Reversible** — DOWN migrations allow rollback
- **Ordered** — timestamps ensure consistent application order

The expand-and-contract pattern is the most important concept for production systems. It allows schema changes without any downtime — critical for applications that serve traffic 24/7.

## ELI5

Migrations are like a recipe book for your database. Instead of just randomly changing things, each change is a numbered recipe: "Step 3: Add a phone number column." Any cook (developer) can follow the recipes from the beginning and end up with the exact same kitchen (database). And if a recipe goes wrong, there's an "undo" version to go back.
