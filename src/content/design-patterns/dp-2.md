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

## Explanation

**The problem OCP solves:** When requirements change, you want to write NEW code, not edit OLD tested code. Every time you modify existing code, you risk introducing bugs in things that already work.

**The big switch/if-else is the classic violation.** Every new payment type, shape, or format requires editing the same function. One typo can break all existing cases.

**How to achieve OCP in practice:**
1. **Polymorphism** — Each subclass implements the same interface differently. `totalArea()` never changes; you just add new shape classes.
2. **Strategy maps** — A `Map` of validators or handlers. Add new entries without touching the dispatch logic.
3. **Plugin hooks** — Express middleware, Redux reducers, Webpack plugins. The host system never needs to change; you extend by adding handlers.

**The key insight:** OCP is not about never changing code. It's about designing *extension points* so that the *stable core* never changes, while the *variable behavior* is added from outside.

**Practical frontend pattern — feature flags as OCP:**
```
// Adding a new feature doesn't touch renderComponent
const featureRenderers = new Map([
  ['newDashboard', () => <NewDashboard />],
  ['oldDashboard', () => <OldDashboard />],
]);

function renderFeature(flag) {
  return featureRenderers.get(flag)?.() ?? null;
}
// Adding new features = adding entries to the Map. renderFeature never changes.
```

## Diagram

```
VIOLATION — Open for modification (bad):

  function calculateArea(shape) {
    if (shape === 'circle')    ... ← must edit here for every new shape
    if (shape === 'rectangle') ...
    if (shape === 'triangle')  ...
    // Add hexagon? → Edit this function → risk breaking circle/rectangle!
  }


OCP — Open for extension, closed for modification:

  ┌──────────────┐
  │    Shape     │  ← abstract interface (never changes)
  │  area(): n   │
  └──────┬───────┘
         │ extends
   ┌─────┼────────┬──────────────────┐
   ▼     ▼        ▼                  ▼
┌──────┐┌───────┐┌────────┐   ┌──────────────┐
│Circle││Rect   ││Triangle│   │Hexagon (NEW) │
│area()││area() ││area()  │   │area() ← ADD  │
└──────┘└───────┘└────────┘   └──────────────┘

  totalArea(shapes) ← NEVER changes. Accepts any shape with area().

Adding Hexagon:
  ✅ Write new class Hexagon with area()
  ✅ No changes to Circle, Rectangle, Triangle, or totalArea()
  ✅ Zero risk of breaking existing code
```

## ELI5

Imagine a restaurant menu. When the chef wants to add a new dish, they don't rewrite the entire menu — they just print a new item.

The menu design is **closed for modification** (the layout, pricing format, allergen rules stay the same). But it's **open for extension** (you can always add new dishes without touching the existing ones).

```
Bad menu design:
  function cookDish(order) {
    if order == "pasta"  → cook pasta
    if order == "burger" → cook burger
    // Adding sushi? Edit this function. Risk breaking pasta and burger!
  }

Good menu design:
  Each dish knows how to cook itself:
    Pasta: cook() → boil noodles, add sauce
    Burger: cook() → grill patty, assemble
    Sushi: cook() → slice fish, roll rice ← ADD NEW, touch nothing else

  kitchen.cook(anyDish) ← never changes
```

In code: instead of a giant if/else that you keep editing, use a map or polymorphism. Each "new thing" adds itself — the host code never changes. **You extend the system by writing new code, not by editing old code.**
