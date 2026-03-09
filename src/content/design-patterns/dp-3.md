---
id: dp-3
title: Liskov Substitution Principle
category: Design Patterns
subcategory: SOLID
difficulty: Medium
pattern: SOLID Principles
companies: [Google, Microsoft]
timeComplexity: N/A - conceptual
spaceComplexity: N/A - conceptual
keyTakeaway: Subtypes must honor the behavior contract of their parent type — any code using the parent should work identically with any child.
similarProblems: [Interface Segregation, Adapter Pattern, Polymorphism]
---

The Liskov Substitution Principle (LSP) states that objects of a superclass should be replaceable with objects of a subclass without altering the correctness of the program.

**Why it matters in frontend/JS:**
- If a ReadOnlyList extends List but throws on .push(), any code expecting a List will break — that violates LSP.
- Components that accept a "data source" prop should work with any object that implements the expected interface.
- Duck typing in JS makes LSP especially important: if it looks like a duck and quacks like a duck, it must actually behave like a duck.

**Classic violation: Square extends Rectangle**
A square can't freely set width and height independently, so it breaks expectations set by Rectangle.

## Solution

```js
// ❌ BAD: Square violates the contract of Rectangle
class BadRectangle {
  constructor(w, h) { this.width = w; this.height = h; }
  setWidth(w) { this.width = w; }
  setHeight(h) { this.height = h; }
  area() { return this.width * this.height; }
}

class BadSquare extends BadRectangle {
  setWidth(w) { this.width = w; this.height = w; }  // Surprise!
  setHeight(h) { this.width = h; this.height = h; }
}

function increaseWidth(rect) {
  const oldHeight = rect.height;
  rect.setWidth(rect.width + 1);
  console.log(rect.height === oldHeight); // false for Square!
}

// ✅ GOOD: Use a shared interface instead of broken inheritance
class Shape {
  area() { throw new Error('area() must be implemented'); }
}

class Rectangle extends Shape {
  constructor(w, h) { super(); this.width = w; this.height = h; }
  area() { return this.width * this.height; }
}

class Square extends Shape {
  constructor(side) { super(); this.side = side; }
  area() { return this.side * this.side; }
}

function printArea(shape) {
  console.log('Area:', shape.area());
}

printArea(new Rectangle(3, 4)); // Area: 12
printArea(new Square(5));       // Area: 25

// ✅ Frontend example: data source abstraction
class ApiDataSource {
  async getAll() {
    const res = await fetch('/api/items');
    return res.json();
  }
  async getById(id) {
    const res = await fetch(`/api/items/${id}`);
    return res.json();
  }
}

class LocalStorageDataSource {
  async getAll() {
    return JSON.parse(localStorage.getItem('items') || '[]');
  }
  async getById(id) {
    const items = await this.getAll();
    return items.find(item => item.id === id) || null;
  }
}

// Works with ANY data source that follows the contract
async function renderItems(dataSource) {
  const items = await dataSource.getAll();
  items.forEach(item => console.log(item.name));
}

renderItems(new ApiDataSource());
renderItems(new LocalStorageDataSource()); // Substitutable!
```

## Explanation

**What LSP really means:** If you have code that works with a `Shape`, it must continue working correctly when you pass in a `Circle` or `Square` — without any surprises.

**The Square/Rectangle trap is the classic example.** A square IS a rectangle mathematically, so inheritance seems natural. But behaviorally, a Rectangle lets you set width and height independently. A Square that secretly changes both when you set one breaks this expectation — that's an LSP violation.

**Behavior contract, not just interface:** LSP is more than just "does it have the same methods?" The subclass must also:
- Return the same types
- Not throw exceptions the parent doesn't throw  
- Not weaken preconditions (don't demand stricter input)
- Not strengthen postconditions (don't promise less output)

**LSP and duck typing in JS:** JavaScript doesn't enforce interfaces at compile time, so LSP violations only show up at runtime. When you accept a "data source" parameter, any object with `getAll()` and `getById()` should be passable — and they should all behave consistently.

**How to fix LSP violations:** Often the hierarchy is wrong. Square and Rectangle are better as siblings under `Shape` rather than parent/child.

## Diagram

```
LSP VIOLATION — Square pretends to be a Rectangle:

  ┌─────────────────────────┐
  │       Rectangle         │
  │  setWidth(w)            │  ← sets width only
  │  setHeight(h)           │  ← sets height only
  │  area() = w × h         │
  └───────────┬─────────────┘
              │ extends
  ┌───────────▼─────────────┐
  │         Square          │  ❌ VIOLATION
  │  setWidth(w) { w = h }  │  ← secretly sets BOTH
  │  setHeight(h) { w = h } │  ← breaks Rectangle contract
  └─────────────────────────┘

  function increaseWidth(rect) {
    rect.setWidth(rect.width + 1);
    // EXPECTS: height unchanged
    // WITH Square: height also changes! Surprise!
  }


LSP CORRECT — Siblings under a common abstraction:

           ┌─────────────┐
           │    Shape    │  ← abstract: area()
           └──────┬──────┘
          ┌───────┴────────┐
  ┌───────▼──────┐  ┌──────▼──────┐
  │  Rectangle   │  │   Square    │  ✅ Each has own
  │  area()=w×h  │  │ area()=s×s  │     consistent behavior
  └──────────────┘  └─────────────┘

  printArea(shape) works correctly with EITHER — no surprises.
```

## ELI5

Imagine you can drive any car: a sedan, an SUV, a sports car. They all have a steering wheel, gas pedal, and brake. You can get in any car and drive it the same way.

Now imagine a "car" that has a steering wheel but the gas pedal is actually an ejector seat button. That's an LSP violation — it looks like a car, but it doesn't behave like one.

```
LSP says:
  If something claims to BE a thing, it must BEHAVE like that thing.

  ✅ SportsCar extends Car:
     → Has gas, brake, steering
     → Goes faster — just more of the same behavior
     → You drive it exactly like a regular car
     → No surprises

  ❌ WeirdCar extends Car:
     → Has gas, brake, steering
     → But turning the wheel makes it go backward
     → Using it "like a car" causes crashes!
     → LSP violation
```

In the Square/Rectangle example: a square IS a rectangle geometrically. But if you treat it as a rectangle and set width without height changing, it breaks. The "is-a" relationship in real life doesn't always mean the same in code. When inheritance causes surprises, use sibling classes under a shared interface instead.
