---
id: be-5
title: Database Schema Design & Normalization
category: Backend
subcategory: Schema Design
difficulty: Medium
pattern: Data Modeling
companies: [Google, Amazon, Stripe, Shopify, Uber]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Good schema design balances normalization (reducing redundancy, ensuring integrity) with practical denormalization (optimizing read performance). Follow normal forms (1NF→3NF) as a starting point, then strategically denormalize for hot read paths. Always design around your access patterns."
similarProblems: [SQL Fundamentals, Database Indexing, SQL vs NoSQL]
---

**How do you design a database schema, and when should you normalize vs denormalize?**

Schema design is one of the most impactful decisions in backend development. A bad schema leads to slow queries, data inconsistency, and painful migrations.

## Solution

```text
NORMALIZATION — REDUCING REDUNDANCY
════════════════════════════════════

1NF (First Normal Form):
  - Each column holds atomic (indivisible) values
  - No repeating groups

  ✗ BAD:
  | user_id | phones              |
  |---------|---------------------|
  | 1       | 555-0100, 555-0200  |   ← Multiple values in one cell

  ✓ GOOD:
  | user_id | phone    |
  |---------|----------|
  | 1       | 555-0100 |
  | 1       | 555-0200 |


2NF (Second Normal Form):
  - Meets 1NF
  - Every non-key column depends on the ENTIRE primary key
    (no partial dependencies)

  ✗ BAD (composite key, partial dependency):
  | order_id | product_id | product_name | quantity |
  product_name depends only on product_id, not the full key

  ✓ GOOD: Split into two tables:
  orders: order_id, product_id, quantity
  products: product_id, product_name


3NF (Third Normal Form):
  - Meets 2NF
  - No transitive dependencies (non-key → non-key)

  ✗ BAD:
  | user_id | city    | state | zip   |
  city and state depend on zip, not directly on user_id

  ✓ GOOD:
  users: user_id, zip
  locations: zip, city, state


PRACTICAL SCHEMA DESIGN EXAMPLE
════════════════════════════════

E-commerce system:

users
├── id (PK)
├── email (UNIQUE, NOT NULL)
├── name
├── password_hash
├── created_at
└── updated_at

products
├── id (PK)
├── name
├── description
├── price (DECIMAL, NOT NULL)
├── category_id (FK → categories)
├── stock_count
└── created_at

categories
├── id (PK)
├── name (UNIQUE)
└── parent_id (FK → categories, self-reference for hierarchy)

orders
├── id (PK)
├── user_id (FK → users, NOT NULL)
├── status (ENUM: pending, paid, shipped, delivered, cancelled)
├── total (DECIMAL)
├── shipping_address_id (FK → addresses)
└── created_at

order_items
├── id (PK)
├── order_id (FK → orders)
├── product_id (FK → products)
├── quantity (INT, NOT NULL)
├── unit_price (DECIMAL) ← snapshot at time of order
└── (order_id, product_id) UNIQUE


DENORMALIZATION — TRADING REDUNDANCY FOR SPEED
═══════════════════════════════════════════════

When to denormalize:
  - Read-heavy access patterns (dashboards, feeds)
  - Expensive JOINs that run frequently
  - Data that rarely changes

Common denormalization techniques:

1. MATERIALIZED VIEWS / CACHED COLUMNS
   -- Instead of: JOIN orders + order_items + products every time
   -- Add a cached column:
   ALTER TABLE users ADD COLUMN total_orders INT DEFAULT 0;
   ALTER TABLE users ADD COLUMN lifetime_spend DECIMAL DEFAULT 0;
   -- Update via triggers or application code

2. STORING SNAPSHOTS
   -- order_items.unit_price stores the price AT TIME OF PURCHASE
   -- Even if the product price changes later, the order is correct

3. EMBEDDING DENORMALIZED DATA
   -- Store shipping address directly in orders (not just a FK)
   -- Users can change their address, but past orders keep the original

4. COUNTER CACHES
   -- products.review_count instead of COUNT(*) FROM reviews
   -- Updated on INSERT/DELETE via trigger or app code


DESIGN PRINCIPLES
═════════════════

1. Start normalized (3NF), then denormalize where needed
2. Design for your access patterns, not abstract purity
3. Use UUIDs vs auto-increment IDs thoughtfully
   - UUIDs: No sequential guessing, distributed-friendly
   - Auto-increment: Smaller, faster indexes, natural ordering
4. Always include created_at and updated_at
5. Use DECIMAL for money, never FLOAT
6. Store prices in cents (integer) to avoid floating point issues
7. Soft delete (deleted_at) vs hard delete — depends on compliance needs
8. Add indexes for foreign keys (not automatic in all databases)


MIGRATION STRATEGY
══════════════════

-- Safe migration pattern (zero-downtime):
-- 1. Add new column (nullable)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- 2. Backfill data
UPDATE users SET phone = ... ;

-- 3. Deploy app code that writes to both old and new
-- 4. Add NOT NULL constraint (after backfill)
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;

-- 5. Remove old column (after verifying)
-- NEVER do step 4 and 5 in the same deploy!
```

## Explanation

**The normalization paradox:** Normalization gives you data integrity and reduces redundancy, but fully normalized schemas can require many JOINs, hurting read performance. The pragmatic approach is to normalize first (ensuring correctness), then denormalize specific hot paths.

**Rules of thumb:**
- Tables that represent **entities** (users, products) should be normalized
- Tables that represent **events/logs** (orders, analytics) can be denormalized for speed
- If a JOIN runs 1000x/second, consider denormalizing
- If data is modified from multiple places, keep it normalized

## ELI5

Normalization is like organizing your closet — socks in one drawer, shirts in another. Nothing is duplicated. But if you're getting dressed for work every morning, it's faster to have a "work outfit" drawer with matching socks + shirt + pants already together, even though that means some duplication. Database design is the same trade-off: organized but slow, or a bit messy but fast.
