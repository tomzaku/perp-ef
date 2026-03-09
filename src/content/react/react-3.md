---
id: react-3
title: React Fiber Architecture
category: React
subcategory: Internals
difficulty: Hard
pattern: Fiber
companies: [Meta, Google]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "React Fiber restructures reconciliation into an interruptible, priority-based work loop. Each component maps to a fiber node in a linked-list tree. Work is split into small units that can be paused, allowing React to prioritize urgent updates (like user input) over background rendering. This architecture underpins all of React's concurrent features."
similarProblems: [Virtual DOM and Reconciliation, Concurrent Features, Suspense and Lazy Loading]
---

**What is React Fiber and why was it introduced?**

React Fiber is the reimplementation of React's core reconciliation algorithm, introduced in React 16. The previous "stack reconciler" processed updates synchronously in a single, uninterruptible pass — once rendering started, it could not be paused. This blocked the main thread and caused janky UIs for large component trees.

**Fiber solves this by making rendering interruptible and incremental.**

**Key concepts:**

1. **Fiber Node:** Every React element has a corresponding fiber node — a JS object that holds information about the component, its state, the DOM it maps to, and pointers to form a tree structure:
   - `child` — first child fiber
   - `sibling` — next sibling fiber
   - `return` — parent fiber
   This forms a singly-linked list tree that can be traversed without recursion.

2. **Work Loop:** Fiber breaks rendering work into small units. Each unit processes one fiber node. Between units, React checks if there's higher-priority work (like user input) and can yield control back to the browser.

3. **Two Phases:**
   - **Render/Reconciliation Phase (interruptible):** React walks the fiber tree, computing changes. This phase has no side effects and can be paused, aborted, or restarted.
   - **Commit Phase (synchronous):** React applies all computed changes to the DOM in one go. This phase cannot be interrupted.

4. **Double Buffering:** React maintains two fiber trees — the "current" tree (what's on screen) and the "work-in-progress" (WIP) tree being built. Once the WIP tree is complete, React swaps them in the commit phase.

5. **Priority Lanes:** Fiber assigns priority levels (lanes) to updates. User interactions get high priority; data fetches get lower priority. React can preempt low-priority work to handle urgent updates first.

**Why it matters:**
- Enables Concurrent Features (startTransition, useDeferredValue)
- Supports Suspense
- Improves responsiveness for complex UIs

## Examples

**Input:** Large list re-render while user is typing
**Output:** Fiber yields to process keystroke (high priority), then resumes list update (low priority)
*The interruptible render phase allows React to prioritize user input over background rendering.*


## Solution

```js
// Conceptual illustration of Fiber node structure and work loop

// ---- Fiber Node (simplified) ----
interface FiberNode {
  tag: 'HostComponent' | 'FunctionComponent' | 'ClassComponent';
  type: string | Function;     // 'div', MyComponent, etc.
  key: string | null;
  stateNode: HTMLElement | null; // The actual DOM node (for host components)

  // Tree pointers (linked list)
  child: FiberNode | null;       // First child
  sibling: FiberNode | null;     // Next sibling
  return: FiberNode | null;      // Parent

  // Work
  pendingProps: any;
  memoizedProps: any;
  memoizedState: any;            // Hook linked list for function components
  updateQueue: any;

  // Effects
  flags: number;                 // What DOM operations to perform
  subtreeFlags: number;

  // Double buffering
  alternate: FiberNode | null;   // Points to the other version of this fiber

  // Priority
  lanes: number;
}

// ---- Simplified Work Loop ----
let workInProgress: FiberNode | null = null;
const FRAME_BUDGET = 5; // ms

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;

  while (workInProgress !== null && !shouldYield) {
    // Process one fiber node
    workInProgress = performUnitOfWork(workInProgress);

    // Check if we should yield to the browser
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (workInProgress !== null) {
    // More work to do — request next idle callback
    requestIdleCallback(workLoop);
  } else {
    // Render phase complete — commit all changes synchronously
    commitRoot();
  }
}

function performUnitOfWork(fiber: FiberNode): FiberNode | null {
  // 1. Begin work on this fiber (run the component, diff children)
  beginWork(fiber);

  // 2. If there's a child, process it next
  if (fiber.child) {
    return fiber.child;
  }

  // 3. No child — complete this fiber and move to sibling or parent
  let current: FiberNode | null = fiber;
  while (current !== null) {
    completeWork(current);
    if (current.sibling) {
      return current.sibling;
    }
    current = current.return;
  }

  return null;
}

function beginWork(fiber: FiberNode) {
  // Diff the element, create child fibers
  console.log('Processing:', fiber.type);
}

function completeWork(fiber: FiberNode) {
  // Create or update DOM nodes, bubble up flags
}

function commitRoot() {
  // Walk the fiber tree and apply all DOM mutations
  // This phase is synchronous and cannot be interrupted
  console.log('Committing all changes to DOM');
}

// Start the work loop
requestIdleCallback(workLoop);

// ---- Practical example: Fiber enables concurrent features ----
import React, { useState, useTransition } from 'react';

function SearchWithFiber() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // High priority: update input immediately
    setQuery(e.target.value);

    // Low priority: Fiber can interrupt this to handle next keystroke
    startTransition(() => {
      const filtered = heavySearch(e.target.value);
      setResults(filtered);
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <p>Searching...</p>}
      <ul>
        {results.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

function heavySearch(query: string): string[] {
  // Simulate expensive filtering
  const items = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);
  return items.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase())
  );
}
```
