---
id: algo-83
title: Asteroid Collision
category: Algorithm
subcategory: Stack
difficulty: Medium
pattern: Stack
companies: [Amazon, Google, Uber]
timeComplexity: O(n)
spaceComplexity: O(n)
keyTakeaway: "Model with a stack. Only a right-moving asteroid (positive) on the stack can collide with a left-moving (negative) incoming asteroid. Compare sizes and resolve."
similarProblems: [Valid Parentheses, Daily Temperatures]
leetcodeUrl: https://leetcode.com/problems/asteroid-collision/
---

We are given an array `asteroids` of integers representing asteroids in a row. The absolute value represents size, and the sign represents direction (positive = right, negative = left). All move at the same speed. Find the state of asteroids after all collisions. If two asteroids meet, the smaller one explodes. If both are the same size, both explode. Same-direction asteroids never meet.

## Examples

**Input:** asteroids = [5,10,-5]
**Output:** [5,10]
**Explanation:** 10 and -5 collide → 10 survives. 5 and 10 never collide (same direction).

**Input:** asteroids = [8,-8]
**Output:** []
**Explanation:** Equal size, both explode.

**Input:** asteroids = [10,2,-5]
**Output:** [10]
**Explanation:** 2 and -5 collide → -5 survives. Then 10 and -5 collide → 10 survives.

## Solution

```js
function asteroidCollision(asteroids) {
  const stack = [];

  for (const ast of asteroids) {
    let alive = true;

    while (alive && ast < 0 && stack.length > 0 && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1];
      if (top < -ast) {
        stack.pop();
      } else if (top === -ast) {
        stack.pop();
        alive = false;
      } else {
        alive = false;
      }
    }

    if (alive) stack.push(ast);
  }

  return stack;
}
```

## Explanation

APPROACH: Stack Simulation

Only collision case: top of stack is positive (→) and incoming is negative (←). Compare sizes until one is destroyed or no collision.

```
asteroids = [10, 2, -5]

Ast   Stack          Collision?
───   ─────          ──────────
10    [10]           no (first element)
2     [10, 2]        no (same direction as top)
-5    top=2 > 0, -5 < 0 → collision!
      |2| < |-5| → pop 2, -5 survives
      [10]
      top=10 > 0, -5 < 0 → collision!
      |10| > |-5| → -5 destroyed
      [10]

Result: [10]
```

WHY THIS WORKS:
- Stack represents surviving asteroids from left to right
- A left-moving asteroid only collides with right-moving ones on the stack
- The while loop handles chain reactions (one asteroid destroying multiple)

## TestConfig
```json
{
  "functionName": "asteroidCollision",
  "testCases": [
    { "args": [[5, 10, -5]], "expected": [5, 10] },
    { "args": [[8, -8]], "expected": [] },
    { "args": [[10, 2, -5]], "expected": [10] },
    { "args": [[-2, -1, 1, 2]], "expected": [-2, -1, 1, 2], "isHidden": true },
    { "args": [[1, -1, -2, -2]], "expected": [-2, -2], "isHidden": true },
    { "args": [[-2, -2, 1, -2]], "expected": [-2, -2, -2], "isHidden": true },
    { "args": [[1]], "expected": [1], "isHidden": true },
    { "args": [[1, -2, 3, -4]], "expected": [-2, -4], "isHidden": true }
  ]
}
```
