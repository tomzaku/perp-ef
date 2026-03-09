---
id: dp-9
title: Singleton Pattern
category: Design Patterns
subcategory: Creational Patterns
difficulty: Easy
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
