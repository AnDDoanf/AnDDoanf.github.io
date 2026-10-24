# AGENT.md — Developer & AI Agent Guidelines

This document provides comprehensive architectural context, design standards, content schemas, code conventions, and operational instructions for AI coding assistants (**Antigravity / Gemini**, **OpenAI Codex**, **Anthropic Claude**) and human developers working in this repository.

---

## 1. Project Overview & Architecture

This repository powers **AnDDoanf's personal website & digital garden** hosted on GitHub Pages:
- **Production URL**: [anddoanf.github.io](https://anddoanf.github.io)
- **Primary Features**:
  - **Portfolio & Resume**: About Me, Experience Timeline, Skill Cloud, Projects slider, and detail views.
  - **Blog & Journal**: Markdown-powered tech posts with KaTeX math rendering, search, tag filters, and syntax highlighting.
  - **Poetry**: Interactive flip pager book with mobile-friendly table-of-contents sheet.
  - **Mindmaps & Knowledge Graphs**: React Flow (`@xyflow/react`) and GoJS interactive learning trees.
  - **Genealogy (Gia Phả)**: Multi-generational interactive lineage trees, member directory, milestones timeline, and person detail modals.
  - **Infinite Gallery**: 2D pan/zoom canvas (`InfiniteGalleryCanvas`), photobook client, and masonry image carousels.
  - **Personal Vision Board & Q&A (`/me`)**: Core values, goals, and hobby highlights.

---

## 2. Technology Stack & Runtime

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16 (`16.1.6`) | App Router (`app/`), React 19 (`19.2.3`), Node.js >= 20 |
| **Output Target** | Static Export (`output: "export"`) | Zero server runtime; deployed to GitHub Pages (`out/` directory via `gh-pages`) |
| **Styling** | Vanilla CSS (Modular) | Custom CSS token design system in `styles/*.css`. Avoid adding Tailwind utility classes to existing components unless explicitly requested. |
| **Visualization** | `@xyflow/react` & `gojs` | Node/edge graphs for mindmaps and family genealogy trees |
| **Markdown / Math** | `gray-matter`, `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex` | Parsing markdown frontmatter and LaTeX math rendering |
| **Icons** | `bootstrap-icons` | Standard Bootstrap Icons (`bi bi-*`) exclusively for all navigation, controls, data tags, and UI elements |
| **Testing** | Node.js Test Runner (`node --test`) | Fast native unit tests in `scripts/*.test.mjs` |

---

## 3. Directory Layout

```
.
├── app/                      # Next.js App Router
│   ├── (with-nav)/           # Route group sharing primary navigation & breadcrumbs
│   │   ├── blog/             # Blog list & [slug] post pages
│   │   ├── gallery/          # Gallery canvas & photobook
│   │   ├── giapha/           # Genealogy tree & member records
│   │   ├── journal/          # Journal records
│   │   ├── mindmap/          # Interactive mindmaps & learning maps
│   │   ├── poetry/           # Poetry flip pager
│   │   ├── portfolio/        # Portfolio & project details
│   │   └── layout.tsx        # Layout mounting LeftNavbar, PageBreadcrumbs, TopRightControls
│   ├── me/                   # Personal vision & hobby views
│   ├── updating/             # Maintenance placeholder page
│   ├── layout.tsx            # Global RootLayout (I18nProvider, global styles, ScrollToTop)
│   ├── page.tsx              # Homepage hero, animated scripture typing, & nav links
│   └── utils/                # Server & build-time data loaders (getPostMetadata, mindmapGraph, etc.)
├── components/
│   ├── ui/                   # Universal shared UI kit (Card, Button, Nav, Controls, etc.)
│   ├── blog/                 # Blog post cards, TOC, meta headers, markdown renderer
│   ├── gallery/              # Infinite canvas, lightbox, image carousels
│   ├── giapha/               # Lineage nodes, modals, avatars, timeline views
│   ├── i18n/                 # I18nProvider, context, and useI18n hook
│   ├── me/                   # Vision board, hobby grids, video headings
│   ├── mindmap/              # React Flow and GoJS canvas wrappers
│   ├── poem/                 # Poem flip pager & TOC navigation
│   └── portfolio/            # Projects carousel, skill cloud, experience timeline
├── data/                     # Content sources (Markdown, JSON schemas, static assets)
│   ├── blog_posts/           # Markdown blog posts with YAML frontmatter
│   ├── i18n/                 # Translations (`en.json`, `vi.json`)
│   ├── mindmaps/             # Learning maps & family tree Markdown files
│   ├── poems/                # Poetry markdown files
│   └── portfolio/projects/   # Project showcase markdown files
├── docs/                     # Authoring documentation (mindmaps.md, vision-board.md)
├── scripts/                  # Helper scripts (sync-gallery-assets.mjs, *.test.mjs)
├── styles/                   # Modular CSS stylesheets (globals.css, portfolio.css, etc.)
└── public/                   # Static public assets, PDFs (Doan_Thuan_An_CV.pdf), images
```

---

## 4. Design System & Styling Conventions

### 4.1. Color Tokens & Multi-Theme Palette
- All theme tokens are declared in `styles/globals.css` using CSS custom properties (`--bg`, `--bg-alt`, `--text`, `--text-muted`, `--link`, `--shadow`, `--base03`..`--base3`).
- Themes are controlled via:
  - `data-palette="solarized|ocean|forest|rose|lavender|slate"` on `<html>`.
  - `data-theme="light|dark"` on `<html>`.
- Synchronized across tabs via `themeState.js` and localStorage.

### 4.2. Elevation Shadows over Raw Borders
- **Crucial Rule**: Use soft, multi-layered elevation shadows instead of heavy solid borders for cards, sidebars, mobile bars, and sheets.
- **Desktop Sidebar (`.left-nav`)**: Rightward multi-layer elevation shadow:
  ```css
  box-shadow: 10px 0 32px rgba(0, 0, 0, 0.15), 4px 0 12px rgba(0, 0, 0, 0.08);
  border-right: none;
  ```
- **Mobile Bottom Navigation Dock (`.left-nav`)**: Upward multi-layer elevation shadow:
  ```css
  box-shadow: 0 -10px 32px rgba(0, 0, 0, 0.15), 0 -4px 12px rgba(0, 0, 0, 0.08);
  border-top: none;
  ```
- In dark mode (`[data-theme="dark"]`), elevate shadows with darker alphas (`rgba(0, 0, 0, 0.75)` / `rgba(0, 0, 0, 0.5)`).

### 4.3. Navigation Patterns
- **PC Viewport (> 768px)**: Sticky left sidebar with icons and hover-expanding labels.
- **Mobile Viewport (<= 768px)**: Fixed bottom dock with enlarged icons (`1.7rem`), labels hidden, auto-hiding on scroll-down and reappearing on scroll-up/top.
- **Safe Area Insets**: Always account for mobile home indicators:
  ```css
  bottom: calc(4.75rem + env(safe-area-inset-bottom, 0px));
  ```

---

## 5. Reusable UI Kit (`components/ui`)

Always prefer components from [`components/ui`](file:///c:/code/AnDDoanf.github.io/AnDDoanf.github.io/components/ui) over custom or inline markup:

```javascript
import { Button, Card, TopRightControls, ScrollToTop, DownloadCV, PageBreadcrumbs, TypingText } from "@/components/ui";
```

### 5.1. `Card` Component (`components/ui/Card.jsx`)
Universal, polymorphic, data-driven card. Supports semantic tags (`article`, `div`, `section`, `a`) and automatic Link wrapping.

**Data Props Pattern (Recommended)**:
```jsx
<Card
  as="article"
  href="/blog/my-post"
  image="/data/assets/cover.png"
  eyebrow="Technology"
  title="Understanding React 19"
  description="A deep dive into Actions, useActionState, and Server Components."
  meta={{ icon: "bi-calendar", label: "Oct 2026", date: "2026-10-24" }}
  tags={["React", "Next.js"]}
  footerLeft="5 min read"
  footerRight="bi-arrow-up-right"
/>
```
> **Rule**: Pass data using props (`image`, `title`, `description`, `meta`, `footerLeft`, etc.) rather than manually repeating raw inner `.post-card-*` or `.ui-card-*` divs.

### 5.2. `Button` Component (`components/ui/Button.jsx`)
- **Variants**: `primary`, `secondary`, `outline`, `ghost`, `active-root`, `subtle`.
- **Sizes**: `xs`, `sm`, `md`, `lg`.
- **Icons**: `icon="bi-arrow-left"`, `iconPosition="left" | "right"`.
- **Link polymorphism**: Automatically renders Next.js `<Link>` or `<a>` when `href` is supplied, and enforces `aria-disabled` and click suppression when `disabled={true}`.

### 5.3. `TopRightControls` (`components/ui/TopRightControls.jsx`)
- Floating header container pairing `ThemeToggle` and `LanguageToggle`.
- Features directional scroll-fade (`is-hidden-on-scroll` on scroll down, visible on scroll up or at page top).

### 5.4. Global Floating Controls
- `ScrollToTop`: Mounted once in `RootLayout` (`app/layout.tsx`). **Do not duplicate** `<ScrollToTop />` inside individual page files.
- `DownloadCV`: Floats above the mobile dock and triggers on scroll.

---

## 6. Internationalization (i18n)

The site supports **English (`en`)** and **Vietnamese (`vi`)**:
- Managed by `I18nProvider` in `app/layout.tsx`.
- Consume in client components:
  ```javascript
  import { useI18n } from "@/components/i18n/I18nProvider";

  export default function MyComponent() {
    const { lang, locale, t, toggleLang } = useI18n();
    return <h1>{t("nav.home")}</h1>;
  }
  ```
- All translations reside in `data/i18n/en.json` and `data/i18n/vi.json`.
- When creating new routes, add their label key to `ROUTE_LABEL_KEYS` in [`components/ui/PageBreadcrumbs.jsx`](file:///c:/code/AnDDoanf.github.io/AnDDoanf.github.io/components/ui/PageBreadcrumbs.jsx) and define corresponding strings in `en.json` and `vi.json`.

---

## 7. Content Authoring & Data Schemas

### 7.1. Blog Posts (`data/blog_posts/*.md`)
Blog posts use YAML frontmatter:
```markdown
---
title: "Post Title"
date: 2026-10-24
category: tech            # "tech" | "journal" | "draft"
tags: [react, nextjs]
image: /assets/post-covers/sample.png  # Optional, fallback resolved automatically
author:
  name: An Doan
  link: https://anddoanf.github.io/
---

Post content in Markdown with optional KaTeX equations ($E = mc^2$ or $$block$$).
```
- **Drafts**: Posts with `category: draft` are excluded from production listings.
- **Naming**: `YYYY-MM-DD-slug-name.md`.

### 7.2. Portfolio Projects (`data/portfolio/projects/*.md`)
```markdown
---
title: "Project Name"
category: "Individual"    # "Individual" | "Company" | "OpenSource"
description: "English summary for card and header."
descriptionVi: "Vietnamese summary for card and header."
image: "/assets/projects/sample.png"
tags: ["Next.js", "TypeScript", "Tailwind CSS"]
links:
  live: "https://demo.example.com"    # Optional
  repo: "https://github.com/example"  # Optional
---

## Project Overview
Detailed write-up in markdown...
```

### 7.3. Poetry (`data/poems/*.md`)
```markdown
---
title: Tên bài thơ
date: 2026
---

Stanzas separated by double spaces for line breaks and blank lines for stanza breaks.
```

### 7.4. Gallery Assets & Sync Pipeline
- Place original photos, albums, and photobook media in `data/gallery/`.
- Run `npm run gallery:sync` (automatically executed before `npm run dev` and `npm run build`).
- Synchronizes media from `data/gallery/` into `public/gallery/` and sets up PDF.js workers for photobooks.

### 7.5. Mindmaps & Genealogy Data
- Learning maps: `data/mindmaps/learning/*.md` (see `docs/mindmaps.md` for node/edge schema).
- Genealogy trees: `data/mindmaps/family/*.md` and `data/giapha/*.json` for person records and timeline milestones.

---

## 8. State Management & React 19 Architecture

### 8.1. `useSyncExternalStore` for System & Viewport Stores
To avoid React 19 hydration mismatches between server-rendered HTML and client states:
- `themeState.js`: Synchronizes `palette` and `theme` from `document.documentElement.dataset`.
- `navState.js`: Synchronizes `isMobileViewport` via `window.matchMedia("(max-width: 768px)")`.
- Always provide a safe fallback snapshot function for SSR:
  ```javascript
  const isMobile = useSyncExternalStore(subscribeToMobileViewport, getIsMobileViewport, () => false);
  ```

### 8.2. Next.js 16 & React 19 Async Route Params
In Next.js 16 / React 19, `params` and `searchParams` are Promises:
```javascript
export async function generateMetadata({ params }) {
  const { slug } = await params;
  // load metadata...
}

export default async function Page({ params }) {
  const { slug } = await params;
  // render page...
}
```

### 8.3. Cross-Tab Storage Synchronization
Global theme and language changes trigger window `storage` event listeners so multiple open browser tabs remain synchronized automatically.

---

## 9. SEO, OpenGraph & Metadata Conventions

### 9.1. Dynamic Metadata Generation
Dynamic static routes implement `generateMetadata`:
```javascript
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostContent(slug);
  const title = post.data.title || slug.replaceAll("-", " ");
  const description = post.data.description || post.data.excerpt || "";

  return {
    title: `${title} | An Doan`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.data.date ? new Date(post.data.date).toISOString() : undefined,
      authors: post.data.author?.name ? [post.data.author.name] : ["An Doan"],
      tags: post.data.tags || [],
      images: post.data.image ? [{ url: post.data.image }] : [],
    },
  };
}
```

### 9.2. Semantic HTML & Accessibility
- Ensure exactly one `<h1>` per page.
- All interactive icon-only buttons must provide an explicit `aria-label` and `title`.
- All images must provide meaningful `alt` text or `aria-hidden="true"` if decorative.

---

## 10. Common Commands & Workflows

```bash
# 1. Start local dev server (pre-syncs gallery assets automatically)
npm run dev

# 2. Run unit tests (mindmap graph & vision graph integrity)
node --test scripts/mindmap-graph.test.mjs scripts/vision-graph.test.mjs

# 3. Synchronize gallery assets from data/gallery to public/
npm run gallery:sync

# 4. Build production static bundle (exports into out/)
npm run build

# 5. Deploy to GitHub Pages (builds, adds .nojekyll, and pushes to gh-pages branch)
npm run deploy
```

---

## 11. Naming Conventions

Maintain consistency across files, components, functions, and styles:

| Artifact | Convention | Example |
|---|---|---|
| **React Components** | `PascalCase.jsx` or `PascalCase.tsx` | `BlogPostCard.jsx`, `TopRightControls.jsx`, `TimelineNode.jsx` |
| **Utility Modules** | `camelCase.js` | `getPostMetadata.js`, `extractHeadings.js`, `galleryLoader.js` |
| **Scripts & Tests** | `kebab-case.mjs` | `sync-gallery-assets.mjs`, `mindmap-graph.test.mjs` |
| **Stylesheets** | `kebab-case.css` | `globals.css`, `portfolio.css`, `poetry.css` |
| **CSS Classes** | `kebab-case` with domain prefix | `.post-card`, `.ui-card`, `.ui-btn`, `.portfolio-section`, `.left-nav` |
| **Global Constants** | `UPPER_SNAKE_CASE` | `THEME_PAIRS`, `ROUTE_LABEL_KEYS`, `NAV_ITEMS` |
| **Markdown Content Files** | `kebab-case.md` (date-prefixed for posts) | `2026-09-15-dumbphobia-20-rl-techniques.md`, `pham-tree.md` |
| **i18n Keys** | `camelCase` with dot notation | `nav.home`, `portfolio.downloadCv`, `giapha.treeView` |
| **Component Props** | `camelCase` | `imageAlt`, `showArrow`, `footerRight`, `iconPosition` |

---

## 12. Code Style & Formatting Guidelines

### 12.1. JavaScript & React Guidelines
- **Indentation & Formatting**: 2 spaces, double quotes for strings/imports, semicolons at the end of statements.
- **Client vs Server Components**:
  - Add `"use client";` at the very top of any component using React hooks (`useState`, `useEffect`, `useSyncExternalStore`), browser APIs (`window`, `document`, `localStorage`), or interactive handlers (`onClick`, `onScroll`).
  - Keep route pages (`page.jsx`) as Server Components where static params or node filesystem calls (`fs.readFileSync`, `gray-matter`) are performed (`blog/[slug]/page.jsx`, `portfolio/[slug]/page.jsx`).
- **Imports Grouping & Ordering**:
  ```javascript
  // 1. React & Next.js built-ins
  import { useEffect, useState } from "react";
  import Link from "next/link";
  import Image from "next/image";

  // 2. Third-party packages
  import Prism from "prismjs";
  import matter from "gray-matter";

  // 3. Shared UI kit & providers
  import { Button, Card } from "@/components/ui";
  import { useI18n } from "@/components/i18n/I18nProvider";

  // 4. Domain components & local utilities
  import BlogPostMetaHeader from "@/components/blog/BlogPostMetaHeader";
  import getPostMetadata from "@/app/utils/getPostMetadata";

  // 5. Stylesheets (if imported per component/page)
  import "@/styles/poetry.css";
  ```
- **Component Structure**:
  - Single primary component per file exported as `default`.
  - Reusable sub-components attached as static properties where applicable (e.g., `Card.Cover = ...`, `Card.Body = ...`).
  - Provide JSDoc annotations specifying prop types for reusable UI components.
  - Avoid deeply nested anonymous JSX blocks; pass structured data via props (e.g. `<Card ...props />`).

### 12.2. CSS Guidelines
- **Domain-Organized CSS**: Place styles in the appropriate `styles/*.css` file instead of inlining large styles.
- **Variable Usage**: Always utilize CSS variables (`var(--bg)`, `var(--text)`, `var(--link)`) rather than hardcoding hex/rgb values.
- **Hover & Interaction States**: Pair hover effects with micro-transitions (`transition: transform 0.2s ease, box-shadow 0.2s ease`).

---

## 13. Git Commit & PR Format

Follow the **Conventional Commits** specification:

```
<type>(<scope>): <short imperative description>
```

### 13.1. Commit Types
- `feat`: A new user-facing feature or component (e.g., `feat(ui): add shared Card component`)
- `fix`: A bug fix (e.g., `fix(i18n): resolve locale alias for blog date formatting`)
- `style`: Visual styling, CSS adjustments, elevation shadows, spacing (no logic change)
- `refactor`: Code reorganization, component extraction, deduplication (no behavior change)
- `content`: Adding or updating markdown blog posts, poems, recipes, or JSON data
- `docs`: Documentation updates (`AGENT.md`, `README.md`, `docs/*.md`)
- `chore`: Maintenance, dependencies, or build scripts (`package.json`, `next.config.ts`)

### 13.2. Recognized Scopes
- `ui`: Shared UI kit components (`Card`, `Button`, `TopRightControls`, etc.)
- `nav`: Sidebar, mobile dock, breadcrumbs, navigators
- `portfolio`: Portfolio page, projects slider, timeline
- `blog`: Blog list, detail page, markdown rendering
- `poetry`: Poem pager, TOC drawer
- `gallery`: Infinite canvas, photobook, asset sync
- `giapha`: Genealogy tree, lineage nodes, member modal
- `mindmap`: Knowledge graphs, learning trees
- `i18n`: Translations and language switcher
- `theme`: Theme switcher and palette system

### 13.3. Subject Line Rules
- Use imperative present tense: `"add"`, `"update"`, `"fix"` (NOT `"added"`, `"updating"`, `"fixes"`).
- Lowercase start; do not end with a period.
- Keep commits focused and atomic (split large tasks into logical commits).

---

## 14. Troubleshooting & Critical Guardrails for AI Agents

1. **Static Export Guardrail**:
   - `nextConfig.output === "export"`.
   - Never use Next.js API routes (`app/api/*`), dynamic SSR headers (`next/headers`), server-only cookies, or server middleware. All content must compile to static HTML/CSS/JS.
   - External images require `unoptimized: true` (already configured globally in `next.config.ts`).
2. **GitHub Pages `.nojekyll`**:
   - GitHub Pages ignores directories starting with an underscore (such as `_next/`) by default unless a `.nojekyll` file exists in the root of the published branch. The deploy script handles this automatically:
     ```bash
     npm run build && node -e "require('fs').writeFileSync('out/.nojekyll','')" && gh-pages -d out --no-history
     ```
3. **Component Reuse over Boilerplate**:
   - Never write one-off cards, button anchors, or navigation toggles from scratch. Use `@/components/ui` (`Card`, `Button`, `TopRightControls`).
4. **No Duplicate Singletons**:
   - Never add `<ScrollToTop />` to subpages; it is mounted once globally in `app/layout.tsx`.
5. **High-Performance Scroll Listeners**:
   - Always pass `{ passive: true }` to `window.addEventListener("scroll", handler, { passive: true })` to prevent jank on mobile viewports.
6. **Preserve Documentation & Comments**:
   - Do not remove existing docstrings, explanatory comments, or bilingual translation keys when editing files.
7. **Aesthetics & Motion**:
   - Maintain sleek, premium aesthetics: subtle transitions (`0.2s ease`), rounded corners (`1rem`), glassmorphism blur where appropriate, and clean elevation shadows instead of hard borders.
8. **Windows & Git Line-Ending Safety**:
   - The primary development OS is Windows. Be mindful of CRLF/LF line ending matching when applying edits.
   - Always verify `git status` before finishing a task.
