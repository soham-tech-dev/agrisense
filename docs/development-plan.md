# AgriSense — Multi-Phase Development Plan

## Overview

This development plan outlines the sequential roadmap for implementing the **AgriSense** platform. Execution is divided into six distinct phases (Phase 0 to Phase 5) to ensure systematic development, rigorous verification, and zero fake functionality.

---

## Phase 0: Project Analysis & Architecture (COMPLETED)

### Objectives
- Inspect workspace and primary source documents (*Assignment 1 Needs Assessment* & *Assignment 2 Project Proposal*).
- Define complete technical architecture, ERD, API schema, ML pipeline, RAG design, and PWA strategy.
- Establish configurable placeholders for unresolved requirements.

### Deliverables
- [x] `docs/architecture.md`
- [x] `docs/PRD.md`
- [x] `docs/development-plan.md`
- [x] `.env.example`

---

## Phase 1: Foundation Scaffolding & Database Setup

### Objectives
- Scaffolding frontend React + Vite + TypeScript PWA application.
- Scaffolding backend FastAPI application structure.
- Configure PostgreSQL database models (SQLAlchemy) and database migration system (Alembic).
- Implement basic bilingual i18n setup (`mr` Marathi and `en` English).

### Deliverables
- `frontend/` React app with Tailwind/Vanilla CSS design system, routing shell, and language toggle.
- `backend/` FastAPI setup with async PostgreSQL database connections and CORS middleware.
- Database tables for Users, Farmer Profiles, Crop Scans, Advisory Queries, and Feedback.

### Acceptance Criteria
- React frontend builds with `npm run build` without TypeScript errors.
- Backend server starts cleanly with `uvicorn app.main:app` and exposes `/docs` OpenAPI UI.
- PostgreSQL migrations run cleanly and generate proper schema.

---

## Phase 2: ML Vision Engine & Plant Disease Scanner

### Objectives
- Implement OpenCV image preprocessing pipeline (resizing, foliage HSV masking, normalization).
- Integrate MobileNetV2 disease classification engine.
- Create `/api/v1/disease/predict` backend endpoint.
- Build mobile camera & photo upload UI with visual confidence meter.

### Deliverables
- Preprocessing script in `backend/app/services/disease_service.py`.
- Configurable disease class mapping (`DISEASE_CLASSES = configurable`).
- Disease scan UI component with instant result display and fallback guidance for low-confidence scans.

### Acceptance Criteria
- Uploaded leaf photo processes through OpenCV and returns prediction JSON within 1.5 seconds.
- Sub-threshold predictions (< 0.70 confidence) trigger low-confidence alert message.

---

## Phase 3: ChromaDB RAG & Voice Advisory Engine

### Objectives
- Set up ChromaDB vector database with `sentence-transformers` embedding engine.
- Build PDF/Text document ingestion pipeline for KVK and ICAR manuals.
- Integrate Anthropic Claude API for grounded agricultural advisory synthesis.
- Implement Web Speech API voice input (STT) and speech synthesis (TTS) in Marathi and English.

### Deliverables
- Knowledge base ingestion utility (`backend/app/services/rag_service.py`).
- Grounded prompt template enforcing source citations and forbidding ungrounded remedies.
- Voice-enabled Q&A chat interface with microphone button and Marathi voice playback.

### Acceptance Criteria
- Advisory query retrieves relevant KVK document chunks from ChromaDB and returns grounded Claude completion.
- Voice input records speech in Marathi, transcribes to text, and reads out response audio.

---

## Phase 4: Weather, Mandi Dashboards & PWA Offline Sync

### Objectives
- Integrate OpenWeatherMap API for district weather forecasting and agromet advisories.
- Integrate data.gov.in (Agmarknet) API for live APMC mandi commodity prices.
- Configure Workbox PWA Service Worker for caching static assets and API responses.
- Implement IndexedDB local storage for scan history and offline advisory queue.

### Deliverables
- Weather dashboard component with 5-day forecast and humidity/rain risk alerts.
- Mandi price tracker component with market selector (`MANDI_MARKETS = configurable`).
- Offline Service Worker and sync queue (`frontend/src/services/offlineQueue.ts`).

### Acceptance Criteria
- Weather and Mandi widgets fetch and display real data when online.
- When network is disconnected, PWA continues to render cached weather, mandi prices, and scan history.

---

## Phase 5: Admin Dashboard, Feedback Loop & Hardening

### Objectives
- Build Admin Portal for KVK document upload, disease model configuration, and analytics.
- Implement 5-star rating and comment feedback loop for scans and advice.
- End-to-end integration testing, code linting, security audit, and performance optimization.

### Deliverables
- Admin portal pages (`frontend/src/pages/Admin.tsx`).
- Feedback submission and auditing API endpoints.
- Final Walkthrough documentation.

### Acceptance Criteria
- Admin can upload a new PDF manual and see indexed document count increase in ChromaDB.
- Farmer feedback is stored in PostgreSQL and displayed in admin analytics dashboard.
