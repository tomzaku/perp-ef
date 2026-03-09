---
id: dp-1
title: Single Responsibility Principle
category: Design Patterns
subcategory: SOLID
difficulty: Easy
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
