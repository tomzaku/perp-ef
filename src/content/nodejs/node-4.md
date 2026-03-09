---
id: node-4
title: "Streams: Readable, Writable, Transform, Duplex"
category: Node.js
subcategory: Streams
difficulty: Hard
pattern: Stream Processing and Memory Efficiency
companies: [Netflix, Google, Amazon]
timeComplexity: "O(n) where n is the total data size, processed in O(1) memory chunks"
spaceComplexity: O(highWaterMark) — only one chunk in memory at a time
keyTakeaway: "Streams process data in chunks with constant memory usage. Readable (source), Writable (destination), Transform (modify), Duplex (both). Use pipeline() over pipe() for proper error handling. Backpressure prevents memory exhaustion when the writer is slower than the reader. Streams are essential for processing large files and network data."
similarProblems: [Implement a file copy with streams, Build an HTTP proxy with streams, Implement a log rotation system, Stream-based JSON parser]
---

Explain Node.js streams: Readable, Writable, Transform, and Duplex. Implement custom streams, demonstrate piping, and explain backpressure. Show practical use cases for processing large files.

## Examples

**Input:** readStream.pipe(transformStream).pipe(writeStream)
**Output:** Data flows from source through transformation to destination
*pipe() connects streams and automatically handles backpressure, flowing data in chunks.*


## Solution

```js
/**
 * NODE.JS STREAMS
 *
 * Streams process data in chunks instead of loading everything into memory.
 * Essential for handling large files, network data, and real-time processing.
 *
 * 4 Types:
 *   Readable  — Source of data (fs.createReadStream, http.IncomingMessage)
 *   Writable  — Destination for data (fs.createWriteStream, http.ServerResponse)
 *   Transform — Reads and writes, modifying data (zlib.createGzip)
 *   Duplex    — Both readable and writable independently (net.Socket)
 *
 * All streams are EventEmitters.
 */

const fs = require('fs');
const { Readable, Writable, Transform, Duplex, pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);

// ============================================================
// 1. Readable Stream
// ============================================================

// Built-in: Reading a file
const readStream = fs.createReadStream('large-file.txt', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024, // 64KB chunks (default)
});

readStream.on('data', (chunk: string) => {
  console.log(`Received ${chunk.length} bytes`);
});
readStream.on('end', () => console.log('Done reading'));
readStream.on('error', (err: Error) => console.error(err));

// Custom Readable stream
class CounterStream extends Readable {
  private current: number;
  private max: number;

  constructor(max: number) {
    super({ objectMode: true }); // objectMode allows non-string/Buffer data
    this.current = 0;
    this.max = max;
  }

  _read() {
    if (this.current < this.max) {
      this.current++;
      this.push({ number: this.current, timestamp: Date.now() });
    } else {
      this.push(null); // Signal end of stream
    }
  }
}

const counter = new CounterStream(5);
counter.on('data', (data: { number: number }) => {
  console.log('Count:', data.number);
});

// ============================================================
// 2. Writable Stream
// ============================================================

// Built-in: Writing to a file
const writeStream = fs.createWriteStream('output.txt');
writeStream.write('Hello\n');
writeStream.write('World\n');
writeStream.end('Done\n'); // end() writes final chunk and closes

writeStream.on('finish', () => console.log('Write complete'));

// Custom Writable stream
class LogStream extends Writable {
  private logs: string[];

  constructor() {
    super({ objectMode: true });
    this.logs = [];
  }

  _write(
    chunk: any,
    encoding: string,
    callback: (error?: Error | null) => void
  ) {
    const entry = `[${new Date().toISOString()}] ${JSON.stringify(chunk)}`;
    this.logs.push(entry);
    console.log(entry);
    callback(); // Signal that writing is complete — essential for backpressure
  }

  getLogs(): string[] {
    return [...this.logs];
  }
}

// ============================================================
// 3. Transform Stream
// ============================================================

// Custom Transform: Convert to uppercase
class UpperCaseTransform extends Transform {
  _transform(
    chunk: Buffer,
    encoding: string,
    callback: (error?: Error | null, data?: any) => void
  ) {
    const uppercased = chunk.toString().toUpperCase();
    callback(null, uppercased); // Push transformed data
    // Alternatively: this.push(uppercased); callback();
  }
}

// Custom Transform: CSV line parser
class CSVParser extends Transform {
  private headers: string[] | null;

  constructor() {
    super({ objectMode: true });
    this.headers = null;
  }

  _transform(
    chunk: Buffer,
    encoding: string,
    callback: (error?: Error | null, data?: any) => void
  ) {
    const line = chunk.toString().trim();

    if (!this.headers) {
      this.headers = line.split(',');
      callback();
      return;
    }

    const values = line.split(',');
    const record: Record<string, string> = {};
    this.headers.forEach((header, i) => {
      record[header] = values[i];
    });
    callback(null, record);
  }
}

// Custom Transform: JSON line filter
class FilterTransform extends Transform {
  private predicate: (data: any) => boolean;

  constructor(predicate: (data: any) => boolean) {
    super({ objectMode: true });
    this.predicate = predicate;
  }

  _transform(chunk: any, encoding: string, callback: (error?: Error | null, data?: any) => void) {
    if (this.predicate(chunk)) {
      callback(null, chunk);
    } else {
      callback(); // Skip this chunk
    }
  }
}

// ============================================================
// 4. Piping Streams Together
// ============================================================

// Simple pipe: read → transform → write
// fs.createReadStream('input.txt')
//   .pipe(new UpperCaseTransform())
//   .pipe(fs.createWriteStream('output.txt'));

// pipeline() is preferred over pipe() — it handles errors and cleanup
async function processFile() {
  try {
    await pipelineAsync(
      fs.createReadStream('input.txt'),
      new UpperCaseTransform(),
      fs.createWriteStream('output.txt')
    );
    console.log('Pipeline complete');
  } catch (err) {
    console.error('Pipeline failed:', err);
  }
}

// ============================================================
// 5. Backpressure
// ============================================================
/**
 * Backpressure occurs when the writable stream can't keep up with the
 * readable stream. Without handling it, data buffers in memory → crash.
 *
 * pipe() handles backpressure automatically:
 *   - When writable's buffer is full, it returns false from write()
 *   - pipe() pauses the readable stream
 *   - When writable drains, it emits 'drain' event
 *   - pipe() resumes the readable stream
 *
 * Manual backpressure handling:
 */

function manualBackpressure() {
  const readable = fs.createReadStream('huge-file.bin');
  const writable = fs.createWriteStream('copy.bin');

  readable.on('data', (chunk: Buffer) => {
    const canContinue = writable.write(chunk);

    if (!canContinue) {
      // Buffer is full — pause reading!
      readable.pause();

      writable.once('drain', () => {
        // Buffer drained — resume reading
        readable.resume();
      });
    }
  });

  readable.on('end', () => {
    writable.end();
  });
}

// ============================================================
// 6. Duplex Stream (reads and writes independently)
// ============================================================
class EchoStream extends Duplex {
  private buffer: string[];

  constructor() {
    super({ objectMode: true });
    this.buffer = [];
  }

  _write(chunk: any, encoding: string, callback: () => void) {
    this.buffer.push(chunk);
    callback();
  }

  _read() {
    if (this.buffer.length > 0) {
      this.push(this.buffer.shift());
    } else {
      // Wait a bit for more data
      setTimeout(() => this._read(), 100);
    }
  }
}

// ============================================================
// 7. Practical Example: Large File Processing
// ============================================================
const zlib = require('zlib');

async function compressAndUpload(inputPath: string) {
  // Read file → Gzip compress → Write to .gz file
  await pipelineAsync(
    fs.createReadStream(inputPath),
    zlib.createGzip(),
    fs.createWriteStream(`${inputPath}.gz`)
  );
}

// Process a large CSV file line by line without loading it all into memory
const readline = require('readline');

async function processLargeCSV(filePath: string) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let lineCount = 0;

  for await (const line of rl) {
    lineCount++;
    // Process each line — only one line in memory at a time
    if (lineCount % 100000 === 0) {
      console.log(`Processed ${lineCount} lines`);
    }
  }

  console.log(`Total: ${lineCount} lines`);
}

/**
 * KEY CONCEPTS:
 *
 * highWaterMark — Buffer size threshold (default: 16KB for normal, 16 objects for objectMode)
 * objectMode   — Stream processes JS objects instead of Buffers/strings
 * pipeline()   — Preferred over pipe() — handles errors and destroys streams on failure
 * for await..of — Modern way to consume readable streams
 *
 * WHEN TO USE STREAMS:
 * - Files larger than available memory
 * - Network data (HTTP requests/responses)
 * - Real-time data processing
 * - ETL pipelines
 * - Video/audio processing
 */
```
