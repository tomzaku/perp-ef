---
id: react-5
title: HOC vs Render Props vs Hooks
category: React
subcategory: Patterns
difficulty: Medium
pattern: Code Reuse
companies: [Meta, Google, Airbnb]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Custom Hooks are the modern standard for logic reuse — they compose naturally, avoid wrapper hell, and have explicit data flow. HOCs and Render Props are legacy patterns still found in older codebases. Know all three for interviews, but default to hooks in new code."
similarProblems: [Custom Hooks Patterns, Hooks Internals, Context API and State Management]
---

**Compare Higher-Order Components (HOCs), Render Props, and Custom Hooks for code reuse in React.**

These are three patterns for sharing stateful logic between components.

**1. Higher-Order Components (HOC):**
A HOC is a function that takes a component and returns a new component with additional props or behavior. It is a pattern borrowed from higher-order functions.
- Pattern: `const Enhanced = withSomething(BaseComponent)`
- Pros: Clean API for consumers, composable.
- Cons: Prop name collisions ("prop drilling via wrapping"), hard to trace where props come from, wrapper hell in DevTools, static methods must be hoisted.

**2. Render Props:**
A component that takes a function as a prop (often `children` or `render`) and calls it with some data, delegating rendering to the consumer.
- Pattern: `<DataProvider render={(data) => <Display data={data} />} />`
- Pros: Explicit data flow, no prop collisions, flexible.
- Cons: Can lead to "callback hell" with nesting, harder to optimize with memo.

**3. Custom Hooks:**
Custom hooks extract stateful logic into reusable functions. They use built-in hooks and return values directly.
- Pattern: `const { data, loading } = useSomething()`
- Pros: No wrapper components, no nesting, composable, easy to type with TypeScript, easy to test.
- Cons: Only works in function components.

**Modern recommendation:** Custom Hooks are the standard approach in modern React. HOCs and Render Props are legacy patterns but still appear in older codebases and libraries.

## Examples

**Input:** Share mouse position tracking logic between components
**Output:** Can use HOC, Render Props, or Custom Hook — Hook is simplest
*All three patterns achieve the same goal with different trade-offs in readability and composability.*


## Solution

```js
import React, { useState, useEffect, ComponentType } from 'react';

// Shared logic: track mouse position
interface MousePosition {
  x: number;
  y: number;
}

// ============================================
// Pattern 1: Higher-Order Component (HOC)
// ============================================
interface WithMouseProps {
  mouse: MousePosition;
}

function withMouse<P extends WithMouseProps>(
  WrappedComponent: ComponentType<P>
) {
  return function WithMouseComponent(
    props: Omit<P, keyof WithMouseProps>
  ) {
    const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

    useEffect(() => {
      const handleMove = (e: MouseEvent) => {
        setPosition({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', handleMove);
      return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    return <WrappedComponent {...(props as P)} mouse={position} />;
  };
}

// Usage:
function DisplayWithHOC({ mouse }: WithMouseProps) {
  return (
    <p>
      Mouse: ({mouse.x}, {mouse.y})
    </p>
  );
}
const EnhancedDisplay = withMouse(DisplayWithHOC);
// <EnhancedDisplay /> — no need to pass mouse prop

// ============================================
// Pattern 2: Render Props
// ============================================
interface MouseTrackerProps {
  render: (position: MousePosition) => React.ReactNode;
}

function MouseTracker({ render }: MouseTrackerProps) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return <>{render(position)}</>;
}

// Usage:
function AppWithRenderProp() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <p>
          Mouse: ({x}, {y})
        </p>
      )}
    />
  );
}

// ============================================
// Pattern 3: Custom Hook (Modern, Recommended)
// ============================================
function useMouse(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return position;
}

// Usage:
function AppWithHook() {
  const { x, y } = useMouse();
  return (
    <p>
      Mouse: ({x}, {y})
    </p>
  );
}

// ---- Composing multiple hooks is trivial ----
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

function Dashboard() {
  const mouse = useMouse();
  const windowSize = useWindowSize();

  return (
    <div>
      <p>Mouse: ({mouse.x}, {mouse.y})</p>
      <p>Window: {windowSize.width} x {windowSize.height}</p>
    </div>
  );
}
```
