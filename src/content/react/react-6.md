---
id: react-6
title: Context API and State Management
category: React
subcategory: State Management
difficulty: Medium
pattern: Context
companies: [Amazon, Google, Meta]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Context is ideal for low-frequency, widely-consumed state (theme, auth, locale). For performance, split contexts by domain, memoize provider values, and separate state/dispatch contexts. For high-frequency updates, consider external state managers like Zustand that offer selective subscriptions."
similarProblems: ["React.memo, useMemo, useCallback", HOC vs Render Props vs Hooks, Custom Hooks Patterns]
---

**Explain the React Context API and when to use it vs external state management libraries.**

The Context API is a built-in React mechanism for passing data through the component tree without prop drilling. It provides a way to share values (state, functions, themes, auth) between components without passing props at every level.

**How Context Works:**

1. **createContext(defaultValue):** Creates a context object with a default value.
2. **Context.Provider:** A component that wraps a subtree and provides a value to all descendants.
3. **useContext(Context):** A hook that reads the nearest Provider's value.

**Key Behavior:**
- When the Provider's `value` changes, ALL consumers re-render, regardless of whether they use the specific piece of data that changed.
- This is the main performance concern with Context.

**Context vs External State Management (Redux, Zustand, Jotai):**

| Aspect | Context | Redux/Zustand |
|--------|---------|---------------|
| Re-renders | All consumers on any change | Selective subscriptions |
| DevTools | Limited | Rich debugging |
| Middleware | None | Logging, async, etc. |
| Boilerplate | Minimal | More setup (Redux) / Minimal (Zustand) |
| Best for | Low-frequency updates (theme, auth, locale) | High-frequency updates (forms, real-time data) |

**Best practices:**
- Split contexts by domain (AuthContext, ThemeContext, etc.) rather than one giant context.
- Memoize provider values to avoid unnecessary re-renders.
- For frequently changing state, consider useReducer + Context or an external library.

## Examples

**Input:** Theme toggle needs to be accessible by deeply nested components
**Output:** Use Context to provide theme value without prop drilling
*Context is ideal for infrequently changing, widely consumed values like themes.*


## Solution

```js
import React, {
  createContext,
  useContext,
  useState,
  useReducer,
  useMemo,
  ReactNode,
} from 'react';

// ============================================
// Basic Context: Theme
// ============================================
type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Custom hook for consuming context (with safety check)
function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // Memoize value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Consuming component (deeply nested — no prop drilling)
function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{
        background: theme === 'dark' ? '#333' : '#fff',
        color: theme === 'dark' ? '#fff' : '#333',
      }}
    >
      Toggle Theme (current: {theme})
    </button>
  );
}

// ============================================
// Advanced: useReducer + Context for complex state
// ============================================
interface AuthState {
  user: { name: string; email: string } | null;
  isAuthenticated: boolean;
  loading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { name: string; email: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' };

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGIN_FAILURE':
      return { ...initialAuthState };
    case 'LOGOUT':
      return { ...initialAuthState };
    default:
      return state;
  }
}

// Split state and dispatch into separate contexts to avoid
// re-rendering components that only dispatch actions
const AuthStateContext = createContext<AuthState | undefined>(undefined);
const AuthDispatchContext = createContext<
  React.Dispatch<AuthAction> | undefined
>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}

function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context) throw new Error('useAuthState must be within AuthProvider');
  return context;
}

function useAuthDispatch() {
  const context = useContext(AuthDispatchContext);
  if (!context) throw new Error('useAuthDispatch must be within AuthProvider');
  return context;
}

// Usage
function LoginButton() {
  const dispatch = useAuthDispatch(); // won't re-render when auth state changes
  const handleLogin = async () => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await fakeLoginApi();
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch {
      dispatch({ type: 'LOGIN_FAILURE' });
    }
  };
  return <button onClick={handleLogin}>Login</button>;
}

function UserProfile() {
  const { user, isAuthenticated } = useAuthState();
  if (!isAuthenticated) return <p>Not logged in</p>;
  return <p>Welcome, {user?.name}</p>;
}

// ============================================
// App with composed providers
// ============================================
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedButton />
        <UserProfile />
        <LoginButton />
      </AuthProvider>
    </ThemeProvider>
  );
}

async function fakeLoginApi() {
  return { name: 'John', email: 'john@example.com' };
}
```
