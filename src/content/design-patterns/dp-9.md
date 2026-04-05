---
id: dp-9
title: Singleton Pattern
category: Design Patterns
subcategory: Creational Patterns
difficulty: Easy
priority: essential
pattern: Creational Patterns
companies: [Amazon, Google]
timeComplexity: O(1) for instance access
spaceComplexity: O(1) — only one instance exists
keyTakeaway: "Singleton ensures a single shared instance — in JS, ES modules are natural singletons; use class-based ones only when you need lazy initialization or instance control."
similarProblems: [Factory Pattern, Module Pattern, Dependency Injection]
---

The Singleton Pattern ensures a class has only one instance and provides a global point of access to it. In JavaScript, ES modules are singletons by nature — a module is evaluated once and cached.

**Frontend use cases:**
- Configuration manager (app-wide settings)
- Logger (single log destination)
- Connection pool or API client
- Application state store

**Caution:** Singletons can be problematic in testing (shared state between tests) and can act as hidden global state. Use them judiciously.

**In JS, there are multiple ways to implement Singleton:**
1. ES module (simplest — the module itself is the singleton)
2. Class with static instance
3. Closure-based

## Solution

```js
// ============================
// Approach 1: ES Module Singleton (most idiomatic JS)
// ============================
// config.js — the module IS the singleton
// const config = { apiUrl: 'https://api.example.com', timeout: 5000 };
// export default config;
// Every file that imports config gets the same object.

// ============================
// Approach 2: Class-based Singleton
// ============================
class ConfigManager {
  static #instance = null;
  #config = {};

  constructor() {
    if (ConfigManager.#instance) {
      return ConfigManager.#instance;
    }
    this.#config = {
      apiUrl: 'https://api.example.com',
      timeout: 5000,
      retries: 3,
    };
    ConfigManager.#instance = this;
  }

  get(key) { return this.#config[key]; }
  set(key, value) { this.#config[key] = value; }
  getAll() { return { ...this.#config }; }

  static getInstance() {
    if (!ConfigManager.#instance) new ConfigManager();
    return ConfigManager.#instance;
  }

  static _resetForTesting() {
    ConfigManager.#instance = null;
  }
}

const config1 = new ConfigManager();
const config2 = new ConfigManager();
console.log(config1 === config2); // true — same instance!

config1.set('apiUrl', 'https://staging.example.com');
console.log(config2.get('apiUrl')); // 'https://staging.example.com'

// ============================
// Approach 3: Closure-based Singleton
// ============================
const createLogger = (() => {
  let instance;

  function Logger() {
    this.logs = [];
  }

  Logger.prototype.log = function(message) {
    const entry = `[${new Date().toISOString()}] ${message}`;
    this.logs.push(entry);
    console.log(entry);
  };

  Logger.prototype.getHistory = function() {
    return [...this.logs];
  };

  return {
    getInstance() {
      if (!instance) instance = new Logger();
      return instance;
    }
  };
})();

const logger1 = createLogger.getInstance();
const logger2 = createLogger.getInstance();
console.log(logger1 === logger2); // true

logger1.log('App started');
logger2.log('User logged in');
console.log(logger1.getHistory().length); // 2 — shared state
```

## Explanation

**Why Singleton exists:** Some resources should only exist once — a database connection pool, an application config, a global event bus. Creating multiple instances would waste memory, cause inconsistencies, or create race conditions.

**ES modules ARE singletons in JavaScript:** When you `import config from './config.js'`, the module is evaluated once and the same object is returned to every importer. You get Singleton for free — no class needed.

**The class-based Singleton uses a static reference** to store the one instance. The constructor checks if the instance already exists; if so, returns the existing one. The `getInstance()` static method provides a cleaner access point.

**Testing caveat:** Singletons are global state. Between tests, you must reset the singleton or tests bleed into each other. The `_resetForTesting()` method in the example exists for this reason.

**When to avoid Singleton:**
- When you need multiple isolated instances (e.g., multiple database connections)
- When testability matters and you can't easily reset
- When you're tempted to use it "because it's convenient" — that's usually just global state in disguise

**Module singleton pattern (simplest):**
```js
// config.js — just export a plain object. Done.
export const config = { apiUrl: '...', timeout: 5000 };
// Every importer gets the same reference. No class needed.
```

## Diagram

```
SINGLETON — only one instance ever exists:

  First call: new ConfigManager()
  ┌─────────────────────────────────┐
  │       ConfigManager             │
  │  static #instance = null        │
  │                                 │
  │  constructor() {                │
  │    if (#instance) return #inst  │ ← returns existing instance!
  │    #instance = this             │ ← first time: store self
  │  }                              │
  └────────────────┬────────────────┘
                   │ stored
                   ▼
              [ ONE OBJECT in memory ]
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
  moduleA      moduleB      moduleC
  const c = new ConfigManager()
             All get the SAME object reference


ES MODULE SINGLETON (even simpler):

  config.js: export default { apiUrl: '...', timeout: 5000 }
                                    ↑
  importA → same object reference ──┤
  importB → same object reference ──┤  Node/browser module cache
  importC → same object reference ──┘  ensures single evaluation
```

## ELI5

Imagine your school. There is one principal. No matter how many times someone asks "Who is the principal?", they always get the same person — not a new principal each time.

That's a Singleton: **no matter how many times you ask for the instance, you always get the same one.**

```
Without Singleton:
  new ConfigManager()  → creates a new config object #1
  new ConfigManager()  → creates another config object #2  ← different!

  Object #1 has apiUrl = "https://api.example.com"
  Someone changes object #2's apiUrl = "https://staging"
  Object #1 still says "production" — inconsistency!

With Singleton:
  new ConfigManager()  → creates config object (first time)
  new ConfigManager()  → returns THE SAME config object
  ConfigManager.getInstance() → same object again

  Changing apiUrl anywhere changes it EVERYWHERE — consistent.

In JavaScript, the simplest singleton is just a module:
  // config.js
  export default { apiUrl: '...', timeout: 5000 };

  // app.js    → imports same object
  // utils.js  → imports same object
  // api.js    → imports same object
  All three see the same config — module cache = free singleton!
```
