---
id: algo-40
title: Clone Graph
category: Algorithm
subcategory: Graphs
difficulty: Medium
pattern: DFS + Hash Map
companies: [Meta, Google]
timeComplexity: O(V + E) where V is vertices and E is edges
spaceComplexity: O(V)
keyTakeaway: "Use a hash map to track original-to-clone mappings. During DFS, if a node was already cloned (exists in the map), return the clone directly to handle cycles and shared references."
similarProblems: [Copy List with Random Pointer, Clone Binary Tree With Random Pointer, Clone N-ary Tree]
leetcodeUrl: https://leetcode.com/problems/clone-graph/
---

Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node in the graph contains a value (int) and a list of its neighbors.

## Examples

**Input:** adjList = [[2,4],[1,3],[2,4],[1,3]]
**Output:** [[2,4],[1,3],[2,4],[1,3]]
**Explanation:** The graph has 4 nodes. Node 1 neighbors are [2,4], node 2 neighbors are [1,3], etc.


## Solution

```js
// class GraphNode {
//   constructor(val = 0, neighbors = []) {
//     this.val = val;
//     this.neighbors = neighbors;
//   }
// }

function cloneGraph(node) {
  if (node === null) return null;

  const visited = new Map();

  function dfs(original) {
    if (visited.has(original)) return visited.get(original);

    const clone = { val: original.val, neighbors: [] };
    visited.set(original, clone);

    for (const neighbor of original.neighbors) {
      clone.neighbors.push(dfs(neighbor));
    }

    return clone;
  }

  return dfs(node);
}
```

## Diagram

```mermaid
graph TD
  A[Start DFS from given node] --> B{Node in visited map?}
  B -->|Yes| C[Return existing clone]
  B -->|No| D[Create clone node]
  D --> E[Add to visited map]
  E --> F[For each neighbor]
  F --> G[Recurse DFS on neighbor]
  G --> H[Add cloned neighbor to clone]
  H --> I{More neighbors?}
  I -->|Yes| F
  I -->|No| J[Return clone]
```
