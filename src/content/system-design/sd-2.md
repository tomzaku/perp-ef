---
id: sd-2
title: "OAuth 2.0 & OpenID Connect"
category: System Design
subcategory: Authentication
difficulty: Medium
pattern: Authentication
companies: [Google, Meta, Microsoft]
timeComplexity: N/A - architectural
spaceComplexity: N/A - architectural
keyTakeaway: OAuth 2.0 + PKCE is the standard for SPA authentication. The code_verifier/code_challenge pair prevents authorization code interception without needing a client secret.
similarProblems: [JWT Authentication, Social Login, SSO]
---

**OAuth 2.0** is an authorization framework that allows third-party apps to access a user's resources without exposing their credentials. **OpenID Connect (OIDC)** adds an identity layer on top for authentication.

**Authorization Code Flow with PKCE** (recommended for SPAs):
1. Generate a random `code_verifier` and its `code_challenge` (SHA-256 hash)
2. Redirect user to authorization server with `code_challenge`
3. User logs in and grants permission
4. Server redirects back with an `authorization_code`
5. Exchange code + `code_verifier` for tokens
6. PKCE prevents code interception attacks (no client secret needed)

**Key concepts:** Scopes, redirect URIs, state parameter (CSRF), nonce (replay), id_token vs access_token.

Implement OAuth 2.0 Authorization Code flow with PKCE for a SPA.

## Solution

```js
// ════════════════════════════════════════════
// OAuth 2.0 Authorization Code Flow with PKCE
// ════════════════════════════════════════════

class OAuthClient {
  constructor(config) {
    this.clientId = config.clientId;
    this.redirectUri = config.redirectUri;
    this.authorizationEndpoint = config.authorizationEndpoint;
    this.tokenEndpoint = config.tokenEndpoint;
    this.scopes = config.scopes || ['openid', 'profile', 'email'];
  }

  // Step 1: Generate PKCE challenge
  async #generatePKCE() {
    // Random 43-128 character string
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const codeVerifier = this.#base64UrlEncode(array);

    // SHA-256 hash of verifier
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(codeVerifier)
    );
    const codeChallenge = this.#base64UrlEncode(new Uint8Array(digest));

    return { codeVerifier, codeChallenge };
  }

  #base64UrlEncode(buffer) {
    const bytes = new Uint8Array(buffer);
    let str = '';
    bytes.forEach(b => str += String.fromCharCode(b));
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // Step 2: Build authorization URL and redirect
  async startLogin() {
    const { codeVerifier, codeChallenge } = await this.#generatePKCE();
    const state = crypto.randomUUID(); // CSRF protection

    // Store for callback verification
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    // Redirect to authorization server
    window.location.href = this.authorizationEndpoint + '?' + params.toString();
  }

  // Step 3: Handle callback — exchange code for tokens
  async handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (error) throw new Error('OAuth error: ' + error);

    // Verify state (CSRF protection)
    const savedState = sessionStorage.getItem('oauth_state');
    if (state !== savedState) throw new Error('State mismatch — possible CSRF');

    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
    if (!codeVerifier) throw new Error('No code verifier found');

    // Exchange code for tokens
    const res = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        code_verifier: codeVerifier,
      }),
    });

    if (!res.ok) throw new Error('Token exchange failed');

    // Cleanup
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('oauth_state');

    const tokens = await res.json();
    // tokens: { access_token, id_token, refresh_token, token_type, expires_in }

    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);

    return tokens;
  }
}

// Usage
const oauth = new OAuthClient({
  clientId: 'my-spa-client-id',
  redirectUri: 'https://myapp.com/callback',
  authorizationEndpoint: 'https://auth.example.com/authorize',
  tokenEndpoint: 'https://auth.example.com/token',
  scopes: ['openid', 'profile', 'email'],
});

// Login button click:
// oauth.startLogin();

// On callback page:
// const tokens = await oauth.handleCallback();
```

## Explanation

OAUTH 2.0 AUTHORIZATION CODE FLOW WITH PKCE:

```
Step 1: Generate PKCE pair
  code_verifier = random_string(43-128 chars)
  code_challenge = BASE64URL(SHA256(code_verifier))

Step 2: Redirect to auth server
  Browser ──► https://auth.example.com/authorize?
                response_type=code
                &client_id=my-app
                &redirect_uri=https://myapp.com/callback
                &scope=openid profile email
                &state=random-csrf-token
                &code_challenge=xxx
                &code_challenge_method=S256

Step 3: User logs in, grants consent
  Auth Server ──► https://myapp.com/callback?
                    code=AUTH_CODE_HERE
                    &state=random-csrf-token

Step 4: Exchange code + verifier for tokens
  POST /token
  {
    grant_type: "authorization_code",
    code: AUTH_CODE_HERE,
    code_verifier: original_verifier,
    client_id: my-app,
    redirect_uri: https://myapp.com/callback
  }

Step 5: Receive tokens
  { access_token, id_token, refresh_token, expires_in }
```

WHY PKCE?
```
Without PKCE:               With PKCE:
code intercepted ──► used!  code intercepted ──► useless!
                            (attacker doesn't have code_verifier)
```

## ELI5

Imagine you want to use your Google account to log in to Spotify. You don't give Spotify your Google password — that would be dangerous. Instead, OAuth lets Google hand Spotify a **temporary visitor badge**.

```
Without OAuth:
  Spotify: "Give us your Google password so we can access your name and photo"
  You: 😱 "That means Spotify could read all my emails too!"

With OAuth:
  Spotify: "Please ask Google for permission to read your name and photo"
  Google:  "Hey user, Spotify wants: name, photo. Allow?"
  You:     "Yes, just name and photo"
  Google:  "Here's a badge for Spotify that ONLY opens name+photo"
  Spotify: ✅ Gets exactly what it needs, nothing more
```

**PKCE** (pick-see) is the security trick that prevents someone from intercepting the badge request:

```
Normal flow risk:
  Google → sends code to Spotify callback URL
  Attacker intercepts the code → uses it to get tokens! 😱

PKCE fix:
  Step 1: Spotify generates a secret puzzle piece (code_verifier)
  Step 2: Spotify sends only the ANSWER to the puzzle (code_challenge = hash)
  Step 3: Attacker intercepts the code → tries to use it
  Step 4: Google asks: "What was the original puzzle piece?"
  Step 5: Attacker doesn't have it → REJECTED ✅
```

The visitor badge (access token) has an expiry time and limited permissions (scopes). Even if stolen, it can't do much — and it stops working soon.
