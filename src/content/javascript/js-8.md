---
id: js-8
title: Promise.all / Promise.race / Promise.allSettled
category: JavaScript
subcategory: Async
difficulty: Hard
pattern: Promise Combinators
companies: [Meta, Google, Amazon]
timeComplexity: O(n) where n is the number of promises
spaceComplexity: O(n) for storing results
keyTakeaway: "Promise.all short-circuits on first rejection, Promise.race settles with the first result, Promise.allSettled waits for all to settle regardless of outcome, and Promise.any resolves with the first fulfillment. Always wrap values with Promise.resolve() to handle non-promise inputs."
similarProblems: [js-14, js-9, js-5]
---

Implement the following Promise combinators from scratch:

1. **Promise.all** — Resolves when ALL promises resolve; rejects on the FIRST rejection
2. **Promise.race** — Resolves/rejects with the FIRST settled promise
3. **Promise.allSettled** — Resolves when ALL promises settle (no rejection)
4. **Promise.any** — Resolves with the FIRST fulfilled promise; rejects only if ALL reject

Each implementation must handle edge cases: empty arrays, non-promise values, and proper error propagation.

## Examples

**Input:** promiseAll([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])
**Output:** [1, 2, 3]
*All promises fulfilled, results returned in order.*

**Input:** promiseAll([Promise.resolve(1), Promise.reject("error"), Promise.resolve(3)])
**Output:** Rejected: "error"
*Rejects immediately with the first rejection reason.*


## Solution

```js
// ============================================
// 1. Promise.all Implementation
// ============================================
function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const promises = Array.from(iterable);

    // Edge case: empty array resolves immediately
    if (promises.length === 0) {
      resolve([]);
      return;
    }

    const results = new Array(promises.length);
    let resolvedCount = 0;

    promises.forEach((promise, index) => {
      // Wrap in Promise.resolve to handle non-promise values
      Promise.resolve(promise).then(
        (value) => {
          results[index] = value; // maintain order
          resolvedCount++;
          if (resolvedCount === promises.length) {
            resolve(results);
          }
        },
        (reason) => {
          reject(reason); // reject on first failure
        }
      );
    });
  });
}

// Tests:
promiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(console.log); // [1, 2, 3]

promiseAll([
  Promise.resolve(1),
  new Promise((res) => setTimeout(() => res(2), 100)),
  42 // non-promise value
]).then(console.log); // [1, 2, 42]

promiseAll([]).then(console.log); // []

promiseAll([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).catch(console.error); // "error"

// ============================================
// 2. Promise.race Implementation
// ============================================
function promiseRace(iterable) {
  return new Promise((resolve, reject) => {
    const promises = Array.from(iterable);

    // Edge case: empty array stays forever pending (per spec)
    // So we just iterate — if no promises, nothing happens.

    promises.forEach((promise) => {
      Promise.resolve(promise).then(resolve, reject);
    });
  });
}

// Tests:
promiseRace([
  new Promise((res) => setTimeout(() => res('slow'), 200)),
  new Promise((res) => setTimeout(() => res('fast'), 50)),
  new Promise((res) => setTimeout(() => res('medium'), 100))
]).then(console.log); // "fast"

promiseRace([
  new Promise((_, rej) => setTimeout(() => rej('err'), 50)),
  new Promise((res) => setTimeout(() => res('ok'), 100))
]).catch(console.error); // "err" (rejection wins the race)

// ============================================
// 3. Promise.allSettled Implementation
// ============================================
function promiseAllSettled(iterable) {
  return new Promise((resolve) => {
    const promises = Array.from(iterable);

    if (promises.length === 0) {
      resolve([]);
      return;
    }

    const results = new Array(promises.length);
    let settledCount = 0;

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        (value) => {
          results[index] = { status: 'fulfilled', value };
          settledCount++;
          if (settledCount === promises.length) {
            resolve(results);
          }
        },
        (reason) => {
          results[index] = { status: 'rejected', reason };
          settledCount++;
          if (settledCount === promises.length) {
            resolve(results);
          }
        }
      );
    });
  });
}

// Tests:
promiseAllSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).then(console.log);
// [
//   { status: 'fulfilled', value: 1 },
//   { status: 'rejected', reason: 'error' },
//   { status: 'fulfilled', value: 3 }
// ]

// ============================================
// 4. Promise.any Implementation
// ============================================
function promiseAny(iterable) {
  return new Promise((resolve, reject) => {
    const promises = Array.from(iterable);

    if (promises.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }

    const errors = new Array(promises.length);
    let rejectedCount = 0;

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        (value) => {
          resolve(value); // resolve on first fulfillment
        },
        (reason) => {
          errors[index] = reason;
          rejectedCount++;
          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        }
      );
    });
  });
}

// Tests:
promiseAny([
  Promise.reject('err1'),
  Promise.resolve('success'),
  Promise.reject('err2')
]).then(console.log); // "success"

promiseAny([
  Promise.reject('err1'),
  Promise.reject('err2')
]).catch((e) => {
  console.log(e.message); // "All promises were rejected"
  console.log(e.errors);  // ["err1", "err2"]
});

// ============================================
// 5. Practical: Promise Pool (Concurrency Limit)
// ============================================
async function promisePool(tasks, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const currentIndex = index++;
      results[currentIndex] = await tasks[currentIndex]();
    }
  }

  // Create 'concurrency' number of workers
  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => worker()
  );

  await Promise.all(workers);
  return results;
}

// Usage:
const tasks = Array.from({ length: 10 }, (_, i) => () =>
  new Promise((res) => setTimeout(() => res(`Task ${i}`), Math.random() * 1000))
);

// Run max 3 at a time
// promisePool(tasks, 3).then(console.log);
```

## Explanation

CONCEPT: Promise Combinators — all / race / allSettled

```
Promise.all — ALL must fulfill, or first rejection wins
──────────────────────────────────────────────────────
P1: ───────✓(10)
P2: ────✓(20)
P3: ──────────✓(30)
Result:       └──✓([10,20,30])   All fulfilled!

P1: ───────✓(10)
P2: ────✗(err)
P3: ──────────✓(30)
Result:  └──✗(err)               First rejection!

Promise.race — First to settle wins
────────────────────────────────────
P1: ───────✓(10)
P2: ──✓(20)
P3: ──────────✓(30)
Result: └──✓(20)                 P2 was fastest!

Promise.allSettled — Wait for ALL, report each status
──────────────────────────────────────────────────────
P1: ───────✓(10)
P2: ────✗(err)
P3: ──────────✓(30)
Result:       └──✓([
  {status:'fulfilled', value:10},
  {status:'rejected', reason:err},
  {status:'fulfilled', value:30}
])
```

IMPLEMENTATION KEY INSIGHT:
- all: count fulfilled, reject on first rejection
- race: resolve/reject with first settled promise
- allSettled: always resolve, collect all outcomes
