---
id: dp-2
title: Open/Closed Principle
category: Design Patterns
subcategory: SOLID
difficulty: Medium
pattern: SOLID Principles
companies: [Google, Amazon]
timeComplexity: N/A - conceptual
spaceComplexity: N/A - conceptual
keyTakeaway: "Design modules so new behavior can be added by writing new code (extension), not by editing existing code (modification)."
similarProblems: [Strategy Pattern, Factory Pattern, Plugin Architecture]
---

The Open/Closed Principle (OCP) states that software entities should be open for extension but closed for modification. You should be able to add new behavior without changing existing, tested code.

**Why it matters in frontend/JS:**
- When you add a new payment method, you shouldn't have to modify a giant switch statement in your checkout logic.
- When you add a new theme, you shouldn't rewrite your styling engine.
- Plugin architectures, middleware stacks (Express, Redux), and strategy maps all embody OCP.

**How to achieve OCP in JS:**
- Use configuration objects or maps instead of if/else chains
- Accept callback functions or strategy objects
- Use composition and higher-order functions
- Leverage polymorphism — objects with the same interface but different behavior

## Solution

```js
// ❌ BAD: Must modify this function every time we add a new shape
function calculateArea(shape) {
  if (shape.type === 'circle') {
    return Math.PI * shape.radius ** 2;
  } else if (shape.type === 'rectangle') {
    return shape.width * shape.height;
  } else if (shape.type === 'triangle') {
    return 0.5 * shape.base * shape.height;
  }
  throw new Error('Unknown shape');
}

// ✅ GOOD: Open for extension, closed for modification
class Circle {
  constructor(radius) { this.radius = radius; }
  area() { return Math.PI * this.radius ** 2; }
}

class Rectangle {
  constructor(width, height) { this.width = width; this.height = height; }
  area() { return this.width * this.height; }
}

// Adding a new shape requires NO changes to existing code
class Triangle {
  constructor(base, height) { this.base = base; this.height = height; }
  area() { return 0.5 * this.base * this.height; }
}

// Works with ANY shape that has an area() method
function totalArea(shapes) {
  return shapes.reduce((sum, shape) => sum + shape.area(), 0);
}

console.log(totalArea([new Circle(5), new Rectangle(3, 4), new Triangle(6, 3)]));

// ✅ Practical frontend example: extensible validator
const validators = new Map();

validators.set('required', (value) => value !== '' && value != null);
validators.set('email', (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
validators.set('minLength', (value, min) => value.length >= min);

// Add new validators later — no existing code changes
validators.set('phone', (value) => /^\+?\d{10,14}$/.test(value));

function validate(value, rules) {
  return rules.every(({ rule, param }) => {
    const fn = validators.get(rule);
    if (!fn) throw new Error(`Unknown rule: ${rule}`);
    return fn(value, param);
  });
}

console.log(validate('hello@test.com', [
  { rule: 'required' },
  { rule: 'email' },
])); // true
```
