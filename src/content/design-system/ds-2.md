---
id: ds-2
title: Compound Components Pattern
category: Design System
subcategory: Patterns
difficulty: Medium
pattern: Compound Components
companies: [Meta, Airbnb, Shopify]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Compound Components use React Context to share implicit state between a parent and its sub-components, giving consumers full control over rendering while keeping the logic centralized. Always throw a helpful error when sub-components are used outside their required parent."
similarProblems: [ds-1, ds-3, ds-5]
---

The Compound Components pattern allows a set of components to work together to form a complete UI element while giving the consumer full control over rendering. Think of it like HTML's <select> and <option> — they are separate elements but only meaningful together.

This pattern solves the "prop drilling" and "configuration object" problems. Instead of passing a massive config object to a single component, you compose child components that implicitly share state through React Context.

Key characteristics:
- Parent component manages shared state
- Child components access shared state via Context
- Consumer controls layout and ordering of children
- Each sub-component has a focused, clear API

Implement a Select component with Option sub-components using the Compound Components pattern. The Select should manage open/close state, selection state, and keyboard navigation, while Option components register themselves and respond to selection.

Consider:
- How state is shared between Select and Option
- How to handle keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
- How to support controlled and uncontrolled modes
- How to maintain proper ARIA attributes

## Examples

**Input:** <Select value={selected} onChange={setSelected}><Select.Option value="apple">Apple</Select.Option><Select.Option value="banana">Banana</Select.Option></Select>
**Output:** A fully functional select dropdown with keyboard navigation and ARIA support
*The Select manages open/close and selection state; Options consume that state via Context.*


## Solution

```js
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';

// ------------------------------------------------
// 1. Define the shared context
// ------------------------------------------------
interface SelectContextType {
  isOpen: boolean;
  selectedValue: string | undefined;
  highlightedIndex: number;
  options: string[];
  onSelect: (value: string) => void;
  onOpen: () => void;
  onClose: () => void;
  registerOption: (value: string) => void;
  unregisterOption: (value: string) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error(
      'Select compound components must be used within a <Select> parent'
    );
  }
  return context;
}

// ------------------------------------------------
// 2. Select (Parent) component
// ------------------------------------------------
interface SelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
}

function Select({
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'Select an option...',
  children,
}: SelectProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = isControlled ? controlledValue : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [options, setOptions] = useState<string[]>([]);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const registerOption = useCallback((value: string) => {
    setOptions((prev) => (prev.includes(value) ? prev : [...prev, value]));
  }, []);

  const unregisterOption = useCallback((value: string) => {
    setOptions((prev) => prev.filter((v) => v !== value));
  }, []);

  const onSelect = useCallback(
    (value: string) => {
      if (!isControlled) {
        setInternalValue(value);
      }
      onChange?.(value);
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    [isControlled, onChange]
  );

  const onOpen = useCallback(() => {
    setIsOpen(true);
    const idx = selectedValue ? options.indexOf(selectedValue) : 0;
    setHighlightedIndex(idx >= 0 ? idx : 0);
  }, [selectedValue, options]);

  const onClose = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            onOpen();
          } else {
            setHighlightedIndex((prev) =>
              Math.min(prev + 1, options.length - 1)
            );
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            onSelect(options[highlightedIndex]);
          } else {
            onOpen();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          triggerRef.current?.focus();
          break;
      }
    },
    [isOpen, highlightedIndex, options, onOpen, onClose, onSelect]
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  const contextValue = useMemo(
    () => ({
      isOpen,
      selectedValue,
      highlightedIndex,
      options,
      onSelect,
      onOpen,
      onClose,
      registerOption,
      unregisterOption,
    }),
    [
      isOpen,
      selectedValue,
      highlightedIndex,
      options,
      onSelect,
      onOpen,
      onClose,
      registerOption,
      unregisterOption,
    ]
  );

  const selectedLabel = selectedValue ?? placeholder;

  return (
    <SelectContext.Provider value={contextValue}>
      <div
        className="select-container"
        onKeyDown={handleKeyDown}
        style={{ position: 'relative', display: 'inline-block' }}
      >
        {/* Trigger button */}
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          onClick={() => (isOpen ? onClose() : onOpen())}
          className="select-trigger"
        >
          {selectedLabel}
          <span aria-hidden="true"> ▾</span>
        </button>

        {/* Dropdown list */}
        {isOpen && (
          <ul
            ref={listRef}
            role="listbox"
            className="select-listbox"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              margin: 0,
              padding: 0,
              listStyle: 'none',
              border: '1px solid #ccc',
              borderRadius: 4,
              background: '#fff',
              minWidth: '100%',
              zIndex: 10,
            }}
          >
            {children}
          </ul>
        )}
      </div>
    </SelectContext.Provider>
  );
}

// ------------------------------------------------
// 3. Option (Child) compound component
// ------------------------------------------------
interface OptionProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function Option({ value, disabled = false, children }: OptionProps) {
  const {
    selectedValue,
    highlightedIndex,
    options,
    onSelect,
    registerOption,
    unregisterOption,
  } = useSelectContext();

  useEffect(() => {
    registerOption(value);
    return () => unregisterOption(value);
  }, [value, registerOption, unregisterOption]);

  const index = options.indexOf(value);
  const isSelected = selectedValue === value;
  const isHighlighted = highlightedIndex === index;

  return (
    <li
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      data-highlighted={isHighlighted}
      onClick={() => {
        if (!disabled) onSelect(value);
      }}
      style={{
        padding: '8px 12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: isHighlighted ? '#f0f0f0' : 'transparent',
        fontWeight: isSelected ? 'bold' : 'normal',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
      {isSelected && <span aria-hidden="true"> ✓</span>}
    </li>
  );
}

// ------------------------------------------------
// 4. Attach sub-components to parent
// ------------------------------------------------
Select.Option = Option;

export { Select };

// ------------------------------------------------
// Usage example
// ------------------------------------------------
// function App() {
//   const [fruit, setFruit] = useState<string>();
//
//   return (
//     <Select value={fruit} onChange={setFruit} placeholder="Pick a fruit">
//       <Select.Option value="apple">Apple</Select.Option>
//       <Select.Option value="banana">Banana</Select.Option>
//       <Select.Option value="cherry">Cherry</Select.Option>
//       <Select.Option value="grape" disabled>Grape (sold out)</Select.Option>
//     </Select>
//   );
// }
```

## Explanation

CONCEPT: Compound Components — Shared Implicit State

```
TRADITIONAL API (rigid):
<Select value={val} onChange={fn} options={[
  { value: '1', label: 'One' },
  { value: '2', label: 'Two', disabled: true },
]} />

COMPOUND COMPONENT API (flexible):
<Select value={val} onChange={fn}>
  <Select.Trigger>Choose...</Select.Trigger>
  <Select.Options>
    <Select.Option value="1">One</Select.Option>
    <Select.Option value="2" disabled>Two</Select.Option>
    <Select.Divider />
    <Select.Option value="3">
      <CustomIcon /> Three  ← full rendering control!
    </Select.Option>
  </Select.Options>
</Select>

CONTEXT SHARING DIAGRAM:

┌── Select (Provider) ────────────────────┐
│  state: { value, isOpen, onChange }      │
│  ┌────────────────────────────────────┐  │
│  │ Select.Trigger                     │  │
│  │  useContext → reads isOpen         │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ Select.Options                     │  │
│  │  useContext → reads isOpen         │  │
│  │  ┌────────────────────────────┐    │  │
│  │  │ Select.Option              │    │  │
│  │  │  useContext → reads value  │    │  │
│  │  │  calls onChange on click   │    │  │
│  │  └────────────────────────────┘    │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

ADVANTAGE: Users compose sub-components freely while state management is handled internally via context.
