---
id: algo-71
title: Find Peak Element
category: Algorithm
subcategory: Binary Search
difficulty: Medium
pattern: Binary Search
companies: [Google, Meta, Microsoft]
timeComplexity: O(log n)
spaceComplexity: O(1)
keyTakeaway: "Binary search works even on unsorted arrays when there is a guaranteed convergence property. If nums[mid] < nums[mid+1], a peak must exist to the right."
similarProblems: [Find Minimum in Rotated Sorted Array, Binary Search]
leetcodeUrl: https://leetcode.com/problems/find-peak-element/
---

A peak element is an element that is strictly greater than its neighbors. Given a 0-indexed integer array `nums`, find a peak element, and return its index. If the array contains multiple peaks, return the index to **any** of the peaks.

You may imagine that `nums[-1] = nums[n] = -∞`. You must write an algorithm that runs in O(log n) time.

## Examples

**Input:** nums = [1,2,3,1]
**Output:** 2
**Explanation:** 3 is a peak element and your function should return the index number 2.

**Input:** nums = [1,2,1,3,5,6,4]
**Output:** 5
**Explanation:** Your function can return either index number 1 (peak 2) or 5 (peak 6).

## Solution

```js
function findPeakElement(nums) {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] < nums[mid + 1]) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}
```

## Explanation

APPROACH: Binary Search on Slope

If `nums[mid] < nums[mid+1]`, the right side is increasing so a peak must exist to the right. Otherwise, a peak exists at mid or to the left.

```
nums = [1, 2, 1, 3, 5, 6, 4]

Step   L   R   mid   nums[mid]  nums[mid+1]  slope      action
────   ─   ─   ───   ─────────  ───────────  ─────      ──────
 1     0   6    3       3          5         rising     L = 4
 2     4   6    5       6          4         falling    R = 5
 3     4   5    4       5          6         rising     L = 5
 4     L == R = 5 → return 5 (nums[5] = 6 is peak)
```

WHY THIS WORKS:
- Boundaries are -∞, so edges always slope inward
- If mid < mid+1, moving right guarantees we follow an upward slope toward a peak
- The slope must eventually turn down (since boundary is -∞), creating a peak

## TestConfig
```json
{
  "functionName": "findPeakElement",
  "testCases": [
    { "args": [[1, 2, 3, 1]], "expected": 2 },
    { "args": [[1]], "expected": 0 },
    { "args": [[2, 1]], "expected": 0 },
    { "args": [[1, 2]], "expected": 1, "isHidden": true },
    { "args": [[1, 3, 2, 1]], "expected": 1, "isHidden": true },
    { "args": [[1, 2, 3, 4, 5]], "expected": 4, "isHidden": true },
    { "args": [[5, 4, 3, 2, 1]], "expected": 0, "isHidden": true },
    { "args": [[1, 6, 5, 4, 3, 2, 1]], "expected": 1, "isHidden": true }
  ]
}
```
