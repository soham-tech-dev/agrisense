# ===================================================================
# AGRISENSE FULL-STACK STANDALONE DOCKERFILE
# ===================================================================

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
ENV VITE_FIREBASE_API_KEY=AIzaSyAqCMZ47E2ciBlggnh1OITm2N_Rrb1zSdw
ENV VITE_FIREBASE_AUTH_DOMAIN=agrisense-1b3be-1d923.firebaseapp.com
ENV VITE_FIREBASE_PROJECT_ID=agrisense-1b3be-1d923
ENV VITE_FIREBASE_STORAGE_BUCKET=agrisense-1b3be-1d923.firebasestorage.app
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=689958536903
ENV VITE_FIREBASE_APP_ID=1:689958536903:web:22165acbfdbcd8202120e2
ENV VITE_VOICE_PROVIDER=webspeech
RUN npm run build

# Stage 2: Python Backend Runtime with Frontend Assets
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY backend/static ./static
COPY ml ./ml

# Mount compiled frontend dist into backend serving directory
COPY --from=frontend-build /frontend/dist /frontend/dist

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
