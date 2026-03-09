---
id: ds-7
title: Token-Based Design Systems
category: Design System
subcategory: Architecture
difficulty: Medium
pattern: Design Tokens
companies: [Meta, Google, Salesforce]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Design tokens should follow a three-tier hierarchy (primitive, semantic, component), be defined in a platform-agnostic format (W3C tokens spec), and transformed into platform-specific outputs using tools like Style Dictionary. Semantic tokens referencing primitives via aliases enable theme switching by simply re-mapping semantic to different primitive values."
similarProblems: [ds-4, ds-6, ds-1]
---

Design tokens are the single source of truth for a design system's visual properties. They are named entities that store visual design attributes — colors, spacing, typography, shadows, breakpoints, and more — in a platform-agnostic format.

**Token Hierarchy**: Tokens are organized in layers, each adding semantic meaning:

1. **Global/Primitive Tokens**: Raw values with descriptive names
   - `color.blue.500: #3b82f6`
   - `spacing.4: 16px`

2. **Semantic/Alias Tokens**: Purpose-based names that reference primitives
   - `color.bg.primary: {color.white}`
   - `color.text.danger: {color.red.600}`

3. **Component Tokens**: Component-specific overrides
   - `button.bg.primary: {color.interactive.primary}`
   - `button.padding.md: {spacing.3} {spacing.4}`

**Multi-Platform Support**: Design tokens must work across web (CSS), iOS (Swift), Android (Kotlin/XML), and more. The industry-standard approach is to define tokens in a platform-agnostic format (JSON/YAML) and use tools like Style Dictionary (by Amazon) to transform them into platform-specific outputs.

**Token Specification**: The W3C Design Token Community Group is developing a standard format (`.tokens.json`) for interoperability between design tools and code.

Design and implement a complete token system including:
- Token definition format
- Multi-tier token hierarchy
- Build pipeline that generates CSS, SCSS, TypeScript, iOS, and Android outputs
- Token documentation generation

## Examples

**Input:** Define color tokens in the standard format
**Output:** A structured JSON token file with global, semantic, and component layers
*Tokens are defined once and transformed into platform-specific outputs.*


## Solution

```js
// ================================================
// 1. Token Definition Format (tokens/color.tokens.json)
// ================================================

const colorTokens = {
  // W3C Design Token Community Group format
  color: {
    // --- Global / Primitive layer ---
    primitive: {
      blue: {
        50:  { $value: '#eff6ff', $type: 'color' },
        100: { $value: '#dbeafe', $type: 'color' },
        200: { $value: '#bfdbfe', $type: 'color' },
        300: { $value: '#93c5fd', $type: 'color' },
        400: { $value: '#60a5fa', $type: 'color' },
        500: { $value: '#3b82f6', $type: 'color' },
        600: { $value: '#2563eb', $type: 'color' },
        700: { $value: '#1d4ed8', $type: 'color' },
        800: { $value: '#1e40af', $type: 'color' },
        900: { $value: '#1e3a8a', $type: 'color' },
      },
      gray: {
        50:  { $value: '#f9fafb', $type: 'color' },
        100: { $value: '#f3f4f6', $type: 'color' },
        200: { $value: '#e5e7eb', $type: 'color' },
        500: { $value: '#6b7280', $type: 'color' },
        700: { $value: '#374151', $type: 'color' },
        900: { $value: '#111827', $type: 'color' },
      },
      red:   { 500: { $value: '#ef4444', $type: 'color' }, 600: { $value: '#dc2626', $type: 'color' } },
      green: { 500: { $value: '#22c55e', $type: 'color' }, 600: { $value: '#16a34a', $type: 'color' } },
      white: { $value: '#ffffff', $type: 'color' },
      black: { $value: '#000000', $type: 'color' },
    },

    // --- Semantic layer (references primitives) ---
    semantic: {
      bg: {
        primary:   { $value: '{color.primitive.white}', $type: 'color' },
        secondary: { $value: '{color.primitive.gray.50}', $type: 'color' },
        inverse:   { $value: '{color.primitive.gray.900}', $type: 'color' },
      },
      text: {
        primary:   { $value: '{color.primitive.gray.900}', $type: 'color' },
        secondary: { $value: '{color.primitive.gray.700}', $type: 'color' },
        muted:     { $value: '{color.primitive.gray.500}', $type: 'color' },
        inverse:   { $value: '{color.primitive.white}', $type: 'color' },
        link:      { $value: '{color.primitive.blue.600}', $type: 'color' },
        danger:    { $value: '{color.primitive.red.600}', $type: 'color' },
        success:   { $value: '{color.primitive.green.600}', $type: 'color' },
      },
      border: {
        default: { $value: '{color.primitive.gray.200}', $type: 'color' },
        focus:   { $value: '{color.primitive.blue.500}', $type: 'color' },
      },
      interactive: {
        primary:      { $value: '{color.primitive.blue.600}', $type: 'color' },
        primaryHover: { $value: '{color.primitive.blue.700}', $type: 'color' },
      },
    },
  },
};

// ================================================
// 2. Spacing & Typography Tokens
// ================================================

const spacingTokens = {
  spacing: {
    0:  { $value: '0px',  $type: 'dimension' },
    1:  { $value: '4px',  $type: 'dimension' },
    2:  { $value: '8px',  $type: 'dimension' },
    3:  { $value: '12px', $type: 'dimension' },
    4:  { $value: '16px', $type: 'dimension' },
    5:  { $value: '20px', $type: 'dimension' },
    6:  { $value: '24px', $type: 'dimension' },
    8:  { $value: '32px', $type: 'dimension' },
    10: { $value: '40px', $type: 'dimension' },
    12: { $value: '48px', $type: 'dimension' },
    16: { $value: '64px', $type: 'dimension' },
  },
};

const typographyTokens = {
  font: {
    family: {
      sans:  { $value: "'Inter', -apple-system, sans-serif", $type: 'fontFamily' },
      mono:  { $value: "'Fira Code', monospace",             $type: 'fontFamily' },
    },
    size: {
      xs:   { $value: '0.75rem',  $type: 'dimension' },
      sm:   { $value: '0.875rem', $type: 'dimension' },
      md:   { $value: '1rem',     $type: 'dimension' },
      lg:   { $value: '1.125rem', $type: 'dimension' },
      xl:   { $value: '1.25rem',  $type: 'dimension' },
      '2xl': { $value: '1.5rem',  $type: 'dimension' },
      '3xl': { $value: '1.875rem', $type: 'dimension' },
    },
    weight: {
      normal:   { $value: '400', $type: 'fontWeight' },
      medium:   { $value: '500', $type: 'fontWeight' },
      semibold: { $value: '600', $type: 'fontWeight' },
      bold:     { $value: '700', $type: 'fontWeight' },
    },
    lineHeight: {
      tight:  { $value: '1.25', $type: 'number' },
      normal: { $value: '1.5',  $type: 'number' },
      loose:  { $value: '1.75', $type: 'number' },
    },
  },
};

// ================================================
// 3. Token Build Pipeline (Style Dictionary config)
// ================================================

// style-dictionary.config.js
const styleDictionaryConfig = {
  source: ['tokens/**/*.tokens.json'],
  platforms: {
    // --- CSS Output ---
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: { outputReferences: true },
        },
      ],
    },

    // --- SCSS Output ---
    scss: {
      transformGroup: 'scss',
      buildPath: 'dist/scss/',
      files: [
        {
          destination: '_tokens.scss',
          format: 'scss/variables',
          options: { outputReferences: true },
        },
      ],
    },

    // --- TypeScript Output ---
    ts: {
      transformGroup: 'js',
      buildPath: 'dist/ts/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'javascript/es6',
        },
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations',
        },
      ],
    },

    // --- iOS (Swift) Output ---
    ios: {
      transformGroup: 'ios-swift',
      buildPath: 'dist/ios/',
      files: [
        {
          destination: 'DesignTokens.swift',
          format: 'ios-swift/class.swift',
          className: 'DesignTokens',
        },
      ],
    },

    // --- Android (XML) Output ---
    android: {
      transformGroup: 'android',
      buildPath: 'dist/android/',
      files: [
        {
          destination: 'tokens.xml',
          format: 'android/resources',
        },
      ],
    },
  },
};

// ================================================
// 4. Generated Output Examples
// ================================================

// --- CSS Output (dist/css/tokens.css) ---
const cssOutput = `
:root {
  /* Primitive */
  --color-primitive-blue-500: #3b82f6;
  --color-primitive-blue-600: #2563eb;
  --color-primitive-blue-700: #1d4ed8;
  --color-primitive-gray-50: #f9fafb;
  --color-primitive-gray-900: #111827;
  --color-primitive-white: #ffffff;

  /* Semantic (references primitives) */
  --color-semantic-bg-primary: var(--color-primitive-white);
  --color-semantic-bg-secondary: var(--color-primitive-gray-50);
  --color-semantic-text-primary: var(--color-primitive-gray-900);
  --color-semantic-interactive-primary: var(--color-primitive-blue-600);

  /* Spacing */
  --spacing-0: 0px;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-4: 16px;

  /* Typography */
  --font-family-sans: 'Inter', -apple-system, sans-serif;
  --font-size-md: 1rem;
  --font-weight-bold: 700;
}
`;

// --- TypeScript Output (dist/ts/tokens.ts) ---
const tsOutput = `
export const ColorPrimitiveBlue500 = '#3b82f6';
export const ColorSemanticBgPrimary = '#ffffff';
export const ColorSemanticTextPrimary = '#111827';
export const Spacing4 = '16px';
export const FontFamilySans = "'Inter', -apple-system, sans-serif";
`;

// --- Swift Output (dist/ios/DesignTokens.swift) ---
const swiftOutput = `
public class DesignTokens {
  public static let colorPrimitiveBlue500 = UIColor(hex: "#3b82f6")
  public static let colorSemanticBgPrimary = UIColor(hex: "#ffffff")
  public static let spacing4: CGFloat = 16.0
  public static let fontFamilySans = "Inter"
}
`;

// ================================================
// 5. TypeScript Token Utility for Runtime Usage
// ================================================

type TokenPath = string; // e.g., 'color.semantic.bg.primary'

interface TokenMap {
  [key: string]: string | TokenMap;
}

function resolveToken(tokens: TokenMap, path: string): string {
  const parts = path.split('.');
  let current: unknown = tokens;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as object)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      throw new Error(`Token not found: ${path}`);
    }
  }

  const value = current;
  if (typeof value === 'object' && value !== null && '$value' in value) {
    const raw = (value as { $value: string }).$value;
    // Resolve references like {color.primitive.blue.500}
    if (raw.startsWith('{') && raw.endsWith('}')) {
      return resolveToken(tokens, raw.slice(1, -1));
    }
    return raw;
  }

  throw new Error(`Invalid token at path: ${path}`);
}

// CSS variable accessor — use in components
function token(path: string): string {
  return `var(--${path.replace(/\./g, '-')})`;
}

// Usage:
// background: token('color.semantic.bg.primary')
// => "var(--color-semantic-bg-primary)"

export {
  colorTokens,
  spacingTokens,
  typographyTokens,
  styleDictionaryConfig,
  resolveToken,
  token,
};
```
