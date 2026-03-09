---
slug: trees
title: Trees
icon: /\
description: "Trees are hierarchical structures where each node has zero or more children. Binary trees, binary search trees, and n-ary trees appear constantly in interviews. The two fundamental traversal strategies are depth-first search (DFS), which explores branches fully before backtracking, and breadth-first search (BFS), which processes level by level."
pattern: "DFS uses recursion (or an explicit stack) and comes in three flavors: preorder (process before children), inorder (process between left and right — gives sorted order in BST), and postorder (process after children — useful for bottom-up aggregation). BFS uses a queue and processes all nodes at the current depth before moving deeper. Many tree problems ask you to return some aggregate (height, diameter, path sum) which is elegantly solved by choosing the right traversal order."
whenToUse: [Hierarchical data traversal, Path finding, Validation (BST), Level-by-level processing, Serialization]
keyInsights: 
  - Inorder traversal of BST gives sorted order
  - "Postorder is natural for bottom-up computation (height, diameter)"
  - BFS naturally gives level-order traversal
  - "Most tree problems reduce to: what do I need from left/right subtrees?"
questionIds: [algo-27, algo-28, algo-29, algo-30]
---

## Trees

Tree problems are fundamentally about recursion. Every subtree is itself a tree, so most solutions follow a pattern: solve for the current node using solutions from its children. Mastering DFS and BFS traversals covers the majority of tree interview questions.

### Depth-First Search - DFS

DFS explores as deep as possible before backtracking. The three orderings differ only in when you process the current node:

- **Preorder** — process node, then left, then right. Used for serialization and copying trees.
- **Inorder** — process left, then node, then right. On a BST, this yields sorted order.
- **Postorder** — process left, then right, then node. Used when you need children's results first, like calculating heights or checking balance.

The recursive template is elegant: base case returns when the node is null, recursive case combines results from left and right subtrees.

### Breadth-First Search - BFS

BFS uses a queue to process nodes level by level. Initialize the queue with the root, then repeatedly dequeue a node, process it, and enqueue its children. This is the natural choice for level-order traversal, finding minimum depth, or any problem that asks about "levels."

```mermaid
flowchart TD
    R[Root] --> L[Left Subtree]
    R --> Ri[Right Subtree]
    L --> LL[Left.Left]
    L --> LR[Left.Right]
    Ri --> RL[Right.Left]
    Ri --> RR[Right.Right]
```

### BST Properties

A Binary Search Tree guarantees: left subtree values are less than the node, right subtree values are greater. This enables O(log n) search, insertion, and deletion on balanced trees. Validate a BST by passing min and max bounds down the recursion. Inorder traversal of a valid BST always produces a sorted sequence.

### Common Patterns

Return values up the tree for height, diameter, or path sums. Pass values down the tree for constraints, running sums, or path tracking. Many problems combine both directions. When the problem says "path," clarify whether it means root-to-leaf or any-node-to-any-node — the approach differs significantly.

### Complexity

DFS and BFS both visit every node once: O(n) time. DFS uses O(h) stack space where h is the height, while BFS uses O(w) queue space where w is the maximum width.

## ELI5

Imagine a family tree. The grandparent is at the top, their children are one level below, and grandchildren are the level below that. Every person is connected to exactly one parent (except the grandparent at the top — that's the **root**).

```
Family tree:

              Grandma (root)
             /              \
         Mom               Uncle
        /    \                \
      You   Sister          Cousin

Rules:
  - Grandma has no parent (she's the root)
  - Everyone else has exactly one parent
  - You can trace any path from the root downward
```

**DFS (going deep first)** is like exploring a family album one branch at a time — you look at all of Mom's side before looking at Uncle's side.

**BFS (going level by level)** is like a birthday photo where you take one layer at a time: first grandma, then all her kids, then all grandchildren.

```
The same tree, two traversal orders:

DFS (preorder):  Grandma → Mom → You → Sister → Uncle → Cousin
  (visit me, then dive into left branch, then right branch)

BFS (level-order): Grandma → Mom → Uncle → You → Sister → Cousin
  (visit all of level 1, then level 2, then level 3)
```

**Postorder DFS** is the secret for "bottom-up" problems. You ask each child first, then decide at the parent. Like measuring everyone's height from the bottom up to find the tallest branch:

```
Height of a tree (postorder):

          1            ← height = 1 + max(2, 1) = 3
         / \
        2   1          ← heights: 2, 1
       / \
      1   1            ← heights: 1, 1

Process leaves first (height=1), then their parent (height=2), then root (height=3).
Children report their heights UP to their parent.
```

**BST (Binary Search Tree)** is like a sorted phone book built as a tree. Every name to the left is smaller, every name to the right is bigger — so you can find any name in O(log n) steps by going left or right at each node.

## Poem

Root to leaf, the tree descends,
Recursion splits, then merges, mends.
Preorder visits on the way down,
Inorder sorts without a frown.

Postorder waits till children speak,
BFS walks level, peek by peek.
Left is less and right is more,
That is what a BST is for.

Pass values down, return them high,
Trees teach recursion how to fly.

## Template

```ts
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// DFS — recursive template (preorder, inorder, postorder)
function dfs(node: TreeNode | null): void {
  if (node === null) return;

  // Preorder: process here (before children)
  dfs(node.left);
  // Inorder: process here (between children)
  dfs(node.right);
  // Postorder: process here (after children)
}

// DFS — example: max depth (postorder pattern)
function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;

  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);

  return 1 + Math.max(leftDepth, rightDepth);
}

// BFS — level-order traversal using a queue
function levelOrder(root: TreeNode | null): number[][] {
  if (root === null) return [];

  const result: number[][] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel: number[] = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      currentLevel.push(node.val);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(currentLevel);
  }

  return result;
}
```
