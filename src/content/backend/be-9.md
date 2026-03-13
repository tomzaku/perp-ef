---
id: be-9
title: ORMs vs Query Builders vs Raw SQL
category: Backend
subcategory: Architecture
difficulty: Medium
pattern: Abstraction Levels
companies: [Shopify, Stripe, GitHub, Vercel, Prisma]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "ORMs (Prisma, TypeORM) provide the highest abstraction with type safety and migrations but can hide performance issues. Query builders (Knex, Kysely) offer SQL control with composability. Raw SQL gives maximum performance control. Choose based on team expertise, query complexity, and performance requirements — many teams use a combination."
similarProblems: [SQL Fundamentals, Database Indexing, Schema Design]
---

**What are the trade-offs between ORMs, query builders, and raw SQL?**

How you interact with the database is a key architectural decision. Each approach has distinct advantages.

## Solution

```typescript
// ═══════════════════════════════════
// SAME QUERY — THREE APPROACHES
// ═══════════════════════════════════

// "Get all orders for a user with product details, ordered by date"


// ─── 1. ORM: PRISMA ─────────────────

const orders = await prisma.order.findMany({
  where: { userId: 'user-123' },
  include: {
    items: {
      include: { product: true }
    }
  },
  orderBy: { createdAt: 'desc' }
});
// Returns fully typed objects with nested relations
// Type: (Order & { items: (OrderItem & { product: Product })[] })[]


// ─── 2. QUERY BUILDER: KNEX ─────────

const orders = await knex('orders')
  .select('orders.*', 'products.name as product_name', 'order_items.quantity')
  .join('order_items', 'orders.id', 'order_items.order_id')
  .join('products', 'order_items.product_id', 'products.id')
  .where('orders.user_id', 'user-123')
  .orderBy('orders.created_at', 'desc');
// Returns flat rows, manual typing needed


// ─── 3. RAW SQL ──────────────────────

const orders = await db.query(`
  SELECT o.*, p.name as product_name, oi.quantity
  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  JOIN products p ON oi.product_id = p.id
  WHERE o.user_id = $1
  ORDER BY o.created_at DESC
`, ['user-123']);
// Returns raw rows, no typing, full SQL control


// ═══════════════════════════════════
// ORM DEEP DIVE: PRISMA
// ═══════════════════════════════════

// Schema definition (schema.prisma)
// model User {
//   id       String  @id @default(uuid())
//   email    String  @unique
//   name     String
//   orders   Order[]
// }
//
// model Order {
//   id        String      @id @default(uuid())
//   user      User        @relation(fields: [userId], references: [id])
//   userId    String
//   items     OrderItem[]
//   total     Decimal
//   createdAt DateTime    @default(now())
// }

// CRUD operations
const user = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    name: 'Alice',
    orders: {
      create: {                           // Nested create
        total: 99.99,
        items: {
          create: [
            { productId: 'prod-1', quantity: 2 }
          ]
        }
      }
    }
  },
  include: { orders: { include: { items: true } } }
});

// Transactions
const [order, inventory] = await prisma.$transaction([
  prisma.order.create({ data: orderData }),
  prisma.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } }
  })
]);


// ═══════════════════════════════════
// QUERY BUILDER: KYSELY (type-safe)
// ═══════════════════════════════════

import { Kysely, PostgresDialect } from 'kysely';

interface Database {
  users: { id: string; email: string; name: string };
  orders: { id: string; user_id: string; total: number; created_at: Date };
}

const db = new Kysely<Database>({ dialect: new PostgresDialect({ pool }) });

// Type-safe query building
const result = await db
  .selectFrom('orders')
  .innerJoin('users', 'users.id', 'orders.user_id')
  .select(['orders.id', 'orders.total', 'users.name'])
  .where('orders.user_id', '=', userId)
  .orderBy('orders.created_at', 'desc')
  .limit(10)
  .execute();
// Fully typed: { id: string; total: number; name: string }[]


// ═══════════════════════════════════
// COMPARISON TABLE
// ═══════════════════════════════════
//
//                   │ ORM (Prisma)  │ Query Builder  │ Raw SQL
// ──────────────────┼───────────────┼────────────────┼──────────
// Type safety       │ Excellent     │ Good (Kysely)  │ None
// Learning curve    │ Medium        │ Low            │ Need SQL
// Complex queries   │ Limited       │ Good           │ Full
// N+1 prevention    │ Built-in      │ Manual         │ Manual
// Migrations        │ Built-in      │ Built-in       │ Manual
// Performance       │ Good*         │ Very Good      │ Best
// Debugging         │ Harder        │ Easy           │ Easiest
// Schema changes    │ Automated     │ Semi-auto      │ Manual
// Abstraction       │ High          │ Medium         │ None
//
// * ORMs can generate suboptimal queries for complex relations


// ═══════════════════════════════════
// THE N+1 PROBLEM
// ═══════════════════════════════════

// BAD — N+1 queries (1 for users + N for each user's orders):
const users = await prisma.user.findMany();
for (const user of users) {
  const orders = await prisma.order.findMany({
    where: { userId: user.id }
  });
}
// 101 queries for 100 users!

// GOOD — Eager loading (2 queries total):
const users = await prisma.user.findMany({
  include: { orders: true }
});
// Query 1: SELECT * FROM users
// Query 2: SELECT * FROM orders WHERE user_id IN (...)

// GOOD with query builder — Single JOIN:
const result = await knex('users')
  .leftJoin('orders', 'users.id', 'orders.user_id')
  .select('users.*', 'orders.*');
```

## Explanation

**When to use what:**

- **ORM (Prisma, Drizzle)**: Best for CRUD-heavy applications, rapid development, and teams that want type safety and automated migrations. Accept the abstraction cost
- **Query builder (Kysely, Knex)**: Best when you need SQL control with composability. Good for dynamic queries (variable filters, sorting)
- **Raw SQL**: Best for complex analytics queries, performance-critical paths, and when you need database-specific features (CTEs, window functions, recursive queries)

**Pragmatic approach**: Use an ORM for 90% of CRUD operations, drop to raw SQL for the 10% of complex queries. Most ORMs support raw queries (Prisma's `$queryRaw`, TypeORM's `query()`).

## ELI5

An ORM is like using Google Translate to talk to someone who speaks a different language — convenient and good enough for everyday conversations, but sometimes it translates things awkwardly. A query builder is like having a phrasebook — you still need to know some words, but it helps you construct proper sentences. Raw SQL is like being fluent in the language — you can say exactly what you mean, but you need to learn the language first.
