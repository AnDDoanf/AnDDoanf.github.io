---
title: Hải Phòng with friends
description: A small starter gallery showing the cleaner reading flow for images, captions, and story text.
type: images
style: framed
cover: 2026-08-08_13-52-22.jpg
location: Hai Phong, Vietnam
latitude: 20.8830967
longitude: 106.6790381
mapOffsetX: -25
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
