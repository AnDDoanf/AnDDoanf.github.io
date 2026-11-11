---
title: "WebSecurity#007: Authentication vs. Authorization"
date: 2026-11-07
category: journal
series: WebSecurity
description: "Separate identity verification from permission checks and enforce both at the server's protected operations."
tags: [programming, cybersecurity, WebSecurity]
author:
  name: An Doan
  link: https://anddoanf.github.io/
---

## 1. Introduction

Authentication answers who is making a request. Authorization decides whether that identity may perform an action on a particular resource. A valid login establishes an identity context; it does not establish permission to access every record.

Keeping these decisions explicit helps teams find missing controls and write useful tests. It also prevents an application from relying on its interface as the only barrier around sensitive operations.

## 2. Fundamentals

Authentication may use a password, passkey, federated identity, or another supported method. The server validates the evidence and creates a trusted identity context, often carried by a session or verified token on later requests.

Authorization combines that identity with the requested action, resource, and relevant context. A project rule might allow the owner to rename a project, a collaborator to read it, and an organization administrator to manage membership. The same user can have different permissions on different projects.

| Decision | Example question | Typical enforcement |
| --- | --- | --- |
| Authentication | Is this session valid? | Session middleware or token validation |
| Function permission | May this user manage memberships? | Route or service policy |
| Object permission | May this user manage project 42? | Resource-scoped query or policy |
| Property permission | May this user change the billing owner field? | Explicit field-level update rules |

An authenticated identity should come from validated server-side state. A request body containing `userId` or `role` is a claim from the client until verified. Also distinguish access denial from disclosure policy: returning 404 instead of 403 can sometimes avoid revealing that a private object exists.

### Build an authorization decision from explicit inputs

A useful decision model is `subject + action + resource + context`. The subject is the validated identity, the action is the operation requested, the resource is the specific object or collection, and context can include tenant membership, relationship, transaction state, or a recent reauthentication requirement.

For example, Bob may be allowed to read project 42 as a collaborator but forbidden to transfer its ownership. An organization administrator may manage projects inside one organization without authority in another. A support operator may see limited metadata without permission to download the underlying customer files.

This means a single `isAdmin` boolean often loses important policy information. Express the actual permission and its resource scope. When the product allows delegated access, distinguish the actor performing the operation from the account on whose behalf it is performed so audit records remain understandable.

### Trace identity through the backend

At the entry boundary, validate the session or token and derive a trusted subject. For tokens, signature validation alone is insufficient: issuer, audience, expiry, token type, and application-specific requirements must match the intended use. A valid identity token for a client is not automatically a valid API access token.

Pass the validated identity into service operations without allowing request fields to overwrite it. A common mistake is merging `req.body` into a context object after adding the authenticated user. A body containing `userId` or `tenantId` can then replace trusted values unless the construction is explicit.

At the data boundary, retrieve only records within the permitted tenant and resource scope. At the mutation boundary, allow only writable fields and allowed state transitions. Finally, shape the response so a successful permission check does not expose properties the caller should never receive.

### Identity federation changes the evidence, not the business policy

An identity provider can authenticate a person and supply validated claims. The application still decides what that person can do in its own domain. An enterprise email address does not automatically confer administrator authority, and an upstream group name may need explicit mapping before it becomes an application role.

Account linking also needs care: two accounts with a similar displayed email are not necessarily the same authenticated subject. Use stable, verified identifiers and a deliberate linking flow rather than merging accounts based on untrusted profile fields.

## 3. Vulnerability

Common failures include checking only whether the user is logged in, trusting a client-provided role, or enforcing permissions on the read path while forgetting updates and exports. A role name alone may also omit object ownership or tenant boundaries.

Central middleware helps enforce consistent identity validation, but resource-specific policy often belongs deeper in the operation. A route guard cannot decide ownership without the relevant resource context.

### Treat collections and background results as protected resources

A detail endpoint can enforce ownership correctly while a list endpoint returns every tenant's records. Filtering only in the browser leaves those extra records in the network response. Apply the permitted resource scope before pagination, counts, and aggregation so metadata does not disclose a broader private dataset.

For exports, authorization is needed when the export is requested and when its result is retrieved. If a job runs much later, decide whether revoked permissions should stop processing as well. Do not let a queued message containing an old role turn into indefinite authority after membership removal.

Signed download links require another explicit decision. They often act as temporary bearer capabilities, so their lifetime and scope determine what happens after the original session ends. Minimize their duration and accessible object set, and document revocation limitations rather than assuming the link inherits current account policy automatically.

Property-level access belongs in the same review. A caller allowed to edit a project's name should not be able to add `ownerId`, `tenantId`, or `billingStatus` to a generic update body and thereby modify protected fields. Bind allowed inputs explicitly and apply resource and transition rules before persisting them.

## 4. Attack scenario

Alice and Bob each own a project. Alice's interface lists only her projects, but the update API accepts any project ID after login. Alice sends Bob's ID to the same endpoint and changes his project's name.

Authentication worked: the server knew Alice was calling. Authorization failed because it never connected Alice to the selected object and action. Hiding Bob's ID from the interface would not enforce that relationship.

## 5. Technical demonstration

Save the following as `authorization-demo.mjs` and run `node authorization-demo.mjs`. It is a standalone policy exercise with synthetic objects and no dependencies:

```js
const projects = [
  { id: "p1", ownerId: "alice", name: "Alice project" },
  { id: "p2", ownerId: "bob", name: "Bob project" },
];

function readProject(authenticatedUserId, projectId) {
  if (!authenticatedUserId) return { status: 401 };
  const project = projects.find((item) =>
    item.id === projectId && item.ownerId === authenticatedUserId
  );
  if (!project) return { status: 404 };
  return { status: 200, data: { id: project.id, name: project.name } };
}

console.log(readProject(null, "p1"));       // 401
console.log(readProject("alice", "p1"));    // 200
console.log(readProject("alice", "p2"));    // 404
```

In a real backend, `authenticatedUserId` must be supplied by validated authentication middleware, not copied from an untrusted request field. Database queries can apply the ownership condition directly. More complex policies should account for memberships and concurrent permission changes.

### Expand the exercise into a permission matrix

Create two projects with explicit tenants and memberships:

```js
const subjects = {
  alice: { id: "alice", tenantId: "t1", permissions: ["project:read"] },
  bob: { id: "bob", tenantId: "t2", permissions: ["project:read"] },
  guest: { id: "guest", tenantId: "t1", permissions: [] },
};

const project = { id: "p1", tenantId: "t1", memberIds: ["alice"] };

function canReadProject(subject, resource) {
  return Boolean(subject && resource
    && subject.tenantId === resource.tenantId
    && subject.permissions.includes("project:read")
    && resource.memberIds.includes(subject.id));
}

console.log(canReadProject(subjects.alice, project)); // true
console.log(canReadProject(subjects.bob, project));   // false
console.log(canReadProject(subjects.guest, project)); // false
console.log(canReadProject(null, project));          // false
```

Save this separately as `authorization-matrix.mjs` and run it with Node. The four conditions answer different questions. Removing the tenant check should not be treated as safe merely because today's member lists happen not to overlap; tenant isolation is an explicit invariant. Likewise, a tenant match alone does not establish membership or action permission.

The example is intentionally a pure policy function. A deployed implementation must retrieve memberships from trusted state, handle stale roles, and define how permission changes affect existing sessions. Database row-level policies can provide an additional enforcement layer, but require correct identity propagation and should be verified alongside application checks.

### Make writes preserve the authorization condition

Imagine checking that Alice owns a project, then updating it later with a query constrained only by its ID. If ownership changes between the read and write, the earlier decision may no longer describe the object being changed. Depending on the operation, use a transaction, a conditional update including ownership or version, or a concurrency mechanism that preserves the policy at mutation time.

For a simple ownership-based update, the intended database operation resembles:

```sql
UPDATE projects
SET name = :validated_name
WHERE id = :project_id
  AND tenant_id = :trusted_tenant_id
  AND owner_id = :trusted_subject_id;
```

The named placeholders describe bound parameters rather than string concatenation. Obtain trusted IDs from validated server context. Check the affected-row result and return the application's chosen non-disclosing denial outcome when no authorized record matched.

## 6. Impact

Authentication flaws can let an attacker impersonate an account. Authorization flaws can let an otherwise legitimate account cross ownership, role, or tenant boundaries. Either may expose or modify records; the exact scope depends on which operations lack enforcement.

## 7. Prevention

Define an explicit permission matrix and enforce it at every protected server operation. Default to denial when context is missing. Scope database queries to the current tenant and authorized resource set, restrict writable fields, and reuse policy logic where it improves consistency.

### Audit policy decisions without exposing credentials

For high-impact actions, record the actor, action, resource reference, tenant, decision, and a request correlation ID. Avoid logging raw session identifiers, bearer tokens, or private document content. A policy-denial log should help investigate a mistaken permission or abuse pattern without becoming a second data leak.

Return user-facing errors according to the endpoint's disclosure policy. A 401 usually signals missing or invalid authentication; a 403 indicates an understood request that is not permitted. Some private resources deliberately return 404 for both missing and unauthorized objects. Apply this consistently enough that response differences do not reveal private membership unnecessarily.

## 8. Detection and testing

Use at least two ordinary accounts and an administrator account in an approved test environment. For each action, compare anonymous access, owner access, another user's access, and access after role removal. Include background jobs, exports, and alternate API versions in the same review.

| Caller and action | Expected behavior |
| --- | --- |
| Anonymous reads a private project | Authentication is required or a non-disclosing denial is returned |
| Owner reads their project | Only the intended response fields are returned |
| Other member in the same tenant | Follows explicit membership policy, not tenant match alone |
| Ordinary member changes ownership | Denied unless a specific delegation permits it |
| Administrator in another tenant | Cannot cross the tenant boundary through a global role assumption |
| Previously permitted member after removal | New requests lose the removed authority according to policy |
| Export worker processing a queued request | Revalidates the relevant authority rather than trusting a stale user field |

Test the API directly as well as the interface. Include create, list, detail, update, delete, bulk operations, downloads, and asynchronous results. Fixing a single detail endpoint does not establish consistent access control for alternate representations of the same data.

## 9. Checklist

- [ ] Obtain identity only from validated server context.
- [ ] Check the operation, object, tenant, and writable properties.
- [ ] Deny when required policy context is absent.
- [ ] Test permitted and forbidden account combinations.
- [ ] Recheck access on every sensitive operation.
- [ ] Avoid exposing private object existence unnecessarily.

## 10. References

- [OWASP: Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) — identity verification controls.
- [OWASP: Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) — permission design and enforcement.
- [OWASP: IDOR Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html) — object-specific access checks.

---

**Continue the WebSecurity series:**

[Previous: WebSecurity#006: Cookies, Sessions, and Browser Storage](/blog/2026-11-10-websecurity-006-cookies-sessions-browser-storage) | [Next: WebSecurity#008: Understanding the Web Application Attack Surface](/blog/2026-11-10-websecurity-008-web-application-attack-surface)
