---
title: DumbPhobia#2 RBAC and ABAC methods
date: 2026-03-23
tags: [frontend, system]
---

> Authorization is one of the most under-designed parts of frontend architecture. Understanding RBAC and ABAC — and when to use each — is the difference between a secure, scalable app and one that leaks permissions under edge cases.

## What is Access Control?

Access control answers one question: **can this user do this thing?**

Authentication (who are you?) is a separate concern. Access control is what happens *after* — once you know who the user is, you need to decide what they're allowed to see and do.

There are many access control models, but two dominate modern application design:

| Model | Full Name | Core idea |
|---|---|---|
| **RBAC** | Role-Based Access Control | Permissions are assigned to roles; users get roles |
| **ABAC** | Attribute-Based Access Control | Permissions are determined by evaluating attributes of user, resource, and environment |

---

## RBAC — Role-Based Access Control

### How it works

In RBAC, every user is assigned one or more **roles**. Every role carries a defined set of **permissions**. Access is granted by checking whether the user's role includes the required permission.

```
User → has Role(s) → Role has Permission(s) → Permission grants Action on Resource
```

### Core concepts

**Role** — a named collection of permissions:
```
admin      → can do everything
editor     → can create, read, update content
viewer     → can only read content
moderator  → can read content, delete comments
billing    → can read/update billing info only
```

**Permission** — a specific action on a specific resource:
```
posts:create
posts:read
posts:update
posts:delete
users:manage
billing:read
billing:update
```

**Assignment** — the link between user and role:
```
Alice → [admin]
Bob   → [editor, billing]
Carol → [viewer]
```

### Implementation example

**Data model:**

```typescript
type Permission =
  | 'posts:create'
  | 'posts:read'
  | 'posts:update'
  | 'posts:delete'
  | 'users:manage'
  | 'billing:read'
  | 'billing:update';

type Role = 'admin' | 'editor' | 'viewer' | 'moderator' | 'billing';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin:     ['posts:create', 'posts:read', 'posts:update', 'posts:delete', 'users:manage', 'billing:read', 'billing:update'],
  editor:    ['posts:create', 'posts:read', 'posts:update'],
  viewer:    ['posts:read'],
  moderator: ['posts:read', 'posts:delete'],
  billing:   ['billing:read', 'billing:update'],
};
```

**Permission check function:**

```typescript
interface User {
  id: string;
  roles: Role[];
}

function hasPermission(user: User, permission: Permission): boolean {
  return user.roles.some(role =>
    ROLE_PERMISSIONS[role]?.includes(permission)
  );
}

// Usage
const user = { id: '1', roles: ['editor'] };

hasPermission(user, 'posts:create'); // true
hasPermission(user, 'posts:delete'); // false
hasPermission(user, 'users:manage'); // false
```

**React integration — permission-aware components:**

```tsx
function usePermission(permission: Permission): boolean {
  const { user } = useAuth();
  return hasPermission(user, permission);
}

// Guard component
function PermissionGate({ permission, children, fallback = null }) {
  const allowed = usePermission(permission);
  return allowed ? children : fallback;
}

// Usage in UI
function PostActions({ post }) {
  return (
    <div>
      <PermissionGate permission="posts:update">
        <EditButton post={post} />
      </PermissionGate>

      <PermissionGate
        permission="posts:delete"
        fallback={<p>You cannot delete this post.</p>}
      >
        <DeleteButton post={post} />
      </PermissionGate>
    </div>
  );
}
```

**Route-level protection:**

```tsx
function ProtectedRoute({ permission, children }) {
  const allowed = usePermission(permission);
  if (!allowed) return <Navigate to="/unauthorized" replace />;
  return children;
}

// In router
<Route
  path="/admin/users"
  element={
    <ProtectedRoute permission="users:manage">
      <UserManagementPage />
    </ProtectedRoute>
  }
/>
```

### Hierarchical RBAC

Roles can inherit from other roles to avoid duplicating permissions:

```typescript
const ROLE_HIERARCHY: Record<Role, Role[]> = {
  admin:     ['admin', 'editor', 'viewer', 'moderator', 'billing'],
  editor:    ['editor', 'viewer'],
  moderator: ['moderator', 'viewer'],
  viewer:    ['viewer'],
  billing:   ['billing'],
};

function getEffectivePermissions(role: Role): Permission[] {
  const inheritedRoles = ROLE_HIERARCHY[role];
  return [...new Set(inheritedRoles.flatMap(r => ROLE_PERMISSIONS[r]))];
}
```

### Use cases

- SaaS applications with clear user tiers (Free, Pro, Admin)
- CMS platforms (Author, Editor, Publisher, Admin)
- Internal tools where team structure maps cleanly to roles
- E-commerce admin panels (Support, Finance, Operations)
- Any application where permissions are stable and roles are well-defined

### Pros

- **Simple to understand** — roles are intuitive; everyone on the team can reason about them
- **Easy to audit** — "what can an editor do?" has a clear, static answer
- **Low performance overhead** — permission check is a simple array lookup
- **Easy to implement** — no complex policy engine needed
- **Works well with JWTs** — roles can be embedded directly in the token payload

### Cons

- **Not granular enough** for complex scenarios — "editor can update *their own* posts but not others'" breaks RBAC
- **Role explosion** — edge cases lead to creating many narrow roles (editor-of-team-A, editor-of-team-B)
- **Static by nature** — permissions are baked into role definitions, not evaluated at runtime
- **Poor fit for multi-tenancy** — same role may need different permissions in different organizations
- **Doesn't account for context** — time of day, device, location are invisible to RBAC

---

## ABAC — Attribute-Based Access Control

### How it works

In ABAC, access is determined by evaluating a **policy** that considers attributes from multiple sources:

```
Access = Policy(Subject attributes + Resource attributes + Action + Environment)
```

Instead of asking *"does this user have the right role?"*, ABAC asks *"given everything we know about this user, this resource, and this context, should access be granted?"*

### Core concepts

**Subject attributes** — properties of the user making the request:
```
userId, role, department, clearanceLevel, teamId, isPremiumSubscriber, location
```

**Resource attributes** — properties of the thing being accessed:
```
ownerId, classification, teamId, status, createdAt, sensitivityLevel, region
```

**Action** — what is being attempted:
```
read, create, update, delete, publish, export, share
```

**Environment attributes** — contextual conditions:
```
currentTime, ipAddress, deviceType, isVPN, requestOrigin
```

**Policy** — the rule that combines all of the above:
```
ALLOW update post IF
  user.id === post.ownerId
  OR (user.role === 'editor' AND user.teamId === post.teamId)
  AND post.status !== 'published'
  AND environment.time BETWEEN '09:00' AND '18:00'
```

### Implementation example

**Policy engine:**

```typescript
interface SubjectAttributes {
  id: string;
  role: string;
  teamId: string;
  department: string;
  isPremium: boolean;
}

interface ResourceAttributes {
  ownerId: string;
  teamId: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  classification: 'public' | 'internal' | 'confidential';
}

interface EnvironmentAttributes {
  time: Date;
  ipAddress: string;
  deviceType: 'mobile' | 'desktop';
}

interface PolicyContext {
  subject: SubjectAttributes;
  resource: ResourceAttributes;
  action: string;
  environment: EnvironmentAttributes;
}

// Individual policy functions
const policies = {
  'post:update': ({ subject, resource, environment }: PolicyContext): boolean => {
    const isOwner = subject.id === resource.ownerId;
    const isTeamEditor = subject.role === 'editor' && subject.teamId === resource.teamId;
    const isEditable = resource.status !== 'published' && resource.status !== 'archived';
    const isBusinessHours =
      environment.time.getHours() >= 9 && environment.time.getHours() <= 18;

    return (isOwner || isTeamEditor) && isEditable && isBusinessHours;
  },

  'post:delete': ({ subject, resource }: PolicyContext): boolean => {
    const isOwner = subject.id === resource.ownerId;
    const isAdmin = subject.role === 'admin';
    const isDraft = resource.status === 'draft';

    return isAdmin || (isOwner && isDraft);
  },

  'document:read': ({ subject, resource }: PolicyContext): boolean => {
    if (resource.classification === 'public') return true;
    if (resource.classification === 'internal') return subject.department !== undefined;
    if (resource.classification === 'confidential') return subject.role === 'admin';
    return false;
  },
};

// Policy evaluation engine
function evaluate(action: string, context: Omit<PolicyContext, 'action'>): boolean {
  const policy = policies[action];
  if (!policy) return false; // deny by default
  return policy({ ...context, action });
}
```

**Usage:**

```typescript
const canUpdate = evaluate('post:update', {
  subject:     { id: 'user-1', role: 'editor', teamId: 'team-A', department: 'content', isPremium: true },
  resource:    { ownerId: 'user-2', teamId: 'team-A', status: 'draft', classification: 'internal' },
  environment: { time: new Date(), ipAddress: '192.168.1.1', deviceType: 'desktop' },
});
```

**React integration:**

```tsx
function useAbac(action: string, resource: ResourceAttributes): boolean {
  const { user, environment } = useAuth();

  return useMemo(() =>
    evaluate(action, {
      subject: user,
      resource,
      environment,
    }),
    [action, resource, user, environment]
  );
}

function PostEditor({ post }) {
  const canUpdate = useAbac('post:update', post);
  const canDelete = useAbac('post:delete', post);

  return (
    <div>
      {canUpdate && <EditButton post={post} />}
      {canDelete && <DeleteButton post={post} />}
    </div>
  );
}
```

### Real-world ABAC policy patterns

**Ownership:**
```typescript
// User can only edit their own resources
const ownershipPolicy = ({ subject, resource }) =>
  subject.id === resource.ownerId;
```

**Team-scoped access:**
```typescript
// User can access resources belonging to their team
const teamScopedPolicy = ({ subject, resource }) =>
  subject.teamId === resource.teamId;
```

**Subscription-gated features:**
```typescript
// Premium feature — only available to paying users
const premiumPolicy = ({ subject }) => subject.isPremium === true;
```

**Time-based restrictions:**
```typescript
// Access only during business hours
const businessHoursPolicy = ({ environment }) => {
  const hour = environment.time.getHours();
  return hour >= 9 && hour < 18;
};
```

**Sensitivity-based access:**
```typescript
// Confidential documents require elevated clearance
const sensitivityPolicy = ({ subject, resource }) => {
  const clearanceLevels = { public: 0, internal: 1, confidential: 2 };
  return subject.clearanceLevel >= clearanceLevels[resource.classification];
};
```

### Use cases

- **Multi-tenant SaaS** — same role, different permissions per organization
- **Healthcare / legal / finance** — document sensitivity and clearance levels
- **Content platforms** — creators can edit only their own content
- **Enterprise applications** — department and team-scoped access
- **Compliance-heavy systems** — GDPR data access, audit requirements
- **Time or location-sensitive access** — IP-restricted or hours-restricted resources

### Pros

- **Extremely granular** — can express virtually any access rule
- **Context-aware** — environment attributes (time, location, device) can influence decisions
- **Scales with complexity** — adding a new attribute doesn't require new roles
- **Handles ownership naturally** — `user.id === resource.ownerId` is a first-class check
- **Better for multi-tenancy** — same policy engine, different attribute values per tenant

### Cons

- **Significantly more complex** to implement and reason about
- **Harder to audit** — "what can Alice do?" requires running the policy engine against every resource
- **Performance overhead** — each check evaluates a policy function rather than a simple lookup
- **Testing surface is larger** — policies have many input combinations to cover
- **Steeper learning curve** for new team members

---

## RBAC vs. ABAC Side by Side

| Dimension | RBAC | ABAC |
|---|---|---|
| **Core concept** | User → Role → Permissions | Policy(User + Resource + Action + Environment) |
| **Granularity** | Coarse-grained | Fine-grained |
| **Complexity** | Low | High |
| **Performance** | Fast (array lookup) | Slower (policy evaluation) |
| **Auditability** | Easy ("what does admin do?") | Hard (depends on context) |
| **Ownership rules** | Awkward | Natural |
| **Multi-tenancy** | Difficult | Handles well |
| **Context-awareness** | None | Full (time, IP, device) |
| **Best for** | Clear user tiers, stable permissions | Complex, dynamic, or context-dependent rules |
| **Common in** | SaaS tiers, CMS, admin tools | Enterprise, healthcare, finance, multi-tenant apps |

---

## Hybrid Approach: RBAC + ABAC

In practice, most production systems use **both**. Roles provide the coarse-grained structure; attribute policies handle the edge cases.

```typescript
function canAccess(
  user: SubjectAttributes,
  resource: ResourceAttributes,
  action: string,
  environment: EnvironmentAttributes
): boolean {

  // Layer 1: RBAC — coarse gate
  // Admins can always proceed; viewers can never write
  if (user.role === 'admin') return true;
  if (action.includes('delete') && user.role === 'viewer') return false;

  // Layer 2: ABAC — fine-grained evaluation
  return evaluate(action, { subject: user, resource, environment });
}
```

**Common hybrid patterns:**

```
Role check (RBAC)       → Is this user even allowed to attempt this action type?
Ownership check (ABAC)  → Is this their own resource?
Team check (ABAC)       → Does the resource belong to their team?
Sensitivity check (ABAC)→ Does their clearance level cover this resource?
Environment check (ABAC)→ Are they on an approved network / within hours?
```

---

## Frontend vs. Backend Authorization

A critical point that is often misunderstood:

> **Frontend authorization controls what users see. Backend authorization controls what they can do. Both are required.**

Frontend checks (hiding buttons, guarding routes) are a **UX convenience**, not a security mechanism. A user can always open DevTools and manipulate the DOM or call your API directly.

```
Frontend (UX layer)        Backend (security layer)
─────────────────────────  ──────────────────────────────
Hide delete button    ←→   Reject DELETE /posts/:id if unauthorized
Redirect from /admin  ←→   Return 403 on any /admin/* endpoint
Disable edit form     ←→   Reject PUT /posts/:id if not owner
```

Both layers should run the same permission logic — the frontend for experience, the backend for enforcement.

---

## Security Best Practices

**Never trust client-side role data for enforcement:**
```typescript
// ❌ Don't read roles from localStorage — user can edit this
const role = localStorage.getItem('role');

// ✅ Roles come from verified JWT or server session only
const { user } = useAuth(); // decoded from verified server-signed token
```

**Deny by default:**
```typescript
// ❌ Optimistic — allow unless explicitly denied
function canAccess(action) {
  if (DENIED_ACTIONS.includes(action)) return false;
  return true;
}

// ✅ Pessimistic — deny unless explicitly allowed
function canAccess(action) {
  if (ALLOWED_ACTIONS.includes(action)) return true;
  return false;
}
```

**Keep authorization logic server-side for sensitive operations:**
```typescript
// Always re-check on the server — frontend check is for UX only
async function deletePost(postId: string) {
  const response = await api.delete(`/posts/${postId}`);
  // Server independently verifies ownership + permissions
  if (response.status === 403) throw new Error('Unauthorized');
}
```

**Log and audit access decisions:**
```typescript
function evaluate(action: string, context: PolicyContext): boolean {
  const result = policies[action]?.(context) ?? false;

  // Log every access decision for audit trail
  auditLog.record({
    action,
    subjectId: context.subject.id,
    resourceId: context.resource.id,
    result,
    timestamp: new Date(),
  });

  return result;
}
```

---

## Quick Reference Card

```
RBAC — Role-Based Access Control
  ├─ Model:      User → Role(s) → Permission(s)
  ├─ Check:      user.roles.some(r => rolePermissions[r].includes(permission))
  ├─ Strength:   Simple, fast, auditable
  ├─ Weakness:   No context, no ownership, role explosion at scale
  └─ Use when:   Clear user tiers, stable permissions, simple apps

ABAC — Attribute-Based Access Control
  ├─ Model:      Policy(subject + resource + action + environment)
  ├─ Check:      policy[action]({ subject, resource, environment })
  ├─ Strength:   Granular, context-aware, handles ownership + tenancy
  ├─ Weakness:   Complex, harder to audit, slower evaluation
  └─ Use when:   Ownership rules, multi-tenancy, compliance, dynamic contexts

Hybrid (recommended for production)
  ├─ Layer 1:    RBAC coarse gate (role allows this action type?)
  └─ Layer 2:    ABAC fine-grained check (specific resource + context)

Security rules (always)
  ├─ Deny by default — allow only what's explicitly permitted
  ├─ Never trust client-side role data for enforcement
  ├─ Mirror all frontend checks on the backend
  └─ Audit every access decision in sensitive systems
```

---

> Authorization is not a feature you add at the end — it's a design decision that touches your data model, your API contracts, your component architecture, and your deployment infrastructure. Getting it right from the start is always cheaper than retrofitting it later.