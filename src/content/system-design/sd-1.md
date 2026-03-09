---
id: sd-1
title: JWT Authentication Flow
category: System Design
subcategory: Authentication
difficulty: Medium
pattern: Authentication
companies: [Google, Meta, Amazon]
timeComplexity: N/A - architectural
spaceComplexity: N/A - architectural
keyTakeaway: "JWT enables stateless auth: short-lived access tokens for API calls + long-lived refresh tokens for rotation. Always deduplicate concurrent refresh requests and add a time buffer before expiry."
similarProblems: [OAuth 2.0, Session Authentication, Token Security]
---

**JSON Web Tokens (JWT)** are the standard for stateless authentication in modern SPAs. A JWT has three parts: **Header** (algorithm), **Payload** (claims like userId, exp), and **Signature** (verification).

**The flow:**
1. User logs in with credentials
2. Server validates and returns an **access token** (short-lived, ~15min) and a **refresh token** (long-lived, ~7 days)
3. Client sends access token in Authorization header for API calls
4. When access token expires, use refresh token to get a new pair
5. On logout, invalidate the refresh token server-side

**Key decisions:**
- Where to store tokens? httpOnly cookies (safest) vs localStorage (convenient but XSS-vulnerable)
- Access token lifetime? Short = more secure, longer = fewer refreshes
- How to handle token refresh transparently?

Implement a complete JWT auth flow with automatic token refresh.

## Solution

```js
// ════════════════════════════════════════════
// JWT Structure
// ════════════════════════════════════════════
// Header:  { "alg": "HS256", "typ": "JWT" }
// Payload: { "sub": "user123", "role": "admin", "exp": 1700000000 }
// Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
//
// Result: xxxxx.yyyyy.zzzzz (base64url encoded)

// ════════════════════════════════════════════
// Server-side: Token Generation (Node.js + jsonwebtoken)
// ════════════════════════════════════════════
// const jwt = require('jsonwebtoken');
//
// function generateTokens(user) {
//   const accessToken = jwt.sign(
//     { sub: user.id, role: user.role },
//     process.env.ACCESS_SECRET,
//     { expiresIn: '15m' }
//   );
//   const refreshToken = jwt.sign(
//     { sub: user.id },
//     process.env.REFRESH_SECRET,
//     { expiresIn: '7d' }
//   );
//   // Store refresh token hash in DB for invalidation
//   return { accessToken, refreshToken };
// }

// ════════════════════════════════════════════
// Client-side: Auth Service with Auto-Refresh
// ════════════════════════════════════════════

class AuthService {
  #accessToken = null;
  #refreshToken = null;
  #refreshPromise = null;

  async login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error('Login failed');
    const { accessToken, refreshToken } = await res.json();
    this.#accessToken = accessToken;
    this.#refreshToken = refreshToken;
    return this.#decodePayload(accessToken);
  }

  async logout() {
    if (this.#refreshToken) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + this.#accessToken },
        body: JSON.stringify({ refreshToken: this.#refreshToken }),
      }).catch(() => {});
    }
    this.#accessToken = null;
    this.#refreshToken = null;
  }

  // Transparently refresh token when expired
  async #refreshTokens() {
    // Deduplicate concurrent refresh requests
    if (this.#refreshPromise) return this.#refreshPromise;

    this.#refreshPromise = fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.#refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Refresh failed');
        const { accessToken, refreshToken } = await res.json();
        this.#accessToken = accessToken;
        this.#refreshToken = refreshToken;
      })
      .finally(() => { this.#refreshPromise = null; });

    return this.#refreshPromise;
  }

  #isTokenExpired(token) {
    const payload = this.#decodePayload(token);
    if (!payload || !payload.exp) return true;
    return Date.now() >= payload.exp * 1000 - 30000; // 30s buffer
  }

  #decodePayload(token) {
    try {
      const base64 = token.split('.')[1];
      return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
    } catch { return null; }
  }

  // Authenticated fetch — auto-refreshes if needed
  async authFetch(url, options = {}) {
    if (!this.#accessToken) throw new Error('Not authenticated');

    if (this.#isTokenExpired(this.#accessToken)) {
      await this.#refreshTokens();
    }

    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: 'Bearer ' + this.#accessToken,
      },
    });

    // If still 401, try one refresh
    if (res.status === 401) {
      await this.#refreshTokens();
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: 'Bearer ' + this.#accessToken,
        },
      });
    }

    return res;
  }

  getUser() {
    if (!this.#accessToken) return null;
    return this.#decodePayload(this.#accessToken);
  }
}

// Usage
const auth = new AuthService();
await auth.login('user@example.com', 'password');
const res = await auth.authFetch('/api/profile');
console.log(await res.json());
```

## Explanation

JWT AUTH FLOW:

```
LOGIN:
Client                    Server                   DB
  │ POST /auth/login        │                       │
  │ {email, password} ──────►│                       │
  │                          │──verify password──────►│
  │                          │◄─────── user ─────────│
  │                          │                       │
  │◄── {accessToken,        │                       │
  │     refreshToken} ──────│── store refresh hash──►│
  │                          │                       │

API CALL:
Client                    Server
  │ GET /api/data            │
  │ Authorization: Bearer AT─►│
  │                          │── verify AT signature
  │                          │── check exp claim
  │◄──── { data } ──────────│

TOKEN REFRESH:
Client                    Server                   DB
  │ POST /auth/refresh       │                       │
  │ {refreshToken} ──────────►│                       │
  │                          │── verify RT ──────────►│
  │                          │── rotate: delete old──►│
  │                          │── store new hash──────►│
  │◄── {newAT, newRT} ──────│                       │
```

TOKEN STORAGE:
```
Option           XSS Safe?  CSRF Safe?  Notes
─────────────────────────────────────────────────────
httpOnly cookie  ✓          ✗ (need CSRF token)  Best for SSR
localStorage     ✗          ✓                    Convenient for SPA
In-memory        ✓          ✓                    Lost on refresh
```

Best practice: access token in memory, refresh token in httpOnly cookie.

## ELI5

Imagine a nightclub that stamps your hand at the entrance after checking your ID.

**JWT is that stamp.** Once you have it, every bouncer at every door can check the stamp without calling the front desk. The stamp already contains everything needed — "over 21, paid entry, valid until midnight."

```
Without JWT (sessions):
  You → Door bouncer → "Let me call the front desk to verify you"
  Front desk → "Yes, they're valid" → "Okay, come in"
  (Every door calls the front desk every time — slow!)

With JWT:
  You → Door bouncer → checks the stamp → "Valid! Come in."
  (No calls needed — the stamp is self-contained)
```

**The stamp has 3 parts:**
- **What kind of stamp** (algorithm used to make it)
- **What it says** (your user ID, role, when it expires)
- **A security seal** (only the club owner can forge this)

**Why two tokens?**
- **Access token** = the stamp on your hand (lasts 15 minutes, used constantly)
- **Refresh token** = a ticket stub in your wallet (lasts 7 days, used only to get a new stamp)

When the stamp fades (expires), you show your ticket stub to get a fresh stamp — without logging in again.
