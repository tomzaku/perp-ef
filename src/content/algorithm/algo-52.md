---
id: algo-52
title: Graph Valid Tree
category: Algorithm
subcategory: BFS / DFS
difficulty: Medium
pattern: DFS + Union Find
companies: [Google, Amazon]
timeComplexity: O(V + E)
spaceComplexity: O(V + E)
keyTakeaway: "A valid tree with n nodes has exactly n-1 edges and is connected. Check the edge count first (quick reject), then verify connectivity via BFS or DFS. Union-Find is another efficient approach."
similarProblems: 
  - Course Schedule
  - Number of Connected Components in an Undirected Graph
  - Redundant Connection
leetcodeUrl: https://leetcode.com/problems/graph-valid-tree/
---

Given `n` nodes labeled from 0 to n-1 and a list of undirected edges (each edge is a pair of nodes), check whether these edges make up a valid tree. A valid tree has n-1 edges and is fully connected with no cycles.

## Examples

**Input:** n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]
**Output:** true
**Explanation:** The graph forms a valid tree with 4 edges connecting 5 nodes.

**Input:** n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]
**Output:** false
**Explanation:** There is a cycle: 1-2-3-1.


## Solution

```js
function validTree(n, edges) {
  if (edges.length !== n - 1) return false;

  // Build adjacency list
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }

  // BFS to check connectivity
  const visited = new Set();
  const queue = [0];
  visited.add(0);

  while (queue.length > 0) {
    const node = queue.shift();
    for (const neighbor of adj[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return visited.size === n;
}
```

## Diagram

```mermaid
graph TD
  A{Exactly n-1 edges?}
  A -->|No| B[Not a valid tree]
  A -->|Yes| C[Init Union-Find with n nodes]
  C --> D[For each edge]
  D --> E{Same root? Cycle?}
  E -->|Yes| B
  E -->|No| F[Union the nodes]
  F --> G{More edges?}
  G -->|Yes| D
  G -->|No| H{One connected component?}
  H -->|Yes| I[Valid tree]
  H -->|No| B
```
