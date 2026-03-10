---
id: react-19
title: "React 19: Server Components & Server Actions"
category: React
subcategory: React 19
difficulty: Hard
pattern: Full-Stack React
companies: [Meta, Vercel, Shopify, Netflix]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "React Server Components (RSC) render exclusively on the server, allowing direct database/filesystem access with zero client-side JS bundle cost. Server Actions are async functions marked 'use server' that let client components call server-side code directly. Together they enable full-stack React without a separate API layer."
similarProblems: [use() Hook, useActionState, useOptimistic]
---

**Explain React Server Components and Server Actions. How do they differ from traditional React components?**

React 19 stabilizes two features that fundamentally change how React applications are built: **React Server Components (RSC)** and **Server Actions**.

**React Server Components:**

RSCs are components that render **only on the server**. They:
- Can access server resources directly (databases, file systems, environment secrets)
- Have **zero JavaScript bundle cost** — their code never ships to the client
- Cannot use browser APIs, state (`useState`), or effects (`useEffect`)
- Cannot use event handlers (`onClick`, etc.)
- Can be `async` functions — `await` data directly without `useEffect`
- Can import Server-only modules (e.g., database clients) safely

**Client Components** (opt-in with `'use client'`):
- Render on the client (and can optionally SSR)
- Can use all hooks, event handlers, and browser APIs
- Their code IS included in the JS bundle

**Server Actions:**

Server Actions are async functions marked with `'use server'` that execute on the server but can be called from Client Components. They:
- Are the React 19 replacement for API routes in many cases
- Work natively with HTML forms (no `event.preventDefault()` needed)
- Are automatically serialized and called via network request
- Integrate with `useActionState` and `useOptimistic`

## Examples

**Input:** A dashboard page that needs user data from a database and allows posting comments
**Output:** Server Component fetches data directly; Server Action handles comment submission; Client Component manages interactive UI

## Solution

```jsx
// ============================================
// File structure for Next.js App Router (RSC model)
// ============================================
// app/
//   dashboard/
//     page.tsx          ← Server Component (default)
//     CommentForm.tsx   ← Client Component ('use client')
//     actions.ts        ← Server Actions ('use server')

// ============================================
// Server Component — direct DB access, async/await
// ============================================

// app/dashboard/page.tsx
import { db } from '@/lib/db'; // Server-only — never sent to client
import { CommentForm } from './CommentForm';
import { addCommentAction } from './actions';

// Async Server Component — await directly, no useEffect
export default async function DashboardPage() {
  // Direct DB query — no API route needed!
  const user = await db.user.findUnique({
    where: { id: getCurrentUserId() },
  });

  const posts = await db.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <main>
      <h1>Welcome, {user.name}</h1>

      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          {/* Client Component for interactivity */}
          <CommentForm postId={post.id} action={addCommentAction} />
        </article>
      ))}
    </main>
  );
}

// ============================================
// Server Actions — called from client, runs on server
// ============================================

// app/dashboard/actions.ts
'use server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CommentSchema = z.object({
  text: z.string().min(1).max(500),
  postId: z.number(),
});

interface CommentState {
  success: boolean;
  error: string | null;
}

// Server Action — runs on server, called from client
export async function addCommentAction(
  prevState: CommentState,
  formData: FormData
): Promise<CommentState> {
  // Validate input
  const parsed = CommentSchema.safeParse({
    text: formData.get('text'),
    postId: Number(formData.get('postId')),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const userId = await getAuthenticatedUserId(); // Server-side auth check

  try {
    await db.comment.create({
      data: {
        text: parsed.data.text,
        postId: parsed.data.postId,
        authorId: userId,
      },
    });

    // Invalidate cached page data
    revalidatePath('/dashboard');

    return { success: true, error: null };
  } catch {
    return { success: false, error: 'Failed to add comment' };
  }
}

// ============================================
// Client Component — uses Server Action via useActionState
// ============================================

// app/dashboard/CommentForm.tsx
'use client';
import { useActionState } from 'react';

interface CommentFormProps {
  postId: number;
  action: (prevState: CommentState, formData: FormData) => Promise<CommentState>;
}

export function CommentForm({ postId, action }: CommentFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    success: false,
    error: null,
  });

  if (state.success) {
    return <p>Comment posted!</p>;
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="postId" value={postId} />
      <textarea name="text" placeholder="Add a comment..." required />
      {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
}

// ============================================
// Passing data from Server → Client Components
// ============================================

// Server Component can pass serializable props to Client Components
async function ProductPage({ productId }: { productId: string }) {
  const product = await db.product.findUnique({ where: { id: productId } });

  return (
    <div>
      {/* Static server-rendered content */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      {/* Interactive client component receives serializable data */}
      <AddToCartButton
        productId={product.id}
        productName={product.name}
        price={product.price}
      />
    </div>
  );
}

// ============================================
// What you CANNOT do in a Server Component
// ============================================
// ❌ 'use client' directive
// ❌ useState, useEffect, useRef, useContext
// ❌ Event handlers (onClick, onChange, etc.)
// ❌ Browser APIs (window, document, localStorage)
// ❌ Class components

// ============================================
// What you CAN do in a Server Component
// ❌ async/await at the top level
// ✅ Database queries directly
// ✅ Read environment secrets (process.env)
// ✅ File system access (fs module)
// ✅ Render Client Components as children
// ✅ Import server-only packages
```

## Explanation

CONCEPT: Server vs Client Components

```
REQUEST LIFECYCLE:

Browser                  Server
  │                        │
  │── GET /dashboard ──────►│
  │                        │ Server Component renders:
  │                        │  1. await db.user.findUnique(...)
  │                        │  2. await db.post.findMany(...)
  │                        │  3. Renders JSX tree
  │                        │
  │◄── HTML + RSC Payload ─│
  │                        │
  │  Client Components     │
  │  hydrate in browser    │
  │  (CommentForm etc.)    │

BUNDLE SIZE IMPACT:
  Traditional: ALL component code → client bundle
  RSC:         Server Component code → stays on server
               Client Component code → client bundle only
```

```
SERVER ACTION CALL FLOW:

User submits form in browser
         │
         ▼
  formAction(formData)  [Client Component]
         │
         │  Automatic POST request to server
         ▼
  addCommentAction(prevState, formData)  [Server]
         │
         ├── Validate input
         ├── Check authentication
         ├── Write to database
         ├── Revalidate cache
         │
         ▼
  Returns state → Client Component re-renders
```

```
COMPONENT TREE — Who renders where:

DashboardPage (Server) ──────────────────► renders on server
  │
  ├── <h1>Welcome</h1>           Server: static HTML
  │
  └── CommentForm (Client) ──────────────► hydrates in browser
        │
        ├── <form>               HTML from server
        ├── <textarea>
        └── <button>             + interactive JS from client bundle
```

KEY RULES:
- Default components are Server Components in Next.js App Router
- Add `'use client'` at the top of a file to make it a Client Component
- Server Actions require `'use server'` — either at the top of a file or inside an async function
- You CAN import Client Components into Server Components
- You CANNOT import Server Components into Client Components
- Props passed from Server → Client must be serializable (no functions, no class instances)
- Server Actions can be passed as props to Client Components (they serialize as RPC references)
