---
id: algo-80
title: Decode String
category: Algorithm
subcategory: Stack
difficulty: Medium
pattern: Stack
companies: [Google, Amazon, Bloomberg]
timeComplexity: O(n * maxK)
spaceComplexity: O(n)
keyTakeaway: "Use two stacks (or a stack of pairs) to handle nested brackets. When you see '[', push current state. When you see ']', pop and repeat the accumulated string."
similarProblems: [Valid Parentheses, Evaluate Reverse Polish Notation]
leetcodeUrl: https://leetcode.com/problems/decode-string/
---

Given an encoded string, return its decoded string. The encoding rule is: `k[encoded_string]`, where the `encoded_string` inside the square brackets is repeated exactly `k` times. You may assume the input is always valid.

## Examples

**Input:** s = "3[a]2[bc]"
**Output:** "aaabcbc"
**Explanation:** "a" repeated 3 times + "bc" repeated 2 times.

**Input:** s = "3[a2[c]]"
**Output:** "accaccacc"
**Explanation:** Inner "2[c]" = "cc", then "a" + "cc" = "acc", repeated 3 times.

**Input:** s = "2[abc]3[cd]ef"
**Output:** "abcabccdcdcdef"

## Solution

```js
function decodeString(s) {
  const countStack = [];
  const strStack = [];
  let current = '';
  let num = 0;

  for (const ch of s) {
    if (ch >= '0' && ch <= '9') {
      num = num * 10 + Number(ch);
    } else if (ch === '[') {
      countStack.push(num);
      strStack.push(current);
      current = '';
      num = 0;
    } else if (ch === ']') {
      const repeatCount = countStack.pop();
      const prev = strStack.pop();
      current = prev + current.repeat(repeatCount);
    } else {
      current += ch;
    }
  }

  return current;
}
```

## Explanation

APPROACH: Two Stacks (count + string)

Push the current state when entering `[`. Pop and repeat when hitting `]`.

```
s = "3[a2[c]]"

Char  num  countStack  strStack  current
────  ───  ──────────  ────────  ───────
'3'    3    []          []        ""
'['    0    [3]         [""]      ""       ← push(3, "")
'a'    0    [3]         [""]      "a"
'2'    2    [3]         [""]      "a"
'['    0    [3,2]       ["","a"]  ""       ← push(2, "a")
'c'    0    [3,2]       ["","a"]  "c"
']'    0    [3]         [""]      "acc"    ← pop 2, "a"+"c".repeat(2)
']'    0    []          []        "accaccacc" ← pop 3, ""+"acc".repeat(3)

Result: "accaccacc"
```

WHY THIS WORKS:
- Stack naturally handles nesting: inner brackets resolve first
- countStack tracks how many times to repeat
- strStack tracks what string prefix came before the bracket

## TestConfig
```json
{
  "functionName": "decodeString",
  "testCases": [
    { "args": ["3[a]2[bc]"], "expected": "aaabcbc" },
    { "args": ["3[a2[c]]"], "expected": "accaccacc" },
    { "args": ["2[abc]3[cd]ef"], "expected": "abcabccdcdcdef" },
    { "args": ["abc"], "expected": "abc", "isHidden": true },
    { "args": ["1[a]"], "expected": "a", "isHidden": true },
    { "args": ["10[a]"], "expected": "aaaaaaaaaa", "isHidden": true },
    { "args": ["2[a2[b]]"], "expected": "abbabb", "isHidden": true },
    { "args": ["3[z]2[2[y]pq4[2[jk]e1[f]]]ef"], "expected": "zzzyypqjkjkefjkjkefjkjkefjkjkefyypqjkjkefjkjkefjkjkefjkjkefef", "isHidden": true }
  ]
}
```
