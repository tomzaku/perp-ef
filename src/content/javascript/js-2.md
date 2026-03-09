---
id: js-2
title: Prototypal Inheritance vs Class
category: JavaScript
subcategory: Core Concepts
difficulty: Medium
pattern: Prototypes
companies: [Google, Amazon]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: JavaScript uses prototypal (delegation-based) inheritance where objects link to other objects via the prototype chain. ES6 classes are syntactic sugar over this mechanism. Understanding the prototype chain is essential for debugging property lookups and instanceof checks.
similarProblems: [js-3, js-1, js-12]
---

Explain JavaScript's prototypal inheritance model. Compare it with ES6 classes and demonstrate:

1. The prototype chain and how property lookup works
2. Creating inheritance with Object.create()
3. Constructor functions and the `new` keyword
4. ES6 class syntax and how it maps to prototypes under the hood
5. Key differences and trade-offs

## Examples

**Input:** const dog = new Animal("Rex"); dog.speak();
**Output:** "Rex makes a sound"
*dog inherits the speak method from Animal.prototype via the prototype chain.*


## Solution

```js
// ============================================
// 1. Prototype Chain Basics
// ============================================
const animal = {
  type: 'Animal',
  speak() {
    return `${this.name} makes a sound`;
  }
};

const dog = Object.create(animal);
dog.name = 'Rex';
dog.bark = function () {
  return `${this.name} barks!`;
};

console.log(dog.speak());  // "Rex makes a sound" (inherited)
console.log(dog.bark());   // "Rex barks!" (own method)
console.log(dog.type);     // "Animal" (inherited)

// Property lookup chain:
// dog -> animal -> Object.prototype -> null
console.log(Object.getPrototypeOf(dog) === animal);           // true
console.log(Object.getPrototypeOf(animal) === Object.prototype); // true
console.log(Object.getPrototypeOf(Object.prototype));         // null

// hasOwnProperty check
console.log(dog.hasOwnProperty('name'));  // true
console.log(dog.hasOwnProperty('speak')); // false (inherited)

// ============================================
// 2. Constructor Functions (Pre-ES6)
// ============================================
function Animal(name, sound) {
  this.name = name;
  this.sound = sound;
}

Animal.prototype.speak = function () {
  return `${this.name} says ${this.sound}`;
};

Animal.prototype.toString = function () {
  return `[Animal: ${this.name}]`;
};

function Dog(name) {
  Animal.call(this, name, 'Woof'); // super constructor
  this.tricks = [];
}

// Set up inheritance chain
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog; // fix constructor reference

Dog.prototype.learnTrick = function (trick) {
  this.tricks.push(trick);
};

Dog.prototype.showTricks = function () {
  return `${this.name} knows: ${this.tricks.join(', ')}`;
};

const rex = new Dog('Rex');
rex.learnTrick('sit');
rex.learnTrick('shake');
console.log(rex.speak());      // "Rex says Woof"
console.log(rex.showTricks()); // "Rex knows: sit, shake"
console.log(rex instanceof Dog);    // true
console.log(rex instanceof Animal); // true

// ============================================
// 3. ES6 Class Syntax (Syntactic Sugar)
// ============================================
class AnimalClass {
  #sound; // private field

  constructor(name, sound) {
    this.name = name;
    this.#sound = sound;
  }

  speak() {
    return `${this.name} says ${this.#sound}`;
  }

  static create(name, sound) {
    return new AnimalClass(name, sound);
  }

  get info() {
    return `${this.name} (${this.#sound})`;
  }
}

class DogClass extends AnimalClass {
  #tricks = [];

  constructor(name) {
    super(name, 'Woof'); // calls parent constructor
  }

  learnTrick(trick) {
    this.#tricks.push(trick);
  }

  showTricks() {
    return `${this.name} knows: ${this.#tricks.join(', ')}`;
  }

  // Override parent method
  speak() {
    return `${super.speak()} and wags tail`;
  }
}

const buddy = new DogClass('Buddy');
buddy.learnTrick('roll over');
console.log(buddy.speak());      // "Buddy says Woof and wags tail"
console.log(buddy.showTricks()); // "Buddy knows: roll over"
console.log(buddy.info);         // "Buddy (Woof)"

// Under the hood, class still uses prototypes:
console.log(typeof DogClass);                          // "function"
console.log(DogClass.prototype.__proto__ === AnimalClass.prototype); // true

// ============================================
// 4. Object.create for Composition
// ============================================
const canWalk = {
  walk() {
    return `${this.name} walks`;
  }
};

const canSwim = {
  swim() {
    return `${this.name} swims`;
  }
};

const canFly = {
  fly() {
    return `${this.name} flies`;
  }
};

// Mixin pattern: compose behaviors
function createDuck(name) {
  const duck = Object.create(canWalk);
  Object.assign(duck, canSwim, canFly);
  duck.name = name;
  duck.quack = function () {
    return `${this.name} says quack!`;
  };
  return duck;
}

const donald = createDuck('Donald');
console.log(donald.walk());  // "Donald walks"
console.log(donald.swim());  // "Donald swims"
console.log(donald.fly());   // "Donald flies"
console.log(donald.quack()); // "Donald says quack!"

// ============================================
// 5. Key Differences Summary
// ============================================
// - Classes are syntactic sugar over prototypal inheritance
// - Classes support private fields (#), getters/setters, static methods
// - Classes are NOT hoisted (unlike function declarations)
// - Classes always run in strict mode
// - Object.create gives more flexibility for composition
// - Prototypal inheritance is delegation-based (lookup chain)
// - Classical inheritance (class) is copy-based in concept but delegation in JS
```
