---
title: "Yahsaka Ecosystem"
category: "Work"
description: "A multi-platform employee time tracking and workplace management ecosystem supporting multi-organization configurations and GPS spatial-data check-ins."
image: "/showroom/production-1.svg"
tags: ["Laravel 8", "Flutter", "React 19", "Stripe", "PostgreSQL", "Riverpod"]
links:
  live: ""
  repo: ""
---

## Project Overview

**Yahsaka** is a comprehensive employee time tracking and workplace management system designed to streamline workforce management for organizations. The system provides comprehensive features for tracking employee work hours, managing workplace locations, handling organizational structures, and generating detailed reports.

The ecosystem consists of multiple integrated applications:
1. **Laravel Admin Web Portal & API Backend**
2. **Flutter Mobile Application for Employees**
3. **React Subscription Portal with Stripe**

## Key Features

### 🏢 Multi-Organization Support
Manage multiple organizations with hierarchical structures, allowing enterprise-level workforce segmentation and configuration.

### 🕒 Time Tracking & GPS Validation
Accurate punch-in/punch-out system. The mobile app validates employee GPS coordinates against designated workplace boundaries using spatial data.

### 📍 Workplace & QR Code Management
Generate QR codes for workplace identification. Employees can quickly scan these codes on-site to register attendance.

### 💳 Subscription & Payments
Integrated payment processing via Stripe, supporting credit/debit cards, plan changes, and subscription lifecycle management.

### 📊 Reporting & Analytics
Comprehensive reporting tools for tracking worked hours, wages, productivity, and exports (Excel/Word).

## Technology Stack

- **Backend / Admin**: PHP (Laravel 8.x), MySQL (with Spatial Extensions), Laravel Sanctum, Laravel Excel, Simple QR Code, Guzzle HTTP.
- **Mobile Client**: Flutter 3.5.3 (Dart), Riverpod (state management), Dio (networking), mobile_scanner, geolocator, shared_preferences.
- **Subscription Portal**: React 19 (TypeScript), Vite, Material-UI, Redux Toolkit, Stripe React Components, react-i18next.
