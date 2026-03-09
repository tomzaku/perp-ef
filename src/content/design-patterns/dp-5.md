---
id: dp-5
title: Dependency Inversion Principle
category: Design Patterns
subcategory: SOLID
difficulty: Medium
pattern: SOLID Principles
companies: [Google, Meta, Amazon]
timeComplexity: N/A - conceptual
spaceComplexity: N/A - conceptual
keyTakeaway: "Depend on abstractions (interfaces/contracts), not concrete implementations — inject dependencies to enable testing and flexibility."
similarProblems: [Strategy Pattern, Factory Pattern, Interface Segregation]
---

The Dependency Inversion Principle (DIP) states that high-level modules should not depend on low-level modules — both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.

**Why it matters in frontend/JS:**
- If your component directly calls `fetch()`, you can't easily swap to GraphQL, mock it in tests, or add caching.
- If your app directly imports a specific state management library everywhere, migrating is painful.
- DIP enables testability, flexibility, and swappable implementations.

**In JS this means:**
- Accept dependencies as parameters (dependency injection) rather than importing them directly
- Program against interfaces (or shapes) rather than concrete implementations
- Use factory functions or constructor injection

## Solution

```js
// ❌ BAD: High-level module depends directly on low-level module
class BadOrderService {
  async placeOrder(order) {
    // Directly coupled to fetch — can't test or swap
    const res = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
    console.log('Order placed');
    return res.json();
  }
}

// ✅ GOOD: Depend on abstractions, inject dependencies
class HttpClient {
  async post(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }
}

class Logger {
  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
}

// High-level module depends on injected abstractions
class OrderService {
  constructor(httpClient, logger) {
    this.http = httpClient;
    this.logger = logger;
  }

  async placeOrder(order) {
    const result = await this.http.post('/api/orders', order);
    this.logger.log('Order placed successfully');
    return result;
  }
}

// Production
const orderService = new OrderService(new HttpClient(), new Logger());

// Testing — swap in mocks easily!
class MockHttpClient {
  async post(url, data) {
    return { id: 1, ...data, status: 'created' };
  }
}

class MockLogger {
  constructor() { this.logs = []; }
  log(message) { this.logs.push(message); }
}

const testService = new OrderService(new MockHttpClient(), new MockLogger());
testService.placeOrder({ item: 'book', qty: 1 }).then(result => {
  console.log(result); // { id: 1, item: 'book', qty: 1, status: 'created' }
});

// ✅ Frontend DI with factory function
function createApp({ storage, api, analytics }) {
  return {
    savePreference(key, value) {
      storage.set(key, value);
      analytics.track('preference_saved', { key });
    },
    async loadData() {
      return api.get('/data');
    }
  };
}
// Production: createApp({ storage: localStorage, api: httpClient, analytics: mixpanel })
// Test: createApp({ storage: new Map(), api: mockApi, analytics: { track: () => {} } })
```
