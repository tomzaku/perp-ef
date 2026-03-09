---
id: js-9
title: Generator Functions and Iterators
category: JavaScript
subcategory: Core Concepts
difficulty: Medium
pattern: Generators
companies: [Google, Microsoft]
timeComplexity: N/A
spaceComplexity: O(1) per yielded value (lazy evaluation)
keyTakeaway: "Generators are functions that can be paused and resumed, producing a sequence of values lazily. They implement the iterator protocol and are ideal for infinite sequences, tree traversal, and custom iterables. yield* delegates to another generator. The pattern was the foundation for async/await."
similarProblems: [js-14, js-8, js-11]
---

Explain JavaScript generators and the iterator protocol:

1. Generator function syntax and execution model
2. yield, yield*, next(), return(), throw()
3. The iterator protocol (Symbol.iterator)
4. Practical use cases: lazy sequences, async flow control, data streaming
5. Making custom objects iterable

## Examples

**Input:** function* count() { yield 1; yield 2; yield 3; } const gen = count(); gen.next();
**Output:** { value: 1, done: false }
*Generators pause at each yield and resume when next() is called.*


## Solution

```js
// ============================================
// 1. Generator Basics
// ============================================
function* simpleGenerator() {
  console.log('Start');
  yield 1;
  console.log('After first yield');
  yield 2;
  console.log('After second yield');
  yield 3;
  console.log('End');
}

const gen = simpleGenerator();
console.log(gen.next()); // "Start" => { value: 1, done: false }
console.log(gen.next()); // "After first yield" => { value: 2, done: false }
console.log(gen.next()); // "After second yield" => { value: 3, done: false }
console.log(gen.next()); // "End" => { value: undefined, done: true }

// ============================================
// 2. Two-way Communication with yield
// ============================================
function* conversation() {
  const name = yield 'What is your name?';
  const age = yield `Hello ${name}! How old are you?`;
  return `${name} is ${age} years old`;
}

const chat = conversation();
console.log(chat.next());           // { value: "What is your name?", done: false }
console.log(chat.next('Alice'));     // { value: "Hello Alice! How old are you?", done: false }
console.log(chat.next(30));          // { value: "Alice is 30 years old", done: true }

// ============================================
// 3. yield* (Delegation)
// ============================================
function* innerGen() {
  yield 'a';
  yield 'b';
}

function* outerGen() {
  yield 1;
  yield* innerGen(); // delegates to innerGen
  yield 2;
}

console.log([...outerGen()]); // [1, "a", "b", 2]

// Recursive tree traversal with yield*
function* traverseTree(node) {
  yield node.value;
  if (node.children) {
    for (const child of node.children) {
      yield* traverseTree(child);
    }
  }
}

const tree = {
  value: 1,
  children: [
    { value: 2, children: [{ value: 4 }, { value: 5 }] },
    { value: 3, children: [{ value: 6 }] }
  ]
};

console.log([...traverseTree(tree)]); // [1, 2, 4, 5, 3, 6]

// ============================================
// 4. Infinite Sequences (Lazy Evaluation)
// ============================================
function* fibonacci() {
  let a = 0;
  let b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Take first 10 fibonacci numbers
function take(n, iterable) {
  const results = [];
  for (const value of iterable) {
    results.push(value);
    if (results.length >= n) break;
  }
  return results;
}

console.log(take(10, fibonacci()));
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// Infinite range
function* range(start = 0, end = Infinity, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

console.log(take(5, range(0, Infinity, 2))); // [0, 2, 4, 6, 8]

// ============================================
// 5. Custom Iterable with Symbol.iterator
// ============================================
class LinkedList {
  constructor() {
    this.head = null;
  }

  add(value) {
    this.head = { value, next: this.head };
    return this;
  }

  // Make LinkedList iterable with for...of
  *[Symbol.iterator]() {
    let current = this.head;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }
}

const list = new LinkedList();
list.add(3).add(2).add(1);

for (const value of list) {
  console.log(value); // 1, 2, 3
}

console.log([...list]); // [1, 2, 3]

// Iterable Range class
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;

    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { done: true };
      }
    };
  }
}

const r = new Range(1, 5);
console.log([...r]); // [1, 2, 3, 4, 5]

// ============================================
// 6. Generator for Async Flow Control
// ============================================
// This pattern was the precursor to async/await

function runAsync(generatorFn) {
  const gen = generatorFn();

  function handle(result) {
    if (result.done) return Promise.resolve(result.value);

    return Promise.resolve(result.value)
      .then((value) => handle(gen.next(value)))
      .catch((err) => handle(gen.throw(err)));
  }

  return handle(gen.next());
}

// Usage (equivalent to async/await):
function* fetchUserData() {
  try {
    const response = yield fetch('/api/user');
    const data = yield response.json();
    return data;
  } catch (error) {
    console.error('Failed:', error);
  }
}

// runAsync(fetchUserData).then(console.log);

// ============================================
// 7. return() and throw() Methods
// ============================================
function* controlled() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } finally {
    console.log('Cleanup!');
  }
}

const ctrl = controlled();
console.log(ctrl.next());    // { value: 1, done: false }
console.log(ctrl.return(99)); // "Cleanup!" => { value: 99, done: true }
// return() triggers the finally block

const ctrl2 = controlled();
ctrl2.next();
// ctrl2.throw(new Error('Abort'));
// Throws inside the generator, caught by try/catch if present
```
