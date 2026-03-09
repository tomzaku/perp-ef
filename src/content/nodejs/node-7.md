---
id: node-7
title: Memory Leaks Detection and Prevention
category: Node.js
subcategory: Performance
difficulty: Hard
pattern: Memory Management and Resource Cleanup
companies: [Google, Netflix, Meta]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Common memory leak causes: unbounded collections, closure scope retention, unremoved event listeners, uncleared timers, and unclosed streams. Detect leaks using process.memoryUsage(), heap snapshots (--inspect + Chrome DevTools), and monitoring. Prevent leaks with bounded caches, WeakMap/WeakRef, cleanup on disconnect, and timeouts on external calls."
similarProblems: 
  - Implement an LRU cache
  - Build a memory usage monitoring middleware
  - Detect event listener leaks
  - Implement connection pool with cleanup
---

Identify common causes of memory leaks in Node.js, demonstrate detection techniques using heap snapshots and profiling tools, and show prevention strategies.

## Examples

**Input:** Growing array that never gets cleaned up in a long-running server
**Output:** Memory usage increases linearly over time → OOM crash
*Any data structure that grows unboundedly without cleanup is a memory leak in a long-running process.*


## Solution

```js
/**
 * MEMORY LEAKS IN NODE.JS: DETECTION AND PREVENTION
 *
 * Memory leak: Memory that is allocated but never released because
 * references to it are unintentionally retained. In a long-running
 * server, this causes steadily increasing memory usage until OOM.
 *
 * V8 Garbage Collection:
 *   - New Space (Scavenge): Short-lived objects, frequent GC
 *   - Old Space (Mark-Sweep/Compact): Long-lived objects, less frequent GC
 *   - Objects survive GC if they are REACHABLE from a root (global, stack, closures)
 */

// ============================================================
// 1. Common Cause: Global Variables / Unbounded Collections
// ============================================================

// LEAK: Array grows forever
const requestLog: any[] = []; // Never cleaned!

function handleRequest(req: any) {
  requestLog.push({
    url: req.url,
    time: Date.now(),
    headers: req.headers, // Large objects!
  });
  // requestLog is NEVER trimmed → memory grows indefinitely
}

// FIX: Use bounded collection or TTL-based cache
class BoundedCache<T> {
  private items: T[] = [];

  constructor(private maxSize: number) {}

  add(item: T) {
    this.items.push(item);
    if (this.items.length > this.maxSize) {
      this.items.shift(); // Remove oldest
    }
  }

  getAll(): T[] {
    return [...this.items];
  }
}

const boundedLog = new BoundedCache(1000); // Max 1000 entries

// ============================================================
// 2. Common Cause: Closures Retaining Large Scopes
// ============================================================

// LEAK: Closure retains reference to large data
function processData() {
  const hugeData = Buffer.alloc(100 * 1024 * 1024); // 100MB

  return function getDataLength() {
    // This closure keeps hugeData alive even though it only needs .length
    return hugeData.length;
  };
}

const getLength = processData(); // hugeData is permanently in memory

// FIX: Extract only what the closure needs
function processDataFixed() {
  const hugeData = Buffer.alloc(100 * 1024 * 1024);
  const length = hugeData.length; // Extract the value

  return function getDataLength() {
    return length; // Closure only captures the number, not the Buffer
  };
}

// ============================================================
// 3. Common Cause: Event Listener Accumulation
// ============================================================

// LEAK: Adding listeners without removing them
class Connection {
  connect(emitter: any) {
    // Every call adds a NEW listener — they stack up!
    emitter.on('data', this.handleData);
  }

  handleData(data: any) {
    console.log(data);
  }

  // FIX: Remove listeners on disconnect/cleanup
  disconnect(emitter: any) {
    emitter.removeListener('data', this.handleData);
  }
}

// Node warns: MaxListenersExceededWarning when > 10 listeners
// emitter.setMaxListeners(20); // Increasing the limit hides the real problem!

// Best practice: Use 'once' for one-time listeners
// emitter.once('data', handleData);

// ============================================================
// 4. Common Cause: Timers Not Cleared
// ============================================================

// LEAK: setInterval without clearInterval
class StatusChecker {
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    this.intervalId = setInterval(() => {
      console.log('Checking status...');
    }, 5000);
  }

  // MUST call stop() or the interval (and everything it references) leaks
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// ============================================================
// 5. Common Cause: Forgotten Promises / Streams
// ============================================================

// LEAK: Creating streams without consuming or destroying them
const fsSync = require('fs');

function leakyStreamExample() {
  const stream = fsSync.createReadStream('large-file.txt');
  // Stream is opened but never read or closed → file descriptor leak
  // FIX: Always consume (.pipe, for await, .read) or call stream.destroy()
}

// LEAK: Promises that never resolve (e.g., missing timeout)
function fetchWithoutTimeout(url: string) {
  return fetch(url); // If server never responds → promise hangs, resources held
}

// FIX: Always add timeouts to external calls
function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  return fetch(url, { signal: controller.signal }).finally(() => {
    clearTimeout(timeout);
  });
}

// ============================================================
// 6. Detection: Using process.memoryUsage()
// ============================================================
function monitorMemory() {
  setInterval(() => {
    const usage = process.memoryUsage();
    console.log({
      rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,        // Resident Set Size
      heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`, // V8 heap allocated
      heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,  // V8 heap used
      external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`,  // C++ objects
    });

    // Alert if heap usage exceeds threshold
    if (usage.heapUsed > 500 * 1024 * 1024) { // 500MB
      console.warn('HIGH MEMORY USAGE — potential leak!');
    }
  }, 10000); // Check every 10 seconds
}

// ============================================================
// 7. Detection: Heap Snapshots
// ============================================================
/**
 * Method 1: Chrome DevTools
 *   node --inspect server.js
 *   → Open chrome://inspect
 *   → Take heap snapshots → compare → find growing objects
 *
 * Method 2: Programmatic heap snapshot
 */
const v8 = require('v8');

function takeHeapSnapshot() {
  const snapshotStream = v8.writeHeapSnapshot();
  console.log(`Heap snapshot written to: ${snapshotStream}`);
  // Load .heapsnapshot in Chrome DevTools Memory tab
}

// Take snapshots at intervals and compare:
// setTimeout(takeHeapSnapshot, 0);      // baseline
// setTimeout(takeHeapSnapshot, 60000);  // after 1 min
// setTimeout(takeHeapSnapshot, 300000); // after 5 min
// Compare to find objects that keep growing

// ============================================================
// 8. Detection: Using --expose-gc and manual GC
// ============================================================
/**
 * node --expose-gc app.js
 *
 * global.gc(); // Force garbage collection
 * const before = process.memoryUsage().heapUsed;
 * // ... do operations ...
 * global.gc();
 * const after = process.memoryUsage().heapUsed;
 * console.log(`Memory delta: ${(after - before) / 1024} KB`);
 *
 * If delta is consistently positive after GC → leak confirmed
 */

// ============================================================
// 9. Prevention Checklist
// ============================================================
/**
 * 1. BOUNDED COLLECTIONS: Use LRU cache, ring buffers, or max-size limits
 * 2. CLEANUP LISTENERS: removeListener / removeAllListeners on cleanup
 * 3. CLEAR TIMERS: clearInterval / clearTimeout when done
 * 4. DESTROY STREAMS: Always close/destroy unused streams
 * 5. AVOID GLOBAL STATE: Minimize global/module-level mutable state
 * 6. WEAK REFERENCES: Use WeakMap/WeakSet for caches and metadata
 * 7. TIMEOUT EVERYTHING: Add timeouts to network calls and DB queries
 * 8. MONITOR IN PRODUCTION: Track RSS/heap with metrics (Prometheus, DataDog)
 * 9. LOAD TEST: Run memory profiling during load tests to catch leaks early
 * 10. REVIEW CLOSURES: Ensure closures don't capture more than needed
 */

// ============================================================
// 10. Using WeakRef for Caching (Node 14+)
// ============================================================
class WeakCache<K, V extends object> {
  private cache = new Map<K, WeakRef<V>>();
  private registry = new FinalizationRegistry<K>((key) => {
    // Clean up the Map entry when the value is GC'd
    this.cache.delete(key);
  });

  set(key: K, value: V) {
    const ref = new WeakRef(value);
    this.cache.set(key, ref);
    this.registry.register(value, key);
  }

  get(key: K): V | undefined {
    const ref = this.cache.get(key);
    if (!ref) return undefined;

    const value = ref.deref();
    if (!value) {
      this.cache.delete(key); // Cleanup stale entry
      return undefined;
    }
    return value;
  }
}
```
