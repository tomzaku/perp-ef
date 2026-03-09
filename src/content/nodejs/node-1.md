---
id: node-1
title: Event Loop Phases
category: Node.js
subcategory: Event Loop
difficulty: Hard
pattern: Node.js Runtime Architecture
companies: [Netflix, Uber, Google]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Node.js event loop has 6 phases: timers → pending callbacks → idle/prepare → poll → check → close callbacks. process.nextTick and Promise microtasks run BETWEEN every phase. Inside I/O callbacks, setImmediate always runs before setTimeout. The poll phase is where the loop spends most of its time, waiting for and processing I/O."
similarProblems: 
  - Browser event loop vs Node.js event loop
  - process.nextTick vs setImmediate
  - libuv thread pool
  - Blocking the event loop detection
---

Explain all 6 phases of the Node.js event loop: timers, pending callbacks, idle/prepare, poll, check, and close callbacks. Show how different async operations are scheduled into different phases and demonstrate execution order.

## Examples

**Input:** setTimeout(() => log('timer'), 0); setImmediate(() => log('immediate'));
**Output:** Order is non-deterministic when called from the main module
*In the main module, the order depends on process performance. Inside an I/O callback, setImmediate always fires before setTimeout.*


## Solution

```js
/**
 * NODE.JS EVENT LOOP PHASES
 *
 * Unlike the browser event loop (which has macrotask + microtask queues),
 * Node.js (libuv) has a multi-phase event loop with specific queues for
 * different types of operations.
 *
 * The 6 phases execute in this order, each with its own FIFO queue:
 *
 *   ┌───────────────────────────┐
 *   │        timers              │  ← setTimeout, setInterval callbacks
 *   ├───────────────────────────┤
 *   │     pending callbacks      │  ← I/O callbacks deferred from previous cycle
 *   ├───────────────────────────┤
 *   │     idle, prepare          │  ← internal use only
 *   ├───────────────────────────┤
 *   │         poll               │  ← retrieve new I/O events; execute I/O callbacks
 *   ├───────────────────────────┤
 *   │         check              │  ← setImmediate callbacks
 *   ├───────────────────────────┤
 *   │     close callbacks        │  ← socket.on('close'), etc.
 *   └───────────────────────────┘
 *
 * Between EVERY phase transition, Node processes:
 *   1. process.nextTick queue (highest priority)
 *   2. Promise microtask queue
 */

// ============================================================
// Phase 1: TIMERS
// ============================================================
/**
 * Executes callbacks scheduled by setTimeout() and setInterval().
 * A timer's callback runs AFTER the specified delay has elapsed,
 * not exactly at the delay time. The poll phase controls when
 * timers are actually executed.
 *
 * Note: A setTimeout(fn, 0) actually has a minimum delay of ~1ms.
 */
setTimeout(() => {
  console.log('Timer phase: setTimeout 0ms');
}, 0);

setTimeout(() => {
  console.log('Timer phase: setTimeout 100ms');
}, 100);

// ============================================================
// Phase 2: PENDING CALLBACKS
// ============================================================
/**
 * Executes I/O callbacks that were deferred to the next loop iteration.
 * Example: certain system-level errors like ECONNREFUSED on some systems.
 * Most I/O callbacks are handled in the poll phase, not here.
 */

// ============================================================
// Phase 3: IDLE, PREPARE
// ============================================================
/**
 * Used internally by Node.js. Not accessible to user code.
 * prepare: runs before the poll phase starts.
 */

// ============================================================
// Phase 4: POLL
// ============================================================
/**
 * The most important phase. It does two things:
 *   1. Calculates how long it should block and poll for I/O
 *   2. Processes events in the poll queue (I/O callbacks)
 *
 * When the event loop enters the poll phase:
 *   - If the poll queue is NOT empty: iterate through callbacks synchronously
 *   - If the poll queue IS empty:
 *     - If setImmediate() is scheduled → move to check phase
 *     - If timers are due → wrap back to timers phase
 *     - Otherwise → WAIT for callbacks to be added, then execute immediately
 */
const fs = require('fs');

fs.readFile(__filename, () => {
  console.log('Poll phase: I/O callback (readFile)');

  // Inside an I/O callback, setImmediate ALWAYS runs before setTimeout
  setTimeout(() => console.log('  → setTimeout inside I/O'), 0);
  setImmediate(() => console.log('  → setImmediate inside I/O'));
});

// ============================================================
// Phase 5: CHECK
// ============================================================
/**
 * setImmediate() callbacks run here, AFTER the poll phase completes.
 * setImmediate is designed to execute after I/O events in the current cycle.
 */
setImmediate(() => {
  console.log('Check phase: setImmediate');
});

// ============================================================
// Phase 6: CLOSE CALLBACKS
// ============================================================
/**
 * Handles close events: socket.on('close'), process.on('exit'), etc.
 * If a socket or handle is closed abruptly (e.g., socket.destroy()),
 * the 'close' event is emitted in this phase.
 */
const net = require('net');
// const server = net.createServer();
// server.on('close', () => {
//   console.log('Close phase: server closed');
// });

// ============================================================
// Execution Order Demonstration
// ============================================================
const fs2 = require('fs');

console.log('1 - sync');

setTimeout(() => {
  console.log('2 - setTimeout 0');
}, 0);

setImmediate(() => {
  console.log('3 - setImmediate');
});

Promise.resolve().then(() => {
  console.log('4 - Promise microtask');
});

process.nextTick(() => {
  console.log('5 - nextTick');
});

fs2.readFile(__filename, () => {
  console.log('6 - I/O callback');

  process.nextTick(() => {
    console.log('7 - nextTick inside I/O');
  });

  Promise.resolve().then(() => {
    console.log('8 - Promise inside I/O');
  });

  setTimeout(() => {
    console.log('9 - setTimeout inside I/O');
  }, 0);

  setImmediate(() => {
    console.log('10 - setImmediate inside I/O');
  });
});

console.log('11 - sync');

/**
 * Output:
 * 1 - sync
 * 11 - sync
 * 5 - nextTick          (nextTick queue — highest priority)
 * 4 - Promise microtask (microtask queue — after nextTick)
 * 2 - setTimeout 0      (timers phase — may swap with 3)
 * 3 - setImmediate      (check phase — may swap with 2 in main module)
 * 6 - I/O callback      (poll phase)
 * 7 - nextTick inside I/O  (between phases)
 * 8 - Promise inside I/O   (between phases)
 * 10 - setImmediate inside I/O  (check phase — always before setTimeout in I/O)
 * 9 - setTimeout inside I/O    (timers phase — next iteration)
 */

// ============================================================
// Phase Transition and Microtasks
// ============================================================
/**
 * CRITICAL: process.nextTick and Promise microtasks run between
 * EVERY phase of the event loop, not just at the end of a cycle.
 *
 *   timers → [nextTick + microtasks] → pending → [nextTick + microtasks]
 *   → poll → [nextTick + microtasks] → check → [nextTick + microtasks]
 *   → close → [nextTick + microtasks] → timers ...
 *
 * process.nextTick always runs BEFORE Promise microtasks.
 *
 * WARNING: Recursive process.nextTick() can STARVE the event loop,
 * preventing I/O and timers from ever executing.
 */
```

## Explanation

CONCEPT: Node.js Event Loop — 6 Phases

```
   ┌───────────────────────────┐
┌─►│           timers          │  setTimeout, setInterval callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  I/O callbacks deferred from prev cycle
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  internal use only
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  retrieve new I/O events
│  │  (most callbacks here)    │  node will block here when appropriate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │      close callbacks      │  socket.on('close', ...)
│  └─────────────┬─────────────┘
└────────────────┘

Between EACH phase: drain all process.nextTick() and Promise microtasks
```

KEY INSIGHT:
- The poll phase is where Node spends most time (waiting for I/O)
- setImmediate runs in "check" phase (after poll)
- setTimeout runs in "timers" phase (beginning of loop)
- process.nextTick fires between ANY two phases (highest priority)
