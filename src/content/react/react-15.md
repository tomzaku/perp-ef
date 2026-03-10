---
id: react-15
title: "React 19: use() Hook"
category: React
subcategory: React 19
difficulty: Medium
pattern: Async Data Fetching
companies: [Meta, Vercel, Netflix]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "The use() hook lets you read a Promise or Context inside a component body (including inside loops and conditionals). Unlike hooks, use() is not limited by the rules of hooks placement. When the Promise is pending, React suspends the component and shows the nearest Suspense fallback."
similarProblems: [Suspense and Lazy Loading, useEffect Data Fetching, Server Components]
---

**What is the `use()` hook in React 19 and how does it differ from `useEffect` for data fetching?**

React 19 introduces `use()` — a new API that lets you read the value of a resource (a Promise or a Context) directly inside a component's render phase.

**Key characteristics:**

- **Suspense-integrated:** When you pass a Promise to `use()`, React suspends the component until the Promise resolves, then re-renders with the resolved value. The nearest `<Suspense>` boundary shows a fallback while waiting.
- **Error Boundary-integrated:** Rejected Promises bubble to the nearest Error Boundary, just like thrown errors.
- **Not a traditional hook:** `use()` can be called conditionally and inside loops, unlike `useState` or `useEffect`. It still must be called inside a component or custom hook.
- **Context reading:** `use(MyContext)` is equivalent to `useContext(MyContext)` but can be called conditionally.

**Comparison with useEffect fetching:**

| Aspect | useEffect fetch | use() |
|---|---|---|
| When data loads | After render (waterfall) | During render (Suspense) |
| Loading state | Manual `isLoading` state | Suspense fallback |
| Error state | Manual `error` state | Error Boundary |
| Conditional use | Always called | Can be conditional |
| Server Components | Not available | Works with Server Components |

## Examples

**Input:** A Promise for user data is created outside the component (e.g., in a Server Component or cache)
**Output:** The component reads the resolved value directly — no loading state needed in the component

## Solution

```jsx
import { use, Suspense } from 'react';

// ============================================
// Basic use() with a Promise
// ============================================

// Create the promise OUTSIDE the component (don't create inside render!)
// In real apps this comes from a Server Component, cache(), or route loader
const userPromise = fetch('/api/user/1').then((r) => r.json());

function UserProfile() {
  // React suspends here until the promise resolves
  const user = use(userPromise);

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Wrap with Suspense to handle loading state
function App() {
  return (
    <Suspense fallback={<p>Loading user...</p>}>
      <UserProfile />
    </Suspense>
  );
}

// ============================================
// use() with conditional logic (NOT possible with useContext)
// ============================================
const ThemeContext = createContext('light');

function ThemedButton({ showLabel }: { showLabel: boolean }) {
  // use() CAN be called inside an if block — unlike useContext
  if (showLabel) {
    const theme = use(ThemeContext);
    return <button className={theme}>Labeled Button</button>;
  }
  return <button>Button</button>;
}

// ============================================
// Passing promise as a prop (Server → Client pattern)
// ============================================

// server-component.tsx (Server Component)
async function ServerPage() {
  // Start fetch on the server
  const commentsPromise = getComments(); // Returns Promise<Comment[]>

  return (
    <div>
      <h1>Post</h1>
      {/* Pass promise to client — don't await it */}
      <Suspense fallback={<p>Loading comments...</p>}>
        <Comments commentsPromise={commentsPromise} />
      </Suspense>
    </div>
  );
}

// client-component.tsx (Client Component)
'use client';
function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  // use() reads the promise — suspends until ready
  const comments = use(commentsPromise);

  return (
    <ul>
      {comments.map((c) => (
        <li key={c.id}>{c.text}</li>
      ))}
    </ul>
  );
}

// ============================================
// Error handling with Error Boundary
// ============================================
import { Component, type ReactNode } from 'react';

class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const riskyPromise = fetch('/api/might-fail').then((r) => {
  if (!r.ok) throw new Error('Fetch failed');
  return r.json();
});

function RiskyComponent() {
  const data = use(riskyPromise); // Rejected promise → Error Boundary
  return <p>{data.value}</p>;
}

function SafeApp() {
  return (
    <ErrorBoundary fallback={<p>Something went wrong.</p>}>
      <Suspense fallback={<p>Loading...</p>}>
        <RiskyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## Explanation

CONCEPT: use() — Suspense-aware Resource Reading

```
RENDERING WITH use():

Component renders
       │
       ▼
  use(promise) ──── Promise pending? ──── YES ──► Suspend
       │                                           │
       │                                    Suspense fallback
       │                                    shown to user
       │                                           │
       │                                    Promise resolves
       │                                           │
       ◄───────────────────────────────────────────┘
       │
  Returns resolved value
       │
       ▼
  Component finishes rendering
```

```
WHEN TO CREATE THE PROMISE:

❌ BAD — promise recreated on every render:
function Component() {
  const promise = fetch('/api/data').then(r => r.json()); // new promise every render!
  const data = use(promise); // suspends on every render
}

✅ GOOD — promise created outside component:
const promise = fetch('/api/data').then(r => r.json()); // created once

function Component() {
  const data = use(promise); // suspends only once
}

✅ GOOD — promise from parent (Server Component or cache):
function Parent() {
  const promise = getDataFromCache(); // stable reference
  return <Child dataPromise={promise} />;
}
```

KEY RULES:
- Always create the Promise OUTSIDE the component (or use React's cache())
- Pair with `<Suspense>` for loading states
- Pair with `<ErrorBoundary>` for error states
- `use()` can be called conditionally — unlike traditional hooks
- Does not replace useEffect for side effects (subscriptions, timers, etc.)
