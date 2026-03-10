---
id: react-21
title: "React Compiler (React Forget)"
category: React
subcategory: React 19
difficulty: Hard
pattern: Automatic Memoization
companies: [Meta, Vercel, Netflix, Airbnb]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "React Compiler is a build-time tool that automatically memoizes components, hooks, and expressions — eliminating the need to manually write useMemo, useCallback, and React.memo. It enforces the Rules of React via static analysis and only optimizes code that follows them. It does NOT change runtime behavior — it only skips re-renders when inputs haven't changed."
similarProblems: [React.memo and Memoization, useMemo and useCallback, useOptimistic]
---

**What is the React Compiler? How does it work and what does it replace?**

The React Compiler (previously codenamed "React Forget") is a **build-time compiler** introduced alongside React 19 that automatically applies memoization to your React components and hooks. It was built by the Meta React team and released as `babel-plugin-react-compiler`.

**The problem it solves:**

React re-renders a component whenever its state or props change. To prevent unnecessary re-renders, developers had to manually write:
- `React.memo(Component)` — skip re-render if props didn't change
- `useMemo(() => expensiveCalc, [deps])` — memoize a computed value
- `useCallback(() => fn, [deps])` — memoize a function reference

This was error-prone, verbose, and easy to get wrong (stale deps, over/under-memoizing).

**How the compiler works:**

1. **Static analysis** — analyzes your component's JS/TS code at build time
2. **Identifies stable values** — tracks which values change between renders
3. **Inserts memoization** — automatically wraps expressions, components, and callbacks
4. **Enforces Rules of React** — only optimizes components that follow the rules (pure render, no mutations of props/state)

**What it replaces:**
- Manual `React.memo()` wrappers
- Manual `useMemo()` for derived values
- Manual `useCallback()` for stable function references

**What it does NOT do:**
- Does not change runtime semantics
- Does not fix components that break the Rules of React
- Does not eliminate all re-renders — only skips them when inputs are provably unchanged
- Does not optimize effects or external subscriptions

## Examples

**Input:** A component with expensive computation and callbacks passed to children
**Output:** Compiler automatically memoizes — no manual `useMemo`/`useCallback`/`React.memo` needed

## Solution

```jsx
// ============================================
// BEFORE: Manual memoization (pre-compiler)
// ============================================
import React, { useState, useMemo, useCallback, memo } from 'react';

interface Item {
  id: number;
  name: string;
  price: number;
}

// Must wrap in memo to avoid re-render when parent re-renders
const ExpensiveList = memo(function ExpensiveList({
  items,
  onSelect,
}: {
  items: Item[];
  onSelect: (id: number) => void;
}) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} onClick={() => onSelect(item.id)}>
          {item.name} — ${item.price}
        </li>
      ))}
    </ul>
  );
});

function ShoppingCart() {
  const [items] = useState<Item[]>([
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Mouse', price: 29 },
  ]);
  const [filter, setFilter] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Must manually memoize expensive computation
  const filteredItems = useMemo(
    () => items.filter((i) => i.name.toLowerCase().includes(filter.toLowerCase())),
    [items, filter]
  );

  // Must manually memoize callback to avoid breaking ExpensiveList's memo
  const handleSelect = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  const totalPrice = useMemo(
    () => filteredItems.reduce((sum, i) => sum + i.price, 0),
    [filteredItems]
  );

  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <p>Total: ${totalPrice}</p>
      <ExpensiveList items={filteredItems} onSelect={handleSelect} />
    </div>
  );
}

// ============================================
// AFTER: With React Compiler — write natural code
// ============================================
// The compiler automatically handles memoization.
// You write the same logic WITHOUT memo/useMemo/useCallback:

function ExpensiveListCompiled({
  items,
  onSelect,
}: {
  items: Item[];
  onSelect: (id: number) => void;
}) {
  // Compiler memoizes this component automatically
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} onClick={() => onSelect(item.id)}>
          {item.name} — ${item.price}
        </li>
      ))}
    </ul>
  );
}

function ShoppingCartCompiled() {
  const [items] = useState<Item[]>([
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Mouse', price: 29 },
  ]);
  const [filter, setFilter] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // No useMemo needed — compiler memoizes this expression
  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(filter.toLowerCase())
  );

  // No useCallback needed — compiler memoizes stable callbacks
  function handleSelect(id: number) {
    setSelectedId(id);
  }

  // No useMemo needed
  const totalPrice = filteredItems.reduce((sum, i) => sum + i.price, 0);

  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <p>Total: ${totalPrice}</p>
      <ExpensiveListCompiled items={filteredItems} onSelect={handleSelect} />
    </div>
  );
}

// ============================================
// Rules of React — what the compiler requires
// ============================================

// ✅ VALID — Pure render: same inputs → same output
function PureComponent({ count }: { count: number }) {
  const doubled = count * 2; // No side effects in render
  return <p>{doubled}</p>;
}

// ❌ INVALID — Mutating props (compiler skips optimization)
function BadComponent({ items }: { items: number[] }) {
  items.push(42); // NEVER mutate props — compiler detects this!
  return <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}

// ❌ INVALID — Mutating state directly
function BadCounter() {
  const [count, setCount] = useState(0);
  count++; // NEVER mutate state — use setCount(c => c + 1)
  return <p>{count}</p>;
}

// ✅ VALID — Reading from refs in event handlers (not render)
function ValidRef() {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    console.log(inputRef.current?.value); // OK: reading ref in event handler
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}

// ============================================
// Opting out — use_no_memo directive
// ============================================

function ManuallyOptimizedComponent() {
  'use no memo'; // Opt this component out of compiler optimization
  // Useful when you have complex logic the compiler might mishandle
  // or when debugging compiler-related issues

  const value = expensiveComputation(); // Won't be auto-memoized
  return <div>{value}</div>;
}

// ============================================
// Setup: babel-plugin-react-compiler
// ============================================

// babel.config.js
const babelConfig = {
  plugins: [
    ['babel-plugin-react-compiler', {
      // Target: which files to compile
      // Omit to compile everything
      sources: (filename) => filename.includes('/src/'),
    }],
  ],
};

// For Next.js (next.config.ts):
const nextConfig = {
  experimental: {
    reactCompiler: true,
    // Or with options:
    reactCompiler: {
      compilationMode: 'annotation', // Only compile opt-in components
    },
  },
};

// ESLint plugin (catches Rules of React violations):
// npm install eslint-plugin-react-compiler
const eslintConfig = {
  plugins: ['react-compiler'],
  rules: {
    'react-compiler/react-compiler': 'error',
  },
};
```

## Explanation

CONCEPT: React Compiler — Build-Time Automatic Memoization

```
HOW THE COMPILER TRANSFORMS YOUR CODE:

Your source code:
  function Component({ items, filter }) {
    const filtered = items.filter(i => i.name.includes(filter));
    return <List items={filtered} />;
  }

Compiler output (conceptual — actual output is more complex):
  function Component({ items, filter }) {
    const $ = _cache;  // compiler-managed cache
    let filtered;

    if ($[0] !== items || $[1] !== filter) {
      filtered = items.filter(i => i.name.includes(filter));
      $[0] = items;
      $[1] = filter;
      $[2] = filtered;
    } else {
      filtered = $[2];  // reuse cached value!
    }

    let t0;
    if ($[3] !== filtered) {
      t0 = <List items={filtered} />;
      $[3] = filtered;
      $[4] = t0;
    } else {
      t0 = $[4];  // reuse cached JSX!
    }

    return t0;
  }
```

```
WHAT GETS MEMOIZED:

Before compiler          After compiler equivalent
─────────────────────    ──────────────────────────
const x = a + b;         useMemo(() => a + b, [a, b])

const items = arr        useMemo(
  .filter(fn)              () => arr.filter(fn), [arr, fn]
  .map(fn2);             )

function onClick() {     useCallback(
  setState(v);             () => setState(v), [setState, v]
}                        )

<Child prop={val} />     <MemoizedChild prop={val} />
                         (skips re-render if val unchanged)
```

```
RULES OF REACT — Compiler prerequisites:

PURE RENDERS:
  ✅ Same props + state → same JSX output
  ✅ No side effects during rendering
  ✅ No mutations of props or external variables

IMMUTABLE DATA:
  ✅ Create new arrays/objects instead of mutating
  ❌ arr.push(x)    → ✅ [...arr, x]
  ❌ obj.key = val  → ✅ { ...obj, key: val }

If your component breaks these rules:
  → Compiler detects it via static analysis
  → Skips optimization for that component
  → Your app still works (correctness first!)
  → ESLint plugin warns you about the violation
```

```
COMPILATION MODES:

"all" (default):
  Every component/hook is compiled
  Best for greenfield projects following Rules of React

"annotation":
  Only compile components with 'use memo' directive
  Safe for migrating existing codebases

  function MyComponent() {
    'use memo'; // Opt in
    ...
  }

"infer" (default behavior):
  Compiler only optimizes components it can prove are safe
  Skips ones with Rule violations automatically
```

KEY RULES:
- The compiler is a **build-time** tool — zero runtime overhead for the compiler itself
- It only optimizes components that follow the Rules of React
- Use `eslint-plugin-react-compiler` to find violations before compiling
- `'use no memo'` opts a single component out of compilation
- You can (and should) remove manual `useMemo`/`useCallback`/`React.memo` after adopting the compiler — they become redundant
- The compiler does NOT change what your app does — only how often components re-render
- React DevTools shows a "Memo ✨" badge on compiler-optimized components
