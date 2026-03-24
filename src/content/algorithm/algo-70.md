---
id: algo-70
title: First Bad Version
category: Algorithm
subcategory: Binary Search
difficulty: Easy
pattern: Binary Search
companies: [Meta, Google]
timeComplexity: O(log n)
spaceComplexity: O(1)
keyTakeaway: "Use binary search with left < right and right = mid (not mid-1) to find the boundary. This variant converges left and right to the first true condition."
similarProblems: [Binary Search, Search Insert Position, Find Peak Element]
leetcodeUrl: https://leetcode.com/problems/first-bad-version/
---

You are a product manager and currently leading a team to develop a new product. Unfortunately, the latest version of your product fails the quality check. Since each version is developed based on the previous version, all the versions after a bad version are also bad.

You are given an API `isBadVersion(version)` which returns whether `version` is bad. Implement a function to find the first bad version. You should minimize the number of calls to the API.

## Examples

**Input:** n = 5, bad = 4
**Output:** 4
**Explanation:** isBadVersion(3) = false, isBadVersion(4) = true, isBadVersion(5) = true. So 4 is the first bad version.

**Input:** n = 1, bad = 1
**Output:** 1

## Solution

```js
function firstBadVersion(isBadVersion) {
  return function(n) {
    let left = 1;
    let right = n;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (isBadVersion(mid)) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }

    return left;
  };
}
```

## Explanation

APPROACH: Binary Search for Boundary

Find the transition point from false to true. Use `left < right` with `right = mid` to include mid as a candidate.

```
n = 5, first bad = 4

Versions:  [1, 2, 3, 4, 5]
isBad:     [F, F, F, T, T]

Step   L   R   mid   isBad(mid)   action
────   ─   ─   ───   ──────────   ──────
 1     1   5    3      false      L = 4
 2     4   5    4      true       R = 4
 3     L == R → return 4

```

WHY THIS WORKS:
- `right = mid` (not mid-1) because mid could be the first bad version
- `left = mid + 1` because mid is confirmed good
- Loop ends when left == right, which is the first bad version

## TestConfig
```json
{
  "functionName": "firstBadVersion",
  "testCases": [
    { "args": [5, 4], "expected": 4 },
    { "args": [1, 1], "expected": 1 },
    { "args": [10, 1], "expected": 1, "isHidden": true },
    { "args": [10, 10], "expected": 10, "isHidden": true },
    { "args": [100, 50], "expected": 50, "isHidden": true },
    { "args": [2, 2], "expected": 2, "isHidden": true },
    { "args": [2, 1], "expected": 1, "isHidden": true },
    { "args": [1000000, 999999], "expected": 999999, "isHidden": true }
  ]
}
```
