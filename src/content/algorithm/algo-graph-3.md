---
id: algo-graph-3
title: Surrounded Regions
category: Algorithm
subcategory: Graphs
difficulty: Medium
pattern: Border DFS
companies: [Google, Amazon]
timeComplexity: "O(m * n)"
spaceComplexity: "O(m * n) for DFS stack"
keyTakeaway: "Mark border-connected 'O's as safe (temporary marker), then flip all remaining 'O's to 'X', and restore the safe cells. This avoids checking every region individually."
similarProblems: [Number of Islands, Number of Enclaves, Pacific Atlantic Water Flow]
leetcodeUrl: https://leetcode.com/problems/surrounded-regions/
---

Given an `m x n` matrix `board` containing `'X'` and `'O'`, capture all regions that are 4-directionally surrounded by `'X'`. A region is captured by flipping all `'O'`s into `'X'`s in that surrounded region.

## Examples

**Input:** board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]
**Output:** [["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]
**Explanation:** The bottom 'O' is on the border, so it's not surrounded. The rest are flipped.


## Solution

```js
function solve(board) {
  const rows = board.length;
  const cols = board[0].length;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== 'O') return;
    board[r][c] = 'T';
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    dfs(r, 0);
    dfs(r, cols - 1);
  }
  for (let c = 0; c < cols; c++) {
    dfs(0, c);
    dfs(rows - 1, c);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === 'O') board[r][c] = 'X';
      if (board[r][c] === 'T') board[r][c] = 'O';
    }
  }
}
```

## Explanation

APPROACH: Border DFS + Flip

Step 1: DFS from all border 'O' cells, mark them as 'T' (temporary safe).
Step 2: Flip remaining 'O' → 'X' (surrounded). Flip 'T' → 'O' (restore safe).

```
Original:          After border DFS:     Final:
X  X  X  X         X  X  X  X           X  X  X  X
X  O  O  X    →    X  O  O  X     →     X  X  X  X
X  X  O  X         X  X  O  X           X  X  X  X
X  O  X  X         X  T  X  X           X  O  X  X
                   ↑ border O→T

The border 'O' at [3,1] is marked 'T' (safe).
Interior 'O's at [1,1],[1,2],[2,2] have no border connection → flipped to 'X'.
```

## Diagram

```mermaid
graph TD
  A["Dijkstra: init dist array, source=0"] --> B[Push source to min heap]
  B --> C{Heap empty?}
  C -->|No| D[Pop node with min dist]
  D --> E{Already visited?}
  E -->|Yes| C
  E -->|No| F[For each neighbor: relax edge]
  F --> G{New dist shorter?}
  G -->|Yes| H[Update dist, push to heap]
  G -->|No| I[Skip]
  H --> C
  I --> C
  C -->|Yes| J[Return max of all distances]
```
