---
id: sd-9
title: REST vs GraphQL
category: System Design
subcategory: API Design
difficulty: Medium
pattern: API Design
companies: [Meta, Google, Amazon]
timeComplexity: N/A - architectural
spaceComplexity: N/A - architectural
keyTakeaway: "REST is simple and cacheable; GraphQL eliminates over/under-fetching. Choose REST for simple CRUD and public APIs, GraphQL for complex UIs with varied data needs."
similarProblems: [API Pagination, Caching Strategies, N+1 Problem]
---

Compare REST and GraphQL for API design. Understand the trade-offs to make informed architectural decisions.

**REST:** Resource-oriented. Each endpoint represents a resource. Uses HTTP methods (GET, POST, PUT, DELETE). Simple, cacheable, widely supported.

**GraphQL:** Query-oriented. Single endpoint. Client specifies exactly what data it needs. Solves over-fetching and under-fetching. Developed by Meta.

When would you choose one over the other?

## Solution

```js
// ════════════════════════════════════════════
// REST API EXAMPLE
// ════════════════════════════════════════════

// Endpoints for a blog:
// GET    /api/posts              → list posts
// GET    /api/posts/:id          → single post
// POST   /api/posts              → create post
// PUT    /api/posts/:id          → update post
// DELETE /api/posts/:id          → delete post
// GET    /api/posts/:id/comments → post comments
// GET    /api/users/:id          → user profile

// Problem: to show a post page, client needs 3 requests:
async function loadPostPageREST(postId) {
  const [post, comments, author] = await Promise.all([
    fetch('/api/posts/' + postId).then(r => r.json()),
    fetch('/api/posts/' + postId + '/comments').then(r => r.json()),
    // Need author info, but post only has authorId
    fetch('/api/posts/' + postId).then(r => r.json())
      .then(p => fetch('/api/users/' + p.authorId).then(r => r.json())),
  ]);

  return { post, comments, author };
  // Over-fetching: gets ALL user fields when we only need name + avatar
  // Under-fetching: needed 3 requests for one page
}

// ════════════════════════════════════════════
// GRAPHQL EXAMPLE
// ════════════════════════════════════════════

// Single request gets exactly what's needed:
async function loadPostPageGraphQL(postId) {
  const query = `
    query PostPage($id: ID!) {
      post(id: $id) {
        title
        content
        createdAt
        author {
          name
          avatar
        }
        comments {
          text
          author { name }
          createdAt
        }
      }
    }
  `;

  const res = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { id: postId },
    }),
  });

  const { data } = await res.json();
  return data.post;
  // One request, exact fields, nested data resolved
}

// ════════════════════════════════════════════
// COMPARISON
// ════════════════════════════════════════════

const comparison = {
  fetching: {
    REST: 'May over-fetch (extra fields) or under-fetch (need multiple requests)',
    GraphQL: 'Client gets exactly the fields it requests — no more, no less',
  },
  caching: {
    REST: 'Easy — HTTP caching with URLs as cache keys (CDN-friendly)',
    GraphQL: 'Harder — POST requests to single endpoint; need query-level caching',
  },
  versioning: {
    REST: 'Typically versioned URLs: /api/v1/posts, /api/v2/posts',
    GraphQL: 'No versioning needed — add new fields, deprecate old ones',
  },
  complexity: {
    REST: 'Simple to understand and implement. Many tools available.',
    GraphQL: 'Steeper learning curve. Needs schema, resolvers, client library.',
  },
  performance: {
    REST: 'Multiple round-trips for related data (N+1 on client side)',
    GraphQL: 'One round-trip, but N+1 problem moves to server (use DataLoader)',
  },
  fileUpload: {
    REST: 'Native multipart/form-data support',
    GraphQL: 'Requires special handling (multipart spec or separate REST endpoint)',
  },
  realtime: {
    REST: 'WebSocket or SSE (separate from REST)',
    GraphQL: 'Built-in subscriptions via WebSocket',
  },
  bestFor: {
    REST: 'Simple CRUD, public APIs, microservices, heavy caching needs',
    GraphQL: 'Complex UIs, mobile apps, multiple data sources, rapid frontend iteration',
  },
};

console.table(comparison);

// ════════════════════════════════════════════
// PRACTICAL: When to use which
// ════════════════════════════════════════════

// USE REST when:
// - Building a simple CRUD API
// - Need HTTP caching (CDN)
// - Public API for third parties
// - Team is more familiar with REST
// - Microservices communicating internally

// USE GRAPHQL when:
// - Frontend needs vary widely between pages
// - Mobile + web share the same backend
// - Complex, nested data relationships
// - Rapid frontend iteration (no backend changes for new views)
// - Meta, GitHub, Shopify, Airbnb use GraphQL
```

## ELI5

Imagine ordering food at a restaurant.

**REST is like a fixed menu.** There's a burger station, a salad station, a dessert station. You order from each station separately. Simple, predictable, but you might order too much (or have to make 3 trips).

```
REST — one resource per request:
  GET /posts/5          → "Here's post #5 with ALL its fields"
  GET /posts/5/comments → "Here are all comments for post #5"
  GET /users/42         → "Here's the full user profile for author #42"

  3 requests, might get fields you don't need (over-fetching)
```

**GraphQL is like telling the chef exactly what you want.** One trip to the kitchen, and the chef assembles your custom plate.

```
GraphQL — one request, exactly what you need:
  query {
    post(id: 5) {
      title              ← only the title
      author {
        name             ← only the name
        avatar           ← only the avatar
      }
      comments {
        text             ← only the text
      }
    }
  }

  1 request, exactly the fields you asked for, all nested data included.
```

**When to use which:**

```
Use REST when:
  ✓ Simple API (CRUD operations)
  ✓ Need CDN caching (REST URLs cache easily)
  ✓ Public API for third parties (REST is universally understood)

Use GraphQL when:
  ✓ Complex UI with many different data shapes
  ✓ Mobile + web with different data needs
  ✓ Many related data types to fetch together
  ✓ Frontend changes frequently without backend changes
```

GraphQL solves the "I need a bit of this, a bit of that" problem. REST shines for "give me this whole resource" simplicity.
