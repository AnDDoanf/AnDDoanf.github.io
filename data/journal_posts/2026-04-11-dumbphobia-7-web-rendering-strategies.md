---
title: "Web Rendering Strategies"
date: 2026-04-11
tags: [frontend, rendering]
---

> Choosing the wrong rendering strategy is one of the most expensive architectural mistakes you can make — it affects performance, SEO, infrastructure cost, and developer experience. Here's everything you need to know to choose the right one.

---

## What is a Rendering Strategy?

A rendering strategy defines **where and when** your HTML is generated. Every web application has to answer:

- Where does the HTML come from — the server, the client, or a CDN?
- When is it generated — at build time, at request time, or in the browser?

The answer to those two questions determines your performance characteristics, your infrastructure requirements, and the kinds of content your app can support.

There are five major strategies in modern frontend development:

| Strategy | Full Name | Where | When |
|---|---|---|---|
| **SSG** | Static Site Generation | Server (build) | Build time |
| **ISR** | Incremental Static Regeneration | Server (build + runtime) | Build time + on demand |
| **SSR** | Server-Side Rendering | Server (runtime) | Each request |
| **CSR** | Client-Side Rendering | Browser | Runtime |
| **PPR** | Partial Pre-Rendering | Server + Browser | Build time + Runtime |

---

## The Critical Rendering Path — A Quick Baseline

Before comparing strategies, it helps to understand what the browser is doing. To show a pixel on screen, the browser must:

```
HTML received → Parse DOM → Fetch CSS/JS → Build CSSOM → Render tree → Paint
```

Every rendering strategy is essentially an optimization of *when* and *how much* of this work is done ahead of time. The more pre-work done before the user's request, the faster the first paint.

---

## 1. SSG — Static Site Generation

### How it works

The entire application is rendered to HTML **at build time** — before any user requests it. The resulting static HTML files are deployed to a CDN and served instantly to any user anywhere in the world.

```
Build time:
  Source code + data → [Build process] → Static HTML/CSS/JS files → CDN

Request time:
  User requests page → CDN serves pre-built HTML → Browser displays instantly
```

### Implementation (Next.js)

```typescript
// Page is generated at build time
export default function BlogPost({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}

// Tell Next.js which paths to pre-render
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(post => ({ slug: post.slug }));
}

// Fetch data at build time
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return { title: post.title };
}
```

### Performance profile

```
First Contentful Paint (FCP)    → Excellent — HTML is pre-built and CDN-cached
Time to First Byte (TTFB)       → Excellent — served from edge, no server processing
Largest Contentful Paint (LCP)  → Excellent — content is in the initial HTML
Interaction to Next Paint (INP) → Depends on client-side JS hydration
Time to Interactive (TTI)       → Depends on JS bundle size
```

### Use cases

- Marketing and landing pages
- Documentation sites (like React docs, MDN)
- Blogs and editorial content
- Product listing pages where content changes infrequently
- Portfolio sites

### Pros

- **Fastest possible load time** — HTML is pre-built and edge-cached
- **No server required** — can deploy to any static host (Vercel, Netlify, GitHub Pages, S3)
- **Infinitely scalable** — CDN handles all traffic, no origin server under load
- **Excellent SEO** — full HTML in the initial response, no JS required for crawlers
- **Maximum reliability** — no runtime failures, no database timeouts

### Cons

- **Stale content** — data is baked in at build time; changing it requires a rebuild
- **Long build times** at scale — thousands of pages means a slow build pipeline
- **Not suitable for personalized content** — everyone gets the same HTML
- **No access to request-time data** — can't read cookies, headers, or user sessions at render time

### When to use SSG

```
✓ Content changes rarely (daily or less)
✓ Content is the same for every user (not personalized)
✓ Maximum performance and SEO are the top priorities
✓ You want to minimize infrastructure costs
✗ Content changes frequently (use ISR or SSR instead)
✗ Content is user-specific or personalized
```

---

## 2. ISR — Incremental Static Regeneration

### How it works

ISR extends SSG by adding the ability to **regenerate individual static pages after deploy** without rebuilding the entire site. Pages are still served from a CDN cache, but the cache is invalidated and regenerated on a schedule or on demand.

```
Build time:
  Source code + data → Static HTML files → CDN

Request time (cache hit):
  User requests page → CDN serves cached HTML → (background: check if stale)

Request time (cache miss or stale):
  User requests page → CDN serves old cached HTML → Server regenerates → CDN updates cache
```

The key behavior: the first user after expiry still gets the old page (stale-while-revalidate), while the new version is being generated in the background. The next user gets the fresh version.

### Implementation (Next.js)

```typescript
// Revalidate this page every 60 seconds
export const revalidate = 60;

export default function ProductPage({ product }) {
  return (
    <main>
      <h1>{product.name}</h1>
      <p>Price: ${product.price}</p>
      <p>Stock: {product.stock}</p>
    </main>
  );
}

// On-demand revalidation — trigger from a webhook or CMS
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const { path, secret } = await request.json();
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

### Time-based vs. on-demand revalidation

| Mode | How it works | Best for |
|---|---|---|
| **Time-based** | Page regenerates after N seconds | Acceptable staleness, no CMS integration |
| **On-demand** | Webhook triggers regeneration on content change | CMS-driven content, zero acceptable staleness |

### Performance profile

```
First Contentful Paint (FCP)    → Excellent — still served from CDN cache
Time to First Byte (TTFB)       → Excellent — CDN edge serving
Largest Contentful Paint (LCP)  → Excellent
Data freshness                  → Good — stale-while-revalidate, up to N seconds stale
```

### Use cases

- E-commerce product pages (prices and stock change, but not per-request)
- News articles (publish once, rarely edited)
- CMS-driven content (regenerate on webhook from headless CMS)
- Event pages and listings
- Any SSG use case where content changes more than once a day

### Pros

- **Near-SSG performance** — still served from CDN cache
- **Fresh content without full rebuilds** — update one page without touching others
- **On-demand revalidation** — CMS webhooks trigger regeneration immediately
- **Scales like SSG** — CDN absorbs traffic, not your origin server

### Cons

- **Stale-while-revalidate behavior** — first user after expiry gets old content
- **More complex than SSG** — requires understanding of cache invalidation
- **Still not suitable for personalized content**
- **On-demand revalidation requires a server endpoint** — not purely static anymore
- **Revalidation latency** — there's still a window where content is stale

### When to use ISR

```
✓ Content changes periodically (hourly, daily) but not per-request
✓ You want SSG performance but can't afford stale data for long
✓ You have a headless CMS with webhook support
✓ E-commerce catalog with frequently changing prices or inventory
✗ Content must be completely fresh on every request (use SSR)
✗ Content is personalized per user (use SSR or CSR)
```

---

## 3. SSR — Server-Side Rendering

### How it works

The HTML is generated **on the server for every incoming request**. The server fetches the latest data, renders the full HTML, and sends it to the client. The client receives a fully-formed page with real, up-to-date content.

```
Request time (every request):
  User requests page
    → Server receives request (reads cookies, headers, session)
    → Server fetches fresh data from database/API
    → Server renders HTML with that data
    → Server sends full HTML to client
    → Browser displays content
    → Client-side JS hydrates for interactivity
```

### Implementation (Next.js)

```typescript
// This component runs on the server on every request
export default async function Dashboard({ searchParams }) {
  // Access request-time data — user session, query params
  const session = await getSession();
  if (!session) redirect('/login');

  // Fetch fresh, personalized data
  const [user, feed, notifications] = await Promise.all([
    getUser(session.userId),
    getFeed(session.userId, searchParams.cursor),
    getNotifications(session.userId),
  ]);

  return (
    <main>
      <h1>Welcome back, {user.displayName}</h1>
      <NotificationBadge count={notifications.unread} />
      <NewsFeed posts={feed.posts} nextCursor={feed.nextCursor} />
    </main>
  );
}
```

### How SSR differs from SSG/ISR

```
SSG:  Build time  → data fetched once → HTML cached forever
ISR:  Build time  → data fetched once → HTML cached for N seconds
SSR:  Request time → data fetched fresh → HTML never cached (or short TTL)
```

### The hydration step

SSR sends pre-rendered HTML, which the user sees immediately. But the page is initially non-interactive — it's static HTML. React then downloads and runs the JavaScript bundle to **hydrate** the page, attaching event listeners and making it interactive.

```
User sees content (SSR HTML)   →  JS downloads  →  JS hydrates  →  Interactive
        |                                                                |
   ~100-300ms                                                     ~500-2000ms
   (fast, great FCP)                                          (depends on bundle size)
```

This gap between visible content and interactivity is called the **hydration gap** — a key SSR challenge.

### Performance profile

```
First Contentful Paint (FCP)    → Good — full HTML in first response
Time to First Byte (TTFB)       → Slower — server must process before responding
Largest Contentful Paint (LCP)  → Good — content in initial HTML
Time to Interactive (TTI)       → Depends on JS bundle and hydration time
Server load                     → High — every request hits the server
```

### Use cases

- Authenticated dashboards and user feeds
- Personalized pages (recommendations, account settings)
- Pages that require access to cookies, auth tokens, or session data
- Real-time or highly dynamic content
- E-commerce checkout and cart pages
- Search results pages

### Pros

- **Always fresh data** — fetched on every request, never stale
- **Access to request context** — cookies, headers, auth tokens, IP address
- **Full personalization** — every user gets their own rendered HTML
- **Good SEO** — full HTML in the initial response (unlike CSR)
- **No client-side data fetching waterfalls** — server fetches in parallel

### Cons

- **Slower TTFB** — server must do work before responding
- **High server load** — every page view hits the server
- **Hydration gap** — page is visually ready but not interactive until JS loads
- **Hydration errors** — server and client render must match exactly
- **Expensive to scale** — more traffic = more server capacity needed
- **Not CDN-cacheable by default** — dynamic responses can't be edge-cached

### When to use SSR

```
✓ Content is personalized per user
✓ You need access to cookies, auth tokens, or request headers
✓ Data changes on every request or must be completely fresh
✓ SEO matters AND content is dynamic
✗ Content is the same for all users (use SSG/ISR instead)
✗ Interactivity is more important than initial load (consider CSR)
✗ You can't afford server infrastructure (use SSG/ISR)
```

---

## 4. CSR — Client-Side Rendering

### How it works

The server sends a minimal HTML shell — essentially an empty `<div id="root">` — and the browser does all the rendering work. JavaScript downloads, executes, fetches data from APIs, and renders the UI entirely in the browser.

```
Request time:
  User requests page
    → Server sends empty HTML shell + JS bundle links
    → Browser downloads and parses HTML (sees blank page)
    → Browser downloads JS bundle
    → JavaScript executes, React initializes
    → React fetches data from API
    → React renders UI with data
    → User sees content
```

### Implementation

```tsx
// The HTML file the server sends
// <div id="root"></div>  ← this is all the server sends

// React takes over from here
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

// Data fetching happens client-side
function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard'),
  });

  if (isLoading) return <DashboardSkeleton />;
  return <DashboardLayout data={data} />;
}
```

### The CSR loading waterfall

CSR has an inherent sequential loading problem:

```
1. Request HTML         → receive empty shell
2. Download JS bundle   → wait for network
3. Parse and execute JS → CPU work
4. Fetch data from API  → wait for network again
5. Render UI            → user finally sees something
```

Each step blocks the next. On slow connections or low-end devices, this results in a significant delay before the user sees anything — the **white screen of death**.

### Performance profile

```
First Contentful Paint (FCP)    → Poor — blank screen until JS loads
Time to First Byte (TTFB)       → Excellent — server sends HTML immediately
Largest Contentful Paint (LCP)  → Poor — content requires JS execution + API call
Time to Interactive (TTI)       → Good — once rendered, already interactive
SEO                             → Poor — crawlers see empty HTML
Server load                     → Very low — server just serves static files
```

### Use cases

- Authenticated applications where SEO is not a concern (dashboards, admin tools, SaaS products behind login)
- Highly interactive, stateful UIs (rich text editors, design tools, data visualization dashboards)
- Applications with real-time data that updates constantly
- Internal tools and B2B applications
- Progressive Web Apps (PWAs)

### Pros

- **Simplest to develop** — no server-client boundary to reason about
- **Rich interactivity** — full client-side state management without hydration constraints
- **Minimal server infrastructure** — just a CDN for static files
- **Instant subsequent navigation** — client-side routing is seamless after initial load
- **No hydration issues** — rendering only happens once, on the client

### Cons

- **Worst initial load performance** — blank screen until JS executes
- **Poor SEO** — search crawlers typically see empty HTML
- **JavaScript-dependent** — broken experience if JS fails or is blocked
- **Data fetching waterfalls** — serial network requests compound delay
- **Large bundle sizes** hit users hard on slow connections

### When to use CSR

```
✓ Application is behind authentication (SEO irrelevant)
✓ Highly interactive UI where rich client-side state is needed
✓ Internal tools, dashboards, admin panels
✓ You want to minimize server infrastructure
✗ SEO is important (use SSG, ISR, or SSR instead)
✗ First load performance is critical
✗ Users are on slow or unreliable networks
```

---

## 5. PPR — Partial Pre-Rendering

### How it works

PPR is the newest strategy, introduced in Next.js 14+. It combines the best of SSG and SSR on the same page: **static parts are pre-rendered and CDN-cached at build time, while dynamic holes are streamed from the server at request time**.

The browser receives a static HTML shell instantly from the CDN. The dynamic parts are streamed in as they become available — wrapped in `<Suspense>` boundaries.

```
Build time:
  Static shell → pre-rendered → CDN cached

Request time:
  User requests page
    → CDN serves static shell instantly (fast TTFB)
    → Server streams dynamic parts as they resolve
    → Browser progressively renders dynamic content
    → Full page interactive after hydration
```

```
Timeline:
  0ms    → CDN sends static shell (header, layout, skeleton UI)
  50ms   → Browser paints static content
  200ms  → Server resolves user data → streams personalized section
  400ms  → Server resolves feed data → streams feed content
  600ms  → All dynamic content loaded → page fully interactive
```

### Implementation (Next.js 14+)

```typescript
// Enable PPR for this route
export const experimental_ppr = true;

import { Suspense } from 'react';

// Static shell — pre-rendered at build time
export default function Page() {
  return (
    <main>
      {/* Static — pre-rendered, served from CDN instantly */}
      <Header />
      <HeroSection />
      <NavigationBar />

      {/* Dynamic — streamed from server at request time */}
      <Suspense fallback={<UserGreetingSkeleton />}>
        <UserGreeting />       {/* reads user session → dynamic */}
      </Suspense>

      <Suspense fallback={<FeedSkeleton />}>
        <PersonalizedFeed />   {/* reads user preferences → dynamic */}
      </Suspense>

      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations />    {/* ML recommendations → dynamic */}
      </Suspense>

      {/* Static — pre-rendered */}
      <Footer />
    </main>
  );
}

// This component runs dynamically on the server per request
async function UserGreeting() {
  const user = await getCurrentUser(); // reads cookies
  return <h2>Welcome back, {user.name}!</h2>;
}

// This component is pre-rendered at build time
function HeroSection() {
  return <div className="hero">Discover something new today</div>;
}
```

### How PPR compares to streaming SSR

PPR is often confused with **streaming SSR** — they're related but different:

| | Streaming SSR | PPR |
|---|---|---|
| Static shell source | Generated server-side per request | Pre-built, CDN-cached |
| TTFB | Depends on server | Near-instant (CDN) |
| Dynamic parts | Streamed from server | Streamed from server |
| Cacheability | Limited | Static shell is fully cached |

PPR gets the CDN caching benefits of SSG for the static shell, while streaming SSR still generates the shell server-side on each request.

### Performance profile

```
First Contentful Paint (FCP)    → Excellent — static shell from CDN instantly
Time to First Byte (TTFB)       → Excellent — CDN serves static shell
Largest Contentful Paint (LCP)  → Excellent (if LCP element is in static shell)
Time to Interactive (TTI)       → Good — hydration of streamed parts
Personalization                 → Full — dynamic holes are per-request
SEO                             → Excellent — full content eventually rendered
```

### Use cases

- High-performance e-commerce (static product layout, dynamic price/stock/recommendations)
- News and media platforms (static article, dynamic comments/reactions)
- Authenticated home feeds (static shell, dynamic personalized feed)
- Any page that has a mix of static and personalized content
- Applications where both maximum performance and personalization are required

### Pros

- **Best of SSG and SSR combined** — static speed + dynamic content
- **Instant static shell from CDN** — fastest possible perceived load
- **Progressive rendering** — content streams in as it's ready, no blank screen
- **Granular control** — decide per `<Suspense>` boundary what's static vs. dynamic
- **Great SEO** — content is server-rendered, not client-side JS

### Cons

- **Most complex strategy** — requires understanding of Suspense, streaming, and hydration
- **Framework-dependent** — currently Next.js 14+ only (experimental)
- **Suspense boundary design** — requires careful component architecture
- **Harder to test** — static and dynamic parts behave differently in tests
- **Debugging is harder** — interleaved static/dynamic rendering is non-trivial to trace

### When to use PPR

```
✓ Page has a clear mix of static layout and dynamic/personalized content
✓ Both performance (LCP) and personalization are non-negotiable
✓ You're using Next.js 14+ and willing to use experimental features
✓ E-commerce, media, or high-traffic authenticated apps
✗ Entirely static content (use SSG — simpler)
✗ Entirely dynamic/personalized content (use SSR — simpler)
✗ You need broad framework support beyond Next.js right now
```

---

## Comparing All Five Strategies

### Performance comparison

| Metric | SSG | ISR | SSR | CSR | PPR |
|---|---|---|---|---|---|
| **TTFB** | ⚡ Excellent | ⚡ Excellent | 🟡 Moderate | ⚡ Excellent | ⚡ Excellent |
| **FCP** | ⚡ Excellent | ⚡ Excellent | 🟢 Good | 🔴 Poor | ⚡ Excellent |
| **LCP** | ⚡ Excellent | ⚡ Excellent | 🟢 Good | 🔴 Poor | ⚡ Excellent |
| **TTI** | 🟡 Moderate | 🟡 Moderate | 🟡 Moderate | 🟢 Good | 🟡 Moderate |
| **INP** | 🟢 Good | 🟢 Good | 🟢 Good | 🟢 Good | 🟢 Good |

### Feature comparison

| Feature | SSG | ISR | SSR | CSR | PPR |
|---|---|---|---|---|---|
| **Fresh data** | ❌ Build time only | 🟡 Periodic / on-demand | ✅ Every request | ✅ Every request | ✅ Dynamic parts |
| **Personalization** | ❌ | ❌ | ✅ Full | ✅ Full | ✅ Dynamic parts |
| **SEO** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **CDN cacheable** | ✅ Full | ✅ Full | ❌ | ✅ Static files | ✅ Static shell |
| **Server required** | ❌ | 🟡 For revalidation | ✅ | ❌ | ✅ For dynamic parts |
| **Build time cost** | 🟡 High at scale | 🟢 Low | ✅ None | ✅ None | 🟢 Low |
| **Complexity** | 🟢 Low | 🟡 Medium | 🟡 Medium | 🟢 Low | 🔴 High |

---

## Decision Framework

Use this flowchart to choose the right strategy for any given page:

```
Is the content the same for every user?
│
├── YES → Does it change frequently?
│          │
│          ├── NO (rarely changes)
│          │    → SSG
│          │
│          └── YES (changes hourly/daily)
│               → ISR (time-based or on-demand)
│
└── NO (personalized per user)
     │
     ├── Does the page have a significant static layout?
     │    │
     │    ├── YES → Use PPR
     │    │         (static shell from CDN + dynamic parts streamed)
     │    │
     │    └── NO (mostly dynamic)
     │         → SSR
     │
     └── Is SEO required?
          │
          ├── YES → SSR (or PPR)
          │
          └── NO (behind auth, internal tool)
               → CSR
```

---

## Mixing Strategies in One Application

Modern frameworks let you choose a strategy **per page or per route** — and you should. A single app might use all five:

```
Marketing site      /               → SSG
Blog posts          /blog/:slug     → SSG
News articles       /news/:slug     → ISR (revalidate every 5 min)
Search results      /search         → SSR (query-dependent)
Product pages       /products/:id   → ISR (price/stock changes)
Checkout            /checkout       → SSR (cart + auth + real-time stock)
User dashboard      /dashboard      → PPR (static shell + dynamic feed)
Admin panel         /admin/*        → CSR (authenticated, SEO irrelevant)
Chat feature        /messages       → CSR (real-time, no SSR needed)
```

---

## Common Mistakes

**Defaulting to SSR for everything:**
SSR seems "safe" because it's always fresh, but it's expensive. Static or ISR pages serve faster at lower cost.

**Using CSR for public, SEO-sensitive pages:**
A public product page rendered entirely in JavaScript will never rank as well as a server-rendered equivalent.

**Ignoring the hydration gap in SSR:**
SSR gives you fast FCP but not fast TTI. A large JavaScript bundle means users see the page but can't interact with it for several seconds.

**Not using ISR when you should:**
Teams building with SSG often do full rebuilds when a single page changes. ISR eliminates this — only the affected page regenerates.

**Over-engineering with PPR too early:**
PPR is powerful but complex. If a page can be handled cleanly by SSR or SSG, use the simpler option.

---

## Quick Reference Card

```
SSG — Static Site Generation
  ├─ When:  Build time
  ├─ Where: CDN (fully cached)
  ├─ Data:  Fetched at build, baked into HTML
  ├─ Best:  Marketing, docs, blogs, public catalogs
  └─ Avoid: Personalized or frequently-changing content

ISR — Incremental Static Regeneration
  ├─ When:  Build time + background regeneration
  ├─ Where: CDN (cached with expiry)
  ├─ Data:  Refreshed periodically or on webhook
  ├─ Best:  E-commerce, CMS content, news articles
  └─ Avoid: Data that must be completely fresh per request

SSR — Server-Side Rendering
  ├─ When:  Every request
  ├─ Where: Origin server
  ├─ Data:  Fetched fresh on every request
  ├─ Best:  Auth pages, personalized dashboards, search
  └─ Avoid: High-traffic static content (use SSG/ISR)

CSR — Client-Side Rendering
  ├─ When:  In the browser after JS loads
  ├─ Where: Browser
  ├─ Data:  Fetched client-side via API calls
  ├─ Best:  Authenticated apps, admin tools, SPAs
  └─ Avoid: Public pages where SEO or FCP matters

PPR — Partial Pre-Rendering
  ├─ When:  Build time (shell) + request time (dynamic parts)
  ├─ Where: CDN (shell) + server (dynamic holes)
  ├─ Data:  Static content pre-baked, dynamic content streamed
  ├─ Best:  Mixed pages needing both speed and personalization
  └─ Avoid: Simple pages that fit cleanly into SSG or SSR
```

---

> No single rendering strategy wins across all dimensions. The best frontend architects don't pick one — they pick the right one for each route, based on the content's freshness requirements, personalization needs, SEO importance, and performance targets. That's the judgment that separates senior engineers from the rest.
