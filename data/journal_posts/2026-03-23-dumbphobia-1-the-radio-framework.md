---
title: DumbPhobia#1 The RADIO Framework
date: 2026-03-23
tags: [frontend, system]
---

# The RADIO Framework: A Structured Approach to Frontend System Design Interviews

> Frontend system design interviews are notoriously open-ended. RADIO is a battle-tested framework that gives you a repeatable structure to tackle any frontend design problem with clarity and confidence.

---

## What is RADIO?

RADIO is an acronym for the five phases of answering a frontend system design question:

| Letter | Phase | What you do |
|---|---|---|
| **R** | Requirements clarification | Define the scope and constraints |
| **A** | Architecture | Sketch the high-level system structure |
| **D** | Data model | Define the data your app will work with |
| **I** | Interface definition | Design the API between components and server |
| **O** | Optimizations | Identify performance and UX improvements |

Instead of jumping straight into implementation details, RADIO forces you to think like a senior engineer — understanding the problem fully before proposing solutions.

---

## Why RADIO?

Frontend system design questions are intentionally vague. An interviewer might say:

> *"Design a news feed like Twitter/X."*
> *"Build an autocomplete search bar."*
> *"Design a photo sharing app like Instagram."*

Without a framework, most candidates either:
- Start coding immediately without clarifying scope
- Talk about random performance tips with no structure
- Forget entire dimensions of the problem (accessibility, error states, offline support)

RADIO gives you a mental checklist to cover every dimension systematically, shows the interviewer you think in systems, and keeps the conversation organized.

---

## R — Requirements Clarification

The first and most critical phase. Never skip this. Asking the right questions upfront separates senior engineers from junior ones.

### What to clarify

**Functional requirements** — what the product actually does:
- What are the core features? Which are in scope vs. out of scope?
- Who are the users? What devices do they use?
- What's the expected scale? (users, data volume, request frequency)

**Non-functional requirements** — the quality attributes:
- Performance targets (LCP, TTI, INP thresholds)
- Availability requirements (offline support?)
- Accessibility requirements (WCAG compliance level?)
- Internationalization (multiple languages, RTL support?)
- Authentication and authorization model?

### Example — "Design a news feed"

```
Questions to ask:
✓ Is this a social feed (personalized) or a topic-based feed?
✓ Do users create posts or just consume them?
✓ Should the feed update in real time or on refresh?
✓ Do we need to support images, video, or just text?
✓ What's the target device — mobile-first or desktop?
✓ Is infinite scroll or paginated navigation expected?
✓ Do we need offline support?
```

### Output of this phase

A scoped problem statement you can reference throughout the interview:

> *"We're building a personalized social news feed that supports text and image posts, infinite scrolling, real-time updates via WebSocket, and needs to be mobile-first with a target LCP under 2.5 seconds."*

**Pros of doing this well:**
- Prevents wasted time designing the wrong thing
- Demonstrates product thinking alongside technical thinking
- Gives you constraints that justify your later decisions

**Common mistakes:**
- Accepting the vague prompt at face value and jumping to solutions
- Asking too many questions — focus on the ones that will genuinely change your design
- Forgetting non-functional requirements entirely

---

## A — Architecture

Now sketch the high-level structure of the system. This is where you identify the major components and how they interact.

### What to cover

- **Rendering strategy** — SSG, SSR, CSR, ISR, or Partial Pre-Rendering?
- **Component breakdown** — what are the major UI sections?
- **Data flow** — where does data come from and how does it move through the app?
- **Client-server boundary** — what lives on the client vs. server?
- **Infrastructure** — CDN, caching layers, WebSocket servers, etc.

### Rendering strategy decision

Choosing the right rendering strategy is the first architectural decision and should be justified:

```
News feed posts      → SSR (personalized, can't be pre-built)
User profile pages   → SSG + ISR (mostly static, occasionally updated)
Chat sidebar         → CSR (real-time, highly interactive)
Landing/marketing    → SSG (purely static, max performance)
```

### Component architecture diagram

For a news feed, the high-level architecture might look like:

```
┌─────────────────────────────────────┐
│              Client                  │
│                                      │
│  ┌──────────┐    ┌────────────────┐  │
│  │  NavBar  │    │   Feed Shell   │  │
│  └──────────┘    │                │  │
│                  │  ┌──────────┐  │  │
│  ┌──────────┐    │  │ PostCard │  │  │
│  │ Sidebar  │    │  ├──────────┤  │  │
│  │  (CSR)   │    │  │ PostCard │  │  │
│  └──────────┘    │  ├──────────┤  │  │
│                  │  │ PostCard │  │  │
│                  │  └──────────┘  │  │
│                  └────────────────┘  │
└──────────────────────────────────────┘
          │                │
     REST API          WebSocket
          │                │
┌─────────────────────────────────────┐
│              Server                 │
│  ┌──────────┐    ┌────────────────┐ │
│  │ API GW   │    │  Feed Service  │ │
│  └──────────┘    └────────────────┘ │
│  ┌──────────┐    ┌────────────────┐ │
│  │   CDN    │    │   DB / Cache   │ │
│  └──────────┘    └────────────────┘ │
└─────────────────────────────────────┘
```

### Output of this phase

A diagram or verbal description of:
- The major UI components and how they're composed
- The chosen rendering strategy with justification
- The client-server communication pattern (REST, GraphQL, WebSocket)
- Any infrastructure pieces (CDN, cache layer)

**Pros of doing this well:**
- Shows system-level thinking, not just component-level thinking
- Gives you a map to refer back to throughout the interview
- Lets you justify later decisions (e.g., "because we chose SSR here, we need rehydration...")

**Common mistakes:**
- Going too deep into one component before sketching the whole system
- Choosing a rendering strategy without explaining why
- Forgetting about infrastructure (CDN, caching) entirely

---

## D — Data Model

Define the data your application will work with — both the shape of entities and how state is managed on the client.

### What to cover

- **Entities** — what are the core data objects?
- **Relationships** — how do they relate to each other?
- **Client state** — what lives in memory vs. on the server?
- **State management strategy** — local state, global store, server state (React Query)?

### Entity design — news feed example

```typescript
// Core entities
interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  followersCount: number;
}

interface Post {
  id: string;
  authorId: string;
  content: string;
  imageUrls: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  isLikedByCurrentUser: boolean;
}

interface FeedPage {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}
```

### Client state breakdown

Not everything belongs in the same state layer:

```
Server state (React Query)
  └─ Feed posts          — fetched, cached, paginated
  └─ User profiles       — fetched on demand
  └─ Notifications       — polled or pushed via WebSocket

Global UI state (Zustand / Context)
  └─ Current user session
  └─ Theme preference
  └─ Unread notification count

Local component state (useState)
  └─ Is compose modal open?
  └─ Input field value
  └─ Dropdown open/closed
```

### Essential state principle

Apply the essential state principle — only store the minimum data needed to derive the full UI. Derived values should be computed, not stored:

```typescript
// ❌ Don't store derived values
const [posts, setPosts] = useState([]);
const [postCount, setPostCount] = useState(0); // derived from posts.length
const [hasMore, setHasMore] = useState(true);  // derived from nextCursor

// ✅ Store only essentials, derive the rest
const [posts, setPosts] = useState([]);
const [nextCursor, setNextCursor] = useState<string | null>(null);
const postCount = posts.length;       // derived
const hasMore = nextCursor !== null;  // derived
```

**Pros of doing this well:**
- Shows you think about data architecture, not just UI
- Demonstrates knowledge of server state vs. client state distinction
- Catches over-engineering early

**Common mistakes:**
- Storing everything in one global state blob
- Not distinguishing between server state and UI state
- Forgetting about relationships between entities (e.g., posts need to know if the current user liked them)

---

## I — Interface Definition

Define the contracts between your frontend and backend — the API endpoints, request/response shapes, and real-time communication protocols.

### What to cover

- **REST endpoints** or **GraphQL queries/mutations**
- **Request parameters** — filters, pagination, sorting
- **Response shapes** — what data is returned
- **Real-time interfaces** — WebSocket events if applicable
- **Error handling contracts** — what errors can the API return?

### REST API design — news feed example

```
GET /api/feed
  Query params:
    cursor?: string       // for cursor-based pagination
    limit?: number        // default 20
  Response:
    {
      posts: Post[],
      nextCursor: string | null,
      hasMore: boolean
    }

GET /api/posts/:postId
  Response: Post

POST /api/posts
  Body: { content: string, imageUrls?: string[] }
  Response: Post

POST /api/posts/:postId/like
  Response: { likesCount: number, isLiked: boolean }

DELETE /api/posts/:postId/like
  Response: { likesCount: number, isLiked: boolean }
```

### WebSocket events — real-time feed updates

```typescript
// Events the server sends to the client
type ServerEvent =
  | { type: 'NEW_POST';        payload: Post }
  | { type: 'POST_LIKED';      payload: { postId: string; likesCount: number } }
  | { type: 'POST_DELETED';    payload: { postId: string } }
  | { type: 'NOTIFICATION';    payload: Notification };

// Events the client sends to the server
type ClientEvent =
  | { type: 'SUBSCRIBE_FEED';  payload: { userId: string } }
  | { type: 'PING' };
```

### GraphQL alternative

If using GraphQL instead of REST:

```graphql
query GetFeed($cursor: String, $limit: Int = 20) {
  feed(cursor: $cursor, limit: $limit) {
    posts {
      id
      content
      likesCount
      isLikedByCurrentUser
      author {
        id
        username
        avatarUrl
      }
    }
    nextCursor
    hasMore
  }
}

mutation LikePost($postId: ID!) {
  likePost(postId: $postId) {
    likesCount
    isLiked
  }
}
```

**Pros of doing this well:**
- Shows you can think across the full stack
- Lets you identify over-fetching or under-fetching early
- Demonstrates knowledge of pagination strategies (cursor vs. offset)

**Common mistakes:**
- Designing APIs that over-fetch (returning entire user objects when only name and avatar are needed)
- Forgetting pagination entirely
- Not defining error response shapes
- Ignoring real-time requirements discovered in the Requirements phase

---

## O — Optimizations

The final phase — layer in performance improvements, resilience patterns, and UX enhancements. By now you've earned the right to talk about these because they're grounded in the actual design.

### Performance optimizations

**Rendering performance:**
```
Virtualize the feed list          → react-virtual / react-window
                                     (only mount visible posts, unmount the rest)

Memoize PostCard component        → React.memo
                                     (prevent re-renders when parent updates)

Lazy load images                  → loading="lazy" or Intersection Observer
                                     (defer off-screen images)

Lazy load heavy components        → React.lazy + Suspense
                                     (compose modal, full-screen image viewer)
```

**Network performance:**
```
Cache feed data with staleTime    → React Query (5 min stale time for feed)
Debounce search input             → 300ms debounce before API call
Prefetch next page                → useInfiniteQuery prefetchNextPage
CDN for static assets             → images, fonts, JS bundles
Brotli compression                → content negotiation in HTTP headers
```

**Bundle performance:**
```
Bundle splitting by route         → Webpack / Vite code splitting
Tree shaking                      → remove unused library code
Critical CSS inlining             → above-the-fold styles in <head>
```

### UX & resilience optimizations

**Optimistic updates:**
```jsx
// Like a post — show the result immediately, roll back on failure
const [optimisticLiked, toggleOptimistic] = useOptimistic(
  post.isLikedByCurrentUser,
  (current) => !current
);
```

**Error handling:**
```
Network errors        → Retry with exponential backoff (React Query retries: 3)
Render errors         → Error boundaries per feed section
Empty states          → Thoughtful empty state UI, not blank screens
Stale data            → Background refetch on window focus (React Query default)
```

**Offline support:**
```
Service Worker        → Cache static assets and last-seen feed
IndexedDB             → Persist draft posts while offline
Optimistic queue      → Queue mutations, replay when back online
```

**Accessibility:**
```
ARIA live regions     → Announce new posts to screen readers
Focus management      → Trap focus in modals
Keyboard navigation   → Full keyboard support for actions
Reduced motion        → Respect prefers-reduced-motion for animations
```

**Pros of doing this well:**
- Shows you know not just how to build, but how to build *well*
- Demonstrates awareness of real-world constraints (slow networks, accessibility, errors)
- Ties back to requirements — optimizations justify themselves by the targets you set in phase R

**Common mistakes:**
- Leading with optimizations before establishing the baseline design
- Optimizing for things not in scope (e.g., talking about SSG optimizations for a real-time app)
- Forgetting UX optimizations (error states, empty states, loading states)

---

## Putting It All Together

Here's how a full RADIO interview response flows for *"Design a news feed"*:

```
R — Requirements (~5 min)
    "Let me clarify the scope before jumping in..."
    → Personalized feed, text + images, infinite scroll,
      real-time updates, mobile-first, LCP < 2.5s

A — Architecture (~8 min)
    "At a high level, the system looks like this..."
    → SSR for initial load, CSR for real-time updates,
      component breakdown, CDN + WebSocket layer

D — Data model (~5 min)
    "The core entities are Post and User, structured like..."
    → Entity shapes, client state layers,
      essential state principle applied

I — Interface (~7 min)
    "The API contracts between client and server..."
    → REST endpoints with cursor pagination,
      WebSocket event schema

O — Optimizations (~5 min)
    "Given our LCP target, here are the key improvements..."
    → List virtualization, lazy loading, React Query caching,
      optimistic updates, error boundaries, a11y
```

**Total: ~30 minutes** — a well-paced system design interview.

---

## RADIO vs. Improvising

| | Without RADIO | With RADIO |
|---|---|---|
| **Coverage** | Random, incomplete | Systematic, thorough |
| **Justification** | "I'd use React Query" | "Given our real-time requirement from phase R, React Query with WebSocket integration fits here" |
| **Confidence** | Trails off under pressure | Checkpoints keep you on track |
| **Interviewer signal** | Unclear seniority level | Clear senior-level systems thinking |
| **Optimizations** | Mentioned randomly | Grounded in requirements and design decisions |

---

## Quick Reference Card

```
R  Requirements
   ├─ Functional:     core features, user types, scale
   └─ Non-functional: performance, a11y, i18n, offline, auth

A  Architecture
   ├─ Rendering strategy (SSG / ISR / SSR / CSR / PPR)
   ├─ Component breakdown
   ├─ Data flow diagram
   └─ Infrastructure (CDN, WebSocket, cache)

D  Data model
   ├─ Core entities and relationships
   ├─ Client state layers (local / global / server)
   └─ Essential state (minimize, derive the rest)

I  Interface
   ├─ REST endpoints or GraphQL schema
   ├─ Pagination strategy (cursor vs. offset)
   ├─ WebSocket event contracts
   └─ Error response shapes

O  Optimizations
   ├─ Rendering:  virtualization, memoization, lazy loading
   ├─ Network:    caching, debounce, prefetch, CDN, compression
   ├─ Bundle:     splitting, tree shaking, critical CSS
   ├─ UX:         optimistic updates, empty/error/loading states
   └─ A11y:       ARIA, focus management, keyboard nav
```

---

> RADIO isn't a rigid script — it's a thinking tool. The phases naturally overlap and loop back. A good interviewer will push you deeper on any phase; RADIO ensures you've laid the groundwork to answer confidently from every angle.