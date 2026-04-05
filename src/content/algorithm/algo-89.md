---
id: algo-89
title: Kth Largest Element in an Array
category: Algorithm
subcategory: Heap
difficulty: Medium
pattern: Heap
companies: [Amazon, Google, Meta, Microsoft]
timeComplexity: O(n) average (QuickSelect) / O(n log k) (Heap)
spaceComplexity: O(1) (QuickSelect) / O(k) (Heap)
keyTakeaway: "QuickSelect finds the kth largest in O(n) average by partitioning around a pivot — no sorting needed. Min-heap of size k is O(n log k) but works on streams. Know both."
similarProblems: [Top K Frequent Elements, K Closest Points to Origin, Kth Smallest Element in a BST]
leetcodeUrl: https://leetcode.com/problems/kth-largest-element-in-an-array/
---

Given an integer array `nums` and an integer `k`, return the `k`-th largest element in the array. Note that it is the k-th largest in sorted order, not the k-th distinct element.

## Examples

**Input:** nums = [3, 2, 1, 5, 6, 4], k = 2
**Output:** 5

**Input:** nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4
**Output:** 4

## Solution

```js
// ─────────────────────────────────────────────
// Approach 1: QuickSelect — O(n) avg, O(1) space
// ─────────────────────────────────────────────
function findKthLargest(nums, k) {
  // kth largest = (n - k)th smallest (0-indexed)
  const target = nums.length - k;

  function partition(left, right) {
    const pivot = nums[right];
    let store = left;

    for (let i = left; i < right; i++) {
      if (nums[i] <= pivot) {
        [nums[store], nums[i]] = [nums[i], nums[store]];
        store++;
      }
    }
    [nums[store], nums[right]] = [nums[right], nums[store]];
    return store;
  }

  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const pivotIdx = partition(left, right);

    if (pivotIdx === target) {
      return nums[pivotIdx]; // found it
    } else if (pivotIdx < target) {
      left = pivotIdx + 1;  // target is to the right
    } else {
      right = pivotIdx - 1; // target is to the left
    }
  }
}

// ─────────────────────────────────────────────
// Approach 2: Min-Heap of size k — O(n log k), O(k) space
// ─────────────────────────────────────────────
function findKthLargestHeap(nums, k) {
  const heap = [];

  // Sift the last element up to restore heap order — O(log k)
  function siftUp() {
    let i = heap.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent] <= heap[i]) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  }

  // Sift the root down to restore heap order — O(log k)
  function siftDown() {
    let i = 0;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
      if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
      if (smallest === i) break;
      [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
      i = smallest;
    }
  }

  function heapPush(val) {
    heap.push(val);
    siftUp(); // O(log k)
  }

  function heapPop() {
    heap[0] = heap[heap.length - 1]; // move last to root
    heap.pop();
    siftDown(); // O(log k)
  }

  for (const num of nums) {
    heapPush(num);
    if (heap.length > k) heapPop(); // evict the smallest
  }

  return heap[0]; // root = kth largest
}
```

## Explanation

### Approach 1: QuickSelect

QuickSelect is a partial sort. Instead of sorting the entire array, it only recurses into the half that contains the target index — discarding the other half completely.

**Key insight:** the kth largest element sits at index `n - k` in a sorted array (0-indexed). We use partitioning (from QuickSort) to find that index without fully sorting.

```
nums = [3, 2, 1, 5, 6, 4],  k = 2
target index = 6 - 2 = 4  (4th from left = 2nd from right)

─── Round 1: partition around pivot=4 (right end) ───
  [3, 2, 1, 4, 6, 5]  →  pivot lands at index 3
  target(4) > pivotIdx(3) → search right half only

─── Round 2: partition around pivot=5 ───
  [..., 5, 6]  →  pivot lands at index 4
  target(4) == pivotIdx(4) → return nums[4] = 5 ✓
```

After each partition, the pivot is in its **final sorted position**. Everything to its left is ≤ pivot, everything to its right is ≥ pivot. We recurse only into the side containing `target` — on average, we halve the search space each time → O(n).

---

### Approach 2: Min-Heap of Size k

Maintain a min-heap of at most k elements. The root is always the smallest of the k largest elements seen so far — that's exactly the kth largest.

```
nums = [3, 2, 1, 5, 6, 4],  k = 2

  push 3  → heap: [3]           size=1
  push 2  → heap: [2, 3]        size=2
  push 1  → heap: [1, 2, 3]     size=3 > k → pop min(1) → [2, 3]
  push 5  → heap: [2, 3, 5]     size=3 > k → pop min(2) → [3, 5]
  push 6  → heap: [3, 5, 6]     size=3 > k → pop min(3) → [5, 6]
  push 4  → heap: [4, 5, 6]     size=3 > k → pop min(4) → [5, 6]

heap root = 5 ← 2nd largest ✓
```

---

### When to use which

```
Approach        Time           Space   Use when
──────────────────────────────────────────────────────────────────
Sort            O(n log n)     O(1)    n is tiny, readability wins
Min-Heap        O(n log k)     O(k)    Data is a stream (unbounded),
                                       or k is much smaller than n
QuickSelect     O(n) avg       O(1)    All data fits in memory,
               O(n²) worst            you want the best average case
```

**QuickSelect** is faster on average but mutates the array and has O(n²) worst case with bad pivot choices (mitigated by random pivot selection).

**Min-Heap** shines for **streaming data** — you can process elements one at a time without storing all of them, making it the only viable option when n is unknown or very large.

## TestConfig
```json
{
  "functionName": "findKthLargest",
  "argTypes": [{ "type": "array" }, { "type": "primitive" }],
  "returnType": { "type": "primitive" },
  "testCases": [
    { "args": [[3,2,1,5,6,4], 2], "expected": 5 },
    { "args": [[3,2,3,1,2,4,5,5,6], 4], "expected": 4 },
    { "args": [[1], 1], "expected": 1 },
    { "args": [[7,6,5,4,3,2,1], 1], "expected": 7, "isHidden": true },
    { "args": [[7,6,5,4,3,2,1], 7], "expected": 1, "isHidden": true },
    { "args": [[-1,-2,-3,-4,-5], 2], "expected": -2, "isHidden": true },
    { "args": [[2,1], 1], "expected": 2, "isHidden": true },
    { "args": [[2,1], 2], "expected": 1, "isHidden": true }
  ]
}
```
