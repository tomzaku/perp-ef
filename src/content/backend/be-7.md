---
id: be-7
title: HTTP Deep Dive (Methods, Headers, Status Codes, CORS)
category: Backend
subcategory: HTTP & APIs
difficulty: Easy
pattern: Protocol Knowledge
companies: [Google, Amazon, Meta, Stripe, Cloudflare]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "HTTP is the foundation of web communication. Understanding methods (GET/POST/PUT/PATCH/DELETE), status codes (2xx/3xx/4xx/5xx), headers (Content-Type, Authorization, Cache-Control), and CORS is essential. Key principle: methods should match their semantics — GET is safe and idempotent, POST is not, PUT replaces, PATCH updates partially."
similarProblems: [REST vs GraphQL, API Rate Limiting, Authentication Security]
---

**Explain HTTP methods, status codes, headers, and CORS in depth.**

HTTP is the protocol that powers the web. Deep understanding separates backend developers who build robust APIs from those who just make things work.

## Solution

```text
HTTP METHODS & SEMANTICS
════════════════════════

Method  │ Idempotent │ Safe │ Body │ Use case
────────┼────────────┼──────┼──────┼──────────────────────
GET     │ Yes        │ Yes  │ No   │ Read a resource
POST    │ No         │ No   │ Yes  │ Create a resource
PUT     │ Yes        │ No   │ Yes  │ Replace a resource entirely
PATCH   │ No*        │ No   │ Yes  │ Partially update a resource
DELETE  │ Yes        │ No   │ No*  │ Remove a resource
HEAD    │ Yes        │ Yes  │ No   │ Like GET but no body (check existence)
OPTIONS │ Yes        │ Yes  │ No   │ CORS preflight, discover methods

* PATCH can be idempotent depending on implementation
* DELETE can have a body but it's uncommon

Idempotent: Same request N times → same result as 1 time
Safe: Does not modify server state (read-only)

// Examples:
GET    /api/users/123         → Read user 123
POST   /api/users             → Create new user
PUT    /api/users/123         → Replace user 123 entirely
PATCH  /api/users/123         → Update specific fields of user 123
DELETE /api/users/123         → Delete user 123


STATUS CODES
════════════

2xx SUCCESS
  200 OK              → Standard success (GET, PUT, PATCH)
  201 Created         → Resource created (POST) — include Location header
  204 No Content      → Success with no body (DELETE)

3xx REDIRECTION
  301 Moved Permanently  → URL changed permanently (SEO: updates links)
  302 Found              → Temporary redirect
  304 Not Modified       → Client cache is still valid (conditional request)

4xx CLIENT ERROR
  400 Bad Request        → Malformed request / validation error
  401 Unauthorized       → Not authenticated (missing/invalid credentials)
  403 Forbidden          → Authenticated but not authorized
  404 Not Found          → Resource doesn't exist
  405 Method Not Allowed → Wrong HTTP method for this endpoint
  409 Conflict           → State conflict (e.g., duplicate email)
  422 Unprocessable      → Valid syntax but semantic errors
  429 Too Many Requests  → Rate limited — check Retry-After header

5xx SERVER ERROR
  500 Internal Server Error → Unhandled server error
  502 Bad Gateway           → Upstream server returned invalid response
  503 Service Unavailable   → Server is overloaded / maintenance
  504 Gateway Timeout       → Upstream server didn't respond in time


KEY HEADERS
═══════════

Request Headers:
  Content-Type: application/json         ← Body format
  Accept: application/json               ← Desired response format
  Authorization: Bearer <token>          ← Auth credentials
  Cache-Control: no-cache                ← Caching directive
  If-None-Match: "etag123"              ← Conditional request (304)
  X-Request-ID: uuid                     ← Request tracing

Response Headers:
  Content-Type: application/json
  Cache-Control: max-age=3600            ← Cache for 1 hour
  ETag: "abc123"                         ← Resource version
  Location: /api/users/456              ← Created resource URL (201)
  Retry-After: 60                        ← When to retry (429)
  X-RateLimit-Remaining: 95             ← Rate limit info


CORS (Cross-Origin Resource Sharing)
════════════════════════════════════

Problem: Browser blocks requests from origin A to origin B by default
  (Same-origin policy: scheme + host + port must match)

  https://myapp.com → https://api.myapp.com  ← Different origin!

How CORS works:

1. SIMPLE REQUESTS (GET, POST with simple headers):
   Browser adds:  Origin: https://myapp.com
   Server responds: Access-Control-Allow-Origin: https://myapp.com
   Browser allows the response.

2. PREFLIGHT REQUESTS (PUT, DELETE, custom headers):
   Browser sends OPTIONS first:
     OPTIONS /api/users
     Origin: https://myapp.com
     Access-Control-Request-Method: DELETE
     Access-Control-Request-Headers: Authorization

   Server responds:
     Access-Control-Allow-Origin: https://myapp.com
     Access-Control-Allow-Methods: GET, POST, PUT, DELETE
     Access-Control-Allow-Headers: Authorization, Content-Type
     Access-Control-Max-Age: 86400  ← Cache preflight for 24h

   Then browser sends the actual DELETE request.

// Express CORS setup:
app.use(cors({
  origin: ['https://myapp.com', 'https://staging.myapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Allow cookies cross-origin
  maxAge: 86400
}));

// NEVER use in production:
// Access-Control-Allow-Origin: *  (with credentials)


CONTENT NEGOTIATION
═══════════════════

Client says what it wants:
  Accept: application/json              → Wants JSON
  Accept: text/html                     → Wants HTML
  Accept-Language: en-US, fr;q=0.5      → Prefers English, accepts French
  Accept-Encoding: gzip, br             → Supports compression

Server responds accordingly:
  Content-Type: application/json
  Content-Language: en-US
  Content-Encoding: gzip
```

## Explanation

HTTP knowledge is foundational for every backend developer. Key principles:

- **Use methods correctly**: GET for reads, POST for creates, PUT for full replacement, PATCH for partial updates. This isn't just convention — caches, proxies, and browsers depend on correct semantics
- **Return appropriate status codes**: A 200 for a created resource is misleading. A 500 for a validation error exposes internals. Be precise
- **Leverage headers**: Cache-Control saves bandwidth, ETag enables conditional requests, proper CORS prevents security issues while allowing legitimate cross-origin access

**Common mistakes:**
- Using POST for everything (breaks caching, semantics)
- Returning 200 with `{ error: true }` instead of proper 4xx/5xx
- Setting `Access-Control-Allow-Origin: *` with credentials
- Not setting Cache-Control (browsers cache aggressively by default)

## ELI5

HTTP is like ordering at a restaurant. The method is what you're doing (looking at the menu = GET, placing an order = POST, changing your order = PATCH, canceling = DELETE). Status codes are the waiter's response (200 = "here's your food!", 404 = "we don't have that", 500 = "the kitchen is on fire"). Headers are extra instructions on the order slip ("no peanuts", "serve on a warm plate"). CORS is like the restaurant's rule about whether takeout customers can eat inside.
