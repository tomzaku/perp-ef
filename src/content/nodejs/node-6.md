---
id: node-6
title: Error Handling Patterns
category: Node.js
subcategory: Best Practices
difficulty: Medium
pattern: Defensive Programming and Fault Tolerance
companies: [Amazon, Google, Microsoft]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Separate operational errors (handle gracefully) from programmer errors (crash and restart). Always handle error events on EventEmitters. Use process-level handlers (unhandledRejection, uncaughtException) as safety nets. Implement graceful shutdown for SIGTERM. Use custom error classes with status codes for consistent error responses."
similarProblems: 
  - Build an Express error middleware
  - Implement retry with exponential backoff
  - Circuit breaker pattern
  - Error monitoring integration (Sentry)
---

Cover comprehensive error handling in Node.js: try/catch for sync and async code, error events on EventEmitters, unhandledRejection, uncaughtException, operational vs programmer errors, and graceful shutdown.

## Examples

**Input:** process.on("unhandledRejection", handler)
**Output:** Catches any Promise rejection that lacks a .catch() handler
*In Node.js 15+, unhandled promise rejections terminate the process by default.*


## Solution

```js
/**
 * ERROR HANDLING PATTERNS IN NODE.JS
 *
 * Two categories of errors:
 *   1. Operational errors — Expected failures (network, file not found, invalid input)
 *      → Handle gracefully, recover, retry, or respond with error
 *
 *   2. Programmer errors — Bugs (TypeError, null reference, wrong arguments)
 *      → Fix the code; process should crash and restart
 */

// ============================================================
// 1. Synchronous Error Handling
// ============================================================
function parseJSON(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    if (err instanceof SyntaxError) {
      // Operational: bad input
      console.error('Invalid JSON:', err.message);
      return null;
    }
    throw err; // Re-throw unexpected errors
  }
}

// ============================================================
// 2. Async/Await Error Handling
// ============================================================
const fs = require('fs').promises;

// Pattern A: try/catch block
async function readConfig(path: string) {
  try {
    const data = await fs.readFile(path, 'utf8');
    return JSON.parse(data);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.log('Config not found, using defaults');
      return { port: 3000 };
    }
    throw err; // Re-throw unknown errors
  }
}

// Pattern B: .catch() on individual promises
async function fetchUserAndPosts(userId: string) {
  const user = await fetch(`/api/users/${userId}`).catch(() => null);
  const posts = await fetch(`/api/users/${userId}/posts`).catch(() => []);

  return { user, posts }; // Graceful degradation — partial results
}

// Pattern C: Error wrapper utility
function catchAsync(fn: Function) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Express usage:
// app.get('/users/:id', catchAsync(async (req, res) => {
//   const user = await User.findById(req.params.id);
//   res.json(user);
// }));

// ============================================================
// 3. EventEmitter Error Handling
// ============================================================
const { EventEmitter } = require('events');

const emitter = new EventEmitter();

// CRITICAL: Always attach an 'error' listener!
// Without it, an 'error' event CRASHES the process.
emitter.on('error', (err: Error) => {
  console.error('Emitter error:', err.message);
});

emitter.emit('error', new Error('Something went wrong'));
// Handled gracefully — no crash

// Streams are EventEmitters — always handle errors:
const stream = require('fs').createReadStream('nonexistent-file.txt');
stream.on('error', (err: any) => {
  console.error('Stream error:', err.message);
});

// ============================================================
// 4. Global Error Handlers
// ============================================================

// A) Unhandled Promise Rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection:', reason);
  // In Node 15+, this terminates the process by default
  // Log, report to monitoring, and exit gracefully
});

// Example of unhandled rejection:
// Promise.reject(new Error('forgot catch')); // Would trigger handler above

// B) Uncaught Exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  // IMPORTANT: After an uncaught exception, the process is in an
  // undefined state. You should:
  //   1. Log the error
  //   2. Send to error reporting service
  //   3. Flush logs
  //   4. Exit the process
  //   5. Let a process manager (PM2) restart it
  process.exit(1);
});

// C) Uncaught Exception in async context (Node 12+)
process.on('uncaughtExceptionMonitor', (err: Error, origin: string) => {
  // Like uncaughtException but does NOT prevent default behavior
  // Use for monitoring/reporting only
  console.error(`Monitor caught: ${origin}:`, err);
});

// ============================================================
// 5. Custom Error Classes
// ============================================================
class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

class ValidationError extends AppError {
  public readonly fields: Record<string, string>;

  constructor(fields: Record<string, string>) {
    super('Validation failed', 400);
    this.fields = fields;
  }
}

class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, false); // isOperational = false → programmer error
  }
}

// Usage:
function getUser(id: string) {
  // if (!user) throw new NotFoundError('User');
  // if (!valid) throw new ValidationError({ email: 'Invalid email format' });
}

// ============================================================
// 6. Centralized Error Handler
// ============================================================
class ErrorHandler {
  public handleError(err: Error): void {
    if (err instanceof AppError && err.isOperational) {
      // Operational error — handle gracefully
      this.logError(err);
    } else {
      // Programmer error or unknown — crash and restart
      this.logError(err);
      this.crashGracefully();
    }
  }

  private logError(err: Error): void {
    console.error({
      name: err.name,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    // Send to error monitoring (Sentry, DataDog, etc.)
  }

  private crashGracefully(): void {
    // Give in-flight requests time to complete
    const server = (global as any).__server;
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    }

    // Force exit after timeout
    setTimeout(() => {
      process.exit(1);
    }, 5000);
  }
}

const errorHandler = new ErrorHandler();

// Wire up global handlers
process.on('uncaughtException', (err) => errorHandler.handleError(err));
process.on('unhandledRejection', (reason) => {
  throw reason; // Convert to uncaughtException for unified handling
});

// ============================================================
// 7. Graceful Shutdown
// ============================================================
function setupGracefulShutdown(server: any) {
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

  signals.forEach((signal) => {
    process.on(signal, () => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(() => {
        console.log('HTTP server closed');

        // Close database connections
        // await db.disconnect();

        // Close other resources
        // await redis.quit();

        console.log('Graceful shutdown complete');
        process.exit(0);
      });

      // Force exit after timeout
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    });
  });
}

/**
 * ERROR HANDLING CHECKLIST:
 *
 * 1. Always handle 'error' events on EventEmitters and Streams
 * 2. Use try/catch with async/await
 * 3. Attach unhandledRejection and uncaughtException handlers
 * 4. Distinguish operational errors from programmer errors
 * 5. Use custom error classes with status codes
 * 6. Implement centralized error handling
 * 7. Set up graceful shutdown for SIGTERM/SIGINT
 * 8. Use a process manager (PM2) for automatic restarts
 * 9. Log errors with context (stack trace, request info, timestamp)
 * 10. Never swallow errors silently (empty catch blocks)
 */
```
