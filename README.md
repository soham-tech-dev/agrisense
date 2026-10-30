# AgriSense (अ‍ॅग्रीसेन्स) — AI Digital Farming Assistant

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.112+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-52%2F52%20Passed-brightgreen.svg)]()

**AgriSense** is a comprehensive, production-grade AI agricultural decision-support and advisory platform specifically designed for smallholder farmers in Maharashtra, India. It combines transfer-learning computer vision, Retrieval-Augmented Generation (RAG) grounded in Krishi Vigyan Kendra (KVK) and ICAR literature, live agro-climatic intelligence, real-time APMC Mandi market rates, and a vernacular (Marathi & English) voice-first interface.

---

## 🌟 Key Capabilities & Features

### 1. Leaf Disease Computer Vision Diagnosis (Dual-Tier Hybrid AI)
- **Tier 1 (Offline / Fast) — MobileNetV2 CNN**: Local transfer-learning model (`.keras` native format, with `.h5` compatibility) delivering low-latency inference (~200ms) for offline edge use.
- **Tier 2 (Cloud / High Precision) — Google Gemini 3.5 Flash Lite Vision**: Automatic dynamic escalation whenever Tier 1 confidence is below 70% or when complex field lighting/background domain shifts occur. Delivers 95%+ diagnostic accuracy with rich ICAR-grounded clinical observations.
- **OpenCV Validation Gate**: Rejects non-plant and blurry images using HSV green foliage mask segmentation and Laplacian variance blur thresholds (`variance > 100`).
- **18-Disease Agricultural Catalog**: Pre-seeded relational database catalog covering 18 crop diseases across Potato, Tomato, Corn, and Cotton with bilingual (English & Marathi) CIBRC-compliant chemical spray dosages, organic bio-pesticide treatments (Neem oil, Trichoderma), and cultural prevention measures.

### 2. Grounded KVK / ICAR RAG Advisory Engine
- **Vector Knowledge Base**: ChromaDB dense vector store using `sentence-transformers` (`all-MiniLM-L6-v2`) with 18 pre-seeded ICAR and KVK agricultural manuals for Maharashtra crops (Tomato, Onion, Cotton, Soybean, Wheat, Sugarcane, Soil Fertility, Pesticide Safety).
- **Grounded Synthesis**: Contextual AI answers generated via Anthropic Claude 3.5 Sonnet with local grounded fallback synthesis.
- **Strict Anti-Hallucination Fallback**: Strictly gated by cosine similarity thresholds (`0.65` cutoff). If verified evidence is insufficient, it triggers standard bilingual disclaimers directing farmers to local agricultural extension officers.

### 3. Voice-First Vernacular Interaction
- **Dual Language Support**: Full bilingual Marathi (`mr`) and English (`en`) user interface with instant language toggle.
- **Web Speech STT & TTS**: Hands-free voice query transcription (`webkitSpeechRecognition`) and natural vernacular speech playback (`mr-IN` / `en-IN`).
- **Intent Classification**: Rule-based and semantic intent classification in both Marathi and English.

### 4. Agro-Climatic Intelligence
- **Live Weather & 5-Day Forecast**: OpenWeatherMap integration with 30-minute in-memory caching.
- **Agricultural Action Advisories**: Dynamic spraying suitability index (evaluating wind speed, rain probability, temperature) and irrigation advice tailored to crop growth stages.

### 5. Mandi Market Price Discovery
- **APMC Market Intelligence**: Tracks minimum, maximum, and modal market rates across key Maharashtra APMC mandis (Lasalgaon, Pimpalgaon, Nashik, Pune, Solapur) via data.gov.in Agmarknet API.
- **Price Comparison & Trends**: Inter-market commodity price comparisons and price trend indicators to optimize harvest selling decisions.

### 6. Farm & Crop Plot Profile Management
- **Multi-Plot Tracking**: Manage distinct farm plots with soil type (black cotton, loamy, red), acreage, irrigation sources (drip, canal, borewell), and sowing dates.
- **Crop Calendars & Reminders**: Personalized crop milestone schedules and stage-by-stage care tips.

### 7. Full-Featured Admin Control Portal
- **Role-Based Access Control (RBAC)**: Secure administrative routes guarded by JWT roles (`ADMIN` vs `FARMER`).
- **Knowledge Base Ingestion**: Interactive portal to upload PDF/text manuals, trigger semantic chunking, and view vector collection telemetry.
- **Model Tuning & System Health**: Real-time diagnostic feedback review, scan confidence auditing, and dependency telemetry.

---

## 🏗️ Architecture & Tech Stack

```
                     ┌───────────────────────────────────────────────┐
                     │          React 18 + Vite Frontend             │
                     │  (TypeScript, Tailwind CSS, Lucide Icons,     │
                     │   Web Speech API STT/TTS, Firebase Auth)      │
                     └──────────────────────┬────────────────────────┘
                                            │ Reverse Proxy / API calls
                                            ▼
                     ┌───────────────────────────────────────────────┐
                     │             FastAPI Backend (ASGI)            │
                     │  (Python 3.11+, Uvicorn, Pydantic v2, CORS)   │
                     └───────┬──────────────┬──────────────┬─────────┘
                             │              │              │
       ┌─────────────────────┼──────────────┼──────────────┼─────────────────────┐
       ▼                     ▼              ▼              ▼                     ▼
┌──────────────┐      ┌─────────────┐ ┌───────────┐ ┌─────────────┐       ┌────────────┐
│ SQLAlchemy   │      │  ChromaDB   │ │  OpenCV   │ │ OpenWeather │       │  Agmarknet │
│ SQLite /     │      │  Vector DB  │ │  Vision   │ │    API      │       │  Mandi API │
│ PostgreSQL   │      │ (MiniLM-L6) │ │ Pipeline  │ │  (Weather)  │       │ (data.gov) │
└──────────────┘      └─────────────┘ └───────────┘ └─────────────┘       └────────────┘
```

| Layer | Technologies | Details |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS | Responsive SPA / PWA running on `http://localhost:3000` |
| **Backend API** | FastAPI 0.112+, Uvicorn, Pydantic v2 | High-performance async ASGI API on `http://127.0.0.1:8000` |
| **Database** | SQLite (`agrisense_dev.db`) / PostgreSQL | SQLAlchemy 2.0 ORM with relational models |
| **Vector Database** | ChromaDB 0.5+ | Persistent HNSW cosine index storing chunked agricultural literature |
| **Embeddings** | `sentence-transformers` (`all-MiniLM-L6-v2`) | 384-dimensional dense semantic vector embeddings |
| **LLM Grounding** | Anthropic Claude 3.5 Sonnet / Local Fallback | Context-grounded advisory with zero hallucination safety rules |
| **Vision / ML** | OpenCV (`opencv-python-headless`), MobileNetV2 (`.keras`), Google Gemini 3.5 Flash Lite Vision | Foliage segmentation, blur gating, offline CNN inference & cloud AI vision escalation |
| **Auth** | Firebase Auth (Google / Email) + JWT tokens | Robust authentication with role-based access control |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **Python**: v3.11 or higher (`python --version`)
- **Git**

---

### 2. Backend Setup & Startup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Activate Python virtual environment
# Windows PowerShell:
..\.venv\Scripts\Activate.ps1
# Windows Command Prompt:
# ..\.venv\Scripts\activate.bat
# Linux / macOS:
# source .venv/bin/activate

# 3. Install Python dependencies (if not already installed)
pip install -r requirements.txt

# 4. Start the FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Backend API**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`
- **System Health Endpoint**: `http://127.0.0.1:8000/health`

---

### 3. Frontend Setup & Startup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies (if needed)
npm install

# 3. Verify environment configuration (.env exists)
# Ensure VITE_FIREBASE_* variables are set in frontend/.env

# 4. Start the Vite development server
npm run dev
```

- **Frontend Application**: `http://localhost:3000`
- Vite automatically proxies `/api`, `/health`, and `/static` requests to `http://127.0.0.1:8000`.

---

## 🧪 Testing & Verification

The project includes a comprehensive automated test suite with **100% pass rate** across all core modules:

```bash
# Run the complete test suite
cd backend
python -m pytest
```

### Test Suite Execution Matrix (52/52 Passed)
- `test_phase1.py`: Database models, user authentication, and profile endpoints.
- `test_phase2_cache.py`: Thread-safe in-memory cache TTL and eviction policies.
- `test_phase2_mandi.py`: Agmarknet API integration, APMC fallbacks, price parsing.
- `test_phase2_weather.py`: OpenWeatherMap telemetry, 5-day forecasts, spraying rules.
- `test_phase3_disease.py`: Leaf photo upload, OpenCV foliage validation, blur rejection, scan history.
- `test_phase5_bilingual_voice.py`: Marathi & English language detection and bilingual RAG synthesis.
- `test_phase6_history_feedback.py`: Farmer diagnostic ratings, feedback submission, history retrieval.
- `test_phase7_admin.py`: Role-based admin guards (403 vs 200), knowledge management, metrics.
- `test_phase8_integration_qa.py`: End-to-end integration, SQL injection / XSS sanitation, security headers.
- `test_rag_advisor.py`: ChromaDB semantic vector search, cutoff distance gating, safety disclaimers.

```powershell
================= 52 passed, 83 warnings in 89.67s ==================
```

---

## 📂 Project Structure

```
Agrisense 1/
├── .env                              # Root backend environment configuration
├── .env.example                      # Documented environment variable template
├── Dockerfile                        # Multi-stage container definition
├── docker-compose.yml                # Multi-container orchestration
├── README.md                         # This file
├── PROJECT_REVIEW_MANIFEST.md        # Comprehensive technical review manifest
├── agrisense_dev.db                  # Local SQLite database
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI app entry, CORS, security middleware
│   │   ├── seed_knowledge.py         # KVK/ICAR document vector seeding script
│   │   ├── api/
│   │   │   ├── health.py             # System health & dependency status probe
│   │   │   └── v1/
│   │   │       ├── router.py         # v1 API route aggregation
│   │   │       └── endpoints/        # Admin, Auth, Chat, Crops, Disease, Mandi, Weather
│   │   ├── auth/                     # JWT token encode/decode, role validation
│   │   ├── core/                     # BaseSettings, logging, security utilities
│   │   ├── database/                 # SQLAlchemy engine, base model, init & seed scripts
│   │   ├── models/                   # ORM models (User, Farm, Crop, DiseaseScan, Feedback)
│   │   ├── schemas/                  # Pydantic v2 validation schemas
│   │   └── services/                 # RAG advisor, CV disease ML, Mandi, Weather, VectorStore
│   ├── chroma_db/                    # ChromaDB vector database index files
│   ├── requirements.txt              # Python package dependencies
│   └── tests/                        # 10 Pytest test suites (52 test cases)
├── frontend/
│   ├── src/
│   │   ├── main.tsx                  # React 18 DOM entry point
│   │   ├── App.tsx                   # Route definitions & protected route guards
│   │   ├── components/               # UI components (Layout, Voice, Weather, Mandi, Admin)
│   │   ├── context/                  # AuthContext (Firebase), LanguageContext, ToastContext
│   │   ├── pages/                    # 19 pages (Dashboard, Disease, Advisor, Admin, Farm...)
│   │   ├── services/                 # Axios API client, Firebase service, WebSpeech adapter
│   │   └── i18n/                     # Marathi (mr.json) and English (en.json) dictionaries
│   ├── package.json                  # Frontend dependencies and scripts
│   ├── vite.config.ts                # Vite config with proxy to backend port 8000
│   └── tailwind.config.js            # Tailwind theme tokens
├── docs/                             # Architecture, PRD, test-report, development-plan
└── ml/                               # MobileNetV2 training scripts and dataset guides
```

---

## 🔒 Security & Best Practices

- **Zero Hardcoded Secrets**: All private keys, database URLs, and API tokens are loaded via `.env` and excluded from source control.
- **Security Headers**: Standard HTTP security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`) automatically applied to all backend responses.
- **Role-Based Guards**: Protected administrative endpoints reject unauthenticated or non-admin requests with `401 Unauthorized` or `403 Forbidden`.
- **SQL Injection Prevention**: All queries use parameterized SQLAlchemy ORM statements.
- **XSS Escaping**: React automated output encoding and input sanitization prevent cross-site scripting.

---

## 📄 License

This project is licensed under the MIT License.
