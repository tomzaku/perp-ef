---
id: dp-7
title: Composition vs Inheritance
category: Design Patterns
subcategory: OOP
difficulty: Medium
pattern: OOP Fundamentals
companies: [Google, Meta, Amazon]
timeComplexity: N/A - conceptual
spaceComplexity: N/A - conceptual
keyTakeaway: "Favor composition over inheritance — compose small, focused behaviors into objects rather than building deep class hierarchies."
similarProblems: [Decorator Pattern, Strategy Pattern, Mixin Pattern]
---

"Favor composition over inheritance" is one of the most important principles in software design. While inheritance creates an "is-a" relationship and a rigid hierarchy, composition creates a "has-a" relationship and enables flexible combinations of behavior.

**Why composition wins in most cases:**
- Inheritance creates tight coupling — changing the parent affects all children
- Deep inheritance hierarchies are hard to understand and modify
- JS only supports single inheritance, limiting what you can model
- Composition lets you mix and match behaviors freely

**When inheritance IS appropriate:**
- When there's a genuine "is-a" relationship (a Dog IS an Animal)
- When you need to leverage polymorphism with a clear type hierarchy
- Framework extension points (React class components extending Component)

**In React specifically:** The team explicitly recommends composition over inheritance for component reuse.

## Solution

```js
// ❌ BAD: Inheritance leads to rigid hierarchies
class Animal {
  eat() { console.log('eating'); }
}

class FlyingAnimal extends Animal {
  fly() { console.log('flying'); }
}

class SwimmingAnimal extends Animal {
  swim() { console.log('swimming'); }
}

// Duck can fly AND swim — can't extend both!
// class Duck extends FlyingAnimal, SwimmingAnimal {} // ERROR!

// ✅ GOOD: Composition — mix and match behaviors
const canEat = (state) => ({
  eat() { console.log(`${state.name} is eating`); }
});

const canFly = (state) => ({
  fly() { console.log(`${state.name} is flying`); }
});

const canSwim = (state) => ({
  swim() { console.log(`${state.name} is swimming`); }
});

function createDuck(name) {
  const state = { name };
  return { ...canEat(state), ...canFly(state), ...canSwim(state) };
}

function createPenguin(name) {
  const state = { name };
  return { ...canEat(state), ...canSwim(state) }; // No fly!
}

const duck = createDuck('Donald');
duck.eat();  // Donald is eating
duck.fly();  // Donald is flying
duck.swim(); // Donald is swimming

const penguin = createPenguin('Tux');
penguin.eat();  // Tux is eating
penguin.swim(); // Tux is swimming

// ✅ Practical frontend: composable form behaviors
function withValidation(field) {
  return {
    ...field,
    validate() {
      const errors = [];
      if (field.required && !field.value) errors.push(`${field.name} is required`);
      if (field.maxLength && field.value.length > field.maxLength)
        errors.push(`${field.name} is too long`);
      return errors;
    }
  };
}

function withFormatting(field) {
  return {
    ...field,
    format() { return field.value.trim().toLowerCase(); }
  };
}

function withAutoSave(field, saveFn) {
  let timeout;
  return {
    ...field,
    setValue(val) {
      field.value = val;
      clearTimeout(timeout);
      timeout = setTimeout(() => saveFn(field.name, val), 500);
    }
  };
}

// Compose behaviors as needed
const emailField = withAutoSave(
  withFormatting(
    withValidation({ name: 'email', value: '', required: true, maxLength: 255 })
  ),
  (name, val) => console.log(`Auto-saved ${name}: ${val}`)
);

emailField.setValue('  User@Test.COM  ');
console.log(emailField.format());    // 'user@test.com'
console.log(emailField.validate());  // []
```
