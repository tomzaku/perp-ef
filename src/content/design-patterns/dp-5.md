---
id: dp-5
title: Dependency Inversion Principle
category: Design Patterns
subcategory: SOLID
difficulty: Medium
priority: essential
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

## Explanation

**High-level vs low-level modules:** High-level = business logic (what the app *does*). Low-level = implementation details (how it *does it* — HTTP, localStorage, console). DIP says: don't let your business logic hardcode which implementation it uses.

**Why hardcoded dependencies hurt:**
- You can't test `OrderService` without making real HTTP calls
- To switch from REST to GraphQL, you'd rewrite `OrderService`
- To add a caching layer, you'd modify every place that calls `fetch` directly

**Dependency Injection (DI) is the mechanism:** Instead of creating dependencies inside, *inject* them from outside. The class asks "give me something that can do HTTP" rather than "I'll use fetch directly."

**The inversion:** Without DIP, high-level code depends on low-level code. With DIP, both depend on a shared abstraction:
```
Without DIP:  OrderService → fetch() (concrete)
With DIP:     OrderService → HttpClient (abstract)
              HttpClient ← FetchHttpClient (concrete implements abstract)
```

**Testing becomes trivial:** Swap `FetchHttpClient` for `MockHttpClient` in tests. No network calls. Deterministic results. Fast.

**Frontend DI patterns:**
- Constructor injection (classes)
- Parameter injection (functions)
- React Context (inject dependencies to the whole component tree)
- Module mocking in tests (Jest's `jest.mock()`)

## Diagram

```
WITHOUT DIP — High-level depends on low-level:

  ┌──────────────────┐        ┌────────────────┐
  │   OrderService   │───────►│  fetch() / HTTP │
  │  (business logic)│        │  (low-level)    │
  └──────────────────┘        └────────────────┘

  Problem: Can't swap HTTP for GraphQL without rewriting OrderService.
  Problem: Can't test OrderService without making real HTTP calls.


WITH DIP — Both depend on an abstraction:

              ┌────────────────────┐
              │    HttpClient      │  ← abstraction (interface/contract)
              │  post(url, data)   │
              └─────────┬──────────┘
                        │ implements
           ┌────────────┼──────────────┐
           ▼            ▼              ▼
  ┌──────────────┐ ┌──────────┐ ┌────────────┐
  │FetchHttpClient│ │MockHttp  │ │GraphQLHttp │
  │ (production) │ │(testing) │ │ (future)   │
  └──────────────┘ └──────────┘ └────────────┘

  ┌──────────────────┐
  │   OrderService   │ ← depends on HttpClient abstraction
  │ constructor(http) │   doesn't know/care which one
  └──────────────────┘

  Production: new OrderService(new FetchHttpClient())
  Testing:    new OrderService(new MockHttpClient())
```

## ELI5

Imagine a lamp. It doesn't care what power station generated the electricity. It has a **standard plug** (abstraction). Any power source that provides the standard socket can power it.

If the lamp had a hardwired cable directly into one specific power station, you could never move it or test it in a different room.

```
Without DIP (hardwired):
  Lamp ───────────────────► PowerStation A
  (lamp is useless without exactly PowerStation A)
  (can't test the lamp in isolation)

With DIP (pluggable):
  Lamp ──► [socket interface] ◄── PowerStation A (production)
                             ◄── Battery pack (testing)
                             ◄── PowerStation B (future upgrade)

  The lamp works with ANY power source that fits the socket.
  The power source can change without touching the lamp at all.
```

In code:
- `OrderService` is the lamp
- `fetch()` is the specific power station
- `HttpClient` is the standard socket
- `MockHttpClient` is the battery pack for testing

**Inject dependencies → test easily, swap implementations freely, change one thing without breaking another.**
