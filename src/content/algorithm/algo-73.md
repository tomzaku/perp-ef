---
id: algo-73
title: Search a 2D Matrix
category: Algorithm
subcategory: Binary Search
difficulty: Medium
pattern: Binary Search
companies: [Amazon, Microsoft, Bloomberg]
timeComplexity: O(log(m*n))
spaceComplexity: O(1)
keyTakeaway: "A sorted 2D matrix can be treated as a single sorted array. Map a 1D index to 2D coordinates using row = index / cols and col = index % cols."
similarProblems: [Binary Search, Search a 2D Matrix II]
leetcodeUrl: https://leetcode.com/problems/search-a-2d-matrix/
---

You are given an `m x n` integer matrix with the following properties: each row is sorted in non-decreasing order, and the first integer of each row is greater than the last integer of the previous row.

Given an integer `target`, return `true` if `target` is in the matrix, or `false` otherwise. You must write a solution in O(log(m * n)) time.

## Examples

**Input:** matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3
**Output:** true

**Input:** matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13
**Output:** false

## Solution

```js
function searchMatrix(matrix, target) {
  const m = matrix.length;
  const n = matrix[0].length;
  let left = 0;
  let right = m * n - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const row = Math.floor(mid / n);
    const col = mid % n;
    const val = matrix[row][col];

    if (val === target) return true;
    if (val < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return false;
}
```

## Explanation

APPROACH: Binary Search on Flattened Matrix

Treat the 2D matrix as a 1D sorted array. Convert 1D index to 2D coordinates: `row = index / cols`, `col = index % cols`.

```
matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3

Flat view: [1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60]
            0  1  2  3   4   5   6   7   8   9  10  11

cols = 4

Step   L    R   mid   row  col  val   compare   action
────   ──   ──  ───   ───  ───  ───   ───────   ──────
 1     0    11   5     1    1   11    11 > 3    R = 4
 2     0    4    2     0    2    5     5 > 3    R = 1
 3     0    1    0     0    0    1     1 < 3    L = 1
 4     1    1    1     0    1    3    found! → true
```

WHY THIS WORKS:
- The matrix rows are contiguous in sorted order
- 1D-to-2D mapping preserves the sorted property
- Standard binary search on the virtual 1D array

## TestConfig
```json
{
  "functionName": "searchMatrix",
  "testCases": [
    { "args": [[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3], "expected": true },
    { "args": [[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13], "expected": false },
    { "args": [[[1]], 1], "expected": true },
    { "args": [[[1]], 0], "expected": false, "isHidden": true },
    { "args": [[[1, 3]], 3], "expected": true, "isHidden": true },
    { "args": [[[1],[3],[5]], 3], "expected": true, "isHidden": true },
    { "args": [[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 60], "expected": true, "isHidden": true },
    { "args": [[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 1], "expected": true, "isHidden": true },
    { "args": [[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 61], "expected": false, "isHidden": true }
  ]
}
```
