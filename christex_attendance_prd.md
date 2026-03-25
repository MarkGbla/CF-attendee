# Christex Engineering Cohort Attendance System (Gamified)

## 📌 Product Requirements Document (PRD)

### 1. Overview
A simple gamified attendance tracking system inspired by Candy Crush map progression. Students view attendance progress as a map. Only admins can log in and manage attendance.

---

### 2. Goals
- Make attendance engaging and visual
- Keep system extremely simple
- No login required for students
- Admin-only authentication

---

### 3. Users
- Admin (authenticated)
- Student (public access via link)

---

### 4. Features

#### Admin
- Signup/Login
- Add students
- Mark attendance (Present/Absent)
- View student list

#### Student
- View progress map
- See attendance history visually

---

### 5. Functional Requirements

#### Admin Auth
- Email + Password
- JWT/session-based auth

#### Student Management
- Create student (name + slug)
- Unique URL per student

#### Attendance
- Mark per session
- Store status (present/absent)

---

### 6. Non-Functional Requirements
- Fast load (<2s)
- Mobile-first UI
- Simple UX

---

## 🏗️ Engineering Document

### Tech Stack
- Next.js (App Router)
- TailwindCSS
- Three.js (animations)
- Neon DB (Postgres)
- Vercel (deployment)

---

### Architecture

#### Frontend
- Student Map Page
- Admin Dashboard

#### Backend
- Next.js Server Actions

---

### Database Schema

#### students
- id
- name
- slug
- created_at

#### attendance
- id
- student_id
- session_number
- status
- date

#### admins
- id
- email
- password_hash

---

### API Routes

- POST /api/admin/login
- POST /api/admin/signup
- POST /api/students
- GET /api/students
- POST /api/attendance
- GET /api/student/[slug]

---

### Logic
- Levels = sessions
- Present = completed
- Absent = failed
- Future = locked

---

## 🎨 Design Document

### Design Principles
- Fun
- Minimal
- Game-like

---

### Student UI

- Vertical zig-zag map
- Circles (levels)
- Colors:
  - Green = present
  - Red = absent
  - Gray = locked

---

### Animations (Three.js)
- Floating particles
- Subtle motion
- Background effects

---

### Admin UI
- Clean dashboard
- Table layout
- Action buttons

---

### Color Palette
- Pink gradient background
- Bright nodes
- Soft shadows

---

### Typography
- Clean sans-serif
- Large readable text

---

## 🚀 MVP Scope

- Admin login
- Add students
- Mark attendance
- Student map view

---

## 📈 Future Enhancements
- Leaderboard
- Streaks
- Notifications
- Rewards system

---

## ✅ Summary
A lightweight, gamified attendance system focused on simplicity, engagement, and fast deployment.
