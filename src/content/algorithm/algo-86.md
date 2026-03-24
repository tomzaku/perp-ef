---
id: algo-86
title: Lowest Common Ancestor of a Binary Tree
category: Algorithm
subcategory: Trees
difficulty: Medium
pattern: DFS
companies: [Meta, Amazon, Google, Microsoft]
timeComplexity: O(n)
spaceComplexity: O(h)
keyTakeaway: "Post-order DFS: if the current node is p or q, return it. If both left and right subtrees return non-null, this node is the LCA. Otherwise, return whichever side is non-null."
similarProblems: [Lowest Common Ancestor of a BST, Binary Tree Maximum Path Sum]
leetcodeUrl: https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/
---

Given a binary tree, find the lowest common ancestor (LCA) of two given nodes `p` and `q`. The LCA is the lowest node that has both `p` and `q` as descendants (where a node can be a descendant of itself).

## Examples

**Input:** root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
**Output:** 3
**Explanation:** The LCA of nodes 5 and 1 is 3.

**Input:** root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4
**Output:** 5
**Explanation:** Node 5 is an ancestor of 4, and a node can be its own descendant.

## Solution

```js
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  if (left && right) return root;
  return left || right;
}
```

## Explanation

APPROACH: Post-order DFS

Search both subtrees. If p and q are found in different subtrees, the current node is the LCA. If both are in one subtree, that subtree's result bubbles up.

```
            3
           / \
          5   1
         / \ / \
        6  2 0  8
          / \
         7   4

LCA(5, 4):
  At node 3: search left→5, right→1
    At node 5: root === p → return 5
    At node 1: search left→null, right→null → return null
  left=5, right=null → return 5 (left only)

LCA(5, 1):
  At node 3: search left, right
    Left subtree returns 5 (found p)
    Right subtree returns 1 (found q)
  Both non-null → return 3 (this is the LCA!)
```

WHY THIS WORKS:
- Post-order means we process children before the parent
- If both children return a result, this node is the split point (LCA)
- If only one side returns, both nodes are in that subtree
- O(n) — each node visited once

## TestConfig
```json
{
  "functionName": "lowestCommonAncestor",
  "argTypes": [{ "type": "tree" }, { "type": "primitive" }, { "type": "primitive" }],
  "returnType": { "type": "primitive" },
  "testCases": [
    { "args": [[3,5,1,6,2,0,8,null,null,7,4], 5, 1], "expected": 3 },
    { "args": [[3,5,1,6,2,0,8,null,null,7,4], 5, 4], "expected": 5 },
    { "args": [[1,2], 1, 2], "expected": 1, "isHidden": true },
    { "args": [[3,5,1,6,2,0,8,null,null,7,4], 6, 4], "expected": 5, "isHidden": true },
    { "args": [[3,5,1,6,2,0,8,null,null,7,4], 0, 8], "expected": 1, "isHidden": true },
    { "args": [[3,5,1,6,2,0,8,null,null,7,4], 7, 8], "expected": 3, "isHidden": true }
  ]
}
```
