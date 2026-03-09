---
id: algo-43
title: Symmetric Tree
category: Algorithm
subcategory: BFS / DFS
difficulty: Easy
pattern: DFS
companies: [Amazon, Microsoft]
timeComplexity: O(n)
spaceComplexity: O(h) where h is the height of the tree
keyTakeaway: Recursively compare left.left with right.right and left.right with right.left. The mirror check requires swapping the comparison direction at each level.
similarProblems: [Same Tree, Invert Binary Tree, Subtree of Another Tree]
leetcodeUrl: https://leetcode.com/problems/symmetric-tree/
---

Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).

## Examples

**Input:** root = [1,2,2,3,4,4,3]
**Output:** true
**Explanation:** The tree is symmetric because the left subtree mirrors the right subtree.

**Input:** root = [1,2,2,null,3,null,3]
**Output:** false
**Explanation:** Both left subtrees have node 3 on the same side, so the tree is not a mirror image.


## Solution

```js
function isSymmetric(root) {
  if (!root) return true;

  function isMirror(left, right) {
    if (!left && !right) return true;
    if (!left || !right) return false;
    return (
      left.val === right.val &&
      isMirror(left.left, right.right) &&
      isMirror(left.right, right.left)
    );
  }

  return isMirror(root.left, root.right);
}
```

## Diagram

```mermaid
graph TD
  A[Build Trie from all words] --> B[For each cell in grid]
  B --> C[Start DFS with Trie root]
  C --> D{Current char in Trie children?}
  D -->|Yes| E[Move to Trie child, mark visited]
  E --> F{Is complete word?}
  F -->|Yes| G[Add to results]
  F -->|No| H[Continue DFS 4 directions]
  G --> H
  H --> I[Unmark visited - backtrack]
  D -->|No| J[Return]
```

## TestConfig
```json
{
  "functionName": "isSymmetric",
  "argTypes": [
    "tree"
  ],
  "testCases": [
    {
      "args": [
        [
          1,
          2,
          2,
          3,
          4,
          4,
          3
        ]
      ],
      "expected": true
    },
    {
      "args": [
        [
          1,
          2,
          2,
          null,
          3,
          null,
          3
        ]
      ],
      "expected": false
    },
    {
      "args": [
        [
          1
        ]
      ],
      "expected": true
    },
    {
      "args": [
        []
      ],
      "expected": true,
      "isHidden": true
    },
    {
      "args": [
        [
          1,
          2,
          2
        ]
      ],
      "expected": true,
      "isHidden": true
    },
    {
      "args": [
        [
          1,
          2,
          3
        ]
      ],
      "expected": false,
      "isHidden": true
    },
    {
      "args": [
        [
          1,
          2,
          2,
          null,
          3,
          3
        ]
      ],
      "expected": true,
      "isHidden": true
    },
    {
      "args": [
        [
          1,
          2,
          2,
          3,
          null,
          null,
          3
        ]
      ],
      "expected": true,
      "isHidden": true
    },
    {
      "args": [
        [
          1,
          2,
          2,
          3,
          4,
          4,
          3,
          5,
          6,
          7,
          8,
          8,
          7,
          6,
          5
        ]
      ],
      "expected": true,
      "isHidden": true
    },
    {
      "args": [
        [
          1,
          2,
          2,
          3,
          null,
          3
        ]
      ],
      "expected": false,
      "isHidden": true
    }
  ]
}
```
