---
id: react-1
title: Virtual DOM and Reconciliation
category: React
subcategory: Core Concepts
difficulty: Medium
pattern: Virtual DOM
companies: [Meta, Google, Amazon]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "The Virtual DOM is a programming concept where a lightweight JS representation of the DOM is kept in memory. React's reconciliation algorithm diffs old and new VDOM trees and applies the minimum number of mutations to the real DOM, making updates efficient."
similarProblems: [React Fiber Architecture, Key Prop and List Rendering, React.memo and Memoization]
---

**What is the Virtual DOM and how does React's reconciliation algorithm work?**

The Virtual DOM (VDOM) is a lightweight, in-memory representation of the actual DOM. React uses the VDOM as an abstraction layer between the developer's code and the real DOM to optimize rendering performance.

**How it works:**

1. **Initial Render:** React creates a Virtual DOM tree that mirrors the real DOM structure. Each element in JSX corresponds to a plain JavaScript object (React Element) in the VDOM tree.

2. **State/Props Change:** When state or props change, React creates a *new* Virtual DOM tree representing the updated UI.

3. **Diffing (Reconciliation):** React compares the new VDOM tree with the previous one using its reconciliation algorithm. This is often called the "diffing" algorithm. It operates under two key heuristics:
   - Two elements of different types will produce different trees (type check).
   - The developer can hint at which child elements are stable across renders using the `key` prop.

4. **Batched Updates:** React calculates the minimal set of changes (patches) needed and applies them to the real DOM in a single batch, minimizing expensive DOM operations.

**Reconciliation rules:**
- If the root elements have different types, React tears down the old tree and builds a new one from scratch.
- If the root elements have the same type, React keeps the same DOM node and only updates the changed attributes.
- For child lists, React uses `key` props to match children between the old and new trees, enabling efficient reordering without unnecessary unmount/remount cycles.

**Why not just update the real DOM directly?**
Direct DOM manipulation is slow because each change can trigger layout recalculations, repaints, and reflows. By batching changes through the VDOM, React minimizes these expensive browser operations.

## Examples

**Input:** Component re-renders with updated state
**Output:** React diffs old and new VDOM, patches only changed DOM nodes
*Only the text node inside the <span> is updated, not the entire subtree.*


## Solution

```js
// Demonstrating how Virtual DOM diffing works conceptually

// React Element (what JSX compiles to) — a plain JS object
const element = {
  type: 'div',
  props: {
    className: 'container',
    children: [
      {
        type: 'h1',
        props: { children: 'Hello' }
      },
      {
        type: 'p',
        props: { children: 'World' }
      }
    ]
  }
};

// Simplified reconciliation logic
function reconcile(
  parentDom: HTMLElement,
  oldVNode: any,
  newVNode: any
) {
  // Case 1: New node added
  if (!oldVNode) {
    parentDom.appendChild(createDom(newVNode));
    return;
  }

  // Case 2: Node removed
  if (!newVNode) {
    parentDom.removeChild(parentDom.firstChild!);
    return;
  }

  // Case 3: Node type changed — replace entire subtree
  if (oldVNode.type !== newVNode.type) {
    parentDom.replaceChild(
      createDom(newVNode),
      parentDom.firstChild!
    );
    return;
  }

  // Case 4: Same type — update props and recurse on children
  const dom = parentDom.firstChild as HTMLElement;
  updateProps(dom, oldVNode.props, newVNode.props);

  // Recurse on children
  const oldChildren = oldVNode.props.children || [];
  const newChildren = newVNode.props.children || [];
  const maxLen = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLen; i++) {
    reconcile(dom, oldChildren[i], newChildren[i]);
  }
}

function createDom(vnode: any): HTMLElement | Text {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode));
  }
  const dom = document.createElement(vnode.type);
  updateProps(dom, {}, vnode.props);
  (vnode.props.children || []).forEach((child: any) => {
    dom.appendChild(createDom(child));
  });
  return dom;
}

function updateProps(
  dom: HTMLElement,
  oldProps: any,
  newProps: any
) {
  // Remove old props
  Object.keys(oldProps)
    .filter((k) => k !== 'children')
    .forEach((key) => {
      if (!(key in newProps)) {
        dom.removeAttribute(key);
      }
    });

  // Set new props
  Object.keys(newProps)
    .filter((k) => k !== 'children')
    .forEach((key) => {
      if (oldProps[key] !== newProps[key]) {
        dom.setAttribute(key, newProps[key]);
      }
    });
}

// ---- Real React example showing reconciliation in action ----
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  // On each render React builds a new VDOM tree.
  // Only the text inside <span> changes, so React patches
  // just that text node in the real DOM.
  return (
    <div>
      <h1>Counter App</h1>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

## Explanation

CONCEPT: Virtual DOM & Reconciliation (Diffing)

```
REAL DOM vs VIRTUAL DOM:

Real DOM (expensive):        Virtual DOM (cheap JS objects):
┌─────────────┐              { type: 'div', props: {
│  <div>      │                children: [
│    <h1>     │                  { type: 'h1', props: { children: 'Hello' } },
│      Hello  │                  { type: 'p', props: { children: 'World' } }
│    </h1>    │                ]
│    <p>      │              }}
│      World  │
│    </p>     │
│  </div>     │
└─────────────┘

RECONCILIATION PROCESS:
                    Old VDOM          New VDOM
                    ┌──div──┐         ┌──div──┐
                   /         \       /         \
                 h1           p    h1           p
                 │            │    │            │
              "Hello"      "World" "Hi"      "World"
                 ↑                  ↑
                 └── CHANGED! ──────┘

Diff result: Only update h1's text content "Hello" → "Hi"
Real DOM operation: h1Node.textContent = "Hi"  (minimal update!)
```

KEY RULES OF RECONCILIATION:
1. Different element types → tear down old tree, build new
2. Same element type → update props, recurse on children
3. Keys help React identify which items moved/added/removed in lists
