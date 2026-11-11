---
title: "WebSecurity#009: Threat Modeling and Trust Boundaries"
date: 2026-11-09
category: journal
series: WebSecurity
description: "Model data flows, identify changes in trust, and turn plausible threats into specific controls and verification tasks."
tags: [programming, cybersecurity, WebSecurity]
author:
  name: An Doan
  link: https://anddoanf.github.io/
---

## 1. Introduction

Threat modeling examines a system's design to ask what could go wrong and what the team should do about it. It is useful before implementation and whenever a feature changes who can access data or trigger important behavior.

The output should guide engineering work: explicit assumptions, plausible threats, chosen controls, and tasks that verify those controls.

## 2. Fundamentals

### Model what exists or is proposed

Start with a simple data-flow diagram showing external actors, application processes, stores, and connections. Add the identity used on each connection and the assets being transferred. A model with five understandable components is often more useful than a diagram crowded with every library.

### Mark changes in trust

A trust boundary appears where the system must reconsider identity, authority, or data validity. The browser-to-API boundary is obvious. Others include an application calling a payment provider, a worker consuming an uploaded file, and one tenant's request entering shared infrastructure.

Being inside a network does not make all callers equally trustworthy. A service identity with permission to read one queue should not automatically be able to administer the database.

### Use prompts to find threats

STRIDE is one useful set of prompts: spoofing, tampering, repudiation, information disclosure, denial of service, and elevation of privilege. Apply the prompts to concrete flows. A category name becomes actionable only when connected to an actor, a weakness, an asset, and an outcome.

The [OWASP threat modeling guidance](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) describes this work as modeling the system, identifying relevant threats, and determining responses. Teams can choose techniques that fit their architecture and review process.

### Run a focused modeling session

Begin with one feature and a bounded goal, such as "accept a payment-provider callback and update the intended invoice once." Identify the valuable state, the callers, and the expected successful path. Then record exclusions so nobody mistakes a narrow webhook review for coverage of the entire billing platform.

Draw the data path with identities and stores. Ask where the raw body becomes parsed JSON, where an external identifier becomes a database lookup, and where a message becomes an authoritative state transition. These interpretation points often reveal more useful threats than a diagram that marks only network firewalls.

Next challenge the assumptions: could the sender be different, could a field be modified, could the message repeat, could the same invoice change concurrently, and could an error leave partial state? For each credible answer, choose a control and define observable evidence. Close the session by assigning owners and tracking unanswered questions.

### Apply STRIDE to the concrete feature

| Threat prompt | Billing example | Control and verification idea |
| --- | --- | --- |
| Spoofing | Untrusted sender claims to be the provider | Verify the configured provider signature; reject a wrong key |
| Tampering | Amount or invoice ID changes in transit or before verification | Authenticate the exact signed bytes; reject a modified body |
| Repudiation | No reliable record explains who changed payment state | Record event ID, invoice reference, decision, and correlation ID |
| Information disclosure | Error responses include customer payment details | Return minimal errors and redact logs |
| Denial of service | Oversized callbacks exhaust parsing or worker resources | Limit body size, processing time, and queue pressure |
| Elevation of privilege | A valid event updates an invoice in the wrong account | Bind the provider account and invoice to the correct tenant |

The table is a prompt set, not proof that all threats have been found. Business logic adds questions such as whether a refund may arrive before settlement or whether an old event can reverse a newer state. Those require knowledge of the domain's allowed transitions.

### Separate preventive controls, detection, and response

A signature check prevents unauthenticated message modification from becoming a valid event. A denied-signature counter helps detect abuse or configuration errors. A documented key-rotation procedure supports recovery after a key is exposed. These are distinct tasks with different evidence.

Record residual risk after the controls. For example, a valid provider credential may still be abused if the provider account is compromised. The application can reduce consequences by checking invoice ownership, expected amounts, and allowed transitions, but should not claim the signature eliminates every billing threat.

## 3. Vulnerability

Design flaws often come from an assumption that never becomes an enforced rule: a webhook must come from the provider, a queue message must belong to the stated tenant, or an internal user must be an administrator.

Threat modeling can also fail operationally. A diagram without owners, decisions, or follow-up verification becomes documentation rather than a control. Track assumptions that still need evidence and revisit them when the design changes.

### Model a compromised component, not only an outside stranger

After considering a forged external callback, assume one ordinary application workload is compromised. Which authenticated service operations can it call? Can it retrieve a signing secret, enqueue a billing job, or read another tenant's export? A legitimate service credential can still be used beyond the business context the team intended if permissions are too broad.

This changes the meaning of an "internal" boundary. The useful question is which identity and capability cross it, not whether the arrow stays inside a cloud network. Network restrictions reduce exposure but do not eliminate the need for service authorization and minimal privileges.

Record assumptions with a way to falsify them. "The worker cannot reach the payment-state table" can be verified through effective database permissions. "Only the provider can know this URL" is a weak secrecy assumption and should not stand in for sender authentication. "Uploads are always PDFs" must be enforced by the receiving and parsing design rather than trusted from a browser field.

When the model includes a dependency you do not control, record what evidence is available and what remains an accepted dependency. Avoid converting an unverified vendor claim into a completed local control without reviewing its integration and failure behavior.

## 4. Attack scenario

A billing service accepts an unsigned webhook containing `invoiceId` and `paid: true`. The design assumes only the payment provider knows the endpoint. Someone who learns the URL can send a forged message and mark an invoice paid.

The important boundary is the external callback entering the billing state machine. The service needs provider authentication, event validation, replay handling, and an allowed state transition before it changes financial records.

## 5. Technical demonstration

Use this model for a local design exercise:

```text
Browser --session--> Project API --service identity--> Database
Payment provider --signed event--> Webhook handler --> Billing state
Member --upload--> Object storage --> Parser worker
```

Create one threat record per selected boundary:

```yaml
id: TM-001
flow: payment-provider-to-webhook
asset: invoice payment state
threat: forged or replayed event changes billing state
assumption_to_verify: provider signature covers the raw request body
controls:
  - verify provider signature and supported timestamp window
  - validate invoice ownership and allowed transition
  - deduplicate provider event identifiers
verification:
  - valid synthetic event updates the intended invoice once
  - modified body is rejected
  - duplicate event has no additional effect
owner: billing-team
```

This is a modeling exercise rather than provider-specific code. Actual signing formats, key rotation, and timestamp rules must follow the selected provider's documentation. The record is valuable because it links the risk to evidence a developer can produce.

### Demonstrate what message integrity proves

Save this standalone exercise as `webhook-integrity.mjs` and run `node webhook-integrity.mjs`. It defines a synthetic signing format for this exercise, not a drop-in implementation for any provider:

```js
import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";

const key = randomBytes(32);
const timestamp = "1700000000";
const body = '{"eventId":"evt-demo","invoiceId":"inv-1","paid":true}';

function sign(time, rawBody) {
  return createHmac("sha256", key)
    .update(time + ".")
    .update(rawBody)
    .digest("hex");
}

function authentic(time, rawBody, signature) {
  if (typeof signature !== "string" || !/^[a-f0-9]{64}$/.test(signature)) {
    return false;
  }
  const expected = Buffer.from(sign(time, rawBody), "hex");
  const received = Buffer.from(signature, "hex");
  return timingSafeEqual(expected, received);
}

const signature = sign(timestamp, body);
console.log(authentic(timestamp, body, signature)); // true
console.log(authentic(timestamp, body.replace("inv-1", "inv-2"), signature)); // false
console.log(authentic(timestamp, body, signature)); // true again: replay remains possible
```

The final result is important: an authentic message can be replayed. Integrity verification answers whether the bytes match the signer, not whether the event is fresh or already processed. The fixed timestamp is deliberately not checked here so this limitation is visible.

A real handler must follow the provider's exact raw-body, timestamp, signature, key, and rotation rules. Parse JSON after verifying the signed representation when the provider signs raw bytes. Reserializing JSON can change whitespace or property ordering and invalidate a valid signature, or cause the application to verify different bytes from those it processes.

### Model duplicate handling as a database operation

After authenticity and schema validation, deduplicate using a provider-account and event-ID key. In a multi-instance service, checking an in-memory set before a database write leaves races between workers. Use a durable uniqueness constraint and an atomic transaction or equivalent design connecting deduplication to the intended state change.

Within the same operation, verify the invoice's account, currency, amount, and allowed current state. A valid provider signature does not prove that the event belongs to the invoice selected by an untrusted mapping. If additional notifications are sent after the transaction, consider an outbox-style mechanism so retries cannot silently lose or multiply side effects.

### Evaluate a design alternative explicitly

Suppose the team considers allowing the browser to mark the invoice paid after a successful payment-screen message. The benefit is an immediate interface update, but the browser-controlled claim crosses a stronger trust boundary than a provider-verified event. A better design can show a pending state immediately while the backend confirms authoritative payment status.

Record the choice, the reason, and the expected failure behavior. If confirmation is delayed, the UI should not grant paid capabilities merely to avoid showing "pending." The threat model has now influenced both backend policy and product behavior.

## 6. Impact

Unexamined trust assumptions can affect entire features, including payment integrity, tenant isolation, and credential scope. Finding a design flaw early can prevent the same missing rule from spreading into several routes, workers, and clients.

## 7. Prevention

Review threats when adding an external integration, privileged operation, new data store, or asynchronous path. Assign owners to mitigations and record accepted risks with a reason and review date. Keep the model small enough to update as part of ordinary engineering work.

## 8. Detection and testing

Turn each important threat into a falsifiable claim. Instead of saying "webhooks are secure," verify that a changed body fails signature validation and a duplicate event has no additional effect. Compare the deployed system with the modeled identities and flows so configuration drift is visible.

### Make each mitigation independently testable

Use four categories of evidence: a valid synthetic event succeeds, a modified event fails, a duplicate has no additional effect, and an out-of-order event follows the defined state machine. Include concurrency tests where multiple workers can handle the same event and outage tests where persistence fails between processing steps.

Track decisions with a short status such as proposed, implemented, verified, or accepted risk. A pull request adding a signature helper can move one task to implemented without establishing that the deployed route receives raw bytes or uses the intended key. Verification closes that gap.

Reopen the model when payment providers, event schemas, tenant mapping, worker privileges, or deployment paths change. Those changes alter assumptions even if the route URL remains identical.

## 9. Checklist

- [ ] Identify assets, actors, stores, and data flows.
- [ ] Mark boundaries where identity or trust changes.
- [ ] State assumptions that require verification.
- [ ] Write threats as concrete actor-action-impact scenarios.
- [ ] Assign controls and verification tasks to owners.
- [ ] Revisit the model after meaningful architectural changes.

## 10. References

- [OWASP: Threat Modeling](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) — modeling process and STRIDE prompts.
- [OWASP Threat Modeling Project](https://owasp.org/www-community/Threat_Modeling) — techniques and supporting resources.
- [OWASP: Attack Surface Analysis](https://cheatsheetseries.owasp.org/cheatsheets/Attack_Surface_Analysis_Cheat_Sheet.html) — tracking reachable behavior.

---

**Continue the WebSecurity series:**

[Previous: WebSecurity#008: Understanding the Web Application Attack Surface](/blog/2026-11-10-websecurity-008-web-application-attack-surface) | [Next: WebSecurity#010: OWASP Top 10, WSTG, ASVS, and CWE Explained](/blog/2026-11-10-websecurity-010-owasp-wstg-asvs-cwe)
