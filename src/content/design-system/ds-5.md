---
id: ds-5
title: Accessibility in Design Systems
category: Design System
subcategory: Accessibility
difficulty: Hard
pattern: A11y
companies: [Meta, Google, Microsoft, Apple]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Accessibility must be built into design system components from the start. The three pillars are: correct ARIA roles/states/properties, complete keyboard navigation using roving tabindex for composite widgets, and proper focus management including trapping and restoration. Always test with actual screen readers (VoiceOver, NVDA) and keyboard-only navigation."
similarProblems: [ds-2, ds-8, ds-9]
---

Accessibility (a11y) is not an afterthought — it must be baked into every component of a design system. A design system that ships inaccessible components multiplies accessibility failures across every product that uses it.

This question covers the critical accessibility patterns every design system engineer must know:

**ARIA Roles and States**: ARIA (Accessible Rich Internet Applications) provides attributes that define the role, state, and properties of UI elements for assistive technologies. Key concepts:
- Roles define what an element IS (e.g., `role="dialog"`, `role="tabpanel"`)
- States define the current condition (e.g., `aria-expanded`, `aria-selected`)
- Properties define relationships (e.g., `aria-labelledby`, `aria-describedby`)

**Keyboard Navigation Patterns**: Every interactive component must be fully operable via keyboard:
- Tab/Shift+Tab for moving between focusable elements
- Arrow keys for navigating within composite widgets (tabs, menus, listboxes)
- Enter/Space for activation
- Escape for dismissal

**Focus Management**: Critical for dynamic UIs:
- Focus trapping in modals/dialogs
- Focus restoration when dialogs close
- Managing focus for dynamically inserted content
- Roving tabindex for composite widgets

**The "roving tabindex" pattern**: Only one item in a group has tabindex="0" (the current item); all others have tabindex="-1". Arrow keys move the tabindex="0" between items.

Implement an accessible Tabs component and an accessible Modal/Dialog component that follow WAI-ARIA best practices.

## Examples

**Input:** <Tabs><Tab label="Tab 1">Content 1</Tab><Tab label="Tab 2">Content 2</Tab></Tabs>
**Output:** Fully accessible tabbed interface with ARIA roles, keyboard navigation, and proper focus management
*Arrow keys navigate between tabs, Enter/Space activates, proper role="tablist", role="tab", role="tabpanel" structure.*


## Solution

```js
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useId,
} from 'react';

// ================================================
// PART 1: Accessible Tabs Component
// ================================================

interface TabItem {
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
  /** Manual activation requires Enter/Space; automatic activates on arrow key */
  activationMode?: 'manual' | 'automatic';
}

function Tabs({
  items,
  defaultIndex = 0,
  onChange,
  activationMode = 'automatic',
}: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [focusedIndex, setFocusedIndex] = useState(defaultIndex);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  const getTabId = (index: number) => `${id}-tab-${index}`;
  const getPanelId = (index: number) => `${id}-panel-${index}`;

  const activateTab = useCallback(
    (index: number) => {
      if (items[index]?.disabled) return;
      setActiveIndex(index);
      onChange?.(index);
    },
    [items, onChange]
  );

  const focusTab = useCallback(
    (index: number) => {
      // Skip disabled tabs
      let nextIndex = index;
      const len = items.length;
      let attempts = 0;
      while (items[nextIndex]?.disabled && attempts < len) {
        nextIndex = (nextIndex + 1) % len;
        attempts++;
      }
      setFocusedIndex(nextIndex);
      tabRefs.current[nextIndex]?.focus();
      if (activationMode === 'automatic') {
        activateTab(nextIndex);
      }
    },
    [items, activationMode, activateTab]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const len = items.length;
      let handled = true;

      switch (e.key) {
        case 'ArrowRight':
          focusTab((focusedIndex + 1) % len);
          break;
        case 'ArrowLeft':
          focusTab((focusedIndex - 1 + len) % len);
          break;
        case 'Home':
          focusTab(0);
          break;
        case 'End':
          focusTab(len - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          activateTab(focusedIndex);
          break;
        default:
          handled = false;
      }

      if (handled) e.stopPropagation();
    },
    [focusedIndex, items.length, focusTab, activateTab]
  );

  return (
    <div className="tabs">
      {/* Tab list */}
      <div role="tablist" aria-label="Tabs" onKeyDown={handleKeyDown}>
        {items.map((item, index) => (
          <button
            key={index}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            id={getTabId(index)}
            aria-selected={activeIndex === index}
            aria-controls={getPanelId(index)}
            aria-disabled={item.disabled || undefined}
            tabIndex={focusedIndex === index ? 0 : -1} // Roving tabindex
            onClick={() => {
              if (!item.disabled) {
                setFocusedIndex(index);
                activateTab(index);
              }
            }}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderBottom: activeIndex === index
                ? '2px solid #3b82f6'
                : '2px solid transparent',
              background: 'none',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              opacity: item.disabled ? 0.5 : 1,
              fontWeight: activeIndex === index ? 600 : 400,
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {items.map((item, index) => (
        <div
          key={index}
          role="tabpanel"
          id={getPanelId(index)}
          aria-labelledby={getTabId(index)}
          tabIndex={0} // Panels should be focusable
          hidden={activeIndex !== index}
          style={{ padding: '16px' }}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

// ================================================
// PART 2: Accessible Modal/Dialog Component
// ================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Element to return focus to on close */
  returnFocusRef?: React.RefObject<HTMLElement>;
}

function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  returnFocusRef,
}: ModalProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;

  // Focus trap: get all focusable elements inside the dialog
  const getFocusableElements = useCallback(() => {
    if (!dialogRef.current) return [];
    return Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), ' +
          'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }, []);

  // Focus the first focusable element when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        dialogRef.current?.focus();
      }
    }, 0);

    // Restore focus on close
    return () => {
      clearTimeout(timer);
      if (returnFocusRef?.current) {
        returnFocusRef.current.focus();
      } else {
        previouslyFocused?.focus();
      }
    };
  }, [isOpen, getFocusableElements, returnFocusRef]);

  // Focus trapping
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [getFocusableElements, onClose]
  );

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Prevent scroll on elements behind the modal
  useEffect(() => {
    if (!isOpen) return;
    document.body.setAttribute('aria-hidden', 'false');
    // Mark everything except the modal as inert
    const app = document.getElementById('root');
    if (app) app.setAttribute('aria-hidden', 'true');
    return () => {
      if (app) app.removeAttribute('aria-hidden');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999,
        }}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '24px',
          minWidth: '400px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          zIndex: 1000,
        }}
      >
        {/* Header with close button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 id={titleId} style={{ margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ×
          </button>
        </div>

        {description && (
          <p id={descId} style={{ color: '#6b7280', marginTop: '8px' }}>
            {description}
          </p>
        )}

        {/* Content */}
        <div style={{ marginTop: '16px' }}>{children}</div>
      </div>
    </>
  );
}

// ================================================
// PART 3: Accessible visually-hidden utility
// ================================================

/** Content visible to screen readers but hidden visually */
function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0,
      }}
    >
      {children}
    </span>
  );
}

// ================================================
// PART 4: Live region for dynamic announcements
// ================================================

const LiveRegionContext = createContext<{
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
} | null>(null);

function LiveRegionProvider({ children }: { children: React.ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (priority === 'assertive') {
        setAssertiveMessage('');
        setTimeout(() => setAssertiveMessage(message), 50);
      } else {
        setPoliteMessage('');
        setTimeout(() => setPoliteMessage(message), 50);
      }
    },
    []
  );

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
        }}
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
        }}
      >
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  );
}

function useLiveRegion() {
  const ctx = useContext(LiveRegionContext);
  if (!ctx) throw new Error('useLiveRegion must be used within LiveRegionProvider');
  return ctx;
}

export { Tabs, Modal, VisuallyHidden, LiveRegionProvider, useLiveRegion };
```

## Explanation

CONCEPT: Accessibility — ARIA, Keyboard, Focus Management

```
TABS COMPONENT — Keyboard Navigation:

┌──────────────────────────────────────────┐
│  [Tab 1]  [Tab 2]  [Tab 3]              │
│   ↑ focused                              │
│  ┌────────────────────────────────────┐  │
│  │ Panel 1 content                    │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘

ROVING TABINDEX PATTERN:
Tab 1: tabindex="0"  (focusable, in tab order)
Tab 2: tabindex="-1" (focusable, NOT in tab order)
Tab 3: tabindex="-1"

Keyboard:
  Tab    → enters tab list (focuses Tab 1)
  →/←    → moves between tabs (roving focus)
  Tab    → exits tab list to panel content
  Home   → first tab
  End    → last tab

ARIA ATTRIBUTES:
  role="tablist"
    ├── role="tab" aria-selected="true" aria-controls="panel-1"
    ├── role="tab" aria-selected="false"
    └── role="tab" aria-selected="false"
  role="tabpanel" id="panel-1" aria-labelledby="tab-1"
```

MODAL FOCUS TRAP:
```
Page content ──── [Open Modal button]
                       │
                       ▼
              ┌─── Modal ──────────────┐
              │  Focus trapped here!   │
              │  Tab → cycles within   │
              │  [input] → [button]    │
              │     ↑          │       │
              │     └──────────┘       │
              │  Escape → close        │
              │  Focus returns to      │
              │  trigger button        │
              └────────────────────────┘
```
