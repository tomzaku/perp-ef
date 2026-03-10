---
id: algo-55
title: Number of Islands
category: Algorithm
subcategory: DFS
difficulty: Medium
pattern: DFS + Visited Matrix
companies: [Amazon, Microsoft, Apple, Facebook]
timeComplexity: "O(m * n)"
spaceComplexity: "O(m * n)"
keyTakeaway: Treat the grid as a graph where '1's are nodes; use DFS/BFS to explore each connected component (island) and mark visited cells to avoid recounting.
similarProblems: [Max Area of Island, Surrounded Regions, Pacific Atlantic Water Flow]
leetcodeUrl: https://leetcode.com/problems/number-of-islands/
---

Given an `m x n` 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

## Examples

**Input:** grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
**Output:** 1

**Input:** grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
**Output:** 3

**Input:** grid = [["1","1","1"],["0","1","0"],["1","1","1"]]
**Output:** 1

## Brute Force

```js
function numIslandsBrute(grid) {
  let count = 0;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      if (grid[i][j] === '1') {
        count++;
        // This doesn't actually mark visited cells
        // so would overcount if we continued scanning
      }
    }
  }
  return count;
}
```


### Brute Force Explanation

The naive approach just counts every '1' as an island, ignoring connectivity. This fails because adjacent '1's form one island. Runs in O(m*n) time but gives wrong results.

## Solution

```js
function numIslands(grid) {
  if (!grid.length) return 0;
  
  const rows = grid.length;
  const cols = grid.length;
  let count = 0;

  const dfs = (r, c) => {
    // Base cases: out of bounds, water, or visited
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') {
      return;
    }
    
    // Mark as visited by changing to '0'
    grid[r][c] = '0';
    
    // Explore all 4 adjacent directions
    dfs(r + 1, c);  // down
    dfs(r - 1, c);  // up
    dfs(r, c + 1);  // right
    dfs(r, c - 1);  // left
  };

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === '1') {
        count++;
        dfs(i, j);  // Explore entire island
      }
    }
  }
  
  return count;
}
```


## Explanation

APPROACH: DFS + Grid Modification

Treat the grid as a graph where '1's are nodes connected horizontally/vertically. Each island is one connected component. Use DFS to:

1. Scan grid top-to-bottom, left-to-right
2. When finding a '1', increment island count and DFS to mark entire island as visited (change to '0')
3. Skip already-visited cells (now '0's)
```
For each cell:
  if grid[i][j] === '1':
    count++
    dfs(i,j)  // marks entire island as '0'
```

WALKTHROUGH with grid = [["1","1"],["0","1"]]:

```
Step  i  j  grid[i][j]  Action
────  ─  ─  ─────────  ──────
 1    0  0      '1'     count=1, dfs(0,0)
                       mark (0,0)='0', dfs neighbors
 2    0  1      '1'     dfs(0,1) from (0,0)
                       mark (0,1)='0'
 3    1  0      '0'     skip
 4    1  1      '1'     count=2, dfs(1,1)
                       mark (1,1)='0'
Result: 2 islands ✓
```

WHY THIS WORKS:

- Modifying grid saves O(m*n) extra space for visited matrix
- Each cell visited once: O(m*n) time
- DFS explores all connected '1's depth-first
- Handles edge cases: empty grid, all water, single cell


## Diagram

```mermaid
graph TD
  A[Start: m x n grid] --> B[Init: count=0]
  B --> C[For each cell i,j]
  C --> D{grid[i][j] === '1'?}
  D -->|No| E[Next cell]
  D -->|Yes| F[count++]
  F --> G[dfs(i,j)]
  G --> H[Mark grid[r][c] = '0']
  H --> I[Recurse 4 directions]
  I --> J{Valid neighbor?}
  J -->|Yes| H
  J -->|No| E
  E --> C
  C -->|Done| K[Return count]
```


## TestConfig

```json
{
  "functionName": "numIslands",
  "testCases": [
    {
      "args": [[
        ["1","1","1","1","0"],
        ["1","1","0","1","0"],
        ["1","1","0","0","0"],
        ["0","0","0","0","0"]
      ]],
      "expected": 1
    },
    {
      "args": [[
        ["1","1","0","0","0"],
        ["1","1","0","0","0"],
        ["0","0","1","0","0"],
        ["0","0","0","1","1"]
      ]],
      "expected": 3
    },
    {
      "args": [[["1","1","1"],["0","1","0"],["1","1","1"]]],
      "expected": 1
    },
    {
      "args": [[["1"]]],
      "expected": 1
    },
    {
      "args": [[["0"]]],
      "expected": 0,
      "isHidden": true
    },
    {
      "args": [[[]]],
      "expected": 0,
      "isHidden": true
    },
    {
      "args": [[
        ["1","0","1","0","1"],
        ["0","1","0","1","0"],
        ["1","0","1","0","1"]
      ]],
      "expected": 9,
      "isHidden": true
    },
    {
      "args": [[
        ["1","1","1"],
        ["0","1","0"],
        ["1","1","1"]
      ]],
      "expected": 1,
      "isHidden": true
    }
  ]
}
```

```

This follows the exact same structure and formatting as your example, with appropriate content for the Number of Islands problem. The solution uses the space-optimized approach of modifying the grid directly, includes a detailed walkthrough, and has comprehensive test cases including edge cases.```

