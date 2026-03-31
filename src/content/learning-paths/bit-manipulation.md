---
slug: bit-manipulation
title: Bit Manipulation
icon: "01"
description: "Bit manipulation uses bitwise operators (AND, OR, XOR, NOT, shifts) to solve problems at the binary level. These techniques enable O(1) operations that would otherwise require loops or extra space — like finding a unique element, counting set bits, or performing arithmetic without +/-. Understanding bits is fundamental to low-level programming, cryptography, and many interview problems."
pattern: "The core patterns revolve around XOR properties (a ^ a = 0, a ^ 0 = a), the n & (n-1) trick to clear the lowest set bit, and using shifts to examine or build numbers bit by bit. XOR is the workhorse — it cancels pairs, so XORing all elements reveals the unpaired one. For counting bits, repeatedly clearing the lowest set bit with n & (n-1) counts in O(set bits) time. Masks isolate specific bits for partitioning or extraction."
whenToUse: [Finding unique/missing elements, Counting set bits, Arithmetic without +/-, Power of two checks, Subset generation, Flag/permission systems]
keyInsights:
  - "XOR cancels pairs: a ^ a = 0, a ^ 0 = a — finds the unique element in O(n) time O(1) space"
  - "n & (n-1) clears the lowest set bit — useful for counting bits and power-of-two checks"
  - "Left shift (<<) multiplies by 2, right shift (>>) divides by 2"
  - "AND with a mask extracts specific bits; OR sets bits; XOR toggles bits"
  - "Bit DP can enumerate all subsets of n elements in O(2^n) time"
questionIds: [algo-bit-1, algo-bit-2, algo-bit-3, algo-bit-4, algo-bit-5, algo-bit-6, algo-bit-7]
---

## Bit Manipulation

Bit manipulation operates directly on the binary representation of numbers using bitwise operators. These techniques often replace loops, hash maps, or arithmetic with constant-time bit operations — leading to elegant, space-efficient solutions.

### Bitwise Operators

| Operator | Symbol | Example (5 = 101, 3 = 011) | Result |
|----------|--------|----------------------------|--------|
| AND | `&` | `101 & 011` | `001` (1) |
| OR | `\|` | `101 \| 011` | `111` (7) |
| XOR | `^` | `101 ^ 011` | `110` (6) |
| NOT | `~` | `~101` | `...010` (-6 in 2's complement) |
| Left Shift | `<<` | `101 << 1` | `1010` (10) |
| Right Shift | `>>` | `101 >> 1` | `10` (2) |

#### Real World
> **[Linux kernel / embedded systems]** — Permission flags in Unix (read=4, write=2, execute=1) are stored as bitmasks and checked with AND in a single CPU instruction, avoiding any branching or data structure overhead at the OS level.

#### Practice
1. Given a 32-bit integer, return the number of 1 bits it has (Hamming weight / popcount).
2. Given an integer n, determine whether it is a power of two. Solve in O(1) without using any loops.
3. Why does `n & (n-1)` clear the lowest set bit rather than some other bit, and what property of two's complement arithmetic makes this true?

### Essential Tricks

**1. XOR Properties:**
```
a ^ a = 0     (cancel pairs)
a ^ 0 = a     (identity)
a ^ b ^ a = b (extract the different one)
```
XOR all elements to find the single unique one.

**2. Clear Lowest Set Bit:**
```
n & (n - 1)
Example: 12 (1100) & 11 (1011) = 8 (1000)
```
Useful for counting set bits and checking power of two (`n & (n-1) === 0`).

**3. Get Lowest Set Bit:**
```
n & (-n)
Example: 12 (1100) & -12 (...0100) = 4 (0100)
```
Isolates the rightmost 1-bit. Used to partition numbers in Single Number III.

**4. Check if Bit is Set:**
```
(n >> i) & 1   // check i-th bit
n | (1 << i)   // set i-th bit
n & ~(1 << i)  // clear i-th bit
n ^ (1 << i)   // toggle i-th bit
```

#### Real World
> **[Cryptography / hashing]** — XOR is the core operation in stream ciphers and one-time pads: XOR a plaintext byte with a key byte to encrypt, XOR again with the same key to decrypt — a reversible, branchless operation used in AES and many hash functions.

#### Practice
1. Given a non-empty array of integers where every element appears twice except for one, find the single element. Solve in O(n) time and O(1) space using XOR.
2. Given an array where every element appears three times except one, find the unique element. How does the approach change from the "appears twice" variant?
3. How would you use XOR to swap two integer variables in-place without a temporary variable, and what edge case makes this approach risky?

### Common Patterns

**Find unique element:** XOR all elements — duplicates cancel, unique remains.

**Count set bits:** Loop with `n = n & (n-1)` until n = 0, counting iterations.

**Add without +:** XOR gives sum without carry, AND + shift gives carry. Repeat until no carry.

**Missing number:** XOR indices 0..n with all array elements — the missing one survives.

#### Real World
> **[Game development / graphics]** — Sprite rendering engines use bitmasks to encode which tiles are visible or dirty in a tilemap, enabling O(1) bulk updates via OR and single-instruction checks via AND instead of iterating each tile.

#### Practice
1. Given an array containing n distinct numbers taken from 0 to n, find the one missing number. Solve using XOR in O(n) time and O(1) space.
2. Given an array where two elements appear once and all others appear twice, find those two unique elements. How do you split them into two separate XOR groups?
3. Why is the XOR-based "add without +" approach for arbitrary integers inherently iterative rather than constant-time on a real CPU?

### Complexity

Bit operations are O(1) per operation (on fixed-width integers). Problems typically run in O(n) time scanning the array and O(1) extra space — the key advantage over hash-based approaches.

#### Real World
> **[Distributed systems]** — Bloom filters use bit arrays with multiple hash functions to test set membership in O(1) time with zero false negatives — a direct application of bit manipulation that powers duplicate URL detection in web crawlers at Google scale.

#### Practice
1. Given an integer, add one to it without using the `+` operator. Use bit manipulation to implement the increment.
2. Given an array of integers and a number k, return all subsets of size k. Enumerate subsets using bitmasks over an n-element array.
3. When would you choose a hash set over a bitset for membership testing, and what are the memory and speed trade-offs at n = 10^6 elements?

## ELI5

Think of numbers as rows of light switches, where each switch is either ON (1) or OFF (0).

```
Number 5 in binary:  1 0 1  (switches 0 and 2 are ON)
Number 3 in binary:  0 1 1  (switches 0 and 1 are ON)
```

**XOR** is like a "difference detector" — it lights up where switches DIFFER:
```
  5: 1 0 1
  3: 0 1 1
XOR: 1 1 0  = 6  (switches 1 and 2 differ)
```

The magic trick: **XOR a number with itself and it becomes 0** (no differences!):
```
  5: 1 0 1
  5: 1 0 1
XOR: 0 0 0  = 0  ← everything cancels out!
```

This is why XOR finds the unique number:
```
Array: [2, 3, 2]
Step 1: 0 ^ 2 = 2
Step 2: 2 ^ 3 = 1   (some intermediate value)
Step 3: 1 ^ 2 = 3   ← the 2s cancelled, only 3 survives!
```

**n & (n-1)** is like turning off the rightmost light that's ON:
```
12 = 1100  (two lights on)
11 = 1011
 &  = 1000  ← rightmost ON light (position 2) turned off!

 8 = 1000  (one light on)
 7 = 0111
 &  = 0000  ← the last light turned off!
```

Count how many times you can do this before all lights are off → that's the number of set bits!

## Poem

In zeros and ones the answers hide,
XOR cancels pairs side by side.
What remains when doubles fade?
The lonely number, unafraid.

Shift to the left, you multiply,
Shift to the right, you divide on by.
AND reveals what bits align,
OR combines them, intertwined.

Clear the lowest bit that's set,
n & (n-1) — don't forget.
In the dance of bits and bytes,
Elegant solutions come to light.

## Template

```ts
// XOR to find single unique element
function singleNumber(nums: number[]): number {
  let result = 0;
  for (const num of nums) {
    result ^= num;
  }
  return result;
}

// Count set bits using Brian Kernighan's algorithm
function countBits(n: number): number {
  let count = 0;
  while (n !== 0) {
    n = n & (n - 1); // clear lowest set bit
    count++;
  }
  return count;
}

// Check if n is a power of two
function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

// Add two integers without + or -
function getSum(a: number, b: number): number {
  while (b !== 0) {
    const carry = (a & b) << 1;
    a = a ^ b;      // sum without carry
    b = carry;       // carry for next iteration
  }
  return a;
}

// Get/Set/Clear/Toggle specific bit
function getBit(n: number, i: number): number {
  return (n >> i) & 1;
}

function setBit(n: number, i: number): number {
  return n | (1 << i);
}

function clearBit(n: number, i: number): number {
  return n & ~(1 << i);
}

function toggleBit(n: number, i: number): number {
  return n ^ (1 << i);
}
```
