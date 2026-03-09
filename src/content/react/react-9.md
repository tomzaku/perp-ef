---
id: react-9
title: Error Boundaries
category: React
subcategory: Error Handling
difficulty: Medium
pattern: Error Handling
companies: [Amazon, Google, Meta]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Error Boundaries are class components that catch render-time errors in their subtree and display fallback UI instead of crashing the whole app. They do NOT catch event handler or async errors. Use them at multiple levels of granularity, provide recovery mechanisms, and log errors to monitoring services."
similarProblems: [Suspense and Lazy Loading, Server Components vs Client Components, React Fiber Architecture]
---

**What are Error Boundaries in React and how do they work?**

Error Boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of crashing the entire application.

**Key facts:**

1. **Class components only (currently):** Error boundaries must be class components that implement `static getDerivedStateFromError()` and/or `componentDidCatch()`. There is no hook equivalent yet (though libraries like `react-error-boundary` provide a hook-based API).

2. **Two lifecycle methods:**
   - `static getDerivedStateFromError(error)` — Called during the render phase. Returns a state update to show the fallback UI. Must be pure (no side effects).
   - `componentDidCatch(error, errorInfo)` — Called during the commit phase. Used for side effects like logging to an error reporting service. Receives `errorInfo.componentStack` showing which component threw.

3. **What they catch:**
   - Errors during rendering
   - Errors in lifecycle methods
   - Errors in constructors of child components

4. **What they do NOT catch:**
   - Event handlers (use try/catch instead)
   - Asynchronous code (setTimeout, fetch callbacks)
   - Server-side rendering errors
   - Errors thrown in the error boundary itself

5. **Granularity:** Place error boundaries strategically — around routes, around widgets, around risky third-party components. A single top-level boundary prevents a white screen, but granular boundaries provide better UX by isolating failures.

**Best practices:**
- Use multiple error boundaries at different levels of the tree.
- Provide a way to recover (retry button, refresh, navigate away).
- Log errors to a monitoring service (Sentry, DataDog, etc.).
- Consider using the `react-error-boundary` library for a more ergonomic API with hooks and reset capabilities.

## Examples

**Input:** A chart component throws during rendering
**Output:** Error boundary catches it and shows "Chart failed to load" instead of crashing the page
*The error is contained to the boundary — the rest of the app continues working.*


## Solution

```js
import React, { Component, useState, ErrorInfo, ReactNode } from 'react';

// ============================================
// Basic Error Boundary
// ============================================
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Called during render phase — update state to show fallback
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  // Called during commit phase — log the error
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Log to external service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{ padding: 20, color: 'red' }}>
            <h2>Something went wrong.</h2>
            <pre>{this.state.error?.message}</pre>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// ============================================
// Advanced: Error Boundary with reset/retry
// ============================================
interface AdvancedErrorBoundaryProps {
  children: ReactNode;
  fallbackRender: (props: {
    error: Error;
    resetErrorBoundary: () => void;
  }) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: () => void;
}

interface AdvancedErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AdvancedErrorBoundary extends Component<
  AdvancedErrorBoundaryProps,
  AdvancedErrorBoundaryState
> {
  state: AdvancedErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(
    error: Error
  ): Partial<AdvancedErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  resetErrorBoundary = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallbackRender({
        error: this.state.error,
        resetErrorBoundary: this.resetErrorBoundary,
      });
    }
    return this.props.children;
  }
}

// ============================================
// Usage: Granular error boundaries
// ============================================
function BuggyWidget() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Widget crashed!');
  }

  return (
    <button onClick={() => setShouldError(true)}>
      Click to crash this widget
    </button>
  );
}

function App() {
  return (
    <div>
      <h1>My App</h1>

      {/* Top-level boundary: catches anything not handled below */}
      <ErrorBoundary fallback={<h2>App crashed. Please refresh.</h2>}>
        <nav>Navigation Bar</nav>

        <main>
          {/* Granular boundary: only this widget section fails */}
          <AdvancedErrorBoundary
            onError={(error, info) => {
              // Send to Sentry, DataDog, etc.
              console.error('Logged to service:', error.message);
            }}
            onReset={() => {
              // Clean up any side effects before retry
              console.log('Resetting widget state...');
            }}
            fallbackRender={({ error, resetErrorBoundary }) => (
              <div role="alert" style={{ padding: 16, border: '1px solid red' }}>
                <h3>Widget Error</h3>
                <p>{error.message}</p>
                <button onClick={resetErrorBoundary}>Try Again</button>
              </div>
            )}
          >
            <BuggyWidget />
          </AdvancedErrorBoundary>

          {/* This section is unaffected by the widget error */}
          <section>
            <h2>Other Content</h2>
            <p>This still works even if the widget above crashes.</p>
          </section>
        </main>
      </ErrorBoundary>
    </div>
  );
}

// ============================================
// Event handler errors (NOT caught by boundaries)
// ============================================
function FormWithEventHandler() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    try {
      // Error boundaries don't catch event handler errors
      riskyOperation();
    } catch (err) {
      // Use local state to handle event errors
      setError((err as Error).message);
    }
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

function riskyOperation() {
  throw new Error('Event handler failure');
}
```
