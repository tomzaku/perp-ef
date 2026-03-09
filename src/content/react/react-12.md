---
id: react-12
title: Custom Hooks Patterns
category: React
subcategory: Hooks
difficulty: Medium
pattern: Custom Hooks
companies: [Meta, Amazon, Google, Airbnb]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Custom hooks extract reusable stateful logic into composable functions. Key patterns include: useLocalStorage (sync with external storage), useFetch (async with loading/error), useDebounce (timing control), and useMediaQuery (browser API subscription). Always handle cleanup, use refs for non-reactive values, and compose hooks together for complex behavior."
similarProblems: [Hooks Internals, useEffect Cleanup and Dependencies, HOC vs Render Props vs Hooks]
---

**Implement common custom hooks: useLocalStorage, useFetch, useDebounce, and useMediaQuery.**

Custom hooks are functions that start with "use" and can call other hooks. They encapsulate reusable stateful logic, making it easy to share behavior between components without HOCs or render props.

**Design principles for custom hooks:**

1. **Single Responsibility:** Each hook does one thing well.
2. **Consistent API:** Return values in a predictable format — a single value, a tuple `[value, setter]`, or an object `{ data, loading, error }`.
3. **Cleanup:** Always clean up subscriptions, timers, and event listeners in the effect cleanup function.
4. **Dependency correctness:** Include all referenced values in dependency arrays to avoid stale closures.
5. **Composability:** Custom hooks can call other custom hooks.

**Common patterns:**
- **useLocalStorage:** Syncs state with localStorage, persisting across page refreshes.
- **useFetch:** Manages async data fetching with loading/error states and optional caching.
- **useDebounce:** Delays updating a value until a specified time has passed without changes.
- **useMediaQuery:** Reactively tracks CSS media query matches for responsive behavior.

These hooks demonstrate core patterns: synchronizing with external stores, managing async operations, controlling timing, and subscribing to browser APIs.

## Examples

**Input:** useDebounce("search query", 300)
**Output:** Returns "search query" after 300ms of no changes
*The debounced value only updates when the input has been stable for the specified delay.*


## Solution

```js
import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================
// useLocalStorage: Persist state in localStorage
// ============================================
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Lazy initialization: read from localStorage on first render
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}": `, error);
      return initialValue;
    }
  });

  // Update localStorage whenever value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setStoredValue];
}

// Usage:
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  return (
    <button onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}>
      Theme: {theme}
    </button>
  );
}

// ============================================
// useFetch: Data fetching with loading/error states
// ============================================
interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useFetch<T>(url: string, options?: RequestInit): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Store the latest options in a ref to avoid re-fetching on every render
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();

    try {
      const response = await fetch(url, {
        ...optionsRef.current,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = (await response.json()) as T;
      setData(json);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }

    // Return cleanup for abort
    return () => controller.abort();
  }, [url]);

  useEffect(() => {
    const abortCleanup = fetchData();
    return () => {
      abortCleanup.then((cleanup) => cleanup());
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Usage:
interface User {
  id: number;
  name: string;
}

function UserList() {
  const { data, loading, error, refetch } = useFetch<User[]>(
    'https://jsonplaceholder.typicode.com/users'
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {data?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// useDebounce: Debounce a value
// ============================================
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update the debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timer if value changes before delay expires
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage:
function SearchWithDebounce() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data, loading } = useFetch<User[]>(
    `https://api.example.com/search?q=${debouncedQuery}`
  );

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
      />
      {loading && <p>Searching...</p>}
      <ul>
        {data?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// useMediaQuery: Responsive design in JS
// ============================================
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    // Check on mount (SSR-safe with fallback)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Update state when media query match changes
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Modern API
    mediaQuery.addEventListener('change', handleChange);

    // Sync in case it changed between render and effect
    setMatches(mediaQuery.matches);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

// Usage:
function ResponsiveLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <div
      style={{
        display: isMobile ? 'block' : 'flex',
        background: prefersDark ? '#1a1a1a' : '#ffffff',
        color: prefersDark ? '#ffffff' : '#000000',
      }}
    >
      {!isMobile && <aside style={{ width: 250 }}>Sidebar</aside>}
      <main>
        <p>
          Device: {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
        </p>
        <p>Theme: {prefersDark ? 'Dark' : 'Light'}</p>
      </main>
    </div>
  );
}

// ============================================
// Composing custom hooks together
// ============================================
function useSearchUsers(initialQuery = '') {
  const [query, setQuery] = useLocalStorage('lastSearch', initialQuery);
  const debouncedQuery = useDebounce(query, 300);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { data, loading, error } = useFetch<User[]>(
    debouncedQuery
      ? `https://api.example.com/search?q=${debouncedQuery}&limit=${isMobile ? 10 : 25}`
      : ''
  );

  return { query, setQuery, results: data, loading, error, isMobile };
}
```
