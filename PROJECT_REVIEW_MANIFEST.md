# AgriSense — Project Review & Architecture Manifest

**Date of Review**: October 13, 2026  
**Project**: AgriSense — Vernacular AI Agentic Advisory Platform for Smallholder Farmers  
**Package Name**: `AgriSense_Review_Package`  
**Target Audience**: ChatGPT / Technical Code Reviewers / Solution Architects  

---

## 1. Project Overview

**AgriSense** is an AI-powered agricultural decision-support and advisory system designed specifically for smallholder farmers in Maharashtra, India. The platform bridges the digital and linguistic divide by providing:

1. **Crop Disease Diagnosis**: Computer vision diagnosis using MobileNetV2 transfer learning with OpenCV foliage validation and threshold gating.
2. **KVK / ICAR-Grounded AI Advisory**: Retrieval-Augmented Generation (RAG) powered by ChromaDB vector search and Anthropic Claude 3.5 Sonnet, with strict safety fallback barriers to prevent hallucination.
3. **Voice-First Vernacular Interaction**: Full bilingual Marathi (`mr`) and English (`en`) interface supporting Web Speech STT (Speech-to-Text) and TTS (Text-to-Speech).
4. **Agro-Climatic Intelligence**: Live weather tracking and 5-day forecasts via OpenWeatherMap with rule-based pesticide/spraying advisories.
5. **Mandi Market Discovery**: APMC market price tracking (modal, min, max rates) via data.gov.in Agmarknet API with inter-market price comparison.
6. **Offline-Resilient PWA**: Progressive Web App architecture with Service Worker caching and local IndexedDB scan history persistence.
7. **Administrative Dashboard**: Role-based access control (RBAC) portal for managing knowledge base embeddings, reviewing disease detection feedback, and monitoring system health.

---

## 2. Review Package Directory Tree

```
AgriSense_Review_Package/
├── Dockerfile                         # Full-stack multi-stage Docker build
├── docker-compose.yml                 # PostgreSQL, ChromaDB, Backend & Frontend orchestration
├── .env.example                       # Documented environment variable template (placeholders only)
├── PROJECT_REVIEW_MANIFEST.md         # This review manifest
├── backend/
│   ├── Dockerfile                     # Python 3.11-slim production container
│   ├── requirements.txt               # Backend Python dependencies
│   ├── app/
│   │   ├── main.py                    # FastAPI gateway, CORS, security headers, SPA fallback
│   │   ├── seed_knowledge.py          # KVK/ICAR document vector seeding script
│   │   ├── api/
│   │   │   ├── health.py              # System health & dependency verification
│   │   │   └── v1/
│   │   │       ├── router.py          # API v1 route aggregator
│   │   │       └── endpoints/
│   │   │           ├── admin_knowledge.py # Vector store management & document ingestion
│   │   │           ├── admin_system.py    # System metrics, model tuning & analytics
│   │   │           ├── auth.py            # Phone OTP request & verification
│   │   │           ├── chat.py            # RAG advisor conversational endpoint
│   │   │           ├── crops.py           # Farmer crop catalog management
│   │   │           ├── disease.py         # Leaf image upload & ML disease diagnosis
│   │   │           ├── farms.py           # Farm plot profiles & acreage
│   │   │           ├── feedback.py        # Diagnostic feedback collection
│   │   │           ├── mandi.py           # APMC market commodity rates
│   │   │           ├── users.py           # User profile management
│   │   │           └── weather.py         # Live weather & spraying advisories
│   │   ├── auth/
│   │   │   ├── jwt.py                 # JWT token decoding, user & admin role guards
│   │   │   └── otp_service.py         # Dev/Production pluggable OTP service
│   │   ├── core/
│   │   │   ├── config.py              # Pydantic v2 BaseSettings configuration
│   │   │   ├── logging_config.py      # Structured JSON/console logging
│   │   │   └── security.py            # JWT token encoding & verification
│   │   ├── database/
│   │   │   ├── base.py                # SQLAlchemy declarative base
│   │   │   ├── init_db.py             # Schema creation & initial database seeding
│   │   │   └── session.py             # Database engine & sessionmaker
│   │   ├── models/                    # SQLAlchemy ORM models (User, Farm, Crop, Chat, Disease, etc.)
│   │   ├── schemas/                   # Pydantic validation schemas
│   │   └── services/
│   │       ├── cache_service.py       # In-memory TTL cache with thread lock
│   │       ├── disease_ml_service.py  # MobileNetV2 inference & Mock fallback adapter
│   │       ├── document_ingestion.py  # PDF text extraction & sentence-aware chunking
│   │       ├── image_validation_service.py # OpenCV foliage detection & blur check
│   │       ├── intent_detector.py     # Marathi & English regex intent classifier
│   │       ├── mandi_service.py       # Data.gov.in integration with APMC fallbacks
│   │       ├── rag_advisor.py         # RAG pipeline & Claude LLM grounded synthesis
│   │       ├── vector_store.py        # ChromaDB client & sentence-transformers embeddings
│   │       └── weather_service.py     # OpenWeatherMap API & agro-advisory rules
│   ├── static/scans/                  # Sample leaf scan test images
│   └── tests/                         # 10 Pytest test suites (47 test cases)
├── frontend/
│   ├── Dockerfile                     # Nginx alpine container for frontend SPA
│   ├── index.html                     # HTML5 entry with PWA meta tags
│   ├── nginx.conf                     # Nginx reverse proxy configuration
│   ├── package.json                   # React 18, Vite, TypeScript, Tailwind dependencies
│   ├── package-lock.json              # Deterministic NPM lockfile
│   ├── postcss.config.js              # PostCSS configuration
│   ├── tailwind.config.js             # Tailwind CSS tokens and themes
│   ├── tsconfig.json                  # TypeScript compiler configuration
│   ├── vite.config.ts                 # Vite bundler configuration
│   ├── public/
│   │   ├── manifest.json              # Web App Manifest for mobile installability
│   │   └── sw.js                      # Service Worker caching strategy
│   └── src/
│       ├── App.tsx                    # Main router with protected farmer & admin routes
│       ├── index.css                  # Tailwind styles and custom utilities
│       ├── main.tsx                   # React root entry point
│       ├── components/                # Modular UI widgets (Voice, Mandi, Weather, Admin)
│       ├── context/                   # AuthContext, LanguageContext, ToastContext
│       ├── hooks/                     # Custom React hooks (useOnlineStatus)
│       ├── i18n/                      # Translations (`mr.json`, `en.json`)
│       ├── pages/                     # Farmer & Admin pages
│       ├── services/                  # API client, chatService, offlineStorage, Voice adapters
│       └── types/                     # TypeScript domain interfaces
├── ml/
│   ├── dataset/
│   │   └── README.md                  # Dataset instructions (PlantVillage & Field Photos)
│   ├── evaluation/
│   │   ├── evaluate_field_photos.py   # Accuracy evaluation on real field photography
│   │   └── evaluate_model.py          # Metric calculator (Accuracy, Precision, Recall, F1, CM)
│   └── training/
│       └── train_mobilenetv2.py       # Transfer learning pipeline using TensorFlow/Keras
├── docs/
│   ├── PRD.md                         # Product Requirements Document
│   ├── architecture.md                # Full technical architecture specification
│   ├── development-plan.md            # Phased delivery breakdown
│   └── test-report.md                 # QA testing results matrix (47/47 passed)
└── static/scans/                      # Sample crop disease photographs
```

---

## 3. Main Technologies

| Layer | Primary Technologies | Details |
|---|---|---|
| **Frontend UI** | React 18, TypeScript, Tailwind CSS, Lucide Icons | Responsive mobile-first PWA architecture |
| **Frontend Build** | Vite 5, PostCSS, Autoprefixer | Sub-second HMR and production bundle optimization |
| **Backend API Gateway** | Python 3.11, FastAPI, Pydantic v2, Uvicorn | Async ASGI server with OpenAPI documentation |
| **Database & ORM** | PostgreSQL 15 / SQLite fallback, SQLAlchemy 2.0 | Multi-tenant schema with relational foreign keys |
| **Vector Store & Embeddings** | ChromaDB 0.5+, `sentence-transformers` (`all-MiniLM-L6-v2`) | Persistent vector database using HNSW cosine index |
| **LLM & RAG** | Anthropic Claude 3.5 Sonnet API | Context-grounded synthesis with safety fallback bounds |
| **Computer Vision / ML** | OpenCV (`opencv-python-headless`), MobileNetV2, PIL | Foliage segmentation, blur gating, CNN classification |
| **Voice / Speech** | Web Speech API (STT & TTS), pluggable adapter layer | Low-latency client-side browser speech recognition |
| **Containerization** | Docker, Docker Compose, Nginx | Multi-stage Docker builds for production deployment |

---

## 4. Important Entry Points

1. **Backend Application**: `backend/app/main.py`
   - Initializes structured logging (`setup_logging()`).
   - Automatically invokes database initialization & vector seeding (`init_database()`).
   - Registers CORS and security headers (`nosniff`, `DENY`, `XSS-Protection`).
   - Mounts `/api/v1` routes and `/health` probe.
   - Serves frontend static SPA fallback when compiled dist is present.
2. **Backend Database Seeding**: `backend/app/database/init_db.py`
   - Creates all SQL tables via `Base.metadata.create_all(engine)`.
   - Seeds initial demo farmer (`9876543210`) and admin (`9999999999`).
   - Seeds default crop diseases (`tomato_early_blight`, `tomato_late_blight`, `cotton_bacterial_blight`).
   - Calls `seed_knowledge_base()` to index KVK documents into ChromaDB.
3. **Frontend Application**: `frontend/src/main.tsx` & `frontend/src/App.tsx`
   - Initializes React 18 DOM root.
   - Wraps routes with `AuthProvider`, `LanguageProvider`, and `ToastProvider`.
   - Sets up browser routing with client-side role guards (`ProtectedRoute`, `AdminRoute`).
4. **ML Training Pipeline**: `ml/training/train_mobilenetv2.py`
   - Implements MobileNetV2 base with ImageNet weights, frozen backbone, custom dense head.
5. **Docker Orchestration**: `docker-compose.yml`
   - Orchestrates `agrisense_database` (PostgreSQL), `agrisense_vectordb` (Chroma), `agrisense_backend` (FastAPI), and `agrisense_frontend` (Nginx).

---

## 5. How Frontend and Backend Connect

- **API Base Route**: The frontend communicates via `/api/v1` (`frontend/src/services/api.ts`).
- **Development Proxy**: Vite dev server proxies `/api` and `/health` requests to `http://localhost:8000`.
- **Authentication Handshake**:
  1. User enters phone number on `Login.tsx` -> calls `POST /api/v1/auth/request-otp`.
  2. User enters OTP code -> calls `POST /api/v1/auth/verify-otp`.
  3. Backend verifies code and returns `{ access_token, user }`.
  4. Frontend stores JWT in `localStorage` under key `agrisense_token` and attaches `Authorization: Bearer <token>` to subsequent requests.
- **Image Upload Flow**:
  1. Leaf photo captured in `DiseasePage.tsx` via camera input.
  2. Submitted via `multipart/form-data` to `POST /api/v1/disease/predict`.
  3. Backend runs OpenCV foliage/blur check, invokes disease model, saves scan to SQLite/PostgreSQL, and returns diagnostics.
- **RAG Chat Flow**:
  1. Farmer speaks or types query in `AdvisorPage.tsx`.
  2. `POST /api/v1/chat/message` receives text, language (`mr`/`en`), and active crop context.
  3. Backend queries ChromaDB vector index, synthesizes answer via Claude API (or local grounded fallback), and returns answer with verified citations.

---

## 6. Database and External API Dependencies

### Relational Database
- **PostgreSQL 15** in production (configured via `DATABASE_URL`).
- **SQLite** (`agrisense_dev.db`) used as local zero-config fallback.
- **Entities**:
  - `users`: Farmers and administrators (phone, name, language, role, location).
  - `farms`: Farm acreage, soil type, irrigation source.
  - `crops`: Supported crop master list.
  - `user_crops`: Crops linked to farmer plots.
  - `disease_catalog`: Verified treatment protocols and descriptions in English and Marathi.
  - `disease_scans`: Diagnostic history, uploaded leaf photos, confidence scores.
  - `chat_messages` & `chat_sessions`: Conversational logs.
  - `diagnostic_feedback`: Farmer feedback on diagnosis accuracy.
  - `knowledge_documents`: Metadata of uploaded KVK manuals.

### External APIs
1. **OpenWeatherMap API**:
   - Fetches live temperature, humidity, rain probability, and 5-day forecasts.
   - Endpoint: `https://api.openweathermap.org/data/2.5/weather` and `/forecast`.
   - Caching: Responses cached in-memory for 30 minutes via `CacheService`.
   - Fallback: Pre-configured district profiles (Nashik, Pune, Solapur) if API key is omitted or quota is exceeded.
2. **Data.gov.in (Agmarknet Mandi API)**:
   - Fetches APMC market commodity rates (Min, Max, Modal prices).
   - Caching: 30-minute in-memory caching.
   - Fallback: Comprehensive fallback price matrix for Maharashtra APMCs (Lasalgaon, Pimpalgaon, Nashik, Pune, Solapur).
3. **Anthropic Claude API (`claude-3-5-sonnet-20240620`)**:
   - Synthesizes farmer advice grounded in retrieved KVK text chunks.
   - Fallback: Resilient local grounded text synthesizer using top-ranked snippets if API key is absent.

---

## 7. ML Model and RAG Architecture

### Crop Disease Classifier
- **Architecture**: MobileNetV2 Transfer Learning.
  - Base: Pre-trained MobileNetV2 (frozen ImageNet backbone).
  - Head: `GlobalAveragePooling2D` -> `Dropout(0.2)` -> `Dense(128, ReLU)` -> `Dense(3, Softmax)`.
  - Target Classes: `tomato_early_blight`, `tomato_late_blight`, `cotton_bacterial_blight`.
- **Pre-Processing Pipeline** (`OpenCV`):
  1. Image resolution & aspect ratio normalization (resized to 224x224).
  2. BGR to RGB color space conversion.
  3. Intensity scaling to `[-1.0, 1.0]`.
  4. Green foliage segmentation mask validation (rejects non-plant images).
  5. Laplacian variance blur detection (`variance < 100` triggers warning/rejection).
- **Inference Runtime Strategy**:
  - The runtime service (`backend/app/services/disease_ml_service.py`) checks if `ml/models/mobilenetv2_crop_disease.h5` exists.
  - If weights are absent, it cleanly falls back to `MockDiseaseClassifier()`, which evaluates image HSV color variance and Laplacian texture to generate deterministic mock diagnostics.

### RAG Advisor Pipeline
- **Vector Store**: ChromaDB (`chromadb.PersistentClient`) with cosine similarity distance.
- **Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors).
- **Chunking Strategy**: Recursive character chunking with sentence boundary preservation (chunk size: 500 characters, overlap: 80 characters).
- **Safety Fallback Gating**:
  - Maximum cosine distance threshold: `0.65`.
  - If no chunks pass the cutoff, the engine strictly outputs the official bilingual safety disclaimer:
    - *English*: "I couldn't find enough verified information for this question in the available agricultural knowledge sources. Please consult your local KVK/agricultural officer."
    - *Marathi*: "मला उपलब्ध कृषी ज्ञान स्रोतांमध्ये या प्रश्नासाठी पुरेशी पडताळलेली माहिती सापडली नाही. कृपया तुमच्या स्थानिक केव्हीके (KVK) / कृषी अधिकाऱ्यांचा सल्ला घ्या."

---

## 8. Features Found in the Source Code

| Feature | Verified Location | Implementation Status |
|---|---|---|
| **OTP Authentication** | `backend/app/api/v1/endpoints/auth.py` | Complete with dev mode fallback |
| **Farmer Profile & Farm Setup** | `backend/app/api/v1/endpoints/users.py`, `farms.py` | Complete with database persistence |
| **Leaf Disease Diagnosis API** | `backend/app/api/v1/endpoints/disease.py` | Complete with OpenCV validation & scan logging |
| **Foliage & Blur Validation** | `backend/app/services/image_validation_service.py` | Complete (HSV green mask + Laplacian variance) |
| **RAG Agricultural Advisor** | `backend/app/services/rag_advisor.py` | Complete with ChromaDB, Claude API & local fallback |
| **Multilingual i18n UI** | `frontend/src/i18n/mr.json`, `en.json` | Complete (full Marathi & English translations) |
| **Browser Voice STT / TTS** | `frontend/src/services/voice/WebSpeechAdapter.ts` | Complete with Marathi (`mr-IN`) voice support |
| **Live Weather & Advisory** | `backend/app/services/weather_service.py` | Complete with OpenWeatherMap API & agro rules |
| **Mandi Price Discovery** | `backend/app/services/mandi_service.py` | Complete with multi-market price comparisons |
| **Offline Banner & PWA Service Worker**| `frontend/public/sw.js`, `useOnlineStatus.ts` | Complete (IndexedDB offline scan storage) |
| **Admin Analytics & KB Management** | `backend/app/api/v1/endpoints/admin_*.py` | Complete with role-based JWT protection |
| **Test Coverage** | `backend/tests/` | 10 test modules covering auth, weather, disease, RAG |

---

## 9. Features That Appear Incomplete or Mocked

1. **Pre-trained CNN Binary Weights (`mobilenetv2_crop_disease.h5`)**:
   - The training script (`ml/training/train_mobilenetv2.py`) and inference architecture are fully defined.
   - However, the pre-trained weights file (`.h5` / `.onnx`) is **not present** in the repository.
   - The service currently defaults to `MockDiseaseClassifier()`, which uses OpenCV HSV/Laplacian heuristics.
2. **SMS Gateway Provider**:
   - `OTPServiceBase` uses `DevOTPService`, which prints the OTP to console or accepts `DEV_OTP_CODE` (`123456`).
   - Third-party SMS providers (e.g., Twilio, Gupshup, Fast2SMS) are abstracted but not configured with live credentials.
3. **External API Fallbacks Active by Default**:
   - When API keys (`ANTHROPIC_API_KEY`, `OPENWEATHER_API_KEY`, `DATA_GOV_IN_API_KEY`) are left empty in `.env`, the system automatically serves deterministic local fallback data.

---

## 10. Large Files Excluded and Their Sizes

The following large or generated files were identified in the original workspace and **excluded** from this review package to optimize review size and protect data integrity:

| File / Directory | Original Path | Approx. Size | Purpose / Reason for Exclusion |
|---|---|---|---|
| `frontend/dist/` | `frontend/dist/` | ~0.65 MB | Pre-compiled Vite production JS/CSS assets (regenerated via `npm run build`) |
| `chroma_db/` (root & backend) | `Agrisense 1/chroma_db/`, `backend/chroma_db/` | ~0.74 MB | SQLite vector database index (seeded dynamically on startup via `seed_knowledge.py`) |
| `agrisense_dev.db` (root & backend) | `Agrisense 1/agrisense_dev.db`, `backend/agrisense_dev.db` | ~0.47 MB | Local development SQLite databases (auto-created by SQLAlchemy on app boot) |
| Sample photos duplicate set | `Agrisense 1/static/scans/` vs `backend/static/scans/` | ~0.9 MB | Retained clean representative sample set in `static/scans` |

---

## 11. Files Excluded and Why

| Pattern / Directory | Reason for Exclusion |
|---|---|
| `frontend/node_modules/` | Third-party JavaScript dependencies (~150 MB). Reinstalled via `npm install`. |
| `.venv/` | Python virtual environment with compiled binaries (~2.8 GB). Recreated via `pip install -r requirements.txt`. |
| `.git/` | Version control internal database not present / excluded for review cleanliness. |
| `dist/` & `build/` | Compiled static output directories. |
| `__pycache__/` & `*.pyc` | Python bytecode caches. |
| `.pytest_cache/` | Pytest test execution cache and artifacts. |
| `.vscode/` | Local IDE editor configuration. |
| `.env` (original) | **Excluded for security**. Contained active API keys and database credentials. Substituted with documented `.env.example`. |

---

## 12. Required Environment Variables

All sensitive values have been replaced with placeholders. Refer to `.env.example` in the package root:

```bash
# App Configuration
APP_NAME=AgriSense
VERSION=1.0.0
ENVIRONMENT=development                       # 'development' or 'production'
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:5173,http://localhost:8000

# Security & Authentication
JWT_SECRET=your_32_character_random_jwt_secret_here
SECRET_KEY=your_32_character_random_jwt_secret_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080             # 7 days
DEV_OTP_CODE=123456                           # Development bypass code

# Database
DATABASE_URL=sqlite:///./agrisense_dev.db     # or postgresql+psycopg2://user:pass@localhost:5432/agrisense_db
POSTGRES_USER=agrisense_user
POSTGRES_PASSWORD=your_secure_db_password_here
POSTGRES_DB=agrisense_db

# ChromaDB & Vector Store
VECTOR_DB_PATH=./chroma_db
CHROMA_DB_DIR=./chroma_db
EMBEDDING_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
SIMILARITY_DISTANCE_THRESHOLD=0.65

# AI / LLM (Anthropic Claude API)
ANTHROPIC_API_KEY=your_anthropic_claude_api_key_here
CLAUDE_API_KEY=your_anthropic_claude_api_key_here
CLAUDE_MODEL_NAME=claude-3-5-sonnet-20241022

# External Agricultural Data APIs
OPENWEATHER_API_KEY=your_openweather_map_api_key_here
DATA_GOV_IN_API_KEY=your_data_gov_in_api_key_here
CACHE_TTL_MINUTES=30

# Storage & Uploads
STORAGE_TYPE=local
LOCAL_STORAGE_DIR=static/uploads
MAX_IMAGE_SIZE_MB=10

# Voice / Audio
TTS_ENGINE=web_speech_api
STT_ENGINE=web_speech_api
DEFAULT_LANGUAGE=mr                           # 'mr' (Marathi) or 'en' (English)
```

---

## 13. Instructions for Running the Project Locally

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- (Optional) Docker & Docker Compose

### Option A: Local Development Run (Fastest)

#### 1. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp ../.env.example ../.env

# Launch Backend Server (auto-creates SQLite DB & seeds vectors)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Swagger Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`
- Demo Farmer Login: Phone `9876543210`, OTP `123456`
- Admin Login: Phone `9999999999`, OTP `123456`

### Option B: Docker Compose Run
```bash
cp .env.example .env
docker compose up --build
```
- Frontend available on `http://localhost`
- Backend API on `http://localhost:8000`

---

## 14. Known Issues and Unresolved Questions

1. **MobileNetV2 Model Weights**:
   - The training script (`ml/training/train_mobilenetv2.py`) is complete, but model weights (`.h5`) must be trained or supplied in `ml/models/` for full CNN inference instead of the mock classifier.
2. **PostgreSQL vs SQLite Configuration in Development**:
   - `init_db.py` executes an explicit `ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'FARMER'` on startup for SQLite backwards compatibility. In production PostgreSQL deployments, a dedicated Alembic migration pipeline is recommended.
3. **Browser Web Speech API Support**:
   - Speech Recognition relies on the browser's native `webkitSpeechRecognition`. On browsers that do not support Web Speech (such as Firefox desktop or older Android webviews), voice transcription falls back to typed text input.
4. **Data.gov.in Mandi API Rate Limits**:
   - The government data portal occasionally experiences latency or schema shifts. The built-in in-memory caching and master APMC fallback dataset mitigate this risk.
