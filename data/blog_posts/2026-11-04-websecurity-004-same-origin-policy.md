---
title: "WebSecurity#004: Same-Origin Policy (SOP)"
date: 2026-11-04
category: journal
series: WebSecurity
description: "Learn how origins restrict browser reads, why cross-origin requests can still happen, and where SOP needs supporting controls."
tags: [programming, cybersecurity, WebSecurity]
author:
  name: An Doan
  link: https://anddoanf.github.io/
---

## 1. Introduction

The same-origin policy prevents a page from freely reading data belonging to another origin. Without that boundary, opening an unrelated website could allow its scripts to inspect private pages the user has open elsewhere.

The policy is central to browser security, but it does not block every cross-origin action. Understanding its scope prevents mistakes in API, session, and cross-site request forgery defenses.

## 2. Fundamentals

For HTTP and HTTPS URLs, compare scheme, host, and effective port:

| URL compared with `https://app.example` | Same origin? | Reason |
| --- | --- | --- |
| `https://app.example/projects` | Yes | Only the path differs |
| `https://app.example:443/account` | Yes | 443 is the default HTTPS port |
| `http://app.example` | No | Different scheme |
| `https://api.example` | No | Different hostname |
| `https://app.example:8443` | No | Different port |

An origin is also different from a site. Cookie `SameSite` decisions use a site concept based on scheme and registrable domain, so sibling subdomains can be cross-origin while still being same-site. Avoid applying origin rules to cookies by analogy.

The browser commonly permits cross-origin navigation and some embeddings. Script access to another origin's response or document is much more restricted. A classic external script, for example, can execute in its embedding page; script inclusion is not equivalent to reading a private JSON response through `fetch`.

### Paths, sites, and ports describe different boundaries

Two applications at `https://example.com/editor` and `https://example.com/admin` share an origin. If untrusted script executes in the editor, moving the administration interface to another path does not prevent that script from making requests to it. Server authorization still limits operations, but browser document isolation has not been created.

By comparison, `https://editor.example.com` and `https://admin.example.com` are different origins while normally sharing the same schemeful site. This matters when applying cookie SameSite rules: an action initiated by a compromised sibling subdomain may still be same-site. A design that needs distrust between applications should consider both origin isolation and cookie scope.

Ports are included in origins but not cookie host scope. The local lab's ports 8080 and 8081 isolate script response access, yet a host-scoped cookie can be eligible for requests to either port. Fetch credential mode then separately determines whether the browser includes it in a given fetch.

### Read, send, embed, and navigate are separate operations

| Browser operation | Common cross-origin behavior | Additional conditions |
| --- | --- | --- |
| Read another frame's DOM | Restricted | Same origin or a deliberately designed message exchange |
| Fetch JSON for use by script | Requires permitted CORS sharing | Credentials and preflight rules may also apply |
| Submit an ordinary form | Often permitted to send | Cookie rules, sandboxing, and server controls still apply |
| Load an image | Often permitted to display | Resource and embedding policies can restrict it |
| Read cross-origin pixels from a canvas | Restricted without suitable sharing | Drawing can taint the canvas |
| Include a classic external script | Commonly permitted | CSP, MIME rules, and other controls can restrict it |
| Load a JavaScript module | Uses CORS rules | Different from classic script inclusion |
| Follow a link to another site | Normally permitted navigation | Destination response is not exposed to the old page as readable data |

"Cross-origin access" is too broad a phrase for a useful test result. State the exact operation and the information or side effect involved. A visible image does not establish that its pixels are readable by canvas code, and a successful navigation does not expose the destination's DOM to the page that supplied the link.

### Opaque origins and inherited contexts

Some contexts do not use an ordinary scheme-host-port tuple. Sandboxed documents without `allow-same-origin` and many `data:` documents have opaque origins. Their serialized origin can appear as `null`, but two such documents are not thereby granted shared authority. A blanket CORS allowance for the string `null` can accidentally trust contexts the developer did not intend.

Some blank or embedded documents can inherit an origin from their creator depending on how they are created and sandboxed. Do not infer origin from the visible URL alone. Use the platform rules for that context and test the actual access attempt. Avoid using `file:` URLs for this series' experiments because browser treatment can differ from ordinary HTTP origins.

## 3. Vulnerability

Developers sometimes treat SOP as proof that a foreign website cannot cause requests to reach their backend. However, a cross-origin form or a simple fetch request may be sent even when its response cannot be read by the initiating script.

That distinction matters for state changes. If submitting a request is enough to transfer money or change an email address, blocking response access does not undo the operation. Cookie behavior, CSRF controls, and server-side validation of request intent still matter.

## 4. Attack scenario

A project service changes notification settings through a GET endpoint. An unrelated page embeds a URL pointing at that endpoint. If the browser sends an eligible session cookie, the server may update the setting even though the unrelated page cannot inspect the response.

The weakness combines an unsafe state-changing GET with missing request-intent defenses. SOP remains active throughout the scenario; it simply does not provide the needed application control.

## 5. Technical demonstration

Start the [local lab](/assets/websecurity/websecurity-lab.mjs) with `node websecurity-lab.mjs`, then open port 8080. Click **Same-origin fetch** and **Cross-origin fetch without CORS**.

The first action returns JSON to the page. The second produces a browser error because port 8081 is a different origin. Inspect the Network panel: the server can still receive and answer the simple GET even though page JavaScript cannot read it.

You can run the same comparison directly in the page Console:

```js
await fetch("/data").then((response) => response.json());
await fetch("http://127.0.0.1:8081/data");
```

Do not use `mode: "no-cors"` as a fix. It yields an opaque response in relevant cases, with no readable status, headers, or body. It does not grant cross-origin read authority.

The lab uses only public synthetic responses. A command-line HTTP client can read either endpoint because browser SOP is not a general network access-control system.

### Experiment 1: compare normalized origins

Run this in the lab page's Console:

```js
const candidates = [
  "https://app.example/projects",
  "https://app.example:443/admin",
  "http://app.example/projects",
  "https://app.example:8443/projects",
];
console.table(candidates.map((url) => ({
  url,
  origin: new URL(url).origin,
})));
```

The first two values normalize to the same origin. The other two differ by scheme or port. This is useful for understanding URL serialization, but a generic `new URL()` result is not a substitute for the browser's effective origin rules for sandboxed or inherited documents.

### Experiment 2: observe a sent request with an unreadable response

From the homepage on port 8080, run:

```js
try {
  await fetch("http://127.0.0.1:8081/data", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "synthetic demonstration",
  });
} catch (error) {
  console.log("Script cannot read the response:", error.name);
}
```

The method and content type fall within the relevant safelisted conditions, so this example does not need a preflight. The Network panel should show that the POST reached the server and received its 405 response. The page sees a fetch failure because that cross-origin response lacks the required sharing header. There is no business-state change in this fixture, but the request transmission is real.

Now repeat with a non-safelisted method:

```js
await fetch("http://127.0.0.1:8081/data", {
  method: "PUT",
  body: "synthetic demonstration",
}).catch((error) => console.log(error.name));
```

This time the browser first sends OPTIONS. The lab does not grant a preflight policy for `/data`, so the browser does not proceed with PUT. Distinguish this result from the prior POST: in one case the actual request was sent and its response withheld; in the other the actual request was prevented after an unsuccessful preflight.

### Design an explicit crossing

If a parent and cross-origin frame need to communicate, use `postMessage` with an exact target origin and a receiver that checks `event.origin`, the expected `event.source`, and the message schema. A permitted sender origin is still allowed to send malformed data, so parse the payload as an application protocol. Keep sensitive decisions on the backend even after a correctly authenticated browser message.

## 6. Impact

Misunderstanding SOP can lead to unprotected state changes, unsafe domain-sharing arrangements, or unnecessary broad CORS permissions. Same-origin XSS also defeats the protection for data in the affected origin because the malicious code already executes inside the trusted boundary.

### A controlled alternative to cross-origin DOM access

Reload the lab homepage on port 8080 so its original port 8081 frame is restored. The parent could accept a narrowly defined resize message instead of granting access to the entire child document:

```js
const expectedFrame = document.querySelector("#other");
const expectedOrigin = "http://127.0.0.1:8081";

function receiveHeight(event) {
  if (event.origin !== expectedOrigin) return;
  if (event.source !== expectedFrame.contentWindow) return;
  const value = event.data;
  if (!value || typeof value !== "object") return;
  if (value.type !== "lab-height") return;
  if (!Number.isInteger(value.height) || value.height < 1 || value.height > 2000) return;
  expectedFrame.style.height = value.height + "px";
}

window.addEventListener("message", receiveHeight);
```

In a browser that lets DevTools select the iframe's execution context, run this from the port 8081 child context:

```js
parent.postMessage(
  { type: "lab-height", height: 240 },
  "http://127.0.0.1:8080"
);
```

The frame should become 240 pixels tall. Repeat with a negative height or a different message type; it should stay unchanged. A message from a different frame at the same origin should also be rejected because the receiver checks the source window as well as the origin.

The code grants one bounded capability: request a valid height. It does not let the child choose arbitrary CSS, navigate the parent, or declare the user authorized. This is the broader design principle for crossing a browser boundary: define the smallest message vocabulary the feature needs, verify its sender and shape, and map it to a limited operation.

After the exercise, remove the listener with `window.removeEventListener("message", receiveHeight)` or reload the page. Do not retain permissive debug message handlers in application code.

## 7. Prevention

Use CORS for deliberate cross-origin response sharing, CSRF defenses for cookie-authenticated state changes, and authorization for protected data. Keep untrusted applications on separate origins and avoid the deprecated `document.domain` relaxation mechanism. Review sibling subdomains as potential sources of same-site requests.

## 8. Detection and testing

Test from two actual browser origins. Check whether requests were sent separately from whether their responses were readable. Include different schemes, subdomains, and ports in the origin matrix. Use direct HTTP clients to inspect responses, then reproduce browser policy behavior in a real browser.

### Record the boundary you actually verified

For each experiment, capture the initiating document origin, destination origin, request method, credential mode, preflight outcome, actual request presence, and script-visible result. If the concern is a state change, verify the backend state separately. A CORS error is not evidence that no mutation happened.

Avoid testing from a browser extension, a file opened from disk, or a development proxy unless those contexts are the intended production setup. They can change origin and request behavior. A reliable regression exercise uses two ordinary HTTP origins and repeats the same operation after the relevant application control changes.

## 9. Checklist

- [ ] Compare scheme, host, and effective port explicitly.
- [ ] Distinguish cross-origin from cross-site.
- [ ] Keep GET and HEAD free of state-changing business actions.
- [ ] Protect cookie-authenticated changes against CSRF.
- [ ] Treat `no-cors` responses as opaque, not authorized data access.
- [ ] Verify cross-origin reads and writes separately.

## 10. References

- [MDN: Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy) — browser access rules.
- [HTML Standard: Origins](https://html.spec.whatwg.org/multipage/browsers.html#origin) — origin definitions.
- [OWASP: CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) — request-intent defenses.
- [MDN: Window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) — sender checks and controlled cross-origin communication.

---

**Continue the WebSecurity series:**

[Previous: WebSecurity#003: Understanding the Browser Security Model](/blog/2026-11-10-websecurity-003-browser-security-model) | [Next: WebSecurity#005: Cross-Origin Resource Sharing (CORS)](/blog/2026-11-10-websecurity-005-cors)
