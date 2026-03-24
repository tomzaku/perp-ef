---
id: algo-82
title: Simplify Path
category: Algorithm
subcategory: Stack
difficulty: Medium
pattern: Stack
companies: [Meta, Amazon, Google]
timeComplexity: O(n)
spaceComplexity: O(n)
keyTakeaway: "Split the path by '/', use a stack to process each component. Push directory names, pop on '..', ignore '.' and empty strings. Join the stack for the canonical path."
similarProblems: [Valid Parentheses, Decode String]
leetcodeUrl: https://leetcode.com/problems/simplify-path/
---

Given an absolute Unix-style file path, simplify it to its **canonical path**. The canonical path should: start with `/`, separate directories with a single `/`, not end with a trailing `/` (unless root), and resolve `.` (current) and `..` (parent) properly.

## Examples

**Input:** path = "/home/"
**Output:** "/home"

**Input:** path = "/home//foo/"
**Output:** "/home/foo"

**Input:** path = "/home/user/Documents/../Pictures"
**Output:** "/home/user/Pictures"
**Explanation:** `..` goes up one directory from Documents to user, then enters Pictures.

**Input:** path = "/../"
**Output:** "/"
**Explanation:** Cannot go above root.

## Solution

```js
function simplifyPath(path) {
  const stack = [];
  const parts = path.split('/');

  for (const part of parts) {
    if (part === '..') {
      stack.pop();
    } else if (part !== '' && part !== '.') {
      stack.push(part);
    }
  }

  return '/' + stack.join('/');
}
```

## Explanation

APPROACH: Stack to track directory levels

Split on `/`, process each token. Push valid directory names, pop on `..`, ignore `.` and empty strings.

```
path = "/home/user/Documents/../Pictures"

Split: ["", "home", "user", "Documents", "..", "Pictures"]

Part          Action      Stack
────          ──────      ─────
""            skip        []
"home"        push        ["home"]
"user"        push        ["home", "user"]
"Documents"   push        ["home", "user", "Documents"]
".."          pop         ["home", "user"]
"Pictures"    push        ["home", "user", "Pictures"]

Result: "/" + "home/user/Pictures" = "/home/user/Pictures"
```

WHY THIS WORKS:
- Stack naturally represents the current directory depth
- `..` = pop = go up one level
- `.` and empty strings are no-ops
- Joining with `/` gives the canonical form

## TestConfig
```json
{
  "functionName": "simplifyPath",
  "testCases": [
    { "args": ["/home/"], "expected": "/home" },
    { "args": ["/home//foo/"], "expected": "/home/foo" },
    { "args": ["/home/user/Documents/../Pictures"], "expected": "/home/user/Pictures" },
    { "args": ["/../"], "expected": "/" },
    { "args": ["/"], "expected": "/", "isHidden": true },
    { "args": ["/a/./b/../../c/"], "expected": "/c", "isHidden": true },
    { "args": ["/a/../../b/../c//.//"], "expected": "/c", "isHidden": true },
    { "args": ["/a/b/c/d"], "expected": "/a/b/c/d", "isHidden": true },
    { "args": ["/..."], "expected": "/...", "isHidden": true }
  ]
}
```
