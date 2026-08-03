---
title: "Anhoc Gamify"
category: "Individual"
description: "An AI-augmented math learning application for students, featuring timed auto-graded tests, gamified XP shop, and Gemini AI Chatbot."
image: "/showroom/anhoc.png"
tags: ["Next.js", "Express", "FastAPI", "Google Gemini", "Redis", "BullMQ", "PostgreSQL"]
links:
  live: "https://anhoc.vercel.app/login"
  repo: ""
---

## Project Overview

**Anhoc** is a gamified math education platform built for Vietnamese students from grade 1 to 9. It provides structured theory lessons, interactive procedural question templates, timed tests, and a dedicated AI math tutor to build confidence and study consistency.

## Key Features

### 🎮 Gamified Economy & Streaks
Students earn experience points (XP) and coins to level up, claim daily streaks, unlock visual avatars/themes, or purchase power-ups (like Skip Guards or Study Pets). A lives mechanism caps practice attempts.

### 🤖 AI Math Tutor Chatbot
An interactive chat tutor powered by Google Gemini API and a local Qwen-Math fallback. Incorporates a SymPy symbolic solver to check math equations and tracks student mistakes in a MongoDB memory database.

### 📝 Procedural Question Engine
Lessons feature procedural math question templates that generate fresh numbers every session. Automatically scores practice sheets and timed tests.

### 📄 Bilingual PDF Exports
Allows student downloads of lesson material or compiled practice worksheets (complete with choices, answers, and detailed explanations) generated dynamically on the client via jsPDF.

## Technology Stack

- **Frontend**: Next.js (App Router), React 19, Redux Toolkit, Tailwind CSS v4, jsPDF, React Markdown, KaTeX (remark-math).
- **Backend API**: Express (Node.js), Prisma ORM, Redis (profile caching), BullMQ (background mail and achievement checks), Pino logging.
- **AI Chatbot Service**: FastAPI (Python), Google Gemini API, Ollama (local math LLM), SymPy (symbolic solver), Motor (MongoDB).
