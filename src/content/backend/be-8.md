---
id: be-8
title: Middleware Pattern & Request Pipeline
category: Backend
subcategory: Architecture
difficulty: Easy
pattern: Middleware Chain
companies: [Vercel, Shopify, Netflix, Stripe, Cloudflare]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Middleware is a composable function that intercepts requests/responses in a pipeline. Each middleware can transform the request, short-circuit the pipeline, or pass control to the next handler. This pattern enables separation of concerns: auth, logging, validation, error handling, and CORS are each isolated middleware functions."
similarProblems: [HTTP Deep Dive, Error Handling, Authentication]
---

**What is the middleware pattern, and how does the request pipeline work in backend frameworks?**

Middleware is one of the most important architectural patterns in backend development. It's how Express, Fastify, Koa, and virtually every web framework organizes request processing.

## Solution

```typescript
// ═══════════════════════════════════
// MIDDLEWARE PIPELINE CONCEPT
// ═══════════════════════════════════

// Request flows through middleware like water through filters:
//
// Request → [Logger] → [Auth] → [Validate] → [Handler] → Response
//              ↓          ↓         ↓            ↓
//          logs req   checks    validates    processes
//                     token     body         & responds

// Each middleware can:
// 1. Transform the request (add user info, parse body)
// 2. Short-circuit (return 401 without calling next)
// 3. Transform the response (add headers, compress)
// 4. Pass to next middleware (call next())


// ═══════════════════════════════════
// EXPRESS MIDDLEWARE
// ═══════════════════════════════════

import express from 'express';
const app = express();

// Middleware signature: (req, res, next) => void

// 1. LOGGING MIDDLEWARE
function logger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next(); // Pass to next middleware
}

// 2. AUTH MIDDLEWARE
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
    // Short-circuits — does NOT call next()
  }
  try {
    req.user = verifyToken(token);
    next(); // Token valid, continue
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// 3. VALIDATION MIDDLEWARE (factory pattern)
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    req.validatedBody = result.data;
    next();
  };
}

// 4. ERROR HANDLING MIDDLEWARE (4 parameters!)
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
}


// Apply middleware:
app.use(logger);                        // All routes
app.use(express.json());                // Parse JSON bodies
app.use('/api', authenticate);          // All /api routes

app.post('/api/users',
  validate(createUserSchema),           // Route-specific middleware
  async (req, res) => {
    const user = await createUser(req.validatedBody);
    res.status(201).json(user);
  }
);

app.use(errorHandler);                  // Must be LAST


// ═══════════════════════════════════
// MIDDLEWARE EXECUTION ORDER
// ═══════════════════════════════════

//  Request comes in
//       │
//       ↓
//  ┌─── logger (logs start) ───┐
//  │    ↓                      │
//  │  express.json() (parse)   │
//  │    ↓                      │
//  │  authenticate (check JWT) │
//  │    ↓                      │
//  │  validate (check body)    │
//  │    ↓                      │
//  │  route handler (business) │
//  │    ↓                      │
//  └─── logger (logs end) ─────┘
//       │
//  Response sent


// ═══════════════════════════════════
// COMMON MIDDLEWARE PATTERNS
// ═══════════════════════════════════

// Rate limiting
import rateLimit from 'express-rate-limit';
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100                   // 100 requests per window
}));

// CORS
import cors from 'cors';
app.use(cors({ origin: 'https://myapp.com' }));

// Request ID for tracing
function requestId(req, res, next) {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
}

// Role-based authorization
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

app.delete('/api/users/:id',
  authenticate,
  authorize('admin'),
  deleteUserHandler
);


// ═══════════════════════════════════
// FASTIFY: HOOK-BASED APPROACH
// ═══════════════════════════════════

import Fastify from 'fastify';
const fastify = Fastify({ logger: true });

// Hooks instead of middleware
fastify.addHook('onRequest', async (request, reply) => {
  // Runs before route handler
  request.startTime = Date.now();
});

fastify.addHook('onResponse', async (request, reply) => {
  // Runs after response is sent
  const duration = Date.now() - request.startTime;
  request.log.info({ duration }, 'request completed');
});

// Schema-based validation (built-in, faster)
fastify.post('/api/users', {
  schema: {
    body: {
      type: 'object',
      required: ['email', 'name'],
      properties: {
        email: { type: 'string', format: 'email' },
        name: { type: 'string', minLength: 1 }
      }
    }
  }
}, async (request, reply) => {
  // body is already validated
  return createUser(request.body);
});
```

## Explanation

Middleware is the **separation of concerns** pattern applied to HTTP. Instead of one giant handler that authenticates, validates, logs, handles errors, and processes the request, each concern is an isolated function in a pipeline.

**Key benefits:**
- **Reusable** — auth middleware works for every route
- **Composable** — mix and match per route (some routes need auth, others don't)
- **Testable** — test each middleware in isolation
- **Ordered** — execution order is explicit and controllable

**Express vs Fastify approach:**
- Express uses `app.use()` middleware chain (function-based)
- Fastify uses lifecycle hooks (event-based, faster)
- Both achieve the same goal: composable request processing

## ELI5

Middleware is like a security checkpoint at an airport. Your boarding pass (request) goes through multiple checkpoints: ID check (authentication), bag scan (validation), customs (authorization). Each checkpoint either lets you through to the next one or stops you. The plane (route handler) only sees passengers who made it through all the checkpoints.
