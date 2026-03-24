---
id: algo-77
title: Minimum Window Containing All Characters
category: Algorithm
subcategory: Sliding Window
difficulty: Hard
pattern: Sliding Window
companies: [Meta, Google, Amazon, Uber]
timeComplexity: O(n + m)
spaceComplexity: O(m)
keyTakeaway: "Use two frequency maps and a 'formed' counter to track how many unique characters meet the required count. This avoids comparing entire maps on each step."
similarProblems: [Minimum Window Substring, Permutation in String, Longest Substring Without Repeating Characters]
---

Given two strings `s` and `t`, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string `""`.

## Examples

**Input:** s = "ADOBECODEBANC", t = "ABC"
**Output:** "BANC"
**Explanation:** "BANC" is the smallest window containing 'A', 'B', and 'C'.

**Input:** s = "a", t = "a"
**Output:** "a"

**Input:** s = "a", t = "aa"
**Output:** ""
**Explanation:** Both 'a's must be included, but s only has one 'a'.

## Solution

```js
function minWindow(s, t) {
  if (t.length > s.length) return "";

  const need = new Map();
  for (const c of t) {
    need.set(c, (need.get(c) || 0) + 1);
  }

  const window = new Map();
  let have = 0;
  const required = need.size;
  let left = 0;
  let minLen = Infinity;
  let minStart = 0;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    window.set(c, (window.get(c) || 0) + 1);

    if (need.has(c) && window.get(c) === need.get(c)) {
      have++;
    }

    while (have === required) {
      const len = right - left + 1;
      if (len < minLen) {
        minLen = len;
        minStart = left;
      }

      const leftChar = s[left];
      window.set(leftChar, window.get(leftChar) - 1);
      if (need.has(leftChar) && window.get(leftChar) < need.get(leftChar)) {
        have--;
      }
      left++;
    }
  }

  return minLen === Infinity ? "" : s.slice(minStart, minStart + minLen);
}
```

## Explanation

APPROACH: Sliding Window + Two Frequency Maps

Track `need` (required character counts from t) and `window` (current counts). A `have` counter tracks how many characters fully satisfy their requirement.

```
s = "ADOBECODEBANC", t = "ABC"

need = {A:1, B:1, C:1}, required = 3

R   char   window                have   valid?   shrink result
─   ────   ──────                ────   ──────   ─────────────
0   A      {A:1}                 1      no
1   D      {A:1,D:1}             1      no
2   O      {A:1,D:1,O:1}         1      no
3   B      {A:1,D:1,O:1,B:1}     2      no
4   E      {...E:1}              2      no
5   C      {...C:1}              3      yes!     "ADOBEC" len=6 → min
     shrink L=1: remove A → have=2
6   O      {...O:2}              2      no
...
10  A      {...A:1}              3      yes!     "CODEBA" → nah, keep shrinking
     → "EBANC" → "BANC" len=4 → min!

Result: "BANC"
```

WHY THIS WORKS:
- `have` counter avoids O(m) map comparison each step
- Right pointer finds valid windows; left pointer minimizes them
- Each character visited at most twice → O(n + m)

## TestConfig
```json
{
  "functionName": "minWindow",
  "testCases": [
    { "args": ["ADOBECODEBANC", "ABC"], "expected": "BANC" },
    { "args": ["a", "a"], "expected": "a" },
    { "args": ["a", "aa"], "expected": "" },
    { "args": ["ab", "b"], "expected": "b", "isHidden": true },
    { "args": ["abc", "abc"], "expected": "abc", "isHidden": true },
    { "args": ["bba", "ab"], "expected": "ba", "isHidden": true },
    { "args": ["aaaaaaaaab", "ab"], "expected": "ab", "isHidden": true },
    { "args": ["cabwefgewcwaefgcf", "cae"], "expected": "cwae", "isHidden": true }
  ]
}
```
