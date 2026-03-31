---
slug: two-pointers
title: Two Pointers
icon: "<>"
description: "The two-pointer technique uses two references that traverse a data structure simultaneously. By moving the pointers strategically, you can solve problems that would otherwise require nested loops in O(n) time. This pattern is especially powerful on sorted arrays where the pointer movement direction is guided by comparison results."
pattern: "There are two main variants. In the converging pattern, a left pointer starts at the beginning and a right pointer starts at the end; they move toward each other based on a condition (e.g., if the sum is too small, move left forward; if too large, move right backward). In the same-direction pattern, a slow pointer and fast pointer both move forward, with the fast pointer scanning ahead while the slow pointer marks a position of interest (e.g., the boundary of unique elements)."
whenToUse: [Sorted array operations, Finding pairs, Palindrome checking, Partitioning, Removing duplicates in-place]
keyInsights: 
  - Reduces O(n²) brute force to O(n)
  - Requires sorted input for converging pointers
  - Same-direction pointers useful for in-place modifications
  - Can be combined with binary search for three-sum type problems
questionIds: [algo-9, algo-10, algo-11, algo-12, algo-56, algo-57, algo-58, algo-59, algo-60, algo-61]
---

## Two Pointers

The two-pointer technique uses two indices that traverse a data structure — typically a sorted array — to solve problems in O(n) time without extra space. The pattern eliminates brute-force nested loops by intelligently narrowing the search space.

### Core Techniques

**Converging Pointers:** Place one pointer at the start and one at the end. Move them toward each other based on a condition. For "Two Sum on a sorted array," if the sum is too small, advance the left pointer; if too large, retreat the right pointer. Each step eliminates an entire row or column of possibilities.

**Same-Direction Pointers:** Both pointers move left to right, often at different speeds. This is ideal for in-place modifications: removing duplicates, partitioning arrays, or merging sorted arrays. One pointer tracks the "write" position while the other scans ahead.

**Three Pointers and Beyond:** Some problems like 3Sum fix one pointer and apply converging two-pointer on the remainder. Dutch National Flag uses three pointers to partition into three groups in a single pass.

#### Real World
> **[Database query optimization]** — Merge joins in relational databases (PostgreSQL, MySQL) use the same-direction two-pointer technique on two sorted result sets: advance the pointer that is behind, and emit a match when both point to equal keys — O(n + m) without any hashing overhead.

#### Practice
1. Given a sorted array, find all pairs whose sum equals a target (Two Sum II / LeetCode 167). Use converging pointers and explain why each pointer movement is safe.
2. Given an integer array, find all unique triplets that sum to zero (3Sum / LeetCode 15). Fix one element and apply two pointers on the remainder.
3. Why does the converging two-pointer approach require the array to be sorted first? Construct an example showing what goes wrong on an unsorted array.

```mermaid
flowchart LR
    subgraph Converging
        L1[Left] -->|move right| M1[... meet ...]
        R1[Right] -->|move left| M1
    end
    subgraph SameDirection
        S[Slow - write pos] -->|trails| F[Fast - scanner]
    end
```

### When to Use

Look for sorted arrays, problems asking for pairs or triplets with a target sum, palindrome checks, or in-place array modifications. The sorted property is crucial for converging pointers — it guarantees that moving a pointer changes the sum in a predictable direction.

#### Real World
> **[DNA sequence analysis]** — Bioinformatics tools use two-pointer techniques to find complementary base-pair matches in sorted sequence databases, enabling O(n) palindrome detection in DNA strands (sequences that read the same on both complementary strands).

#### Practice
1. Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring case (Valid Palindrome / LeetCode 125). Use converging pointers from both ends.
2. Given a sorted array, remove duplicates in-place such that each element appears at most twice. Return the new length (Remove Duplicates from Sorted Array II / LeetCode 80). Use same-direction pointers.
3. For palindrome checking, the converging pointer approach is O(n) time and O(1) space. How does this compare to the "reverse and compare" approach in terms of space, and when does the space difference matter?

### Complexity

Two pointers typically achieve O(n) time and O(1) space. For problems like 3Sum, fixing one pointer yields O(n²) total, which is optimal. The technique shines when you need to avoid hash map overhead or when the problem demands constant space.

#### Real World
> **[Memory-constrained systems]** — Embedded systems and real-time processors (like those in medical devices or aerospace) use two-pointer algorithms specifically for their O(1) space guarantee — no heap allocation, predictable memory footprint, and no garbage collection pauses.

#### Practice
1. Given an array of integers, find the container that holds the most water between two vertical lines (Container With Most Water / LeetCode 11). Argue why moving the shorter line inward is the correct greedy choice.
2. Given a sorted array, sort it in-place such that all negative numbers come first without changing their relative order. Use the Dutch National Flag (three-pointer) approach.
3. Two-pointer achieves O(n) for sorted pair problems, while hash map also achieves O(n) but without the sorted requirement. When would you still prefer two pointers over a hash map on a sorted array?

## ELI5

Imagine you and a friend stand at opposite ends of a row of numbers. You walk toward each other. This is the **converging two-pointer** technique.

```
Sorted numbers: [1, 3, 5, 7, 9, 11]
Find two numbers that add to 12.

  Left=1, Right=11 → sum=12 → FOUND! ✓

What if sum was too small?
  Left=1, Right=9 → sum=10 (too small) → move Left forward
  Left=3, Right=9 → sum=12 → FOUND! ✓

What if sum was too big?
  Left=1, Right=11 → sum=12... → already found above

The sorted order guarantees:
  Moving left pointer RIGHT makes the sum BIGGER
  Moving right pointer LEFT makes the sum SMALLER
  → You always know which direction to go!
```

**Same-direction pointers** are like a slow writer and a fast reader going through a book. The fast one reads ahead and tells the slow one what to write down:

```
Remove duplicates from [1, 1, 2, 3, 3, 4] in-place:

Slow (write position): starts at index 0
Fast (scanner):        starts at index 1

  fast=1: nums[1]=1, same as slow → skip
  fast=2: nums[2]=2, DIFFERENT → slow++, write 2 → [1, 2, ...]
  fast=3: nums[3]=3, DIFFERENT → slow++, write 3 → [1, 2, 3, ...]
  fast=4: nums[4]=3, same as slow → skip
  fast=5: nums[5]=4, DIFFERENT → slow++, write 4 → [1, 2, 3, 4, ...]

Result: [1, 2, 3, 4] — duplicates removed in-place, O(1) extra space!
```

**Why it works:** on a sorted array, you always know which pointer to move. There's no need to try every pair (which would be O(n²)). By moving one pointer per step, you solve it in O(n).

## Poem

Two pointers start their race,
One from each end of the space.
If the sum is running low,
Move the left — let it grow.

If too high, pull right back in,
Shrink the gap until you win.
Same direction, side by side,
Slow writes while fast takes the ride.

Sorted arrays, no extra store,
Two pointers — who needs more?

## Template

```ts
// Converging two pointers (e.g., Two Sum II on sorted array)
function twoSumSorted(nums: number[], target: number): number[] {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const sum = nums[left] + nums[right];

    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  return [];
}

// Same-direction two pointers (e.g., remove duplicates in-place)
function removeDuplicates(nums: number[]): number {
  if (nums.length === 0) return 0;

  let slow = 0;

  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }

  return slow + 1;
}
```
