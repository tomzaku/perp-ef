---
id: algo-26
title: LRU Cache
category: Algorithm
subcategory: Linked List
difficulty: Medium
pattern: Hash Map + Doubly Linked List
companies: [Amazon, Google, Meta]
timeComplexity: O(1) for both get and put
spaceComplexity: O(capacity)
keyTakeaway: Combine a hash map for O(1) key lookup with a doubly linked list for O(1) insertion/removal. Dummy head and tail nodes eliminate null checks at the boundaries.
similarProblems: [LFU Cache, Design In-Memory File System, All O(1) Data Structure]
leetcodeUrl: https://leetcode.com/problems/lru-cache/
---

Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class: `LRUCache(capacity)` initializes with positive size capacity, `get(key)` returns the value or -1 if not found, `put(key, value)` updates or adds the key-value pair. If the capacity is exceeded, evict the least recently used key.

## Examples

**Input:** ["LRUCache","put","put","get","put","get","put","get","get","get"]
[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]
**Output:** [null,null,null,1,null,-1,null,-1,3,4]
**Explanation:** With capacity 2, putting key 3 evicts key 2 (least recent), and putting key 4 evicts key 1, so get(2) and get(1) return -1.


## Solution

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    // Doubly linked list with dummy head and tail
    this.head = { key: 0, val: 0, prev: null, next: null };
    this.tail = { key: 0, val: 0, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _insertAtHead(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node);
    this._insertAtHead(node);
    return node.val;
  }

  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.val = value;
      this._remove(node);
      this._insertAtHead(node);
    } else {
      if (this.map.size === this.capacity) {
        const lru = this.tail.prev;
        this._remove(lru);
        this.map.delete(lru.key);
      }
      const newNode = { key, val: value, prev: null, next: null };
      this._insertAtHead(newNode);
      this.map.set(key, newNode);
    }
  }
}
```

## Diagram

```mermaid
graph TD
  A[LRU Cache: HashMap + Doubly Linked List] --> B{Operation?}
  B -->|get key| C{Key in map?}
  C -->|Yes| D[Move node to front, return value]
  C -->|No| E[Return -1]
  B -->|put key,val| F{Key exists?}
  F -->|Yes| G[Update value, move to front]
  F -->|No| H[Create node, add to front]
  H --> I{Over capacity?}
  I -->|Yes| J[Evict tail node, delete from map]
  I -->|No| K[Done]
```
