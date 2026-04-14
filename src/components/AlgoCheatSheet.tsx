import { useNavigate } from 'react-router-dom';

type ColorKey = 'cyan' | 'purple' | 'green' | 'orange' | 'blue' | 'yellow';

interface Pattern {
  label: string;
  slug: string;
  color: ColorKey;
}

interface CheatSheetRow {
  clue: string;
  patterns: Pattern[];
  note?: string;
}

interface CheatSheetSection {
  title: string;
  icon: string;
  color: ColorKey;
  rows: CheatSheetRow[];
}

// ─── All 15 patterns with their slugs and colors ─────────────────────────────
// Foundation (cyan):  arrays-hashing, two-pointers, sliding-window
// Data Structures (purple): stack, linked-list, trees, heap
// Graph (green):  graphs, bfs-dfs, trie
// Advanced (orange): binary-search, greedy, dynamic-programming, brute-force, bit-manipulation

const P = {
  hash:   { label: 'Arrays & Hashing',      slug: 'arrays-hashing',       color: 'cyan'   } as Pattern,
  tp:     { label: 'Two Pointers',           slug: 'two-pointers',          color: 'cyan'   } as Pattern,
  sw:     { label: 'Sliding Window',         slug: 'sliding-window',        color: 'cyan'   } as Pattern,
  stack:  { label: 'Stack',                  slug: 'stack',                 color: 'purple' } as Pattern,
  ll:     { label: 'Linked List',            slug: 'linked-list',           color: 'purple' } as Pattern,
  trees:  { label: 'Trees',                  slug: 'trees',                 color: 'purple' } as Pattern,
  heap:   { label: 'Heap',                   slug: 'heap',                  color: 'purple' } as Pattern,
  graphs: { label: 'Graphs',                 slug: 'graphs',                color: 'green'  } as Pattern,
  bfs:    { label: 'BFS / DFS',              slug: 'bfs-dfs',               color: 'green'  } as Pattern,
  trie:   { label: 'Trie',                   slug: 'trie',                  color: 'green'  } as Pattern,
  bs:     { label: 'Binary Search',          slug: 'binary-search',         color: 'orange' } as Pattern,
  greedy: { label: 'Greedy',                 slug: 'greedy',                color: 'orange' } as Pattern,
  dp:     { label: 'Dynamic Programming',    slug: 'dynamic-programming',   color: 'orange' } as Pattern,
  bt:     { label: 'Backtracking',           slug: 'brute-force',           color: 'orange' } as Pattern,
  bits:   { label: 'Bit Manipulation',       slug: 'bit-manipulation',      color: 'orange' } as Pattern,
};

const SECTIONS: CheatSheetSection[] = [
  // ── Section 1: Input Type ──────────────────────────────────────────────────
  {
    title: 'Input Type',
    icon: 'IN',
    color: 'cyan',
    rows: [
      {
        clue: 'Unsorted Array / String',
        patterns: [P.hash, P.tp, P.sw],
        note: 'Default starting point for array/string problems',
      },
      {
        clue: 'Sorted Array',
        patterns: [P.bs, P.tp],
        note: 'Sorted → think binary search or converging two pointers',
      },
      {
        clue: 'Array with frequencies / duplicates',
        patterns: [P.hash, P.bits],
        note: 'Count occurrences or detect XOR-based uniqueness',
      },
      {
        clue: 'Two arrays / strings to compare',
        patterns: [P.tp, P.hash, P.dp],
        note: 'Merge, intersect, or align them',
      },
      {
        clue: 'Linked List',
        patterns: [P.ll, P.tp, P.stack],
        note: 'Fast/slow pointers for cycle & midpoint; stack to reverse',
      },
      {
        clue: 'Binary Tree',
        patterns: [P.trees, P.bfs],
        note: 'DFS for depth/path problems, BFS for level-order',
      },
      {
        clue: 'Graph / Matrix / Grid',
        patterns: [P.graphs, P.bfs],
        note: 'BFS for shortest path, DFS for exhaustive; union-find for components',
      },
      {
        clue: 'Intervals / Ranges',
        patterns: [P.greedy, P.heap],
        note: 'Sort by start then sweep; heap for overlapping merge',
      },
      {
        clue: 'K Sorted Lists / Streams',
        patterns: [P.heap],
        note: 'Min-heap to always pop the global minimum',
      },
      {
        clue: 'Integer / Bit pattern',
        patterns: [P.bits, P.hash],
        note: 'XOR cancels duplicates; bit masks enumerate subsets',
      },
    ],
  },

  // ── Section 2: Output / Goal ───────────────────────────────────────────────
  {
    title: 'Output / Goal',
    icon: 'GT',
    color: 'purple',
    rows: [
      {
        clue: 'Max / Min value or cost',
        patterns: [P.dp, P.greedy, P.bs],
        note: 'DP if overlapping subproblems; greedy if local optimal works; BS if monotonic',
      },
      {
        clue: 'Count number of ways / paths',
        patterns: [P.dp],
        note: 'Classic DP — define state, write recurrence',
      },
      {
        clue: 'All combinations / subsets / permutations',
        patterns: [P.bt],
        note: 'Backtracking: choose → explore → unchoose',
      },
      {
        clue: 'Shortest path (unweighted)',
        patterns: [P.bfs],
        note: 'BFS guarantees shortest path in unweighted graphs',
      },
      {
        clue: 'Shortest path (weighted)',
        patterns: [P.graphs],
        note: 'Dijkstra (min-heap) for non-negative weights',
      },
      {
        clue: 'Top K / K-th largest or smallest',
        patterns: [P.heap, P.bs],
        note: 'Min-heap size K for top K; binary search on answer space',
      },
      {
        clue: 'Running median (stream)',
        patterns: [P.heap],
        note: 'Two heaps: max-heap for lower half, min-heap for upper half',
      },
      {
        clue: 'Connected components / grouping',
        patterns: [P.graphs, P.bfs],
        note: 'Union-Find or BFS/DFS flood fill',
      },
      {
        clue: 'Topological / dependency order',
        patterns: [P.graphs],
        note: "Kahn's BFS with in-degree, or DFS post-order",
      },
      {
        clue: 'True / False — does X exist / is it possible?',
        patterns: [P.bs, P.tp, P.bfs, P.dp],
        note: 'Narrow down depending on structure; BS for sorted, DP for subproblems',
      },
      {
        clue: 'O(1) lookup / deduplicate / group',
        patterns: [P.hash],
        note: 'Trade space for time with a hash map / set',
      },
    ],
  },

  // ── Section 3: Keywords / Signals ─────────────────────────────────────────
  {
    title: 'Keywords / Signals',
    icon: 'KW',
    color: 'green',
    rows: [
      {
        clue: '"Substring" / "Subarray" (contiguous)',
        patterns: [P.sw, P.hash],
        note: 'Sliding window for variable-length; hash for fixed constraints',
      },
      {
        clue: '"Subsequence" (non-contiguous)',
        patterns: [P.dp, P.tp],
        note: 'DP for count/length; two pointers to check if one is sub of another',
      },
      {
        clue: '"Anagram" / "Permutation" of string',
        patterns: [P.sw, P.hash],
        note: 'Frequency map + sliding window of same length',
      },
      {
        clue: '"Palindrome"',
        patterns: [P.tp, P.dp],
        note: 'Two pointers from center; DP for longest palindromic subsequence',
      },
      {
        clue: '"Brackets" / "Parentheses" / "Matching"',
        patterns: [P.stack],
        note: 'Stack for nested matching — push open, pop on close',
      },
      {
        clue: '"Next Greater" / "Next Smaller" element',
        patterns: [P.stack],
        note: 'Monotonic stack — pop when current violates order',
      },
      {
        clue: '"Cycle" / "Loop" detection',
        patterns: [P.ll, P.graphs],
        note: 'Fast/slow pointers for linked list; DFS visited set for graphs',
      },
      {
        clue: '"Islands" / "Regions" in grid',
        patterns: [P.bfs, P.graphs],
        note: 'BFS/DFS flood fill; union-find for dynamic connectivity',
      },
      {
        clue: '"Shortest path" / "Minimum steps"',
        patterns: [P.bfs, P.graphs],
        note: 'BFS for unit cost; Dijkstra for weighted',
      },
      {
        clue: '"Schedule" / "Overlap" / "Merge intervals"',
        patterns: [P.greedy, P.heap],
        note: 'Sort by start; heap to track active intervals',
      },
      {
        clue: '"Dependencies" / "Prerequisites" / "Course schedule"',
        patterns: [P.graphs],
        note: 'Model as directed graph → topological sort',
      },
      {
        clue: '"K-th largest / smallest"',
        patterns: [P.heap, P.bs],
        note: 'Min-heap of size K; binary search on answer for large inputs',
      },
      {
        clue: '"Merge K sorted"',
        patterns: [P.heap],
        note: 'Min-heap with one element from each list',
      },
      {
        clue: '"Prefix" / "Words" / "Autocomplete"',
        patterns: [P.trie, P.hash],
        note: 'Trie for prefix queries; hash map for exact lookups',
      },
      {
        clue: '"Search" in sorted / rotated array',
        patterns: [P.bs],
        note: 'Modified binary search — identify which half is sorted first',
      },
      {
        clue: '"XOR" / "Bits" / "Single number" / "Power of 2"',
        patterns: [P.bits],
        note: 'a ^ a = 0 cancels pairs; n & (n-1) clears lowest set bit',
      },
      {
        clue: '"LRU Cache" / "LFU Cache"',
        patterns: [P.ll, P.hash],
        note: 'Doubly linked list + hash map for O(1) get/put',
      },
      {
        clue: '"Word search" / "Wildcard" / "Regex match"',
        patterns: [P.bt, P.dp, P.trie],
        note: 'Backtracking on grid; DP for edit distance / matching',
      },
      {
        clue: '"Level-order" / "Layer by layer"',
        patterns: [P.bfs],
        note: 'BFS queue naturally processes level by level',
      },
      {
        clue: '"Inorder" / "BST validation" / "Sorted tree"',
        patterns: [P.trees],
        note: 'Inorder DFS on BST yields sorted order',
      },
    ],
  },

  // ── Section 4: Complexity Hints ────────────────────────────────────────────
  {
    title: 'Complexity Hints',
    icon: 'CX',
    color: 'orange',
    rows: [
      {
        clue: 'Brute force is O(2ⁿ) or O(n!)',
        patterns: [P.dp, P.bt],
        note: 'DP if subproblems overlap; backtracking + pruning if all answers needed',
      },
      {
        clue: 'Brute force is O(n²), input is sorted',
        patterns: [P.bs, P.tp],
        note: 'Binary search or two pointers → O(n) or O(n log n)',
      },
      {
        clue: 'Brute force is O(n²), contiguous subarray',
        patterns: [P.sw],
        note: 'Sliding window reduces to O(n)',
      },
      {
        clue: 'Need O(log n)',
        patterns: [P.bs, P.heap],
        note: 'Binary search on sorted data; heap for priority-based retrieval',
      },
      {
        clue: 'Need O(1) lookup / insert / delete',
        patterns: [P.hash, P.ll],
        note: 'Hash map / set; doubly linked list for order + O(1) removal',
      },
      {
        clue: 'Need O(n log n)',
        patterns: [P.heap, P.greedy, P.bs],
        note: 'Heap operations; sort then greedy sweep; binary search inside a loop',
      },
      {
        clue: 'Each element processed at most twice',
        patterns: [P.sw, P.stack],
        note: 'Sliding window or monotonic stack → O(n)',
      },
      {
        clue: 'n ≤ 20 (small input)',
        patterns: [P.bt, P.bits],
        note: 'Backtracking or bitmask DP to enumerate all subsets',
      },
      {
        clue: 'n ≤ 1000',
        patterns: [P.dp],
        note: 'O(n²) DP is acceptable',
      },
      {
        clue: 'n ≤ 10⁵–10⁶',
        patterns: [P.hash, P.sw, P.tp, P.bs],
        note: 'Must be O(n) or O(n log n)',
      },
    ],
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const PATTERN_CLASSES: Record<ColorKey, string> = {
  cyan:   'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/20',
  purple: 'bg-accent-purple/10 text-accent-purple border border-accent-purple/30 hover:bg-accent-purple/20',
  green:  'bg-accent-green/10 text-accent-green border border-accent-green/30 hover:bg-accent-green/20',
  orange: 'bg-accent-orange/10 text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/20',
  blue:   'bg-accent-blue/10 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/20',
  yellow: 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/30 hover:bg-accent-yellow/20',
};

const SECTION_STYLES: Record<ColorKey, { text: string; border: string; icon: string }> = {
  cyan:   { text: 'text-accent-cyan',   border: 'border-accent-cyan/20',   icon: 'bg-accent-cyan/10 text-accent-cyan'   },
  purple: { text: 'text-accent-purple', border: 'border-accent-purple/20', icon: 'bg-accent-purple/10 text-accent-purple' },
  green:  { text: 'text-accent-green',  border: 'border-accent-green/20',  icon: 'bg-accent-green/10 text-accent-green'  },
  orange: { text: 'text-accent-orange', border: 'border-accent-orange/20', icon: 'bg-accent-orange/10 text-accent-orange' },
  blue:   { text: 'text-accent-blue',   border: 'border-accent-blue/20',   icon: 'bg-accent-blue/10 text-accent-blue'   },
  yellow: { text: 'text-accent-yellow', border: 'border-accent-yellow/20', icon: 'bg-accent-yellow/10 text-accent-yellow' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AlgoCheatSheet({ basePath }: { basePath: string }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <p className="text-xs text-text-muted">
        Spot a clue in the problem, then click a pattern to open its learning path. Cover all 4 sections before your interview.
      </p>

      {SECTIONS.map((section) => {
        const styles = SECTION_STYLES[section.color];
        return (
          <div
            key={section.title}
            className={`border ${styles.border} bg-bg-card rounded-xl overflow-hidden`}
          >
            {/* Section header */}
            <div className={`px-4 py-3 flex items-center gap-3 border-b ${styles.border}`}>
              <span className={`w-7 h-7 rounded-lg ${styles.icon} flex items-center justify-center font-code font-bold text-[10px] shrink-0`}>
                {section.icon}
              </span>
              <h3 className={`text-xs font-display font-bold uppercase tracking-wider ${styles.text}`}>
                {section.title}
              </h3>
              <span className="ml-auto text-[10px] font-code text-text-muted">
                {section.rows.length} clues
              </span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/40">
              {section.rows.map((row, i) => (
                <div key={i} className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  {/* Clue + optional note */}
                  <div className="shrink-0 sm:w-[220px]">
                    <span className="text-[11px] font-medium text-text-primary bg-bg-tertiary px-2.5 py-1 rounded-md inline-block">
                      {row.clue}
                    </span>
                  </div>

                  {/* Arrow (desktop) */}
                  <span className="text-text-muted text-xs shrink-0 hidden sm:block">→</span>

                  {/* Pattern chips + note */}
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      {row.patterns.map((p, j) => (
                        <button
                          key={j}
                          onClick={() => navigate(`${basePath}/path/${p.slug}`)}
                          className={`text-[11px] px-2.5 py-1 rounded-md font-medium cursor-pointer transition-all ${PATTERN_CLASSES[p.color]}`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    {row.note && (
                      <p className="text-[10px] text-text-muted leading-relaxed">
                        {row.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
