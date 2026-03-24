---
id: algo-85
title: Path Sum
category: Algorithm
subcategory: Trees
difficulty: Easy
pattern: DFS
companies: [Amazon, Microsoft]
timeComplexity: O(n)
spaceComplexity: O(h)
keyTakeaway: "Subtract the current node's value from targetSum as you recurse. At a leaf, check if the remaining sum is 0. This avoids passing accumulated sums."
similarProblems: [Path Sum II, Maximum Depth of Binary Tree, Binary Tree Maximum Path Sum]
leetcodeUrl: https://leetcode.com/problems/path-sum/
---

Given the `root` of a binary tree and an integer `targetSum`, return `true` if the tree has a root-to-leaf path such that adding up all the values along the path equals `targetSum`. A leaf is a node with no children.

## Examples

**Input:** root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22
**Output:** true
**Explanation:** The path 5 → 4 → 11 → 2 sums to 22.

**Input:** root = [1,2,3], targetSum = 5
**Output:** false

## Solution

```js
function hasPathSum(root, targetSum) {
  if (!root) return false;

  targetSum -= root.val;

  if (!root.left && !root.right) {
    return targetSum === 0;
  }

  return hasPathSum(root.left, targetSum) || hasPathSum(root.right, targetSum);
}
```

## Explanation

APPROACH: DFS with Remaining Sum

Subtract each node's value from targetSum. At a leaf, check if remainder is 0.

```
targetSum = 22

        5           remain: 22-5=17
       / \
      4   8         left: 17-4=13
     /
    11              13-11=2
   / \
  7   2             7: 2-7=-5 ✗  |  2: 2-2=0 ✓ leaf!

Path found: 5→4→11→2 = 22
```

WHY THIS WORKS:
- Subtracting is equivalent to adding values along the path
- Must check leaf nodes only (not null children of non-leaf nodes)
- DFS explores all root-to-leaf paths in O(n)

## TestConfig
```json
{
  "functionName": "hasPathSum",
  "argTypes": [{ "type": "tree" }, { "type": "primitive" }],
  "returnType": { "type": "primitive" },
  "testCases": [
    { "args": [[5,4,8,11,null,13,4,7,2,null,null,null,1], 22], "expected": true },
    { "args": [[1,2,3], 5], "expected": false },
    { "args": [[], 0], "expected": false },
    { "args": [[1], 1], "expected": true, "isHidden": true },
    { "args": [[1], 0], "expected": false, "isHidden": true },
    { "args": [[1,2], 3], "expected": true, "isHidden": true },
    { "args": [[1,2], 1], "expected": false, "isHidden": true },
    { "args": [[-2,null,-3], -5], "expected": true, "isHidden": true }
  ]
}
```
