---
id: react-2
title: Hooks Internals
category: React
subcategory: Hooks
difficulty: Medium
pattern: Hooks
companies: [Meta, Google, Amazon, Netflix]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Hooks are stored as a linked list on each fiber node. They must be called in the same order every render so React can match each hook call to its stored state. useState queues updates, useEffect schedules side effects after paint, useCallback/useMemo memoize values by deps, and useRef provides a mutable container that persists across renders."
similarProblems: [Custom Hooks Patterns, useEffect Cleanup and Dependencies, "React.memo, useMemo, useCallback"]
---

**Explain how React Hooks work internally. Cover useState, useEffect, useCallback, useMemo, and useRef.**

React Hooks are functions that let you "hook into" React state and lifecycle features from function components. Internally, hooks rely on a linked list of hook nodes attached to each fiber (component instance in the Fiber tree).

**Key internal concepts:**

1. **Hook List:** Each component fiber has a `memoizedState` property that points to the first hook node. Each hook node has a `next` pointer, forming a linked list. This is why hooks must be called in the same order every render — React walks the list sequentially.

2. **useState:** Stores a state value and an update queue on the hook node. When `setState` is called, an update object is enqueued and a re-render is scheduled. During the next render, React processes the queue to compute the new state.

3. **useEffect:** Stores an effect object containing the callback, cleanup function, and dependency array. After the DOM is painted, React runs effects whose dependencies changed. Cleanup functions from the previous render run before the new effect.

4. **useCallback:** Returns a memoized version of the callback. Internally it stores `[callback, deps]` on the hook node. On re-render, if deps haven't changed, the previous callback reference is returned.

5. **useMemo:** Similar to useCallback but stores the *result* of calling the function. It stores `[computedValue, deps]` on the hook node.

6. **useRef:** Creates a mutable ref object `{ current: initialValue }` that persists across renders. Unlike state, mutating `.current` does NOT trigger a re-render.

**Rules of Hooks:**
- Only call hooks at the top level (not inside loops, conditions, or nested functions).
- Only call hooks from React function components or custom hooks.

## Examples

**Input:** useState(0) called in a component
**Output:** Returns [0, setState] on first render; subsequent calls process the update queue
*React stores the state value on the hook node in the fiber linked list.*


## Solution

```js
// ---- Simplified useState implementation ----
// This shows the core concept of how React manages hook state.

let hooks: any[] = [];
let hookIndex = 0;
let currentComponent: any = null;

function myUseState<T>(initialValue: T): [T, (v: T | ((prev: T) => T)) => void] {
  const idx = hookIndex;

  // On first render, initialize state
  if (hooks[idx] === undefined) {
    hooks[idx] = initialValue;
  }

  const setState = (newValue: T | ((prev: T) => T)) => {
    if (typeof newValue === 'function') {
      hooks[idx] = (newValue as (prev: T) => T)(hooks[idx]);
    } else {
      hooks[idx] = newValue;
    }
    // Trigger re-render (simplified)
    render(currentComponent);
  };

  hookIndex++;
  return [hooks[idx], setState];
}

function render(component: () => any) {
  hookIndex = 0; // Reset index each render
  currentComponent = component;
  const output = component(); // Call the component
  console.log('Rendered:', output);
}

// ---- Real React: useState ----
import React, { useState } from 'react';

function CounterExample() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('React');

  return (
    <div>
      <p>{name}: {count}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>+1</button>
      <input value={name} onChange={(e) => setName(e.target.value)} />
    </div>
  );
}

// ---- useEffect: Side effects with cleanup ----
import { useEffect } from 'react';

function ChatRoom({ roomId }: { roomId: string }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();

    // Cleanup runs before the next effect and on unmount
    return () => {
      connection.disconnect();
    };
  }, [roomId]); // Only re-run when roomId changes

  return <h1>Welcome to {roomId}</h1>;
}

// ---- useCallback: Stable function reference ----
import { useCallback } from 'react';

function ParentWithCallback() {
  const [count, setCount] = useState(0);

  // handleClick keeps the same reference unless count changes
  const handleClick = useCallback(() => {
    console.log('Count is:', count);
  }, [count]);

  return <ExpensiveChild onClick={handleClick} />;
}

// ---- useMemo: Memoized computation ----
import { useMemo } from 'react';

function FilteredList({ items, query }: { items: string[]; query: string }) {
  // Expensive filtering only recalculates when items or query change
  const filtered = useMemo(() => {
    return items.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);

  return (
    <ul>
      {filtered.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

// ---- useRef: Persistent mutable value ----
import { useRef } from 'react';

function StopWatch() {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return (
    <div>
      <p>Elapsed: {elapsed}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

## Explanation

CONCEPT: How Hooks Work Internally

```
HOOKS AS A LINKED LIST IN FIBER:

FiberNode (MyComponent):
┌─────────────────────────────────┐
│ memoizedState ──► Hook #0      │
│                   ├─ state: 0   │  useState(0)
│                   ├─ queue: ... │
│                   └─ next ──►  │
│                     Hook #1    │
│                   ├─ state: fn  │  useEffect(fn)
│                   ├─ deps: []   │
│                   └─ next ──►  │
│                     Hook #2    │
│                   ├─ state: fn  │  useMemo(fn)
│                   ├─ deps: [a]  │
│                   └─ next: null │
└─────────────────────────────────┘

WHY HOOKS MUST BE CALLED IN THE SAME ORDER:
Render 1: useState → useEffect → useMemo  [Hook0, Hook1, Hook2]
Render 2: useState → useEffect → useMemo  [Hook0, Hook1, Hook2] ✓

If conditional: useState → (skip useEffect) → useMemo
                 Hook0 ←→ Hook2 (WRONG! mismatched) ✗
```

This is why hooks can't be inside if/for/etc — React relies on call ORDER to match hooks to their stored state.
