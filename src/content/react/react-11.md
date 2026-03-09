---
id: react-11
title: Concurrent Features
category: React
subcategory: Concurrent React
difficulty: Hard
pattern: Concurrent Mode
companies: [Meta, Google]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "useTransition marks state updates as non-urgent, keeping the UI responsive during expensive re-renders. useDeferredValue lets a value \"lag behind\" so React can prioritize urgent updates. Both rely on Fiber's interruptible rendering. Combined with Suspense, transitions enable smooth navigation without loading flashes."
similarProblems: [React Fiber Architecture, Suspense and Lazy Loading, "React.memo, useMemo, useCallback"]
---

**Explain React's concurrent features: startTransition, useTransition, useDeferredValue, and how they improve UX.**

Concurrent React allows React to work on multiple state updates simultaneously, prioritizing urgent updates (like typing) over non-urgent ones (like filtering a large list).

**Key APIs:**

1. **useTransition / startTransition:**
   - Marks a state update as "non-urgent" (a transition).
   - React can interrupt the transition to handle more urgent updates (user input).
   - `useTransition()` returns `[isPending, startTransition]` — isPending indicates if the transition is still processing.
   - `startTransition()` (standalone import) is for use outside components (e.g., in libraries).

2. **useDeferredValue:**
   - Returns a deferred version of a value that "lags behind" the latest value.
   - During urgent updates, React renders with the stale (deferred) value first, then re-renders with the new value in the background.
   - Useful when you can't control the state update (e.g., receiving props from a parent).

3. **Suspense integration:**
   - Transitions interact with Suspense: if a transition triggers a Suspense boundary, React keeps showing the current UI (instead of the fallback) until the new content is ready.
   - This prevents "loading flash" during navigation.

**How it works under the hood:**
- React Fiber's interruptible rendering enables concurrency.
- Transitions are rendered with lower priority "lanes."
- If a higher priority update (user input) arrives during a transition, React discards the in-progress transition render and starts the urgent update instead.
- After the urgent update commits, React restarts the transition render.

**Key UX improvements:**
- Input stays responsive even during expensive re-renders.
- No loading spinners for in-app navigation (Suspense + transitions).
- Background rendering doesn't block the main thread.

## Examples

**Input:** User types in search box that filters 10,000 items
**Output:** Input updates instantly; list filter is deferred and interruptible
*startTransition marks the list filtering as low priority, so keystrokes are never blocked.*


## Solution

```js
import React, {
  useState,
  useTransition,
  useDeferredValue,
  Suspense,
  memo,
  useMemo,
} from 'react';

// ============================================
// useTransition: Mark updates as non-urgent
// ============================================
function SearchWithTransition() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const allItems = useMemo(
    () => Array.from({ length: 20000 }, (_, i) => `Item ${i + 1}`),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // URGENT: Update input immediately
    setQuery(value);

    // NON-URGENT: Filter list in a transition
    startTransition(() => {
      const filtered = allItems.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
    });
  };

  return (
    <div>
      <input
        value={query}
        onChange={handleChange}
        placeholder="Search items..."
      />

      {/* Show pending indicator without blocking input */}
      {isPending && <p style={{ color: 'gray' }}>Filtering...</p>}

      <ul>
        {results.slice(0, 100).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// useDeferredValue: Defer prop/value updates
// ============================================
interface SlowListProps {
  query: string;
}

// Expensive component — renders many items
const SlowList = memo(function SlowList({ query }: SlowListProps) {
  const items = [];
  for (let i = 0; i < 500; i++) {
    const text = `Result ${i + 1} for "${query}"`;
    items.push(<li key={i}>{text}</li>);
  }
  return <ul>{items}</ul>;
});

function SearchWithDeferredValue() {
  const [query, setQuery] = useState('');

  // deferredQuery lags behind query during urgent updates
  const deferredQuery = useDeferredValue(query);

  // Visual indicator that deferred value is stale
  const isStale = query !== deferredQuery;

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <div style={{ opacity: isStale ? 0.5 : 1, transition: 'opacity 0.2s' }}>
        {/* SlowList receives the deferred value, so React can
            interrupt its render when a new keystroke arrives */}
        <SlowList query={deferredQuery} />
      </div>
    </div>
  );
}

// ============================================
// Transition + Suspense: Smooth navigation
// ============================================
const HomePage = React.lazy(() => import('./pages/Home'));
const AboutPage = React.lazy(() => import('./pages/About'));
const ContactPage = React.lazy(() => import('./pages/Contact'));

type Page = 'home' | 'about' | 'contact';

function SmoothNavApp() {
  const [page, setPage] = useState<Page>('home');
  const [isPending, startTransition] = useTransition();

  const navigateTo = (newPage: Page) => {
    // Wrap navigation in a transition:
    // React keeps showing current page instead of Suspense fallback
    // until the new page's chunk is loaded
    startTransition(() => {
      setPage(newPage);
    });
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
    }
  };

  return (
    <div>
      <nav style={{ opacity: isPending ? 0.7 : 1 }}>
        <button onClick={() => navigateTo('home')}>Home</button>
        <button onClick={() => navigateTo('about')}>About</button>
        <button onClick={() => navigateTo('contact')}>Contact</button>
        {isPending && <span> Loading...</span>}
      </nav>

      <Suspense fallback={<div>Loading page...</div>}>
        {renderPage()}
      </Suspense>
    </div>
  );
}

// ============================================
// Comparing: Without vs With Concurrent Features
// ============================================

// WITHOUT concurrency: typing is blocked by expensive filter
function SearchBlocking() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    // Both updates are urgent — input is blocked while
    // React processes the expensive filter synchronously
    const filtered = generateLargeList().filter((item) =>
      item.includes(value)
    );
    setResults(filtered);
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      <ul>
        {results.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

// WITH concurrency: input stays responsive
function SearchConcurrent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value); // Urgent
    startTransition(() => {
      // Non-urgent: React can interrupt this
      const filtered = generateLargeList().filter((item) =>
        item.includes(value)
      );
      setResults(filtered);
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <span>Updating...</span>}
      <ul>
        {results.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

function generateLargeList(): string[] {
  return Array.from({ length: 50000 }, (_, i) => `item-${i}`);
}
```
