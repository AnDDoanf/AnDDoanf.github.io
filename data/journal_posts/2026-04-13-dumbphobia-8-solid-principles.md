---
title: "DumbPhobia#8 SOLID Principles"
date: 2026-04-13
tags: [frontend]
---

> SOLID is not just an OOP concept for backend Java developers. Every principle maps directly to how you design React components, custom hooks, and frontend architecture — and mastering them is what makes code maintainable at scale.

## What is SOLID?

SOLID is an acronym for five design principles that make software easier to understand, extend, and maintain. Coined by Robert C. Martin, they were originally described in object-oriented terms — but their intent applies universally to any modular system, including modern frontend development.

| Letter | Principle | Core idea |
|---|---|---|
| **S** | Single Responsibility Principle | A module should have one reason to change |
| **O** | Open/Closed Principle | Open for extension, closed for modification |
| **L** | Liskov Substitution Principle | Subtypes must be substitutable for their base types |
| **I** | Interface Segregation Principle | No module should depend on interfaces it doesn't use |
| **D** | Dependency Inversion Principle | Depend on abstractions, not concretions |

Each principle solves a specific class of design problem. Together, they push you toward components and modules that are small, focused, composable, and independently testable.

---

## S — Single Responsibility Principle

### The principle

> A module, class, or component should have **one — and only one — reason to change**.

If a component does too many things, any change to one concern risks breaking another. The goal is not to limit size but to limit *reasons to change*.

### The violation

```tsx
// ❌ This component does everything:
// - Fetches data
// - Formats data
// - Handles errors
// - Manages pagination
// - Renders the UI
// - Handles user interaction
// → Multiple reasons to change

function UserList() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [page, setPage]       = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users?page=${page}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setUsers(data.users.map(u => ({
          ...u,
          fullName: `${u.firstName} ${u.lastName}`,
          joinedAt: new Date(u.createdAt).toLocaleDateString(),
        })));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [page]);

  if (loading) return <div>Loading...</div>;
  if (error)   return <div>Error: {error}</div>;

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <img src={user.avatar} alt={user.fullName} />
          <h3>{user.fullName}</h3>
          <p>Joined: {user.joinedAt}</p>
        </div>
      ))}
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>Prev</button>
      <button onClick={() => setPage(p => p + 1)}>Next</button>
    </div>
  );
}
```

This component has at least five reasons to change: the API changes, the formatting logic changes, the error handling changes, the pagination behavior changes, or the UI design changes.

### The fix

Split by responsibility:

```tsx
// 1. Data fetching — one reason to change: API changes
function useUsers(page: number) {
  return useQuery({
    queryKey: ['users', page],
    queryFn: () => fetch(`/api/users?page=${page}`).then(r => r.json()),
  });
}

// 2. Data formatting — one reason to change: display format changes
function formatUser(user: RawUser): DisplayUser {
  return {
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
    joinedAt: new Date(user.createdAt).toLocaleDateString(),
  };
}

// 3. Pagination logic — one reason to change: pagination behavior changes
function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  return {
    page,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => p - 1),
    canGoBack: page > 1,
  };
}

// 4. Single user display — one reason to change: user card UI changes
function UserCard({ user }: { user: DisplayUser }) {
  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.fullName} />
      <h3>{user.fullName}</h3>
      <p>Joined: {user.joinedAt}</p>
    </div>
  );
}

// 5. Orchestration — one reason to change: how the pieces connect
function UserList() {
  const { page, nextPage, prevPage, canGoBack } = usePagination();
  const { data, isLoading, isError } = useUsers(page);

  if (isLoading) return <LoadingState />;
  if (isError)   return <ErrorState />;

  const users = data.users.map(formatUser);

  return (
    <div>
      {users.map(user => <UserCard key={user.id} user={user} />)}
      <Pagination onNext={nextPage} onPrev={prevPage} canGoBack={canGoBack} />
    </div>
  );
}
```

Now each piece has exactly one reason to change — and can be tested in complete isolation.

### Use cases

- Separating data fetching logic into custom hooks
- Extracting formatting and transformation utilities
- Keeping UI components purely presentational
- Isolating side effects from rendering logic

### Pros

- Each unit is independently testable
- Changes are isolated — modifying one concern doesn't risk breaking others
- Code is easier to navigate — you know exactly where to look for each concern

### Cons

- More files and more indirection
- Can feel like over-engineering for truly simple components
- Requires discipline to know where to draw the boundary

---

## O — Open/Closed Principle

### The principle

> Software entities should be **open for extension but closed for modification**.

You should be able to add new behavior without changing existing, working code. In frontend terms: extend through composition and configuration, not by editing internals.

### The violation

```tsx
// ❌ Every new button variant requires modifying this component
function Button({ variant, children }) {
  if (variant === 'primary') {
    return <button className="bg-blue-500 text-white px-4 py-2">{children}</button>;
  }
  if (variant === 'secondary') {
    return <button className="bg-gray-200 text-gray-800 px-4 py-2">{children}</button>;
  }
  if (variant === 'danger') {
    return <button className="bg-red-500 text-white px-4 py-2">{children}</button>;
  }
  // Adding "success", "ghost", "outline" all require editing this file
  return <button>{children}</button>;
}
```

Every new variant requires opening this file, adding another `if` branch, and risking a regression.

### The fix

```tsx
// ✅ New variants extend the config — the component itself never changes

const BUTTON_VARIANTS = {
  primary:   'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600',
  secondary: 'bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300',
  danger:    'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600',
  success:   'bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600',
  ghost:     'bg-transparent border border-gray-300 px-4 py-2 rounded hover:bg-gray-50',
} as const;

type ButtonVariant = keyof typeof BUTTON_VARIANTS;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

// This component never needs to change when new variants are added
function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`${BUTTON_VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Adding a new variant = adding one line to BUTTON_VARIANTS
// No component code changes needed
```

### OCP through composition

OCP is also expressed through the **component composition pattern** — instead of building every variation into a component, accept children and render props:

```tsx
// ❌ Closed: every layout variation requires editing the component
function Card({ showHeader, showFooter, title, content, actions }) {
  return (
    <div className="card">
      {showHeader && <div className="card-header">{title}</div>}
      <div className="card-body">{content}</div>
      {showFooter && <div className="card-footer">{actions}</div>}
    </div>
  );
}

// ✅ Open: any content can be composed in without touching the Card component
function Card({ header, children, footer }) {
  return (
    <div className="card">
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// Usage — fully extensible, Card never changes
<Card
  header={<h2>User Profile</h2>}
  footer={<Button>Save Changes</Button>}
>
  <ProfileForm user={user} />
</Card>
```

### Use cases

- Design system components (buttons, inputs, cards, modals)
- Layout wrappers that accept arbitrary content via `children`
- Feature flags as configuration, not conditionals
- Plugin or middleware systems

### Pros

- Existing, tested code stays untouched when extending
- New variants/behaviors don't risk breaking existing ones
- Encourages thinking in configurations and compositions

### Cons

- Requires anticipating extension points up front
- Over-abstraction risk — not everything needs to be open
- Configuration-driven components can become hard to trace

---

## L — Liskov Substitution Principle

### The principle

> Objects of a subtype should be **substitutable** for objects of their base type **without altering the correctness** of the program.

In React terms: if a component accepts a prop type or extends another component, it must honor the full contract of that base type. A consumer should be able to swap in a substituted variant without changing any of their own code.

### The violation

```tsx
// Base component — a standard anchor element
function Link({ href, children, onClick }) {
  return <a href={href} onClick={onClick}>{children}</a>;
}

// ❌ Subtype that silently breaks the contract
// This looks like a Link but doesn't navigate — it violates the substitution principle
function ExternalLink({ href, children }) {
  // Silently ignores onClick — breaks the base contract
  // Always opens in new tab — changes expected navigation behavior
  return (
    <a href={href} target="_blank">
      {children}
    </a>
  );
}

// Consumer code breaks when ExternalLink is substituted for Link
function Nav() {
  return (
    <Link href="/about" onClick={() => trackNavigation('about')}>
      About
    </Link>
    // Swapping to ExternalLink silently drops the onClick tracking
  );
}
```

### The fix

```tsx
// ✅ ExternalLink honors the full Link contract, then extends it
interface LinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

function Link({ href, children, onClick }: LinkProps) {
  return <a href={href} onClick={onClick}>{children}</a>;
}

// ExternalLink extends Link without breaking the contract
function ExternalLink({ href, children, onClick }: LinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    onClick?.(e);         // honor the base contract — call onClick if provided
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ExternalIcon aria-label="opens in new tab" />
    </a>
  );
}

// Now ExternalLink is a true substitute for Link — no behavior is silently dropped
```

### LSP and HTML element contracts

A common LSP violation in React is wrapping an HTML element but not spreading its native props — breaking the implicit contract of that element:

```tsx
// ❌ Violates LSP — consumers expect standard button behavior
// but cannot use disabled, type, aria attributes, etc.
function IconButton({ icon, onClick }) {
  return (
    <button onClick={onClick}>
      <Icon name={icon} />
    </button>
  );
}

// ✅ Honors the full button contract via prop spreading
function IconButton({
  icon,
  children,
  ...props  // spreads all standard button attributes — disabled, type, aria-*, etc.
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: string }) {
  return (
    <button {...props}>
      <Icon name={icon} />
      {children}
    </button>
  );
}

// Now all standard button behavior is preserved
<IconButton icon="trash" onClick={handleDelete} disabled={isDeleting} aria-label="Delete post" />
```

### Use cases

- Design system component hierarchies (Button → IconButton → LoadingButton)
- Custom input wrappers that must preserve native input behavior
- Any component that extends or wraps another — honor the full props contract
- Higher-order components and render props

### Pros

- Components are truly interchangeable — swap without surprises
- Consumers don't need to know which specific variant they're using
- Prevents silent behavior loss when composing components

### Cons

- Requires discipline when wrapping native elements
- Type contracts need to be explicit — easy to miss in untyped JavaScript
- Inheritance chains can become complex if not managed carefully

---

## I — Interface Segregation Principle

### The principle

> No module should be **forced to depend on interfaces it does not use**.

In React terms: don't pass props a component doesn't need. Fat prop interfaces create unnecessary coupling — changes to unused props can still force a component to re-render or be rewritten.

### The violation

```tsx
// ❌ One monolithic user object passed everywhere
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  role: string;
  billingAddress: Address;
  paymentMethods: PaymentMethod[];
  subscriptionTier: string;
  lastLoginAt: string;
  createdAt: string;
  preferences: UserPreferences;
}

// This component only needs id and avatarUrl — but depends on the entire User type
function UserAvatar({ user }: { user: User }) {
  return <img src={user.avatarUrl} alt={user.firstName} />;
}

// This component only needs firstName, lastName, role — but depends on the entire User type
function UserNameTag({ user }: { user: User }) {
  return <div>{user.firstName} {user.lastName} — {user.role}</div>;
}

// Now any change to User (e.g., adding a new billing field) forces review
// of every component that accepts User — even those that don't use it
```

### The fix

```tsx
// ✅ Each component declares only the props it actually needs

// Segregated interfaces — each component defines its own minimal contract
interface AvatarProps {
  avatarUrl: string;
  firstName: string; // for alt text only
}

interface NameTagProps {
  firstName: string;
  lastName: string;
  role: string;
}

interface BillingCardProps {
  billingAddress: Address;
  paymentMethods: PaymentMethod[];
}

function UserAvatar({ avatarUrl, firstName }: AvatarProps) {
  return <img src={avatarUrl} alt={firstName} />;
}

function UserNameTag({ firstName, lastName, role }: NameTagProps) {
  return <div>{firstName} {lastName} — {role}</div>;
}

// Composition — parent extracts and passes only what each child needs
function UserProfile({ user }: { user: User }) {
  return (
    <div>
      <UserAvatar avatarUrl={user.avatarUrl} firstName={user.firstName} />
      <UserNameTag
        firstName={user.firstName}
        lastName={user.lastName}
        role={user.role}
      />
    </div>
  );
}
```

### ISP and prop spreading caution

Prop spreading seems like a way to avoid ISP violations but can actually make them worse:

```tsx
// ❌ Spreading the whole user object hides what the component actually needs
function UserCard({ ...user }) {
  return <div>{user.firstName}</div>; // what else is in here? Nobody knows.
}

// ✅ Be explicit — document the contract
function UserCard({ firstName, role, avatarUrl }: Pick<User, 'firstName' | 'role' | 'avatarUrl'>) {
  return (
    <div>
      <img src={avatarUrl} alt={firstName} />
      <p>{firstName} — {role}</p>
    </div>
  );
}
```

### ISP applied to custom hooks

The same principle applies to hooks — don't return a fat object when the consumer only needs part of it:

```tsx
// ❌ Fat hook return — consumers are coupled to the entire interface
function useUser() {
  return { user, updateUser, deleteUser, resetPassword, uploadAvatar, ...rest };
}

// ✅ Segregated hooks — consumers depend only on what they use
function useUserProfile() { return { user, updateUser }; }
function useUserSecurity() { return { resetPassword }; }
function useUserAvatar()   { return { uploadAvatar }; }
```

### Use cases

- Design system components with clearly scoped prop interfaces
- Custom hooks that return only what their caller needs
- API response types — don't pass the full response where a subset is sufficient
- Context — split one large context into multiple focused contexts

### Pros

- Components are easier to test — minimal, predictable inputs
- Re-renders are minimized — components only update when their specific props change
- Interfaces are self-documenting — the props list tells you exactly what the component needs
- Changes to unrelated fields don't propagate unnecessarily

### Cons

- More prop-passing boilerplate at composition layer
- Requires designing interfaces up front rather than just passing objects
- Can lead to prop drilling if not managed with context or state management

---

## D — Dependency Inversion Principle

### The principle

> High-level modules should not depend on low-level modules. **Both should depend on abstractions**. Abstractions should not depend on details — details should depend on abstractions.

In React terms: components should depend on **interfaces** (prop contracts, hook signatures), not on **concrete implementations** (specific API clients, specific state libraries, specific services). This makes components portable, testable, and swappable.

### The violation

```tsx
// ❌ Component is tightly coupled to a specific implementation
// Fetching, authentication, and analytics are all hardcoded

import { supabase } from '@/lib/supabase';
import { mixpanel } from '@/lib/mixpanel';

function LoginForm() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    // Hardcoded to Supabase — cannot test without a real Supabase instance
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error(error);
      return;
    }

    // Hardcoded to Mixpanel — cannot test without Mixpanel
    mixpanel.track('user_logged_in', { email });

    navigate('/dashboard');
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} type="email" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

To test this component, you need a real Supabase connection and a real Mixpanel instance. Swapping Supabase for Firebase means editing the component directly.

### The fix

```tsx
// ✅ Component depends on abstractions — not on concrete services

// Define the abstraction (the interface)
interface AuthService {
  login: (email: string, password: string) => Promise<{ error?: string }>;
}

interface AnalyticsService {
  track: (event: string, properties?: Record<string, unknown>) => void;
}

// Component depends on the abstractions — not on Supabase or Mixpanel
interface LoginFormProps {
  authService: AuthService;
  analyticsService: AnalyticsService;
  onSuccess: () => void;
}

function LoginForm({ authService, analyticsService, onSuccess }: LoginFormProps) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = await authService.login(email, password);

    if (result.error) {
      setError(result.error);
      return;
    }

    analyticsService.track('user_logged_in', { email });
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500">{error}</p>}
      <input value={email} onChange={e => setEmail(e.target.value)} type="email" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" />
      <button type="submit">Login</button>
    </form>
  );
}

// Concrete implementations — depend on the abstraction, not the other way around
const supabaseAuthService: AuthService = {
  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  },
};

const mixpanelAnalyticsService: AnalyticsService = {
  track: (event, properties) => mixpanel.track(event, properties),
};

// In production
<LoginForm
  authService={supabaseAuthService}
  analyticsService={mixpanelAnalyticsService}
  onSuccess={() => navigate('/dashboard')}
/>

// In tests — inject a mock — no real services needed
const mockAuth: AuthService = {
  login: jest.fn().mockResolvedValue({}),
};
const mockAnalytics: AnalyticsService = {
  track: jest.fn(),
};

render(<LoginForm authService={mockAuth} analyticsService={mockAnalytics} onSuccess={onSuccess} />);
```

### DIP via custom hooks

Abstract the implementation behind a hook interface — swap the implementation without touching the component:

```tsx
// Abstraction — the hook contract
interface UseAuthReturn {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  user: User | null;
  isLoading: boolean;
}

// Concrete implementation — Supabase
function useSupabaseAuth(): UseAuthReturn { /* ... */ }

// Concrete implementation — Firebase
function useFirebaseAuth(): UseAuthReturn { /* ... */ }

// Component depends only on the hook interface
function Header() {
  const { user, logout } = useAuth(); // swap implementation without touching Header
  return (
    <header>
      {user ? <button onClick={logout}>Logout</button> : <Link to="/login">Login</Link>}
    </header>
  );
}
```

### DIP via Context

Context is one of the cleanest ways to apply DIP in React — inject the implementation at the top of the tree:

```tsx
// Define the abstraction
const AuthContext = createContext<AuthService | null>(null);

function useAuthService() {
  const service = useContext(AuthContext);
  if (!service) throw new Error('AuthService not provided');
  return service;
}

// Inject the concrete implementation at the app root — swap here, nowhere else
function App() {
  return (
    <AuthContext.Provider value={supabaseAuthService}>
      <Router>
        <Routes>...</Routes>
      </Router>
    </AuthContext.Provider>
  );
}

// In tests — inject a mock at the context level
render(
  <AuthContext.Provider value={mockAuthService}>
    <LoginForm />
  </AuthContext.Provider>
);
```

### Use cases

- Abstracting third-party services (auth, analytics, payments, logging)
- Making components testable without real API connections
- Building design systems that work across multiple data-fetching strategies
- Feature flags as injected services
- Swappable state management implementations

### Pros

- Components become fully testable in isolation — inject mocks
- Implementations are swappable — replace Supabase with Firebase without touching UI code
- Business logic is decoupled from infrastructure
- Teams can develop UI and backend in parallel against agreed interfaces

### Cons

- More upfront abstraction design required
- Prop injection can become verbose — Context or a DI container helps
- Can feel over-engineered for small applications where the implementation will never change

---

## All Five Principles Together

A well-designed component naturally satisfies all five:

```tsx
// A component that follows all SOLID principles:

// S — Single Responsibility
//     Only renders a user card. Data fetching is in useUser(). Formatting is in formatUser().

// O — Open/Closed
//     New action buttons extend via the `actions` prop — the card itself never changes.

// L — Liskov Substitution
//     Spreads all div props — fully substitutable for any standard div consumer.

// I — Interface Segregation
//     Accepts only the fields it actually uses — not the full User object.

// D — Dependency Inversion
//     Receives onFollow as an injected callback — not coupled to any specific follow service.

interface UserCardProps extends React.HTMLAttributes<HTMLDivElement> {
  firstName: string;   // I — only what's needed
  lastName: string;
  role: string;
  avatarUrl: string;
  actions?: React.ReactNode;         // O — open for extension
  onFollow?: () => void;             // D — injected behavior, not hardcoded
}

function UserCard({
  firstName,
  lastName,
  role,
  avatarUrl,
  actions,
  onFollow,
  ...divProps    // L — honors the full div contract
}: UserCardProps) {
  return (
    <div {...divProps}>
      <img src={avatarUrl} alt={`${firstName} ${lastName}`} />
      <h3>{firstName} {lastName}</h3>
      <p>{role}</p>
      {onFollow && <button onClick={onFollow}>Follow</button>}
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}
```

---

## SOLID Violations Cheat Sheet

| Symptom | Likely violation |
|---|---|
| Component does fetching, formatting, and rendering | **S** — Single Responsibility |
| Adding a feature requires editing an existing component | **O** — Open/Closed |
| Swapping a component variant breaks behavior silently | **L** — Liskov Substitution |
| Component receives a huge object but uses two fields | **I** — Interface Segregation |
| Component imports `supabase`, `axios`, or `mixpanel` directly | **D** — Dependency Inversion |
| Can't test a component without a real API connection | **D** — Dependency Inversion |
| Changing one prop type forces changes across many components | **I** — Interface Segregation |
| Every new variant adds an `if` branch inside the component | **O** — Open/Closed |

---

## Quick Reference Card

```
S — Single Responsibility
  ├─ Rule:    One reason to change per module
  ├─ Pattern: Separate hooks (fetching), utils (formatting), components (rendering)
  ├─ Signal:  "This component also handles X" → extract X
  └─ Test:    Can you test each concern in isolation?

O — Open/Closed
  ├─ Rule:    Extend via configuration and composition, not modification
  ├─ Pattern: Variant maps, children props, render props, slots
  ├─ Signal:  "I need to add an if-branch for a new variant" → externalize the config
  └─ Test:    Can you add a new variant without touching the component file?

L — Liskov Substitution
  ├─ Rule:    Subtypes must honor the full contract of their base type
  ├─ Pattern: Spread native element props (...props), forward refs, honor all callbacks
  ├─ Signal:  "This variant silently ignores onClick / disabled / aria-*" → violation
  └─ Test:    Can you swap this variant in without any consumer code changing?

I — Interface Segregation
  ├─ Rule:    Components depend only on props they actually use
  ├─ Pattern: Destructure specific fields, use Pick<T>, split fat hooks
  ├─ Signal:  "This component takes the whole User object but uses two fields" → trim it
  └─ Test:    Does the prop interface read like a description of what the component does?

D — Dependency Inversion
  ├─ Rule:    Depend on abstractions (interfaces, hooks) not concretions (Supabase, Axios)
  ├─ Pattern: Inject services via props or Context, define hook interfaces
  ├─ Signal:  "I have to mock Supabase to test this button" → invert the dependency
  └─ Test:    Can you test this component with pure mock objects and no network?
```

---

> SOLID principles are not rules to follow mechanically — they're lenses for identifying design problems. When a codebase becomes painful to change, one of these five principles is almost always being violated somewhere. Learn to recognize the symptoms, and you'll know exactly where to start refactoring.
