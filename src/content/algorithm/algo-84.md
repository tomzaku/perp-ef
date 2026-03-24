---
id: algo-84
title: Symmetric Tree
category: Algorithm
subcategory: Trees
difficulty: Easy
pattern: DFS
companies: [Amazon, Microsoft, Bloomberg]
timeComplexity: O(n)
spaceComplexity: O(h)
keyTakeaway: "A tree is symmetric if the left subtree is a mirror of the right subtree. Compare left.left with right.right and left.right with right.left recursively."
similarProblems: [Same Tree, Invert Binary Tree, Maximum Depth of Binary Tree]
leetcodeUrl: https://leetcode.com/problems/symmetric-tree/
---

Given the `root` of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).

## Examples

**Input:** root = [1,2,2,3,4,4,3]
**Output:** true
**Explanation:** The tree is symmetric around the center.

**Input:** root = [1,2,2,null,3,null,3]
**Output:** false
**Explanation:** The right subtree has 3 on the right, not mirrored.

## Solution

```js
function isSymmetric(root) {
  if (!root) return true;
  return isMirror(root.left, root.right);
}

function isMirror(left, right) {
  if (!left && !right) return true;
  if (!left || !right) return false;
  return (
    left.val === right.val &&
    isMirror(left.left, right.right) &&
    isMirror(left.right, right.left)
  );
}
```

## Explanation

APPROACH: Recursive Mirror Check

Compare two subtrees: they are mirrors if their roots match, and the left of one mirrors the right of the other.

```
        1
       / \
      2   2       ← same value
     / \ / \
    3  4 4  3     ← left.left=3 matches right.right=3
                    left.right=4 matches right.left=4

isMirror(2, 2) → val match ✓
  isMirror(3, 3) → val match ✓, both leaves → true
  isMirror(4, 4) → val match ✓, both leaves → true
→ true
```

WHY THIS WORKS:
- Mirror symmetry means: left.left ↔ right.right AND left.right ↔ right.left
- Base cases: both null = symmetric, one null = not symmetric
- Visits each node once → O(n)

## TestConfig
```json
{
  "functionName": "isSymmetric",
  "argTypes": [{ "type": "tree" }],
  "returnType": { "type": "primitive" },
  "testCases": [
    { "args": [[1,2,2,3,4,4,3]], "expected": true },
    { "args": [[1,2,2,null,3,null,3]], "expected": false },
    { "args": [[1]], "expected": true },
    { "args": [[1,2,2]], "expected": true, "isHidden": true },
    { "args": [[1,2,3]], "expected": false, "isHidden": true },
    { "args": [[]], "expected": true, "isHidden": true },
    { "args": [[1,2,2,null,3,3,null]], "expected": true, "isHidden": true }
  ]
}
```
