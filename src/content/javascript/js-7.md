---
id: js-7
title: Currying and Partial Application
category: JavaScript
subcategory: Functional Programming
difficulty: Medium
pattern: Currying
companies: [Google, Airbnb]
timeComplexity: O(n) where n is the number of arguments
spaceComplexity: O(n) for stored arguments in closure
keyTakeaway: "Currying transforms a function with N arguments into a chain of N functions each taking 1 argument. Partial application fixes some arguments upfront. Both enable function composition, reusable configuration, and more declarative code."
similarProblems: [js-1, js-5, js-8]
---

Implement currying and partial application in JavaScript:

1. A generic curry function that works with any arity
2. Partial application and how it differs from currying
3. Practical examples and use cases
4. Infinite currying (sum(1)(2)(3)...())

## Examples

**Input:** const add = curry((a, b, c) => a + b + c); add(1)(2)(3)
**Output:** 6
*Curried function collects arguments one at a time until all required args are provided.*

**Input:** add(1, 2)(3)
**Output:** 6
*Curried functions also accept multiple arguments at once.*


## Solution

```js
// ============================================
// 1. Generic Curry Function
// ============================================
function curry(fn) {
  const arity = fn.length;

  return function curried(...args) {
    // If enough arguments provided, call the original function
    if (args.length >= arity) {
      return fn.apply(this, args);
    }

    // Otherwise return a function that collects more args
    return function (...moreArgs) {
      return curried.apply(this, [...args, ...moreArgs]);
    };
  };
}

// Usage:
const add = curry((a, b, c) => a + b + c);

console.log(add(1)(2)(3));     // 6
console.log(add(1, 2)(3));     // 6
console.log(add(1)(2, 3));     // 6
console.log(add(1, 2, 3));     // 6

// ============================================
// 2. Curry with Placeholder Support
// ============================================
const _ = Symbol('placeholder');

function curryWithPlaceholder(fn) {
  const arity = fn.length;

  return function curried(...args) {
    // Check if we have enough non-placeholder arguments
    const complete =
      args.length >= arity &&
      args.slice(0, arity).every((arg) => arg !== _);

    if (complete) {
      return fn.apply(this, args);
    }

    return function (...moreArgs) {
      // Merge: replace placeholders with new args
      const merged = [];
      let moreIndex = 0;

      for (let i = 0; i < args.length; i++) {
        if (args[i] === _ && moreIndex < moreArgs.length) {
          merged.push(moreArgs[moreIndex++]);
        } else {
          merged.push(args[i]);
        }
      }

      // Append remaining new args
      while (moreIndex < moreArgs.length) {
        merged.push(moreArgs[moreIndex++]);
      }

      return curried.apply(this, merged);
    };
  };
}

const multiply = curryWithPlaceholder((a, b, c) => a * b * c);
console.log(multiply(2)(3)(4));      // 24
console.log(multiply(_, 3)(2)(4));   // 24 (a=2, b=3, c=4)
console.log(multiply(_, _, 4)(2)(3)); // 24

// ============================================
// 3. Partial Application
// ============================================
// Partial application fixes some arguments upfront.
// Unlike currying, it returns a function with the REMAINING arity.

function partial(fn, ...presetArgs) {
  return function (...laterArgs) {
    return fn.apply(this, [...presetArgs, ...laterArgs]);
  };
}

function log(level, timestamp, message) {
  console.log(`[${level}] [${timestamp}] ${message}`);
}

// Fix the log level
const info = partial(log, 'INFO');
const error = partial(log, 'ERROR');

info('2024-01-01', 'Server started');
// [INFO] [2024-01-01] Server started

error('2024-01-01', 'Disk full');
// [ERROR] [2024-01-01] Disk full

// Fix level AND timestamp
const todayInfo = partial(log, 'INFO', new Date().toISOString());
todayInfo('All systems go');

// ============================================
// 4. Infinite Currying
// ============================================
// sum(1)(2)(3)() => 6
// Called with no args (or valueOf) to get result

function sum(a) {
  let total = a;

  function inner(b) {
    if (b === undefined) return total;
    total += b;
    return inner;
  }

  inner.valueOf = function () {
    return total;
  };

  inner.toString = function () {
    return String(total);
  };

  return inner;
}

console.log(sum(1)(2)(3)());        // 6
console.log(sum(1)(2)(3)(4)(5)()); // 15
console.log(+sum(1)(2)(3));         // 6 (using valueOf)

// ============================================
// 5. Practical Use Cases
// ============================================

// a) Event handler factory
const handleEvent = curry((eventType, element, handler) => {
  element.addEventListener(eventType, handler);
  return () => element.removeEventListener(eventType, handler);
});

const onClick = handleEvent('click');
const onKeydown = handleEvent('keydown');
// const removeClick = onClick(button, () => console.log('clicked'));

// b) API request builder
const apiRequest = curry((baseUrl, method, endpoint, body) => {
  return fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
});

const api = apiRequest('https://api.example.com');
const get = api('GET');
const post = api('POST');
// get('/users')
// post('/users', { name: 'Alice' })

// c) Validation with currying
const validate = curry((regex, errorMsg, value) => {
  return regex.test(value) ? null : errorMsg;
});

const isEmail = validate(
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  'Invalid email'
);
const isPhone = validate(
  /^\d{10}$/,
  'Must be 10 digits'
);

console.log(isEmail('test@example.com')); // null (valid)
console.log(isEmail('bad'));              // "Invalid email"
console.log(isPhone('1234567890'));       // null (valid)

// d) Pipe / compose with curried functions
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const multiplyBy = curry((factor, value) => value * factor);
const addTo = curry((addition, value) => value + addition);

const transform = pipe(
  multiplyBy(2),
  addTo(10),
  multiplyBy(3)
);

console.log(transform(5)); // ((5 * 2) + 10) * 3 = 60
```
