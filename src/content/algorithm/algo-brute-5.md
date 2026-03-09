---
id: algo-brute-5
title: Generate Parentheses
category: Algorithm
subcategory: Brute Force
difficulty: Medium
pattern: Backtracking
companies: [Amazon, Google, Meta]
timeComplexity: O(4^n / sqrt(n)) — the nth Catalan number
spaceComplexity: O(n)
keyTakeaway: "Constrained brute force: you can add \"(\" if open < n, and \")\" only if close < open. These two rules prune invalid combinations, generating only valid parentheses without post-filtering."
similarProblems: [Letter Combinations, Valid Parentheses, Combination Sum]
leetcodeUrl: https://leetcode.com/problems/generate-parentheses/
---

Given `n` pairs of parentheses, write a function to generate all combinations of well-formed parentheses.

## Examples

**Input:** n = 3
**Output:** ["((()))","(()())","(())()","()(())","()()()"]
**Explanation:** There are exactly 5 (the 3rd Catalan number) ways to arrange 3 pairs of valid parentheses.

**Input:** n = 1
**Output:** ["()"]
**Explanation:** With only one pair, the sole valid arrangement is "()".


## Solution

```js
function generateParenthesis(n) {
  const result = [];

  function backtrack(current, open, close) {
    if (current.length === 2 * n) {
      result.push(current);
      return;
    }
    if (open < n) {
      backtrack(current + '(', open + 1, close);
    }
    if (close < open) {
      backtrack(current + ')', open, close + 1);
    }
  }

  backtrack('', 0, 0);
  return result;
}
```

## Explanation

APPROACH: Constrained Backtracking — Only Valid Parentheses

Two rules prune the tree: (1) add "(" if open < n, (2) add ")" only if close < open.

```
n = 3

                    ""
             /              \
          "("               (close < open? No → prune)
        /       \
     "(("       "()"
    /    \      /    \
  "((("  "(()" "()(""  "()()"?
   |      / \    |      close<open? No
"((()" "(()(" "(())"
   |     |      |
"((())" "(()(" "(())(""
   |     |      |
"((()))" "(()())" "(())()"
                    ...→ "()(())" "()()()"

All valid results for n=3:
  ((()))  (()())  (())()  ()(())  ()()()

Total: C(n) = Catalan number = (2n)! / ((n+1)! × n!)
  C(3) = 5, C(4) = 14
```

KEY: The constraint "close < open" ensures we never have more closing than opening parens at any point, guaranteeing validity without post-filtering.

## Diagram

```mermaid
graph TD
  A[Start with empty string] --> B{Check counts}
  B --> C{open count < n?}
  C -->|Yes| D[Add open paren]
  D --> E[Recurse]
  B --> F{close count < open count?}
  F -->|Yes| G[Add close paren]
  G --> H[Recurse]
  E --> B
  H --> B
  B --> I{Length equals 2n?}
  I -->|Yes| J[Add to results]
```

## TestConfig
```json
{
  "functionName": "generateParenthesis",
  "compareType": "setEqual",
  "testCases": [
    {
      "args": [
        3
      ],
      "expected": [
        "((()))",
        "(()())",
        "(())()",
        "()(())",
        "()()()"
      ]
    },
    {
      "args": [
        1
      ],
      "expected": [
        "()"
      ]
    },
    {
      "args": [
        2
      ],
      "expected": [
        "(())",
        "()()"
      ]
    },
    {
      "args": [
        4
      ],
      "expected": [
        "(((())))",
        "((()()))",
        "((())())",
        "((()))()",
        "(()(()))",
        "(()()())",
        "(()())()",
        "(())(())",
        "(())()()",
        "()((()))",
        "()(()())",
        "()(())()",
        "()()(())",
        "()()()()"
      ]
    },
    {
      "args": [
        0
      ],
      "expected": [
        ""
      ]
    },
    {
      "args": [
        1
      ],
      "expected": [
        "()"
      ]
    },
    {
      "args": [
        2
      ],
      "expected": [
        "(())",
        "()()"
      ]
    },
    {
      "args": [
        3
      ],
      "expected": [
        "((()))",
        "(()())",
        "(())()",
        "()(())",
        "()()()"
      ]
    },
    {
      "args": [
        1
      ],
      "expected": [
        "()"
      ]
    },
    {
      "args": [
        2
      ],
      "expected": [
        "(())",
        "()()"
      ]
    }
  ]
}
```
