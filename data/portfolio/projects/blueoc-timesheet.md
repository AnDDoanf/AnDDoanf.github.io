---
title: "BlueOC Timesheet"
category: "Work"
description: "An internal full-stack employee timesheet and HR portal solving automated check-ins and multi-level leave approval flows."
descriptionVi: "Cổng chấm công và nhân sự full-stack nội bộ, tự động hóa quy trình điểm danh và phê duyệt đơn nghỉ nhiều cấp."
image: "/showroom/cronix.png"
tags: ["React 18", "Express 4", "PostgreSQL", "Azure AD SSO", "AWS S3", "Vite"]
links:
  live: ""
  repo: ""
---

## Project Overview

**Timesheet App** (internal name: `business-portal-webapp`) is a secure full-stack enterprise web application designed to manage employee attendance, leave requests, and biometric face registration. It bridges the gap between hardware check-in devices and company HR software.

## Key Features

### 🕒 Automated Time Tracking
Synchronizes check-in/check-out logs directly from physical biometric scanners (fingerprint & face recognition devices) in real-time.

### 📝 Multi-Level Request Approval
Allows employees to request leaves, late arrivals, early departures, and overtime. Managers receive notifications and can approve or reject requests dynamically, while administrators configure holiday settings.

### 👤 Biometric Face Registration
Enables employees to enroll their faces using their webcam directly from the web browser. The image is uploaded to AWS S3 and processed by a dedicated external biometric recognition engine.

### 🔐 Enterprise Auth & SSO
Supports secure user logins using Microsoft Azure Active Directory (SSO / OAuth2) alongside traditional email/password credentials.

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (managed and migrated via Flyway).
- **Third-Party Integrations**: Microsoft Azure AD SSO, Firebase Cloud Messaging (Push Notifications), AWS S3 (Biometric Image Storage), Biometric Face Recognition Engine.
