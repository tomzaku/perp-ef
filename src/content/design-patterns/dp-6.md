---
id: dp-6
title: "Encapsulation, Abstraction, Inheritance, Polymorphism"
category: Design Patterns
subcategory: OOP
difficulty: Easy
priority: essential
pattern: OOP Fundamentals
companies: [Google, Amazon, Meta]
timeComplexity: N/A - conceptual
spaceComplexity: N/A - conceptual
keyTakeaway: "OOP organizes code around objects that encapsulate state, abstract complexity, inherit shared behavior, and respond polymorphically to shared interfaces."
similarProblems: [Composition vs Inheritance, SOLID Principles, Abstract Classes vs Interfaces]
---

The four pillars of Object-Oriented Programming are fundamental concepts that appear in frontend interviews. Even though JavaScript is multi-paradigm, OOP concepts are heavily used in frameworks, libraries, and application architecture.

**Encapsulation:** Bundling data and methods that operate on that data, restricting direct access to internals. In JS: closures, private fields (#), WeakMap-based privacy.

**Abstraction:** Hiding complex implementation details and exposing only the necessary interface. In JS: public API methods that hide internal complexity.

**Inheritance:** Creating new classes based on existing ones, inheriting properties and methods. In JS: prototype chain, class extends.

**Polymorphism:** Objects of different types responding to the same method call in different ways. In JS: duck typing, method overriding.

## Solution

```js
// ============================
// 1. ENCAPSULATION — private fields
// ============================
class BankAccount {
  #balance;

  constructor(initialBalance) {
    this.#balance = initialBalance;
  }

  deposit(amount) {
    if (amount <= 0) throw new Error('Amount must be positive');
    this.#balance += amount;
    return this.#balance;
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error('Insufficient funds');
    this.#balance -= amount;
    return this.#balance;
  }

  get balance() { return this.#balance; }
}

const account = new BankAccount(100);
account.deposit(50);    // 150
// account.#balance = 0; // SyntaxError — truly private!

// ============================
// 2. ABSTRACTION — hide complexity
// ============================
class EmailService {
  #connect() { /* SMTP handshake */ }
  #authenticate() { /* login */ }
  #formatHeaders(to, subject) { return { to, subject }; }

  // Simple public API
  send(to, subject, body) {
    this.#connect();
    this.#authenticate();
    const headers = this.#formatHeaders(to, subject);
    console.log('Sending email to', headers.to);
    return true;
  }
}

new EmailService().send('user@test.com', 'Hello', 'World');

// ============================
// 3. INHERITANCE — extend base class
// ============================
class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
  }
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }
  render() { throw new Error('render() must be implemented'); }
}

class Counter extends Component {
  constructor() {
    super({});
    this.state = { count: 0 };
  }
  increment() { this.setState({ count: this.state.count + 1 }); }
  render() { console.log(`Count: ${this.state.count}`); }
}

const counter = new Counter();
counter.increment(); // Count: 1

// ============================
// 4. POLYMORPHISM — same interface, different behavior
// ============================
class EmailNotification {
  send(msg) { console.log(`Email: ${msg}`); }
}

class SMSNotification {
  send(msg) { console.log(`SMS: ${msg}`); }
}

class PushNotification {
  send(msg) { console.log(`Push: ${msg}`); }
}

function notifyAll(notifications, message) {
  notifications.forEach(n => n.send(message));
}

notifyAll([
  new EmailNotification(),
  new SMSNotification(),
  new PushNotification(),
], 'Hello!');
// Email: Hello!  SMS: Hello!  Push: Hello!
```

## Explanation

**Encapsulation** bundles data and the methods that operate on it into one unit, and hides internal details. In JS, private fields (`#field`) enforce this. The benefit: the internal representation can change without breaking external code.

**Abstraction** hides *what* an implementation does from *how* it does it. A `fetchUser()` method abstracts away HTTP, caching, retries, and error handling. Callers only need to know "call this, get a user."

**Inheritance** shares code between related types via a parent-child relationship. Use it when the child truly IS a kind of the parent and you want to share default behavior. But beware: tight inheritance hierarchies become brittle as requirements change.

**Polymorphism** allows different types to be treated uniformly through a shared interface. `shape.area()` works on circles, rectangles, and triangles — the caller doesn't need to know or care which. This is the foundation of extensible design.

**How they work together:**
- Encapsulation protects state → Abstraction exposes clean operations → Inheritance shares behavior → Polymorphism enables flexible, extensible code
- Each pillar solves a different dimension of the "complexity management" problem in OOP

## Diagram

```
THE FOUR PILLARS:

┌─────────────────────────────────────────────────────────────┐
│  ENCAPSULATION          │  ABSTRACTION                       │
│  "Hide the internals"   │  "Expose only what's needed"       │
│                         │                                    │
│  BankAccount {          │  fetchUser(id) {                   │
│    #balance (private)   │    // HTTP, cache, retry...        │
│    deposit(n) ← public  │    // caller doesn't see this      │
│    withdraw(n) ← public │    return user; ← just this        │
│  }                      │  }                                 │
├─────────────────────────┼────────────────────────────────────┤
│  INHERITANCE            │  POLYMORPHISM                      │
│  "Share behavior"       │  "One interface, many behaviors"   │
│                         │                                    │
│     Animal              │       Shape                        │
│     speak()→"..."       │       area() ← same call          │
│        ↑                │      ↗      ↘                      │
│   Dog     Cat           │  Circle   Rectangle               │
│  "Woof"  "Meow"         │  πr²      w×h                      │
│  (override speak)       │  (different results)               │
└─────────────────────────┴────────────────────────────────────┘
```

## ELI5

Think of a car as an example of all four pillars:

**Encapsulation** = The engine is under the hood. You can't directly touch the pistons and fuel injectors. You interact through the steering wheel, pedals, and gear shift. The internals are protected — you can't accidentally break them.

**Abstraction** = You press the gas pedal. You don't know about the fuel injection, combustion, transmission. The pedal is a simple interface hiding enormous complexity.

**Inheritance** = A sports car IS a car. It inherits everything a car has (wheels, engine, doors) and adds more (turbo, spoiler). A truck IS also a car — different additions, same foundation.

**Polymorphism** = You can drive any vehicle the same way: steering wheel, gas, brake. Whether it's a sedan or an SUV, the "drive interface" is the same. The vehicle handles the differences internally.

```
All four together:
  Encapsulation → engine hidden behind dashboard
  Abstraction   → pedals hide combustion complexity
  Inheritance   → SportsCar IS-A Car, shares base behavior
  Polymorphism  → drive(anyCar) works regardless of car type
```
