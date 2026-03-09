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
