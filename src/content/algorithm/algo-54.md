---
id: algo-54
title: Subarray Sum Equals K
category: Algorithm
subcategory: "Arrays & Hashing"
difficulty: Medium
pattern: Prefix Sum + Hash Map
companies: [Meta, Google, Amazon, Microsoft]
timeComplexity: O(n)
spaceComplexity: O(n)
keyTakeaway: Use a prefix sum with a hash map to count how many previous prefix sums equal (currentSum - k), giving O(n) time instead of O(n²) brute force.
similarProblems: [Two Sum, Continuous Subarray Sum, Subarray Sums Divisible by K]
leetcodeUrl: https://leetcode.com/problems/subarray-sum-equals-k/
---

Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals to `k`.

A subarray is a contiguous non-empty sequence of elements within an array.

## Examples

**Input:** nums = [1,1,1], k = 2
**Output:** 2
**Explanation:** The subarrays [1,1] starting at index 0 and [1,1] starting at index 1 both sum to 2.

**Input:** nums = [1,2,3], k = 3
**Output:** 2
**Explanation:** The subarrays [1,2] and [3] both sum to 3.

**Input:** nums = [1,-1,0], k = 0
**Output:** 3
**Explanation:** The subarrays [1,-1], [1,-1,0], and [0] all sum to 0.

## Brute Force

```js
function subarraySumBrute(nums, k) {
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      if (sum === k) count++;
    }
  }
  return count;
}
```

### Brute Force Explanation

The brute force tries every possible subarray by fixing a start index `i` and expanding the end index `j`, accumulating the sum. When the sum equals `k`, we increment the count. This runs in O(n²) time and O(1) space.

## Solution

```js
function subarraySum(nums, k) {
  const prefixCount = new Map();
  prefixCount.set(0, 1);
  let sum = 0;
  let count = 0;

  for (const num of nums) {
    sum += num;
    if (prefixCount.has(sum - k)) {
      count += prefixCount.get(sum - k);
    }
    prefixCount.set(sum, (prefixCount.get(sum) || 0) + 1);
  }

  return count;
}
```

## Explanation

APPROACH: Prefix Sum + Hash Map

The key insight is that if `prefixSum[j] - prefixSum[i] === k`, then the subarray from index `i+1` to `j` sums to `k`. So for each position, we need to count how many earlier prefix sums equal `currentSum - k`.

We maintain a running prefix sum and a hash map that counts how many times each prefix sum has occurred. For each new prefix sum, we check how many times `sum - k` has appeared before — each occurrence represents a valid subarray ending at the current index.

```
For each num:
  sum += num
  count += prefixCount[sum - k]   // # of subarrays ending here that sum to k
  prefixCount[sum]++               // record this prefix sum
```

WALKTHROUGH with nums = [1, 1, 1], k = 2:

```
Step   num   sum   sum-k   prefixCount before       found   count
────   ───   ───   ─────   ─────────────────────   ─────   ─────
 1      1     1     -1     {0:1}                     0       0
 2      1     2      0     {0:1, 1:1}                1       1
 3      1     3      1     {0:1, 1:1, 2:1}           1       2
```

WHY THIS WORKS:
- We initialize `prefixCount = {0: 1}` because a prefix sum of 0 means a subarray from the start
- Each element is visited once, so O(n) time
- The map stores at most n+1 entries, so O(n) space
- Works correctly with negative numbers (unlike sliding window)

## Diagram

```mermaid
graph TD
  A[Start: nums array, k] --> B[Init: sum=0, count=0, map={0:1}]
  B --> C[For each num in nums]
  C --> D[sum += num]
  D --> E{sum - k in map?}
  E -->|Yes| F[count += map.get sum - k]
  E -->|No| G[Skip]
  F --> H[Update map: sum count++]
  G --> H
  H --> C
  C -->|Done| I[Return count]
```

## TestConfig
```json
{
  "functionName": "subarraySum",
  "testCases": [
    {
      "args": [
        [1, 1, 1],
        2
      ],
      "expected": 2
    },
    {
      "args": [
        [1, 2, 3],
        3
      ],
      "expected": 2
    },
    {
      "args": [
        [1, -1, 0],
        0
      ],
      "expected": 3
    },
    {
      "args": [
        [1],
        1
      ],
      "expected": 1
    },
    {
      "args": [
        [1],
        0
      ],
      "expected": 0,
      "isHidden": true
    },
    {
      "args": [
        [0, 0, 0, 0, 0],
        0
      ],
      "expected": 15,
      "isHidden": true
    },
    {
      "args": [
        [3, 4, 7, 2, -3, 1, 4, 2],
        7
      ],
      "expected": 4,
      "isHidden": true
    },
    {
      "args": [
        [-1, -1, 1],
        0
      ],
      "expected": 1,
      "isHidden": true
    },
    {
      "args": [
        [1, 2, 3, -3, -2],
        0
      ],
      "expected": 2,
      "isHidden": true
    },
    {
      "args": [
        [100],
        100
      ],
      "expected": 1,
      "isHidden": true
    }
  ]
}
```
