---
id: algo-87
title: Binary Tree Right Side View
category: Algorithm
subcategory: Trees
difficulty: Medium
pattern: BFS
companies: [Meta, Amazon, Bloomberg]
timeComplexity: O(n)
spaceComplexity: O(w) where w is the max width
keyTakeaway: "BFS level by level. The last node at each level is visible from the right side. Alternatively, DFS right-first and take the first node at each new depth."
similarProblems: [Binary Tree Level Order Traversal, Binary Tree Zigzag Level Order Traversal]
leetcodeUrl: https://leetcode.com/problems/binary-tree-right-side-view/
---

Given the `root` of a binary tree, imagine yourself standing on the right side of it. Return the values of the nodes you can see ordered from top to bottom.

## Examples

**Input:** root = [1,2,3,null,5,null,4]
**Output:** [1,3,4]
**Explanation:** Looking from the right: level 0 → 1, level 1 → 3, level 2 → 4.

**Input:** root = [1,null,3]
**Output:** [1,3]

**Input:** root = []
**Output:** []

## Solution

```js
function rightSideView(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      if (i === levelSize - 1) {
        result.push(node.val);
      }
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }

  return result;
}
```

## Explanation

APPROACH: BFS Level-by-Level

Process each level as a batch. The last node in each level is the rightmost visible node.

```
        1          → right view: 1
       / \
      2   3        → right view: 3
       \   \
        5   4      → right view: 4

BFS queue processing:
Level 0: [1]           → last = 1, add children → [2, 3]
Level 1: [2, 3]        → last = 3, add children → [5, 4]
Level 2: [5, 4]        → last = 4

Result: [1, 3, 4]
```

WHY THIS WORKS:
- BFS naturally groups nodes by level
- The last node at each level is the rightmost
- Handles unbalanced trees correctly (left-only branches still visible if no right node exists at that level)

## TestConfig
```json
{
  "functionName": "rightSideView",
  "argTypes": [{ "type": "tree" }],
  "returnType": { "type": "array" },
  "testCases": [
    { "args": [[1,2,3,null,5,null,4]], "expected": [1,3,4] },
    { "args": [[1,null,3]], "expected": [1,3] },
    { "args": [[]], "expected": [] },
    { "args": [[1]], "expected": [1], "isHidden": true },
    { "args": [[1,2]], "expected": [1,2], "isHidden": true },
    { "args": [[1,2,3,4]], "expected": [1,3,4], "isHidden": true },
    { "args": [[1,2,3,null,5,null,4,6]], "expected": [1,3,4,6], "isHidden": true }
  ]
}
```
