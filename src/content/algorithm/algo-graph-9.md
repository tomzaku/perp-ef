---
id: algo-graph-9
title: Walls and Gates
category: Algorithm
subcategory: Graphs
difficulty: Medium
pattern: Multi-source BFS
companies: [Google, Meta, Amazon]
timeComplexity: "O(m * n)"
spaceComplexity: "O(m * n)"
keyTakeaway: Multi-source BFS from all gates simultaneously. Each cell is visited exactly once and gets the shortest distance to any gate. This is far more efficient than running BFS from each empty room.
similarProblems: [Rotting Oranges, Shortest Path in Binary Matrix, 01 Matrix]
leetcodeUrl: https://leetcode.com/problems/walls-and-gates/
---

You are given an `m x n` grid `rooms` initialized with three possible values: `-1` (a wall), `0` (a gate), `2147483647` (INF, an empty room). Fill each empty room with the distance to its nearest gate. If it is impossible to reach a gate, leave it as `INF`.

## Examples

**Input:** rooms = [[2147483647,-1,0,2147483647],[2147483647,2147483647,2147483647,-1],[2147483647,-1,2147483647,-1],[0,-1,2147483647,2147483647]]
**Output:** [[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]
**Explanation:** Each empty room is filled with its shortest distance to the nearest gate.


## Solution

```js
function wallsAndGates(rooms) {
  const rows = rooms.length;
  const cols = rooms[0].length;
  const INF = 2147483647;
  const queue = [];
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rooms[r][c] === 0) queue.push([r, c]);
    }
  }

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

## Explanation

APPROACH: Multi-source BFS from all gates

Start BFS from all gates (value 0) simultaneously. Each step increments distance by 1. Cells are filled with shortest distance to any gate.

```
INF = ∞

Initial:              After BFS:
 ∞  -1   0   ∞        3  -1   0   1
 ∞   ∞   ∞  -1   →    2   2   1  -1
 ∞  -1   ∞  -1        1  -1   2  -1
 0  -1   ∞   ∞        0  -1   3   4

Queue starts: [(0,2), (3,0)]  ← all gates

Level 1: fill neighbors of gates with 1
Level 2: fill their neighbors with 2
Level 3: fill with 3
Level 4: fill with 4

Each cell gets its distance on first visit (BFS guarantees shortest).
```

## Diagram

```mermaid
graph TD
  A[Start BFS from beginWord] --> B[Add to queue with level 1]
  B --> C{Queue empty?}
  C -->|No| D[Dequeue word]
  D --> E[Try changing each char a-z]
  E --> F{New word == endWord?}
  F -->|Yes| G[Return level + 1]
  F -->|No| H{New word in wordList?}
  H -->|Yes| I[Add to queue, remove from list]
  H -->|No| J[Skip]
  I --> C
  J --> C
  C -->|Yes| K[Return 0 - no path]
```
