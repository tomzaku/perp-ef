---
id: sd-8
title: "Subscription & Recurring Payments"
category: System Design
subcategory: Payment
difficulty: Medium
pattern: Payment
companies: [Amazon, Stripe, Meta]
timeComplexity: N/A - architectural
spaceComplexity: N/A - architectural
keyTakeaway: "Subscriptions are state machines (trialing → active → past_due → canceled). Handle proration for plan changes, implement dunning for failed payments, and always drive status from webhooks."
similarProblems: [Payment Flow, State Machines, Webhook Processing]
---

Design a subscription billing system that handles:
- Plan creation (monthly/yearly pricing)
- Trial periods
- Upgrades/downgrades with proration
- Failed payment retry (dunning)
- Cancellation and reactivation

**Key concepts:**
- Billing cycles and anchoring
- Proration when changing plans mid-cycle
- Grace periods for failed payments
- Webhook-driven status updates

## Solution

```js
// ════════════════════════════════════════════
// Subscription State Machine
// ════════════════════════════════════════════

class Subscription {
  // States: trialing → active → past_due → canceled → expired
  //                    active → canceled (voluntary)
  //                    trialing → canceled

  constructor(config) {
    this.id = crypto.randomUUID();
    this.customerId = config.customerId;
    this.planId = config.planId;
    this.status = config.trialDays > 0 ? 'trialing' : 'active';
    this.currentPeriodStart = new Date();
    this.currentPeriodEnd = this.#addDays(new Date(), config.trialDays || 30);
    this.trialEnd = config.trialDays > 0
      ? this.#addDays(new Date(), config.trialDays) : null;
    this.canceledAt = null;
    this.cancelAtPeriodEnd = false;
    this.failedPaymentCount = 0;
    this.maxRetries = 3;
  }

  // Handle successful payment
  paymentSucceeded() {
    this.status = 'active';
    this.failedPaymentCount = 0;
    this.currentPeriodStart = new Date();
    this.currentPeriodEnd = this.#addDays(new Date(), 30);
    console.log('Subscription renewed until', this.currentPeriodEnd);
  }

  // Handle failed payment (dunning)
  paymentFailed() {
    this.failedPaymentCount++;
    if (this.failedPaymentCount >= this.maxRetries) {
      this.status = 'canceled';
      console.log('Subscription canceled after', this.maxRetries, 'failed payments');
    } else {
      this.status = 'past_due';
      console.log('Payment failed. Retry', this.failedPaymentCount, '/', this.maxRetries);
    }
  }

  // Cancel at end of billing period
  cancel() {
    this.cancelAtPeriodEnd = true;
    this.canceledAt = new Date();
    console.log('Will cancel at period end:', this.currentPeriodEnd);
  }

  // Immediate cancellation
  cancelImmediately() {
    this.status = 'canceled';
    this.canceledAt = new Date();
  }

  // Reactivate (before period ends)
  reactivate() {
    if (this.cancelAtPeriodEnd && this.status !== 'canceled') {
      this.cancelAtPeriodEnd = false;
      this.canceledAt = null;
      console.log('Subscription reactivated');
    }
  }

  // Check if active
  isActive() {
    return this.status === 'active' || this.status === 'trialing';
  }

  #addDays(date, days) {
    return new Date(date.getTime() + days * 86400000);
  }
}

// ════════════════════════════════════════════
// Plan & Proration
// ════════════════════════════════════════════

const plans = {
  basic:      { id: 'basic',      name: 'Basic',      priceMonthly: 999,   priceYearly: 9990 },
  pro:        { id: 'pro',        name: 'Pro',         priceMonthly: 2999,  priceYearly: 29990 },
  enterprise: { id: 'enterprise', name: 'Enterprise',  priceMonthly: 9999,  priceYearly: 99990 },
};

function calculateProration(currentPlan, newPlan, daysRemaining, totalDays) {
  const dailyRateCurrent = currentPlan.priceMonthly / totalDays;
  const dailyRateNew = newPlan.priceMonthly / totalDays;

  const creditRemaining = Math.round(dailyRateCurrent * daysRemaining);
  const costRemaining = Math.round(dailyRateNew * daysRemaining);

  const proratedAmount = costRemaining - creditRemaining;

  return {
    credit: creditRemaining,
    charge: costRemaining,
    netAmount: proratedAmount, // Positive = charge, negative = credit
    description: proratedAmount >= 0
      ? 'Charge ' + (proratedAmount / 100).toFixed(2) + ' for upgrade'
      : 'Credit ' + (Math.abs(proratedAmount) / 100).toFixed(2) + ' for downgrade',
  };
}

// Example: upgrade from Basic to Pro with 15 days remaining in 30-day cycle
const proration = calculateProration(plans.basic, plans.pro, 15, 30);
console.log(proration);
// { credit: 500, charge: 1500, netAmount: 1000, description: "Charge 10.00 for upgrade" }

// ════════════════════════════════════════════
// Dunning (Failed Payment Retry Schedule)
// ════════════════════════════════════════════

class DunningSchedule {
  // Retry: day 1, day 3, day 7, then cancel
  #retryIntervals = [1, 3, 7];

  getNextRetryDate(failedCount) {
    if (failedCount >= this.#retryIntervals.length) return null; // Give up
    const days = this.#retryIntervals[failedCount];
    const next = new Date();
    next.setDate(next.getDate() + days);
    return next;
  }

  shouldCancel(failedCount) {
    return failedCount >= this.#retryIntervals.length;
  }
}

const dunning = new DunningSchedule();
console.log(dunning.getNextRetryDate(0)); // Tomorrow
console.log(dunning.getNextRetryDate(1)); // In 3 days
console.log(dunning.getNextRetryDate(2)); // In 7 days
console.log(dunning.shouldCancel(3));     // true — cancel subscription
```

## ELI5

Imagine a magazine subscription. You sign up once, and every month the magazine arrives (and you get charged) automatically — until you cancel.

**The subscription is a state machine** — it moves through different stages:

```
Subscription states:

  [trialing] ──(trial ends)──► [active] ──(payment fails)──► [past_due]
       │                          │                               │
  (cancel)                   (cancel)                    (3 failed retries)
       │                          │                               │
       ▼                          ▼                               ▼
  [canceled]              [cancel_at_period_end]           [canceled]
                               │
                          (period ends)
                               │
                               ▼
                          [canceled]

Rules:
  trialing → active: trial period ends, first payment succeeds
  active → past_due: payment fails
  past_due → active: payment eventually succeeds
  past_due → canceled: too many failed payments (dunning)
```

**Dunning** is the automated process of retrying failed payments politely:

```
Payment fails on the 1st of the month:
  Day 0:  "Payment failed" — try again tomorrow
  Day 1:  Retry → fails again → try in 3 days
  Day 3:  Retry → fails again → try in 7 days
  Day 7:  Retry → fails again → CANCEL subscription
  (Email sent each time: "Please update your payment method")
```

**Proration** is the fair math when you upgrade mid-cycle:

```
You're on Basic ($10/month), 15 days into a 30-day cycle.
You upgrade to Pro ($30/month).

Credit for unused Basic:  $10 × (15/30) = $5 credit
Charge for rest on Pro:   $30 × (15/30) = $15 charge
Net charge today:         $15 - $5      = $10

Then next month: full $30/month on Pro.
```
