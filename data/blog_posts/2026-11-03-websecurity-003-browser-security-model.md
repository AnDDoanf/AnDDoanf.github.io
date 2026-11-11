---
title: "WebSecurity#003: Understanding the Browser Security Model"
date: 2026-11-03
category: journal
series: WebSecurity
description: "Understand origins, execution contexts, browser permissions, and the limits of client-side protection."
tags: [programming, cybersecurity, WebSecurity]
author:
  name: An Doan
  link: https://anddoanf.github.io/
---

## 1. Introduction

A browser opens documents from unrelated organizations inside one application. Its security model must allow useful links, images, and integrations while preventing one page from freely inspecting another page's private state.

The model combines isolation, controlled sharing, and user permissions. Developers need to understand those boundaries because an application can accidentally weaken them or place too much trust in them.

## 2. Fundamentals

### Origins identify web contexts

For ordinary HTTP URLs, an origin is the combination of scheme, hostname, and effective port. `https://app.example` and `https://api.example` have different origins. Different paths under `https://app.example` share an origin.

Origins influence access to documents and storage. Browser process isolation adds implementation protections, but a process boundary and a web origin are different concepts. Application code should rely on specified web policies rather than assumptions about browser process placement.

### A page can delegate considerable authority

A script loaded into a page normally executes with that page's origin privileges, even when the script file comes from a third-party host. A compromised analytics script may therefore interact with the application's DOM and origin-accessible data.

Browser permissions gate capabilities such as location or camera access. Secure contexts are required for many powerful APIs. Those gates do not decide whether a signed-in user may delete a project; that remains an application policy.

### Isolation has several layers

The same-origin policy limits cross-origin reads and document access. Content Security Policy restricts selected resource and execution behaviors. An iframe's `sandbox` attribute can remove capabilities from embedded content. These mechanisms address different risks and need intentional configuration.

### Separate execution authority from download location

Consider a page that loads `https://cdn.example.net/widget.js`. The script's network location helps identify its supplier, but its execution authority comes from the page into which it is included. Once executed as ordinary page script, it can interact with that document and make requests as that page, within the platform's rules.

An iframe is different because it establishes a document context. A cross-origin frame normally retains its own origin and is restricted from directly reading the parent document. This is why a hosted payment form in a carefully designed frame can create a meaningful boundary, while embedding an arbitrary payment-related script directly into the page grants much broader page authority.

The boundary still needs an application protocol. If the frame tells the parent that payment succeeded, the parent should not treat that message alone as financial proof. The backend must confirm the transaction with the payment system. Browser isolation narrows access; it does not establish the truth of every message crossing the boundary.

### Match each browser control to its job

| Control | What it contributes | What still needs application enforcement |
| --- | --- | --- |
| Same-origin policy | Limits selected cross-origin reads and document access | Authorization and request-intent checks |
| CORS | Deliberately enables selected cross-origin response reads | Caller permissions and data minimization |
| CSP | Restricts configured script, resource, framing, and other behaviors | Safe rendering and trusted application logic |
| iframe sandbox | Removes capabilities from embedded documents | A safe message protocol and appropriate origin placement |
| Permissions Policy | Delegates or disables selected powerful browser features | User consent and business authorization |
| HttpOnly cookies | Prevents direct script access to cookie values | XSS prevention and protection against authenticated misuse |
| Secure contexts | Gates many powerful APIs on an appropriate context | Trust in the code using those APIs |

These controls compose, but they are not interchangeable. A page can have a restrictive CORS policy while executing an unsafe first-party script. A camera permission prompt can work correctly while an unrelated API lacks ownership checks.

### Browser profiles, storage, and untrusted content

Origin isolation is not a promise that the person using a shared browser profile cannot inspect its local data. DevTools, extensions with granted permissions, or local account access may expose information beyond the threat model of an unrelated web page. Decide whether persistent client storage fits the sensitivity of the data and the expected device environment.

User-uploaded HTML deserves particular attention. Serving it from the application's own origin can grant it the same browser authority as application documents if it is rendered as active content. Prefer a separate untrusted-content origin, appropriate content types, restrictive embedding, and download behavior where needed. A file extension alone does not define how the browser interprets a response.

## 3. Vulnerability

Cross-site scripting is dangerous because injected code runs within the victim application's trusted context. The browser sees code executing as that origin; it cannot infer which business operations the developer intended to permit.

Another common mistake is assuming iframe embedding makes arbitrary content safe. An unsandboxed same-origin frame can have broad access to its parent. Even a sandbox can become ineffective for a particular design if powerful permissions are restored without considering their combined effect.

## 4. Attack scenario

A project dashboard displays a user-provided description as executable HTML. An attacker stores script content in their own project, then shares the project with another user. If the browser executes that content, it can issue same-origin requests with the viewer's session.

An HttpOnly cookie may prevent direct cookie reads, but it does not stop the injected code from making authenticated requests. Rendering the description as text avoids creating the execution opportunity.

## 5. Technical demonstration

Run the [local lab](/assets/websecurity/websecurity-lab.mjs):

```sh
node websecurity-lab.mjs
```

Open `http://127.0.0.1:8080` and click **Read a cross-origin iframe**. The frame at port 8081 loads visually, but accessing its document from port 8080 produces a security error. Loading and reading are separate permissions.

Now examine this safe rendering pattern in the Console:

```js
const message = document.createElement("p");
message.textContent = "<strong>This stays text</strong>";
document.body.append(message);
```

The markup appears literally because `textContent` creates text rather than interpreting HTML. By contrast, assigning untrusted values to `innerHTML` invokes an HTML parser and needs a different security strategy. This demonstration uses harmless text; it does not require executing an attack payload.

### Observe where iframe isolation changes

On the lab's port 8080 homepage, the existing frame loads from port 8081. In the Console, inspect its source without attempting to read its document:

```js
const frame = document.querySelector("#other");
console.log(frame.src);
```

The URL is available because the iframe element belongs to the parent document. Accessing `frame.contentWindow.document` crosses into the child document and is blocked when the origins differ. This distinction explains why seeing an embedded URL does not mean the parent can read its contents.

Change the source to a same-origin page and wait for its load event:

```js
await new Promise((resolve) => {
  frame.addEventListener("load", resolve, { once: true });
  frame.src = "/frame";
});
console.log(frame.contentWindow.document.body.textContent);
```

Expect the synthetic frame content to be readable. Both documents now share scheme, host, and port. A different path did not create an isolation boundary.

Next remove the frame's origin authority with a sandbox:

```js
frame.setAttribute("sandbox", "");
await new Promise((resolve) => {
  frame.addEventListener("load", resolve, { once: true });
  frame.src = "/frame?sandbox-demo=1";
});
try {
  console.log(frame.contentWindow.document.body.textContent);
} catch (error) {
  console.log(error.name);
}
```

Expect a security error. An empty sandbox gives the new document an opaque origin and removes several other capabilities. The restriction applies to the newly loaded document; simply changing attributes is not a reliable way to reason about an already running document without considering navigation.

For same-origin embedded content, combining `allow-scripts` and `allow-same-origin` can allow a cooperating child to remove its own sandbox attribute and navigate into a less restricted context. Do not restore permissions mechanically until the frame works; choose each permission from an explicit use case and isolate hostile content on a separate origin.

### Why safe text rendering works

`textContent` does not attempt to decide whether a string looks malicious. It avoids interpreting the string as HTML in the first place. This is a stronger design than maintaining a list of suspicious substrings. For a framework component, ordinary escaped text interpolation often provides the same benefit, while raw-HTML escape hatches need separate review.

When rich content is required, define the permitted markup and sanitize it with an appropriate maintained library. Keep URL validation and navigation rules in view: an apparently harmless link can still carry a destination the application should not trust.

### Observe a Content Security Policy enforcement decision

The lab also serves `http://127.0.0.1:8080/csp-demo`. Open it in a new tab and inspect its response header. The page receives a fresh random nonce and a policy whose script rule names that nonce:

```http
Content-Security-Policy: default-src 'self'; script-src 'nonce-UNIQUE_VALUE'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
```

`UNIQUE_VALUE` is explanatory; the real response contains a newly generated value matched by the approved script element. One paragraph should change to **Approved script ran**, while the other remains **Unapproved script did not run**. The Console should report that the unapproved inline script was blocked.

The example demonstrates browser enforcement in addition to safe rendering. It does not make untrusted HTML safe to insert freely. An attacker might still inject misleading content, dangerous links, or elements that affect application behavior without executing that blocked script. A nonce should be unpredictable, associated with the intended response, and placed only on scripts the server intends to approve.

Inspect the lab source: the nonce is generated per response and placed in both the header and approved script tag. The response is marked no-store to avoid casually reusing this teaching response. Production caching and nonce strategies need deliberate coordination. Do not copy a fixed nonce string into a template or add a nonce automatically to every script found in untrusted content.

## 6. Impact

A broken browser trust boundary can expose visible data, alter interface actions, or perform operations through the current user's session. Third-party scripts can increase that exposure across many pages. The effective impact depends on session privileges and server controls, not just browser storage contents.

## 7. Prevention

Render untrusted text with safe APIs and use maintained sanitization only when rich HTML is required. Limit third-party scripts, deploy a tested CSP, and isolate untrusted applications on separate origins. Add iframe sandbox permissions individually and review how the embedded content communicates with its parent.

## 8. Detection and testing

Inventory scripts, frames, powerful API permissions, and unsafe rendering sinks. Use DevTools to inspect resource origins and policy violations. Review both allowed and blocked interactions; a security error can demonstrate a working boundary, while a resource loading successfully says little about script read access.

### Review a feature by the authority it grants

For every new script, frame, or browser permission, write down the supplier, execution origin, accessible data, and messages accepted by other components. Then ask how revocation works. Removing a third-party script from the next deployment may stop future execution, but it cannot undo data already read during an earlier session.

A useful verification record includes the parent origin, frame origin, sandbox flags, CSP response headers, action attempted, and actual result. "The frame loaded" and "the frame could read the parent's DOM" are different observations and should never be collapsed into one test result.

Repeat relevant experiments in supported browsers and privacy configurations. Browser features may partition storage, restrict third-party cookies, or alter popup relationships. If a privacy feature happens to block a dangerous request in one browser, the application still needs its own intended control in every supported environment.

## 9. Checklist

- [ ] Identify which documents and scripts share an origin.
- [ ] Render user content through appropriate safe APIs.
- [ ] Review third-party script authority.
- [ ] Restrict iframe capabilities to the intended use.
- [ ] Apply server authorization to actions initiated by the browser.
- [ ] Verify important browser behavior in supported browser versions.

## 10. References

- [MDN: Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy) — document and resource boundaries.
- [HTML Standard: Sandboxing](https://html.spec.whatwg.org/multipage/browsers.html#sandboxing) — iframe capability restrictions.
- [OWASP: DOM-based XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html) — safe browser rendering.
- [OWASP: Content Security Policy](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html) — nonce-based execution restrictions and deployment considerations.

---

**Continue the WebSecurity series:**

[Previous: WebSecurity#002: How the Web Works: HTTP, HTTPS, DNS, TCP/IP](/blog/2026-11-10-websecurity-002-how-the-web-works) | [Next: WebSecurity#004: Same-Origin Policy (SOP)](/blog/2026-11-10-websecurity-004-same-origin-policy)
