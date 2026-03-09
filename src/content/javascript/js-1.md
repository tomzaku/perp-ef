---
id: js-1
title: Closures
category: JavaScript
subcategory: Core Concepts
difficulty: Medium
pattern: Closures
companies: [Google, Meta, Amazon]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "A closure is formed when a function retains access to its lexical scope even when executing outside that scope. Closures enable data encapsulation, the module pattern, memoization, and factory functions. Watch out for loop variable capture with var."
similarProblems: [js-7, js-3, js-13]
---

Explain JavaScript closures with practical examples. A closure is the combination of a function bundled together with references to its surrounding lexical environment. In other words, a closure gives a function access to variables from an enclosing scope, even after that scope has finished executing.

Demonstrate the following use cases:
1. A counter function that maintains private state
2. Private variables using closures (data encapsulation)
3. The module pattern
4. Common closure pitfalls (loop variable capture)

## Examples

**Input:** const counter = createCounter(); counter.increment(); counter.increment(); counter.getCount();
**Output:** 2
*The counter maintains its own private count variable via closure.*

**Input:** for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 0); }
**Output:** 3, 3, 3
*Classic closure pitfall: var is function-scoped, so all callbacks share the same i.*


## Solution

```js
// ============================================
// 1. Basic Closure: Counter with private state
// ============================================
function createCounter(initialValue = 0) {
  let count = initialValue; // enclosed variable

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    },
    reset() {
      count = initialValue;
      return count;
    }
  };
}

const counter = createCounter(0);
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount());  // 2
console.log(counter.decrement()); // 1
console.log(counter.reset());     // 0
// count is NOT accessible directly:
// console.log(counter.count); // undefined

// ============================================
// 2. Private Variables (Data Encapsulation)
// ============================================
function createBankAccount(owner, initialBalance = 0) {
  let balance = initialBalance; // private
  const transactions = [];      // private

  function recordTransaction(type, amount) {
    transactions.push({
      type,
      amount,
      date: new Date().toISOString(),
      balanceAfter: balance
    });
  }

  return {
    getOwner() {
      return owner;
    },
    getBalance() {
      return balance;
    },
    deposit(amount) {
      if (amount <= 0) throw new Error('Deposit must be positive');
      balance += amount;
      recordTransaction('deposit', amount);
      return balance;
    },
    withdraw(amount) {
      if (amount <= 0) throw new Error('Withdrawal must be positive');
      if (amount > balance) throw new Error('Insufficient funds');
      balance -= amount;
      recordTransaction('withdrawal', amount);
      return balance;
    },
    getTransactionHistory() {
      return [...transactions]; // return copy to protect original
    }
  };
}

const account = createBankAccount('Alice', 100);
account.deposit(50);   // 150
account.withdraw(30);  // 120
// account.balance => undefined (private!)
// account.transactions => undefined (private!)

// ============================================
// 3. Module Pattern
// ============================================
const Logger = (function () {
  let logs = [];
  let logLevel = 'info';

  const levels = { debug: 0, info: 1, warn: 2, error: 3 };

  function shouldLog(level) {
    return levels[level] >= levels[logLevel];
  }

  function formatMessage(level, message) {
    return `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
  }

  return {
    setLevel(level) {
      if (levels[level] === undefined) {
        throw new Error(`Invalid log level: ${level}`);
      }
      logLevel = level;
    },
    debug(msg) {
      if (shouldLog('debug')) {
        const formatted = formatMessage('debug', msg);
        logs.push(formatted);
        console.log(formatted);
      }
    },
    info(msg) {
      if (shouldLog('info')) {
        const formatted = formatMessage('info', msg);
        logs.push(formatted);
        console.log(formatted);
      }
    },
    warn(msg) {
      if (shouldLog('warn')) {
        const formatted = formatMessage('warn', msg);
        logs.push(formatted);
        console.warn(formatted);
      }
    },
    error(msg) {
      if (shouldLog('error')) {
        const formatted = formatMessage('error', msg);
        logs.push(formatted);
        console.error(formatted);
      }
    },
    getLogs() {
      return [...logs];
    },
    clear() {
      logs = [];
    }
  };
})();

// ============================================
// 4. Closure Pitfall: Loop Variable Capture
// ============================================

// PROBLEM: var is function-scoped
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Output: 3, 3, 3 (all reference the same i)

// FIX 1: Use let (block-scoped)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Output: 0, 1, 2

// FIX 2: IIFE to capture each value
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}
// Output: 0, 1, 2

// FIX 3: Use bind or a factory function
function createLogger(value) {
  return function () {
    console.log(value);
  };
}
for (var i = 0; i < 3; i++) {
  setTimeout(createLogger(i), 0);
}
// Output: 0, 1, 2

// ============================================
// 5. Practical: Memoization with Closures
// ============================================
function memoize(fn) {
  const cache = new Map();

  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveCalculation = memoize((n) => {
  console.log('Computing...');
  return n * n;
});
expensiveCalculation(5); // Computing... => 25
expensiveCalculation(5); // => 25 (cached, no "Computing..." log)
```

## Explanation

CONCEPT: Lexical Scoping & Closures

A closure is a function that "remembers" variables from its outer scope even after the outer function has returned. The inner function closes over the variable's reference, not its value at that moment.

```
SCOPE CHAIN DIAGRAM:

┌─── Global Scope ────────────────────┐
│                                     │
│  ┌─── createCounter() Scope ─────┐  │
│  │  count = 0                    │  │
│  │                               │  │
│  │  ┌─── returned function ───┐  │  │
│  │  │  has access to count    │  │  │
│  │  │  count++ → returns 0    │  │  │
│  │  │  count++ → returns 1    │  │  │
│  │  │  count++ → returns 2    │  │  │
│  │  └────────────────────────┘  │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

MEMORY MODEL:

```
After: const counter = createCounter()

Heap:
  Closure {
    [[Environment]]: { count: 0 }   ← shared, mutable reference
    code: () => count++
  }

counter()  → count becomes 1, returns 0
counter()  → count becomes 2, returns 1
counter()  → count becomes 3, returns 2

The variable 'count' persists because the closure keeps a reference to it.
```

KEY INSIGHT:
- Closures capture the VARIABLE (reference), not the VALUE
- This is why var in loops causes issues — all closures share the same var
- let creates a new binding per iteration, fixing the classic loop problem
