---
id: react-7
title: "React.memo, useMemo, useCallback"
category: React
subcategory: Performance
difficulty: Medium
pattern: Memoization
companies: [Meta, Google, Amazon]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: React.memo prevents component re-renders when props are unchanged. useMemo caches expensive computations and stabilizes object/array references. useCallback stabilizes function references for memoized children. Always pair useCallback with React.memo on the child — one without the other is ineffective. Profile before optimizing.
similarProblems: [Hooks Internals, Suspense and Lazy Loading, Virtual DOM and Reconciliation]
---

**Explain React.memo, useMemo, and useCallback. When should you use each?**

These are React's three primary memoization tools, each serving a different purpose:

**1. React.memo (Component-level memoization):**
A higher-order component that memoizes the rendered output. If a component's props haven't changed (shallow comparison), React skips re-rendering it and reuses the last result.
- Wraps the entire component: `export default React.memo(MyComponent)`
- Accepts an optional custom comparison function.
- Only checks props — if internal state or context changes, it still re-renders.

**2. useMemo (Value memoization):**
A hook that memoizes the result of an expensive computation. It recalculates only when its dependencies change.
- `const result = useMemo(() => expensiveCalc(a, b), [a, b])`
- Avoids recalculating derived data on every render.
- Also useful for creating stable object/array references to prevent child re-renders.

**3. useCallback (Function memoization):**
A hook that memoizes a function definition. It returns the same function reference unless its dependencies change.
- `const fn = useCallback(() => doSomething(a), [a])`
- Equivalent to `useMemo(() => () => doSomething(a), [a])`
- Primarily useful when passing callbacks to memoized children (React.memo) or as dependencies in other hooks.

**When to use (and when NOT to):**
- DO use React.memo for components that re-render often with the same props (lists, charts, modals).
- DO use useMemo for genuinely expensive computations or to stabilize references.
- DO use useCallback when passing callbacks to React.memo children.
- DON'T prematurely optimize — memoization has its own cost (memory + comparison overhead). Profile first.

**Common mistake:** Using useCallback without React.memo on the child — the callback is stable, but the child re-renders anyway because it's not memoized.

## Examples

**Input:** Parent re-renders, but child props have not changed
**Output:** With React.memo, child skips re-render; without it, child re-renders
*React.memo performs a shallow comparison of props to decide if re-rendering is necessary.*


## Solution

```js
import React, { useState, useMemo, useCallback, memo } from 'react';

// ============================================
// React.memo: Skip re-rendering if props haven't changed
// ============================================
interface ItemProps {
  name: string;
  onSelect: (name: string) => void;
}

// Without memo: re-renders every time parent re-renders
// With memo: only re-renders if name or onSelect reference changes
const ListItem = memo(function ListItem({ name, onSelect }: ItemProps) {
  console.log(`Rendering: ${name}`);
  return (
    <li onClick={() => onSelect(name)}>
      {name}
    </li>
  );
});

// Custom comparison (optional — default is shallow equal)
const ListItemCustom = memo(
  function ListItemCustom({ name, onSelect }: ItemProps) {
    return <li onClick={() => onSelect(name)}>{name}</li>;
  },
  (prevProps, nextProps) => {
    // Return true to skip re-render, false to re-render
    return prevProps.name === nextProps.name;
  }
);

// ============================================
// useMemo: Memoize expensive computations
// ============================================
interface Product {
  name: string;
  price: number;
  category: string;
}

function ProductList({
  products,
  filter,
  sortBy,
}: {
  products: Product[];
  filter: string;
  sortBy: 'price' | 'name';
}) {
  // Without useMemo: runs on every render
  // With useMemo: only recalculates when products, filter, or sortBy change
  const processedProducts = useMemo(() => {
    console.log('Filtering and sorting...');
    return products
      .filter((p) =>
        p.name.toLowerCase().includes(filter.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        return a.name.localeCompare(b.name);
      });
  }, [products, filter, sortBy]);

  return (
    <ul>
      {processedProducts.map((p) => (
        <li key={p.name}>
          {p.name} - ${p.price}
        </li>
      ))}
    </ul>
  );
}

// ============================================
// useCallback: Stabilize function references
// ============================================
function ParentList() {
  const [items] = useState(['Apple', 'Banana', 'Cherry', 'Date']);
  const [selected, setSelected] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  // WITHOUT useCallback: new function every render
  // -> ListItem re-renders even though memo wraps it,
  //    because onSelect is a new reference.
  // const handleSelect = (name: string) => setSelected(name);

  // WITH useCallback: same function reference across renders
  // -> ListItem correctly skips re-render if name is unchanged
  const handleSelect = useCallback((name: string) => {
    setSelected(name);
  }, []); // Empty deps: setSelected is stable from useState

  return (
    <div>
      <p>Selected: {selected}</p>
      {/* Clicking this causes parent to re-render,
          but ListItem children skip re-render because
          handleSelect reference is stable */}
      <button onClick={() => setCount((c) => c + 1)}>
        Count: {count}
      </button>
      <ul>
        {items.map((item) => (
          <ListItem key={item} name={item} onSelect={handleSelect} />
        ))}
      </ul>
    </div>
  );
}

// ============================================
// useMemo for stable references (prevent child re-renders)
// ============================================
interface ChartProps {
  data: { x: number; y: number }[];
  config: { color: string; animate: boolean };
}

const ExpensiveChart = memo(function ExpensiveChart({
  data,
  config,
}: ChartProps) {
  console.log('Chart rendering...');
  return (
    <div style={{ color: config.color }}>
      Chart with {data.length} points
    </div>
  );
});

function Dashboard() {
  const [refreshCount, setRefreshCount] = useState(0);

  // Without useMemo: new array/object reference every render
  // -> ExpensiveChart re-renders even though data is the same
  // const data = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
  // const config = { color: 'blue', animate: true };

  // With useMemo: stable references
  const data = useMemo(() => [{ x: 1, y: 2 }, { x: 3, y: 4 }], []);
  const config = useMemo(() => ({ color: 'blue', animate: true }), []);

  return (
    <div>
      <button onClick={() => setRefreshCount((c) => c + 1)}>
        Refresh: {refreshCount}
      </button>
      <ExpensiveChart data={data} config={config} />
    </div>
  );
}
```

## Explanation

CONCEPT: React Memoization — memo / useMemo / useCallback

```
RENDER TREE WITHOUT MEMOIZATION:

Parent re-renders (state change)
├── Child A ← re-renders (even if props unchanged!)
│   └── Grandchild ← re-renders
├── Child B ← re-renders
└── Child C ← re-renders

RENDER TREE WITH React.memo:

Parent re-renders
├── React.memo(Child A) ← SKIPPED (props same) ✓
│   └── Grandchild ← SKIPPED
├── Child B ← re-renders (props changed)
└── React.memo(Child C) ← SKIPPED ✓

BUT WATCH OUT — object/function props:
```

```
// ✗ BAD: new object every render breaks memo
<MemoChild style={{ color: 'red' }} onClick={() => handleClick()} />

// ✓ GOOD: stable references
const style = useMemo(() => ({ color: 'red' }), []);
const onClick = useCallback(() => handleClick(), [handleClick]);
<MemoChild style={style} onClick={onClick} />
```

WHEN TO USE:
- React.memo: Prevent re-render when props don't change
- useMemo: Cache expensive computation results
- useCallback: Stabilize function references for memo'd children
- DON'T use everywhere — memoization has its own cost (comparison + memory)
