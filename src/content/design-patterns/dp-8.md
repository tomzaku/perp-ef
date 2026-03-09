---
id: dp-8
title: Abstract Classes vs Interfaces
category: Design Patterns
subcategory: OOP
difficulty: Medium
pattern: OOP Fundamentals
companies: [Microsoft, Google]
timeComplexity: N/A - conceptual
spaceComplexity: N/A - conceptual
keyTakeaway: Use abstract classes when subclasses share behavior; use interfaces (duck typing in JS) when unrelated objects need a common contract.
similarProblems: [Liskov Substitution, Polymorphism, Strategy Pattern]
---

Abstract classes and interfaces both define contracts, but they serve different purposes.

**Abstract Class:** Cannot be instantiated directly; may contain both implemented methods (shared logic) and abstract methods (must be overridden). Use when subclasses share common behavior.

**Interface:** A pure contract defining what methods/properties an object must have, with no implementation. Use when unrelated classes need a common shape.

**In JavaScript:**
- Abstract classes: base classes that throw on direct instantiation or un-overridden methods
- Interfaces: enforced through duck typing — if it has the right methods, it satisfies the interface
- TypeScript gives formal `abstract class` and `interface` keywords

## Solution

```js
// ============================
// Abstract Class in JS
// ============================
class DataStore {
  constructor() {
    if (new.target === DataStore) {
      throw new Error('DataStore is abstract — cannot instantiate directly');
    }
  }

  // Shared implementation — all subclasses get this
  async fetchAndCache(key) {
    const cached = await this.get(key);
    if (cached) return cached;
    const fresh = await this.fetchFresh(key);
    await this.set(key, fresh);
    return fresh;
  }

  // Abstract methods — subclasses MUST implement
  async get(key) { throw new Error('get() must be implemented'); }
  async set(key, value) { throw new Error('set() must be implemented'); }
  async fetchFresh(key) { throw new Error('fetchFresh() must be implemented'); }
}

class MemoryStore extends DataStore {
  constructor() {
    super();
    this.data = new Map();
  }
  async get(key) { return this.data.get(key) || null; }
  async set(key, value) { this.data.set(key, value); }
  async fetchFresh(key) { return `fresh-data-for-${key}`; }
}

// Both inherit fetchAndCache() logic without reimplementing it
const store = new MemoryStore();
store.fetchAndCache('user:1').then(v => console.log(v)); // 'fresh-data-for-user:1'

// ============================
// Interface (duck typing) in JS
// ============================
// Serializable interface: serialize() -> string, static deserialize(str) -> object

class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  serialize() {
    return JSON.stringify({ name: this.name, email: this.email });
  }
  static deserialize(data) {
    const { name, email } = JSON.parse(data);
    return new User(name, email);
  }
}

class Settings {
  constructor(theme, lang) {
    this.theme = theme;
    this.lang = lang;
  }
  serialize() {
    return JSON.stringify({ theme: this.theme, lang: this.lang });
  }
  static deserialize(data) {
    const { theme, lang } = JSON.parse(data);
    return new Settings(theme, lang);
  }
}

// Works with anything that satisfies the Serializable interface
function saveToStorage(key, serializable) {
  localStorage.setItem(key, serializable.serialize());
}

// Runtime interface check utility
function implementsInterface(obj, methods) {
  return methods.every(method => typeof obj[method] === 'function');
}

const user = new User('Alice', 'alice@test.com');
console.log(implementsInterface(user, ['serialize'])); // true

// Key difference:
// Abstract class: partial implementation + enforced contract, single inheritance
// Interface: pure contract, multiple "implementation", duck typed in JS
```
