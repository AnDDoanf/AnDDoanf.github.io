---
title: "WebSecurity#002: How the Web Works: HTTP, HTTPS, DNS, TCP/IP"
date: 2026-11-02
category: journal
series: WebSecurity
description: "Follow a browser request through DNS, transport, TLS, and HTTP to understand where security controls belong."
tags: [programming, cybersecurity, WebSecurity]
author:
  name: An Doan
  link: https://anddoanf.github.io/
---

## 1. Introduction

Opening a website starts several different conversations. A browser locates a server, establishes a connection, verifies a secure channel when using HTTPS, and exchanges HTTP messages. Understanding these layers makes it easier to diagnose a failure and choose a control that addresses its cause.

This article follows a request to a fictional project application at `https://projects.example`. The domain is an example; hands-on steps use a local lab.

## 2. Fundamentals

### DNS locates a destination

The browser and operating system consult caches and DNS resolvers to resolve a hostname to an address. DNS records can also point a name toward another name. The result identifies where to connect; an ordinary DNS answer alone does not prove the application server's identity.

### Transport moves the bytes

IP routes packets. TCP supplies an ordered, reliable byte stream used by HTTP/1.1 and HTTP/2. HTTP/3 uses QUIC over UDP, with integrated TLS security. Therefore, the familiar TCP connection sequence is not universal to every modern web request.

### TLS protects a connection

For HTTPS, certificate validation ties the connection to the intended hostname through a trusted certificate chain. Encryption protects confidentiality in transit, and integrity checks detect modification. A browser must reject invalid certificates rather than silently accepting a different identity.

TLS may terminate at a CDN or reverse proxy. That makes the connection from the proxy to the application a separate security decision. Protection on the browser-to-CDN hop does not establish protection on later hops.

### HTTP expresses the operation

HTTP messages contain methods, targets, headers, status codes, and sometimes bodies. These HTTP/1.1-style examples show the semantics:

```http
GET /api/projects/42 HTTP/1.1
Host: projects.example
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, no-store

{"id":"42","name":"Demo project"}
```

HTTP is stateless at the protocol level. Applications add continuity through cookies, tokens, and server-side session state. A successful transport connection does not imply a successful login or permission to read a project.

### Follow one request across the trust boundaries

Suppose the browser opens `https://projects.example/projects/42`. It first interprets the URL: the scheme selects HTTPS, the hostname identifies the intended service, the default port is 443, and the path identifies an application resource. The path is not sent as part of an ordinary DNS lookup. After resolving an address, the client connects to the selected network endpoint and establishes the appropriate secure transport.

During a normal TLS handshake, the client checks whether the certificate is valid for `projects.example`, chains to a trusted issuer, and satisfies its validation rules. Connecting to the correct IP address alone is insufficient because an address can host many services. Likewise, encryption to the wrong authenticated hostname does not meet the user's original intention.

The encrypted HTTP request then reaches a TLS terminator. If that is a reverse proxy, the proxy may choose a backend using the host and path, append forwarding metadata, and create a separate upstream connection. The application receives a request in the context of this deployment chain. It must know which proxy supplied trustworthy forwarding information and which client-controlled values remain untrusted.

Next, session middleware validates any credential, business logic checks permission to view project 42, and the database query retrieves only an authorized record. The response travels back through the proxy and potentially a cache before reaching browser code. Every arrow has an identity, interpretation, and confidentiality decision; drawing those arrows is often the fastest way to locate a missing control.

### Headers describe different things

`Accept: application/json` states what representation the client would prefer to receive. `Content-Type: application/json` describes the representation actually carried in a message body. The server should not assume that either header proves the body is valid JSON or that its fields are authorized. Parsing and business validation still follow.

`Host` in HTTP/1.1, and the corresponding authority information in newer HTTP versions, affects routing. Applications must not build password-reset links or security decisions from an arbitrary unvalidated host value. Configure the service's public origin explicitly when generating sensitive absolute links.

`Forwarded` and common `X-Forwarded-*` headers describe an upstream view of the request. If the backend is directly reachable and trusts every such header, a client may claim a different original scheme or address. Configure both proxy header handling and network reachability so the application knows which connection is authoritative.

### Methods, safety, and idempotency

A safe HTTP method is intended to retrieve information without requesting a business-state change. GET and HEAD should therefore not implement "delete project" or "change email" actions. Incidental logging does not make ordinary retrieval unsafe; the issue is the requested business operation.

An idempotent operation has the same intended effect when repeated as when performed once. PUT and DELETE have idempotent semantics, but that does not mean their responses must be identical. A second DELETE can return a different status after the first removed the object. POST is not inherently idempotent; payment creation often needs a separate idempotency-key design to survive retries safely.

HTTP status codes describe the result at a protocol boundary. A 200 containing a JSON error string is still a 200 to caches, monitoring, and generic clients. A gateway's 502 differs from an application's 403, and either can be generated before a database query is attempted.

## 3. Vulnerability

Security failures often come from confusing the layers. HTTPS cannot fix an authorization flaw, while a strong password cannot protect credentials sent over plaintext HTTP. Incorrect caching can expose a private response even when the application originally authorized it correctly.

Another risk appears when proxies and application servers disagree about request boundaries or trusted headers. Forwarded client information must come from a trusted proxy configuration, not arbitrary request headers.

### Know what transport encryption leaves visible

HTTPS protects HTTP message contents on the encrypted hop, but observers can still learn some connection metadata, such as destination addresses, timing, and approximate traffic sizes. DNS visibility and hostname privacy depend on the resolver and TLS features in use. Do not describe HTTPS as concealing all communication metadata.

Also distinguish cache directives. `no-cache` allows storage but requires appropriate validation before reuse; `no-store` tells caches not to store the relevant response. Neither instruction replaces access control at the source, and a browser's ability to display already received content is separate from whether the server will authorize a new request. For private account responses, choose a cache policy deliberately and verify it through the actual CDN and browser path.

## 4. Attack scenario

A project service redirects its homepage to HTTPS but still accepts password submissions on an HTTP endpoint. A user follows an old link and submits the form before any secure redirect occurs. A network observer may see that original plaintext request. Redirecting the response does not retroactively encrypt the submitted credentials.

The remedy includes making sensitive flows HTTPS-only, using secure cookie settings, and deploying HSTS deliberately after HTTPS support is reliable.

## 5. Technical demonstration

Download the [local lab script](/assets/websecurity/websecurity-lab.mjs), save it as `websecurity-lab.mjs`, and run it with Node.js 20 or newer:

```sh
node websecurity-lab.mjs
```

It listens on loopback ports 8080 and 8081 and uses synthetic data. In another terminal:

```sh
curl.exe -i http://127.0.0.1:8080/data
curl.exe -I http://127.0.0.1:8080/data
```

On systems without `curl.exe`, use `curl`. The first command displays the headers and body; the second makes a HEAD request and displays headers. In the browser Network panel, compare the request method, response status, content type, and initiator.

The lab intentionally uses local HTTP. It demonstrates HTTP behavior, not TLS certificate validation. For an HTTPS service you operate, inspect the browser's certificate and connection details separately; keep certificate verification enabled.

### Read a real exchange rather than guessing from the page

With the lab still running, inspect an HTTP/1.1 exchange:

```sh
curl.exe -v --http1.1 http://127.0.0.1:8080/data
```

The relevant request and response fields resemble:

```http
GET /data HTTP/1.1
Host: 127.0.0.1:8080

HTTP/1.1 200 OK
X-Content-Type-Options: nosniff
Content-Type: application/json; charset=utf-8

{"message":"Synthetic data","port":8080}
```

Runtime headers such as Date and connection management can vary. There is no TLS handshake here because the URL explicitly uses HTTP. This matters when interpreting traces: an encrypted production request and an unencrypted loopback exercise have the same application semantics but different transport guarantees.

Now request a nonexistent route and a disallowed method:

```sh
curl.exe -i http://127.0.0.1:8080/not-present
curl.exe -i -X POST http://127.0.0.1:8080/data
```

Expect 404 for the first and 405 plus an Allow header for the second. Neither result is a network connection failure: the HTTP server received and interpreted both requests. Finally repeat the HEAD request. Its response advertises representation metadata but has no response body, even though GET returns JSON.

### Inspect the browser's additional behavior

Open DevTools before loading the lab and preserve the Network log. Select the document request and compare it with a later fetch request. Record the initiator, request URL, status, content type, remote address, and timing. A browser can satisfy some requests from caches or service workers, so the displayed page alone is insufficient evidence that a fresh network response was received.

The numeric loopback URL deliberately avoids DNS ambiguity. If you replace it with `localhost`, the operating system may resolve that name to IPv6 `::1` while this lab listens on IPv4 `127.0.0.1`. A failed connection in that case concerns destination selection, not HTTP authorization or CORS.

## 6. Impact

A failure at any layer can affect the whole application: traffic interception, requests routed to the wrong destination, private responses cached for another user, or inconsistent request parsing. Record which hop and which data are affected so remediation reaches the correct component.

## 7. Prevention

Use HTTPS throughout sensitive paths, validate certificates, and document where TLS terminates. Configure trusted proxies explicitly, restrict backend exposure, and set cache policies according to data sensitivity. Apply authentication, authorization, and input handling after transport security is established.

## 8. Detection and testing

Trace one request from the browser through the deployed infrastructure. Inspect redirects, certificate errors, cache headers, and backend access paths. Distinguish DNS resolution failures, connection failures, TLS failures, and application status codes; each points toward a different owner and fix.

### A troubleshooting matrix

| Observation | First layer to investigate | Useful evidence |
| --- | --- | --- |
| Hostname cannot be resolved | DNS configuration and resolver path | Requested name and resolver error |
| Connection is refused | Listener, address family, firewall | Destination IP and port |
| Certificate hostname mismatch | TLS identity and routing | URL hostname and certificate names |
| Redirect repeats indefinitely | Proxy scheme handling and application redirects | Complete Location chain |
| 401 or 403 response | Authentication or authorization policy | Server identity context and policy result |
| 502 from the gateway | Proxy-to-upstream connection | Gateway error and upstream health |
| Browser blocks a readable API response | Browser sharing policy | Origin, preflight, and CORS response headers |
| Wrong user's content appears | Authorization and cache partitioning | Session context, cache key, and response provenance |

Treat the table as a starting point. A 403 might be produced by a WAF instead of application authorization, and a cached response might have no current application log entry. Correlate a request identifier across layers before assigning ownership.

For a sensitive endpoint, verify the whole path with two synthetic identities. Confirm the application returns only the authorized representation, that shared caches do not reuse it for the other identity, and that direct backend access cannot bypass the intended gateway rules. Those checks establish more than a successful HTTPS padlock inspection.

## 9. Checklist

- [ ] Identify DNS, proxy, TLS termination, and application owners.
- [ ] Require encrypted transport for credentials and private data.
- [ ] Validate certificates on every relevant connection.
- [ ] Check cache behavior for authenticated responses.
- [ ] Confirm server-side authorization after the request arrives.
- [ ] Document the transport actually used, including HTTP/3 where applicable.

## 10. References

- [MDN: Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview) — HTTP request and response concepts.
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110) — methods, status codes, and representations.
- [RFC 8446: TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446) — secure transport.
- [RFC 9114: HTTP/3](https://www.rfc-editor.org/rfc/rfc9114) — HTTP over QUIC.
- [RFC 9111: HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111) — cache storage, validation, and reuse semantics.

---

**Continue the WebSecurity series:**

[Previous: WebSecurity#001: Introduction to Web Application Security](/blog/2026-11-10-websecurity-001-introduction-to-web-application-security) | [Next: WebSecurity#003: Understanding the Browser Security Model](/blog/2026-11-10-websecurity-003-browser-security-model)
