---
id: node-5
title: Cluster Module and Worker Threads
category: Node.js
subcategory: Performance
difficulty: Medium
pattern: Parallel Processing and Scaling
companies: [Google, Amazon, Uber]
timeComplexity: N/A
spaceComplexity: "Cluster: O(n * processMemory), Worker Threads: O(n * threadOverhead)"
keyTakeaway: "Cluster creates multiple processes sharing a port — ideal for HTTP server scaling. Worker Threads create threads within a process — ideal for CPU-intensive tasks without blocking the event loop. Use Cluster for stateless web server scaling, Worker Threads for computational tasks. In production, prefer PM2 or container orchestration over raw cluster."
similarProblems: 
  - Implement a task queue with workers
  - Build a load balancer
  - Process images in parallel
  - Implement graceful zero-downtime restart
---

Explain the Cluster module for multi-process scaling and Worker Threads for CPU-intensive tasks. Show when to use each, implementation examples, and communication patterns.

## Examples

**Input:** cluster.fork() — 4 workers on a 4-core machine
**Output:** Each worker handles requests independently, sharing the same port
*Cluster creates child processes that share the server port, enabling horizontal scaling on a single machine.*


## Solution

```js
/**
 * CLUSTER MODULE AND WORKER THREADS
 *
 * Node.js is single-threaded. To utilize multiple CPU cores:
 *
 * Cluster Module: Creates multiple PROCESSES (copies of the entire app)
 *   - Each worker is a separate process with its own memory and V8 instance
 *   - Workers share a server port (load-balanced by the OS or round-robin)
 *   - Best for: HTTP servers, horizontal scaling
 *
 * Worker Threads: Creates THREADS within a single process
 *   - Threads share memory (via SharedArrayBuffer) but have separate V8 instances
 *   - Communicate via message passing (postMessage) or shared memory
 *   - Best for: CPU-intensive tasks (parsing, compression, crypto)
 */

// ============================================================
// 1. Cluster Module
// ============================================================
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isPrimary) {
  // PRIMARY PROCESS: Fork workers

  const numCPUs = os.cpus().length;
  console.log(`Primary ${process.pid} starting ${numCPUs} workers`);

  // Fork one worker per CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker events
  cluster.on('exit', (worker: any, code: number, signal: string) => {
    console.log(`Worker ${worker.process.pid} died (code: ${code})`);
    // Auto-restart crashed workers
    console.log('Starting a new worker...');
    cluster.fork();
  });

  // Send messages to workers
  for (const id in cluster.workers) {
    cluster.workers[id]?.send({ type: 'config', port: 3000 });
  }
} else {
  // WORKER PROCESS: Handle requests

  const server = http.createServer((req: any, res: any) => {
    // Simulate some work
    res.writeHead(200);
    res.end(`Handled by worker ${process.pid}\n`);
  });

  server.listen(3000, () => {
    console.log(`Worker ${process.pid} listening on port 3000`);
  });

  // Receive messages from primary
  process.on('message', (msg: any) => {
    console.log(`Worker ${process.pid} received:`, msg);
  });
}

// ============================================================
// 2. Graceful Shutdown with Cluster
// ============================================================
function setupGracefulShutdown() {
  if (cluster.isPrimary) {
    process.on('SIGTERM', () => {
      console.log('Primary received SIGTERM. Shutting down workers...');

      for (const id in cluster.workers) {
        cluster.workers[id]?.send({ type: 'shutdown' });
      }

      setTimeout(() => {
        console.log('Force killing remaining workers');
        for (const id in cluster.workers) {
          cluster.workers[id]?.kill();
        }
        process.exit(0);
      }, 10000); // Force kill after 10s
    });
  } else {
    let isShuttingDown = false;

    process.on('message', (msg: any) => {
      if (msg.type === 'shutdown') {
        isShuttingDown = true;
        // Stop accepting new connections
        // server.close(() => process.exit(0));
      }
    });
  }
}

// ============================================================
// 3. Worker Threads
// ============================================================
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // MAIN THREAD: Create workers for CPU-intensive tasks

  function runWorker(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: data,
      });

      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code: number) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  // Example: Calculate primes in parallel
  async function calculatePrimesParallel() {
    const ranges = [
      { start: 2, end: 250000 },
      { start: 250001, end: 500000 },
      { start: 500001, end: 750000 },
      { start: 750001, end: 1000000 },
    ];

    const results = await Promise.all(
      ranges.map((range) => runWorker({ task: 'primes', ...range }))
    );

    const totalPrimes = results.reduce((sum: number, r: any) => sum + r.count, 0);
    console.log(`Total primes up to 1M: ${totalPrimes}`);
  }

  calculatePrimesParallel();
} else {
  // WORKER THREAD: Do CPU-intensive work

  const { task, start, end } = workerData;

  if (task === 'primes') {
    let count = 0;

    for (let i = start; i <= end; i++) {
      if (isPrime(i)) count++;
    }

    // Send result back to main thread
    parentPort?.postMessage({ start, end, count });
  }

  function isPrime(n: number): boolean {
    if (n < 2) return false;
    for (let i = 2, sqrt = Math.sqrt(n); i <= sqrt; i++) {
      if (n % i === 0) return false;
    }
    return true;
  }
}

// ============================================================
// 4. Worker Thread Pool (Reusable Workers)
// ============================================================
class WorkerPool {
  private workers: any[];
  private queue: Array<{ data: any; resolve: Function; reject: Function }>;
  private activeWorkers: Set<any>;

  constructor(private workerPath: string, private poolSize: number) {
    this.workers = [];
    this.queue = [];
    this.activeWorkers = new Set();

    for (let i = 0; i < poolSize; i++) {
      this.addWorker();
    }
  }

  private addWorker() {
    const worker = new Worker(this.workerPath);
    this.workers.push(worker);
  }

  exec(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const availableWorker = this.workers.find(
        (w: any) => !this.activeWorkers.has(w)
      );

      if (availableWorker) {
        this.runTask(availableWorker, data, resolve, reject);
      } else {
        // Queue the task
        this.queue.push({ data, resolve, reject });
      }
    });
  }

  private runTask(worker: any, data: any, resolve: Function, reject: Function) {
    this.activeWorkers.add(worker);

    const onMessage = (result: any) => {
      worker.removeListener('error', onError);
      this.activeWorkers.delete(worker);
      resolve(result);
      this.processQueue();
    };

    const onError = (err: Error) => {
      worker.removeListener('message', onMessage);
      this.activeWorkers.delete(worker);
      reject(err);
      this.processQueue();
    };

    worker.once('message', onMessage);
    worker.once('error', onError);
    worker.postMessage(data);
  }

  private processQueue() {
    if (this.queue.length === 0) return;

    const availableWorker = this.workers.find(
      (w: any) => !this.activeWorkers.has(w)
    );

    if (availableWorker) {
      const { data, resolve, reject } = this.queue.shift()!;
      this.runTask(availableWorker, data, resolve, reject);
    }
  }

  destroy() {
    this.workers.forEach((w: any) => w.terminate());
  }
}

// Usage:
// const pool = new WorkerPool('./heavy-task.js', os.cpus().length);
// const result = await pool.exec({ input: 'data' });

// ============================================================
// 5. SharedArrayBuffer (Shared Memory)
// ============================================================
if (isMainThread) {
  // Create shared memory
  const sharedBuffer = new SharedArrayBuffer(4); // 4 bytes
  const sharedArray = new Int32Array(sharedBuffer);
  sharedArray[0] = 0;

  const worker = new Worker(__filename, {
    workerData: { sharedBuffer },
  });

  // Both threads can read/write the same memory
  // Use Atomics for thread-safe operations:
  Atomics.add(sharedArray, 0, 10); // Atomic addition
  console.log('Main:', Atomics.load(sharedArray, 0));
} else {
  const { sharedBuffer } = workerData;
  const sharedArray = new Int32Array(sharedBuffer);

  Atomics.add(sharedArray, 0, 20);
  console.log('Worker:', Atomics.load(sharedArray, 0));
}

// ============================================================
// 6. When to Use Which
// ============================================================
/**
 * | Scenario                    | Use Cluster          | Use Worker Threads    |
 * |-----------------------------|---------------------|-----------------------|
 * | HTTP server scaling         | Yes                 | No                    |
 * | CPU-intensive computation   | Possible but heavy  | Yes (preferred)       |
 * | Shared memory needed        | No (IPC only)       | Yes (SharedArrayBuffer)|
 * | Fault isolation             | Yes (process crash)  | Partial               |
 * | Memory overhead             | High (per process)  | Lower (per thread)    |
 * | Startup time                | Slower              | Faster                |
 * | Use case                    | Stateless web apps  | Image/video processing|
 * |                             |                     | Crypto, ML inference  |
 *
 * PRODUCTION TIPS:
 * - Use PM2 or similar instead of raw cluster for production
 * - Worker thread pools prevent excessive thread creation
 * - SharedArrayBuffer + Atomics for lock-free shared state
 * - Use worker_threads for anything that blocks the event loop > 100ms
 */
```
