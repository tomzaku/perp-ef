---
id: sd-7
title: "Payment Idempotency & Reliability"
category: System Design
subcategory: Payment
difficulty: Hard
pattern: Reliability
companies: [Amazon, Stripe]
timeComplexity: O(1) for idempotency key lookup
spaceComplexity: O(n) where n = number of stored idempotency keys
keyTakeaway: "Idempotency keys ensure the same operation is processed exactly once. Generate the key client-side per user intent, store results server-side, and always deduplicate webhook events."
similarProblems: [Payment Flow, Retry Logic, Distributed Systems]
---

**Idempotency** means that making the same request multiple times produces the same result as making it once. This is CRITICAL for payments — a user clicking "Pay" twice should not be charged twice.

**Challenges:**
- Network timeouts: client doesn't know if payment went through
- Retries: automatic retries after timeouts could double-charge
- Webhooks: may be delivered multiple times
- Race conditions: concurrent requests for the same order

**Solutions:**
- Idempotency keys: unique identifier per intended action
- Database constraints: prevent duplicate records
- Webhook deduplication: track processed event IDs

Implement idempotent payment processing.

## Solution

```js
// ════════════════════════════════════════════
// CLIENT: Idempotent payment request
// ════════════════════════════════════════════

class PaymentClient {
  async processPayment(orderId, amount) {
    // Generate idempotency key ONCE per user intent
    // Same key = same result, no matter how many retries
    const idempotencyKey = 'pay_' + orderId + '_' + Date.now();
    sessionStorage.setItem('idem_' + orderId, idempotencyKey);

    return this.#submitWithRetry(orderId, amount, idempotencyKey);
  }

  async #submitWithRetry(orderId, amount, idempotencyKey, retries = 3) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch('/api/payments/charge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({ orderId, amount }),
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (res.ok) return res.json();

        // 409 = already processed (idempotent response)
        if (res.status === 409) {
          const existing = await res.json();
          return existing; // Return the original result
        }

        // Don't retry on 4xx (client error)
        if (res.status >= 400 && res.status < 500) {
          throw new Error('Payment failed: ' + (await res.text()));
        }

        // 5xx = retry
        if (attempt < retries) {
          await this.#exponentialBackoff(attempt);
          continue;
        }
      } catch (err) {
        if (err.name === 'AbortError' && attempt < retries) {
          await this.#exponentialBackoff(attempt);
          continue;
        }
        if (attempt === retries) throw err;
      }
    }
    throw new Error('Payment failed after ' + retries + ' retries');
  }

  async #exponentialBackoff(attempt) {
    const delay = Math.min(1000 * 2 ** attempt + Math.random() * 1000, 10000);
    await new Promise(r => setTimeout(r, delay));
  }
}

// ════════════════════════════════════════════
// SERVER: Idempotent payment processing
// ════════════════════════════════════════════

class PaymentProcessor {
  constructor() {
    this.processedKeys = new Map(); // In production: database table
  }

  async processPayment(orderId, amount, idempotencyKey) {
    // Check if this idempotency key was already processed
    const existing = this.processedKeys.get(idempotencyKey);
    if (existing) {
      console.log('Idempotent hit — returning cached result');
      return { status: 409, body: existing };
    }

    // Check order status (prevent double-pay even with different keys)
    const order = this.#getOrder(orderId);
    if (order.status === 'paid') {
      return { status: 409, body: { error: 'Order already paid' } };
    }

    // Process payment
    try {
      // Lock the order (prevent concurrent processing)
      order.status = 'processing';

      const result = {
        paymentId: 'pay_' + Date.now(),
        orderId,
        amount,
        status: 'succeeded',
        processedAt: new Date().toISOString(),
      };

      // Store result with idempotency key
      this.processedKeys.set(idempotencyKey, result);

      // Update order
      order.status = 'paid';
      order.paymentId = result.paymentId;

      return { status: 200, body: result };
    } catch (err) {
      order.status = 'failed';
      throw err;
    }
  }

  #getOrder(id) {
    // Simulated database lookup
    return { id, status: 'pending', total: 0 };
  }
}

// ════════════════════════════════════════════
// WEBHOOK DEDUPLICATION
// ════════════════════════════════════════════

class WebhookProcessor {
  constructor() {
    this.processedEvents = new Set(); // In production: DB table
  }

  async handleWebhook(event) {
    // Deduplicate: check if event already processed
    if (this.processedEvents.has(event.id)) {
      console.log('Duplicate webhook, skipping:', event.id);
      return { status: 200, body: 'Already processed' };
    }

    // Process the event
    try {
      await this.#processEvent(event);
      this.processedEvents.add(event.id);
      return { status: 200, body: 'Processed' };
    } catch (err) {
      // Don't mark as processed — allow retry
      return { status: 500, body: 'Processing failed' };
    }
  }

  async #processEvent(event) {
    switch (event.type) {
      case 'payment.succeeded':
        console.log('Order paid:', event.data.orderId);
        break;
      case 'payment.failed':
        console.log('Payment failed:', event.data.orderId);
        break;
    }
  }
}

const processor = new PaymentProcessor();
const webhooks = new WebhookProcessor();

// Same idempotency key = safe to retry
const key = 'pay_order123_1700000000';
processor.processPayment('order123', 4999, key);
processor.processPayment('order123', 4999, key); // Returns cached result
```

## ELI5

Imagine you press a vending machine button once, but the machine freezes for a second. You're not sure if it registered, so you press again. Without idempotency, you'd get two bags of chips charged to your account.

**Idempotency** means: pressing the button 10 times still gives you exactly 1 bag of chips.

```
Without idempotency:
  User clicks "Pay $50" → network timeout → user clicks again
  Server charges: $50 (1st click) + $50 (2nd click) = $100 charged! 😱

With idempotency keys:
  User clicks "Pay" → browser generates key: "pay-order123-1700000000"
  1st request: key=pay-order123-1700000000 → server processes → charges $50
  2nd request: key=pay-order123-1700000000 → server recognizes key → "already done!"
                                            → returns the same $50 result
  User gets charged exactly once ✓
```

**Webhooks also need deduplication.** Stripe might send the same "payment succeeded" event twice (network hiccups). Without deduplication, you'd fulfill the order twice.

```
Webhook deduplication:
  Event arrives: id=evt_123 → "new, process it" → mark evt_123 as done
  Same event arrives again: id=evt_123 → "already processed, skip it" ✓

The trick: store event IDs you've processed. Check before acting.
```

**Exponential backoff** is like repeatedly calling a busy friend:
- First retry: wait 1 second
- Second retry: wait 2 seconds
- Third retry: wait 4 seconds
- ...up to a max

This prevents hammering the server when it's already struggling.
