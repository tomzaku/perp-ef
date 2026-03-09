---
id: js-6
title: Deep Clone Implementation
category: JavaScript
subcategory: Patterns
difficulty: Medium
pattern: Deep Copy
companies: [Google, Amazon, Microsoft]
timeComplexity: O(n) where n is the total number of properties in the object tree
spaceComplexity: O(n) for the cloned structure plus O(d) for recursion stack depth
keyTakeaway: "Deep cloning must handle circular references (use a WeakMap), special types (Date, RegExp, Map, Set), and preserve the prototype chain. JSON.parse/stringify is quick but lossy. structuredClone is good for most cases but cannot clone functions or preserve property descriptors."
similarProblems: [js-10, js-11, js-7]
---

Implement a deep clone function that properly handles:

1. Plain objects and arrays
2. Nested structures
3. Date, RegExp, Map, Set instances
4. Circular references
5. Symbols as keys
6. Non-enumerable properties (bonus)

Compare with JSON.parse(JSON.stringify()), structuredClone(), and explain their limitations.

## Examples

**Input:** deepClone({ a: 1, b: { c: [2, 3] }, d: new Date() })
**Output:** { a: 1, b: { c: [2, 3] }, d: Date }
*All nested objects are new references. Modifying the clone does not affect the original.*


## Solution

```js
// ============================================
// 1. Full Deep Clone Implementation
// ============================================
function deepClone(source, seen = new WeakMap()) {
  // Handle primitives and null
  if (source === null || typeof source !== 'object') {
    return source;
  }

  // Handle circular references
  if (seen.has(source)) {
    return seen.get(source);
  }

  // Handle Date
  if (source instanceof Date) {
    return new Date(source.getTime());
  }

  // Handle RegExp
  if (source instanceof RegExp) {
    const cloned = new RegExp(source.source, source.flags);
    cloned.lastIndex = source.lastIndex;
    return cloned;
  }

  // Handle Map
  if (source instanceof Map) {
    const cloned = new Map();
    seen.set(source, cloned);
    source.forEach((value, key) => {
      cloned.set(deepClone(key, seen), deepClone(value, seen));
    });
    return cloned;
  }

  // Handle Set
  if (source instanceof Set) {
    const cloned = new Set();
    seen.set(source, cloned);
    source.forEach((value) => {
      cloned.add(deepClone(value, seen));
    });
    return cloned;
  }

  // Handle Array
  if (Array.isArray(source)) {
    const cloned = [];
    seen.set(source, cloned);
    for (let i = 0; i < source.length; i++) {
      cloned[i] = deepClone(source[i], seen);
    }
    return cloned;
  }

  // Handle plain objects
  // Preserve the prototype chain
  const cloned = Object.create(Object.getPrototypeOf(source));
  seen.set(source, cloned);

  // Get all own properties including symbols
  const keys = [
    ...Object.getOwnPropertyNames(source),
    ...Object.getOwnPropertySymbols(source)
  ];

  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (descriptor.value !== undefined) {
      descriptor.value = deepClone(descriptor.value, seen);
    }
    Object.defineProperty(cloned, key, descriptor);
  }

  return cloned;
}

// ============================================
// 2. Test Cases
// ============================================

// Basic nested objects
const original = {
  name: 'test',
  nested: { a: 1, b: [2, 3, { c: 4 }] },
  date: new Date('2024-01-01'),
  regex: /hello/gi,
  map: new Map([['key1', { value: 1 }]]),
  set: new Set([1, 2, { nested: true }])
};

const cloned = deepClone(original);

// Verify deep independence
cloned.nested.b[2].c = 999;
console.log(original.nested.b[2].c); // 4 (unchanged)
console.log(cloned.nested.b[2].c);   // 999

// Verify Date is a new instance
cloned.date.setFullYear(2000);
console.log(original.date.getFullYear()); // 2024 (unchanged)

// Verify circular references
const circular = { name: 'root' };
circular.self = circular;
circular.nested = { parent: circular };

const circularClone = deepClone(circular);
console.log(circularClone.self === circularClone);           // true
console.log(circularClone.nested.parent === circularClone);  // true
console.log(circularClone !== circular);                     // true

// Verify symbol keys
const sym = Symbol('private');
const withSymbol = { [sym]: 'secret', public: 'visible' };
const symbolClone = deepClone(withSymbol);
console.log(symbolClone[sym]); // "secret"

// ============================================
// 3. Comparison with Built-in Methods
// ============================================

// JSON.parse(JSON.stringify(obj))
// Pros: Simple, widely available
// Cons:
//   - Loses Date (becomes string), RegExp (becomes {}), Map, Set
//   - Loses undefined, functions, Symbols
//   - Fails on circular references (throws)
//   - Loses prototype chain
//   - Ignores non-enumerable properties

// structuredClone(obj) (modern browsers + Node 17+)
// Pros: Handles Date, RegExp, Map, Set, ArrayBuffer, circular refs
// Cons:
//   - Cannot clone functions
//   - Cannot clone DOM elements
//   - Loses prototype chain
//   - Loses Symbol keys
//   - Loses non-enumerable properties and property descriptors

// ============================================
// 4. Simple Version (Interview Quick Answer)
// ============================================
function deepCloneSimple(obj, seen = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (seen.has(obj)) return seen.get(obj);

  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);

  const clone = Array.isArray(obj) ? [] : {};
  seen.set(obj, clone);

  for (const key of Object.keys(obj)) {
    clone[key] = deepCloneSimple(obj[key], seen);
  }

  return clone;
}
```
