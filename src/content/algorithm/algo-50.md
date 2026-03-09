---
id: algo-50
title: Walls and Gates
category: Algorithm
subcategory: BFS / DFS
difficulty: Medium
pattern: BFS
companies: [Meta, Google]
timeComplexity: "O(m * n)"
spaceComplexity: "O(m * n)"
keyTakeaway: Multi-source BFS from all gates simultaneously guarantees that each room gets the shortest distance to any gate. This avoids running BFS from each gate independently.
similarProblems: [Rotting Oranges, Shortest Path in Binary Matrix, 01 Matrix]
leetcodeUrl: https://leetcode.com/problems/walls-and-gates/
---

You are given an `m x n` grid rooms initialized with three possible values: -1 (a wall), 0 (a gate), or Infinity (an empty room). Fill each empty room with the distance to its nearest gate. If it is impossible to reach a gate, leave it as Infinity.

## Examples

**Input:** rooms = [[Infinity,-1,0,Infinity],[Infinity,Infinity,Infinity,-1],[Infinity,-1,Infinity,-1],[0,-1,Infinity,Infinity]]
**Output:** [[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]
**Explanation:** Each empty room is filled with the distance to the nearest gate.


## Solution

```js
function wallsAndGates(rooms) {
  if (!rooms.length) return;

  const rows = rooms.length;
  const cols = rooms[0].length;
  const queue = [];
  const INF = 2147483647;

  // Collect all gates as BFS starting points
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rooms[r][c] === 0) queue.push([r, c]);
    }
  }

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && rooms[nr][nc] === INF) {
        rooms[nr][nc] = rooms[r][c] + 1;
        queue.push([nr, nc]);
      }
    }
  }
}
```

## Diagram

```mermaid
graph TD
  A[Find all gate cells with value 0] --> B[Add all gates to BFS queue]
  B --> C{Queue empty?}
  C -->|No| D[Dequeue cell]
  D --> E[For each 4-dir neighbor]
  E --> F{Neighbor is empty room?}
  F -->|Yes| G[Set distance = current + 1]
  G --> H[Enqueue neighbor]
  F -->|No| I[Skip]
  H --> C
  I --> C
  C -->|Yes| J[All rooms have min distances]
```
