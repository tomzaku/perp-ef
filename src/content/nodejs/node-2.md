---
id: node-2
title: process.nextTick vs setImmediate vs setTimeout
category: Node.js
subcategory: Event Loop
difficulty: Medium
pattern: Async Scheduling and Event Loop Mechanics
companies: [Amazon, Google, Netflix]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "process.nextTick has the highest priority (runs before I/O and all other async callbacks). setImmediate runs in the check phase (after I/O, guaranteed before setTimeout inside I/O callbacks). setTimeout(fn, 0) runs in the timers phase with ~1ms minimum delay. Use nextTick for guaranteeing async consistency, setImmediate for yielding to I/O, and setTimeout for timed delays."
similarProblems: [Event loop phases in detail, queueMicrotask vs process.nextTick, Blocking event loop detection, Worker threads for CPU-intensive tasks]
---

Compare process.nextTick, setImmediate, and setTimeout(fn, 0) in Node.js. Explain when each executes relative to the event loop phases, their use cases, and potential pitfalls.

## Examples

**Input:** process.nextTick(() => log('nextTick')); Promise.resolve().then(() => log('promise')); setImmediate(() => log('immediate')); setTimeout(() => log('timeout'), 0);
**Output:** nextTick, promise, timeout (or immediate), immediate (or timeout)
*nextTick runs first (before microtasks), then Promise microtasks, then setTimeout and setImmediate (order depends on context).*


## Solution

```js
/**
 * process.nextTick vs setImmediate vs setTimeout
 *
 * These three schedule callbacks at different points in the event loop:
 *
 * process.nextTick(fn):
 *   - Runs IMMEDIATELY after the current operation, BEFORE any I/O or timers
 *   - Runs before Promise microtasks
 *   - Processed between every event loop phase
 *   - NOT part of the event loop phases (it's a separate queue)
 *
 * setImmediate(fn):
 *   - Runs in the CHECK phase of the event loop
 *   - Designed to run after I/O events complete
 *   - Runs after the poll phase
 *
 * setTimeout(fn, 0):
 *   - Runs in the TIMERS phase
 *   - Minimum delay is ~1ms (even when 0 is specified)
 *   - Runs when the timer expires and the timers phase is entered
 */

// ============================================================
// 1. Basic Ordering
// ============================================================
console.log('1 - sync start');

process.nextTick(() => {
  console.log('2 - process.nextTick');
});

Promise.resolve().then(() => {
  console.log('3 - Promise.then');
});

setTimeout(() => {
  console.log('4 - setTimeout');
}, 0);

setImmediate(() => {
  console.log('5 - setImmediate');
});

console.log('6 - sync end');

/**
 * Output:
 * 1 - sync start
 * 6 - sync end
 * 2 - process.nextTick     ← nextTick queue (highest priority)
 * 3 - Promise.then         ← microtask queue (after nextTick)
 * 4 - setTimeout           ← timers phase (or 5 first, non-deterministic)
 * 5 - setImmediate         ← check phase (or 4 first, non-deterministic)
 */

// ============================================================
// 2. Inside I/O Callbacks — Deterministic Order
// ============================================================
const fs = require('fs');

fs.readFile(__filename, () => {
  // Inside an I/O callback, the order IS deterministic:
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));

  // Output is ALWAYS:
  // immediate  ← check phase runs right after poll
  // timeout    ← timers phase runs in the next iteration
});

/**
 * WHY? After the poll phase (where I/O callbacks execute), the event
 * loop moves to the check phase (setImmediate) BEFORE wrapping around
 * to the timers phase (setTimeout).
 */

// ============================================================
// 3. process.nextTick — Deep Dive
// ============================================================

// nextTick runs before ANY I/O, timers, or other async operations
process.nextTick(() => {
  console.log('nextTick 1');
  // Recursive nextTick — runs before anything else
  process.nextTick(() => {
    console.log('nextTick 2 (nested)');
  });
});

setTimeout(() => {
  console.log('timeout — delayed by nested nextTick');
}, 0);

// Output: nextTick 1 → nextTick 2 (nested) → timeout
// nextTick drains completely (including recursively added) before moving on

// ============================================================
// 4. Danger: Starving the Event Loop with nextTick
// ============================================================
/**
 * NEVER do this — it blocks the event loop forever:
 *
 * function recurse() {
 *   process.nextTick(recurse);
 * }
 * recurse();
 *
 * // I/O, timers, setImmediate will NEVER run because
 * // nextTick queue is always processed first and never empties.
 *
 * setImmediate is safer for recursion because it runs in the check
 * phase, allowing I/O and timers to process between iterations.
 */

// Safe recursive pattern with setImmediate:
let count = 0;
function safeRecurse() {
  if (count >= 5) return;
  count++;
  console.log(`Iteration ${count}`);
  setImmediate(safeRecurse); // Allows I/O between iterations
}
safeRecurse();

// ============================================================
// 5. Use Cases for Each
// ============================================================

/**
 * process.nextTick — Use when you need to:
 *   1. Emit events after constructor returns (EventEmitter pattern)
 *   2. Execute callback after current stack but before I/O
 *   3. Ensure consistency (API is always async)
 */
const { EventEmitter } = require('events');

class MyEmitter extends EventEmitter {
  constructor() {
    super();
    // Emit AFTER the constructor returns, so listeners can be attached
    process.nextTick(() => {
      this.emit('ready');
    });
  }
}

const emitter = new MyEmitter();
emitter.on('ready', () => console.log('Emitter is ready'));
// Without nextTick, 'ready' would fire before the listener is attached!

/**
 * setImmediate — Use when you need to:
 *   1. Break up CPU-intensive work to allow I/O
 *   2. Run something after I/O is processed
 *   3. Recursive operations (safer than nextTick)
 */
function processLargeArray(arr: number[], callback: (result: number) => void) {
  let sum = 0;
  let index = 0;
  const chunkSize = 1000;

  function processChunk() {
    const end = Math.min(index + chunkSize, arr.length);
    for (; index < end; index++) {
      sum += arr[index];
    }

    if (index < arr.length) {
      setImmediate(processChunk); // Yield to allow I/O between chunks
    } else {
      callback(sum);
    }
  }

  processChunk();
}

/**
 * setTimeout(fn, 0) — Use when you need to:
 *   1. Defer execution to the next event loop iteration
 *   2. Compatibility with browser code (no nextTick/setImmediate in browsers)
 *   3. Actual timed delays
 */

// ============================================================
// 6. Priority Order Summary
// ============================================================
/**
 * Within a single event loop cycle:
 *
 *  1. Synchronous code (call stack)
 *  2. process.nextTick queue (all, including recursive)
 *  3. Promise microtask queue (all, including recursive)
 *  4. Macrotasks by phase:
 *     - Timers (setTimeout, setInterval)
 *     - I/O callbacks
 *     - setImmediate (check phase)
 *     - Close callbacks
 *
 * Between each phase: nextTick + microtasks drain again
 *
 * In Node.js v11+, microtask behavior was aligned with browsers:
 * microtasks run between individual macrotasks, not just between phases.
 */

// ============================================================
// 7. Comparison Table
// ============================================================
/**
 * | Feature             | process.nextTick    | setImmediate     | setTimeout(fn, 0) |
 * |---------------------|--------------------|--------------------|-------------------|
 * | Phase               | Between all phases | Check phase        | Timers phase      |
 * | Priority            | Highest            | Lower              | Lower             |
 * | Inside I/O          | Runs first         | Before setTimeout  | After setImmediate|
 * | Recursive safety    | Dangerous (starve) | Safe               | Safe              |
 * | Min delay           | None               | None               | ~1ms              |
 * | Browser equivalent  | queueMicrotask     | None (use timeout) | setTimeout        |
 * | Typical use         | Event emission     | Yield to I/O       | Deferred execution|
 */
```

## Explanation

CONCEPT: Async Scheduling Priority

```
EXECUTION ORDER:

process.nextTick     →  runs BETWEEN phases (highest priority)
Promise.then         →  runs BETWEEN phases (after nextTick)
setTimeout(fn, 0)    →  runs in TIMERS phase
setImmediate         →  runs in CHECK phase

Within an I/O callback:
┌─────────────────────────────────────────┐
│ fs.readFile('file', () => {             │
│   setTimeout(() => log('timeout'), 0);  │  ← timers (next loop)
│   setImmediate(() => log('immediate')); │  ← check (THIS loop) ✓ first
│   process.nextTick(() => log('tick'));   │  ← between phases ✓✓ first
│ });                                     │
│                                         │
│ Output: tick → immediate → timeout      │
└─────────────────────────────────────────┘

Top-level (not in I/O):
setTimeout vs setImmediate order is NON-DETERMINISTIC
(depends on system timer resolution)
```
