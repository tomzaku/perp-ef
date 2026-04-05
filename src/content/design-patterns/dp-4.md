---
id: dp-4
title: Interface Segregation Principle
category: Design Patterns
subcategory: SOLID
difficulty: Medium
priority: good-to-know
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

## Explanation

**The fat interface problem:** When you pass a large object/service to a component, that component now implicitly depends on everything in it — even things it doesn't use. This means:
- Tests need to mock the entire large object, even the unused parts
- Changing any part of the large interface potentially impacts all its consumers
- Components become tightly coupled to things they don't care about

**ISP in JS without formal interfaces:** JavaScript doesn't have `interface` keyword like TypeScript/Java, but the principle applies to:
- **Props**: Pass only the data a component needs, not the full Redux store
- **Parameters**: Destructure to signal exactly what's needed
- **Service objects**: Split large services into focused ones (Reader, Writer, Admin)
- **TypeScript interfaces**: Define narrow interfaces for each use case

**The practical test:** Look at a function parameter. If you removed half the fields and the function still works, those fields shouldn't be required.

**ISP and testability:** Small, focused interfaces make mocking trivial. A `UserReader` mock only needs `getUser()`. A mock for `MonolithicUserService` needs all 6 methods — most of which are irrelevant to the test.

## Diagram

```
FAT INTERFACE — forces all clients to know about everything:

  ┌──────────────────────────────────┐
  │       MonolithicUserService      │
  │  getUser()     updateUser()      │
  │  deleteUser()  getUserPosts()    │
  │  sendNotification() exportData() │
  └────────┬──────────┬─────────────┘
           │          │
  ┌────────▼──┐  ┌────▼──────────────────────┐
  │ Profile   │  │       AdminPanel           │
  │ display   │  │ Needs ALL of these.        │
  │ uses only │  │ Profile display SHOULDN'T  │
  │ getUser() │  │ have access to deleteUser()│
  └───────────┘  └────────────────────────────┘


SEGREGATED — each client gets only what it needs:

  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐
  │  UserReader  │  │  UserWriter  │  │  UserSocial    │
  │  getUser()   │  │ updateUser() │  │ getUserPosts() │
  └──────┬───────┘  │ deleteUser() │  └────────────────┘
         │          └──────────────┘
         │
  ┌──────▼──────────┐
  │  ProfileDisplay │  ← Only depends on UserReader
  │  No access to   │    Can't accidentally call deleteUser()
  │  delete/export  │    Mocking is trivial: just mock getUser()
  └─────────────────┘
```

## ELI5

Imagine a TV remote with 200 buttons: all the regular ones PLUS buttons for your washing machine, microwave, car alarm, and sprinkler system.

You just want to watch TV. But now you have to know about 200 buttons to not accidentally start a wash cycle.

**ISP says: give people only the buttons they need.**

```
Fat interface (bad remote):
  ┌─────────────────────────────────────┐
  │ vol+ vol- ch+ ch- input mute power  │
  │ wash spin dry delicate    ← washing │
  │ nuke reheat defrost popcorn ← micro │
  │ lock alarm trunk panic    ← car     │
  └─────────────────────────────────────┘
  You wanted TV. Now you must understand washing machines too.

Segregated interfaces (right remotes):
  TV remote:        [vol+ vol- ch+ input mute power]
  Washer remote:    [wash spin dry delicate]
  Microwave remote: [nuke reheat defrost popcorn]

  Each device gets the exact remote it needs — nothing more.
```

In code: a profile display component only needs `getUser()`. Giving it the full service with `deleteUser()` and `exportData()` is like handing a viewer the TV remote plus the washing machine remote. It's confusing, risky, and hard to test.
