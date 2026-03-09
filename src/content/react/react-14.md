---
id: react-14
title: useEffect Cleanup and Dependencies
category: React
subcategory: Hooks
difficulty: Medium
pattern: Side Effects
companies: [Meta, Google, Amazon]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: Always return a cleanup function from useEffect when subscribing to external resources. Include all referenced values in the dependency array to avoid stale closures. Use AbortController for fetch cleanup to prevent race conditions. Avoid object/array dependencies (they change reference every render) — depend on primitives or memoize. Use functional state updates to avoid unnecessary dependencies.
similarProblems: [Hooks Internals, Custom Hooks Patterns, "React.memo, useMemo, useCallback"]
---

**Explain useEffect cleanup functions and dependency arrays. What are common pitfalls?**

`useEffect` is React's mechanism for synchronizing a component with external systems (DOM APIs, network, timers, third-party libraries). Understanding its cleanup and dependency system is crucial for writing correct, leak-free components.

**Dependency Array:**
- `useEffect(fn)` — runs after every render.
- `useEffect(fn, [])` — runs once after mount (and cleanup on unmount).
- `useEffect(fn, [a, b])` — runs when a or b changes (shallow comparison).

React calls the effect function after the DOM has been updated and painted.

**Cleanup Function:**
The function returned from useEffect runs:
1. **Before the next effect runs** (when dependencies change).
2. **When the component unmounts.**

The cleanup is essential for: unsubscribing from events, clearing timers, aborting fetch requests, closing WebSocket connections, etc.

**Common pitfalls:**

1. **Stale closures:** The effect captures variables from the render in which it was created. If dependencies are missing, the effect reads stale values.

2. **Missing dependencies:** Not including all referenced values in the dependency array leads to bugs where the effect doesn't re-run when it should.

3. **Object/array dependencies:** Objects and arrays are compared by reference. A new `{}` or `[]` on each render triggers the effect every time, even if the values inside are the same.

4. **Infinite loops:** Setting state inside an effect without proper dependencies causes render -> effect -> setState -> render -> effect...

5. **Race conditions:** Multiple rapid state changes trigger multiple fetches. Without cleanup (abort), responses may arrive out of order, displaying stale data.

6. **Memory leaks:** Not cleaning up subscriptions, timers, or event listeners when the component unmounts.

## Examples

**Input:** Component subscribes to WebSocket on mount
**Output:** Cleanup function closes the WebSocket on unmount or when URL changes
*Without cleanup, the old WebSocket stays open, causing memory leaks and duplicate event handlers.*


## Solution

```js
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================
// Basic cleanup: Event listeners
// ============================================
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup: remove listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty deps = mount/unmount only

  return (
    <p>
      {size.width} x {size.height}
    </p>
  );
}

// ============================================
// Timer cleanup
// ============================================
function Countdown({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    // Reset when seconds prop changes
    setRemaining(seconds);

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup: clear interval when seconds changes or unmount
    return () => clearInterval(interval);
  }, [seconds]);

  return <p>Time left: {remaining}s</p>;
}

// ============================================
// Fetch with abort controller (prevent race conditions)
// ============================================
interface User {
  id: number;
  name: string;
}

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUser() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/users/${userId}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        // Don't set error state for aborted requests
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    // Cleanup: abort the in-flight request if userId changes
    // or component unmounts
    return () => controller.abort();
  }, [userId]); // Re-fetch when userId changes

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <p>User: {user?.name}</p>;
}

// ============================================
// WebSocket with cleanup
// ============================================
function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Connect to the room
    const ws = new WebSocket(`wss://chat.example.com/rooms/${roomId}`);

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onopen = () => {
      console.log(`Connected to room: ${roomId}`);
    };

    // Cleanup: close connection when roomId changes or unmount
    return () => {
      console.log(`Disconnecting from room: ${roomId}`);
      ws.close();
    };
  }, [roomId]);

  return (
    <div>
      <h2>Room: {roomId}</h2>
      {messages.map((msg, i) => (
        <p key={i}>{msg}</p>
      ))}
    </div>
  );
}

// ============================================
// Pitfall 1: Stale closure
// ============================================
function StaleClosureDemo() {
  const [count, setCount] = useState(0);

  // BAD: Missing dependency — effect captures initial count (0) forever
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Count is:', count); // Always logs 0!
    }, 1000);
    return () => clearInterval(interval);
  }, []); // eslint warns: missing dependency 'count'

  // FIX 1: Include count in dependencies
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Count is:', count); // Correct value
    }, 1000);
    return () => clearInterval(interval);
  }, [count]); // Restarts interval on each count change

  // FIX 2: Use ref for latest value (no re-subscription)
  const countRef = useRef(count);
  countRef.current = count;

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Count is:', countRef.current); // Always current
    }, 1000);
    return () => clearInterval(interval);
  }, []); // Runs once, reads latest via ref

  return <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>;
}

// ============================================
// Pitfall 2: Object/array dependency causing infinite loop
// ============================================
function ObjectDepPitfall({ userId }: { userId: string }) {
  // BAD: New object every render -> effect runs every render -> infinite loop
  // const options = { method: 'GET', headers: { 'X-User': userId } };
  // useEffect(() => {
  //   fetch('/api/data', options).then(...);
  // }, [options]); // New reference every render!

  // FIX: Memoize or move object inside effect
  useEffect(() => {
    const options = { method: 'GET', headers: { 'X-User': userId } };
    fetch('/api/data', options).then((res) => res.json());
  }, [userId]); // Depend on primitive value, not object

  return <div>User: {userId}</div>;
}

// ============================================
// Pitfall 3: Infinite loop from setState in effect
// ============================================
function InfiniteLoopPitfall() {
  const [data, setData] = useState<string[]>([]);

  // BAD: data is dependency + setState triggers re-render -> loop
  // useEffect(() => {
  //   setData([...data, 'new item']); // Infinite loop!
  // }, [data]);

  // FIX: Use functional update to avoid depending on data
  useEffect(() => {
    setData((prev) => [...prev, 'loaded item']);
  }, []); // Run once on mount

  return (
    <ul>
      {data.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

// ============================================
// Cleanup execution order demonstration
// ============================================
function CleanupOrderDemo({ value }: { value: string }) {
  useEffect(() => {
    console.log(`Effect runs with value: ${value}`);

    return () => {
      console.log(`Cleanup runs for value: ${value}`);
    };
  }, [value]);

  // When value changes from "A" to "B":
  // 1. "Cleanup runs for value: A"   (old cleanup runs first)
  // 2. "Effect runs with value: B"   (new effect runs)
  //
  // On unmount:
  // 1. "Cleanup runs for value: B"   (final cleanup)

  return <p>Value: {value}</p>;
}
```

## Explanation

CONCEPT: useEffect Lifecycle — Mount, Update, Cleanup

```
EFFECT LIFECYCLE:

Component Mount:
  render → DOM update → useEffect(setup) runs
                         └── return cleanup function

Component Update (deps changed):
  render → DOM update → cleanup(prev) → setup(new)

Component Unmount:
  cleanup() runs → component removed

TIMELINE:
Mount:     ──── render ──── [setup] ─────────────────────
Update 1:  ──── render ──── [cleanup₁] ── [setup₂] ─────
Update 2:  ──── render ──── [cleanup₂] ── [setup₃] ─────
Unmount:   ──── [cleanup₃] ── removed
```

```
COMMON PITFALL — Stale Closure:

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count);  // ← Always logs 0! Stale closure
      setCount(count + 1); // ← Always sets to 1!
    }, 1000);
    return () => clearInterval(id);
  }, []);  // ← Empty deps = setup runs once, closes over count=0

  // FIX: Use functional updater
  setCount(prev => prev + 1);  // ← Always uses latest value
}
```

KEY RULES:
- Every value used inside effect must be in deps array (or use ref)
- Cleanup runs BEFORE next setup and on unmount
- Empty deps [] = run once on mount, cleanup on unmount only
