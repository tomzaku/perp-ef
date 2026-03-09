---
slug: linked-list
title: Linked List
icon: "->"
description: "Linked lists store elements as nodes connected by pointers, enabling O(1) insertion and deletion at known positions but requiring O(n) traversal for access. Many linked list problems revolve around pointer manipulation, and the key to clean solutions is using dummy head nodes and the fast/slow pointer technique."
pattern: "A dummy node before the head simplifies edge cases (e.g., deleting the head itself). For reversal, maintain prev, curr, and next pointers and rewire one node at a time. The fast/slow (tortoise and hare) technique sends one pointer at 2x speed: when fast reaches the end, slow is at the middle; if there is a cycle, they will eventually meet. These patterns compose — for example, reorder list uses find-middle + reverse + merge."
whenToUse: [In-place reversal, Cycle detection, Merge operations, Finding middle element, LRU/LFU caches]
keyInsights: 
  - Dummy head eliminates head-deletion edge cases
  - Always save next before rewiring pointers
  - Fast/slow finds middle in one pass
  - "Floyd cycle detection: if they meet, cycle exists"
questionIds: [algo-23, algo-24, algo-25, algo-26]
---

## Linked List

Linked list problems test your ability to manipulate pointers without losing references. The core challenge is rearranging node connections while keeping the list intact. Mastering a few key techniques covers the vast majority of problems.

### Dummy Node

Create a dummy node that points to the head. This eliminates edge cases where the head itself might change — for example, when removing the first node or merging two lists. At the end, return `dummy.next` as the new head.

### Fast and Slow Pointers

Move one pointer one step at a time and another two steps at a time. When the fast pointer reaches the end, the slow pointer is at the middle. This technique also detects cycles: if there is a cycle, the fast pointer will eventually meet the slow pointer. To find the cycle's start, reset one pointer to the head and move both one step at a time until they meet.

### Reversal

To reverse a linked list, maintain three pointers: prev, current, and next. Save current's next, point current back to prev, then advance. This runs in O(n) time and O(1) space. Partial reversal — reversing between positions m and n — requires carefully connecting the reversed segment back to the surrounding nodes.

```mermaid
flowchart LR
    subgraph Reversal
        A[prev = null] --> B[curr]
        B --> C[next = curr.next]
        C --> D[curr.next = prev]
        D --> E[advance prev and curr]
    end
    subgraph FastSlow
        S[Slow: 1 step] --> M[Meets at middle]
        F[Fast: 2 steps] --> M
    end
```

### Merge Technique

Merging two sorted lists uses a dummy node and a tail pointer. Compare the heads of both lists, append the smaller one to tail, and advance. This pattern also applies to flattening multi-level lists or interleaving nodes.

### Complexity

Most linked list operations are O(n) time and O(1) space. The main difficulty is not algorithmic but mechanical: track your pointers carefully, draw the state before and after each operation, and always check for null references.

## ELI5

Imagine a treasure hunt where each clue is hidden in a box, and each box has a note saying **where the next box is**. You can only reach box 5 by starting at box 1 and following the trail.

```
Linked list: [A] → [B] → [C] → [D] → null

Box A says: "I hold 'A', next box is B"
Box B says: "I hold 'B', next box is C"
Box C says: "I hold 'C', next box is D"
Box D says: "I hold 'D', next box is nowhere (null)"

To get to D: you MUST start at A and follow the trail. You can't skip to D directly.
```

**Reversing a linked list** is like flipping the arrows so each clue points back to where you came from:

```
Before: A → B → C → D → null
After:  null ← A ← B ← C ← D

Process (three pointers: prev, curr, next):
  prev=null, curr=A
  Step 1: save next=B, point A→null, advance: prev=A, curr=B
  Step 2: save next=C, point B→A,    advance: prev=B, curr=C
  Step 3: save next=D, point C→B,    advance: prev=C, curr=D
  Step 4: save next=null, point D→C, advance: prev=D, curr=null
  Done! New head = D
```

**Fast and slow pointers** are like two runners on a circular track. If there's no loop, the fast runner finishes and leaves. If there IS a loop, the fast runner laps the slow runner and they meet.

```
Cycle detection:

  Slow: moves 1 step at a time  🐢
  Fast: moves 2 steps at a time 🐇

  No cycle:  fast reaches null → no cycle
  Has cycle: fast loops around and catches slow → they meet → cycle found!
```

**The dummy head** trick eliminates annoying edge cases. Put a fake node before the real head so you never have to special-case "what if I need to remove/insert at the very beginning?"

## Poem

Nodes in a chain, one points ahead,
A dummy node to guard the head.
Fast and slow, a racing pair,
One finds the middle, one checks what's there.

Reverse the arrows, flip the flow,
Prev, curr, next — a steady show.
Null at the end, null at the start,
Pointer problems are pointer art.

Draw it out, keep references tight,
Linked lists reward those who get it right.

## Template

```ts
interface ListNode {
  val: number;
  next: ListNode | null;
}

// Reverse a linked list iteratively
function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;

  while (curr !== null) {
    const next = curr.next; // save next
    curr.next = prev;       // reverse pointer
    prev = curr;            // advance prev
    curr = next;            // advance curr
  }

  return prev; // new head
}

// Fast/slow pointer — find the middle node
function findMiddle(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
  }

  return slow; // middle node (second middle if even length)
}

// Detect cycle using Floyd's algorithm
function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;

    if (slow === fast) return true;
  }

  return false;
}
```
