---
id: js-3
title: "`this` Keyword Binding Rules"
category: JavaScript
subcategory: Core Concepts
difficulty: Medium
pattern: this Binding
companies: [Meta, Google, Microsoft]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "The value of `this` depends on HOW a function is called, not where it is defined (except arrow functions which use lexical `this`). The priority is: new > explicit (call/apply/bind) > implicit (obj.method) > default (global/undefined). Arrow functions cannot be rebound."
similarProblems: [js-1, js-2, js-4]
---

Explain all the binding rules for the `this` keyword in JavaScript:

1. Default Binding (standalone function invocation)
2. Implicit Binding (method invocation)
3. Explicit Binding (call, apply, bind)
4. `new` Binding (constructor invocation)
5. Arrow Functions (lexical `this`)

Also cover the priority order when multiple rules apply and common pitfalls.

## Examples

**Input:** const obj = { name: 'Alice', greet() { return this.name; } }; const fn = obj.greet; fn();
**Output:** undefined (or throws in strict mode)
*Assigning a method to a variable loses the implicit binding. Default binding applies.*

**Input:** const obj = { name: 'Alice', greet: () => this.name }; obj.greet();
**Output:** undefined
*Arrow functions do not have their own this. They inherit from the enclosing lexical scope (window/global).*


## Solution

```js
// ============================================
// 1. Default Binding
// ============================================
// In non-strict mode: this = globalThis (window in browser)
// In strict mode: this = undefined

function showThis() {
  return this;
}

// Non-strict mode:
console.log(showThis()); // globalThis (window or global)

// Strict mode:
function showThisStrict() {
  'use strict';
  return this;
}
console.log(showThisStrict()); // undefined

// ============================================
// 2. Implicit Binding
// ============================================
// When a function is called as a method of an object,
// this = the object before the dot

const user = {
  name: 'Alice',
  greet() {
    return `Hello, I'm ${this.name}`;
  },
  address: {
    city: 'NYC',
    getCity() {
      return this.city; // this = address, NOT user
    }
  }
};

console.log(user.greet());           // "Hello, I'm Alice"
console.log(user.address.getCity()); // "NYC"

// PITFALL: Implicit binding loss
const greetFn = user.greet;
console.log(greetFn()); // "Hello, I'm undefined" (default binding)

// PITFALL: Callback loses implicit binding
function callWithCallback(callback) {
  callback(); // default binding, not implicit
}
callWithCallback(user.greet); // "Hello, I'm undefined"

// ============================================
// 3. Explicit Binding: call, apply, bind
// ============================================
function introduce(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}

const person = { name: 'Bob' };

// call: invokes immediately, args passed individually
console.log(introduce.call(person, 'Hi', '!'));
// "Hi, I'm Bob!"

// apply: invokes immediately, args passed as array
console.log(introduce.apply(person, ['Hey', '.']));
// "Hey, I'm Bob."

// bind: returns a NEW function with this permanently bound
const boundIntro = introduce.bind(person, 'Hello');
console.log(boundIntro('!!')); // "Hello, I'm Bob!!"

// bind is permanent — cannot be re-bound
const anotherPerson = { name: 'Carol' };
const reBound = boundIntro.bind(anotherPerson);
console.log(reBound('?')); // "Hello, I'm Bob?" (still Bob!)

// Practical use: fixing callback binding
const button = {
  label: 'Submit',
  handleClick() {
    console.log(`Clicked: ${this.label}`);
  }
};
// setTimeout(button.handleClick, 100);            // "Clicked: undefined"
// setTimeout(button.handleClick.bind(button), 100); // "Clicked: Submit"

// ============================================
// 4. new Binding
// ============================================
// When a function is called with new:
// 1. A new empty object is created
// 2. The object is linked to the function's prototype
// 3. this is bound to the new object
// 4. The new object is returned (unless function returns an object)

function Person(name, age) {
  // this = {} (new empty object)
  this.name = name;
  this.age = age;
  // implicit: return this;
}

const alice = new Person('Alice', 30);
console.log(alice.name); // "Alice"
console.log(alice instanceof Person); // true

// If constructor returns an object, that object is used instead
function Weird() {
  this.name = 'inside';
  return { name: 'outside' }; // overrides this
}
console.log(new Weird().name); // "outside"

// ============================================
// 5. Arrow Functions (Lexical this)
// ============================================
// Arrow functions do NOT have their own this.
// They inherit this from the enclosing lexical scope.

const team = {
  name: 'Engineering',
  members: ['Alice', 'Bob', 'Carol'],

  // Regular function: this = team (implicit binding)
  listMembers() {
    // Arrow function inherits this from listMembers
    return this.members.map(
      (member) => `${member} is on ${this.name}`
    );
  },

  // BROKEN: arrow function as method
  brokenMethod: () => {
    // this is NOT team — it's the enclosing scope (module/global)
    return this; // undefined or globalThis
  }
};

console.log(team.listMembers());
// ["Alice is on Engineering", "Bob is on Engineering", "Carol is on Engineering"]

// Arrow function in class: binds to instance
class Timer {
  count = 0;

  // Arrow function auto-binds this to the instance
  start = () => {
    this.count++;
    console.log(this.count);
  };
}

const timer = new Timer();
const startFn = timer.start;
startFn(); // 1 (this is still the Timer instance!)

// ============================================
// 6. Priority Order (highest to lowest)
// ============================================
// 1. new Binding        (new Foo())
// 2. Explicit Binding   (call/apply/bind)
// 3. Implicit Binding   (obj.method())
// 4. Default Binding    (standalone call)
// Note: Arrow functions are not bindable — they always use lexical this.

function foo() {
  return this.a;
}
const obj1 = { a: 1, foo };
const obj2 = { a: 2, foo };

// Implicit binding
console.log(obj1.foo()); // 1
console.log(obj2.foo()); // 2

// Explicit > Implicit
console.log(obj1.foo.call(obj2)); // 2

// new > Implicit
const obj3 = new obj1.foo(); // this = new object, not obj1

// new > Explicit (bind)
const BoundFoo = foo.bind(obj1);
const obj4 = new BoundFoo(); // this = new object (new wins over bind)
```
