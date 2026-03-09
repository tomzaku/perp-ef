---
id: ds-8
title: Component Documentation and Visual Regression
category: Design System
subcategory: Quality
difficulty: Medium
pattern: Documentation
companies: [Meta, Google, Shopify]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Design system documentation is a product itself. Use Storybook with autodocs for interactive API docs, write a \"kitchen sink\" story for every component to serve as both documentation and visual regression target, use play functions for interaction tests, and integrate Chromatic or Percy into CI to catch unintended visual regressions automatically."
similarProblems: [ds-9, ds-5, ds-1]
---

A design system is only as good as its documentation. Components without clear docs, live examples, and usage guidelines will be misused, reimplemented, or ignored entirely. This question covers the two pillars of design system quality: documentation and visual regression testing.

**Storybook** is the industry standard for component documentation:
- Stories: Isolated examples of component states
- Controls: Interactive prop editors for exploration
- Docs: Auto-generated API docs from TypeScript types
- Addons: a11y auditing, viewport testing, interaction testing

**Visual Regression Testing** catches unintended visual changes:
- Tools: Chromatic (by Storybook), Percy, Playwright visual comparisons
- Captures screenshots of each component state
- Compares against baseline images pixel-by-pixel
- Flags visual diffs for review in PRs

Best practices for documentation:
1. Every component has a "kitchen sink" story showing all variants
2. Every prop is demonstrated in isolation
3. Usage guidelines with Do/Don't examples
4. Accessibility annotations
5. Copy-pasteable code examples

Best practices for visual regression:
1. Test every component state (default, hover, focus, disabled, error, loading)
2. Test responsive breakpoints
3. Test light and dark themes
4. Test with different content lengths (short text, long text, overflow)
5. Keep baseline updates intentional — review every diff

Implement Storybook stories for a Button component that cover all states and variants, configure visual regression testing, and set up automated a11y auditing.

## Examples

**Input:** Create Storybook stories for a Button component
**Output:** Complete .stories.tsx file with all variants, states, interactions, and a11y tests
*Stories serve as both documentation and visual regression test targets.*


## Solution

```js
// ================================================
// 1. Button.stories.tsx — Complete Storybook documentation
// ================================================

import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { Button } from './Button';

// Meta configuration
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'], // Auto-generate docs page
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Button component is used to trigger actions or navigate. It supports
multiple variants, sizes, and states.

## Usage Guidelines
- Use **primary** for the main action on a page (one per section)
- Use **secondary** for alternative actions
- Use **danger** for destructive actions (always require confirmation)
- Use **ghost** for low-emphasis actions

## Accessibility
- Always provide descriptive text or aria-label
- Never disable a button without explaining why (use a tooltip)
- Loading state announces to screen readers via aria-busy
        `,
      },
    },
  },
  // Arg types for controls panel
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
      description: 'Visual style variant',
      table: {
        type: { summary: "'primary' | 'secondary' | 'danger' | 'ghost'" },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
      table: {
        type: { summary: "'sm' | 'md' | 'lg'" },
        defaultValue: { summary: 'md' },
      },
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    children: { control: 'text' },
    onClick: { action: 'clicked' },
  },
  // Default args
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    fullWidth: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ------------------------------------------------
// Individual stories
// ------------------------------------------------

/** Default button with primary variant */
export const Default: Story = {};

/** All variant options */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};

/** All size options */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

/** Disabled state */
export const Disabled: Story = {
  args: { disabled: true },
};

/** Loading state with spinner */
export const Loading: Story = {
  args: { loading: true, children: 'Saving...' },
};

/** Full width button */
export const FullWidth: Story = {
  args: { fullWidth: true },
  parameters: { layout: 'padded' },
};

/** Button with icon */
export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Button variant="primary">
        <span aria-hidden="true">+</span> Add Item
      </Button>
      <Button variant="danger">
        <span aria-hidden="true">🗑</span> Delete
      </Button>
    </div>
  ),
};

/** Dark theme */
export const DarkTheme: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    theme: 'dark',
  },
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};

/** Long text overflow behavior */
export const LongText: Story = {
  args: {
    children: 'This is a very long button label that might cause overflow issues',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '200px' }}>
        <Story />
      </div>
    ),
  ],
};

// ------------------------------------------------
// Kitchen Sink — all states in one view (ideal for visual regression)
// ------------------------------------------------

export const KitchenSink: Story = {
  render: () => {
    const variants = ['primary', 'secondary', 'danger', 'ghost'] as const;
    const sizes = ['sm', 'md', 'lg'] as const;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {variants.map((variant) => (
          <div key={variant}>
            <h3 style={{ marginBottom: '8px', textTransform: 'capitalize' }}>
              {variant}
            </h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              {sizes.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {size.toUpperCase()}
                </Button>
              ))}
              <Button variant={variant} disabled>
                Disabled
              </Button>
              <Button variant={variant} loading>
                Loading
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// ------------------------------------------------
// Interaction tests (play functions)
// ------------------------------------------------

export const ClickInteraction: Story = {
  args: { children: 'Click Me' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /click me/i });

    // Verify button is rendered
    await expect(button).toBeInTheDocument();
    await expect(button).not.toBeDisabled();

    // Click and verify handler was called
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const DisabledInteraction: Story = {
  args: { children: 'Disabled', disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toBeDisabled();
  },
};

export const KeyboardInteraction: Story = {
  args: { children: 'Press Enter' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Focus via Tab
    await userEvent.tab();
    await expect(button).toHaveFocus();

    // Activate via Enter
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalled();
  },
};

// ================================================
// 2. Visual Regression Testing Config (Chromatic)
// ================================================

// .storybook/main.ts
const storybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',   // Controls, docs, actions, viewport
    '@storybook/addon-a11y',          // Accessibility auditing
    '@storybook/addon-interactions',  // Play function testing
    '@chromatic-com/storybook',       // Visual regression
  ],
  framework: '@storybook/react-vite',
};

// chromatic.config.json
const chromaticConfig = {
  projectId: 'project_abc123',
  autoAcceptChanges: 'main',          // Auto-accept on main (baseline)
  exitZeroOnChanges: false,           // Fail CI on visual changes
  onlyChanged: true,                  // Only test stories that changed
  externals: ['**/*.css'],            // Re-test when CSS changes
};

// package.json scripts
const packageScripts = {
  'storybook': 'storybook dev -p 6006',
  'storybook:build': 'storybook build',
  'chromatic': 'chromatic --project-token=${CHROMATIC_TOKEN}',
  'test:visual': 'chromatic --only-changed',
};

// ================================================
// 3. Accessibility Addon Configuration
// ================================================

// .storybook/preview.ts
const previewConfig = {
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'label', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'image-alt', enabled: true },
        ],
      },
    },
  },
};

// CI integration: run a11y checks in CI
// npx storybook build
// npx @storybook/test-runner --url http://localhost:6006 --stories-json

export { meta as buttonMeta, storybookConfig, chromaticConfig };
```
