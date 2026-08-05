---
title: "Familiar Fusion Atlas"
category: "Gaming"
description: "A static fusion tracking and loadout database for the game Bit Heroes, synced with Fandom snapshots."
descriptionVi: "Cơ sở dữ liệu tĩnh theo dõi công thức dung hợp và bộ trang bị cho trò chơi Bit Heroes, đồng bộ từ các bản chụp dữ liệu Fandom."
image: "/showroom/bit-heroes.png"
tags: ["Next.js", "React", "Static Site Export", "Node.js parser", "GitHub Pages"]
links:
  live: "https://anddoanf.github.io/bit-heroes"
  repo: ""
---

## Project Overview

**Bit Heroes Familiar Fusion Atlas** is a static Next.js documentation portal designed to help players look up familiars, track fusion requirements, and browse game loadouts. It relies on snapshots of HTML wiki data compiled into static JSON models during building.

## Key Features

### 🕸️ Familiar & Fusion Trees
Calculates complete recipe and fusion trees for every familiar, listing base elements and costs.

### 📂 Static Archive Extractor
Node.js data parsing scripts extract JSON databases from fandom wiki HTML snapshots at compile-time.

### 🗺️ Dynamic Routing & Search
Static pages mapping fusion paths, stats, and requirements with instant search filters.

## Technology Stack

- **Frontend**: Next.js, React, static exports (`next export`).
- **Data Extractor**: Node.js scraping and parsing scripts.
- **Hosting**: GitHub Pages via automated workflows.
