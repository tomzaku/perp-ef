---
id: algo-81
title: Next Greater Element I
category: Algorithm
subcategory: Stack
difficulty: Easy
pattern: Stack
companies: [Amazon, Bloomberg]
timeComplexity: O(n + m)
spaceComplexity: O(n)
keyTakeaway: "Use a monotonic decreasing stack to precompute the next greater element for every value. Then answer queries via a hash map lookup."
similarProblems: [Daily Temperatures, Next Greater Element II, Largest Rectangle in Histogram]
leetcodeUrl: https://leetcode.com/problems/next-greater-element-i/
---

The **next greater element** of some element `x` in an array is the first greater element to the right of `x` in the same array. You are given two distinct arrays `nums1` and `nums2` where `nums1` is a subset of `nums2`. For each element in `nums1`, find its next greater element in `nums2`. Return -1 if it does not exist.

## Examples

**Input:** nums1 = [4,1,2], nums2 = [1,3,4,2]
**Output:** [-1,3,-1]
**Explanation:** For 4: no greater element to the right → -1. For 1: next greater is 3. For 2: no greater element → -1.

**Input:** nums1 = [2,4], nums2 = [1,2,3,4]
**Output:** [3,-1]

## Solution

```js
function nextGreaterElement(nums1, nums2) {
  const map = new Map();
  const stack = [];

  for (const num of nums2) {
    while (stack.length > 0 && stack[stack.length - 1] < num) {
      map.set(stack.pop(), num);
    }
    stack.push(num);
  }

  return nums1.map(n => map.get(n) ?? -1);
}
```

## Explanation

APPROACH: Monotonic Decreasing Stack + HashMap

Iterate through nums2 with a stack. When a larger element is found, it's the "next greater" for all smaller elements on the stack.

```
nums2 = [1, 3, 4, 2]

Step   num   stack (before)   pop & map              stack (after)
────   ───   ──────────────   ─────────              ─────────────
 1      1    []               —                      [1]
 2      3    [1]              1→3                     [3]
 3      4    [3]              3→4                     [4]
 4      2    [4]              —                       [4, 2]

Remaining in stack: 4, 2 have no next greater → -1

map = {1→3, 3→4}

nums1 = [4, 1, 2] → [-1, 3, -1]
```

WHY THIS WORKS:
- The stack maintains a decreasing sequence
- When a larger value appears, it "resolves" all smaller values on the stack
- Each element is pushed and popped at most once → O(n)

## TestConfig
```json
{
  "functionName": "nextGreaterElement",
  "testCases": [
    { "args": [[4,1,2], [1,3,4,2]], "expected": [-1,3,-1] },
    { "args": [[2,4], [1,2,3,4]], "expected": [3,-1] },
    { "args": [[1], [1]], "expected": [-1] },
    { "args": [[1,3], [1,2,3]], "expected": [2,-1], "isHidden": true },
    { "args": [[5], [5,4,3,2,1]], "expected": [-1], "isHidden": true },
    { "args": [[1], [2,1]], "expected": [-1], "isHidden": true },
    { "args": [[1,2,3], [3,2,1,4]], "expected": [4,4,4], "isHidden": true }
  ]
}
```
