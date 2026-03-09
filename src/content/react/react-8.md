---
id: react-8
title: Suspense and Lazy Loading
category: React
subcategory: Performance
difficulty: Medium
pattern: Code Splitting
companies: [Meta, Netflix, Google]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "React.lazy + Suspense enable code splitting by loading components on demand. Lazy components throw Promises when first rendered, which Suspense catches to show fallback UI. Use route-based splitting as a baseline, component-level splitting for heavy UI, and preloading for perceived performance. Always pair with an Error Boundary for robustness."
similarProblems: [React Fiber Architecture, Error Boundaries, Concurrent Features]
---

**Explain React Suspense and how lazy loading works for code splitting.**

**React.lazy:**
`React.lazy()` lets you define a component that is loaded dynamically. It takes a function that returns a dynamic `import()`. The component is only fetched when it is first rendered.

**Suspense:**
`<Suspense>` is a component that wraps lazy-loaded components and displays a fallback UI (like a spinner) while the lazy component is loading. It "catches" the loading state similar to how error boundaries catch errors.

**How it works internally:**
1. When a lazy component renders for the first time, it throws a Promise (yes, literally throws it).
2. The nearest Suspense boundary catches this Promise.
3. Suspense renders the fallback UI.
4. When the Promise resolves (the chunk is loaded), React re-renders the suspended tree with the actual component.

**Code Splitting:**
By default, bundlers (Webpack, Vite) pack all code into one or few bundles. React.lazy + dynamic import creates split points — each lazy component becomes a separate chunk that is loaded on demand.

**Common patterns:**
- Route-based splitting: Lazy load each page/route.
- Component-based splitting: Lazy load heavy components (modals, charts, editors).
- Nested Suspense: Different fallbacks for different sections of the page.

**React 18+ Suspense for Data:**
In React 18+, Suspense also supports data fetching (when used with compatible libraries like Relay, Next.js, or the experimental `use()` hook). The component suspends while data is loading, showing the fallback.

## Examples

**Input:** User navigates to /dashboard route
**Output:** Dashboard chunk is fetched on demand, spinner shown during load
*Route-based code splitting ensures users only download code for the pages they visit.*


## Solution

```js
import React, { Suspense, lazy, useState } from 'react';

// ============================================
// Basic: React.lazy for route-based code splitting
// ============================================

// These imports create separate chunks — not loaded until rendered
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));

function AppWithRoutes() {
  const [page, setPage] = useState<'dashboard' | 'settings' | 'profile'>(
    'dashboard'
  );

  return (
    <div>
      <nav>
        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        <button onClick={() => setPage('settings')}>Settings</button>
        <button onClick={() => setPage('profile')}>Profile</button>
      </nav>

      {/* Suspense boundary catches the loading state */}
      <Suspense fallback={<div>Loading page...</div>}>
        {page === 'dashboard' && <Dashboard />}
        {page === 'settings' && <Settings />}
        {page === 'profile' && <Profile />}
      </Suspense>
    </div>
  );
}

// ============================================
// With React Router
// ============================================
// import { BrowserRouter, Routes, Route } from 'react-router-dom';

// function AppWithRouter() {
//   return (
//     <BrowserRouter>
//       <Suspense fallback={<FullPageSpinner />}>
//         <Routes>
//           <Route path="/" element={<Dashboard />} />
//           <Route path="/settings" element={<Settings />} />
//           <Route path="/profile" element={<Profile />} />
//         </Routes>
//       </Suspense>
//     </BrowserRouter>
//   );
// }

// ============================================
// Component-level lazy loading (e.g., heavy modal)
// ============================================
const HeavyChartLibrary = lazy(() => import('./components/HeavyChart'));

function AnalyticsPage() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <h1>Analytics</h1>
      <button onClick={() => setShowChart(true)}>Show Chart</button>

      {showChart && (
        <Suspense fallback={<div>Loading chart...</div>}>
          <HeavyChartLibrary />
        </Suspense>
      )}
    </div>
  );
}

// ============================================
// Nested Suspense boundaries
// ============================================
const Sidebar = lazy(() => import('./components/Sidebar'));
const Feed = lazy(() => import('./components/Feed'));
const Recommendations = lazy(() => import('./components/Recommendations'));

function SocialApp() {
  return (
    <div style={{ display: 'flex' }}>
      {/* Each section has its own loading state */}
      <Suspense fallback={<div>Loading sidebar...</div>}>
        <Sidebar />
      </Suspense>

      <main>
        <Suspense fallback={<div>Loading feed...</div>}>
          <Feed />
        </Suspense>
      </main>

      <aside>
        <Suspense fallback={<div>Loading recommendations...</div>}>
          <Recommendations />
        </Suspense>
      </aside>
    </div>
  );
}

// ============================================
// Preloading: Start loading before the user navigates
// ============================================
// Store the lazy import so we can trigger it early
const lazyDashboard = () => import('./pages/Dashboard');
const PreloadedDashboard = lazy(lazyDashboard);

function NavWithPreload() {
  const [page, setPage] = useState<'home' | 'dashboard'>('home');

  const handleMouseEnter = () => {
    // Start loading the chunk on hover (before click)
    lazyDashboard();
  };

  return (
    <div>
      <button
        onMouseEnter={handleMouseEnter}
        onClick={() => setPage('dashboard')}
      >
        Go to Dashboard
      </button>

      <Suspense fallback={<div>Loading...</div>}>
        {page === 'dashboard' && <PreloadedDashboard />}
      </Suspense>
    </div>
  );
}

// ============================================
// Error handling with Suspense + Error Boundary
// ============================================
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function RobustApp() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong.</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>
    </ErrorBoundary>
  );
}
```
