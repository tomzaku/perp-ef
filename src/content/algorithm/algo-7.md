---
id: algo-7
title: Encode and Decode Strings
category: Algorithm
subcategory: "Arrays & Hashing"
difficulty: Medium
pattern: String Manipulation
companies: [Google]
timeComplexity: O(n) where n is total characters across all strings
spaceComplexity: O(1) extra space (excluding output)
keyTakeaway: Use a length-prefix encoding scheme (length + delimiter + string) to avoid ambiguity. This handles any character in the strings including the delimiter itself.
similarProblems: [Serialize and Deserialize Binary Tree, Count and Say, String Compression]
leetcodeUrl: https://leetcode.com/problems/encode-and-decode-strings/
---

Design an algorithm to encode a list of strings to a single string and decode it back to the original list of strings. The encoded string should be transmittable over a network and decodable without ambiguity.

## Examples

**Input:** ["hello","world"]
**Output:** ["hello","world"]
**Explanation:** The encode function converts the list to a single string, and decode converts it back.


## Solution

```js
function encode(strs) {
  let encoded = '';
  for (const s of strs) {
    encoded += s.length + '#' + s;
  }
  return encoded;
}

function decode(str) {
  const result = [];
  let i = 0;
  while (i < str.length) {
    let j = i;
    while (str[j] !== '#') j++;
    const length = parseInt(str.substring(i, j));
    const s = str.substring(j + 1, j + 1 + length);
    result.push(s);
    i = j + 1 + length;
  }
  return result;
}
```

## Explanation

APPROACH: Length-Prefix Encoding

Encode each string as: [length]#[string]. The length tells us exactly how many characters to read, so even if the string contains '#', there's no ambiguity.

```
Encoding ["hello", "world"]:

  "hello" → "5#hello"
  "world" → "5#world"
  Result:    "5#hello5#world"
```

DECODING WALKTHROUGH with "5#hello5#world":

```
Step   i   find '#'   length   extract            result
────   ─   ────────   ──────   ─────────────────  ───────────
 1     0   j=1        5        str[2..7]="hello"  ["hello"]
 2     7   j=8        5        str[9..14]="world" ["hello","world"]
```

WHY THIS WORKS:
- The length prefix is unambiguous — we read digits until '#', then extract exactly that many chars
- Handles empty strings ("0#"), strings with '#' in them, any character
- O(n) time, single pass for both encode and decode

## Diagram

```mermaid
graph TD
  subgraph Encode
    A[Words list] --> B["For each word: length + # + word"]
    B --> C["Output: 5#Hello5#World"]
  end
  subgraph Decode
    D[Read encoded string] --> E[Read digits until #]
    E --> F[Extract substring of that length]
    F --> G[Repeat until end]
    G --> H[Return words list]
  end
```
