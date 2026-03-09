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

## Explanation

**JavaScript doesn't have true interfaces** — but TypeScript adds them, and abstract classes can be simulated in plain JS by throwing in the constructor/methods.

**Abstract class = partial implementation + contract:**
- Can have concrete methods (shared behavior for all subclasses)
- Can have abstract methods (must be overridden)
- Subclasses get the shared behavior for free
- Use when: you want to share code AND enforce a contract

**Interface = pure contract:**
- No implementation, only method signatures
- A class can implement multiple interfaces
- Use when: you want to specify what a type can DO, without any shared implementation

**TypeScript practical guidance:**
- `interface` for objects/function shapes you receive from outside
- `abstract class` when you have default behavior to share across subtypes
- Prefer `interface` for public APIs — easier to implement, extend, and mock

**In plain JS:** Use throw-in-base-class to simulate abstract methods:
```js
class AbstractLogger {
  log(msg) { throw new Error('log() must be implemented'); }
}
```

## Diagram

```
ABSTRACT CLASS — partial implementation + contract:

  ┌─────────────────────────────────┐
  │         AbstractLogger          │
  │  formatMessage(msg) { ... }     │  ← concrete (shared, free for subclasses)
  │  abstract log(msg) { throw }    │  ← must be overridden
  └────────────────┬────────────────┘
         ┌─────────┴──────────┐
  ┌──────▼──────┐      ┌──────▼──────┐
  │ConsoleLogger│      │ FileLogger   │
  │ log(msg) {  │      │ log(msg) {   │
  │  console.log│      │  fs.write    │
  │ }           │      │ }            │
  └─────────────┘      └─────────────┘
  Both get formatMessage() for free ↑


INTERFACE — pure contract, no implementation:

  interface Serializable {         interface Loggable {
    serialize(): string            log(msg: string): void
    deserialize(s: string): T    }
  }

  class User implements Serializable, Loggable {
    // Must implement ALL methods from ALL interfaces
    serialize() { ... }
    deserialize() { ... }
    log() { ... }
  }

  Key: a class can implement MULTIPLE interfaces, but only EXTEND ONE class.
```

## ELI5

Imagine you're building a fast-food franchise.

**An abstract class is like a franchise template.** It gives you the standard kitchen layout, the cooking processes, and the basic recipes. But you MUST supply the secret sauce recipe — that part is required from each franchisee. Every location gets the shared infrastructure for free, but must fill in the specific part.

**An interface is like a certification requirement.** To get the "Health Approved" badge, you must have a functioning hand-washing station, temperature logs, and allergen labels. The certification doesn't tell you HOW to implement them — just that you MUST have them.

```
Abstract class (franchise template):
  McDo abstract class:
    ✅ standardKitchen()   ← shared, all locations get this
    ✅ standardFries()     ← shared
    ❌ makeSignatureBurger() ← MUST implement (abstract)

  McDoNYC extends McDo:
    makeSignatureBurger() { "NYC-style double patty" }  ← required!

Interface (certification):
  interface HealthCompliant:
    hasHandWashing(): boolean   ← just a requirement, no implementation
    hasAllergenLabels(): boolean

  McDo implements HealthCompliant:
    hasHandWashing() { return true; }   ← YOU implement how


When to use which:
  Abstract class → when you have SHARED CODE to give subclasses
  Interface → when you want to say "anything that can do X"
```
