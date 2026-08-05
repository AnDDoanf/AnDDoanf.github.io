---
title: "HTNC Platform"
category: "Church"
description: "A monorepo platform designed for learning, event management, and fellowship within Christian church networks."
descriptionVi: "Nền tảng monorepo phục vụ học tập, quản lý sự kiện và thông công trong mạng lưới các Hội Thánh Cơ Đốc."
image: "/showroom/production-1.svg"
tags: ["Next.js", "NestJS", "PostgreSQL", "Redis", "monorepo (pnpm)"]
links:
  live: ""
  repo: ""
---

## Project Overview

**HTNC Platform** is an enterprise-grade monorepo application designed to support online learning, fellowship, event coordination, and spiritual journaling for Christian church congregations.

## Key Features

### 📦 Modular Monorepo Architecture
Organized as a monorepo workspace via `pnpm`, facilitating strict type-sharing between the Next.js frontend client (`apps/web`) and the NestJS backend API (`apps/api`).

### 🏗️ Domain-Driven MVP Modules
Contains separate backend and frontend modules for core features:
- **Authentication & RBAC**: Secure sign-ins and roles.
- **Members Database**: Directory of congregation members.
- **Blogs/Articles**: Religious teachings and news bulletins.
- **Course & Event Management**: Structured learning portals and church events.
- **Prayer Journaling**: A private space for reflection and scheduling.

### 🧩 Dynamic Page Builder
Supports custom page rendering using page-builder layouts stored directly in database schemas, enabling admin-level homepage customization.

## Technology Stack

- **Frontend**: Next.js (App Router), React, TypeScript.
- **Backend**: NestJS (modular architecture), Prisma ORM.
- **Database**: PostgreSQL (relational storage).
- **Cache & Queue**: Redis.
