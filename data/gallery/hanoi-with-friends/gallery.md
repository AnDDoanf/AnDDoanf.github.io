---
title: Hà Nội with friends
description: A small starter gallery showing the cleaner reading flow for images, captions, and story text.
type: images
style: framed
cover: 2025-05-31_21-05-14.jpg
location: Hanoi, Vietnam
latitude: 21.0265472
longitude: 105.8109361
mapOffsetX: -30
mapOffsetY: 0
labelX: 82
labelY: 70
---

## A Simple Starter

Each gallery lives in its own folder inside `data/gallery`.

Add a markdown file for the story and metadata, then drop image files into the same folder. The gallery loader reads the folder, the parser reads this markdown, and the page renders everything automatically.

Use this page as a clean baseline: a short intro, easy thumbnail navigation, and a vertical image flow that feels natural to scroll.

## Suggested Structure

Keep filenames ordered if you want the images to appear in a specific sequence:

```text
data/gallery/my-trip/
  gallery.md
  01-cover.jpg
  02-street.jpg
  03-sunset.jpg
```
