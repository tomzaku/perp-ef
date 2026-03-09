---
id: algo-graph-6
title: Number of Connected Components in an Undirected Graph
category: Algorithm
subcategory: Graphs
difficulty: Medium
pattern: Union-Find
companies: [Google, Amazon, Microsoft]
timeComplexity: "O(n * α(n)) ≈ O(n) with Union-Find"
spaceComplexity: O(n)
keyTakeaway: Start with n components. Each successful union (merging two different roots) reduces the count by 1. Union-Find with path compression and union by rank makes this near-constant per operation.
similarProblems: [Graph Valid Tree, Number of Islands, Redundant Connection]
leetcodeUrl: https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/
---

You have a graph of `n` nodes. You are given an integer `n` and an array `edges` where `edges[i] = [a, b]` indicates that there is an edge between `a` and `b` in the graph. Return the number of connected components in the graph.

## Examples

**Input:** n = 5, edges = [[0,1],[1,2],[3,4]]
**Output:** 2
**Explanation:** Components: {0,1,2} and {3,4}.

**Input:** n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]
**Output:** 1
**Explanation:** All 5 nodes are connected through the chain of edges, forming a single component.


## Brute Force

```js
function countComponentsBFS(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    graph[u].push(v);
    graph[v].push(u);
  }

  const visited = new Set();
  let components = 0;

  for (let i = 0; i < n; i++) {
    if (visited.has(i)) continue;
    components++;
    const queue = [i];
    visited.add(i);
    while (queue.length > 0) {
      const node = queue.shift();
      for (const neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }

  return components;
}
```

## Solution

```js
function countComponents(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(a, b) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return;
    if (rank[rootA] < rank[rootB]) parent[rootA] = rootB;
    else if (rank[rootA] > rank[rootB]) parent[rootB] = rootA;
    else { parent[rootB] = rootA; rank[rootA]++; }
    n--;
  }

  for (const [u, v] of edges) {
    union(u, v);
  }

  return n;
}
```

## Diagram

```mermaid
graph TD
  A["Init prices array, source = 0"] --> B[Run Bellman-Ford up to K+1 iterations]
  B --> C[Copy previous prices]
  C --> D[For each flight edge]
  D --> E{"prev src + cost < prices dst?"}
  E -->|Yes| F["Update prices dst"]
  E -->|No| G[Skip]
  F --> H{More edges?}
  G --> H
  H -->|Yes| D
  H -->|No| I{More iterations?}
  I -->|Yes| B
  I -->|No| J["Return prices dest or -1"]
```

## TestConfig
```json
{
  "functionName": "countComponents",
  "testCases": [
    {
      "args": [
        5,
        [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            3,
            4
          ]
        ]
      ],
      "expected": 2
    },
    {
      "args": [
        5,
        [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ]
        ]
      ],
      "expected": 1
    },
    {
      "args": [
        1,
        []
      ],
      "expected": 1
    },
    {
      "args": [
        4,
        []
      ],
      "expected": 4,
      "isHidden": true
    },
    {
      "args": [
        3,
        [
          [
            0,
            1
          ]
        ]
      ],
      "expected": 2,
      "isHidden": true
    },
    {
      "args": [
        5,
        [
          [
            0,
            1
          ],
          [
            2,
            3
          ]
        ]
      ],
      "expected": 3,
      "isHidden": true
    },
    {
      "args": [
        6,
        [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ]
        ]
      ],
      "expected": 2,
      "isHidden": true
    },
    {
      "args": [
        4,
        [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ]
        ]
      ],
      "expected": 1,
      "isHidden": true
    },
    {
      "args": [
        7,
        [
          [
            0,
            1
          ],
          [
            2,
            3
          ],
          [
            4,
            5
          ]
        ]
      ],
      "expected": 4,
      "isHidden": true
    },
    {
      "args": [
        2,
        [
          [
            0,
            1
          ]
        ]
      ],
      "expected": 1,
      "isHidden": true
    }
  ]
}
```
