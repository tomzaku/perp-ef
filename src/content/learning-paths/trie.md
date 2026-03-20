---
slug: trie
title: Trie (Prefix Tree)
icon: "🌳"
description: "A trie is a tree-like data structure that stores strings character by character, enabling O(m) prefix lookups where m is the word length. Tries excel at autocomplete, spell-checking, IP routing, and any problem where you need to efficiently search, insert, or match strings by prefix. Each node represents a character, and paths from root to marked nodes form complete words."
pattern: "Build a tree where each edge represents a character. To insert a word, walk from the root creating nodes as needed and mark the final node as a word end. To search, walk the same path — if you reach the end and it is marked, the word exists. For prefix matching, just check that the path exists (no end-of-word check needed). For wildcard matching, use DFS to explore all children at wildcard positions."
whenToUse: [Prefix matching, Autocomplete/type-ahead, Spell checking, Word dictionary operations, IP routing/longest prefix match, Word search on grids]
keyInsights:
  - "O(m) insert/search where m = word length — independent of dictionary size"
  - "Prefix queries are naturally supported — just walk the path"
  - "Space-efficient for words sharing common prefixes"
  - "Combine with DFS/backtracking for grid-based word search"
  - "Wildcard matching uses recursive DFS at '.' nodes"
questionIds: [algo-trie-1, algo-trie-2, algo-trie-3, algo-trie-4, algo-trie-5, algo-trie-6, algo-trie-7]
---

## Trie (Prefix Tree)

A trie (pronounced "try") is a tree data structure where each node represents a single character of a string. The root is empty, and every path from root to a marked leaf spells out a stored word. Unlike hash maps that treat words as atomic keys, tries decompose words character-by-character, making prefix operations trivially efficient.

### Core Structure

Each trie node has:
- A map of children (character → child node)
- A boolean `isEnd` flag marking if a complete word ends here

```
       root
      / | \
     a  b  c
    /   |
   p    a
  / \   |
 p   e  t  ← "bat" ends here
 |
 l
 e  ← "apple" ends here, "app" also if marked
```

### Operations

**Insert:** Walk the trie character by character, creating new nodes where needed. Mark the last node as `isEnd = true`.

**Search:** Walk the trie. If you reach the end of the word and `isEnd` is true, the word exists. If any character is missing, return false.

**StartsWith (Prefix):** Same as search, but don't check `isEnd` — just verify the path exists.

**Wildcard Search:** When encountering a wildcard like '.', recursively try all children at that position.

### When to Use

- **Autocomplete:** Walk to the prefix node, then DFS to find all completions
- **Spell check:** Insert dictionary, search for each word
- **Word search on grid:** Build trie from word list, DFS the grid while walking the trie simultaneously
- **Longest common prefix:** Walk until children diverge

### Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Insert | O(m) | O(m) worst case |
| Search | O(m) | O(1) |
| Prefix | O(m) | O(1) |
| Total space | - | O(N × m × alphabet) |

Where m = word length, N = number of words. In practice, shared prefixes significantly reduce space.

### Trie vs Hash Map

| | Trie | Hash Map |
|--|------|----------|
| Prefix queries | O(m) natural | O(N) scan all keys |
| Sorted iteration | Yes (DFS) | No |
| Space | Shared prefixes save space | Each key stored fully |
| Wildcards | DFS at wildcard positions | Regex scan |

Use a trie when prefix operations are needed. Use a hash map when you only need exact lookups.

## ELI5

Imagine a phone book, but instead of listing each name on its own page, you organize it like a choose-your-own-adventure book.

```
Looking up "cat":
  Page 1 (root): "What's the first letter?"
    → Turn to 'c' section

  Page 2 ('c'): "What's the second letter?"
    → Turn to 'a' subsection

  Page 3 ('ca'): "What's the third letter?"
    → Turn to 't' subsection

  Page 4 ('cat'): ⭐ "cat" is a word! Found it!
```

Now the magic — "car" and "cat" share the same first two pages:

```
       root
        |
        c
        |
        a
       / \
      t    r
      ⭐    ⭐
    "cat"  "car"
```

You only walked through 'c' and 'a' once for both words. That's why tries are efficient — **words that start the same share the same path**.

**Autocomplete works naturally:** type "ca" → walk to the 'a' node → look at all branches below → you get "cat" and "car" as suggestions!

**Wildcard search** (like "c.t" where '.' means any letter): at the '.' position, try ALL branches. It's like opening every door on that floor to see which ones lead to a word ending in 't'.

## Poem

A tree of letters, root to leaf,
Each path a word, stored with belief.
Insert by walking, node by node,
Search the same well-traveled road.

Prefix queries? Walk halfway,
All completions branch away.
Wildcards bloom like doors flung wide,
DFS explores what's inside.

From autocomplete to word grids vast,
The humble trie stands strong and fast.

## Template

```ts
// Trie node and basic operations
class TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;

  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }
}

class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  // Insert a word into the trie — O(m)
  insert(word: string): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isEnd = true;
  }

  // Search for exact word — O(m)
  search(word: string): boolean {
    const node = this._walkTo(word);
    return node !== null && node.isEnd;
  }

  // Check if any word starts with prefix — O(m)
  startsWith(prefix: string): boolean {
    return this._walkTo(prefix) !== null;
  }

  // Walk to the node at end of prefix, or null
  private _walkTo(prefix: string): TrieNode | null {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) return null;
      node = node.children.get(char)!;
    }
    return node;
  }
}

// Wildcard search (supports '.' for any single character)
function searchWithWildcard(node: TrieNode, word: string, index: number): boolean {
  if (index === word.length) return node.isEnd;

  const char = word[index];
  if (char === '.') {
    // Try every child
    for (const child of node.children.values()) {
      if (searchWithWildcard(child, word, index + 1)) return true;
    }
    return false;
  } else {
    if (!node.children.has(char)) return false;
    return searchWithWildcard(node.children.get(char)!, word, index + 1);
  }
}
```
