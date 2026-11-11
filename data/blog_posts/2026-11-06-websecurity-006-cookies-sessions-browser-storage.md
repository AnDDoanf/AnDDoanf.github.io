---
title: "WebSecurity#006: Cookies, Sessions, and Browser Storage"
date: 2026-11-06
category: journal
series: WebSecurity
description: "Compare cookie and storage behavior, understand session lifecycles, and choose protections for browser-held state."
tags: [programming, cybersecurity, WebSecurity]
author:
  name: An Doan
  link: https://anddoanf.github.io/
---

## 1. Introduction

A web application needs continuity between otherwise independent requests. Cookies can carry a session identifier, while browser storage can retain interface preferences and application data. The security of each choice depends on who can read it, when it travels, and how long it remains useful.

Start by classifying the value. A theme preference, a cached project title, and a credential that authorizes account access need different treatment.

## 2. Fundamentals

### Cookies travel with matching requests

A server uses `Set-Cookie` to ask a browser to retain a value. The browser subsequently attaches eligible cookies according to the destination and cookie rules. Cookies are scoped by host or domain and path, with additional controls for transport and cross-site behavior. Ports do not isolate cookies: the two loopback ports used in this series have different origins but share the same cookie host.

```http
Set-Cookie: __Host-session=opaque-random-value; Path=/; Secure; HttpOnly; SameSite=Lax
```

The `__Host-` prefix requires `Secure`, a root path, and no Domain attribute in supporting browsers. `HttpOnly` hides the value from script cookie APIs. `Secure` limits transmission to secure connections, subject to browser localhost treatment. `SameSite` influences cross-site delivery; it is different from the same-origin policy.

### Sessions are a lifecycle

A server-side session commonly maps an unpredictable identifier to account state. The server establishes it after authentication, rotates it when appropriate, enforces expiration, and invalidates it on logout or revocation. A cookie's expiry and the server session's validity are separate controls.

JWT-based designs change where some claims live but still need expiry, verification, key management, and a revocation strategy. Calling a token stateless does not remove those lifecycle requirements.

### Browser storage is script-accessible

`localStorage` persists across ordinary browser restarts until removed, subject to browser behavior. `sessionStorage` is associated with an origin and a top-level browsing context and generally lasts for that tab's page session, including reloads. IndexedDB supports structured persistent data. These stores do not automatically attach their values to HTTP requests.

Unlike HttpOnly cookies, these APIs are accessible to scripts running in the relevant origin. Do not confuse persistence with confidentiality.

### Compare storage choices by attacker capability

| Mechanism | Sent automatically with eligible requests? | Readable by ordinary same-origin script? | Typical lifetime |
| --- | --- | --- | --- |
| HttpOnly cookie | Yes, subject to request and cookie rules | Cookie value is hidden | Session or configured expiry |
| Non-HttpOnly cookie | Yes | Yes, within applicable cookie visibility | Session or configured expiry |
| localStorage | No | Yes | Persistent until removal or browser eviction |
| sessionStorage | No | Yes | The relevant tab's page session |
| IndexedDB | No | Yes | Persistent, subject to browser policy |
| JavaScript memory | No | Accessible to code sharing the relevant execution context | Usually until page or process context ends |

Moving a token between these locations changes exposure, not the authority of the token. A copied bearer token can generally be used by whoever possesses it until validation or revocation stops it. A browser store is therefore part of the credential-handling design, not an encryption boundary protecting data from all other code in the page.

Memory storage can reduce accidental persistence but complicates refresh and multi-tab behavior. Server-managed HttpOnly sessions reduce direct credential extraction by scripts but still require protection against authenticated actions initiated through XSS. Choose the design from the actual attacker model rather than a universal claim that one storage API makes every application safe.

### Define the session state machine

A session can move through anonymous, authenticated, elevated, expired, and revoked states. Login should create or rotate the authenticated session so a preexisting identifier is not adopted blindly. A sensitive role change can require fresh authentication and a new session context. Logout and account disablement must invalidate the appropriate server-side authority.

Idle timeout and absolute timeout solve different problems. Idle timeout ends a session after inactivity; absolute timeout caps total lifetime even if requests continue. If reading the page automatically generates background requests, decide whether those requests count as user activity. Otherwise, an apparently idle account may never expire.

A "remember me" feature introduces a longer-lived credential, not an exception to the lifecycle. It needs explicit issuance, rotation, theft handling, device management, and revocation rules. Do not simply set an ordinary high-privilege access credential to expire in a year.

## 3. Vulnerability

Storing a long-lived bearer credential in `localStorage` makes it readable to successful same-origin script injection. Cookies reduce that specific exposure when HttpOnly is set, but eligible cookies still accompany requests initiated by injected code. Cookie-based sessions also need CSRF defenses for state changes.

Overly broad cookie domains, session identifiers in URLs, missing invalidation, and private data left behind after logout create additional risks. Cookie paths organize delivery but should not be treated as a strong security boundary between applications sharing an origin.

### Choose SameSite behavior with the actual flow in mind

Strict, Lax, and None express different cross-site delivery rules; they are not a ranking that can be selected independently of the product. Strict can disrupt sessions reached through legitimate external navigations. Lax allows selected cross-site top-level navigation behavior but should not be treated as the only CSRF protection. None enables cross-site eligibility and requires Secure in current browsers, while privacy restrictions can still limit delivery.

Trace sign-in callbacks, external payment returns, embedded applications, and ordinary navigation before choosing the setting. A federated login flow may also need a separate short-lived transaction cookie with carefully chosen attributes rather than weakening every application cookie globally.

Keep the session's server authority separate from these delivery settings. SameSite can affect whether a browser sends a cookie from a particular context; it does not invalidate a copied session identifier or prove a requested operation is authorized.

## 4. Attack scenario

A dashboard stores its access token in `localStorage`. A compromised third-party script reads the token and sends it elsewhere. The attacker can reuse it until server policy makes it invalid. Clearing the token from the original browser does not automatically invalidate a copied token.

A short token lifetime limits exposure, while preventing script injection and reducing third-party script authority address the underlying entry point.

## 5. Technical demonstration

Run the [local lab](/assets/websecurity/websecurity-lab.mjs), open port 8080, and click **Set an HttpOnly demo cookie**. Inspect the response's `Set-Cookie` header and the cookie in DevTools storage.

In the Console:

```js
localStorage.setItem("lab-theme", "dark");
sessionStorage.setItem("lab-draft", "synthetic note");
document.cookie;
```

The demo cookie is absent from `document.cookie` because it is HttpOnly. In the Network panel, a later same-origin `/data` request still carries the eligible cookie. It is only a fixed demonstration value, not a login credential.

The local HTTP fixture deliberately omits `Secure`; production session cookies require HTTPS and the Secure attribute. After the exercise, remove the two storage entries and demo cookie through DevTools.

### Build and inspect a server-side session record

Save this separate example as `session-lifecycle.mjs` and run `node session-lifecycle.mjs`. It uses random opaque tokens, stores only their SHA-256 digest, and accepts explicit timestamps to make the exercise deterministic:

```js
import { randomBytes, createHash } from "node:crypto";

const sessions = new Map();
const digest = (token) => createHash("sha256").update(token).digest("hex");

function issueSession(userId, now) {
  const token = randomBytes(32).toString("hex");
  sessions.set(digest(token), {
    userId,
    expiresAt: now + 60_000,
  });
  return token;
}

function readSession(token, now) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
    return null;
  }
  const key = digest(token);
  const session = sessions.get(key);
  if (!session || now >= session.expiresAt) {
    sessions.delete(key);
    return null;
  }
  return { userId: session.userId };
}

function revokeSession(token) {
  sessions.delete(digest(token));
}

const first = issueSession("alice", 0);
console.log(readSession(first, 0)?.userId); // alice
revokeSession(first);
console.log(readSession(first, 1));         // null

const second = issueSession("alice", 0);
console.log(readSession(second, 60_000));   // null
```

The caller of `issueSession` must already have authenticated Alice. In production, the server supplies its own clock; neither the user ID nor current time should come from an unvalidated client claim. SHA-256 is appropriate here for digesting a uniformly random high-entropy token. It is not a substitute for a password-hashing algorithm when protecting human-chosen passwords.

This map is an educational single-process store. A deployed multi-instance application needs shared persistence or a deliberately designed distributed session strategy, atomic lifecycle operations where required, and cleanup of expired records. Treat a storage outage as an authentication failure for protected operations rather than accepting an unknown session.

### Observe cookies without leaking them back into script

After setting the lab cookie, use the credential-mode experiment in article 005 to inspect only `demoCookieReceived`. The endpoint returns a boolean rather than the cookie value. Echoing the raw cookie in a JSON response would make an HttpOnly value script-readable and defeat the purpose of the exercise.

In DevTools, compare the cookie's stored attributes with the outgoing Cookie request header. The browser sends name-value pairs; the request does not repeat HttpOnly or SameSite. The server cannot infer that an incoming cookie was originally set with safe attributes merely by inspecting that header.

## 6. Impact

Compromised session state can permit account impersonation. Persisted application data can also expose private information on shared devices. Impact depends on credential scope, lifetime, server revocation, and the sensitivity of locally retained data.

## 7. Prevention

Prefer designs that minimize script-readable credentials. Use strong session identifiers, narrow cookie scope, appropriate SameSite behavior, and server-enforced expiry. Rotate sessions after authentication and privilege changes. Invalidate server state on logout, clear unnecessary client data, and protect state-changing requests from CSRF.

### Logout must cross the server boundary

Deleting a browser cookie removes the local copy, while revoking its associated session prevents an already copied identifier from continuing to work. A robust logout generally needs both. Deletion also has to target the original cookie's name, domain, and path; setting an expired cookie at a different path can leave the original credential intact.

Account switching introduces another boundary. Clear or partition cached private data, cancel outstanding requests where possible, and ensure delayed responses for the prior account cannot populate the next account's interface. Server authorization protects future requests, but it cannot retroactively remove private data already stored in a client cache.

For a backend-for-frontend design, browser code can use an HttpOnly session while the backend holds upstream tokens. This reduces token exposure to page script but introduces a server credential store that must be protected. The architecture still needs CSRF defenses, access checks, and safe session termination.

## 8. Detection and testing

Inspect actual cookie attributes and request delivery rather than just application code. Verify session rotation and that a previously valid session stops working after logout or expiry. Inventory browser stores, caches, and token locations using synthetic accounts and consider shared-device behavior.

### Verify the lifecycle using controlled timestamps and identities

| Transition | Evidence to collect |
| --- | --- |
| Anonymous to authenticated | Session identifier changes or is newly issued |
| Ordinary to elevated privilege | Intended reauthentication and privilege-lifetime rule applies |
| Active to expired | Server rejects the old identifier despite client persistence |
| Active to revoked | A copied synthetic identifier no longer authorizes requests |
| Account A to account B | Private cache and interface state do not cross accounts |
| Session store unavailable | Protected actions do not proceed with an unverified identity |

Use synthetic credentials and avoid putting live tokens in test reports or command history. Record a correlation identifier or digest when possible. Separate expiry in the browser from server expiry: a cookie can remain visible after its session is invalid, and clearing a cookie does not prove server revocation.

## 9. Checklist

- [ ] Classify every browser-retained value.
- [ ] Minimize script-readable credentials and private data.
- [ ] Apply Secure, HttpOnly, and appropriate SameSite rules.
- [ ] Rotate, expire, and revoke sessions on the server.
- [ ] Test logout against previously issued credentials.
- [ ] Clear sensitive cached state when the account context changes.

## 10. References

- [MDN: Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies) — cookie behavior and attributes.
- [HTML Standard: Web storage](https://html.spec.whatwg.org/multipage/webstorage.html) — local and session storage.
- [OWASP: Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) — session lifecycle controls.

---

**Continue the WebSecurity series:**

[Previous: WebSecurity#005: Cross-Origin Resource Sharing (CORS)](/blog/2026-11-10-websecurity-005-cors) | [Next: WebSecurity#007: Authentication vs. Authorization](/blog/2026-11-10-websecurity-007-authentication-vs-authorization)
