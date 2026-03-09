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

## Explanation

**The Fragile Base Class problem:** Deep inheritance hierarchies are brittle. When `Animal.eat()` changes, every subclass is affected — even the ones where `eat` wasn't the point. This is why "favor composition over inheritance" is one of the most repeated OOP principles.

**The core difference:**
- Inheritance: "A Duck IS an Animal" → shares code through class hierarchy
- Composition: "A Duck HAS a FlyBehavior and HAS a SwimBehavior" → shares code through object assembly

**When inheritance IS appropriate:**
- True "is-a" relationship that's unlikely to change
- You genuinely want to share or override parent behavior
- The hierarchy is shallow (1-2 levels deep max)

**When to prefer composition:**
- You need to share behavior across unrelated classes (can't inherit from two parents in JS)
- The behavior should be swappable at runtime
- You want to combine multiple capabilities without a deep hierarchy

**Mixin pattern as composition:** In JS, mixins let you compose behavior from multiple sources — functionally equivalent to multiple inheritance but without the diamond problem.

## Diagram

```
INHERITANCE — rigid hierarchy:

           ┌─────────────────┐
           │     Animal      │
           │  eat() sleep()  │
           └────────┬────────┘
          ┌─────────┴──────────┐
     ┌────▼────┐          ┌────▼────┐
     │   Bird  │          │  Fish   │
     │ fly()   │          │ swim()  │
     └────┬────┘          └─────────┘
     ┌────▼──────────┐
     │  FlyingFish?  │  ← CAN'T inherit from both Bird and Fish in JS!
     │               │    Inheritance breaks here.
     └───────────────┘


COMPOSITION — flexible assembly:

  flyBehavior    = { fly: () => "flaps wings" }
  swimBehavior   = { swim: () => "paddles" }
  walkBehavior   = { walk: () => "walks on land" }

  Duck = { ...flyBehavior, ...swimBehavior, ...walkBehavior }
  Fish = { ...swimBehavior }
  Penguin = { ...swimBehavior, ...walkBehavior } ← no fly!

  FlyingFish = { ...flyBehavior, ...swimBehavior } ← trivial!

  Swap fly behavior at runtime:
    duck.fly = jetpackBehavior.fly  ← impossible with inheritance
```

## ELI5

Think about Lego vs a toy robot that's glued together.

**Inheritance is the glued robot.** It comes pre-assembled. You can't give the robot different legs or swap its arms. Changing one part might break the others. It's rigid.

**Composition is Lego.** You build your robot from bricks. Want a flying robot? Add wings. Need a swimming robot? Add fins. Want one that does both? Combine the flying-brick and swimming-brick. The pieces don't care about each other.

```
Inheritance (glued robot):
  Animal
    └── Bird (has wings glued on)
           └── Penguin (wait, it can't fly... now the "wings" are broken)

Composition (Lego):
  flyBrick   = { fly: () => "zoom" }
  swimBrick  = { swim: () => "splash" }

  Bird    = flyBrick + animalBase
  Fish    = swimBrick + animalBase
  Penguin = swimBrick + animalBase  ← no flyBrick! Problem solved.
  Duck    = flyBrick + swimBrick + animalBase  ← best of both
```

**Rule of thumb:** If you're building a class hierarchy deeper than 2 levels, ask yourself — "could I express this with composition instead?" Usually the answer is yes, and the result is simpler.
