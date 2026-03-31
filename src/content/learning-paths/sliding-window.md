---
slug: sliding-window
title: Sliding Window
icon: "[]"
description: "Sliding window maintains a contiguous subarray or substring and expands or shrinks it to satisfy a condition. Instead of recalculating from scratch for every position, you incrementally update the window state as it slides, turning O(n*k) brute force into O(n). This pattern is essential for substring and subarray optimization problems."
pattern: "For a fixed-size window, advance both ends by one each step and update the aggregate. For a variable-size window, expand the right end to include more elements and shrink from the left when a constraint is violated. Track the window state with a hash map or a few variables. The key insight is that adding one element and removing one element from the window is O(1), so the entire sweep is O(n)."
whenToUse: [Contiguous subarray/substring problems, Maximum/minimum in window, Distinct elements in window, String matching]
keyInsights: 
  - "Fixed window: both ends advance together"
  - "Variable window: expand right, shrink left when constraint breaks"
  - Use a hash map to track character/element frequencies in the window
  - The answer is often recorded when the window is valid before shrinking
questionIds: [algo-13, algo-14, algo-15, algo-62, algo-63, algo-64, algo-65, algo-66, algo-67, algo-68, algo-74, algo-75, algo-76, algo-77, algo-78]
---

## Sliding Window Deep Dive

The sliding window technique maintains a contiguous subarray or substring and slides it across the input, updating the answer incrementally. Instead of recalculating from scratch for every possible window, you add the new element entering the window and remove the one leaving — reducing O(n\*k) brute force to O(n).

There are two main flavors:

```
Fixed-size window:   Both ends advance together, window size = k always.
Variable-size window: Right end expands, left end shrinks when constraint breaks.
```

---

### Fixed-Size Window

When the problem gives you a fixed window size `k`, initialize the window with the first `k` elements, then slide one step at a time: add the element entering on the right, remove the element leaving on the left.

#### Step-by-Step Walkthrough — Maximum Sum Subarray of Size K

**Problem:** Given `nums = [2, 1, 5, 1, 3, 2]` and `k = 3`, find the maximum sum of any contiguous subarray of size 3.

```
nums:  [2, 1, 5, 1, 3, 2]      k = 3

Step 0: Build initial window (indices 0..2)
  [2  1  5] 1  3  2       windowSum = 2+1+5 = 8    maxSum = 8
   L     R

Step 1: Slide right by 1 — remove nums[0]=2, add nums[3]=1
   2 [1  5  1] 3  2       windowSum = 8 - 2 + 1 = 7  maxSum = 8
      L     R

Step 2: Slide right by 1 — remove nums[1]=1, add nums[4]=3
   2  1 [5  1  3] 2       windowSum = 7 - 1 + 3 = 9  maxSum = 9
         L     R

Step 3: Slide right by 1 — remove nums[2]=5, add nums[5]=2
   2  1  5 [1  3  2]      windowSum = 9 - 5 + 2 = 6  maxSum = 9
            L     R

Answer: 9  (window [5, 1, 3])
```

**Key insight:** Each slide does exactly one addition and one subtraction — O(1) per step. Total: O(n).

#### Real World
> **[Network monitoring]** — Network traffic analyzers (like those used by Cloudflare and AWS) compute rolling averages over fixed-time windows to detect DDoS spikes: the sum of the last k packets is updated in O(1) per new packet rather than recomputing from scratch.

#### Practice
1. Given an array of integers and a window size k, find the maximum sum of any contiguous subarray of size k. Solve in O(n).
2. Given a binary array and a window size k, find the maximum number of 1s in any window of size k (equivalent to: what position gives the best k-element window?).
3. For a fixed-size window of size k, the element to remove when sliding is at index `i - k`. Why is it `i - k` and not `i - k + 1`, and what off-by-one error does this distinction prevent?

#### Full Code Example

```ts
function maxSumSubarray(nums: number[], k: number): number {
  if (nums.length < k) return -1; // edge case: not enough elements

  // Build initial window
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += nums[i];
  }
  let maxSum = windowSum;

  // Slide the window
  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i];       // add element entering on the right
    windowSum -= nums[i - k];   // remove element leaving on the left
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}
```

#### Compact Single-Pass Variant

Some people prefer a single loop. The trick is to check `i >= k` before removing and `i >= k - 1` before recording:

```ts
function maxSumSubarrayCompact(nums: number[], k: number): number {
  let windowSum = 0;
  let maxSum = -Infinity;

  for (let i = 0; i < nums.length; i++) {
    windowSum += nums[i];

    if (i >= k) {
      windowSum -= nums[i - k]; // element leaving the window
    }

    if (i >= k - 1) {
      maxSum = Math.max(maxSum, windowSum); // window is fully formed
    }
  }

  return maxSum;
}
```

#### Visual: How the Window Slides

```
Index:   0   1   2   3   4   5   6   7
Value:  [4] [2] [7] [1] [8] [3] [5] [6]    k = 4

         ──────────────
Step 0: |4   2   7   1|  8   3   5   6     sum=14
         ──────────────
Step 1:  4  |2   7   1   8|  3   5   6     sum=14-4+8=18
             ──────────────
Step 2:  4   2  |7   1   8   3|  5   6     sum=18-2+3=19
                 ──────────────
Step 3:  4   2   7  |1   8   3   5|  6     sum=19-7+5=17
                     ──────────────
Step 4:  4   2   7   1  |8   3   5   6|    sum=17-1+6=22  <-- max
                          ──────────────
```

---

### Variable-Size Window

When you need to find the **longest** or **shortest** subarray/substring meeting a condition, the window size is not fixed. Use two pointers: `left` and `right`. The pattern is always:

1. **Expand right** — move `right` forward, adding the new element to the window state.
2. **Check constraint** — is the window still valid?
3. **Shrink left** — if invalid, move `left` forward (removing elements) until valid again.
4. **Record answer** — update best result from the current valid window.

#### Decision Flowchart

```
                    ┌─────────────────┐
                    │  right < n ?     │
                    └────────┬────────┘
                       yes   │   no → return result
                             ▼
                    ┌─────────────────┐
                    │ Add nums[right] │
                    │ to window state │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────────┐
              ┌──── │ Window valid?        │
              │     └─────────┬───────────┘
              │          yes  │
              │               ▼
              │     ┌─────────────────────┐
              │     │ Update result        │
              │     │ (max/min length)     │
              │     └─────────┬───────────┘
              │               │
              │               ▼
              │     ┌─────────────────────┐
              │     │ right++             │
              │     └─────────────────────┘
              │
         no   │
              ▼
    ┌─────────────────────┐
    │ While invalid:       │
    │   Remove nums[left]  │
    │   left++             │
    └──────────┬──────────┘
               │
               ▼
     (back to "Update result" or "right++")
```

**When to use `while` vs `if` for shrinking:**
- **`while`** (most common): Shrink until the window becomes valid. Used for "longest" problems where you need to restore validity.
- **`if`**: Shrink exactly once per expansion. Used only when the window can become invalid by exactly one element (rare; e.g., fixed-size simulation with two pointers).

#### Example 1: Longest Substring Without Repeating Characters

**Problem (LeetCode 3):** Given string `s`, find the length of the longest substring without repeating characters.

```
s = "abcabcbb"

right=0: add 'a'  window={a}       [a]bcabcbb          len=1
right=1: add 'b'  window={a,b}     [ab]cabcbb          len=2
right=2: add 'c'  window={a,b,c}   [abc]abcbb          len=3
right=3: add 'a'  window has 'a' already! → SHRINK
  remove 'a' at left=0 → window={b,c,a}  a[bca]bcbb    len=3
right=4: add 'b'  window has 'b' already! → SHRINK
  remove 'b' at left=1 → window={c,a,b}  ab[cab]cbb    len=3
right=5: add 'c'  window has 'c' already! → SHRINK
  remove 'c' at left=2 → window={a,b,c}  abc[abc]bb    len=3
right=6: add 'b'  window has 'b' already! → SHRINK
  remove 'a' at left=3 → still has 'b'!
  remove 'b' at left=4 → window={c,b}    abcab[cb]b    len=2
right=7: add 'b'  window has 'b' already! → SHRINK
  remove 'c' at left=5 → still has 'b'!
  remove 'b' at left=6 → window={b}      abcabcb[b]    len=1

Answer: 3  (any of "abc", "bca", "cab")
```

```ts
function lengthOfLongestSubstring(s: string): number {
  const freq = new Map<string, number>();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    freq.set(s[right], (freq.get(s[right]) ?? 0) + 1);

    // Shrink while we have a duplicate
    while (freq.get(s[right])! > 1) {
      freq.set(s[left], freq.get(s[left])! - 1);
      if (freq.get(s[left]) === 0) freq.delete(s[left]);
      left++;
    }

    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}
```

#### Example 2: Minimum Window Substring

**Problem (LeetCode 76):** Given strings `s` and `t`, find the minimum window in `s` that contains all characters of `t`.

This is the classic "shrink to find shortest" pattern. The window is valid when it contains all characters of `t`. We expand to find a valid window, then shrink to minimize it.

```
s = "ADOBECODEBANC"    t = "ABC"
need: {A:1, B:1, C:1}   required = 3

Expand right until valid, then shrink left to minimize:

right=0 'A': have={A:1}         formed=1  (need A:1 ✓)
right=1 'D': have={A:1,D:1}     formed=1
right=2 'O': have={...,O:1}     formed=1
right=3 'B': have={...,B:1}     formed=2  (need B:1 ✓)
right=4 'E': have={...,E:1}     formed=2
right=5 'C': have={...,C:1}     formed=3  (need C:1 ✓)  VALID!
  → Window: "ADOBEC" length=6. Record it.
  → Shrink: remove 'A' at left=0 → formed=2. Invalid, stop shrinking.

right=6 'O': formed=2
...
right=9 'A': have={...,A:1}     formed=3  VALID!
  → Window: "CODEBA" length=6
  → Shrink: remove 'C' → formed=2. Stop.
right=10 'N': formed=2
right=11 'C': formed=3  VALID!
  → Window: "BANC" length=4. New best!
  → Shrink: remove 'B' → formed=2. Stop.

Answer: "BANC" (length 4)
```

```ts
function minWindow(s: string, t: string): string {
  if (t.length > s.length) return "";

  const need = new Map<string, number>();
  for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1);

  const have = new Map<string, number>();
  let formed = 0;           // how many chars in t are fully satisfied
  const required = need.size; // how many unique chars we need

  let left = 0;
  let minLen = Infinity;
  let minStart = 0;

  for (let right = 0; right < s.length; right++) {
    // Expand: add s[right]
    const ch = s[right];
    have.set(ch, (have.get(ch) ?? 0) + 1);

    // Check if this char is now satisfied
    if (need.has(ch) && have.get(ch) === need.get(ch)) {
      formed++;
    }

    // Shrink: while window is valid, try to minimize
    while (formed === required) {
      // Record answer
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        minStart = left;
      }
      // Remove s[left]
      const leftCh = s[left];
      have.set(leftCh, have.get(leftCh)! - 1);
      if (need.has(leftCh) && have.get(leftCh)! < need.get(leftCh)!) {
        formed--;
      }
      left++;
    }
  }

  return minLen === Infinity ? "" : s.slice(minStart, minStart + minLen);
}
```

**Key pattern difference:**
- **Longest** problems: expand right freely, shrink left when **invalid**, record answer **after** shrinking (window is valid).
- **Shortest** problems: expand right until **valid**, record answer **before** shrinking, shrink left while **valid**.

#### Real World
> **[Text editors / IDE search]** — The "find minimum window containing all search terms" is a real feature in advanced text editors and log analysis tools. The variable-size window pattern (LeetCode 76) directly models how tools like `grep -o` with context matching locate the smallest matching span.

#### Practice
1. Given a string s and a target string t, find the minimum window in s containing all characters of t (Minimum Window Substring / LeetCode 76). Implement with a "formed" counter for O(1) validity checks.
2. Given a string s, find the length of the longest substring without repeating characters (Longest Substring Without Repeating Characters / LeetCode 3).
3. In a "longest" variable window problem, why do you record the answer AFTER the shrink loop rather than before? What incorrect result would you get if you recorded before shrinking?

---

### Tracking Window State

The per-step cost of updating the window determines overall complexity. Here are the main strategies:

#### 1. Hash Map Frequency Tracking

The most general approach. Use a `Map<string, number>` (or `Map<number, number>`) to count element frequencies in the current window.

```ts
// Adding element to window
freq.set(ch, (freq.get(ch) ?? 0) + 1);

// Removing element from window
freq.set(ch, freq.get(ch)! - 1);
if (freq.get(ch) === 0) freq.delete(ch); // clean up for accurate size checks
```

**When to clean up zeros:** Always delete zero-count entries if you use `freq.size` to count distinct elements. If you only check specific counts, cleanup is optional but keeps the map small.

#### 2. Array Frequency Tracking (Faster for Bounded Alphabets)

When the input is limited to lowercase letters (26) or ASCII (128), use an array instead of a hash map. Array access is ~5x faster than Map in practice.

```ts
// For lowercase English letters
const freq = new Array(26).fill(0);
const idx = (ch: string) => ch.charCodeAt(0) - 97; // 'a' = 0

// Adding
freq[idx(ch)]++;

// Removing
freq[idx(ch)]--;
```

**When to use arrays vs maps:**

| Scenario | Use Array | Use Map |
|---|---|---|
| Lowercase letters only (a-z) | `new Array(26)` | overkill |
| ASCII characters | `new Array(128)` | overkill |
| Unicode / arbitrary strings | too sparse | `new Map()` |
| Integer elements in known range | `new Array(range)` | overkill |
| Integer elements, unknown range | wasteful | `new Map()` |

#### 3. The "Formed Count" Optimization

Instead of comparing two full frequency maps every step (O(26) or O(n)), maintain a single integer `formed` that tracks how many target characters are fully satisfied.

```ts
// When adding a character to the window:
have.set(ch, (have.get(ch) ?? 0) + 1);
if (need.has(ch) && have.get(ch) === need.get(ch)) {
  formed++;  // this character is now fully satisfied
}

// When removing a character from the window:
if (need.has(ch) && have.get(ch) === need.get(ch)) {
  formed--;  // about to drop below required count
}
have.set(ch, have.get(ch)! - 1);
```

**Critical ordering:** When adding, increment `formed` **after** updating `have`. When removing, decrement `formed` **before** updating `have`. This ensures the comparison `have.get(ch) === need.get(ch)` fires at the right moment.

The window is valid when `formed === required` (where `required = need.size`). This makes the validity check O(1).

#### Real World
> **[Streaming analytics]** — Platforms like Apache Kafka Streams and Flink maintain in-memory hash maps of element frequencies within time windows to compute real-time statistics (distinct user counts, hot items). The "formed count" optimization is essential for production performance at millions of events per second.

#### Practice
1. Given a string s and a non-empty string p, find all starting indices in s where anagrams of p begin (Find All Anagrams / LeetCode 438). Use array frequency tracking for O(1) per slide.
2. Given a string s and a pattern p, determine if any permutation of p appears as a substring of s (Permutation in String / LeetCode 567). How does the "match count" optimization improve clarity?
3. When tracking window state with a frequency map, when should you delete zero-count entries versus leave them in the map, and how does this choice affect the correctness of a `freq.size` check?

#### 4. Tracking Additional State

Some problems need more than frequencies:

```
Problem                          | State to track
─────────────────────────────────┼──────────────────────────
Max in sliding window            | Monotonic deque (see below)
Sum of window                    | Running sum variable
Count of distinct elements       | freq map + freq.size
Number of zeros in window        | Single counter variable
Product of window                | Running product (watch for zeros!)
```

---

### Common Applications

| Problem | Type | Key Idea | Difficulty |
|---|---|---|---|
| Maximum Sum Subarray of Size K | Fixed | Sum tracking, slide by 1 | Easy |
| Maximum Average Subarray | Fixed | Sum / k, slide by 1 | Easy |
| Longest Substring Without Repeating Chars (LC 3) | Variable | freq map, shrink on duplicate | Medium |
| Minimum Window Substring (LC 76) | Variable | formed count, shrink while valid | Hard |
| Longest Substring with At Most K Distinct (LC 340) | Variable | freq.size <= k | Medium |
| Permutation in String (LC 567) | Fixed | freq match of pattern size | Medium |
| Find All Anagrams (LC 438) | Fixed | freq match, collect all positions | Medium |
| Sliding Window Maximum (LC 239) | Fixed | Monotonic deque | Hard |
| Minimum Size Subarray Sum (LC 209) | Variable | sum >= target, shrink for shortest | Medium |
| Subarrays with K Different Integers (LC 992) | Variable | atMost(k) - atMost(k-1) trick | Hard |
| Max Consecutive Ones III (LC 1004) | Variable | Count zeros <= k | Medium |
| Fruit Into Baskets (LC 904) | Variable | At most 2 distinct | Medium |
| Grumpy Bookstore Owner (LC 1052) | Fixed | Extra satisfaction in window k | Medium |
| Longest Repeating Character Replacement (LC 424) | Variable | len - maxFreq <= k | Medium |

**The "atMost" Trick:** Problems asking for "exactly K" can often be decomposed as `atMost(K) - atMost(K - 1)`. This converts a hard exact-count problem into two easier at-most problems, each solvable with a standard variable-size window.

#### Real World
> **[A/B testing platforms]** — Experiment platforms like Optimizely and Statsig use sliding window counters to track conversion rates within rolling time windows, mapping directly to the "count distinct elements" and "minimum window covering all variants" patterns.

#### Practice
1. Given a binary array and an integer k, find the maximum number of consecutive 1s if you can flip at most k zeros (Max Consecutive Ones III / LeetCode 1004). Map this to a "at most k zeros in window" constraint.
2. Given an array of integers and k, count the number of "nice subarrays" that contain exactly k odd numbers (Count Number of Nice Subarrays / LeetCode 1248). Apply the atMost trick.
3. Why does the "exactly K" decomposition `atMost(K) - atMost(K-1)` work mathematically? Prove that no subarray is double-counted or missed.

---

### Common Pitfalls & Edge Cases

#### 1. Off-by-One Errors

The most frequent bug in sliding window problems. Be precise about when the window is "fully formed."

```
Wrong:                              Correct:
for (let i = 0; i < n; i++) {      for (let i = 0; i < n; i++) {
  windowSum += nums[i];               windowSum += nums[i];
  if (i >= k) {                       if (i >= k) {        // remove when
    windowSum -= nums[i-k];              windowSum -= nums[i-k]; // window exceeds k
    maxSum = Math.max(maxSum,          }
      windowSum);                      if (i >= k - 1) {    // record when
  }                                      maxSum = Math.max(  // window IS k
}                                          maxSum, windowSum);
// Misses the first window!            }
                                     }
```

**Rule of thumb:** The window of size `k` contains indices `[i-k+1, i]`. It is fully formed when `i >= k - 1`. The element to remove is at `i - k` (one before the window start), and you remove it when `i >= k`.

#### 2. Empty Input

Always handle edge cases up front:

```ts
if (nums.length === 0) return 0;          // no elements
if (k > nums.length) return -1;           // window larger than input
if (k === 0) return 0;                    // degenerate window
if (t.length > s.length) return "";       // target longer than source
```

#### 3. Window Larger Than Input

If `k > n`, there is no valid window. Some problems expect `-1`, some expect `0`, some expect `""`. Read the problem statement carefully.

#### 4. When Shrinking: `while` vs `if`

```
Use WHILE:                          Use IF:
─────────────────────               ─────────────────────
while (window invalid) {            if (window size > k) {
  remove left;                        remove left;
  left++;                             left++;
}                                   }

Used when:                          Used when:
- Multiple elements may need        - Exactly one element must
  to leave to restore validity        leave (fixed-size simulation)
- Variable-size windows              - The window can only be
- "Longest/shortest" problems          1 element too large
```

**Common mistake:** Using `if` when you need `while`. If the newly added element causes multiple violations (e.g., adding a character that was already in the window but the duplicate is far from `left`), a single `if` will not shrink enough.

```
"abcdbea"   goal: no repeats

right=4 add 'b': window="abcdb" — 'b' at index 1 is duplicate
  if:    remove 'a' at left=0 → "bcdb" — STILL HAS DUPLICATE 'b'!  BUG!
  while: remove 'a','b' → left=2 → "cdb" — valid ✓
```

#### 5. Forgetting to Clean Up the Frequency Map

```ts
// After removing an element:
freq.set(ch, freq.get(ch)! - 1);

// If you later check freq.size for "number of distinct elements":
// A zero-count entry still counts in freq.size!
// Always clean up:
if (freq.get(ch) === 0) freq.delete(ch);
```

#### 6. Recording the Answer at the Wrong Time

```
For LONGEST problems:                For SHORTEST problems:
Record AFTER shrinking               Record BEFORE shrinking
(window is valid and maximal)         (window is valid and minimal)

while (invalid) { shrink; }           while (valid) {
result = max(result, windowLen);        result = min(result, windowLen);
                                        shrink;
                                      }
```

#### Real World
> **[Production incident post-mortems]** — Many sliding window bugs found in production (e.g., a metrics dashboard showing inflated counts) trace back to one of these six pitfalls — off-by-one in window formation or recording the answer at the wrong shrink point.

#### Practice
1. Given nums and k, find the maximum subarray sum of size exactly k. Trace through the code for `nums = [1,2,3,4,5]`, `k = 3` and verify the off-by-one handling at `i >= k - 1`.
2. Given a string "abcdbea" and the constraint "no repeating characters", simulate the variable window manually and show why `if` (instead of `while`) for shrinking produces an incorrect result.
3. In the minimum window substring problem, you record the answer inside the `while (valid)` loop before shrinking. What is the exact condition that makes this correct — why isn't recording after the loop sufficient?

---

### Sliding Window with Deque (Monotonic Deque)

Some problems need the **maximum** or **minimum** value within a sliding window. A hash map does not help here — you need a **monotonic deque** (double-ended queue) that maintains elements in sorted order.

#### The Idea

Maintain a deque where elements are stored in **decreasing order** (for max) or **increasing order** (for min). The front of the deque is always the current window's max/min.

```
Sliding Window Maximum — nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3

Deque stores INDICES (values shown for clarity).
We maintain decreasing order of values.

i=0: val=1   deque=[]       → push 1       deque=[1]
i=1: val=3   deque=[1]      → 1<3, pop 1   deque=[]
                             → push 3       deque=[3]
i=2: val=-1  deque=[3]      → -1<3, keep   deque=[3,-1]
  Window [1,3,-1] formed. Max = front = 3

i=3: val=-3  deque=[3,-1]   → -3<-1, keep  deque=[3,-1,-3]
  Remove front? index of 3 is 1, window is [1,3]. 1 >= 3-3+1=1? Yes, still in window.
  Window [3,-1,-3]. Max = front = 3

i=4: val=5   deque=[3,-1,-3] → pop all < 5  deque=[]
                              → push 5      deque=[5]
  Remove front? index of 5 is 4, in window.
  Window [-1,-3,5]. Max = front = 5

i=5: val=3   deque=[5]       → 3<5, keep   deque=[5,3]
  Window [-3,5,3]. Max = front = 5

i=6: val=6   deque=[5,3]     → pop 3, pop 5 (index 4 is out of window [4,5,6]?)
  Actually: front index=4, window start=6-3+1=4. 4>=4, still in.
  But 5<6 and 3<6, pop both. deque=[6]
  Window [5,3,6]. Max = front = 6

i=7: val=7   deque=[6]       → 6<7, pop    deque=[]
                              → push 7      deque=[7]
  Window [3,6,7]. Max = front = 7

Result: [3, 3, 5, 5, 6, 7]
```

#### Full Code — Sliding Window Maximum (LeetCode 239)

```ts
function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = [];
  const deque: number[] = []; // stores indices, front = max

  for (let i = 0; i < nums.length; i++) {
    // Remove indices that are out of the window
    while (deque.length > 0 && deque[0] <= i - k) {
      deque.shift();
    }

    // Maintain decreasing order: remove smaller elements from back
    while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
      deque.pop();
    }

    deque.push(i);

    // Window is fully formed when i >= k - 1
    if (i >= k - 1) {
      result.push(nums[deque[0]]); // front of deque = max
    }
  }

  return result;
}
```

#### Why This Works in O(n)

Each index is pushed into the deque exactly once and popped at most once. Even though there are `while` loops inside the `for` loop, the total number of push + pop operations across all iterations is at most `2n`. So the amortized cost per element is O(1).

#### Monotonic Deque — Min Variant

For sliding window **minimum**, simply flip the comparison: remove elements from the back that are **larger** than the incoming element.

```ts
// For max: remove from back while back <= incoming
while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
  deque.pop();
}

// For min: remove from back while back >= incoming
while (deque.length > 0 && nums[deque[deque.length - 1]] >= nums[i]) {
  deque.pop();
}
```

#### When to Use Monotonic Deque

| Problem | Signal |
|---|---|
| Sliding Window Maximum/Minimum | Direct application |
| Shortest Subarray with Sum >= K (LC 862) | Deque on prefix sums |
| Constrained Subsequence Sum (LC 1425) | DP + deque for max in window |
| Jump Game VI (LC 1696) | DP + deque |
| Longest Continuous Subarray (LC 1438) | Two deques (max and min) |

#### Real World
> **[Real-time video processing]** — Video streaming encoders compute rolling maximum and minimum pixel values within a moving window to detect scene changes. A monotonic deque enables O(1) amortized updates versus O(k) with a plain array, critical for 60fps real-time pipelines.

#### Practice
1. Given an array and window size k, return the maximum value in each window of size k (Sliding Window Maximum / LeetCode 239). Implement using a monotonic deque storing indices.
2. Given an array, find the length of the longest subarray where the absolute difference between max and min is at most k (Longest Continuous Subarray with Absolute Diff ≤ Limit / LeetCode 1438). Use two deques.
3. The monotonic deque approach for sliding window maximum is O(n) despite the inner `while` loop. Explain the amortized argument: how many total push and pop operations occur across all n iterations?

---

### Complexity Summary

| Pattern | Time | Space | Why |
|---|---|---|---|
| Fixed window (numeric) | O(n) | O(1) | Each element visited once, constant state |
| Fixed window (string/freq) | O(n) | O(k) or O(alphabet) | Frequency map bounded by window or alphabet |
| Variable window | O(n) | O(n) worst case | Each element enters/leaves once; map may hold all elements |
| Monotonic deque | O(n) | O(k) | Each index pushed/popped at most once; deque bounded by k |

**Why O(n) and not O(n\*k)?** The two-pointer technique looks like it could do O(n) work for each `right` step (since `left` can advance many times). But across ALL iterations, `left` advances at most `n` times total. So the total work from both pointers combined is O(n) + O(n) = O(n).

#### Real World
> **[Data engineering / ETL pipelines]** — Stream processing systems choose between fixed-window aggregation (O(1) per element, bounded memory) and variable-window aggregation (O(n) worst-case memory) based on query type, exactly mirroring these complexity trade-offs in production data infrastructure.

#### Practice
1. Given an array and a sliding window of size k, compute the maximum element in each window in O(n) time. Compare the time and space usage between the deque solution and a sorted-set solution.
2. Explain why the variable-size window approach is O(n) total even though the `left` pointer can jump multiple positions in a single iteration of the outer loop.
3. For the "minimum size subarray sum" problem, should you use a fixed or variable window? What specifically about the problem statement tells you the window size is variable, not fixed?

## ELI5

Imagine you're on a train looking out the window. Your window frame shows exactly 3 houses at a time. As the train moves, one house leaves your view on the left and a new one enters on the right.

```
Houses: [🏠 🏡 🏘 🏚 🏠 🏡]
Window size: 3

Position 1:  [🏠 🏡 🏘] 🏚 🏠 🏡    sum = 3
Position 2:   🏠 [🏡 🏘 🏚] 🏠 🏡   sum = 4  (remove 🏠, add 🏚)
Position 3:   🏠 🏡 [🏘 🏚 🏠] 🏡   sum = 3  (remove 🏡, add 🏠)
Position 4:   🏠 🏡 🏘 [🏚 🏠 🏡]   sum = 3  (remove 🏘, add 🏡)

Max sum window = 4 (position 2)
```

Without sliding window, you'd add up all 3 houses fresh each time. With sliding window, you just **add one house on the right and remove one on the left** — constant work per step.

**Variable-size windows** are like adjusting binoculars. Zoom in (shrink left) when you've seen too much, zoom out (expand right) to see more:

```
Find the longest substring with no repeated letters:
"abcba"

right=0: window=[a]         valid → length=1
right=1: window=[ab]        valid → length=2
right=2: window=[abc]       valid → length=3
right=3: window=[abcb]      INVALID! 'b' repeated
  → shrink left: remove 'a' → [bcb]  still invalid
  → shrink left: remove 'b' → [cb]   valid! length=2
right=4: window=[cba]       valid → length=3

Answer: 3 (either "abc" or "cba")
```

**The key insight:** each element enters the window once (from the right) and leaves once (from the left). So the total work is O(n) — the window never goes backwards.

## Poem

Slide a window, left to right,
Keep the frame exactly tight.
Add the new, remove the old,
Watch the answer now unfold.

Fixed in size or free to grow,
Shrink the left when limits blow.
Every element enters once,
Leaves just once — no second hunts.

Substrings, sums, or distinct count,
Sliding windows — paramount.

## Template

```ts
// Variable-size sliding window template
function slidingWindow(s: string): number {
  const freq = new Map<string, number>();
  let left = 0;
  let result = 0;

  for (let right = 0; right < s.length; right++) {
    // Expand: add s[right] to the window
    freq.set(s[right], (freq.get(s[right]) ?? 0) + 1);

    // Shrink: move left pointer until window is valid
    while (/* window is invalid */ false) {
      freq.set(s[left], freq.get(s[left])! - 1);
      if (freq.get(s[left]) === 0) freq.delete(s[left]);
      left++;
    }

    // Update result with the current valid window
    result = Math.max(result, right - left + 1);
  }

  return result;
}

// Fixed-size sliding window template
function fixedWindow(nums: number[], k: number): number {
  let windowSum = 0;
  let maxSum = -Infinity;

  for (let i = 0; i < nums.length; i++) {
    windowSum += nums[i];

    if (i >= k) {
      windowSum -= nums[i - k]; // remove element leaving the window
    }

    if (i >= k - 1) {
      maxSum = Math.max(maxSum, windowSum);
    }
  }

  return maxSum;
}
```
