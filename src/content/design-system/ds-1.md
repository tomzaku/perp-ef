---
id: ds-1
title: Component API Design Principles
category: Design System
subcategory: Architecture
difficulty: Medium
pattern: API Design
companies: [Meta, Google, Airbnb]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Great component APIs use constrained union types over booleans, composable children over monolithic props, consistent naming conventions, and escape hatches via HTML attribute spreading. The best API is one where the developer falls into the pit of success."
similarProblems: [ds-2, ds-3, ds-7]
---

Design systems live or die by the quality of their component APIs. A well-designed API makes the right thing easy and the wrong thing hard. This question explores the core principles behind designing component APIs that are composable, consistent, and flexible.

**Composability** means components can be combined in ways the original author didn't anticipate. Instead of building monolithic components with dozens of props, you build small, focused components that compose together.

**Consistency** means similar components behave in similar ways. If your Button accepts a `variant` prop, your Badge should too. If your Input uses `onChange`, your Select should as well.

**Flexibility** means components can adapt to different use cases without requiring breaking changes. This is achieved through careful prop design, render props, slots, and escape hatches.

Key anti-patterns to avoid:
- Boolean prop explosion (`isPrimary`, `isSecondary`, `isDanger`)
- Deeply nested configuration objects
- Components that do too many things
- Inconsistent naming across similar components

Discuss good vs bad API design with concrete examples, and explain how to evaluate whether a component API is well-designed.

## Examples

**Input:** Design a Button component API
**Output:** See solution for good vs bad API comparison
*Good APIs use constrained variants instead of boolean flags, consistent naming, and composable children patterns.*


## Solution

```js
// ❌ BAD: Boolean prop explosion
interface BadButtonProps {
  isPrimary?: boolean;
  isSecondary?: boolean;
  isDanger?: boolean;
  isSmall?: boolean;
  isMedium?: boolean;
  isLarge?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  isFullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClick?: () => void;
  label: string; // Forces string-only content
}

// What happens with <Button isPrimary isSecondary>? Undefined behavior!

// ✅ GOOD: Constrained variants + composition
interface ButtonProps {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show a loading spinner */
  loading?: boolean;
  /** Whether the button takes full width */
  fullWidth?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Content - composable, not just strings */
  children: React.ReactNode;
}

// Usage is clear and composable:
// <Button variant="primary" size="lg">Submit</Button>
// <Button variant="danger"><TrashIcon /> Delete</Button>
// <Button variant="ghost" loading>Saving...</Button>

// ------------------------------------------------
// Principle 1: COMPOSABILITY
// ------------------------------------------------

// ❌ BAD: Monolithic card with every possible feature
interface BadCardProps {
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  body: string;
  footer?: string;
  actions?: { label: string; onClick: () => void }[];
  badge?: string;
  avatar?: { src: string; name: string };
}

// ✅ GOOD: Composable card with sub-components
interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = ({ children, padding = 'md', shadow = 'md' }: CardProps) => (
  <div className={`card card--padding-${padding} card--shadow-${shadow}`}>
    {children}
  </div>
);

Card.Header = ({ children }: { children: React.ReactNode }) => (
  <div className="card__header">{children}</div>
);

Card.Body = ({ children }: { children: React.ReactNode }) => (
  <div className="card__body">{children}</div>
);

Card.Footer = ({ children }: { children: React.ReactNode }) => (
  <div className="card__footer">{children}</div>
);

// Usage: maximum flexibility
// <Card>
//   <Card.Header>
//     <Avatar src={user.avatar} />
//     <h3>{user.name}</h3>
//     <Badge variant="success">Active</Badge>
//   </Card.Header>
//   <Card.Body><p>{post.content}</p></Card.Body>
//   <Card.Footer>
//     <Button variant="ghost">Like</Button>
//     <Button variant="ghost">Share</Button>
//   </Card.Footer>
// </Card>

// ------------------------------------------------
// Principle 2: CONSISTENCY
// ------------------------------------------------

// ✅ Shared prop interfaces ensure consistency across components
interface SizeProps {
  size?: 'sm' | 'md' | 'lg';
}

interface VariantProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

interface LoadingProps {
  loading?: boolean;
}

// All interactive components share these conventions:
// Button: variant, size, disabled, loading
// IconButton: variant, size, disabled, loading
// Select: size, disabled, loading
// Input: size, disabled

// ------------------------------------------------
// Principle 3: FLEXIBILITY (Escape Hatches)
// ------------------------------------------------

interface FlexibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input = ({
  label,
  error,
  startAdornment,
  endAdornment,
  className,
  ...rest // Spread remaining native HTML attributes
}: FlexibleInputProps) => (
  <div className={`input-wrapper ${className ?? ''}`}>
    <label>{label}</label>
    <div className="input-container">
      {startAdornment && <span className="input-start">{startAdornment}</span>}
      <input {...rest} aria-invalid={!!error} />
      {endAdornment && <span className="input-end">{endAdornment}</span>}
    </div>
    {error && <span role="alert" className="input-error">{error}</span>}
  </div>
);

// ------------------------------------------------
// API Design Checklist
// ------------------------------------------------
// 1. Use union types over booleans for mutually exclusive states
// 2. Accept children/ReactNode over string-only props
// 3. Spread native HTML attributes for escape hatches
// 4. Use consistent prop names across components
// 5. Provide sensible defaults for optional props
// 6. Keep required props to a minimum
// 7. Use compound components for complex layouts
// 8. Forward refs for DOM access
// 9. Support className/style for overrides
// 10. Use TypeScript for self-documenting APIs
```
