---
id: algo-74
title: Maximum Sum Subarray of Size K
category: Algorithm
subcategory: Sliding Window
difficulty: Easy
pattern: Sliding Window
companies: [Amazon, Microsoft]
timeComplexity: O(n)
spaceComplexity: O(1)
keyTakeaway: "The most basic fixed-size sliding window. Maintain a running sum and slide by adding the new element and removing the old one."
similarProblems: [Maximum Average Subarray I, Minimum Size Subarray Sum]
---

Given an array of integers `nums` and an integer `k`, find the maximum sum of any contiguous subarray of size `k`.

## Examples

**Input:** nums = [2, 1, 5, 1, 3, 2], k = 3
**Output:** 9
**Explanation:** Subarray [5, 1, 3] has the maximum sum of 9.

**Input:** nums = [2, 3, 4, 1, 5], k = 2
**Output:** 7
**Explanation:** Subarray [3, 4] has the maximum sum of 7.

## Brute Force

```js
function maxSubarraySum(nums, k) {
  let max = -Infinity;
  for (let i = 0; i <= nums.length - k; i++) {
    let sum = 0;
    for (let j = i; j < i + k; j++) {
      sum += nums[j];
    }
    max = Math.max(max, sum);
  }
  return max;
}
```

## Brute Force Explanation

Check every window of size k by summing k elements each time. O(n*k) time.

## Solution

```js
function maxSubarraySum(nums, k) {
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += nums[i];
  }

  let maxSum = windowSum;
  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i] - nums[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}
```

## Explanation

APPROACH: Fixed-Size Sliding Window

Compute the sum of the first window. Then slide: add the incoming element, subtract the outgoing element.

```
nums = [2, 1, 5, 1, 3, 2], k = 3

Window        Sum   Max
──────        ───   ───
[2, 1, 5]      8     8     initial window
[1, 5, 1]      7     8     +1 -2
[5, 1, 3]      9     9     +3 -1  ← maximum
[1, 3, 2]      6     9     +2 -5
```

WHY THIS WORKS:
- Each slide is O(1): one addition, one subtraction
- Total: O(n) instead of O(n*k)

## TestConfig
```json
{
  "functionName": "maxSubarraySum",
  "testCases": [
    { "args": [[2, 1, 5, 1, 3, 2], 3], "expected": 9 },
    { "args": [[2, 3, 4, 1, 5], 2], "expected": 7 },
    { "args": [[1, 2, 3, 4, 5], 1], "expected": 5 },
    { "args": [[1, 2, 3, 4, 5], 5], "expected": 15, "isHidden": true },
    { "args": [[5], 1], "expected": 5, "isHidden": true },
    { "args": [[-1, -2, -3, -4], 2], "expected": -3, "isHidden": true },
    { "args": [[1, 9, -1, -2, 7, 3, -1, 2], 4], "expected": 11, "isHidden": true },
    { "args": [[4, 4, 4, 4, 4], 3], "expected": 12, "isHidden": true }
  ]
}
```
