---
id: sd-3
title: Session vs Token Authentication
category: System Design
subcategory: Authentication
difficulty: Easy
pattern: Authentication
companies: [Amazon, Google]
timeComplexity: N/A - architectural
spaceComplexity: N/A - architectural
keyTakeaway: Sessions = stateful + instant revocation. Tokens = stateless + scalable. The hybrid approach (short JWT + revocable refresh token) combines the best of both.
similarProblems: [JWT Authentication, OAuth 2.0, Cookie Security]
---

Compare **session-based** (stateful) and **token-based** (stateless) authentication. Understanding the trade-offs is critical for system design interviews.

**Session-based:** Server creates a session object, stores it (memory/Redis), sends a session ID cookie to the client. Every request sends the cookie; server looks up the session.

**Token-based (JWT):** Server creates a signed token containing user claims. Client stores and sends the token. Server verifies the signature without any lookup.

When to use which? What are the security implications? How does each handle scaling, logout, and session management?

## Solution

```js
// ════════════════════════════════════════════
// SESSION-BASED AUTHENTICATION
// ════════════════════════════════════════════

// Server-side session store (simplified)
class SessionStore {
  constructor() {
    this.sessions = new Map(); // In production: Redis
  }

  create(userId, data = {}) {
    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, {
      userId,
      ...data,
      createdAt: Date.now(),
      lastAccess: Date.now(),
    });
    return sessionId;
  }

  get(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) session.lastAccess = Date.now();
    return session || null;
  }

  destroy(sessionId) {
    this.sessions.delete(sessionId);
  }

  // Logout: just delete the session
  // Advantage: INSTANT invalidation
}

// Session middleware
function sessionMiddleware(store) {
  return (req) => {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) return { authenticated: false };
    const session = store.get(sessionId);
    if (!session) return { authenticated: false };
    return { authenticated: true, userId: session.userId, session };
  };
}

// ════════════════════════════════════════════
// TOKEN-BASED AUTHENTICATION (JWT)
// ════════════════════════════════════════════

// Token middleware
function tokenMiddleware(secret) {
  return (req) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return { authenticated: false };
    try {
      // In real code: jwt.verify(token, secret)
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) return { authenticated: false };
      return { authenticated: true, userId: payload.sub, claims: payload };
    } catch {
      return { authenticated: false };
    }
  };
}

// ════════════════════════════════════════════
// COMPARISON TABLE
// ════════════════════════════════════════════

const comparison = {
  session: {
    state:     'Stateful (server stores session data)',
    storage:   'Server: Redis/memory. Client: cookie (session ID only)',
    scaling:   'Requires shared session store (Redis) for multiple servers',
    logout:    'Instant — delete session from store',
    security:  'Session ID is opaque, no data exposed. Needs CSRF protection.',
    payload:   'Can store anything server-side (cart, preferences, etc.)',
    mobile:    'Less ideal — cookies are web-centric',
    bestFor:   'Server-rendered apps, apps needing instant logout/revocation',
  },
  token: {
    state:     'Stateless (server stores nothing)',
    storage:   'Client: localStorage, memory, or httpOnly cookie',
    scaling:   'Easy — any server can verify the signature independently',
    logout:    'Tricky — token valid until expiry. Need blocklist for instant revoke.',
    security:  'Payload is readable (base64). Use short expiry. XSS can steal tokens.',
    payload:   'Limited — claims encoded in token (keep it small)',
    mobile:    'Great — tokens work naturally with mobile APIs',
    bestFor:   'SPAs, mobile apps, microservices, APIs',
  },
};

console.table(comparison);

// ════════════════════════════════════════════
// HYBRID APPROACH (recommended)
// ════════════════════════════════════════════

// Access token (JWT): stateless, short-lived (15 min)
// Refresh token: stored in DB (like a session), long-lived (7 days)
// This gives you:
// - Stateless API calls (fast, scalable)
// - Ability to revoke refresh tokens (security)
// - Automatic rotation on refresh
```

## ELI5

Imagine two ways a library tracks who is allowed to borrow books.

**Sessions (stateful):**
When you check in, the librarian writes your name in a logbook and gives you a **numbered card** (session ID). Every time you want a book, you show the card, and the librarian looks up your name in the logbook.

```
Session flow:
  You enter → Librarian writes "Card #42 = Alice" in logbook
  You want a book → show Card #42 → librarian checks logbook → "Alice, approved!"
  You leave → Librarian CROSSES OUT Card #42 (instant logout!)

If the logbook is gone → all sessions gone (scaling problem)
```

**Tokens (stateless):**
When you check in, you get a **laminated card with your name already printed on it**, plus a special seal that only the librarian can forge. No logbook needed — the card proves itself.

```
Token flow:
  You enter → Librarian prints "Alice, expires 3pm" card + stamps it with seal
  You want a book → show card → any librarian checks the seal → "Valid! Alice approved!"
  No logbook needed → any branch of the library can verify you

Problem: can't instantly cancel — card stays valid until 3pm even if you leave
```

**The hybrid approach** (best of both):
- Short-lived JWT (like a 15-min day pass) — stateless and fast
- Long-lived refresh token stored in the database — can be instantly revoked

```
It's like having:
  - A 15-minute parking ticket (JWT) — checked without calling anyone
  - A monthly parking permit in the database — can be canceled instantly
```
