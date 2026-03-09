---
id: ds-9
title: Design System Testing Strategies
category: Design System
subcategory: Testing
difficulty: Medium
pattern: Testing
companies: [Meta, Amazon, Google]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Design system testing requires four layers: unit tests (React Testing Library for behavior), accessibility tests (jest-axe for automated WCAG checks), visual regression tests (Chromatic/Playwright for pixel comparisons), and integration tests (compound components working together). Always test from the user perspective using getByRole, never test implementation details, and make accessibility tests mandatory in CI."
similarProblems: [ds-8, ds-5, ds-2]
---

Testing a design system requires a multi-layered approach because components are consumed across many applications. A bug in a design system component can break dozens of products simultaneously. The testing pyramid for design systems includes:

**1. Unit Tests**: Test component logic in isolation
- Props render correctly
- State changes work as expected
- Event handlers fire appropriately
- Edge cases (empty data, null values, overflow)

**2. Integration Tests**: Test component composition
- Compound components work together
- Form components integrate with form libraries
- Context providers pass data correctly

**3. Accessibility Tests**: Automated a11y validation
- axe-core integration for WCAG compliance
- Keyboard navigation works
- ARIA attributes are correct
- Focus management behaves properly

**4. Visual Regression Tests**: Pixel-level comparison
- Every component state is captured
- Changes flagged for manual review
- Prevents unintended visual side effects

**5. Cross-Browser Tests**: Ensure consistency
- Test on Chrome, Firefox, Safari, Edge
- Test on different OS (Windows rendering vs Mac)

The primary tools are:
- **React Testing Library (RTL)**: Test from the user's perspective
- **jest-axe / vitest-axe**: Automated a11y assertions
- **Chromatic / Percy**: Visual regression
- **Playwright**: E2E and cross-browser testing

Key testing philosophy for design systems:
- Test behavior, not implementation
- Test what users see and do, not internal state
- Every bug fix should add a regression test
- Accessibility tests are not optional — they are required

Implement comprehensive tests for a Button and a Select component using React Testing Library and jest-axe.

## Examples

**Input:** Write tests for a Button component
**Output:** Complete test file covering rendering, interactions, accessibility, and edge cases
*Tests use React Testing Library queries (getByRole, getByText) to test from the user perspective.*


## Solution

```js
// ================================================
// 1. Button.test.tsx — Comprehensive Button tests
// ================================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './Button';

expect.extend(toHaveNoViolations);

describe('Button', () => {
  // ---- Rendering ----
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('renders all variants', () => {
      const variants = ['primary', 'secondary', 'danger', 'ghost'] as const;
      const { rerender } = render(<Button variant="primary">Test</Button>);

      variants.forEach((variant) => {
        rerender(<Button variant={variant}>Test</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });

    it('renders all sizes', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      const { rerender } = render(<Button size="sm">Test</Button>);

      sizes.forEach((size) => {
        rerender(<Button size={size}>Test</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });

    it('renders children as content', () => {
      render(
        <Button>
          <span data-testid="icon">★</span>
          Star
        </Button>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Star')).toBeInTheDocument();
    });

    it('renders as full width when specified', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ width: '100%' });
    });
  });

  // ---- Interactions ----
  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button onClick={handleClick}>Click</Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <Button onClick={handleClick} disabled>
          Click
        </Button>
      );
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <Button onClick={handleClick} loading>
          Click
        </Button>
      );
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('responds to Enter key', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button onClick={handleClick}>Press Enter</Button>);
      screen.getByRole('button').focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('responds to Space key', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button onClick={handleClick}>Press Space</Button>);
      screen.getByRole('button').focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // ---- States ----
  describe('states', () => {
    it('shows disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('shows loading state with aria-busy', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('is focusable when not disabled', () => {
      render(<Button>Focus me</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      render(<Button disabled>No focus</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  // ---- Accessibility ----
  describe('accessibility', () => {
    it('has no a11y violations (default)', async () => {
      const { container } = render(<Button>Accessible</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations (disabled)', async () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations (all variants)', async () => {
      const variants = ['primary', 'secondary', 'danger', 'ghost'] as const;

      for (const variant of variants) {
        const { container } = render(
          <Button variant={variant}>{variant}</Button>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('supports aria-label for icon-only buttons', async () => {
      const { container } = render(
        <Button aria-label="Close dialog">×</Button>
      );
      expect(
        screen.getByRole('button', { name: /close dialog/i })
      ).toBeInTheDocument();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has type="button" by default to prevent form submission', () => {
      render(<Button>Click</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });
  });
});

// ================================================
// 2. Select.test.tsx — Compound component integration tests
// ================================================

import { Select } from './Select';

describe('Select', () => {
  const renderSelect = (props = {}) => {
    return render(
      <Select placeholder="Choose fruit" {...props}>
        <Select.Option value="apple">Apple</Select.Option>
        <Select.Option value="banana">Banana</Select.Option>
        <Select.Option value="cherry">Cherry</Select.Option>
        <Select.Option value="grape" disabled>
          Grape (sold out)
        </Select.Option>
      </Select>
    );
  };

  // ---- Rendering ----
  describe('rendering', () => {
    it('renders with placeholder', () => {
      renderSelect();
      expect(
        screen.getByRole('combobox', { name: /choose fruit/i })
      ).toBeInTheDocument();
    });

    it('renders selected value', () => {
      renderSelect({ value: 'banana' });
      expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
    });

    it('starts closed', () => {
      renderSelect();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  // ---- Interactions ----
  describe('interactions', () => {
    it('opens on click', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(4);
    });

    it('selects an option on click', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderSelect({ onChange });

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: /banana/i }));

      expect(onChange).toHaveBeenCalledWith('banana');
    });

    it('closes after selection', async () => {
      const user = userEvent.setup();
      renderSelect({ onChange: jest.fn() });

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: /apple/i }));

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('does not select disabled option', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderSelect({ onChange });

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: /grape/i }));

      expect(onChange).not.toHaveBeenCalled();
    });

    it('closes on outside click', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.click(document.body);
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  // ---- Keyboard Navigation ----
  describe('keyboard navigation', () => {
    it('opens with ArrowDown', async () => {
      const user = userEvent.setup();
      renderSelect();

      screen.getByRole('combobox').focus();
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('navigates options with ArrowDown/ArrowUp', async () => {
      const user = userEvent.setup();
      renderSelect();

      screen.getByRole('combobox').focus();
      await user.keyboard('{ArrowDown}'); // Open & highlight first
      await user.keyboard('{ArrowDown}'); // Highlight second

      const options = screen.getAllByRole('option');
      expect(options[1]).toHaveAttribute('data-highlighted', 'true');
    });

    it('selects with Enter', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderSelect({ onChange });

      screen.getByRole('combobox').focus();
      await user.keyboard('{ArrowDown}'); // Open
      await user.keyboard('{ArrowDown}'); // Highlight banana
      await user.keyboard('{Enter}');     // Select

      expect(onChange).toHaveBeenCalledWith('banana');
    });

    it('closes with Escape', async () => {
      const user = userEvent.setup();
      renderSelect();

      screen.getByRole('combobox').focus();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveFocus();
    });
  });

  // ---- Accessibility ----
  describe('accessibility', () => {
    it('has no a11y violations (closed)', async () => {
      const { container } = renderSelect();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no a11y violations (open)', async () => {
      const user = userEvent.setup();
      const { container } = renderSelect();

      await user.click(screen.getByRole('combobox'));
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has correct ARIA attributes on trigger', () => {
      renderSelect();
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('updates aria-expanded when open', async () => {
      const user = userEvent.setup();
      renderSelect();

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('marks selected option with aria-selected', async () => {
      const user = userEvent.setup();
      renderSelect({ value: 'banana' });

      await user.click(screen.getByRole('combobox'));
      const bananaOption = screen.getByRole('option', { name: /banana/i });
      expect(bananaOption).toHaveAttribute('aria-selected', 'true');
    });

    it('marks disabled option with aria-disabled', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole('combobox'));
      const grapeOption = screen.getByRole('option', { name: /grape/i });
      expect(grapeOption).toHaveAttribute('aria-disabled', 'true');
    });
  });

  // ---- Controlled vs Uncontrolled ----
  describe('controlled mode', () => {
    it('reflects controlled value', () => {
      const { rerender } = render(
        <Select value="apple" onChange={jest.fn()}>
          <Select.Option value="apple">Apple</Select.Option>
          <Select.Option value="banana">Banana</Select.Option>
        </Select>
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('apple');

      rerender(
        <Select value="banana" onChange={jest.fn()}>
          <Select.Option value="apple">Apple</Select.Option>
          <Select.Option value="banana">Banana</Select.Option>
        </Select>
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('banana');
    });
  });

  describe('uncontrolled mode', () => {
    it('manages its own state with defaultValue', async () => {
      const user = userEvent.setup();
      render(
        <Select defaultValue="apple">
          <Select.Option value="apple">Apple</Select.Option>
          <Select.Option value="banana">Banana</Select.Option>
        </Select>
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('apple');

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: /banana/i }));

      expect(screen.getByRole('combobox')).toHaveTextContent('banana');
    });
  });
});

// ================================================
// 3. Visual Regression Test Setup (Playwright)
// ================================================

// button.visual.spec.ts (Playwright)
/*
import { test, expect } from '@playwright/test';

test.describe('Button visual regression', () => {
  test('all variants', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-button--kitchen-sink');
    await expect(page).toHaveScreenshot('button-kitchen-sink.png');
  });

  test('hover state', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-button--default');
    await page.getByRole('button').hover();
    await expect(page).toHaveScreenshot('button-hover.png');
  });

  test('focus state', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-button--default');
    await page.getByRole('button').focus();
    await expect(page).toHaveScreenshot('button-focus.png');
  });

  test('dark theme', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-button--dark-theme');
    await expect(page).toHaveScreenshot('button-dark.png');
  });
});
*/

export {};
```
