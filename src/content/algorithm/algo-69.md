---
id: algo-69
title: Search Insert Position
category: Algorithm
subcategory: Binary Search
difficulty: Easy
pattern: Binary Search
companies: [Google, Apple]
timeComplexity: O(log n)
spaceComplexity: O(1)
keyTakeaway: "Binary search naturally converges to the correct insertion point. When the target is not found, the left pointer ends up at exactly where the target should be inserted."
similarProblems: [Binary Search, First Bad Version]
leetcodeUrl: https://leetcode.com/problems/search-insert-position/
---

Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.

You must write an algorithm with O(log n) runtime complexity.

## Examples

**Input:** nums = [1,3,5,6], target = 5
**Output:** 2
**Explanation:** 5 is found at index 2.

**Input:** nums = [1,3,5,6], target = 2
**Output:** 1
**Explanation:** 2 would be inserted at index 1 (between 1 and 3).

**Input:** nums = [1,3,5,6], target = 7
**Output:** 4
**Explanation:** 7 would be inserted at the end.

## Solution

```js
function searchInsert(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return left;
}
```

## Explanation

APPROACH: Binary Search with Insert Point

Standard binary search, but when the loop ends without finding the target, `left` is the correct insertion index.

```
nums = [1, 3, 5, 6], target = 2

Step   L   R   mid   nums[mid]   compare   action
────   ─   ─   ───   ─────────   ───────   ──────
 1     0   3    1       3        3 > 2     R = 0
 2     0   0    0       1        1 < 2     L = 1
 3     L > R → return L = 1

Insert at index 1: [1, 2, 3, 5, 6] ✓
```

WHY THIS WORKS:
- Binary search narrows the search space
- When target is not found, `left` points to the first element greater than target
- That is exactly where target should be inserted

## TestConfig
```json
{
  "functionName": "searchInsert",
  "testCases": [
    { "args": [[1, 3, 5, 6], 5], "expected": 2 },
    { "args": [[1, 3, 5, 6], 2], "expected": 1 },
    { "args": [[1, 3, 5, 6], 7], "expected": 4 },
    { "args": [[1, 3, 5, 6], 0], "expected": 0, "isHidden": true },
    { "args": [[1], 0], "expected": 0, "isHidden": true },
    { "args": [[1], 1], "expected": 0, "isHidden": true },
    { "args": [[1], 2], "expected": 1, "isHidden": true },
    { "args": [[1, 3], 2], "expected": 1, "isHidden": true },
    { "args": [[1, 3, 5, 7, 9], 8], "expected": 4, "isHidden": true }
  ]
}
```
