---
title: "Anchi Tracker"
category: "Individual"
description: "A private personal finance web application featuring RBAC, audit timelines, budget templates, and dynamic financial health dashboards."
descriptionVi: "Ứng dụng web quản lý tài chính cá nhân riêng tư, hỗ trợ RBAC, dòng thời gian kiểm toán, mẫu ngân sách và bảng điều khiển sức khỏe tài chính động."
image: "/showroom/anchi.png"
tags: ["Next.js", "NestJS", "PostgreSQL", "TypeORM", "Tailwind CSS", "Zod"]
links:
  live: ""
  repo: ""
---

## Project Overview

**Anchi (Personal Finance Tracker)** is a private, modern web application for recording, organizing, analyzing, and planning personal finances. Built as a monorepo containing a NestJS REST API, a Next.js App Router frontend, and shared TypeScript type packages.

## Key Features

### 🔐 Strict Role-Based Security
Enforces Session Verification and endpoint-level role checks (Admin or User). An automated audit log records all user registrations, templates applied, and security settings changes.

### 📋 Financial Bootstrap Templates
Provides preset configurations (e.g., *Freelancer Starter*, *College Student Budget*) containing preset categories. Includes calculators for standard rules like the **50/30/20 Rule** and the **60% Solution** that allocate budgets based on monthly income.

### 📊 Dynamic Assets Dashboard
Calculates aggregates of assets and liabilities (Savings, Checking, Credit Cards) in real-time, visualizing net worth progress and account balances.

### 🛠️ Hybrid Data Persistence
Utilizes PostgreSQL 15 via TypeORM for primary database storage, with an automated fallback to a local `db.json` database if the relational server is offline.

## Technology Stack

- **Frontend**: Next.js (App Router), React 19, Tailwind CSS, Lucide Icons, TanStack Query, Zod.
- **Backend**: NestJS, Swagger/OpenAPI, class-validator.
- **Database**: PostgreSQL 15, TypeORM (entity-based migrations).
