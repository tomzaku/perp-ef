---
id: algo-88
title: Kth Smallest Element in a BST
category: Algorithm
subcategory: Trees
difficulty: Medium
pattern: DFS
companies: [Amazon, Meta, Google]
timeComplexity: O(h + k)
spaceComplexity: O(h)
keyTakeaway: "In-order traversal of a BST visits nodes in ascending order. Count nodes during traversal and stop at the k-th one. No need to collect all values."
similarProblems: [Validate Binary Search Tree, Binary Tree Inorder Traversal, Invert Binary Tree]
leetcodeUrl: https://leetcode.com/problems/kth-smallest-element-in-a-bst/
---

Given the `root` of a binary search tree, and an integer `k`, return the `k`-th smallest value (1-indexed) of all the values of the nodes in the tree.

## Examples

**Input:** root = [3,1,4,null,2], k = 1
**Output:** 1
**Explanation:** In-order: [1, 2, 3, 4]. The 1st smallest is 1.

**Input:** root = [5,3,6,2,4,null,null,1], k = 3
**Output:** 3
**Explanation:** In-order: [1, 2, 3, 4, 5, 6]. The 3rd smallest is 3.

## Solution

```js
function kthSmallest(root, k) {
  let count = 0;
  let result = -1;

  function inorder(node) {
    if (!node || result !== -1) return;
    inorder(node.left);
    count++;
    if (count === k) {
      result = node.val;
      return;
    }
    inorder(node.right);
  }

  inorder(root);
  return result;
}
```

## Explanation

APPROACH: In-order DFS with Early Termination

BST in-order = sorted order. Count during traversal and stop at k.

```
        5
       / \
      3   6
     / \
    2   4
   /
  1

In-order traversal: 1 → 2 → 3 → 4 → 5 → 6

k = 3:
  Visit 1 (count=1)
  Visit 2 (count=2)
  Visit 3 (count=3) ← k! return 3

Early termination: don't visit 4, 5, 6
```

WHY THIS WORKS:
- BST property: left < root < right
- In-order (left, root, right) visits in ascending order
- Stop as soon as count reaches k — O(h + k) not O(n)

## TestConfig
```json
{
  "functionName": "kthSmallest",
  "argTypes": [{ "type": "tree" }, { "type": "primitive" }],
  "returnType": { "type": "primitive" },
  "testCases": [
    { "args": [[3,1,4,null,2], 1], "expected": 1 },
    { "args": [[5,3,6,2,4,null,null,1], 3], "expected": 3 },
    { "args": [[1], 1], "expected": 1 },
    { "args": [[3,1,4,null,2], 2], "expected": 2, "isHidden": true },
    { "args": [[3,1,4,null,2], 3], "expected": 3, "isHidden": true },
    { "args": [[3,1,4,null,2], 4], "expected": 4, "isHidden": true },
    { "args": [[5,3,6,2,4,null,null,1], 6], "expected": 6, "isHidden": true },
    { "args": [[2,1,3], 2], "expected": 2, "isHidden": true }
  ]
}
```
