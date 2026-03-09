---
id: node-8
title: Buffer and Binary Data
category: Node.js
subcategory: Core Modules
difficulty: Medium
pattern: Binary Data Processing and Low-Level I/O
companies: [Amazon, Google]
timeComplexity: O(n) for most operations where n is the buffer size
spaceComplexity: O(n) where n is the buffer size; allocated outside V8 heap
keyTakeaway: "Buffer handles raw binary data allocated outside the V8 heap. Use Buffer.alloc() for safe allocation, Buffer.from() for conversion, and subarray() for views (not copies). Key for file I/O, network protocols, cryptography, and streaming. Always use crypto.timingSafeEqual() for security-sensitive comparisons. Remember that subarray creates a view sharing memory with the original."
similarProblems: [Implement a binary protocol parser, Build a file upload handler, Implement base64 encoding from scratch, Create a binary serialization format]
---

Explain the Buffer class in Node.js for handling binary data. Cover Buffer creation methods, encoding/decoding, manipulation, streaming binary data, and security considerations.

## Examples

**Input:** Buffer.from("Hello", "utf8")
**Output:** <Buffer 48 65 6c 6c 6f>
*Buffer.from creates a buffer containing the UTF-8 encoded bytes of the string "Hello".*


## Solution

```js
/**
 * BUFFER AND BINARY DATA IN NODE.JS
 *
 * Buffer is a fixed-size chunk of memory allocated outside the V8 heap.
 * It represents raw binary data — similar to an array of integers,
 * where each element is a byte (0-255).
 *
 * Buffers are essential for:
 *   - File I/O (reading/writing binary files)
 *   - Network communication (TCP, HTTP)
 *   - Cryptography
 *   - Image/video processing
 *   - Protocol parsing (binary formats)
 */

// ============================================================
// 1. Creating Buffers
// ============================================================

// From string (most common)
const buf1 = Buffer.from('Hello, World!', 'utf8');
console.log(buf1); // <Buffer 48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21>
console.log(buf1.length); // 13 bytes
console.log(buf1.toString()); // "Hello, World!"

// From array of bytes
const buf2 = Buffer.from([72, 101, 108, 108, 111]); // ASCII codes
console.log(buf2.toString()); // "Hello"

// Allocate a zero-filled buffer of specific size
const buf3 = Buffer.alloc(10); // 10 bytes, all zeros
console.log(buf3); // <Buffer 00 00 00 00 00 00 00 00 00 00>

// Allocate WITHOUT zero-filling (faster but may contain old memory data)
const buf4 = Buffer.allocUnsafe(10); // May contain garbage data!
// SECURITY: Only use allocUnsafe when you will overwrite all bytes immediately

// From another buffer (copy)
const buf5 = Buffer.from(buf1); // Independent copy
buf5[0] = 0x4A; // Modify copy — original unchanged
console.log(buf5.toString()); // "Jello, World!"
console.log(buf1.toString()); // "Hello, World!" (unchanged)

// ============================================================
// 2. Encoding and Decoding
// ============================================================

const text = 'Hello, World!';

// Supported encodings: utf8, ascii, base64, base64url, hex, latin1, binary, utf16le
const utf8Buf = Buffer.from(text, 'utf8');
const base64 = utf8Buf.toString('base64');     // "SGVsbG8sIFdvcmxkIQ=="
const hex = utf8Buf.toString('hex');           // "48656c6c6f2c20576f726c6421"

console.log(Buffer.from(base64, 'base64').toString('utf8')); // "Hello, World!"
console.log(Buffer.from(hex, 'hex').toString('utf8'));        // "Hello, World!"

// Base64 encoding (common for APIs, JWT, file uploads)
const imageData = Buffer.from('fake-image-binary-data');
const base64Image = imageData.toString('base64');
const dataUri = `data:image/png;base64,${base64Image}`;

// Decode base64
const decoded = Buffer.from(base64Image, 'base64');
console.log(decoded.toString()); // "fake-image-binary-data"

// ============================================================
// 3. Reading and Writing Buffer Data
// ============================================================

const buf = Buffer.alloc(8);

// Write integers (big-endian and little-endian)
buf.writeUInt8(255, 0);            // 1 byte at offset 0
buf.writeUInt16BE(1000, 1);        // 2 bytes, big-endian, offset 1
buf.writeUInt32LE(123456, 3);      // 4 bytes, little-endian, offset 3
buf.writeInt8(-1, 7);              // Signed byte at offset 7

// Read them back
console.log(buf.readUInt8(0));     // 255
console.log(buf.readUInt16BE(1));  // 1000
console.log(buf.readUInt32LE(3));  // 123456
console.log(buf.readInt8(7));      // -1

// Float and Double
const floatBuf = Buffer.alloc(8);
floatBuf.writeFloatBE(3.14, 0);   // 4 bytes
floatBuf.writeDoubleBE(2.718, 0); // 8 bytes (overwrites float)

// ============================================================
// 4. Buffer Manipulation
// ============================================================

// Slicing (creates a VIEW, not a copy!)
const original = Buffer.from('Hello, World!');
const slice = original.subarray(0, 5); // "Hello"
slice[0] = 0x4A; // Modifying slice ALSO modifies original!
console.log(original.toString()); // "Jello, World!"

// To get an independent copy of a slice:
const safeCopy = Buffer.from(original.subarray(7, 12));

// Concatenating buffers
const part1 = Buffer.from('Hello, ');
const part2 = Buffer.from('World!');
const combined = Buffer.concat([part1, part2]);
console.log(combined.toString()); // "Hello, World!"

// With total length hint (optional, for efficiency)
const combined2 = Buffer.concat([part1, part2], part1.length + part2.length);

// Comparing buffers
const a = Buffer.from('abc');
const b = Buffer.from('abc');
const c = Buffer.from('def');
console.log(a.equals(b));        // true
console.log(Buffer.compare(a, c)); // -1 (a < c)

// Filling
const fillBuf = Buffer.alloc(5);
fillBuf.fill(0xFF);               // All bytes set to 255
fillBuf.fill('ab');                // Repeating pattern: 61 62 61 62 61

// Searching
const searchBuf = Buffer.from('Hello, World!');
console.log(searchBuf.indexOf('World'));     // 7
console.log(searchBuf.includes('Hello'));    // true

// ============================================================
// 5. Streaming Binary Data
// ============================================================
const fs = require('fs');
const crypto = require('crypto');

// Reading binary file as stream of buffers
function hashFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk: Buffer) => {
      hash.update(chunk); // chunk is a Buffer
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', reject);
  });
}

// Collecting stream chunks into a single buffer
function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

// ============================================================
// 6. Practical: Binary Protocol Parsing
// ============================================================

// Example: Simple binary message protocol
// [1 byte: type] [2 bytes: length] [N bytes: payload]
interface Message {
  type: number;
  payload: Buffer;
}

function parseMessage(buf: Buffer): Message {
  const type = buf.readUInt8(0);
  const length = buf.readUInt16BE(1);
  const payload = buf.subarray(3, 3 + length);

  return { type, payload };
}

function createMessage(type: number, payload: Buffer): Buffer {
  const header = Buffer.alloc(3);
  header.writeUInt8(type, 0);
  header.writeUInt16BE(payload.length, 1);

  return Buffer.concat([header, payload]);
}

// Usage:
const msg = createMessage(1, Buffer.from('Hello'));
console.log(msg); // <Buffer 01 00 05 48 65 6c 6c 6f>
const parsed = parseMessage(msg);
console.log(parsed.type);                // 1
console.log(parsed.payload.toString());  // "Hello"

// ============================================================
// 7. TypedArrays and SharedArrayBuffer
// ============================================================

// Buffer is a subclass of Uint8Array
const uint8 = new Uint8Array([1, 2, 3, 4]);
const bufFromTyped = Buffer.from(uint8.buffer);

// Convert between Buffer and TypedArray
const buf6 = Buffer.from([0x01, 0x02, 0x03, 0x04]);
const uint32 = new Uint32Array(buf6.buffer, buf6.byteOffset, buf6.length / 4);

// SharedArrayBuffer for multi-threaded access
// const shared = new SharedArrayBuffer(1024);
// const sharedBuf = Buffer.from(shared);
// Can be passed to Worker threads for shared memory access

// ============================================================
// 8. Security Considerations
// ============================================================
/**
 * 1. Buffer.allocUnsafe() / Buffer.allocUnsafeSlow():
 *    - May contain old memory data (sensitive info!)
 *    - Only use when you'll immediately overwrite all bytes
 *    - Use Buffer.alloc() for zero-filled safe allocation
 *
 * 2. Buffer.from(string) with user input:
 *    - Validate encoding to prevent unexpected behavior
 *    - Validate length to prevent DoS (huge allocation)
 *
 * 3. Buffer overflows:
 *    - Node.js Buffers don't overflow like C buffers
 *    - But writing beyond bounds silently fails or throws
 *    - Always validate offsets and lengths
 *
 * 4. Constant-time comparison for security:
 *    - Use crypto.timingSafeEqual() for comparing secrets/tokens
 *    - Regular === or Buffer.compare leaks timing information
 */

const cryptoModule = require('crypto');

function secureCompare(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return cryptoModule.timingSafeEqual(a, b);
}

/**
 * BUFFER vs STRING
 * | Feature        | Buffer              | String              |
 * |----------------|--------------------|--------------------|
 * | Content        | Raw bytes           | Unicode characters  |
 * | Mutability     | Mutable             | Immutable           |
 * | Memory         | Outside V8 heap     | V8 heap             |
 * | Size           | Fixed at creation   | Variable            |
 * | Use case       | Binary data, I/O    | Text processing     |
 * | Indexing       | Returns byte (0-255)| Returns character   |
 */
```
