---
id: sd-4
title: Authentication Security Best Practices
category: System Design
subcategory: Authentication
difficulty: Medium
pattern: Security
companies: [Google, Amazon, Meta]
timeComplexity: N/A - architectural
spaceComplexity: N/A - architectural
keyTakeaway: "Store tokens in memory (not localStorage), use httpOnly/secure/sameSite cookies for refresh tokens, implement CSRF protection, rate-limit login attempts, and set CSP headers."
similarProblems: [JWT Authentication, XSS Prevention, CSRF Protection]
---

Security best practices for authentication in web applications. Covers XSS prevention, CSRF protection, secure cookie configuration, token handling, and common attack vectors.

**Key threats:**
- **XSS (Cross-Site Scripting):** Attacker injects script that steals tokens from localStorage
- **CSRF (Cross-Site Request Forgery):** Attacker tricks browser into making authenticated requests
- **Token theft:** Intercepting tokens via man-in-the-middle or XSS
- **Brute force:** Guessing passwords or tokens

Implement secure authentication with all best practices.

## Solution

```js
// ════════════════════════════════════════════
// 1. SECURE COOKIE CONFIGURATION
// ════════════════════════════════════════════

// Server-side: Set secure cookie flags
// res.cookie('refreshToken', token, {
//   httpOnly: true,    // JS cannot read it (XSS protection)
//   secure: true,      // HTTPS only
//   sameSite: 'Strict', // CSRF protection
//   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//   path: '/api/auth', // Only sent to auth endpoints
// });

// ════════════════════════════════════════════
// 2. XSS PREVENTION
// ════════════════════════════════════════════

// NEVER store sensitive tokens in localStorage (XSS-vulnerable)
// ❌ localStorage.setItem('token', jwt);

// ✅ Store access token in memory (closure/variable)
// ✅ Store refresh token in httpOnly cookie

function createSecureTokenStorage() {
  let accessToken = null; // In-memory only — safe from XSS

  return {
    setToken(token) { accessToken = token; },
    getToken() { return accessToken; },
    clearToken() { accessToken = null; },
  };
}

// Content Security Policy header (server-side)
// Content-Security-Policy: default-src 'self'; script-src 'self';

// Sanitize user input before rendering
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str; // textContent auto-escapes
  return div.innerHTML;
}

// ════════════════════════════════════════════
// 3. CSRF PROTECTION
// ════════════════════════════════════════════

// Double Submit Cookie pattern
class CSRFProtection {
  generateToken() {
    const token = crypto.randomUUID();
    // Set as a regular (non-httpOnly) cookie so JS can read it
    document.cookie = 'csrf_token=' + token + ';path=/;SameSite=Strict';
    return token;
  }

  // Add CSRF token to requests
  addToRequest(headers) {
    const match = document.cookie.match(/csrf_token=([^;]+)/);
    if (match) {
      headers['X-CSRF-Token'] = match[1];
    }
    return headers;
  }
}

// Server verifies: cookie csrf_token === header X-CSRF-Token
// Attacker can't read the cookie from another domain

// ════════════════════════════════════════════
// 4. RATE LIMITING (client-side awareness)
// ════════════════════════════════════════════

class RateLimitedAuth {
  #attempts = 0;
  #lockoutUntil = 0;
  #maxAttempts = 5;
  #lockoutMs = 30000; // 30 seconds

  async login(email, password) {
    if (Date.now() < this.#lockoutUntil) {
      const remaining = Math.ceil((this.#lockoutUntil - Date.now()) / 1000);
      throw new Error('Too many attempts. Try again in ' + remaining + 's');
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After') || 30;
        this.#lockoutUntil = Date.now() + retryAfter * 1000;
        throw new Error('Rate limited. Try again later.');
      }

      if (!res.ok) {
        this.#attempts++;
        if (this.#attempts >= this.#maxAttempts) {
          this.#lockoutUntil = Date.now() + this.#lockoutMs;
          this.#attempts = 0;
        }
        throw new Error('Invalid credentials');
      }

      this.#attempts = 0;
      return res.json();
    } catch (err) {
      throw err;
    }
  }
}

// ════════════════════════════════════════════
// 5. SECURE PASSWORD HANDLING
// ════════════════════════════════════════════

// Client: NEVER send plain password more than needed
// Server: ALWAYS hash with bcrypt/argon2 (NEVER MD5/SHA)

// Client-side: check password strength before submit
function checkPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score, strong: score >= 4 };
}

console.log(checkPasswordStrength('MyP@ss1'));
// { checks: {...}, score: 4, strong: true }
```

## ELI5

Imagine you're protecting your house. There are three main threats, and one defense for each.

**XSS (Cross-Site Scripting) = a thief hiding inside your house:**
An attacker slips malicious code into your website. That code runs in your user's browser and can steal anything in localStorage (like tokens).

```
Attack:
  Hacker posts a comment: <script>steal(localStorage.token)</script>
  Victim views the page → script runs → token stolen!

Defense:
  - Never store tokens in localStorage (keep access token in memory)
  - Sanitize user input before rendering it
  - Set Content Security Policy headers (CSP)
```

**CSRF (Cross-Site Request Forgery) = someone forging your signature:**
An attacker tricks your browser into sending a request to your bank while you're logged in.

```
Attack:
  You're logged into bank.com (cookie auto-sends on every request)
  You visit evil.com → it secretly makes: POST bank.com/transfer?to=hacker
  Your browser sends the cookie automatically → bank thinks it's you!

Defense:
  - SameSite=Strict cookies (browser won't send cookie to other sites)
  - CSRF token: a secret that evil.com can't read from your cookie
```

**Brute force = trying every key until one works:**

```
Defense:
  After 5 failed logins → lock for 30 seconds
  Exponential backoff: 30s → 1min → 5min → 1 hour...
  Server-side rate limiting with 429 Too Many Requests
```

The three golden rules: **store tokens safely** (memory/httpOnly cookies), **verify the caller's identity** (CSRF tokens), **limit mistakes** (rate limiting).
