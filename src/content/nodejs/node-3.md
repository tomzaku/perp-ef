---
id: node-3
title: Callback Patterns and Callback Hell
category: Node.js
subcategory: Async Patterns
difficulty: Easy
pattern: Async Evolution and Error Handling
companies: [Amazon, Microsoft]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "The error-first callback (err, result) is Node.js core convention. Callback hell is solved by: (1) extracting named functions, (2) converting to Promises with util.promisify or fs.promises, (3) using async/await. Modern Node.js code should use async/await with try/catch for clean, readable async flows."
similarProblems: 
  - Implement util.promisify from scratch
  - Convert callback-based API to async/await
  - Error handling in async/await
  - Sequential vs parallel async execution
---

Explain the error-first callback convention in Node.js. Demonstrate "callback hell" and show how to solve it using named functions, Promises (util.promisify), and async/await.

## Examples

**Input:** fs.readFile("file.txt", (err, data) => { ... })
**Output:** Error-first callback: err is null on success, Error on failure
*The Node.js convention is (err, result) — always check err first before using result.*


## Solution

```js
/**
 * CALLBACK PATTERNS AND CALLBACK HELL
 *
 * Node.js was built on callbacks. The error-first callback is the
 * fundamental async pattern: callback(error, result).
 *
 * "Callback hell" (pyramid of doom) occurs when multiple async
 * operations are nested, making code hard to read and maintain.
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// 1. Error-First Callback Convention
// ============================================================
/**
 * Rules:
 *   1. The first argument is ALWAYS the error (null if no error)
 *   2. The second argument is the result
 *   3. A callback should be called EXACTLY ONCE
 *   4. Either pass an error OR a result, never both
 */

// Standard Node.js callback
fs.readFile('/etc/hosts', 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
  if (err) {
    console.error('Failed to read file:', err.message);
    return; // Early return on error!
  }
  console.log('File contents:', data);
});

// Writing a function that follows the convention
function divide(
  a: number,
  b: number,
  callback: (err: Error | null, result?: number) => void
) {
  if (b === 0) {
    // Pass error as first argument
    callback(new Error('Division by zero'));
    return;
  }
  // Pass null for error, result as second argument
  callback(null, a / b);
}

divide(10, 2, (err, result) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log(`Result: ${result}`); // Result: 5
});

// ============================================================
// 2. Callback Hell — The Problem
// ============================================================
/**
 * Reading a config file, then reading a data file specified in the config,
 * then writing the processed result. Classic pyramid of doom:
 */

function callbackHellExample() {
  fs.readFile('config.json', 'utf8', (err: Error | null, configData: string) => {
    if (err) {
      console.error('Error reading config:', err);
      return;
    }
    const config = JSON.parse(configData);

    fs.readFile(config.dataFile, 'utf8', (err: Error | null, rawData: string) => {
      if (err) {
        console.error('Error reading data:', err);
        return;
      }
      const processed = rawData.toUpperCase(); // some processing

      fs.writeFile('output.txt', processed, (err: Error | null) => {
        if (err) {
          console.error('Error writing output:', err);
          return;
        }
        console.log('Pipeline complete!');

        // Imagine more nested callbacks here...
        fs.readFile('output.txt', 'utf8', (err: Error | null, result: string) => {
          if (err) return;
          console.log('Verified:', result.length, 'bytes');
        });
      });
    });
  });
}

// ============================================================
// 3. Fix #1: Named Functions (Flatten the Pyramid)
// ============================================================
function readConfig(callback: (err: Error | null, config?: any) => void) {
  fs.readFile('config.json', 'utf8', (err: Error | null, data: string) => {
    if (err) return callback(err);
    try {
      callback(null, JSON.parse(data));
    } catch (e) {
      callback(e as Error);
    }
  });
}

function readData(filePath: string, callback: (err: Error | null, data?: string) => void) {
  fs.readFile(filePath, 'utf8', callback);
}

function writeOutput(data: string, callback: (err: Error | null) => void) {
  fs.writeFile('output.txt', data, callback);
}

// Now the flow is flat:
function pipelineWithNamedFunctions() {
  readConfig((err, config) => {
    if (err) return console.error(err);

    readData(config.dataFile, (err, rawData) => {
      if (err) return console.error(err);

      writeOutput(rawData!.toUpperCase(), (err) => {
        if (err) return console.error(err);
        console.log('Pipeline complete!');
      });
    });
  });
}

// ============================================================
// 4. Fix #2: Convert to Promises with util.promisify
// ============================================================
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

function pipelineWithPromises(): Promise<void> {
  return readFileAsync('config.json', 'utf8')
    .then((configData: string) => {
      const config = JSON.parse(configData);
      return readFileAsync(config.dataFile, 'utf8');
    })
    .then((rawData: string) => {
      return writeFileAsync('output.txt', rawData.toUpperCase());
    })
    .then(() => {
      console.log('Pipeline complete!');
    })
    .catch((err: Error) => {
      console.error('Pipeline failed:', err.message);
    });
}

// ============================================================
// 5. Fix #3: async/await (Best Modern Approach)
// ============================================================
// Node.js also provides fs.promises:
const fsPromises = require('fs').promises;

async function pipelineWithAsyncAwait(): Promise<void> {
  try {
    const configData = await fsPromises.readFile('config.json', 'utf8');
    const config = JSON.parse(configData);

    const rawData = await fsPromises.readFile(config.dataFile, 'utf8');
    const processed = rawData.toUpperCase();

    await fsPromises.writeFile('output.txt', processed);
    console.log('Pipeline complete!');

    // Verification
    const result = await fsPromises.readFile('output.txt', 'utf8');
    console.log('Verified:', result.length, 'bytes');
  } catch (err) {
    console.error('Pipeline failed:', (err as Error).message);
  }
}

// ============================================================
// 6. Manual Promisification (Understanding util.promisify)
// ============================================================
function myPromisify<T>(
  fn: (...args: [...any[], (err: Error | null, result?: T) => void]) => void
) {
  return function (...args: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      fn(...args, (err: Error | null, result?: T) => {
        if (err) reject(err);
        else resolve(result as T);
      });
    });
  };
}

// Usage:
const readFilePromise = myPromisify<string>(fs.readFile);
// readFilePromise('file.txt', 'utf8').then(console.log);

// ============================================================
// 7. Parallel Callbacks → Promise.all
// ============================================================

// Callback approach (manual tracking):
function readMultipleFiles(
  files: string[],
  callback: (err: Error | null, results?: string[]) => void
) {
  const results: string[] = new Array(files.length);
  let completed = 0;
  let hasError = false;

  files.forEach((file, index) => {
    fs.readFile(file, 'utf8', (err: Error | null, data: string) => {
      if (hasError) return;
      if (err) {
        hasError = true;
        return callback(err);
      }
      results[index] = data;
      completed++;
      if (completed === files.length) {
        callback(null, results);
      }
    });
  });
}

// Promise approach (much cleaner):
async function readMultipleFilesAsync(files: string[]): Promise<string[]> {
  return Promise.all(files.map((f) => fsPromises.readFile(f, 'utf8')));
}

/**
 * EVOLUTION OF ASYNC PATTERNS IN NODE.JS
 *
 * 1. Callbacks     — Original, error-first convention
 * 2. Promises      — Chainable, better error handling
 * 3. async/await   — Synchronous-looking async code
 * 4. Streams       — For large data processing
 * 5. AsyncIterator — for await...of with streams
 *
 * BEST PRACTICES:
 * - Use fs.promises or util.promisify for modern code
 * - Use async/await for sequential operations
 * - Use Promise.all for parallel operations
 * - Always handle errors (try/catch or .catch())
 */
```
