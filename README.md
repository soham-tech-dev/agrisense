# AgriSense (अ‍ॅग्रीसेन्स) — AI Digital Farming Assistant

**AgriSense** is an AI-driven agricultural decision-support and advisory platform designed specifically for smallholder farmers in Maharashtra, India. It combines computer vision, retrieval-augmented generation (RAG), live agro-climatic data, and APMC market intelligence with a bilingual (Marathi & English) voice-first interface.

---

## 🌟 Key Features

1. **Crop Disease Diagnosis**: Instant leaf disease identification via MobileNetV2 transfer learning with OpenCV foliage validation and calibrated confidence thresholding.
2. **KVK / ICAR Grounded Advisory**: Grounded RAG advisor powered by ChromaDB vector search and LLM synthesis with safety fallbacks to prevent hallucinations.
3. **Voice-First Vernacular Interaction**: Full bilingual Marathi (`mr`) and English (`en`) support with Web Speech STT and TTS audio output.
4. **Agro-Climatic Intelligence**: Live weather telemetry and 5-day forecasts with spraying/irrigation decision advisories.
5. **Mandi Market Discovery**: APMC mandi price tracking (modal, min, max rates) with market price comparison across Maharashtra.
6. **Farm & Plot Profile Management**: Multi-plot tracking with soil type, acreage, irrigation sources, and crop seasons.
7. **Offline-Resilient PWA**: Progressive Web App capabilities with local storage fallback for continuous field operation.
8. **Admin Control Portal**: Vector knowledge base ingestion, diagnostic feedback reviews, and system health telemetry.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend API**: FastAPI (Python 3.11+), Pydantic v2, Uvicorn, SQLAlchemy
- **Database**: SQLite (local development) / PostgreSQL (production)
- **Vector Database**: ChromaDB with `sentence-transformers` (`all-MiniLM-L6-v2`)
- **Computer Vision / ML**: OpenCV, MobileNetV2, PIL
- **Authentication**: Firebase Authentication (Email/Password & Google Sign-In) + JWT
- **Containerization**: Docker, Docker Compose

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Git

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API documentation will be available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Configure your Firebase credentials in frontend/.env

# Start Vite dev server
npm run dev
```
The application will be live at: `http://localhost:3000`

---

## 🔒 Security & Privacy

- All sensitive credentials, API keys, and environment files (`.env`) are excluded from version control via `.gitignore`.
- Production database URLs, secrets, and private keys should be supplied via secure environment variables.
- Copy `.env.example` to `.env` in both root and `frontend/` directories and provide your own keys for local development.

---

## 📄 License

This project is licensed under the MIT License.
