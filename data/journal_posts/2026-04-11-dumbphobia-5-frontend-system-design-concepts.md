---
title: "14 Essential Frontend System Design Concepts"
date: 2026-04-11
tags: [frontend, system]
---

> Whether you're prepping for a system design interview or just want to build faster, more scalable apps — these are the concepts that matter.

## 1. Web Rendering Strategies

Before anything else, decide how your application renders content. There are five main strategies:

| Strategy | How it works | Best for |
|---|---|---|
| **SSG** — Static Site Generation | Pages pre-built at build time | Fastest load; content that rarely changes |
| **ISR** — Incremental Static Regeneration | Updates static pages on demand, no full rebuild | Content that changes occasionally |
| **SSR** — Server-Side Rendering | Page generated fresh on each request | Dynamic, personalized content |
| **CSR** — Client-Side Rendering | Blank HTML shell loads first, then JS fetches and renders data | Highly interactive apps |
| **PPR** — Partial Pre-Rendering | Mix of pre-rendered static and dynamic content on the same page | High-performance pages with some dynamic regions |

Choosing the right strategy is the foundation everything else builds on.

---

## 2. Micro Frontends & Module Federation

As a frontend grows, deployments become riskier — larger codebases mean small changes can break more things. **Micro frontends** solve this by splitting the application into independent, separately deployable pieces.

Each micro frontend can have its own rendering strategy:
- Product pages → SSG
- Checkout → SSR
- Chat / live features → CSR

The key tool is **Webpack 5 Module Federation**, which dynamically loads different micro frontend applications into the same page at runtime. Teams can work, deploy, and scale independently.

---

## 3. Web Performance Metrics & Tools

Before optimizing, identify what's actually slow. Three main tools:

- **Chrome DevTools Performance Tab** — tracks First Contentful Paint (FCP) and Time to Interactive (TTI)
- **React DevTools Profiler** — shows which components re-render too often and where slowdowns occur
- **Datadog / Lighthouse / WebPageTest** — detailed breakdowns across different devices and network speeds

Measure first, then fix.

---

## 4. Memoization Hooks

One of the biggest performance killers in React is **unnecessary re-renders**. When a parent component re-renders, all its children re-render too — unless you prevent it.

| Hook | What it does |
|---|---|
| `React.memo` | Wraps a component so it only re-renders if props change |
| `useCallback` | Memoizes a function reference to prevent recreation on every render |
| `useMemo` | Caches the result of an expensive calculation |

```jsx
// Memoized component
const Chart = React.memo(({ data }) => <LineChart data={data} />);

// Memoized function
const handleClick = useCallback(() => doSomething(id), [id]);

// Memoized calculation
const total = useMemo(() => items.reduce((sum, i) => sum + i.price, 0), [items]);
```

Use Chrome DevTools and React Profiler to visually identify which components are causing unnecessary re-renders.

---

## 5. Lazy Loading

Loading too many components at once forces users to wait before seeing anything. **Lazy loading** defers components until they're actually needed:

```jsx
import { lazy, Suspense } from 'react';

const Analytics = lazy(() => import('./Analytics'));

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <Analytics />
    </Suspense>
  );
}
```

Instead of loading charts and analytics on startup, load them only when the user navigates to that section. This reduces initial bundle size and makes the app feel significantly faster.

---

## 6. Tree Shaking, Mobile Optimization & Accessibility

Additional performance improvements to layer in:

- **Tree shaking** — remove unused code from your JavaScript bundle at build time, reducing its size
- **Bundle splitting** — divide the bundle into smaller chunks for faster page loads
- **Skeleton screens / spinners / notifications** — show loading states to keep the UI feeling responsive
- **Mobile & accessibility optimization** — ensure the app works well on small screens and for all users

---

## 7. State Management for Reducing API Calls

Making too many redundant network requests slows down any application. **Client-side state management** can cache server responses so the same data doesn't need to be fetched repeatedly:

**Without caching:**
```
GET /trainings → render list
DELETE /training/1 → server updates
GET /trainings → fetch list again  ← redundant
```

**With state management cache:**
```
GET /trainings → store in cache → render from cache
DELETE /training/1 → update cache locally → no follow-up GET needed
```

After a mutation (add, update, delete), update the local cache directly instead of re-fetching. One important caveat: cached data can go **stale** if other users are modifying the same records. Set a cache expiration policy to periodically refresh.

---

## 8. API Caching with Expiration (React Query)

**React Query's `useQuery`** formalizes the caching + expiration pattern:

```jsx
const { data } = useQuery({
  queryKey: ['trainings'],
  queryFn: fetchTrainings,
  staleTime: 60 * 1000, // cache valid for 60 seconds
});
```

**Flow:**
1. Query fires → check if data exists in cache and is not expired
2. If valid → return cached data immediately (no network call)
3. If expired → fetch from server → store in cache → return fresh data

`staleTime` controls how long data is considered fresh before triggering a re-fetch. This dramatically cuts the number of API calls without sacrificing data freshness.

---

## 9. GraphQL for Reducing Over-Fetching

REST APIs often return more data than the client needs. **GraphQL** lets the client specify exactly which fields it wants:

```graphql
# Instead of fetching the full product object...
query {
  product(id: "1") {
    name
    price
    # skipping: stock, imageUrl, description, etc.
  }
}
```

Less data transferred = faster responses. The **Apollo Client** also includes built-in in-memory caching: if the same query fires again, Apollo checks the cache first before hitting the server.

---

## 10. Rate Limiting & Debouncing

Some user interactions (like search input) trigger a new API call on every keystroke — resulting in dozens of unnecessary requests per second. **Debouncing** waits until the user stops typing before firing the request:

```jsx
import { debounce } from 'lodash';

const fetchResults = debounce(async (query) => {
  const data = await api.search(query);
  setResults(data);
}, 500); // wait 500ms after last keystroke

<input onChange={(e) => fetchResults(e.target.value)} />
```

**Debounce** waits for a pause in events before executing. **Throttle** executes at a maximum rate (e.g., once per 500ms regardless of event frequency). Both can be applied on the client or server side.

---

## 11. Filters & Pagination

Sending all data from server to client at once is inefficient. Filtering and pagination limit what gets sent:

- **Filters** — let users narrow down results server-side before data is returned
- **Pagination** — break large datasets into pages, loading only what's needed

There are two pagination approaches, each with tradeoffs:

### Offset Pagination

```
GET /products?page=2&pageSize=10
```

Server uses SQL `OFFSET` and `LIMIT` to skip and take records.

**Pros:** Users can jump to any page; easy to show total page count.

**Cons:** If records are added or deleted between page loads, results can shift — causing duplicates or skipped items.

---

### Cursor Pagination

```
GET /products?cursor=1234&limit=10
```

The cursor is a unique sequential value (ID or timestamp). The server fetches records relative to that cursor position.

**Pros:** Stable — additions or deletions elsewhere don't affect the current window. More efficient for large datasets (jumps directly to the record).

**Cons:** Users can't jump to a specific page number; cursor must be unique and sequential.

---

## How It All Connects

```
Rendering Strategy        →  how content is delivered
  └─ Micro Frontends      →  how the app scales across teams

Measure Performance       →  find the bottlenecks first
  └─ Memoization          →  fix unnecessary re-renders
  └─ Lazy Loading         →  fix heavy initial bundle
  └─ Tree Shaking         →  reduce bundle size further

API & Data Efficiency     →  reduce network overhead
  └─ State Management     →  cache responses client-side
  └─ React Query          →  add expiration to cached data
  └─ GraphQL              →  fetch only what you need
  └─ Debounce / Throttle  →  reduce request frequency
  └─ Pagination           →  reduce response payload size
```

Each concept builds on the one before it. Start with the right rendering strategy, measure what's slow, then systematically reduce unnecessary work — both on the client and across the network.
