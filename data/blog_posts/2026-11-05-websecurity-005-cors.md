---
title: "WebSecurity#005: Cross-Origin Resource Sharing (CORS)"
date: 2026-11-05
category: journal
series: WebSecurity
description: "Configure deliberate cross-origin access with exact origin rules, preflight handling, credentials, and cache awareness."
tags: [programming, cybersecurity, WebSecurity]
author:
  name: An Doan
  link: https://anddoanf.github.io/
---

## 1. Introduction

CORS lets a server opt into sharing responses with browser scripts from another origin. A common use is a dashboard calling a separately hosted API. The server declares a policy in response headers, and the browser enforces the relevant read restrictions.

CORS is one part of that interaction. Authentication establishes the caller, and authorization determines which data the caller may access, regardless of the requesting browser origin.

## 2. Fundamentals

An origin includes the scheme, hostname, and port. A server can allow a specific requesting origin:

```http
Access-Control-Allow-Origin: https://dashboard.example
Vary: Origin
```

The allowed-origin value is a single origin or `*` where appropriate, not a comma-separated list. For a list of permitted origins, validate the incoming `Origin` against a configured set and return only the matching origin.

Requests outside the CORS-safelisted conditions generally cause an OPTIONS preflight. The browser asks whether a proposed method and header set are permitted. Authorization headers and many JSON requests trigger this step. Preflight processing needs to work without requiring the session credentials of the later request.

Cookie-bearing cross-origin fetches generally need `credentials: "include"` on the client and `Access-Control-Allow-Credentials: true` on the server. They also need an explicit allowed origin; `*` does not permit reading credentialed responses. Cookie SameSite rules and third-party cookie restrictions still apply independently.

### Follow the complete preflight exchange

Suppose a dashboard wants to send a GET with `X-Lab-Trace`. Before the application request, the browser can ask:

```http
OPTIONS /cors-data HTTP/1.1
Host: 127.0.0.1:8081
Origin: http://127.0.0.1:8080
Access-Control-Request-Method: GET
Access-Control-Request-Headers: x-lab-trace
```

The server's successful preflight response in this lab contains:

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://127.0.0.1:8080
Access-Control-Allow-Methods: GET
Access-Control-Allow-Headers: X-Lab-Trace
Vary: Origin
```

The browser checks the proposed method and headers against that policy, then sends the GET. The GET response must itself include a suitable `Access-Control-Allow-Origin`; permitting OPTIONS alone does not grant access to the actual response. A browser can cache a successful preflight decision, so not every later GET will have a new visible OPTIONS immediately before it.

An API using `Content-Type: application/json` for a cross-origin POST normally falls outside the content-type safelist and therefore needs a preflight. Changing the body to text merely to avoid OPTIONS does not establish security and may create inconsistent input handling. Design the endpoint and sharing policy explicitly.

### Credentials and readable response headers

Fetch's default credential mode is `same-origin`. A cross-origin request can therefore be permitted by CORS yet arrive without a session cookie. `credentials: "include"` opts into eligible cross-origin credential delivery; it does not override cookie SameSite, Secure, expiry, or browser privacy restrictions.

After a response is allowed, script does not automatically see every response header. CORS exposes a safelisted set and any additional headers explicitly named in `Access-Control-Expose-Headers`. For example, an application may expose a request identifier for support correlation. `Set-Cookie` remains unavailable to ordinary script response-header access; exposing that name is not a way to read an HttpOnly cookie.

### Choose a sharing model per resource

| Resource | Suitable starting policy | Reason |
| --- | --- | --- |
| Public, unauthenticated static data | `Access-Control-Allow-Origin: *` when intended | Any origin may read the same public representation |
| Private dashboard API | Exact trusted origins and deliberate credential rules | Browser access is limited to the intended clients |
| Same-origin-only endpoint | No cross-origin sharing policy | No browser integration needs it |
| Partner server integration | Service authentication and authorization | Browser CORS does not constrain server-to-server clients |

Avoid adding credentials support globally because one route needs it. Also ensure the frontend's origin is the origin being allowed, not the API's own origin copied into a configuration field by mistake.

## 3. Vulnerability

Blindly copying every incoming `Origin` into the response can permit an unrelated website to read data using a victim's eligible browser credentials. Loose suffix checks and permissive treatment of `null` origins can also expand access beyond the intended application.

Missing `Vary: Origin` can produce incorrect cache reuse when the response policy changes by origin. Private response caching requires its own safeguards in addition to CORS cache variation.

## 4. Attack scenario

An account API reflects any origin and enables credentials. A user visits a malicious page while signed in. If cookie and browser policies permit the authenticated request, the page can read the account response because the API explicitly grants that page access.

The important preconditions are credential delivery, sensitive response access, and a policy that trusts the attacker-controlled origin. Origin reflection alone on a fully public response does not establish the same impact.

## 5. Technical demonstration

Run the [local lab](/assets/websecurity/websecurity-lab.mjs) and open `http://127.0.0.1:8080`. Compare the two cross-origin buttons. `/data` is unreadable to the page; `/cors-data` explicitly allows origin 8080 and is readable.

Inspect a preflight in a terminal:

```sh
curl.exe -i -X OPTIONS http://127.0.0.1:8081/cors-data -H "Origin: http://127.0.0.1:8080" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: X-Lab-Trace"
```

The response permits that exact origin, GET, and `X-Lab-Trace`. Repeat with `Origin: http://127.0.0.1:9999`; the response omits the allow-origin header.

To exercise preflight in the browser Console on port 8080:

```js
await fetch("http://127.0.0.1:8081/cors-data", {
  headers: { "X-Lab-Trace": "synthetic" },
}).then((response) => response.json());
```

The lab does not enable credentialed CORS. Its intentionally public synthetic data lets you observe sharing without involving real sessions.

### Compare credential modes with observable results

The expanded lab provides `/credentialed-data`, which allows only the port 8080 origin and reports whether the fixed demo cookie was received. It contains no private account data and does not treat the cookie as authentication.

On the port 8080 homepage, run:

```js
await fetch("/set-cookie");

const withoutOptIn = await fetch(
  "http://127.0.0.1:8081/credentialed-data"
).then((response) => response.json());

const withOptIn = await fetch(
  "http://127.0.0.1:8081/credentialed-data",
  { credentials: "include" }
).then((response) => response.json());

console.log(withoutOptIn.demoCookieReceived); // false
console.log(withOptIn.demoCookieReceived);    // true
```

The ports differ, so default fetch credentials are omitted for the first request. Both destinations use the same loopback host and scheme, so the demo cookie is eligible when the second request opts in. This isolates credential-mode behavior without introducing a genuinely third-party site and its separate cookie restrictions.

Inspect the second response: it includes the exact allow-origin value and `Access-Control-Allow-Credentials: true`. Try the same credential mode with `/cors-data`, which does not grant credentialed response sharing. The browser should withhold that response even though ordinary uncredentialed reads of the route work.

To inspect exposed headers:

```js
const response = await fetch("http://127.0.0.1:8081/cors-data");
console.log(response.headers.get("X-Lab-Response"));
console.log(response.headers.get("Set-Cookie"));
```

Expect `synthetic-response` for the explicitly exposed lab header and `null` for Set-Cookie. The endpoint does not set a cookie, and browser JavaScript would not gain direct access to that response header even if it did.

### Verify rejection cases, not just the happy path

Repeat the terminal preflight with `Access-Control-Request-Method: DELETE` or `Access-Control-Request-Headers: X-Not-Allowed`. The expanded lab returns 403. A browser must not proceed with an actual request requiring that denied preflight. A raw HTTP client can still send an actual request directly, which is why method enforcement and authorization remain server responsibilities.

## 6. Impact

Overbroad policies can disclose authenticated responses when their other preconditions hold. Broken restrictive policies can also interrupt legitimate applications. Report the exact origin, credential conditions, readable fields, and affected user context rather than treating every wildcard as a sensitive-data vulnerability.

### Diagnose the exact failure before changing the policy

A fetch can fail for DNS, TLS, connection, preflight, redirect, or response-sharing reasons. Browser JavaScript often receives a generic error for security-related failures. Start with the Network and Console evidence rather than immediately broadening `Access-Control-Allow-Origin`.

If OPTIONS fails, check whether a gateway requires login on the preflight, whether the requested method or header is absent, and whether the route handles OPTIONS at all. If OPTIONS succeeds but GET is unreadable, inspect the GET response's own CORS headers, credential rules, and redirect chain. If GET is readable but anonymous, inspect credential mode and cookie eligibility instead of adding more allowed origins.

An application-generated 401 can also become invisible to frontend code if the error response lacks its normal CORS policy. The page then reports a network-style failure instead of a readable authentication result. Apply the intended sharing rules to error paths while keeping the error body minimal and appropriately protected.

| Symptom | Likely evidence to inspect | Unsafe shortcut to avoid |
| --- | --- | --- |
| No actual request after OPTIONS | Requested method and headers versus preflight policy | Allow every method and header globally |
| Actual request succeeded but fetch rejected | Actual response origin and credential headers | Reflect any origin to silence the error |
| Readable response says no session | Credential mode, cookie scope, SameSite, expiry | Put a long-lived credential in a URL |
| Custom support header is missing in script | Expose-Headers configuration | Expose unrelated sensitive response metadata |

Caching can make a corrected policy appear unchanged. Inspect cache provenance and preflight caching before assuming the new server code is not running. Reproduce from a fresh approved test context when needed, while preserving the original evidence that showed the failure.

## 7. Prevention

Maintain an exact allowlist, minimize credentialed sharing, and apply policies consistently to success and error responses. Handle permitted preflights narrowly and vary caches by origin when required. Keep authorization independent of CORS; non-browser clients can supply headers or ignore browser sharing rules.

### Implement exact origin selection

This small function isolates a policy decision without pretending to implement the entire CORS protocol:

```js
const trustedOrigins = new Set([
  "https://dashboard.example.com",
  "https://support.example.com",
]);

function permittedOrigin(origin) {
  if (typeof origin !== "string") return null;
  return trustedOrigins.has(origin) ? origin : null;
}

console.log(permittedOrigin("https://dashboard.example.com"));
console.log(permittedOrigin("https://dashboard.example.com.attacker.invalid"));
console.log(permittedOrigin("null"));
```

The expected results are the exact trusted origin, `null`, and `null`. The selected value can inform framework CORS middleware, while methods, headers, credentials, and caching need their own configuration. Avoid substring tests, arbitrary suffix tests, and broad regular expressions that accept names resembling trusted hosts.

If policy selection varies by Origin, emit the appropriate cache variation even for unpermitted origins so caches do not merge decisions unexpectedly. For authenticated content, also ensure shared caches cannot reuse one user's representation for another user; `Vary: Origin` partitions by requesting site, not by account.

## 8. Detection and testing

Test permitted and unpermitted origins, alternate ports, unexpected subdomains, and credentialed requests where supported. Confirm the browser can actually read the sensitive response. Review preflight and actual response headers separately, then inspect CDN caching behavior.

| Test case | Expected observation |
| --- | --- |
| Exact trusted origin with permitted method and headers | Browser can read the intended response |
| Similar-looking untrusted hostname | No granted response access |
| Different port or scheme | Allowed only if explicitly configured |
| Origin serialized as `null` | Denied unless a narrowly justified design requires it |
| Unsupported preflight method or header | Actual browser request does not proceed |
| Credentialed mode without credential permission | Response is withheld from script |
| Private response through a shared cache | No cross-user representation reuse |

For a confirmed vulnerability, demonstrate that a browser under the untrusted origin can read protected synthetic data using the victim context. A raw-client response with permissive-looking headers is a lead; it does not establish credential eligibility or script-readable private data by itself.

## 9. Checklist

- [ ] Match complete trusted origins exactly.
- [ ] Avoid arbitrary reflection and automatic trust of `null`.
- [ ] Use explicit origins for credentialed access.
- [ ] Restrict methods and requested headers.
- [ ] Set `Vary: Origin` when the response depends on origin.
- [ ] Verify authorization and browser credential behavior independently.

## 10. References

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) — request and credential behavior.
- [Fetch Standard: CORS protocol](https://fetch.spec.whatwg.org/#http-cors-protocol) — normative sharing rules.
- [MDN: CORS configuration](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CORS) — configuration guidance.

---

**Continue the WebSecurity series:**

[Previous: WebSecurity#004: Same-Origin Policy (SOP)](/blog/2026-11-10-websecurity-004-same-origin-policy) | [Next: WebSecurity#006: Cookies, Sessions, and Browser Storage](/blog/2026-11-10-websecurity-006-cookies-sessions-browser-storage)
