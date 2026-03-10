---
id: react-17
title: "React 19: useOptimistic Hook"
category: React
subcategory: React 19
difficulty: Medium
pattern: Optimistic UI
companies: [Meta, Twitter, Airbnb]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "useOptimistic lets you show a temporary optimistic state immediately while an async action is in progress, then automatically reverts to the real state once the action completes. It provides instant UI feedback without compromising data integrity."
similarProblems: [useActionState, Server Actions, Suspense and Data Fetching]
---

**What is `useOptimistic` in React 19 and when should you use it?**

`useOptimistic` is a React 19 hook that enables **optimistic UI updates** — showing a tentative state immediately while an async operation (network request, Server Action) is in progress, then automatically rolling back or committing to the real state when the operation completes.

**Signature:**
```js
const [optimisticState, addOptimistic] = useOptimistic(state, updateFn);
```

- `state` — the real, server-confirmed state
- `updateFn(currentState, optimisticValue)` — pure function that merges the optimistic value into state
- `optimisticState` — the displayed state (optimistic while pending, real state otherwise)
- `addOptimistic(optimisticValue)` — call this to trigger an optimistic update

**How it works:**

1. User performs an action (e.g., likes a post).
2. Call `addOptimistic(newLikeCount)` — UI instantly shows the new count.
3. The async request runs in the background.
4. When the request settles, `optimisticState` automatically reverts to `state` (the real value), which by then should reflect the server's response.

**When to use:**

- Like/upvote buttons
- Todo list item toggle
- Adding items to a cart
- Any mutation where instant feedback matters more than waiting for confirmation

## Examples

**Input:** User clicks "Like" on a post
**Output:** Like count increments immediately in the UI; if the request fails, it reverts to the original count

## Solution

```jsx
'use client';
import { useOptimistic, useState, useTransition } from 'react';

// ============================================
// Basic: Like button with optimistic update
// ============================================
interface Post {
  id: number;
  title: string;
  likes: number;
  likedByUser: boolean;
}

async function toggleLikeOnServer(postId: number, liked: boolean): Promise<Post> {
  const res = await fetch(`/api/posts/${postId}/like`, {
    method: liked ? 'POST' : 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to toggle like');
  return res.json();
}

function LikeButton({ post, onUpdate }: { post: Post; onUpdate: (p: Post) => void }) {
  const [isPending, startTransition] = useTransition();

  const [optimisticPost, addOptimistic] = useOptimistic(
    post,
    // updateFn: merge optimistic value into current state
    (currentPost, optimisticLiked: boolean) => ({
      ...currentPost,
      likedByUser: optimisticLiked,
      likes: optimisticLiked ? currentPost.likes + 1 : currentPost.likes - 1,
    })
  );

  function handleLike() {
    const newLiked = !post.likedByUser;

    startTransition(async () => {
      // 1. Show optimistic state immediately
      addOptimistic(newLiked);

      try {
        // 2. Send real request
        const updatedPost = await toggleLikeOnServer(post.id, newLiked);
        // 3. Commit real state (optimistic reverts automatically)
        onUpdate(updatedPost);
      } catch {
        // On error, optimistic state auto-reverts to `post`
        console.error('Failed to toggle like');
      }
    });
  }

  return (
    <button onClick={handleLike} disabled={isPending}>
      {optimisticPost.likedByUser ? '❤️' : '🤍'} {optimisticPost.likes}
    </button>
  );
}

// ============================================
// Optimistic todo list — adding items
// ============================================
interface Todo {
  id: number | string; // string for temp optimistic items
  text: string;
  completed: boolean;
  sending?: boolean; // flag for optimistic items
}

async function addTodoToServer(text: string): Promise<Todo> {
  const res = await fetch('/api/todos', {
    method: 'POST',
    body: JSON.stringify({ text }),
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json(); // Returns todo with real ID from server
}

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Buy milk', completed: false },
    { id: 2, text: 'Walk dog', completed: false },
  ]);

  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (currentTodos, newTodo: Todo) => [...currentTodos, newTodo]
  );

  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const text = (form.elements.namedItem('text') as HTMLInputElement).value;
    form.reset();

    // Temp ID for the optimistic item
    const tempId = `temp-${Date.now()}`;

    startTransition(async () => {
      // Show optimistic item immediately with a "sending" flag
      addOptimisticTodo({ id: tempId, text, completed: false, sending: true });

      const newTodo = await addTodoToServer(text);
      // Replace optimistic item with real item
      setTodos((prev) => [...prev.filter((t) => t.id !== tempId), newTodo]);
    });
  }

  return (
    <div>
      <ul>
        {optimisticTodos.map((todo) => (
          <li
            key={todo.id}
            style={{ opacity: todo.sending ? 0.5 : 1 }}
          >
            {todo.text} {todo.sending && '(saving...)'}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <input name="text" placeholder="New todo" required />
        <button type="submit" disabled={isPending}>Add</button>
      </form>
    </div>
  );
}

// ============================================
// With useActionState — combined pattern
// ============================================
import { useActionState, useOptimistic } from 'react';

interface CartItem { id: number; name: string; quantity: number }

async function addToCartAction(
  prevState: CartItem[],
  formData: FormData
): Promise<CartItem[]> {
  const id = Number(formData.get('productId'));
  const name = formData.get('productName') as string;

  await fetch('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ productId: id }),
  });

  // Return new cart state (from server or local merge)
  return [...prevState, { id, name, quantity: 1 }];
}

function Cart({ productId, productName }: { productId: number; productName: string }) {
  const [cart, formAction, isPending] = useActionState(addToCartAction, []);

  const [optimisticCart, addOptimisticItem] = useOptimistic(
    cart,
    (current, item: CartItem) => [...current, { ...item, sending: true }]
  );

  return (
    <form
      action={async (formData) => {
        addOptimisticItem({ id: productId, name: productName, quantity: 1 });
        await formAction(formData);
      }}
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productName" value={productName} />
      <p>Cart items: {optimisticCart.length}</p>
      <button disabled={isPending}>Add to Cart</button>
    </form>
  );
}
```

## Explanation

CONCEPT: useOptimistic — Instant UI with Automatic Revert

```
WITHOUT optimistic UI:
User clicks Like
  → Request starts (300ms)
  → UI still shows old state (user waits)
  → Response arrives
  → UI updates ✓
  (Feels slow and unresponsive)

WITH useOptimistic:
User clicks Like
  → addOptimistic() called
  → UI shows new state IMMEDIATELY ✓
  → Request runs in background (300ms)
  → Response arrives, real state commits
  (Feels instant and snappy)

If request FAILS:
  → optimisticState auto-reverts to `state`
  → UI shows original value again
```

```
STATE FLOW:

                    ┌─ addOptimistic(value) called
                    │
optimisticState = updateFn(currentState, value)   ← shown immediately
                    │
           async action runs...
                    │
              ┌─────┴──────┐
           success        failure
              │              │
       state = serverResult  │
       optimisticState      optimisticState
       = state (committed)   = state (reverted)
```

KEY RULES:
- `addOptimistic` must be called inside `startTransition` or a form action
- `updateFn` must be a pure function (no side effects)
- On success: set the real state to the server result — optimistic value is discarded
- On failure: do nothing — optimistic value automatically reverts to `state`
- Combine with `useActionState` for full form action + optimistic update pattern
