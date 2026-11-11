---
title: "WebSecurity#008: Understanding the Web Application Attack Surface"
date: 2026-11-08
category: journal
series: WebSecurity
description: "Inventory reachable interfaces, data flows, identities, and dependencies to focus security work on exposed trust boundaries."
tags: [programming, cybersecurity, WebSecurity]
author:
  name: An Doan
  link: https://anddoanf.github.io/
---

## 1. Introduction

An application's attack surface includes the interfaces and paths through which someone might influence it or obtain data from it. A login page is one entry point. An old API version, webhook receiver, public storage bucket, or support workflow may be equally relevant.

An inventory makes that exposure reviewable. It connects each interface to an owner, a trust boundary, and the controls expected to protect it.

## 2. Fundamentals

### Count capabilities, not only URLs

Two routes with similar paths may have different security implications. A read-only endpoint returning public project names differs from one generating a private organization export. Record the operation, accepted input, caller identity, and downstream effects.

Include browser pages, HTTP APIs, WebSockets, uploads, callbacks, administrative interfaces, background processing inputs, and third-party integrations. Hosting and deployment interfaces also matter because they can alter the application or its data.

### Track identities and data movement

An interface's reachability is only part of the picture. A backend job may consume uploaded files using a highly privileged service account. A public endpoint may trigger internal requests. Follow those paths far enough to understand which assets and privileges become reachable.

### Separate observation from assumption

An exposed route is not automatically vulnerable. Conversely, an undocumented route is not protected merely because users rarely see it. Record evidence of existence and control behavior before assigning risk.

### Build the inventory from independent sources

Start with intended behavior: API specifications, route declarations, gateway configuration, deployment manifests, DNS records, and storage policies. Then compare that intention with observations such as browser requests, application logs, and approved deployed-interface checks. Neither source is sufficient alone. A documented route may no longer be deployed, while a deployed compatibility route may have disappeared from the documentation.

Represent routes using method and normalized template, such as `GET /projects/{projectId}`, instead of treating every project ID as a different interface. Preserve host, environment, version, and authentication context where those change behavior. An identical path on production and staging can be governed by very different deployment controls.

For GraphQL, a single HTTP route can expose many operations, resolvers, and fields. A count of one endpoint therefore understates capability. For WebSockets, include the connection handshake and the message types accepted after it. For asynchronous work, include who may enqueue a job and how the worker authenticates the job's context.

### Include four directions of data movement

| Direction | Example | Review question |
| --- | --- | --- |
| Inbound input | Upload or webhook | What can an untrusted caller influence? |
| Outbound response | Export or signed download link | Which data leaves, and who receives it? |
| Outbound request | URL preview or partner API call | Which destinations and credentials can the server use? |
| Asynchronous processing | Queue, scheduled job, import worker | Which earlier assumptions survive until execution? |

A URL-preview feature can turn an inbound string into a privileged outbound request. A download-link generator can turn authorization at one moment into a reusable capability lasting for the link's lifetime. Follow these transformations rather than stopping at the original controller.

### Rank review effort by capability and consequence

Prioritize interfaces that cross tenant boundaries, change roles, process complex untrusted files, alter financial state, or use powerful service credentials. Also consider interfaces with weak ownership, outdated dependencies, or obsolete clients. Reachability and authority matter more than whether a path looks administrative.

An attack-surface inventory does not itself assign a vulnerability score. Record known controls and uncertainty, then choose follow-up tests. "Exposed to ordinary members and calls an internal parser with broad write access" is useful prioritization context even before a parser weakness is demonstrated.

## 3. Vulnerability

Attack-surface gaps often arise when the inventory follows the current UI while older APIs and deployment artifacts remain active. Ownership becomes unclear, patching stops, and new controls are applied only to the latest version.

A second problem is treating internal placement as sufficient protection. A service reachable through a compromised workload or overprivileged integration may still expose important operations even when it has no public URL.

### Work through a deceptively small feature change

An existing application accepts plain project titles. A proposed release adds a URL field so the server can fetch a document and attach a preview. The UI change is one input, but the reachable behavior now includes DNS resolution, HTTP redirects, remote content parsing, network destinations, response sizes, and a worker's storage writes.

Document the before-and-after difference rather than merely adding one route row. Before the change, an ordinary member could submit text. Afterward, the member can influence an outbound request and cause the server to process its response. The service identity might have network reach that the member's browser does not have.

The review questions then become specific: which URL schemes are accepted, whether each redirected destination is revalidated, how response size and duration are bounded, whether the worker can reach internal metadata services, and what content types the parser expects. These are follow-up control questions rather than claims that the feature is already exploitable.

Use three connected artifacts to avoid losing this reasoning:

| Artifact | Example output | Engineering use |
| --- | --- | --- |
| Asset inventory | Preview worker and object-storage prefix | Assign ownership and patch responsibility |
| Surface-change record | Member input now controls an outbound fetch | Trigger the relevant design and security review |
| Threat and verification record | Unintended destinations or oversized responses | Define controls and bounded test cases |

If the review later finds the fetcher only accepts a fixed trusted document identifier, the surface may be narrower than initially assumed. Update the record with that evidence. An inventory should improve as uncertainty is resolved instead of preserving the most alarming possible interpretation forever.

## 4. Attack scenario

A team releases `/api/v2/exports` with strong organization authorization. The older `/api/v1/exports` endpoint remains active for a discontinued client and still trusts a client-provided organization ID. The current dashboard is secure, but the forgotten endpoint permits cross-organization access.

The failure starts with incomplete inventory and ownership, then becomes an authorization flaw. Both need remediation: fix or retire the endpoint and make future lifecycle changes visible.

## 5. Technical demonstration

Create a small inventory for a local project application. Use route definitions, deployment manifests, and observed browser traffic as separate inputs:

```csv
interface,caller,asset,owner,expected_control
GET /api/projects,member,project metadata,backend,tenant-scoped authorization
POST /api/uploads,member,uploaded files,backend,type and size limits
POST /webhooks/payments,payment provider,billing state,billing,signature and replay checks
GET /admin/exports,administrator,organization records,operations,privileged authorization
```

Then trace one row beyond the receiving route:

```text
User upload -> API -> object storage -> worker -> document parser
```

Ask what identity the worker uses, whether files can trigger outbound requests, and where validation happens. This transforms a URL list into a model of reachable behavior.

For a reproducible local observation, run the [lab](/assets/websecurity/websecurity-lab.mjs), open DevTools Network, and click each action. Compare the observed requests with the route branches in the script. Note that `robots.txt` and metadata endpoints exist even if the homepage does not link to all of them.

### Reconcile intended routes with observed routes

Save this as `surface-diff.mjs` and run `node surface-diff.mjs`:

```js
const documented = new Set([
  "GET /api/v2/projects",
  "POST /api/v2/uploads",
  "POST /webhooks/payments",
]);

const deployed = new Set([
  "GET /api/v2/projects",
  "POST /api/v2/uploads",
  "GET /api/v1/exports",
]);

const undocumented = [...deployed].filter((route) => !documented.has(route));
const notObserved = [...documented].filter((route) => !deployed.has(route));

console.log({ undocumented, notObserved });
```

Expect `/api/v1/exports` in the undocumented list and the payment webhook in the not-observed list. These are reconciliation tasks, not automatic findings. The legacy export might be intentionally supported, and the webhook might be deployed on a separate approved host outside this observation set.

For each difference, assign an owner to resolve the uncertainty. Avoid automatically deleting a route because it is absent from one document, or declaring a documented control missing because your browser session did not exercise it.

### Turn a high-impact row into a review record

For the synthetic export interface, expand the inventory:

```yaml
interface: GET /api/v1/exports/{exportId}
environment: local-training
source_evidence: gateway route and application handler
caller: authenticated organization member
data: generated project records
identity_source: validated session
expected_boundary: caller organization must own export
downstream:
  - object storage read using export-service identity
open_questions:
  - is authorization checked before generating the download URL?
  - can a previously issued URL outlive membership removal?
  - does the storage object permit public retrieval?
owner: exports-team
```

The record separates an access decision, an issued capability, and the storage policy. Each can fail independently. A correct API check does not protect an object that was also made public, and a private object can still be disclosed through an overbroad signed URL generator.

### Record exposure changes as code-review inputs

Suppose a release adds `POST /api/import-from-url`. Its surface change is larger than one new route: it adds a URL parser, outbound network access, content fetching, and a document parser. The review should decide destination restrictions, timeout and response-size limits, redirects, service identity, and safe failure behavior.

Use the same reasoning when a feature flag becomes public or a storage prefix changes from private to public. The code diff can be small while the reachable capabilities change substantially.

## 6. Impact

An incomplete inventory allows vulnerable or unmaintained interfaces to remain reachable. It also slows incident response because teams cannot quickly identify affected owners, data flows, or credentials. An accurate surface map improves both prevention and investigation.

## 7. Prevention

Keep interface ownership and lifecycle information alongside source and deployment configuration. Retire unused endpoints, restrict administration paths, and reduce service privileges. Make new routes, storage locations, and integration permissions part of design and release review.

Surface reduction is useful when it removes unnecessary capability. Hiding a route name or changing a banner does not remove its underlying operation.

### Retire capabilities completely

Endpoint retirement includes gateway routes, backend handlers, scheduled jobs, old DNS records, partner configuration, and credentials that existed only for the old feature. Disabling the UI leaves direct API access intact. Blocking the public gateway alone can still leave an internally reachable backend route.

Choose an intentional response for retired clients, document the compatibility timeline, and verify that data access has actually stopped. A 410 or 404 may communicate the intended outcome, but verify the underlying resource is not still reachable through another host or download URL. Keep operational evidence long enough to diagnose forgotten callers without retaining unnecessary private request bodies.

## 8. Detection and testing

Reconcile intended routes with deployed behavior, documentation, gateway configuration, and logs. Test within an approved scope and avoid assuming that a discovered hostname belongs to the same authorization boundary. Record unknown assets for ownership resolution before active assessment.

### Test by interface family and identity

Combine route families with the permission matrix: anonymous, ordinary member, other member, other tenant, administrator, and service identity as appropriate. Include query variants, bulk operations, background results, and alternate content representations. Sampling should cover the distinct security rules, not merely a convenient list of paths.

After each release that changes exposure, compare the new inventory with the previous version. Review additions, removals, changed ownership, changed identity sources, and increased downstream privileges. Assign unresolved differences a status and owner so an "unknown" does not disappear into an apparently complete checklist.

## 9. Checklist

- [ ] Inventory interfaces beyond the current UI.
- [ ] Record operation, caller, asset, owner, and control.
- [ ] Include obsolete versions and asynchronous consumers.
- [ ] Follow high-impact inputs into downstream services.
- [ ] Retire unused capabilities and credentials.
- [ ] Update the map when architecture or deployment changes.

## 10. References

- [OWASP: Attack Surface Analysis](https://cheatsheetseries.owasp.org/cheatsheets/Attack_Surface_Analysis_Cheat_Sheet.html) — inventory and change review.
- [OWASP WSTG: Information Gathering](https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/01-Information_Gathering/README/) — discovery techniques.
- [OWASP: Threat Modeling](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) — connecting interfaces to threats.

---

**Continue the WebSecurity series:**

[Previous: WebSecurity#007: Authentication vs. Authorization](/blog/2026-11-10-websecurity-007-authentication-vs-authorization) | [Next: WebSecurity#009: Threat Modeling and Trust Boundaries](/blog/2026-11-10-websecurity-009-threat-modeling-trust-boundaries)
