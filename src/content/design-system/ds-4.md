---
id: ds-4
title: Theme System Architecture
category: Design System
subcategory: Theming
difficulty: Medium
pattern: Theming
companies: [Meta, Google, Airbnb]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "The best theme systems use CSS custom properties for zero-JS-rerender theme switching, a two-layer token architecture (primitive + semantic), and data attributes for theme scoping. This allows nested themes, system preference detection, and persistent user choice with minimal runtime cost."
similarProblems: [ds-7, ds-6, ds-1]
---

A theme system is the backbone of any design system's visual consistency. It defines the visual language — colors, typography, spacing, shadows, and more — in a structured, reusable way.

Modern theme systems typically use **design tokens** as their foundation. Tokens are named values (like `color.primary.500` or `spacing.md`) that abstract visual decisions away from individual components.

Key architectural decisions include:

1. **Token structure**: How tokens are organized (primitive → semantic → component-level)
2. **CSS Variables vs JS objects**: How tokens are delivered to components
3. **Dark/light mode**: How themes switch without re-rendering the entire tree
4. **Nested themes**: Supporting multiple themes on the same page
5. **Type safety**: Ensuring only valid tokens can be used

The best modern approach combines CSS custom properties (variables) for runtime theming with TypeScript for compile-time safety. CSS variables enable theme switching with zero JavaScript re-renders — you simply swap a class on a parent element.

Design and implement a complete theme system that supports:
- Primitive and semantic token layers
- Dark and light mode with CSS variables
- A ThemeProvider React component
- Type-safe token access
- Nested theme support

## Examples

**Input:** <ThemeProvider theme="dark"><App /></ThemeProvider>
**Output:** All components within App render with dark theme tokens applied via CSS variables
*The ThemeProvider sets a data-theme attribute that activates the corresponding CSS variable definitions.*


## Solution

```js
// ------------------------------------------------
// 1. Token Definitions (design-tokens.ts)
// ------------------------------------------------

// Primitive tokens — raw values with no semantic meaning
const primitiveTokens = {
  colors: {
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    white: '#ffffff',
    black: '#000000',
    red: { 500: '#ef4444', 600: '#dc2626' },
    green: { 500: '#22c55e', 600: '#16a34a' },
  },
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)',
  },
} as const;

// ------------------------------------------------
// 2. Semantic Tokens — light and dark themes
// ------------------------------------------------

type SemanticTokens = {
  bg: { primary: string; secondary: string; tertiary: string; inverse: string };
  text: { primary: string; secondary: string; muted: string; inverse: string; link: string };
  border: { default: string; strong: string; focus: string };
  interactive: {
    primary: string; primaryHover: string;
    danger: string; dangerHover: string;
    success: string;
  };
  surface: { raised: string; overlay: string };
};

const lightTheme: SemanticTokens = {
  bg: {
    primary: primitiveTokens.colors.white,
    secondary: primitiveTokens.colors.gray[50],
    tertiary: primitiveTokens.colors.gray[100],
    inverse: primitiveTokens.colors.gray[900],
  },
  text: {
    primary: primitiveTokens.colors.gray[900],
    secondary: primitiveTokens.colors.gray[700],
    muted: primitiveTokens.colors.gray[500],
    inverse: primitiveTokens.colors.white,
    link: primitiveTokens.colors.blue[600],
  },
  border: {
    default: primitiveTokens.colors.gray[200],
    strong: primitiveTokens.colors.gray[400],
    focus: primitiveTokens.colors.blue[500],
  },
  interactive: {
    primary: primitiveTokens.colors.blue[600],
    primaryHover: primitiveTokens.colors.blue[700],
    danger: primitiveTokens.colors.red[500],
    dangerHover: primitiveTokens.colors.red[600],
    success: primitiveTokens.colors.green[500],
  },
  surface: {
    raised: primitiveTokens.colors.white,
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};

const darkTheme: SemanticTokens = {
  bg: {
    primary: primitiveTokens.colors.gray[900],
    secondary: primitiveTokens.colors.gray[800],
    tertiary: primitiveTokens.colors.gray[700],
    inverse: primitiveTokens.colors.white,
  },
  text: {
    primary: primitiveTokens.colors.gray[50],
    secondary: primitiveTokens.colors.gray[300],
    muted: primitiveTokens.colors.gray[400],
    inverse: primitiveTokens.colors.gray[900],
    link: primitiveTokens.colors.blue[400],
  },
  border: {
    default: primitiveTokens.colors.gray[700],
    strong: primitiveTokens.colors.gray[500],
    focus: primitiveTokens.colors.blue[400],
  },
  interactive: {
    primary: primitiveTokens.colors.blue[500],
    primaryHover: primitiveTokens.colors.blue[400],
    danger: primitiveTokens.colors.red[500],
    dangerHover: primitiveTokens.colors.red[600],
    success: primitiveTokens.colors.green[500],
  },
  surface: {
    raised: primitiveTokens.colors.gray[800],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

// ------------------------------------------------
// 3. CSS Variable generation
// ------------------------------------------------

function flattenTokens(
  obj: Record<string, unknown>,
  prefix = '-'
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const varName = `${prefix}-${key}`;
    if (typeof value === 'string') {
      result[varName] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(
        result,
        flattenTokens(value as Record<string, unknown>, varName)
      );
    }
  }

  return result;
}

function generateCSSVariables(tokens: SemanticTokens): string {
  const flat = flattenTokens(tokens as unknown as Record<string, unknown>, '-');
  return Object.entries(flat)
    .map(([name, value]) => `  -${name}: ${value};`)
    .join('\n');
}

// Generate the CSS:
// :root, [data-theme="light"] { ... light variables ... }
// [data-theme="dark"] { ... dark variables ... }
const themeCSS = `
:root, [data-theme="light"] {
${generateCSSVariables(lightTheme)}
}

[data-theme="dark"] {
${generateCSSVariables(darkTheme)}
}
`;

// ------------------------------------------------
// 4. ThemeProvider React component
// ------------------------------------------------

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ThemeName = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeName;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

interface ThemeProviderProps {
  defaultTheme?: ThemeName;
  storageKey?: string;
  children: React.ReactNode;
}

export function ThemeProvider({
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  children,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    return (localStorage.getItem(storageKey) as ThemeName) || defaultTheme;
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Listen for OS preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mq.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  // Apply data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (newTheme: ThemeName) => {
      setThemeState(newTheme);
      localStorage.setItem(storageKey, newTheme);
    },
    [storageKey]
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ------------------------------------------------
// 5. Type-safe token access helper
// ------------------------------------------------

// Use in CSS-in-JS or inline styles:
// color: token('text.primary')  => var(---text-primary)
function token(path: string): string {
  return `var(---${path.replace(/\./g, '-')})`;
}

// Usage in components:
// const Button = styled.button`
//   background: ${token('interactive.primary')};
//   color: ${token('text.inverse')};
//   border: 1px solid ${token('border.default')};
//   border-radius: ${primitiveTokens.borderRadius.md};
//   padding: ${primitiveTokens.spacing[2]} ${primitiveTokens.spacing[4]};
//   &:hover { background: ${token('interactive.primaryHover')}; }
// `;

export { primitiveTokens, lightTheme, darkTheme, token, themeCSS };
```

## Explanation

CONCEPT: Theme System with Design Tokens

```
TOKEN HIERARCHY:

Layer 1 — PRIMITIVE tokens (raw values):
  --blue-500: #3b82f6
  --gray-900: #111827
  --space-4: 16px

Layer 2 — SEMANTIC tokens (meaning):
  --color-primary: var(--blue-500)
  --color-bg: var(--gray-900)
  --spacing-md: var(--space-4)

Layer 3 — COMPONENT tokens (specific usage):
  --button-bg: var(--color-primary)
  --button-padding: var(--spacing-md)
  --card-bg: var(--color-bg)

THEME SWITCHING:

:root (light)              [data-theme="dark"]
──────────────             ─────────────────────
--color-primary: #3b82f6   --color-primary: #60a5fa
--color-bg: #ffffff        --color-bg: #111827
--color-text: #111827      --color-text: #f9fafb

Components reference semantic tokens → theme changes
automatically propagate everywhere!
```

CSS variables cascade naturally through the DOM, enabling nested themes:
```
<div data-theme="light">
  Light content
  <div data-theme="dark">
    Dark sidebar (overrides parent theme)
  </div>
</div>
```
