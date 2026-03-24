---
id: algo-79
title: Evaluate Reverse Polish Notation
category: Algorithm
subcategory: Stack
difficulty: Medium
pattern: Stack
companies: [Amazon, Google, Microsoft]
timeComplexity: O(n)
spaceComplexity: O(n)
keyTakeaway: "Process tokens left to right. Push numbers onto the stack. When you hit an operator, pop two operands, apply the operator, and push the result back."
similarProblems: [Valid Parentheses, Basic Calculator]
leetcodeUrl: https://leetcode.com/problems/evaluate-reverse-polish-notation/
---

You are given an array of strings `tokens` that represents an arithmetic expression in Reverse Polish Notation (postfix notation). Evaluate the expression and return the result as an integer. Valid operators are `+`, `-`, `*`, and `/`. Division truncates toward zero.

## Examples

**Input:** tokens = ["2","1","+","3","*"]
**Output:** 9
**Explanation:** ((2 + 1) * 3) = 9

**Input:** tokens = ["4","13","5","/","+"]
**Output:** 6
**Explanation:** (4 + (13 / 5)) = (4 + 2) = 6

**Input:** tokens = ["10","6","9","3","+","-11","*","/","*","17","+","5","+"]
**Output:** 22

## Solution

```js
function evalRPN(tokens) {
  const stack = [];
  const ops = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => Math.trunc(a / b),
  };

  for (const token of tokens) {
    if (token in ops) {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(ops[token](a, b));
    } else {
      stack.push(Number(token));
    }
  }

  return stack[0];
}
```

## Explanation

APPROACH: Stack-based evaluation

Numbers go on the stack. Operators pop two values, compute, and push the result.

```
tokens = ["2", "1", "+", "3", "*"]

Token   Action          Stack
─────   ──────          ─────
"2"     push 2          [2]
"1"     push 1          [2, 1]
"+"     pop 1,2 → 2+1   [3]
"3"     push 3          [3, 3]
"*"     pop 3,3 → 3*3   [9]

Result: 9
```

WHY THIS WORKS:
- RPN guarantees operands appear before their operator
- The stack naturally preserves correct operation order
- No parentheses needed — the notation is unambiguous

## TestConfig
```json
{
  "functionName": "evalRPN",
  "testCases": [
    { "args": [["2","1","+","3","*"]], "expected": 9 },
    { "args": [["4","13","5","/","+"]], "expected": 6 },
    { "args": [["10","6","9","3","+","-11","*","/","*","17","+","5","+"]], "expected": 22 },
    { "args": [["3"]], "expected": 3, "isHidden": true },
    { "args": [["1","2","+"]], "expected": 3, "isHidden": true },
    { "args": [["6","3","/"]], "expected": 2, "isHidden": true },
    { "args": [["7","2","-"]], "expected": 5, "isHidden": true },
    { "args": [["10","3","/"]], "expected": 3, "isHidden": true }
  ]
}
```
