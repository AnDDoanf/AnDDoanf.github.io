---
title: "Song Collections"
category: "Church"
description: "A real-time search and projection web application for Christian hymns, optimized for desktop and mobile devices."
descriptionVi: "Ứng dụng web tìm kiếm và trình chiếu thánh ca Cơ Đốc theo thời gian thực, được tối ưu cho cả máy tính và thiết bị di động."
image: "/showroom/thanhcahttlnc.png"
tags: ["React", "Create React App", "LocalStorage", "Excel integration"]
links:
  live: "https://anddoanf.github.io/App-Worship-songs-collection/"
  repo: ""
---

## Project Overview

**Song Collections** (Thánh Ca) is a fast, lightweight search and presentation application designed to display worship song lyrics and chord sheets during church services. It is fully optimized for touch gestures on tablets/phones and arrow key navigation on desktops.

## Key Features

### 📚 Multiple Song Collections
Browse and switch between multiple lyric books in one place, including: `Tôn Vinh Chúa Hằng Hữu`, `Hosanna Việt Nam`, `Bài hát tự do`, and `Thánh Ca Xanh`.

### 🔍 Real-Time Search & Filters
Instantly look up songs by title, song code, or lyric snippets. Filter results by topic (chủ đề), key (tone), and tempo (nhịp).

### 🖥️ Slide Presentation Mode
Add songs to a presentation queue and view sheets in fullscreen slideshow mode. Desktop users navigate pages using left/right arrow keys, while mobile users can swipe pages.

### 📊 Excel Syncing Workflow
Allows administrators to export the entire song workbook as an Excel file (`song-collections.xlsx`), modify lyrics or chords on Google Sheets, and load the updated sheets directly via URL parameters.

## Technology Stack

- **Framework**: React, Create React App.
- **State & Storage**: React Context, LocalStorage (preserves presentation queues and themes).
- **Icons**: React Icons (Bootstrap and Material icons).
