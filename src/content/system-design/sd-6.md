---
id: sd-6
title: Payment Flow Architecture
category: System Design
subcategory: Payment
difficulty: Medium
pattern: Payment
companies: [Amazon, Stripe, Google]
timeComplexity: N/A - architectural
spaceComplexity: N/A - architectural
keyTakeaway: Never handle raw card data. Use PaymentIntents for two-step secure payments. Webhooks are the source of truth for payment status — never rely solely on client-side confirmation.
similarProblems: [Idempotency, Webhook Processing, 3D Secure]
---

Design a payment flow for an e-commerce app. The flow involves:
1. Client creates a payment intent on the server
2. Server creates a PaymentIntent with Stripe (or similar)
3. Client confirms payment with card details
4. Handle 3D Secure authentication if required
5. Server receives webhook confirmation
6. Update order status

**Key principles:**
- Never handle raw card numbers on your server (PCI compliance)
- Use payment intents for secure, two-step payment
- Webhooks are the source of truth (not client-side confirmation)
- Handle network failures gracefully

Implement the payment flow architecture.

## Solution

```js
// ════════════════════════════════════════════
// PAYMENT FLOW (Stripe-like architecture)
// ════════════════════════════════════════════

// Step 1: Client requests a PaymentIntent from your server
async function createPaymentIntent(orderData) {
  const res = await fetch('/api/payments/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: orderData.total,         // in cents
      currency: 'usd',
      orderId: orderData.orderId,
      metadata: { customerId: orderData.customerId },
    }),
  });

  if (!res.ok) throw new Error('Failed to create payment intent');
  return res.json(); // { clientSecret, paymentIntentId }
}

// Step 2: Client confirms payment (using Stripe.js or similar)
async function confirmPayment(clientSecret, cardElement) {
  // In real Stripe:
  // const { error, paymentIntent } = await stripe.confirmCardPayment(
  //   clientSecret,
  //   { payment_method: { card: cardElement } }
  // );

  // Simulated flow:
  const result = {
    status: 'succeeded', // or 'requires_action' for 3D Secure
    paymentIntentId: 'pi_123',
  };

  if (result.status === 'requires_action') {
    // 3D Secure: redirect to bank auth
    console.log('3D Secure required — redirecting...');
    // stripe.handleCardAction(clientSecret)
  }

  return result;
}

// ════════════════════════════════════════════
// Server-side: Create PaymentIntent
// ════════════════════════════════════════════

// app.post('/api/payments/create-intent', async (req, res) => {
//   const { amount, currency, orderId, metadata } = req.body;
//
//   // Validate order exists and amount matches
//   const order = await OrderModel.findById(orderId);
//   if (!order || order.totalCents !== amount) {
//     return res.status(400).json({ error: 'Invalid order' });
//   }
//
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount,
//     currency,
//     metadata: { orderId, ...metadata },
//     // Use idempotency key to prevent duplicate charges
//     idempotencyKey: 'order_' + orderId,
//   });
//
//   // Store payment intent ID with order
//   order.paymentIntentId = paymentIntent.id;
//   order.status = 'payment_pending';
//   await order.save();
//
//   res.json({ clientSecret: paymentIntent.client_secret });
// });

// ════════════════════════════════════════════
// Server-side: Webhook handler (SOURCE OF TRUTH)
// ════════════════════════════════════════════

// app.post('/api/webhooks/stripe', async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   let event;
//
//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
//   } catch (err) {
//     return res.status(400).send('Webhook signature verification failed');
//   }
//
//   switch (event.type) {
//     case 'payment_intent.succeeded': {
//       const intent = event.data.object;
//       const order = await OrderModel.findOne({
//         paymentIntentId: intent.id
//       });
//       order.status = 'paid';
//       order.paidAt = new Date();
//       await order.save();
//       await sendOrderConfirmationEmail(order);
//       break;
//     }
//
//     case 'payment_intent.payment_failed': {
//       const intent = event.data.object;
//       const order = await OrderModel.findOne({
//         paymentIntentId: intent.id
//       });
//       order.status = 'payment_failed';
//       order.failureReason = intent.last_payment_error?.message;
//       await order.save();
//       break;
//     }
//   }
//
//   res.json({ received: true });
// });

// ════════════════════════════════════════════
// Client: Full checkout flow
// ════════════════════════════════════════════

class CheckoutFlow {
  constructor(orderId) {
    this.orderId = orderId;
    this.status = 'idle';
  }

  async process(cardDetails) {
    try {
      this.status = 'creating_intent';
      const { clientSecret } = await createPaymentIntent({
        orderId: this.orderId,
        total: 4999, // $49.99 in cents
        customerId: 'cust_123',
      });

      this.status = 'confirming';
      const result = await confirmPayment(clientSecret, cardDetails);

      if (result.status === 'succeeded') {
        this.status = 'succeeded';
        return { success: true, message: 'Payment successful!' };
      } else if (result.status === 'requires_action') {
        this.status = 'requires_3ds';
        return { success: false, requires3DS: true };
      } else {
        this.status = 'failed';
        return { success: false, message: 'Payment failed' };
      }
    } catch (err) {
      this.status = 'error';
      return { success: false, message: err.message };
    }
  }
}

const checkout = new CheckoutFlow('order_456');
checkout.process({ number: '4242...', exp: '12/25', cvc: '123' });
```

## Explanation

PAYMENT FLOW ARCHITECTURE:

```
Client                 Your Server              Stripe
  │                         │                      │
  │ 1. Create intent        │                      │
  ├────────────────────────►│                      │
  │                         │ 2. stripe.paymentIntents.create()
  │                         ├─────────────────────►│
  │                         │◄─────────────────────┤
  │◄── { clientSecret } ───┤                      │
  │                         │                      │
  │ 3. stripe.confirmCardPayment(clientSecret)     │
  ├────────────────────────────────────────────────►│
  │                         │                      │
  │ (if 3DS required)       │                      │
  │◄── redirect to bank ──►│                      │
  │                         │                      │
  │◄── payment result ─────────────────────────────┤
  │                         │                      │
  │                         │ 4. Webhook: payment_intent.succeeded
  │                         │◄─────────────────────┤
  │                         │ → update order status │
  │                         │ → send confirmation   │
```

KEY: Webhooks are the source of truth, not the client-side result.
The client might close the browser after 3DS — only webhooks guarantee delivery.

## ELI5

Imagine paying at a restaurant. You don't hand your credit card to the waiter and say "take what you need." That's dangerous. Instead, the waiter brings a **secure card terminal** to your table.

**Payment flow works the same way:**

```
Bad approach (never do this):
  Browser → "Card number 4242-4242-4242-4242, exp 12/25, CVV 123"
  → Your server stores the card number → PCI compliance nightmare!

Good approach (what you implement):
  1. Browser asks your server: "I want to pay $49.99 for order #123"
  2. Your server asks Stripe: "Create a payment intent for $49.99"
  3. Stripe returns a clientSecret (like a one-time code for this transaction)
  4. Browser uses Stripe's library to enter card details DIRECTLY to Stripe
     (Your server never sees the card number!)
  5. Stripe processes → sends a webhook to your server: "Payment succeeded"
  6. Your server updates the order to "paid" ✓
```

**Why webhooks?**
The browser might close, crash, or lose internet after payment. But Stripe will still deliver the webhook to your server. The webhook is the only source of truth.

```
Without webhooks:
  User pays → browser shows "success" → browser crashes
  → Did we actually get paid? We don't know!

With webhooks:
  Stripe → POST /api/webhooks/stripe: "payment.succeeded for order #123"
  Server → marks order as paid → sends confirmation email ✓
  Even if the browser was closed for a week, the webhook still arrives.
```

**3D Secure** is like when your bank texts you a code to confirm a big purchase. Extra friction, but much safer.
