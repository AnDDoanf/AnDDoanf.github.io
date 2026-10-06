# Mindmaps

`/mindmap` lists Markdown files from the type folders in `data/mindmaps`:

```text
data/mindmaps/
  family-tree/
    doan-toc.md
  learning/
    learning-how-to-learn.md
```

The folder determines the map type. The optional frontmatter `type` must match
its folder. Filenames must be unique across both folders. Each filename becomes a
stable route, e.g. `learning-how-to-learn.md` → `/mindmap/learning-how-to-learn`.
The first supported types are `learning` and `family-tree`. The library supports
type filters and search; both types use the shared React Flow canvas.

## Learning maps

Both map types support `cover`, `coverAlt`, and `coverAltVi` in frontmatter.
The cover appears on the library card. Use a path under `public` (for example,
`/assets/projects/anhoc.png`) or a full HTTPS image URL.

Each learning node supports the same cover fields. Nodes without a cover use
a default illustration. Optional `href` links open a specific post, such as
`/journal/2026-09-15-dumbphobia-20-rl-techniques` or `/blog/<post-slug>`.
Use the complete published route; omit `href` for nodes without a linked post.
External HTTPS links are also supported. Links open through a “Read more” action
so the node can still be dragged without navigating away.

Use YAML or JSON frontmatter with `type`, `title`, `nodes`, and optional `edges`.
The Markdown body contains notes displayed below the canvas.

```yaml
---
type: learning
title: My learning map
titleVi: Sơ đồ học tập
description: Topics I am exploring.
nodes:
  - id: root
    label: Main topic
    labelVi: Chủ đề chính
    description: A short explanation.
  - id: practice
    label: Practice
    cover: /assets/projects/anhoc.png
    coverAlt: Learning application preview
    href: https://reactflow.dev/learn
edges:
  - source: root
    target: practice
---

## Notes

Add reading notes here.
```

Node IDs must be unique strings; edge endpoints must reference existing nodes.
Vietnamese translations are optional: omit `labelVi` or `descriptionVi` to use
the node's `label` or `description` in both languages. Empty translations also
fall back to the base text. Map `titleVi` and `descriptionVi`, and edge `labelVi`,
follow the same fallback rule.

Edges may have `id`, `label`, and `labelVi`. Nodes may have `descriptionVi` and
`position: { x: 100, y: 200 }`. Without saved positions, the map is automatically
laid out. Disconnected topics and additional cross-links are supported.
`contentVi` optionally provides translated notes in frontmatter.

Drag topics to rearrange them for the current visit. To publish a layout, edit
node positions in the matching file in `data/mindmaps` and rebuild.
The public static site does not write to the repository or save edits on a server.

## Family trees

Family maps refer to the existing records in `data/giapha`, keeping people,
relationships, timeline, and chronicle in one source:

```yaml
---
type: family-tree
title: Doan Clan Family Tree
titleVi: Gia phả họ Đoàn
treeId: doan-toc
---
```

`treeId` must match the `id` in a family record. Add a record using the existing
`data/giapha/doan-toc.md` schema, then add its map descriptor to `data/mindmaps/family-tree`.
The family page retains member search, person details, branch selection,
members by generation, and the chronicle. Spouses share a node; parent–child
relationships connect family nodes. Edit family records and chronicles in
`data/giapha` and rebuild to publish changes.

Existing `/tree/[slug]` links continue to work and use the same React Flow viewer.
The former Showroom routes have been removed. Project images are maintained in
`public/assets/projects`, and family map covers in `public/assets/mindmaps`.

## Checks

Run `node --test scripts/mindmap-graph.test.mjs` and `npm run build`.
Unsupported types, duplicate IDs, and missing relationship endpoints in learning
maps fail during the build instead of silently producing broken diagrams.
