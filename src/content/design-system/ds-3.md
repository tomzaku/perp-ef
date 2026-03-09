---
id: ds-3
title: Polymorphic Components
category: Design System
subcategory: Patterns
difficulty: Hard
pattern: Polymorphic Components
companies: [Meta, Google, Shopify]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Polymorphic components use TypeScript generics constrained to React.ElementType combined with conditional prop extraction to achieve full type safety. The key types are: AsProp for the `as` prop, PropsToOmit to prevent conflicts, and PolymorphicComponentPropWithRef to merge everything together with proper ref typing."
similarProblems: [ds-1, ds-2, ds-5]
---

A polymorphic component can render as different HTML elements or other React components while maintaining full type safety. The most common approach is an `as` prop that lets consumers change the underlying element.

For example, a `Text` component might render as a `<p>`, `<span>`, `<h1>`, or even a `<Link>` component from a router library — all while providing the same styling API and ensuring that the allowed props change based on the rendered element.

The challenge is making this fully type-safe with TypeScript:
- When `as="a"`, the component should accept `href`
- When `as="button"`, it should accept `onClick` and `type` but NOT `href`
- When `as={Link}`, it should accept whatever props `Link` expects
- The component's own props should always be available

This requires advanced TypeScript generics, specifically:
- Generic type parameters constrained to `React.ElementType`
- Conditional types to extract the correct HTML attributes
- Proper ref forwarding with the right element type
- Omitting the component's own props from the element props to avoid conflicts

Implement a fully type-safe polymorphic `Box` component and a `Text` component that uses it, supporting the `as` prop with correct TypeScript inference.

## Examples

**Input:** <Text as="a" href="/about">Link Text</Text>
**Output:** <a href="/about" class="text">Link Text</a>
*When as="a", the component renders an anchor tag and TypeScript allows href while disallowing button-only props.*

**Input:** <Text as="button" onClick={handleClick}>Click Me</Text>
**Output:** <button class="text" onclick="...">Click Me</button>
*When as="button", TypeScript allows onClick and type but NOT href.*


## Solution

```js
import React, { forwardRef } from 'react';

// ------------------------------------------------
// 1. Core polymorphic type utilities
// ------------------------------------------------

/**
 * Extracts the props for a given element type, excluding
 * the 'as' prop and any of the component's own props.
 */
type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref'];

type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

type PolymorphicComponentPropWithRef<
  C extends React.ElementType,
  Props = {}
> = PolymorphicComponentProp<C, Props> & { ref?: PolymorphicRef<C> };

// ------------------------------------------------
// 2. Box — the foundational polymorphic component
// ------------------------------------------------

type BoxProps<C extends React.ElementType> = PolymorphicComponentPropWithRef<
  C,
  {
    padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    display?: 'block' | 'flex' | 'inline' | 'inline-flex' | 'grid' | 'none';
  }
>;

type BoxComponent = <C extends React.ElementType = 'div'>(
  props: BoxProps<C>
) => React.ReactElement | null;

const Box: BoxComponent = forwardRef(
  <C extends React.ElementType = 'div'>(
    {
      as,
      padding = 'none',
      margin = 'none',
      display,
      style,
      children,
      ...restProps
    }: BoxProps<C>,
    ref?: PolymorphicRef<C>
  ) => {
    const Component = as || 'div';

    const spacingScale: Record<string, string> = {
      none: '0',
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    };

    const computedStyle: React.CSSProperties = {
      padding: spacingScale[padding],
      margin: spacingScale[margin],
      ...(display && { display }),
      ...(style as React.CSSProperties),
    };

    return (
      <Component ref={ref} style={computedStyle} {...restProps}>
        {children}
      </Component>
    );
  }
) as BoxComponent;

// ------------------------------------------------
// 3. Text — a polymorphic component built on Box
// ------------------------------------------------

type TextOwnProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'accent' | 'danger' | 'success';
  align?: 'left' | 'center' | 'right';
  truncate?: boolean;
};

type TextProps<C extends React.ElementType> =
  PolymorphicComponentPropWithRef<C, TextOwnProps>;

type TextComponent = <C extends React.ElementType = 'p'>(
  props: TextProps<C>
) => React.ReactElement | null;

const sizeMap: Record<string, string> = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
};

const colorMap: Record<string, string> = {
  default: '#1a1a1a',
  muted: '#6b7280',
  accent: '#3b82f6',
  danger: '#ef4444',
  success: '#22c55e',
};

const Text: TextComponent = forwardRef(
  <C extends React.ElementType = 'p'>(
    {
      as,
      size = 'md',
      weight = 'normal',
      color = 'default',
      align,
      truncate = false,
      style,
      children,
      ...restProps
    }: TextProps<C>,
    ref?: PolymorphicRef<C>
  ) => {
    const Component = as || 'p';

    const computedStyle: React.CSSProperties = {
      fontSize: sizeMap[size],
      fontWeight: weight,
      color: colorMap[color],
      ...(align && { textAlign: align }),
      ...(truncate && {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const,
      }),
      ...(style as React.CSSProperties),
    };

    return (
      <Component ref={ref} style={computedStyle} {...restProps}>
        {children}
      </Component>
    );
  }
) as TextComponent;

// ------------------------------------------------
// 4. Usage examples with full type safety
// ------------------------------------------------

// All of these are fully type-safe:

// Renders as <p> by default
// <Text size="lg" weight="bold">Hello World</Text>

// Renders as <a>, TypeScript knows href is valid
// <Text as="a" href="/about" color="accent">About Us</Text>

// Renders as <h1>
// <Text as="h1" size="3xl" weight="bold">Page Title</Text>

// Renders as <button>, TypeScript knows onClick is valid
// <Text as="button" onClick={() => alert('clicked')} color="accent">
//   Click Me
// </Text>

// Renders as <span> inside paragraphs
// <Text as="span" size="sm" color="muted">Subtitle</Text>

// ❌ TypeScript ERROR: href is not valid on a button
// <Text as="button" href="/about">Invalid</Text>

// ❌ TypeScript ERROR: onClick expects MouseEvent<HTMLAnchorElement>
// <Text as="a" onClick={(e: MouseEvent<HTMLButtonElement>) => {}}>Bad</Text>

// Box works the same way:
// <Box as="section" padding="lg" margin="md">Content</Box>
// <Box as="nav" display="flex" padding="sm">Navigation</Box>
// <Box as="a" href="/home" padding="md">Link Box</Box>

export { Box, Text };
export type { BoxProps, TextProps, PolymorphicComponentPropWithRef };
```
