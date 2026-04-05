---
id: algo-90
title: Knight's Tour
category: Algorithm
subcategory: Graphs
difficulty: Hard
pattern: Backtracking
companies: [Google, Amazon, Adobe]
timeComplexity: O(8^(n²))
spaceComplexity: O(n²)
keyTakeaway: "Backtracking with Warnsdorff's heuristic: always move to the square with the fewest onward moves. This prunes the search tree dramatically and solves n=8 in near-constant time."
similarProblems: [N-Queens, Sudoku Solver, Word Search]
---

Given an `n x n` chessboard and a starting position `(startRow, startCol)`, determine if a knight can visit every square exactly once (a Knight's Tour). Return the board filled with the move order (1-indexed), or an empty array if no solution exists.

A knight moves in an "L" shape: 2 squares in one direction and 1 square perpendicular (8 possible moves).

## Examples

**Input:** n = 5, startRow = 0, startCol = 0
**Output:**
```
[
  [ 1, 12, 21, 18,  3],
  [20, 17,  2, 13, 22],
  [11, 24, 19,  4, 15],
  [16, 23,  8, 25,  6],
  [ 9, 10,  5, 14,  7]
]
```

**Input:** n = 1, startRow = 0, startCol = 0
**Output:** `[[1]]`

## Solution

```js
function knightTour(n, startRow, startCol) {
  const moves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [ 1, -2], [ 1, 2], [ 2, -1], [ 2, 1]
  ];

  const board = Array.from({ length: n }, () => Array(n).fill(0));
  board[startRow][startCol] = 1;

  function isValid(r, c) {
    return r >= 0 && r < n && c >= 0 && c < n && board[r][c] === 0;
  }

  // Warnsdorff's heuristic: count onward moves from a given cell
  function degree(r, c) {
    return moves.filter(([dr, dc]) => isValid(r + dr, c + dc)).length;
  }

  function solve(r, c, moveNum) {
    if (moveNum === n * n + 1) return true;

    // Get all valid next moves, sorted by Warnsdorff's heuristic (fewest onward moves first)
    const nextMoves = moves
      .map(([dr, dc]) => [r + dr, c + dc])
      .filter(([nr, nc]) => isValid(nr, nc))
      .sort(([r1, c1], [r2, c2]) => degree(r1, c1) - degree(r2, c2));

    for (const [nr, nc] of nextMoves) {
      board[nr][nc] = moveNum;
      if (solve(nr, nc, moveNum + 1)) return true;
      board[nr][nc] = 0; // backtrack
    }

    return false;
  }

  if (solve(startRow, startCol, 2)) return board;
  return [];
}
```

## Explanation

APPROACH: Backtracking + Warnsdorff's Heuristic

A naive backtracking explores up to 8^(n²) paths — completely infeasible for n=8 (64 squares). Warnsdorff's heuristic makes it tractable by always choosing the move that leads to the square with the **fewest onward moves**. This avoids painting yourself into a corner.

```
Knight at (0,0) on a 5x5 board.
8 possible L-moves:

      .  .  .  .  .
  .-2 .  .  .  .  .
  .   .-1 . +1 .  .
  .   .   K  .  .  .
  .   .+1 . -1 .  .
  .+2 .  .  .  .  .

Valid moves from (0,0): only (1,2) and (2,1) — rest are off-board.

Warnsdorff at (0,0):
  (1,2) → has 4 onward moves
  (2,1) → has 3 onward moves
  → Choose (2,1) first (fewer options = less likely to get stuck)
```

BACKTRACKING MECHANICS:
```
solve(r, c, moveNum):
  if moveNum == n*n + 1 → all squares visited, return true

  for each valid next square (sorted by Warnsdorff):
    mark board[nr][nc] = moveNum
    if solve(nr, nc, moveNum + 1) → return true
    board[nr][nc] = 0  ← backtrack if path failed

  return false (no valid move from here)
```

WITHOUT HEURISTIC vs WITH:
```
n=8, naive backtracking:  potentially millions of backtracks
n=8, Warnsdorff:          typically 0 backtracks — finds solution immediately
```

COMPLEXITY:
- Worst case without heuristic: O(8^(n²)) — exponential
- With Warnsdorff: near O(n²) in practice for open tours on standard boards

## TestConfig
```json
{
  "functionName": "knightTour",
  "argTypes": [{ "type": "primitive" }, { "type": "primitive" }, { "type": "primitive" }],
  "returnType": { "type": "matrix" },
  "testCases": [
    {
      "args": [1, 0, 0],
      "expected": [[1]]
    },
    {
      "args": [5, 0, 0],
      "validator": "function(result) { const n = 5; if (!result || result.length !== n) return false; const flat = result.flat(); if (flat.length !== n*n) return false; const sorted = [...flat].sort((a,b)=>a-b); for(let i=0;i<n*n;i++) if(sorted[i]!==i+1) return false; const moves=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]; const pos=new Array(n*n+1); for(let r=0;r<n;r++) for(let c=0;c<n;c++) pos[result[r][c]]=[r,c]; for(let i=1;i<n*n;i++){const [r1,c1]=pos[i];const [r2,c2]=pos[i+1];const dr=Math.abs(r2-r1);const dc=Math.abs(c2-c1);if(!((dr===2&&dc===1)||(dr===1&&dc===2))) return false;} return true; }"
    }
  ]
}
```
