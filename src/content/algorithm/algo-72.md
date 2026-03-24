---
id: algo-72
title: Koko Eating Bananas
category: Algorithm
subcategory: Binary Search
difficulty: Medium
pattern: Binary Search
companies: [Google, Amazon, Meta]
timeComplexity: O(n log m)
spaceComplexity: O(1)
keyTakeaway: "Binary search on the answer — instead of searching in the input array, search the space of possible answers. Check if a candidate answer satisfies the constraint."
similarProblems: [Capacity To Ship Packages Within D Days, Split Array Largest Sum]
leetcodeUrl: https://leetcode.com/problems/koko-eating-bananas/
---

Koko loves to eat bananas. There are `n` piles of bananas, the `i`-th pile has `piles[i]` bananas. The guards have gone and will come back in `h` hours.

Koko can decide her bananas-per-hour eating speed of `k`. Each hour, she chooses a pile and eats `k` bananas from it. If the pile has fewer than `k` bananas, she eats all of them and won't eat any more during that hour.

Return the minimum integer `k` such that she can eat all the bananas within `h` hours.

## Examples

**Input:** piles = [3,6,7,11], h = 8
**Output:** 4
**Explanation:** At speed 4: ceil(3/4)+ceil(6/4)+ceil(7/4)+ceil(11/4) = 1+2+2+3 = 8 hours. Speed 3 would need 9 hours (too slow).

**Input:** piles = [30,11,23,4,20], h = 5
**Output:** 30
**Explanation:** She must eat one pile per hour at minimum, so speed must be at least the largest pile.

## Solution

```js
function minEatingSpeed(piles, h) {
  let left = 1;
  let right = Math.max(...piles);

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const hours = piles.reduce((sum, p) => sum + Math.ceil(p / mid), 0);
    if (hours <= h) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }

  return left;
}
```

## Explanation

APPROACH: Binary Search on Answer Space

Instead of searching the input, binary search the range of possible speeds [1, max(piles)]. For each candidate speed, check if Koko can finish in time.

```
piles = [3, 6, 7, 11], h = 8

Speed range: [1, 11]

Step   L    R   mid   hours needed   <= 8?   action
────   ──   ──  ───   ────────────   ─────   ──────
 1     1    11   6    1+1+2+2 = 6    Yes     R = 6
 2     1    6    3    1+2+3+4 = 10   No      L = 4
 3     4    6    5    1+2+2+3 = 8    Yes     R = 5
 4     4    5    4    1+2+2+3 = 8    Yes     R = 4
 5     L == R = 4 → answer is 4
```

WHY THIS WORKS:
- The answer space is monotonic: higher speed → fewer hours
- Binary search finds the minimum speed where hours ≤ h
- `right = mid` keeps the candidate; `left = mid + 1` eliminates too-slow speeds

## TestConfig
```json
{
  "functionName": "minEatingSpeed",
  "testCases": [
    { "args": [[3, 6, 7, 11], 8], "expected": 4 },
    { "args": [[30, 11, 23, 4, 20], 5], "expected": 30 },
    { "args": [[30, 11, 23, 4, 20], 6], "expected": 23 },
    { "args": [[1], 1], "expected": 1, "isHidden": true },
    { "args": [[1, 1, 1], 3], "expected": 1, "isHidden": true },
    { "args": [[10], 5], "expected": 2, "isHidden": true },
    { "args": [[312884470], 312884469], "expected": 2, "isHidden": true },
    { "args": [[1, 2, 3, 4, 5], 5], "expected": 5, "isHidden": true }
  ]
}
```
