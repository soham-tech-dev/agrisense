# AgriSense — System Architecture Specification

## 1. Current Project Analysis

### Repository & Workspace Status
- **Workspace Location**: `d:\website\CEP\Agrisense 1(2)\Agrisense 1(2)\Agrisense 1`
- **Current State**: Fully implemented across Phase 0–8. All 52 automated tests passing.
- **Primary Source Documents**:
  1. *Assignment 1 — Needs Assessment*
  2. *Assignment 2 — Project Proposal*

### Key Empirical Survey Findings
The technical architecture is directly grounded in empirical findings from the Needs Assessment report conducted among smallholder farmers in Maharashtra:
- **97.1% Smartphone Ownership**: Validates targeting a modern mobile web platform.
- **83.5% Daily Internet Usage**: Confirms feasibility of online cloud AI advisory (Claude API) while highlighting the necessity of PWA offline resilience when network connectivity fluctuates.
- **39.8% Disease Identification Guesswork/Experience**: Demonstrates an immediate need for an objective, image-based plant pathology diagnosis system (MobileNetV2 + OpenCV).
- **27.2% General Online Search / AI Chat Usage**: Demonstrates growing openness to digital advisories, but requires trusted grounding in KVK (Krishi Vigyan Kendra) & ICAR manuals to avoid hallucinated recommendations.
- **45.6% Previous Agricultural Advisory App Usage**: Shows familiarity with digital tools, setting a high UX bar for performance, clarity, and localized value.
- **80.6% Willingness to Use AgriSense**: Proves strong user intent and market fit.
- **75.7% Preference for Voice Input**: Establishes **Voice-First interaction** in **Marathi (`mr`)** and **English (`en`)** as a non-negotiable core architectural requirement.

---

## 2. Proposed System Architecture

AgriSense uses a decoupled client-server architecture optimized for low-latency voice interactions, offline resilience, and localized AI advisory.

```mermaid
graph TD
    Client[Mobile-First PWA<br/>React + Vite + TypeScript] -->|HTTPS REST / WebSpeech API| API[FastAPI Backend Gateway]
    Client -->|Offline Cache| SW[Service Worker & IndexedDB]
    
    subgraph Backend Server
        API --> Auth[Auth & Profile Module]
        API --> VisEngine[Vision Engine<br/>MobileNetV2 + OpenCV]
        API --> RAGEngine[RAG Engine<br/>ChromaDB + sentence-transformers]
        API --> ExtServices[External Data Services]
    end
    
    RAGEngine -->|Context Retrieval| Claude[Anthropic Claude API]
    ExtServices -->|Weather Data| OWM[OpenWeatherMap API]
    ExtServices -->|Commodity Prices| Mandi[data.gov.in Agmarknet API]
    
    Auth --> DB[(PostgreSQL Database)]
    VisEngine --> DB
    RAGEngine --> DB
```

### Core Technology Stack
- **Frontend**: React 18, Vite, TypeScript, PWA (Workbox), Lucide Icons, i18next
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, Uvicorn
- **Database**: PostgreSQL (Relational store for user profiles, scan history, feedback, logs)
- **Vector DB**: ChromaDB (Embedded/persistent vector store for KVK/ICAR document chunks)
- **Embeddings**: `sentence-transformers` (`all-MiniLM-L6-v2` / multilingual embedding model)
- **LLM Engine**: Anthropic Claude API (Claude 3.5 Sonnet / Haiku for grounded advisory synthesis)
- **Disease Model**: MobileNetV2 + OpenCV (Image preprocessing & pathology classification)
- **External APIs**: OpenWeatherMap API & data.gov.in (Agmarknet Mandi prices)

---

## 3. Frontend Architecture

### Design Principles & UI/UX Standards
- **Mobile-First & Touch-Optimized**: Tap targets ≥ 48px, bottom navigation, card-based responsive layout optimized for handheld devices.
- **Voice-First Paradigm**: Prominent microphone activation button available on all core screens with real-time speech visualization.
- **Bilingual i18n (`mr` / `en`)**: First-class support for Marathi script with typography tuned for Marathi legibility (`Noto Sans Devanagari` / `Inter`). Instant language toggling without page reload.
- **Visual Polish & Modern Aesthetics**: High contrast ratio for outdoors sunlight visibility, clean status badges, smooth CSS transitions, and glassmorphic elevation cards.

### Core Component Hierarchy
```
src/
├── assets/             # Icons, logos, static illustrations
├── components/
│   ├── common/         # Button, Card, Modal, Input, Select, Badge, Toast,
│   │                   # LanguageToggle, OfflineBanner, FirebaseErrorBoundary,
│   │                   # EmptyState, ErrorState, LoadingState, FeedbackWidget
│   ├── layout/         # AppShell, Header, Sidebar, TopNav, DesktopNav, MobileNav, AdminLayout
│   ├── dashboard/      # DashboardAlerts, DiseaseHistoryModal
│   ├── disease/        # (Disease scan UI within DiseasePage & DiseaseResultPage)
│   ├── advisor/        # (Voice & chat UI within AdvisorPage)
│   ├── weather/        # WeatherWidget, WeatherAdvisoryCard
│   ├── mandi/          # MandiPricesWidget, MarketComparisonModal
│   └── admin/          # AdminLayout, AdminRoute
├── context/            # AuthContext, LanguageContext, ToastContext
├── hooks/              # useOnlineStatus
├── services/           # api.ts, firebase.ts, voice/WebSpeechAdapter.ts, offlineStorage
├── i18n/               # locales/ (en.json, mr.json)
└── pages/              # Home, LandingPage, Dashboard, DiseasePage, DiseaseResultPage,
                        # DiseaseHistoryPage, AdvisorPage, WeatherPage, MarketPage,
                        # Farm, Profile, CropCalendarPage, Settings, ResourcesPage,
                        # SavedAdvicePage, ForgotPassword, Login, Register,
                        # admin/ (AdminOverviewPage, AdminUsersPage, AdminDiseasePage,
                        #         AdminKnowledgePage, AdminFeedbackPage, AdminModelPage,
                        #         AdminAnalyticsPage, AdminSettingsPage)
```

---

## 4. Backend Architecture

### FastAPI Modular Structure
The backend follows a modular domain-driven layout with asynchronous endpoints and dependency injection.

```
backend/
├── app/
│   ├── api/
│   │   ├── health.py             # System health & dependency status probe
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py           # Phone OTP request & verification
│   │       │   ├── users.py          # Farmer profile management
│   │       │   ├── farms.py          # Farm plot CRUD
│   │       │   ├── crops.py          # Crop catalog management
│   │       │   ├── disease.py        # Leaf image upload & ML disease diagnosis
│   │       │   ├── chat.py           # RAG AI advisory chatbot
│   │       │   ├── weather.py        # Live weather & spraying advisories
│   │       │   ├── mandi.py          # APMC market commodity rates
│   │       │   ├── feedback.py       # Diagnostic feedback collection
│   │       │   ├── admin_knowledge.py# KB document ingestion
│   │       │   ├── admin_system.py   # System metrics & model tuning
│   │       │   └── voice.py          # Voice recognition helpers
│   │       └── router.py
│   ├── auth/
│   │   ├── jwt.py                # JWT token decoding, user & admin role guards
│   │   └── otp_service.py        # Dev/Production pluggable OTP service
│   ├── core/
│   │   ├── config.py             # Pydantic v2 BaseSettings & environment variables
│   │   ├── logging_config.py     # Structured JSON/console logging
│   │   └── security.py           # JWT token encoding & verification
│   ├── database/
│   │   ├── base.py               # SQLAlchemy declarative base
│   │   ├── init_db.py            # Schema creation & initial database seeding
│   │   └── session.py            # Database engine & sessionmaker
│   ├── models/                   # SQLAlchemy ORM Models
│   ├── schemas/                  # Pydantic v2 Schemas for Validation
│   ├── services/
│   │   ├── cache_service.py           # In-memory TTL cache with thread lock
│   │   ├── disease_ml_service.py      # MobileNetV2 inference & Mock fallback adapter
│   │   ├── document_ingestion.py      # PDF text extraction & sentence-aware chunking
│   │   ├── image_validation_service.py# OpenCV foliage detection & blur check
│   │   ├── intent_detector.py         # Marathi & English regex intent classifier
│   │   ├── mandi_service.py           # data.gov.in integration with APMC fallbacks
│   │   ├── rag_advisor.py             # RAG pipeline & Claude LLM grounded synthesis
│   │   ├── vector_store.py            # ChromaDB client & sentence-transformers embeddings
│   │   └── weather_service.py         # OpenWeatherMap API & agro-advisory rules
│   └── main.py                   # FastAPI App initialization & Middleware
```

---

## 5. Database ERD & Schema Design

### Entity Relationship Diagram
```mermaid
erDiagram
    USERS ||--o| FARMER_PROFILES : has
    USERS ||--o{ CROP_SCANS : performs
    USERS ||--o{ ADVISORY_QUERIES : asks
    USERS ||--o{ FEEDBACK : provides
    CROP_SCANS ||--o| FEEDBACK : evaluates
    ADVISORY_QUERIES ||--o| FEEDBACK : evaluates

    USERS {
        uuid id PK
        string phone_number UK
        string role "farmer | admin"
        string preferred_language "mr | en"
        datetime created_at
    }

    FARMER_PROFILES {
        uuid id PK
        uuid user_id FK
        string full_name
        string district
        string taluka
        string village
        float land_size_acres
        string primary_crops
        string soil_type
        string irrigation_source
    }

    CROP_SCANS {
        uuid id PK
        uuid user_id FK
        string image_path
        string detected_disease
        float confidence_score
        jsonb symptoms_json
        text recommendation_summary
        datetime scanned_at
    }

    ADVISORY_QUERIES {
        uuid id PK
        uuid user_id FK
        text user_query
        boolean voice_input
        text response_text
        jsonb retrieved_sources
        datetime created_at
    }

    FEEDBACK {
        uuid id PK
        uuid user_id FK
        uuid scan_id FK
        uuid query_id FK
        int rating_stars "1 to 5"
        text comment
        boolean helpful
        datetime created_at
    }

    WEATHER_CACHE {
        uuid id PK
        string district UK
        jsonb current_weather
        jsonb forecast_daily
        datetime updated_at
    }

    MANDI_PRICES {
        uuid id PK
        string market_name
        string commodity
        float min_price
        float max_price
        float modal_price
        date price_date
    }
```

---

## 6. API Architecture

### Key REST Endpoints (v1)

| Endpoint | Method | Purpose | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/request-otp` | `POST` | Request phone OTP | No |
| `/api/v1/auth/verify-otp` | `POST` | Verify OTP & return JWT token | No |
| `/api/v1/users` | `GET/PUT` | Get/update farmer profile details | Yes |
| `/api/v1/farms` | `GET/POST/PUT/DELETE` | Farm plot CRUD | Yes |
| `/api/v1/crops` | `GET/POST` | Crop catalog management | Yes |
| `/api/v1/disease/predict` | `POST` | Upload photo & run OpenCV + MobileNetV2 inference | Yes |
| `/api/v1/disease/history` | `GET` | Retrieve past scan results for farmer | Yes |
| `/api/v1/chat/message` | `POST` | Execute voice/text grounded RAG query via Claude API | Yes |
| `/api/v1/weather/current` | `GET` | Get location/district weather forecast & agromet advice | Yes |
| `/api/v1/mandi/prices` | `GET` | Fetch commodity market prices filtered by district | Yes |
| `/api/v1/feedback` | `POST` | Submit star rating / comment for scan or advice | Yes |
| `/api/v1/voice` | `POST` | Voice recognition processing helpers | Yes |
| `/api/v1/admin/knowledge` | `POST` | Ingest new KVK/ICAR PDF documents into ChromaDB | Admin |
| `/api/v1/admin` | `GET` | Fetch platform usage, disease prevalence & feedback scores | Admin |
| `/health` | `GET` | System dependency health probe | No |

---

## 7. ML Architecture (Crop Disease Detection — Hybrid 3-Tier Vision)

```mermaid
graph TD
    Img[User Leaf Image Upload] --> OpenCV[OpenCV Preprocessing<br/>Resize 224x224, Normalization,<br/>Color & Blur Gating]
    OpenCV --> T1[Tier 1: Local MobileNetV2 CNN<br/>.keras / .h5 — 200ms offline]
    T1 --> ConfCheck{Confidence ≥ 0.70<br/>& Crop Matches?}
    ConfCheck -->|Yes| Res[Disease Result + Treatment Guide<br/>from 18-Class Catalog]
    ConfCheck -->|No| T2[Tier 2: Google Gemini 3.5 Flash Lite Vision<br/>Dynamic Cloud AI Escalation]
    T2 -->|95%+ Accuracy| Res
    T2 -->|Cloud Offline / Failed| Fallback[Tier 3: Heuristic Fallback<br/>Prompt KVK Expert Check]
```

- **Tier 1 (Offline / Edge)**: MobileNetV2 lightweight CNN pre-trained on ImageNet and fine-tuned for agricultural foliage (`ml/models/mobilenetv2_crop_disease.keras` with `.h5` fallback). Delivers ~200ms low-latency inference for rural edge scenarios.
- **Tier 2 (Cloud / Precision)**: Google Gemini 3.5 Flash Lite Vision via official `google-genai` SDK. Automatically engaged when Tier 1 confidence is below 70% or when complex field lighting/background foliage creates out-of-distribution domain shift.
- **Tier 3 (Safe Fallback)**: Mock heuristic classifier based on OpenCV HSV hue/saturation and Laplacian variance, ensuring the service never crashes even during total network or weight unavailability.
- **Preprocessing Pipeline (OpenCV)**:
  1. Image decoding & format validation (`.jpg`, `.jpeg`, `.png`, `.webp`).
  2. Blur detection via Laplacian variance (`variance < 100` rejected).
  3. Darkness check via mean brightness thresholding.
  4. Resizing to \(224 \times 224 \times 3\) tensor format with \([-1, 1]\) normalisation.
- **18-Disease Clinical Catalog**:
  - Relational database catalog (`disease_catalog` table) holding verified treatment protocols across 18 classes:
    - **Potato (3)**: Early Blight, Late Blight, Healthy.
    - **Corn (4)**: Cercospora Leaf Spot, Common Rust, Northern Leaf Blight, Healthy.
    - **Tomato (10)**: Early Blight, Late Blight, Bacterial Spot, Leaf Mold, Septoria, Spider Mites, Target Spot, Yellow Leaf Curl, Mosaic Virus, Healthy.
    - **Cotton (1)**: Bacterial Blight.
  - Full bilingual (English & Marathi) CIBRC-compliant chemical spray recommendations (dosages per liter), organic treatments (Neem oil, Trichoderma), and cultural prevention measures.

---

## 8. RAG Architecture (KVK/ICAR Grounded Advisory)

```mermaid
graph TD
    UserQ[User Voice/Text Query] --> Lang[Language Normalizer<br/>Marathi/English]
    Lang --> Embed[sentence-transformers Embedding Generator]
    Embed --> ChromaDB[ChromaDB Vector Store<br/>KVK / ICAR Document Chunks]
    ChromaDB --> Context[Top-K Document Passages]
    Context --> ClaudePrompt[System Prompt Construction<br/>Groundedness Enforcement]
    ClaudePrompt --> ClaudeAPI[Anthropic Claude API]
    ClaudeAPI --> Resp[Localized Response + Citation Source]
```

- **Document Processing**: KVK (Krishi Vigyan Kendra) extension guides, ICAR crop manuals, and Maharashtra Agricultural University advisories parsed, chunked (500 tokens with 50-token overlap), and stored.
- **Embeddings**: `sentence-transformers` (`all-MiniLM-L6-v2` / multilingual embedding) generating 384-dimensional dense vectors.
- **Vector Database**: ChromaDB running persistent vector storage with cosine similarity indexing.
- **System Prompt Guardrails**: Strictly forbids ungrounded hallucinated remedies, mandates simple agricultural Marathi/English terms, and enforces structure:
  1. *Immediate Action*
  2. *Recommended Treatment/Fertilizer*
  3. *Preventative Measures*
  4. *Source Knowledge Document Citation*

---

## 9. Authentication Architecture

- **Farmer Authentication**: Phone number based authorization returning a short-lived JSON Web Token (JWT). Designed for high accessibility without requiring complex passwords.
- **Admin Authentication**: Email/Username + Secure Password Hashing (Bcrypt) + Role-Based Access Control (`role: "admin"`).
- **Session Security**: JWT stored securely in HttpOnly cookies / encrypted local storage, attached via `Authorization: Bearer <token>` HTTP request headers.

---

## 10. Admin Architecture

The Admin Dashboard provides agricultural extension officers and system administrators with tools to maintain system quality:

```
+-------------------------------------------------------------------+
| AGRISENSE ADMIN PORTAL                                            |
+-------------------+-----------------------------------------------+
| - Knowledge Base  | [ Upload KVK/ICAR Manual (PDF) ]              |
| - Disease Models  | Active Collections: 14 documents indexed       |
| - Market Config   +-----------------------------------------------+
| - Feedback Audit  | Recent Farmer Feedback & Disease Trends       |
| - System Health   | District: Nashik | Common Issue: Tomato Blight|
+-------------------+-----------------------------------------------+
```

- **Knowledge Base Manager**: Upload PDF/Text manuals directly to trigger background text extraction, chunking, and ChromaDB vector indexing.
- **Disease & Model Config**: Toggle active disease classes and update confidence threshold parameters.
- **Analytics & Feedback Monitor**: Visual map of prevalent crop diseases by district in Maharashtra and low-rating query review.

---

## 11. PWA & Offline Architecture

```mermaid
graph TD
    App[PWA Client] --> SW{Network Status}
    SW -->|Online| Network[Fetch API / Remote Backend]
    SW -->|Offline| OfflineStore[IndexedDB & Service Worker Cache]
    Network -->|Cache Response| CacheStorage[Service Worker Cache]
    OfflineStore --> UI[Serve Cached Weather, Mandi Prices & Scan History]
```

- **Service Worker Engine**: Workbox strategy via Vite PWA plugin (`vite-plugin-pwa`).
- **Caching Strategies**:
  - `StaleWhileRevalidate`: Static assets, UI components, fonts.
  - `NetworkFirst`: Advisory chat API, live disease scanning.
  - `CacheFirst` (with TTL): Weather forecasts, Mandi prices, user profile details.
- **Offline Storage (IndexedDB)**: Stores recent scan history, offline advisory queue, and saved Marathi agricultural guides for offline access during field visits with zero connectivity.

---

## 12. Folder Structure

```
Agrisense 1/
├── docs/
│   ├── architecture.md       # Full technical architecture (this file)
│   ├── PRD.md                # Product Requirements Document
│   ├── development-plan.md   # Multi-phase execution roadmap
│   └── test-report.md        # QA test results matrix
├── frontend/                 # React + Vite + TypeScript PWA
│   ├── public/               # Favicon, PWA manifest (manifest.json), sw.js
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── i18n/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                  # Python FastAPI application
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── chroma_db/            # ChromaDB persistent vector index
│   ├── static/scans/         # Uploaded leaf scan images
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── ml/
│   ├── dataset/              # PlantVillage & field photos (place images here)
│   ├── evaluation/           # Model accuracy evaluation scripts
│   └── training/             # MobileNetV2 transfer learning pipeline
├── chroma_db/                # Root-level ChromaDB (used when running from project root)
├── static/scans/             # Root-level static scan storage
├── .env                      # Active environment configuration
├── .env.example              # Environment variables template (placeholders only)
└── README.md
```

---

## 13. Environment Variables Specification

Refer to [.env.example](./../.env.example) for exact defaults and structure.

- `DATABASE_URL`: PostgreSQL connection string.
- `ANTHROPIC_API_KEY`: Key for Claude API.
- `OPENWEATHER_API_KEY`: Key for OpenWeatherMap.
- `DATA_GOV_IN_API_KEY`: Key for Agmarknet Mandi prices.
- `CHROMA_PERSIST_DIRECTORY`: Path for ChromaDB storage.
- `SECRET_KEY`: JWT signing secret key.
- Configurable Placeholders (`DISEASE_CLASSES`, `KNOWLEDGE_SOURCES`, `VOICE_PROVIDER`, `MANDI_MARKETS`, `PRODUCTION_HOSTING_PROVIDER`).

---

## 14. Dependency List

### Frontend (`frontend/package.json`)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.1",
    "i18next": "^23.14.0",
    "react-i18next": "^14.2.0",
    "lucide-react": "^0.439.0",
    "axios": "^1.7.7",
    "idb": "^8.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.2",
    "vite-plugin-pwa": "^0.20.5"
  }
}
```

### Backend (`backend/requirements.txt`)
```text
fastapi>=0.112.0
uvicorn[standard]>=0.30.0
pydantic>=2.8.0
pydantic-settings>=2.4.0
sqlalchemy>=2.0.32
psycopg2-binary>=2.9.9
alembic>=1.13.2
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
anthropic>=0.34.0
chromadb>=0.5.5
sentence-transformers>=3.0.1
opencv-python-headless>=4.10.0
torch>=2.4.0
torchvision>=0.19.0
requests>=2.32.3
python-multipart>=0.0.9
```

---

## 15. Development Phases

```mermaid
flowchart LR
    p0["Phase 0\nArchitecture & Analysis\n(DONE)"] --> p1["Phase 1\nCore Setup & Schema\n(DONE)"]
    p1 --> p2["Phase 2\nWeather & Mandi\n(DONE)"]
    p2 --> p3["Phase 3\nML Vision Engine\n(DONE)"]
    p3 --> p45["Phase 4 & 5\nRAG & Voice Advisory\n(DONE)"]
    p45 --> p6["Phase 6\nHistory & Feedback\n(DONE)"]
    p6 --> p7["Phase 7\nAdmin Portal\n(DONE)"]
    p7 --> p8["Phase 8\nIntegration QA & Security\n(DONE)"]
```

- **Phase 0**: Project Analysis, Technical Architecture, PRD, and Environment setup.
- **Phase 1**: Workspace scaffolding, database schema, FastAPI boilerplate, React PWA shell.
- **Phase 2**: MobileNetV2 + OpenCV image preprocessing & crop disease detection endpoint.
- **Phase 3**: ChromaDB KVK/ICAR document ingestion, RAG pipeline, Claude API integration, Marathi/English voice interface.
- **Phase 4**: OpenWeatherMap API integration, Agmarknet Mandi price dashboard, PWA service worker offline caching.
- **Phase 5**: Admin portal, feedback logging, performance optimizations, end-to-end verification.

---

## 16. Risks & Mitigation Strategies

| Risk Factor | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Poor Low-Bandwidth Connectivity** | High | Service Worker aggressive PWA caching, IndexedDB query storage, compressed image upload pipeline. |
| **Marathi Dialect Variation in Speech** | High | Web Speech API primary with configurable STT provider fallback; bilingual UI toggle always accessible. |
| **Crop Image Misclassification** | Medium | OpenCV color segmentation, HSV foliage detection, strict confidence thresholding (0.70) with KVK manual fallback. |
| **API Rate Limits / LLM Costs** | Medium | ChromaDB vector search caching, strict context token windows for Claude API requests. |
| **Outdated Mandi Price Feeds** | Low | Local database caching with timestamped validity indicators and fallback price estimations. |

---

## 17. Unresolved Requirements & Configurable System Parameters

The primary Needs Assessment and Project Proposal documents intentionally leave certain ecosystem parameters flexible. In accordance with system instructions, these are explicitly modeled as **configurable placeholders**:

- `DISEASE_CLASSES = configurable`: Array of supported plant pathology classes (e.g., `["Tomato_Early_Blight", "Cotton_Bollworm", "Sugarcane_Rust", "Configurable_Class_3"]`).
- `KNOWLEDGE_SOURCES = configurable`: Vector store collection pointers for KVK / ICAR manuals.
- `VOICE_PROVIDER = configurable`: Adapter interface supporting Web Speech API, Google Cloud Speech-to-Text, or Whisper API.
- `MANDI_MARKETS = configurable`: List of Agmarknet APMC markets in Maharashtra (e.g., `["Nashik", "Pune", "Nagpur", "Solapur"]`).
- `PRODUCTION_HOSTING_PROVIDER = configurable`: Cloud agnostic deployment configuration (AWS / GCP / Azure / Railway / Render).
