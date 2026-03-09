---
slug: graphs
title: Graphs
icon: G
description: "Graphs model relationships between entities — nodes connected by edges. They appear as adjacency lists, adjacency matrices, or implicit grids. BFS and DFS are the fundamental traversal methods, while topological sort handles dependency ordering and union-find efficiently tracks connected components."
pattern: "Build an adjacency list from the input, then traverse with BFS (queue) for shortest-path problems or DFS (recursion/stack) for exhaustive exploration. For directed acyclic graphs (DAGs), topological sort processes nodes in dependency order using either Kahn's algorithm (BFS with in-degree tracking) or DFS with post-order recording. Union-find groups nodes into connected components with near-O(1) amortized union and find operations via path compression and union by rank."
whenToUse: [Connected components, Shortest path, Cycle detection, Dependency ordering, Grid traversal (islands)]
keyInsights: 
  - Adjacency list is preferred for sparse graphs
  - BFS gives shortest path in unweighted graphs
  - Topological sort only works on DAGs
  - Union-find is optimal for dynamic connectivity queries
questionIds: [algo-39, algo-40, algo-41, algo-graph-1, algo-graph-2, algo-graph-3, algo-graph-4, algo-graph-5, algo-graph-6, algo-graph-7, algo-graph-8, algo-graph-9, algo-graph-10, algo-graph-11, algo-graph-12, algo-graph-13, algo-graph-14, algo-graph-15]
---

## Graphs: The Universal Data Structure

Graphs model relationships. Nodes represent entities, and edges represent connections between them. From social networks to road maps to dependency chains, graphs are everywhere in computer science. Mastering graph fundamentals is essential for tackling a huge family of algorithm problems.

### Representation

The two most common representations are:

- **Adjacency List**: Each node stores a list of its neighbors. Space-efficient for sparse graphs — O(V + E). This is the go-to for most interview problems.
- **Adjacency Matrix**: A 2D array where `matrix[i][j]` indicates an edge from i to j. Good for dense graphs or when you need O(1) edge lookup, but costs O(V^2) space.

```mermaid
flowchart TD
    A["Graph Problem"] --> B{"Directed or Undirected?"}
    B -->|"Undirected"| C{"Detect Components?"}
    B -->|"Directed"| D{"Ordering Dependencies?"}
    C -->|"Yes"| E["BFS/DFS or Union-Find"]
    C -->|"No"| F["BFS for shortest path, DFS for exploration"]
    D -->|"Yes"| G["Topological Sort via Kahns BFS or DFS"]
    D -->|"No"| H["DFS for cycle detection, BFS for levels"]
```

### BFS — Breadth-First Search

BFS explores level by level using a queue. It finds the shortest path in unweighted graphs. Time: O(V + E). Use BFS when you need the minimum number of steps or when exploring layer by layer.

### DFS — Depth-First Search

DFS goes as deep as possible before backtracking, using a stack or recursion. It is the basis for cycle detection, topological sorting, and finding connected components. Time: O(V + E).

### Topological Sort

For directed acyclic graphs — DAGs — topological sort produces a linear ordering where every edge goes from earlier to later. Two approaches: Kahns algorithm uses BFS with in-degree tracking; the DFS approach uses post-order reversal. If a cycle exists, topological sort is impossible.

### Union-Find — Disjoint Set Union

Union-Find efficiently tracks which nodes belong to the same connected component. Two key optimizations make it nearly O(1) per operation:

- **Path Compression**: Flatten the tree during find operations.
- **Union by Rank**: Always attach the smaller tree under the root of the larger tree.

Union-Find excels at dynamic connectivity queries: "Are nodes A and B connected?" and "Connect nodes A and B."

### Connected Components

In an undirected graph, run BFS or DFS from each unvisited node to discover all connected components. Alternatively, use Union-Find to group nodes incrementally.

Graph problems are everywhere in interviews. Build your adjacency list, choose BFS or DFS based on the question, and always track visited nodes to avoid infinite loops.

## ELI5

Imagine a map of cities connected by roads. Each city is a **node**, and each road is an **edge**. A graph is just a fancy way of drawing this map in code.

```
Cities and roads:

   New York ─── Boston
      |              |
   Philadelphia ─── Providence
      |
   Washington DC

Adjacency list (how the code stores it):
  New York    → [Boston, Philadelphia]
  Boston      → [New York, Providence]
  Philadelphia → [New York, Providence, Washington DC]
  Providence  → [Boston, Philadelphia]
  Washington DC → [Philadelphia]
```

**BFS** (breadth-first) is like dropping a pebble in water and watching the ripples spread. You visit all cities 1 road away first, then 2 roads away, then 3...

**DFS** (depth-first) is like following one road all the way to its end, then backtracking and trying the next road.

**Topological sort** is for when things have to happen in order — like cooking steps. You can't bake the cake before mixing the batter. Topo sort figures out a valid order where every dependency comes first.

```
Recipe dependencies:

  buy eggs ──┐
  buy flour──┤─→ mix batter ──→ bake ──→ frost ──→ eat cake 🎂
  buy butter─┘                   ↑
  preheat oven ──────────────────┘

Topological order: buy ingredients → preheat → mix → bake → frost → eat
```

**Union-Find** is like sorting kids into teams. "Are you on the same team as her?" — check in one step, even after hundreds of team merges.

## Poem

Nodes and edges, a web of ties,
Adjacency lists where connection lies.
BFS spreads outward, level by level,
DFS dives deep like a daring daredevil.

Topological sort lines the DAG up straight,
Union-Find groups components — no debate.
From social graphs to maps on a screen,
Graphs are the mightiest structure you have seen.

## Template

```ts
// Build adjacency list from edge list
function buildGraph(n: number, edges: number[][]): Map<number, number[]> {
  const graph = new Map<number, number[]>();

  for (let i = 0; i < n; i++) graph.set(i, []);

  for (const [u, v] of edges) {
    graph.get(u)!.push(v);
    graph.get(v)!.push(u); // omit for directed graph
  }

  return graph;
}

// BFS traversal
function bfs(graph: Map<number, number[]>, start: number): number[] {
  const visited = new Set<number>([start]);
  const queue: number[] = [start];
  const order: number[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);

    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return order;
}

// DFS traversal
function dfsGraph(graph: Map<number, number[]>, start: number): number[] {
  const visited = new Set<number>();
  const order: number[] = [];

  function dfs(node: number): void {
    visited.add(node);
    order.push(node);

    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
  }

  dfs(start);
  return order;
}

// Topological sort (Kahn's algorithm — BFS-based)
function topologicalSort(n: number, edges: number[][]): number[] {
  const graph = new Map<number, number[]>();
  const inDegree = new Array(n).fill(0);

  for (let i = 0; i < n; i++) graph.set(i, []);

  for (const [u, v] of edges) {
    graph.get(u)!.push(v);
    inDegree[v]++;
  }

  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const order: number[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);

    for (const neighbor of graph.get(node) ?? []) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  return order.length === n ? order : []; // empty if cycle exists
}
```
