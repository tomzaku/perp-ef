---
id: algo-78
title: Subarrays with K Different Integers
category: Algorithm
subcategory: Sliding Window
difficulty: Hard
pattern: Sliding Window
companies: [Google, Amazon]
timeComplexity: O(n)
spaceComplexity: O(k)
keyTakeaway: "Exact k = atMost(k) - atMost(k-1). This decomposition technique turns an exact-count problem into two simpler at-most problems."
similarProblems: [Longest Substring with At Most K Distinct Characters, Fruit Into Baskets]
leetcodeUrl: https://leetcode.com/problems/subarrays-with-k-different-integers/
---

Given an integer array `nums` and an integer `k`, return the number of subarrays that have **exactly** `k` different integers.

## Examples

**Input:** nums = [1,2,1,2,3], k = 2
**Output:** 7
**Explanation:** Subarrays with exactly 2 distinct integers: [1,2], [2,1], [1,2], [2,3], [1,2,1], [2,1,2], [1,2,1,2].

**Input:** nums = [1,2,1,3,4], k = 3
**Output:** 3
**Explanation:** [1,2,1,3], [2,1,3], [1,3,4].

## Solution

```js
function subarraysWithKDistinct(nums, k) {
  return atMost(nums, k) - atMost(nums, k - 1);
}

function atMost(nums, k) {
  const freq = new Map();
  let left = 0;
  let count = 0;

  for (let right = 0; right < nums.length; right++) {
    freq.set(nums[right], (freq.get(nums[right]) || 0) + 1);

    while (freq.size > k) {
      const val = nums[left];
      freq.set(val, freq.get(val) - 1);
      if (freq.get(val) === 0) freq.delete(val);
      left++;
    }

    count += right - left + 1;
  }

  return count;
}
```

## Explanation

APPROACH: Exactly K = AtMost(K) - AtMost(K-1)

Counting exactly K distinct is hard directly. Instead, count subarrays with at most K distinct, then subtract subarrays with at most K-1 distinct.

```
nums = [1, 2, 1, 2, 3], k = 2

atMost(2):
  For each right, all subarrays ending at right with ≤2 distinct:
  R=0: [1]                         → +1 = 1
  R=1: [2], [1,2]                  → +2 = 3
  R=2: [1], [2,1], [1,2,1]        → +3 = 6
  R=3: [2], [1,2], [2,1,2], [1,2,1,2] → +4 = 10
  R=4: [3], [2,3]                  → +2 = 12

atMost(1):
  R=0: [1]                         → +1 = 1
  R=1: [2]                         → +1 = 2
  R=2: [1]                         → +1 = 3
  R=3: [2]                         → +1 = 4
  R=4: [3]                         → +1 = 5

exactly(2) = 12 - 5 = 7 ✓
```

WHY THIS WORKS:
- atMost(k) counts ALL subarrays with ≤k distinct integers
- Subtracting atMost(k-1) removes those with <k, leaving exactly k
- Each atMost call is O(n), so total is O(n)

## TestConfig
```json
{
  "functionName": "subarraysWithKDistinct",
  "testCases": [
    { "args": [[1, 2, 1, 2, 3], 2], "expected": 7 },
    { "args": [[1, 2, 1, 3, 4], 3], "expected": 3 },
    { "args": [[1, 2, 3], 1], "expected": 3 },
    { "args": [[1, 1, 1], 1], "expected": 6, "isHidden": true },
    { "args": [[1], 1], "expected": 1, "isHidden": true },
    { "args": [[1, 2], 2], "expected": 1, "isHidden": true },
    { "args": [[1, 2, 3, 4], 4], "expected": 1, "isHidden": true },
    { "args": [[2, 1, 1, 1, 2], 1], "expected": 7, "isHidden": true }
  ]
}
```
