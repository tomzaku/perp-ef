---
id: dp-4
title: Interface Segregation Principle
category: Design Patterns
subcategory: SOLID
difficulty: Medium
pattern: SOLID Principles
companies: [Amazon, Google]
timeComplexity: N/A - conceptual
spaceComplexity: N/A - conceptual
keyTakeaway: Clients should only depend on the methods and data they actually use — keep interfaces small and focused.
similarProblems: [Single Responsibility Principle, Dependency Inversion, Facade Pattern]
---

The Interface Segregation Principle (ISP) states that no client should be forced to depend on methods it does not use. Instead of one large interface, prefer many small, focused interfaces.

**Why it matters in frontend/JS:**
- A component that only needs "read" access shouldn't receive a full CRUD service with delete capabilities.
- A rendering function that only needs `{ name, avatar }` shouldn't require a full User object with 30 fields.
- Props interfaces that are too broad lead to tight coupling and make testing harder.

**In JS (without formal interfaces):**
- Pass only the data/methods a function actually needs
- Destructure props to take only what's required
- Split large utility objects into focused ones

## Solution

```js
// ❌ BAD: Fat interface — forces clients to depend on methods they don't use
class MonolithicUserService {
  getUser(id) { /* fetch */ }
  updateUser(id, data) { /* update */ }
  deleteUser(id) { /* delete */ }
  getUserPosts(id) { /* posts */ }
  sendNotification(id, msg) { /* notify */ }
  exportUserData(id) { /* export */ }
}
// A profile display component doesn't need delete or export!

// ✅ GOOD: Segregated — each client gets only what it needs

class UserReader {
  async getUser(id) {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  }
}

class UserWriter {
  async updateUser(id, data) {
    return fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }
  async deleteUser(id) {
    return fetch(`/api/users/${id}`, { method: 'DELETE' });
  }
}

class UserSocial {
  async getUserPosts(id) {
    const res = await fetch(`/api/users/${id}/posts`);
    return res.json();
  }
}

// Profile display only needs UserReader
function renderProfile(reader, userId) {
  return reader.getUser(userId).then(user => {
    console.log(`Name: ${user.name}, Email: ${user.email}`);
  });
}

// ✅ Function parameters: pass only what's needed
// ❌ BAD
function formatAddress(user) {
  return `${user.address.street}, ${user.address.city}, ${user.address.zip}`;
}

// ✅ GOOD — depends only on what it uses
function formatAddressBetter({ street, city, zip }) {
  return `${street}, ${city}, ${zip}`;
}

console.log(formatAddressBetter({ street: '123 Main', city: 'NYC', zip: '10001' }));
```
