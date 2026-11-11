---
title: "WebSecurity#001: Introduction to Web Application Security"
date: 2026-11-01
category: journal
series: WebSecurity
description: "Learn what web application security protects, how failures happen, and how to begin testing responsibly."
tags: [programming, cybersecurity, WebSecurity]
author:
  name: An Doan
  link: https://anddoanf.github.io/
---

## 1. Introduction

A web application connects people to data and actions through browsers, APIs, and backend services. Security means designing and operating that system so only the right people can access the right data and perform the right actions, even when requests are unexpected or hostile.

This matters for more than login pages. A small flaw in a search endpoint, file upload, deployment setting, or account recovery flow can expose personal data, interrupt a service, or let someone act with another user’s authority. Web application security is the practice of reducing those risks throughout design, implementation, deployment, and maintenance.

## 2. Fundamentals

### Security goals

Three familiar goals provide a starting point:

- **Confidentiality:** information is available only to authorized users and systems.
- **Integrity:** data and operations cannot be changed without authorization.
- **Availability:** users can access the service when they need it.

Real applications also need authenticity, accountability, privacy, and resilience. For example, a payment service must protect payment details, preserve transaction correctness, remain available, and provide enough records to investigate disputes.

### The request path

A browser request may pass through DNS, a CDN or reverse proxy, a web server, application code, identity services, and databases or external APIs. Each component interprets some part of the request and relies on assumptions made by the components before it.

The browser is controlled by the user. Client-side checks improve usability, but they cannot establish authority: a user can edit a request or call an API without using the interface. The server must validate data and enforce authentication and authorization on every protected operation.

### Risk as a practical question

When reviewing a possible weakness, ask:

1. What asset or security goal is affected?
2. Who could reach the relevant feature, and under what conditions?
3. What could that person cause the system to do or reveal?
4. What safeguards limit likelihood or impact?

This keeps security discussions tied to real application behavior instead of treating every unusual response as equally serious.

## 3. Vulnerability

A vulnerability is a weakness in design, implementation, configuration, or operation that can violate a security goal. Common causes include trusting client-controlled values, missing access checks, unsafe interpretation of input, excessive permissions, leaked secrets, and inconsistent behavior between components.

The same underlying mistake can produce different outcomes. A missing object-level authorization check might expose one user’s profile to another user. In a multi-tenant system, the same class of flaw might cross an organization boundary and disclose many records. Context determines impact.

Security controls also fail when they exist only in one layer. Hiding an administrator link in the interface does not protect the corresponding endpoint. A frontend validation rule does not prevent a direct API request with an unexpected value. Controls should be enforced at the trusted boundary where the protected action occurs.

## 4. Attack scenario

Imagine a project-management application with a page at `/projects/42`. The interface displays projects belonging to the signed-in user. A request to the backend retrieves a project using its numeric ID.

If the backend checks only that the user is signed in, a user may change the ID and receive a different project. The number is not the root problem; the missing ownership check is. The server should load the project and confirm that the current identity is allowed to view it before returning any project data.

This example illustrates a general review habit: identify the protected resource, the caller, and the server-side rule connecting them. Do not infer authorization from a page being hidden, an identifier being hard to guess, or a request originating from the expected interface.

## 5. Technical demonstration

The following small Express example shows the difference between authentication and authorization. It is illustrative code for a local learning project; it is not a complete production authentication system.

### Insecure pattern

```js
app.get("/api/projects/:id", requireLogin, async (req, res) => {
  const project = await db.project.findUnique({
    where: { id: req.params.id },
  });

  if (!project) return res.sendStatus(404);
  return res.json(project);
});
```

`requireLogin` confirms an identity, but the handler never checks whether that identity may read the selected project.

### Safer pattern

```js
app.get("/api/projects/:id", requireLogin, async (req, res) => {
  const project = await db.project.findFirst({
    where: {
      id: req.params.id,
      ownerId: req.user.id,
    },
  });

  if (!project) return res.sendStatus(404);
  return res.json({ id: project.id, name: project.name });
});
```

The query scopes access to the current user and the response includes only the fields needed by this endpoint. A real application may use shared policy functions, organization membership, or role rules, but the access decision must still be enforced by trusted server-side code.

### Safe local exercise

In a deliberately local sample application, create two test accounts and one project per account. Sign in as the first account and request both project IDs. Confirm the first request succeeds and the second does not reveal the other account’s project. Repeat after changing the UI state or sending the request directly, so the test verifies the server rule rather than the interface.

Only perform this test on systems you own or have explicit permission to assess. Use synthetic data and avoid sending requests to public targets.

## 6. Impact

The consequences depend on the affected asset and reachable action. A flaw may expose private information, modify records, enable unauthorized transactions, compromise accounts, or make a service unavailable. It can also create secondary costs: incident response, recovery work, regulatory obligations, loss of customer trust, and interruption to normal operations.

Describe impact precisely. State whose data or capability is affected, what preconditions are required, and what evidence supports the conclusion. Avoid claiming access or consequences that were not verified.

## 7. Prevention

- Define security requirements alongside product behavior and data classification.
- Enforce authentication and authorization on the server for every protected action and resource.
- Validate input according to business rules and encode output for its specific context.
- Use maintained frameworks and libraries, secure configuration, and least-privilege service accounts.
- Keep secrets out of source code and client bundles; use controlled secret storage and rotation.
- Design safe failure behavior, audit important security events, and avoid logging credentials or tokens.
- Review dependencies, deployment changes, and third-party integrations as part of the application’s lifecycle.
- Use layered safeguards so one missed check does not automatically expose every asset.

No checklist or scanner can prove an application secure in every context. Controls should be selected based on the system’s architecture, users, data, and threats, then revisited as those conditions change.

## 8. Detection and testing

Security work combines different methods because each finds different classes of weakness:

- **Design review and threat modeling** identify risky assumptions and trust boundaries before implementation.
- **Code review** examines whether sensitive operations enforce the intended rules.
- **Automated analysis** can find known patterns, vulnerable dependencies, and some configuration problems.
- **Dynamic testing** checks the running application’s behavior using defined test accounts and expected outcomes.
- **Operational monitoring** helps detect abuse and failures that were not apparent during development.

The [OWASP Web Security Testing Guide](https://wstg.owasp.org/) provides testing methods and objectives; it is a guide to adapt to scope and context, not a substitute for understanding the application. The [OWASP Application Security Verification Standard](https://asvs.owasp.org/) provides security requirements teams can use when designing and verifying controls.

For each test, record the requirement, setup, action, expected result, actual result, and evidence. Keep the test within its approved scope and use accounts and data chosen for the exercise.

## 9. Checklist

- [ ] Identify the application’s important data, actions, and availability needs.
- [ ] Sketch the request path and mark components that cross trust boundaries.
- [ ] Confirm which decisions are made by the client and which are enforced by the server.
- [ ] Check that each sensitive action has an explicit authentication and authorization rule.
- [ ] Use a safe local environment with synthetic data for hands-on demonstrations.
- [ ] Record verified behavior, impact, and remediation clearly.
- [ ] Reassess controls when features, dependencies, or deployment architecture change.

## 10. References

- [OWASP Web Security Testing Guide](https://wstg.owasp.org/) — testing framework and test techniques.
- [OWASP Application Security Verification Standard](https://asvs.owasp.org/) — application security requirements.
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — awareness document on prominent web application risk categories.
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — practical implementation guidance for common controls.

---

**Continue the WebSecurity series:**

[Next: WebSecurity#002: How the Web Works: HTTP, HTTPS, DNS, TCP/IP](/blog/2026-11-10-websecurity-002-how-the-web-works)
