---
id: react-16
title: "React 19: useActionState Hook"
category: React
subcategory: React 19
difficulty: Medium
pattern: Form Actions
companies: [Meta, Vercel, Shopify]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "useActionState wraps a form action function to give you the latest return value and a pending state. It replaces the pattern of manually managing isPending + error state for form submissions. The action receives the previous state as its first argument, enabling patterns like accumulating errors or results."
similarProblems: [useFormStatus, useOptimistic, Server Actions]
---

**What is `useActionState` in React 19 and how does it simplify form handling?**

`useActionState` (previously called `useFormState` in the React canary) is a React 19 hook that manages the state returned by a form action. It handles the entire request cycle — pending state, returned value, and errors — without manual `useState` boilerplate.

**Signature:**
```js
const [state, formAction, isPending] = useActionState(actionFn, initialState);
```

- `actionFn(previousState, formData)` — called when the form submits. Receives the previous state and the FormData.
- `initialState` — the initial value of `state` before any submission.
- Returns `[state, formAction, isPending]` where:
  - `state` — the latest value returned by `actionFn`
  - `formAction` — pass this as the form's `action` prop (or button's `formAction`)
  - `isPending` — `true` while the action is executing

**Why it matters:**

Before React 19, handling form submission required: a `useState` for the result, another `useState` for `isPending`, a `useRef` for the form, and manual try/catch logic. `useActionState` collapses all of this into one hook call.

## Examples

**Input:** A login form where the user submits email and password
**Output:** On success, returns a success message. On failure, returns a validation error — all without manual loading state management.

## Solution

```jsx
'use client';
import { useActionState } from 'react';

// ============================================
// Basic: Login form with useActionState
// ============================================

// The action — can be a Server Action or a regular async function
async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate
  if (!email.includes('@')) {
    return { success: false, error: 'Invalid email address' };
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.message };
    }

    return { success: true, error: null };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

interface LoginState {
  success: boolean;
  error: string | null;
}

const initialState: LoginState = { success: false, error: null };

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  if (state.success) {
    return <p>Welcome back! You are logged in.</p>;
  }

  return (
    <form action={formAction}>
      {state.error && (
        <p role="alert" style={{ color: 'red' }}>
          {state.error}
        </p>
      )}

      <label>
        Email
        <input type="email" name="email" required />
      </label>

      <label>
        Password
        <input type="password" name="password" required />
      </label>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}

// ============================================
// Accumulating state across submissions
// ============================================
// The action receives prevState — useful for building lists of results

interface AddItemState {
  items: string[];
  lastAdded: string | null;
}

async function addItemAction(
  prevState: AddItemState,
  formData: FormData
): Promise<AddItemState> {
  const item = formData.get('item') as string;
  // Simulate async processing
  await new Promise((r) => setTimeout(r, 500));
  return {
    items: [...prevState.items, item], // Accumulate previous items
    lastAdded: item,
  };
}

function ShoppingList() {
  const [state, formAction, isPending] = useActionState(addItemAction, {
    items: [],
    lastAdded: null,
  });

  return (
    <div>
      <ul>
        {state.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      {state.lastAdded && <p>Added: {state.lastAdded}</p>}

      <form action={formAction}>
        <input name="item" placeholder="Add item" required />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Adding...' : 'Add'}
        </button>
      </form>
    </div>
  );
}

// ============================================
// With Server Action (Next.js App Router)
// ============================================

// actions.ts (server file)
'use server';
export async function createPostAction(prevState: PostState, formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  if (title.length < 5) {
    return { success: false, error: 'Title must be at least 5 characters', postId: null };
  }

  const post = await db.post.create({ data: { title, content } });
  return { success: true, error: null, postId: post.id };
}

// CreatePostForm.tsx (client component)
'use client';
import { useActionState } from 'react';
import { createPostAction } from './actions';

function CreatePostForm() {
  const [state, formAction, isPending] = useActionState(createPostAction, {
    success: false,
    error: null,
    postId: null,
  });

  return (
    <form action={formAction}>
      <input name="title" placeholder="Post title" />
      <textarea name="content" placeholder="Content" />
      {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
      {state.postId && <p>Post created! ID: {state.postId}</p>}
      <button disabled={isPending}>{isPending ? 'Creating...' : 'Create Post'}</button>
    </form>
  );
}
```

## Explanation

CONCEPT: useActionState — Form Action State Machine

```
LIFECYCLE OF useActionState:

Initial render:
  state = initialState
  isPending = false

User submits form:
  isPending = true  ──► action(prevState, formData) starts
                                    │
                            (async work happens)
                                    │
                              action returns
                                    │
  isPending = false ◄──────── state = returnValue
  Component re-renders with new state
```

```
BEFORE React 19 (manual approach):
function LoginForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      await loginUser(new FormData(e.target));
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  }

  return <form onSubmit={handleSubmit}>...</form>;
}

AFTER React 19 (useActionState):
function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  return <form action={formAction}>...</form>;
  // No manual event handler, no try/catch, no multiple useState calls!
}
```

KEY RULES:
- Action signature is `(prevState, formData) => newState`
- Pass `formAction` directly to the form's `action` prop (not `onSubmit`)
- Works with Server Actions — no `event.preventDefault()` needed
- `isPending` is `true` during the entire async execution of the action
- The action always receives the PREVIOUS state, enabling accumulation patterns
