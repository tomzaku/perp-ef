---
id: js-5
title: Debounce vs Throttle
category: JavaScript
subcategory: Patterns
difficulty: Medium
pattern: Rate Limiting
companies: [Amazon, Google, Meta, Uber]
timeComplexity: O(1) per call
spaceComplexity: O(1)
keyTakeaway: "Debounce waits for silence (delays until user stops), while throttle enforces a maximum call rate (executes at regular intervals). Use debounce for search input, form validation; use throttle for scroll, resize, mousemove handlers. Both should preserve `this` context and support cancel/flush."
similarProblems: [js-1, js-4, js-7]
---

Implement debounce and throttle functions from scratch:

- **Debounce**: Delays execution until after a period of inactivity. The function is only called once after the user stops triggering the event.
- **Throttle**: Limits execution to at most once per specified time period. The function is called at regular intervals during continuous triggering.

Implement both with support for:
1. Leading/trailing edge options
2. Cancel and flush methods
3. Proper `this` context and argument forwarding

## Examples

**Input:** debounce(search, 300) called rapidly 5 times
**Output:** search is called once, 300ms after the last call
*Each call resets the timer. Only the final call executes after 300ms of silence.*

**Input:** throttle(scroll, 200) called every 50ms for 1 second
**Output:** scroll is called approximately 5 times (once per 200ms)
*Throttle ensures the function runs at most once per 200ms interval.*


## Solution

```js
// ============================================
// 1. Debounce Implementation
// ============================================
function debounce(func, wait, options = {}) {
  let timeoutId = null;
  let lastArgs = null;
  let lastThis = null;
  let result;
  const { leading = false, trailing = true } = options;

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;

    const callNow = leading && timeoutId === null;

    // Clear existing timer and set a new one
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (trailing && lastArgs) {
        result = func.apply(lastThis, lastArgs);
        lastArgs = null;
        lastThis = null;
      }
    }, wait);

    // Leading edge: invoke immediately on first call
    if (callNow) {
      result = func.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }

    return result;
  }

  debounced.cancel = function () {
    clearTimeout(timeoutId);
    timeoutId = null;
    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = function () {
    if (timeoutId !== null && lastArgs) {
      result = func.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    return result;
  };

  debounced.pending = function () {
    return timeoutId !== null;
  };

  return debounced;
}

// Usage Examples:
const debouncedSearch = debounce((query) => {
  console.log(`Searching for: ${query}`);
  // API call here
}, 300);

// input.addEventListener('input', (e) => debouncedSearch(e.target.value));

// With leading edge (fires immediately, then waits)
const debouncedClick = debounce(
  () => console.log('Button clicked!'),
  1000,
  { leading: true, trailing: false }
);

// ============================================
// 2. Throttle Implementation
// ============================================
function throttle(func, wait, options = {}) {
  let timeoutId = null;
  let lastArgs = null;
  let lastThis = null;
  let lastCallTime = 0;
  let result;
  const { leading = true, trailing = true } = options;

  function throttled(...args) {
    const now = Date.now();
    lastArgs = args;
    lastThis = this;

    // If leading is false and this is the first call, set lastCallTime
    if (!leading && lastCallTime === 0) {
      lastCallTime = now;
    }

    const remaining = wait - (now - lastCallTime);

    if (remaining <= 0 || remaining > wait) {
      // Enough time has passed — execute immediately
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCallTime = now;
      result = func.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    } else if (!timeoutId && trailing) {
      // Schedule a trailing call
      timeoutId = setTimeout(() => {
        lastCallTime = leading ? Date.now() : 0;
        timeoutId = null;
        result = func.apply(lastThis, lastArgs);
        lastArgs = null;
        lastThis = null;
      }, remaining);
    }

    return result;
  }

  throttled.cancel = function () {
    clearTimeout(timeoutId);
    timeoutId = null;
    lastCallTime = 0;
    lastArgs = null;
    lastThis = null;
  };

  throttled.flush = function () {
    if (timeoutId && lastArgs) {
      result = func.apply(lastThis, lastArgs);
      throttled.cancel();
    }
    return result;
  };

  return throttled;
}

// Usage Examples:
const throttledScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 200);
// window.addEventListener('scroll', throttledScroll);

const throttledResize = throttle((width, height) => {
  console.log(`Resized to: ${width}x${height}`);
}, 500);
// window.addEventListener('resize', () => {
//   throttledResize(window.innerWidth, window.innerHeight);
// });

// ============================================
// 3. Simplified Versions (Interview Quick)
// ============================================

// Simple debounce (trailing only)
function debounceSimple(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Simple throttle (leading only)
function throttleSimple(fn, limit) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================
// 4. requestAnimationFrame Throttle
// ============================================
function rafThrottle(fn) {
  let frameId = null;
  let lastArgs = null;

  function throttled(...args) {
    lastArgs = args;
    if (frameId === null) {
      frameId = requestAnimationFrame(() => {
        fn.apply(this, lastArgs);
        frameId = null;
      });
    }
  }

  throttled.cancel = () => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  return throttled;
}

// Optimal for scroll/resize animations:
// window.addEventListener('scroll', rafThrottle(updateScrollIndicator));
```

## Explanation

CONCEPT: Rate Limiting — Debounce vs Throttle

Both limit function execution frequency, but with different strategies:

```
TIMELINE COMPARISON (events = rapid clicks):

Events:    ×  × ×× ×  ×      ×× ×
Time:      0  1 23 4  5      8 9 10   11   12
           ─────────────────────────────────────

Debounce (300ms wait):
Execute:                  ✓                   ✓
           Waits for silence. Only fires after 300ms of NO events.

Throttle (300ms interval):
Execute:   ✓        ✓        ✓        ✓
           Fires at most once per 300ms interval.
```

```
DEBOUNCE — "Wait until they stop typing"
─────────────────────────────────────────
keystrokes:  h  e  l  l  o
timer:       [300ms]
             reset→[300ms]
                   reset→[300ms]
                         reset→[300ms]
                               reset→[300ms]→ FIRE! search("hello")

THROTTLE — "Sample at regular intervals"
──────────────────────────────────────────
scroll events:  × × × × × × × × × × × ×
                ↑       ↑       ↑       ↑
                FIRE    FIRE    FIRE    FIRE
                (every 200ms, take one)
```

USE CASES:
- Debounce: search input, window resize, form validation
- Throttle: scroll handlers, mousemove tracking, rate-limited API calls
