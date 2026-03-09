---
id: react-13
title: Key Prop and List Rendering
category: React
subcategory: Core Concepts
difficulty: Easy
pattern: Reconciliation
companies: [Amazon, Microsoft]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Keys help React match list items across re-renders. Use stable, unique IDs from your data — never use array index for dynamic lists or Math.random(). Index keys cause state mismatches and unnecessary DOM updates when items are reordered, inserted, or deleted. Keys can also be used intentionally to force a component to remount and reset its state."
similarProblems: [Virtual DOM and Reconciliation, "React.memo, useMemo, useCallback", React Fiber Architecture]
---

**Why is the `key` prop important in React, and what happens when you use it incorrectly?**

The `key` prop is a special attribute that helps React identify which items in a list have changed, been added, or been removed. It is critical for efficient reconciliation of lists.

**How keys work in reconciliation:**

When React diffs a list of children, it needs to match elements between the old and new lists. Without keys, React compares elements by index position. With keys, React matches elements by their key value.

**Rules for keys:**
1. Keys must be **unique among siblings** (not globally unique).
2. Keys must be **stable** — the same item should always get the same key across re-renders.
3. Keys should be **predictable** — derived from the data, not from rendering context.

**What happens with bad keys:**

- **Using index as key:** If the list is reordered, items are inserted, or items are deleted from the middle, React matches elements by position. This leads to:
  - Incorrect component reuse (wrong state in wrong component).
  - Unnecessary re-renders.
  - Bugs with form inputs, animations, and focus state.

- **Using random values (Math.random(), uuid() on each render):** React treats every element as new on every render, causing:
  - Complete unmount/remount of all list items.
  - Loss of component state and DOM state.
  - Terrible performance.

**When index keys are acceptable:**
- The list is static (never reordered or filtered).
- Items have no state or uncontrolled DOM state.
- The list is never reordered, and items are only appended to the end.

**Best practice:** Use a stable, unique identifier from your data (database ID, slug, etc.) as the key.

## Examples

**Input:** List of [A, B, C] reordered to [C, A, B] with index keys
**Output:** React mutates all three DOM nodes instead of simply moving them
*With index keys, React sees key=0 changed from A to C, key=1 changed from B to A, etc. — it updates all three. With proper keys, React knows to just reorder.*


## Solution

```js
import React, { useState } from 'react';

// ============================================
// Problem: Using index as key with reordering
// ============================================

interface Todo {
  id: string;
  text: string;
}

// BAD: Using index as key
function TodoListBad() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 'a', text: 'Learn React' },
    { id: 'b', text: 'Build project' },
    { id: 'c', text: 'Deploy app' },
  ]);

  const addToTop = () => {
    setTodos([
      { id: Date.now().toString(), text: 'New todo' },
      ...todos,
    ]);
  };

  return (
    <div>
      <h3>BAD: Index as key</h3>
      <button onClick={addToTop}>Add to top</button>
      <ul>
        {todos.map((todo, index) => (
          // index as key: Adding to top shifts all indices
          // React thinks key=0 changed (was "Learn React", now "New todo")
          // So it updates ALL items instead of just inserting one
          <li key={index}>
            <input defaultValue={todo.text} />
            {/* defaultValue won't update because React reuses the DOM node */}
          </li>
        ))}
      </ul>
    </div>
  );
}

// GOOD: Using stable unique ID as key
function TodoListGood() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 'a', text: 'Learn React' },
    { id: 'b', text: 'Build project' },
    { id: 'c', text: 'Deploy app' },
  ]);

  const addToTop = () => {
    setTodos([
      { id: Date.now().toString(), text: 'New todo' },
      ...todos,
    ]);
  };

  return (
    <div>
      <h3>GOOD: Unique ID as key</h3>
      <button onClick={addToTop}>Add to top</button>
      <ul>
        {todos.map((todo) => (
          // Stable key: React matches items by ID
          // Adding to top: React inserts one new DOM node
          // Existing items are recognized and reused correctly
          <li key={todo.id}>
            <input defaultValue={todo.text} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// Demo: Key bug with stateful components
// ============================================
function CounterItem({ name }: { name: string }) {
  const [count, setCount] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 8, padding: 4 }}>
      <span>{name}</span>
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
    </div>
  );
}

function KeyBugDemo() {
  const [items, setItems] = useState(['Apple', 'Banana', 'Cherry']);

  const removeFirst = () => {
    setItems((prev) => prev.slice(1));
  };

  return (
    <div>
      <h3>Index keys cause state bugs</h3>
      <button onClick={removeFirst}>Remove first item</button>

      <h4>With index keys (buggy):</h4>
      {items.map((item, index) => (
        // When "Apple" is removed:
        // key=0 was Apple, now becomes Banana (keeps Apple's count state!)
        // key=1 was Banana, now becomes Cherry (keeps Banana's count state!)
        // key=2 (Cherry) is removed
        <CounterItem key={index} name={item} />
      ))}

      <h4>With proper keys (correct):</h4>
      {items.map((item) => (
        // When "Apple" is removed:
        // key="Apple" is removed (correct!)
        // key="Banana" and key="Cherry" keep their own state (correct!)
        <CounterItem key={item} name={item} />
      ))}
    </div>
  );
}

// ============================================
// Using key to force remount (reset component state)
// ============================================
function EditForm({ userId }: { userId: string }) {
  const [draft, setDraft] = useState('');

  return (
    <div>
      <p>Editing user: {userId}</p>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Type something..."
      />
    </div>
  );
}

function UserSwitcher() {
  const [selectedUser, setSelectedUser] = useState('user-1');

  return (
    <div>
      <button onClick={() => setSelectedUser('user-1')}>User 1</button>
      <button onClick={() => setSelectedUser('user-2')}>User 2</button>

      {/* Without key: switching users keeps the old draft text */}
      {/* <EditForm userId={selectedUser} /> */}

      {/* With key: changing user remounts the form, resetting state */}
      <EditForm key={selectedUser} userId={selectedUser} />
    </div>
  );
}

// ============================================
// Performance comparison
// ============================================
function PerformanceDemo() {
  const [items, setItems] = useState(
    Array.from({ length: 1000 }, (_, i) => ({
      id: `item-${i}`,
      value: `Item ${i}`,
    }))
  );

  const shuffle = () => {
    setItems((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  return (
    <div>
      <button onClick={shuffle}>Shuffle (check React DevTools Profiler)</button>
      <ul>
        {items.map((item) => (
          // With stable keys, React reorders DOM nodes efficiently
          // Without: React updates text content of all 1000 nodes
          <li key={item.id}>{item.value}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Explanation

CONCEPT: Keys and Reconciliation in Lists

```
WITHOUT PROPER KEYS (using index):

Before:                    After (insert at beginning):
[0] "Alice"  ──────────►  [0] "Zara"   ← React thinks "Alice" became "Zara"
[1] "Bob"    ──────────►  [1] "Alice"  ← React thinks "Bob" became "Alice"
[2] "Carol"  ──────────►  [2] "Bob"    ← new node "Bob"
                           [3] "Carol"  ← new node "Carol"

Result: ALL items re-render, input state gets mixed up!

WITH UNIQUE KEYS (using id):

Before:                    After (insert at beginning):
[key=1] "Alice" ─────────► [key=4] "Zara"   ← new, insert
[key=2] "Bob"   ─────────► [key=1] "Alice"  ← moved, reuse ✓
[key=3] "Carol" ─────────► [key=2] "Bob"    ← moved, reuse ✓
                            [key=3] "Carol"  ← moved, reuse ✓

Result: Only "Zara" is created, others just move. State preserved!
```

RULES:
- Keys must be stable, unique among siblings
- NEVER use Math.random() as key
- Index is OK only if list is static and never reordered
