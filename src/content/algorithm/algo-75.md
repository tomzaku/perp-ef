---
id: algo-75
title: Longest Substring with At Most K Distinct Characters
category: Algorithm
subcategory: Sliding Window
difficulty: Medium
pattern: Sliding Window
companies: [Google, Meta, Amazon]
timeComplexity: O(n)
spaceComplexity: O(k)
keyTakeaway: "Variable-size sliding window with a frequency map. Expand the right pointer, and shrink from the left when the constraint is violated."
similarProblems: [Longest Substring Without Repeating Characters, Fruit Into Baskets, Longest Repeating Character Replacement]
leetcodeUrl: https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/
---

Given a string `s` and an integer `k`, return the length of the longest substring of `s` that contains at most `k` distinct characters.

## Examples

**Input:** s = "eceba", k = 2
**Output:** 3
**Explanation:** The substring "ece" has 2 distinct characters and length 3.

**Input:** s = "aa", k = 1
**Output:** 2
**Explanation:** The entire string "aa" has 1 distinct character.

## Solution

```js
function lengthOfLongestSubstringKDistinct(s, k) {
  const freq = new Map();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    freq.set(s[right], (freq.get(s[right]) || 0) + 1);

    while (freq.size > k) {
      const leftChar = s[left];
      freq.set(leftChar, freq.get(leftChar) - 1);
      if (freq.get(leftChar) === 0) freq.delete(leftChar);
      left++;
    }

    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}
```

## Explanation

APPROACH: Variable-Size Sliding Window + HashMap

Expand right pointer. When distinct count exceeds k, shrink from left until constraint is met.

```
s = "eceba", k = 2

Step   L   R   char   freq           distinct   window   maxLen
────   ─   ─   ────   ────           ────────   ──────   ──────
 1     0   0   'e'    {e:1}            1        "e"        1
 2     0   1   'c'    {e:1,c:1}        2        "ec"       2
 3     0   2   'e'    {e:2,c:1}        2        "ece"      3
 4     0   3   'b'    {e:2,c:1,b:1}    3 > k!   shrink...
       1   3          {e:1,c:1,b:1}    3 > k!   shrink...
       2   3          {e:1,b:1}        2        "eb"       3
 5     2   4   'a'    {e:1,b:1,a:1}    3 > k!   shrink...
       3   4          {b:1,a:1}        2        "ba"       3

Result: 3
```

WHY THIS WORKS:
- Right pointer explores all possible end positions
- Left pointer ensures the window always has ≤ k distinct characters
- Each character is added and removed at most once → O(n)

## TestConfig
```json
{
  "functionName": "lengthOfLongestSubstringKDistinct",
  "testCases": [
    { "args": ["eceba", 2], "expected": 3 },
    { "args": ["aa", 1], "expected": 2 },
    { "args": ["a", 1], "expected": 1 },
    { "args": ["aabbcc", 2], "expected": 4, "isHidden": true },
    { "args": ["abcabcabc", 3], "expected": 9, "isHidden": true },
    { "args": ["abcdef", 1], "expected": 1, "isHidden": true },
    { "args": ["aaabbb", 3], "expected": 6, "isHidden": true },
    { "args": ["abaccc", 2], "expected": 4, "isHidden": true }
  ]
}
```
