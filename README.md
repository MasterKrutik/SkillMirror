# 🚀 SkillMirror — Multi-Signal AI Career Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.10-38B2AC)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini%203.6--Flash-4285F4)](https://ai.google.dev/)
[![SQLite](https://img.shields.io/badge/Database-SkillMirror.db-003B57)](https://www.sqlite.org/)


> SkillMirror is an AI-driven multi-agent career development and interview intelligence platform featuring live STAR behavioral scoring, Elo difficulty calibration, latent cognitive fatigue tracking, ATS resume radar inspection, and real-time streaming guidance with **Sarthi AI**.

---

## 🌟 Key Website Features & Core Engines

### 🎯 1. SkillMirror Interview Engine (`/mock-interview`)
- **Multi-Agent Evaluation Panel**:
  - *Domain Technical Evaluator*: Assesses core domain accuracy and theoretical correctness.
  - *STAR Behavioral Analyst*: Evaluates Situation (20%), Task (20%), Action (60%), and Result metrics.
  - *Adversarial Cross-Examiner*: Generates dynamic follow-up probing questions on technical trade-offs.
- **Adaptive Elo Rating Calibration**: Dynamically adjusts question difficulty starting at baseline Elo 1400 based on candidate response performance.
- **Latent Cognitive Fatigue Model**: Measures response latency, cognitive load, and pauses to prevent interview burn-out.
- **What-If Counterfactual Replay**: Re-simulates past answers with alternative high-scoring phrasing and structural improvements.

### 📄 2. ATS Resume Studio (`/upload-resume`)
- **Multi-Axis Radar Analytics**:
  - Keyword Matching Density against target job descriptions.
  - ATS Layout Parse Safety inspection (1-column layout verification).
  - Quantifiable Impact Metric Scoring (Google X-Y-Z formula: *"Accomplished [X], measured by [Y], by doing [Z]"*).
  - Action Verb Strength & Relevance Analysis.
- **Line-by-Line Rewrites**: Instant AI bullet point optimizations tailored for recruiter screening.

### 🎓 3. Personalized Roadmap & Skill Graph (`/learning-path`)
- **Dynamic 3-Phase Curriculum Timeline**:
  - *Phase 1 (Foundations)*: Core fundamentals and prerequisite concepts.
  - *Phase 2 (Specialization)*: Industry frameworks, database architecture, and API design.
  - *Phase 3 (Mastery & Projects)*: System design trade-offs, performance tuning, and portfolio builds.
- **Prerequisite Node Graphs**: Visual dependency mappings ensuring candidates master concepts in optimal order.

### 💻 4. Code Explainer Studio (`/code-explainer`)
- **4-Panel Syntax Breakdown**: Deconstructs complex code snippets across Python, Java, JavaScript, C++, Go, and Rust.
- **Algorithmic Complexity Evaluation**: Analyzes time and space complexity ($O(N)$ Big-O notation).
- **Execution Trace Debugging**: Step-by-step logic tracing to highlight potential edge cases.

### 💡 5. Concept Simplifier (`/concept-explainer`)
- **System Design & DB Analogies**: Translates advanced technical concepts (Load Balancers, Microservices, ACID compliance) into intuitive real-world analogies.

### 👥 6. Peer Community & FAQs (`/community`)
- **Benchmarking Forums**: Network with fellow candidates, compare Elo performance percentiles, and participate in technical discussions.

### 🤖 7. Sarthi Real-Time Streaming AI Assistant
- **Live SSE Token Streaming**: Delivers real-time character-by-character responses formatted in Server-Sent Events (`data: {"token": "..."}`).
- **SDK**: Powered by official `google-genai` SDK (`from google import genai`).
- **Working Model Fallback Chain**:
  1. `gemini-3.6-flash`
  2. `gemini-3.5-flash`
  3. `gemini-3.5-flash-lite`
  4. `gemini-3.1-flash-lite`
  5. `gemini-2.0-flash-lite`
  6. `gemini-2.5-flash-lite`
- **Interactive UI**: Floating bottom-right animated toggle button (`💬`), quick-start prompt chips, smooth auto-scroll, clear chat history button.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework**: Next.js 14.1.0 (React 18.2.0, App Router)
- **Styling**: Vanilla CSS + Tailwind CSS 3.4.10
- **Animations**: Framer Motion
- **AI Streaming**: ReadableStream SSE client reader

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: SQLite3 (`SkillMirror.db`)
- **Authentication**: JWT + bcryptjs (`returnTo` query parameter forwarding & public page module gating)

### AI Infrastructure
- **Provider**: Google Gemini API (`@google/generative-ai` & `google-genai` SDK)
- **Active Models**: `gemini-3.6-flash`, `gemini-3.5-flash`

---

## 📁 Project Directory Structure

```text
SkillMirror/
├── frontend/                 # Next.js 14 Frontend Application
│   ├── app/                 # App Router Pages & API Routes
│   │   ├── api/chat/stream  # Sarthi Real-Time Streaming SSE API Route
│   │   ├── api/chat/health  # Health & Telemetry Check Endpoint
│   │   ├── dashboard/       # Candidate Workspace & Quick Tools
│   │   ├── mock-interview/  # SkillMirror Adaptive Interview Engine
│   │   ├── upload-resume/   # ATS Resume Studio & Radar Analytics
│   │   ├── code-explainer/  # Code Explainer & Syntax Debugger
│   │   ├── learning-path/   # Personalized 3-Phase Roadmap
│   │   ├── community/       # Peer Community Benchmarks & FAQs
│   │   ├── login/           # User Authentication Sign-In
│   │   └── register/        # User Account Registration
│   ├── components/          # Reusable UI Components (ChatbotWidget, FeatureCard, etc.)
│   ├── context/             # AuthContext State Provider
│   └── public/              # Static Web Assets
│
├── backend/                 # Node.js + Express.js API Server
│   ├── config/              # SQLite Database Configuration (database.js -> SkillMirror.db)
│   ├── routes/              # Express API Routes (interview, auth, profile, community, etc.)
│   ├── routers/             # Python FastAPI Router (chatbot.py)
│   ├── schema.sql           # Database Initialization Schema
│   ├── SkillMirror.db       # Active SQLite Database Storage
│   └── server.js            # Main Express Server Entry Point
│
├── README.md                # SkillMirror Platform Documentation
└── FIXES_APPLIED.md         # System Architecture Fixes Log
```

---

## 🚀 Installation & Setup Guide

### Prerequisites
- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+
- **Google Gemini API Key**: [Get API Key on Google AI Studio](https://aistudio.google.com/app/apikey)

### Quick Start Commands

1. **Clone & Setup Environment**:
   ```bash
   git clone https://github.com/yourusername/SkillMirror.git
   cd SkillMirror
   ```

2. **Configure Environment Variables**:
   Create `frontend/.env.local` and `backend/.env`:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   NEXT_PUBLIC_GEMINI_API_KEY=your_google_gemini_api_key_here
   PORT=5001
   JWT_SECRET=skillmirror_super_secret_jwt_key_2026
   ```

3. **Start Backend Server**:
   ```bash
   cd backend
   npm install
   npm start
   # Runs Express backend connected to SkillMirror.db on http://localhost:5001
   ```

4. **Start Frontend Application**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   # Runs Next.js website on http://localhost:3000
   ```

---

## 📚 API Endpoints Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/chat/stream` | `POST` | Real-time token streaming with Sarthi AI Assistant (SSE format) |
| `/api/chat/health` | `GET` | Chatbot operational status & active model fallback chain |
| `/api/interview/start` | `POST` | Initializes adaptive interview session with Elo rating & question bank |
| `/api/interview/submit-answer` | `POST` | Evaluates candidate answer via multi-agent scoring panel |
| `/api/interview/preview-questions` | `POST` | Previews questions tailored to targeted role focus |
| `/api/auth/register` | `POST` | Creates candidate account & returns JWT authentication token |
| `/api/auth/login` | `POST` | Authenticates candidate & returns user session profile |
| `/api/health` | `GET` | Health check verifying Express server and SQLite `SkillMirror.db` connection |

---


