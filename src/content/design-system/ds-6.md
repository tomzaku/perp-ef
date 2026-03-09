---
id: ds-6
title: CSS-in-JS vs CSS Modules vs Tailwind
category: Design System
subcategory: Styling
difficulty: Medium
pattern: Styling Architecture
companies: [Meta, Airbnb, Shopify]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "There is no universally best approach. CSS Modules offer the best runtime performance with zero cost; CSS-in-JS offers the best DX for dynamic styling; Tailwind offers the fastest development speed and smallest bundles. For design systems specifically, CSS Modules + CSS variables provide the best balance of performance, theming, and maintainability. Newer tools like Vanilla Extract and StyleX combine the best of both worlds."
similarProblems: [ds-4, ds-7, ds-1]
---

Choosing a styling strategy is one of the most impactful architectural decisions for a design system. The three dominant approaches — CSS-in-JS (styled-components, Emotion), CSS Modules, and utility-first CSS (Tailwind) — each have distinct trade-offs in performance, developer experience, type safety, and design system integration.

**CSS-in-JS** (styled-components, Emotion):
- Styles are co-located with components in JavaScript
- Full access to props and theme in styles
- Automatic critical CSS extraction
- Runtime cost: styles are computed and injected at runtime
- Larger bundle size due to library overhead
- SSR requires additional setup to avoid FOUC

**CSS Modules**:
- Standard CSS with locally-scoped class names
- Zero runtime cost — compiled at build time
- Excellent caching (styles extracted to static .css files)
- No access to JS runtime values in styles (must use CSS variables)
- Naming collisions eliminated via build tool
- Less ergonomic for dynamic styles

**Tailwind CSS**:
- Utility-first: small, composable utility classes
- Tiny production bundle (only used utilities are included via PurgeCSS)
- No naming decisions — classes describe styling directly
- Can feel verbose for complex components
- Design tokens built in via config
- Less suitable for truly dynamic styles

**Newer approaches** worth noting:
- Vanilla Extract: type-safe CSS-in-JS with zero runtime
- Panda CSS: build-time CSS-in-JS with type safety
- StyleX (Meta): compile-time atomic CSS from CSS-in-JS syntax

Compare these approaches and show how the same component looks in each. Discuss when to choose each approach for a design system.

## Examples

**Input:** Style a Button component using each approach
**Output:** See solution for side-by-side comparison
*Each approach has different DX, performance, and maintenance trade-offs.*


## Solution

```js
// ================================================
// Approach 1: CSS-in-JS (styled-components / Emotion)
// ================================================

// button.styles.ts (using Emotion)
import styled from '@emotion/styled';
import { css } from '@emotion/react';

interface StyledButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const sizeStyles = {
  sm: css`
    padding: 6px 12px;
    font-size: 0.875rem;
  `,
  md: css`
    padding: 8px 16px;
    font-size: 1rem;
  `,
  lg: css`
    padding: 12px 24px;
    font-size: 1.125rem;
  `,
};

const variantStyles = {
  primary: css`
    background: var(--color-primary);
    color: white;
    &:hover { background: var(--color-primary-hover); }
  `,
  secondary: css`
    background: transparent;
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
    &:hover { background: var(--color-primary-light); }
  `,
  danger: css`
    background: var(--color-danger);
    color: white;
    &:hover { background: var(--color-danger-hover); }
  `,
};

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
  width: ${(p) => (p.fullWidth ? '100%' : 'auto')};

  ${(p) => sizeStyles[p.size]}
  ${(p) => variantStyles[p.variant]}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
`;

// Pros: Dynamic styles from props, co-located, type-safe
// Cons: Runtime overhead, SSR complexity, bundle size

// ================================================
// Approach 2: CSS Modules
// ================================================

/* button.module.css */
/*
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.primary { background: var(--color-primary); color: white; }
.primary:hover { background: var(--color-primary-hover); }
.secondary { background: transparent; color: var(--color-primary); border: 1px solid var(--color-primary); }
.secondary:hover { background: var(--color-primary-light); }
.danger { background: var(--color-danger); color: white; }
.danger:hover { background: var(--color-danger-hover); }

.sm { padding: 6px 12px; font-size: 0.875rem; }
.md { padding: 8px 16px; font-size: 1rem; }
.lg { padding: 12px 24px; font-size: 1.125rem; }

.fullWidth { width: 100%; }
*/

// button.tsx (CSS Modules version)
import clsx from 'clsx';
// import styles from './button.module.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

function ButtonCSSModules({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  ...props
}: ButtonProps) {
  // Uncomment with real CSS Modules:
  // return (
  //   <button
  //     className={clsx(
  //       styles.button,
  //       styles[variant],
  //       styles[size],
  //       fullWidth && styles.fullWidth
  //     )}
  //     {...props}
  //   >
  //     {children}
  //   </button>
  // );
  return <button {...props}>{children}</button>;
}

// Pros: Zero runtime, great caching, standard CSS, IDE support
// Cons: No dynamic styles (use CSS vars), class name composition verbose

// ================================================
// Approach 3: Tailwind CSS
// ================================================

// button.tsx (Tailwind version)
const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary:
    'bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50',
  danger: 'bg-red-500 text-white hover:bg-red-600',
} as const;

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const;

function ButtonTailwind({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-semibold',
        'transition-all duration-150 ease-in-out',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full'
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Pros: Tiny bundle, fast development, built-in design tokens, no naming
// Cons: Verbose markup, less readable, dynamic styles need workarounds

// ================================================
// Comparison Summary
// ================================================

/*
| Criteria            | CSS-in-JS      | CSS Modules    | Tailwind       |
|---------------------|----------------|----------------|----------------|
| Runtime cost        | Medium-High    | None           | None           |
| Bundle size         | Larger         | Small          | Smallest       |
| Dynamic styles      | Excellent      | CSS vars only  | Limited        |
| Type safety         | Full           | Partial        | Plugin needed  |
| SSR support         | Complex        | Native         | Native         |
| Co-location         | In JS file     | Side-by-side   | In markup      |
| Learning curve      | Medium         | Low            | Medium         |
| Design tokens       | Via theme obj  | Via CSS vars   | Via config     |
| IDE support         | Good           | Excellent      | Good (plugin)  |
| Refactoring         | Easy           | Medium         | Hard           |

RECOMMENDATION BY USE CASE:
- Large design system (many consumers): CSS Modules + CSS variables
- Small/medium app, rapid iteration: Tailwind CSS
- Complex theming, many dynamic styles: CSS-in-JS or Vanilla Extract
- Performance-critical: Vanilla Extract or CSS Modules
- Meta/large scale: StyleX (compile-time atomic CSS)
*/

export { ButtonTailwind, ButtonCSSModules };
```
