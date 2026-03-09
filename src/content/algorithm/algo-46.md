---
id: algo-46
title: Lowest Common Ancestor of a Binary Tree
category: Algorithm
subcategory: BFS / DFS
difficulty: Medium
pattern: DFS
companies: [Meta, Amazon, Google]
timeComplexity: O(n)
spaceComplexity: O(h) where h is the height of the tree
keyTakeaway: "Post-order DFS: if both left and right subtrees return non-null, the current node is the LCA. If only one side returns non-null, propagate it up. This elegant recursion handles all cases including when one node is an ancestor of the other."
similarProblems: 
  - Lowest Common Ancestor of a BST
  - Lowest Common Ancestor of a Binary Tree II
  - Smallest Common Region
leetcodeUrl: https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/
---

Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree. The LCA is defined as the lowest node in the tree that has both `p` and `q` as descendants (where a node can be a descendant of itself).

## Examples

**Input:** root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
**Output:** 3
**Explanation:** The LCA of nodes 5 and 1 is 3.

**Input:** root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4
**Output:** 5
**Explanation:** The LCA of nodes 5 and 4 is 5, since a node can be a descendant of itself.


## Solution

```js
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  if (left && right) return root; // p and q are in different subtrees
  return left || right; // both are in the same subtree
}
```

## Diagram

```mermaid
graph TD
  A[Build Trie for addWord] --> B{search with dots}
  B --> C[Walk each char]
  C --> D{Char is dot?}
  D -->|Yes| E[Try all 26 children recursively]
  D -->|No| F{Char in children?}
  F -->|Yes| G[Move to child node]
  F -->|No| H[Return false]
  E --> I{Any branch returns true?}
  I -->|Yes| J[Return true]
  I -->|No| H
  G --> K{End of word and isEnd?}
  K -->|Yes| J
```
