---
id: dp-1
title: Single Responsibility Principle
category: Design Patterns
subcategory: SOLID
difficulty: Easy
priority: essential
pattern: SOLID Principles
companies: [Google, Meta, Amazon]
timeComplexity: N/A - conceptual
spaceComplexity: N/A - conceptual
keyTakeaway: "Each module should have exactly one reason to change — separate fetching, caching, formatting, and validation into distinct units."
similarProblems: [Open/Closed Principle, Separation of Concerns, Facade Pattern]
---

The Single Responsibility Principle (SRP) states that a class or module should have one, and only one, reason to change. In frontend development, this translates to keeping components, functions, and modules focused on a single concern.

**Why it matters in frontend/JS:**
- Components that handle fetching, state management, and rendering become hard to test and reuse.
- A function that validates AND submits a form violates SRP — if validation rules change, the submit logic is unnecessarily touched.
- SRP encourages separating concerns: data fetching hooks, presentation components, utility functions, and state management should live apart.

**Signs of SRP violation:**
- A component file is hundreds of lines long
- A function has multiple "and" in its description ("fetches data AND transforms it AND caches it")
- Changing one feature breaks an unrelated feature in the same module

## Solution

```js
// ❌ BAD: One class does everything — fetching, caching, rendering logic
class UserManager {
  constructor() {
    this.cache = {};
  }

  async fetchUser(id) {
    if (this.cache[id]) return this.cache[id];
    const res = await fetch(`/api/users/${id}`);
    const user = await res.json();
    this.cache[id] = user;
    return user;
  }

  formatUserName(user) {
    return `${user.firstName} ${user.lastName}`;
  }

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// ✅ GOOD: Each module has a single responsibility

// 1. Data fetching only
class UserApi {
  async fetchUser(id) {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  }
}

// 2. Caching only
class Cache {
  constructor() {
    this.store = new Map();
  }
  get(key) { return this.store.get(key); }
  set(key, value) { this.store.set(key, value); }
  has(key) { return this.store.has(key); }
}

// 3. Formatting only
function formatUserName(user) {
  return `${user.firstName} ${user.lastName}`;
}

// 4. Validation only
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 5. Compose them together
class UserService {
  constructor(api, cache) {
    this.api = api;
    this.cache = cache;
  }

  async getUser(id) {
    if (this.cache.has(id)) return this.cache.get(id);
    const user = await this.api.fetchUser(id);
    this.cache.set(id, user);
    return user;
  }
}

// Usage
const service = new UserService(new UserApi(), new Cache());
const user = await service.getUser(1);
console.log(formatUserName(user));
```

## Explanation

**The core idea:** A module should have only one *reason to change*. "Reason to change" means a person or team who could request a modification. If your `UserManager` changes when the API format changes AND when the cache strategy changes AND when the display format changes — that's three reasons to change, which means three things that can break it.

**Why "one reason to change" is the right mental model:**
- Each concern is now independently changeable, testable, and replaceable
- `UserApi` changes only if the API contract changes
- `Cache` changes only if the caching strategy changes
- `formatUserName` changes only if display requirements change
- None of them affect each other

**The composing layer (`UserService`) is fine with multiple dependencies** — its job *is* to coordinate. The SRP violation is when a single unit does the work of multiple concerns.

**Frontend-specific applications:**
- Split React components into container (data) + presentational (UI) components
- Separate API calls into custom hooks (`useFetchUser`) from UI components
- Keep validation logic in dedicated validator files, not inside form submit handlers
- Use utility functions for pure transformations — they never need to know about state or side effects

**Common mistake:** Going too far and splitting into 50 tiny files. SRP is about *cohesion* — things that change together stay together. A `UserValidator` class with `validateEmail`, `validateName`, and `validateAge` is fine — they all change for the same reason (user validation rules).

## Diagram

```
BEFORE — One class, many reasons to change:

┌─────────────────────────────────────┐
│           UserManager               │  ← changes if API changes
│                                     │  ← changes if cache changes
│  fetchUser()   → HTTP + cache       │  ← changes if format changes
│  formatName()  → string formatting  │  ← changes if validation changes
│  validateEmail() → regex check      │
│  renderUser()  → DOM/JSX            │
└─────────────────────────────────────┘


AFTER — Each module has one reason to change:

┌────────────┐   ┌──────────┐   ┌───────────────┐   ┌─────────────┐
│  UserApi   │   │  Cache   │   │ formatUserName │   │ validateEmail│
│            │   │          │   │                │   │             │
│ fetchUser()│   │ get()    │   │ "${first}      │   │ /regex/.test│
│            │   │ set()    │   │  ${last}"      │   │             │
└────────────┘   └──────────┘   └───────────────┘   └─────────────┘
      ↑                ↑
      └────────────────┘
            ↓
    ┌──────────────────┐
    │   UserService    │  ← orchestrates, doesn't implement
    │   getUser(id)    │
    └──────────────────┘

Each box changes for ONE reason only. Changing the cache doesn't
touch the API. Changing the format doesn't touch the validation.
```

## ELI5

Imagine you have a Swiss Army knife. It has a blade, scissors, a screwdriver, a toothpick, and a corkscrew — all in one tool. That sounds useful, but:

- If the blade breaks, you have to throw away the scissors too
- If you want to upgrade just the screwdriver, you have to redesign the whole thing
- You can't lend just the scissors to a friend

**SRP says: give each tool its own handle.**

```
Swiss Army Knife (SRP violation):
  🔪 + ✂️ + 🪛 + 🦷 + 🍾 = one jumbled thing
  
  Problem: fixing one breaks another. Testing one means testing all.

SRP way:
  🔪  ✂️  🪛  🦷  🍾
  Each tool lives alone. Replace, test, or lend any one independently.
```

In code terms: a `UserManager` that fetches, caches, formats, and validates is a Swiss Army knife. Split it into `UserApi`, `Cache`, `formatUserName`, and `validateEmail` — each does exactly one job, and each can change independently.

**The test:** If you can describe what a function/class does without using the word "and," it probably follows SRP.
- ❌ "UserManager fetches users **and** caches them **and** formats their names"
- ✅ "UserApi fetches users from the API"
- ✅ "Cache stores and retrieves values by key"
