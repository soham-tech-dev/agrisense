# AgriSense — Product Requirements Document (PRD)

## 1. Executive Summary & Problem Statement

Smallholder farmers in Maharashtra face significant challenges in crop health management, timely weather guidance, and market price discovery. Decision-making is currently dominated by intuition and guesswork, leading to lower crop yields and lost income.

**AgriSense** is an AI-powered agricultural advisory platform designed specifically for smallholder farmers in Maharashtra. It combines mobile crop disease detection, voice-first Marathi and English interaction, KVK/ICAR-grounded AI advisories, live weather intelligence, and mandi price tracking into a single, offline-resilient Progressive Web App (PWA).

---

## 2. Research Grounding & Key User Metrics

This PRD is strictly grounded in the empirical survey findings from *Assignment 1 (Needs Assessment)* and *Assignment 2 (Project Proposal)*:

- **Smartphone Access**: **97.1%** smartphone ownership among surveyed farmers.
- **Daily Connectivity**: **83.5%** daily internet access.
- **Current Disease Diagnosis Gap**: **39.8%** identify diseases through guess/experience; **27.2%** use general online search / AI chat; **45.6%** have used an ag advisory app.
- **Platform Demand**: **80.6%** expressed strong willingness to use AgriSense.
- **Voice Preference**: **75.7%** prefer voice input for agricultural queries.

---

## 3. Target Persona & User Story

### Persona: Ramesh Patil (Smallholder Farmer, Nashik District)
- **Land Size**: 2.5 Acres (Onion & Tomato crops)
- **Primary Language**: Marathi (`mr`)
- **Tech Literacy**: Daily WhatsApp user, prefers voice messages over typing text.
- **Key Pain Point**: Spotted leaf spots on tomato crop. Needs an immediate, trusted treatment recommendation in Marathi without traveling 25 km to the nearest Krishi Seva Kendra.

### Core User Stories
1. *As a farmer, I want to take a photo of an unhealthy leaf so that I can instantly diagnose the disease and view safe treatment steps.*
2. *As a farmer, I want to ask questions in Marathi using my voice so that I can receive simple, spoken agricultural guidance from verified KVK/ICAR manuals.*
3. *As a farmer, I want to check daily mandi prices in my local district so that I can negotiate better prices with traders.*
4. *As a farmer, I want to access my past scan history and weather advisories even when network connectivity drops in my field.*

---

## 4. Product Feature Requirements

### F1. Crop Disease Scanner (MobileNetV2 + OpenCV)
- **Description**: Capture/upload leaf photos for instant pathology identification.
- **Inputs**: Camera stream or uploaded image file.
- **Outputs**: Disease name, confidence score, visual bounding/foliage mask, organic/chemical treatment steps.
- **Requirements**:
  - Process image through OpenCV foliage segmentation before model inference.
  - Display confidence meter. If confidence < 0.70, output a cautious fallback advisory urging expert review.

### F2. KVK/ICAR Grounded AI Advisor (Voice & RAG)
- **Description**: Natural language voice and text agricultural Q&A.
- **Inputs**: Marathi / English speech or text input.
- **Outputs**: Grounded advisory text, speech playback, and citation of Krishi Vigyan Kendra / ICAR source material.
- **Requirements**:
  - Context retrieved from ChromaDB vector database using `sentence-transformers`.
  - Anthropic Claude API synthesizes clear, actionable remedies in Marathi/English.
  - Must not hallucinate unverified remedies.

### F3. Voice-First Multimodal Interface
- **Description**: Seamless speech-to-text and text-to-speech interaction.
- **Inputs**: Microphone audio stream (Web Speech API / SpeechRecognition).
- **Outputs**: Audio synthesis (Web Speech Synthesis / audio player) reading out advice in Marathi (`mr-IN`) or English (`en-IN`).

### F4. Weather & Agromet Advisory Dashboard
- **Description**: Location-based weather forecasting tailored for farm operations.
- **Inputs**: Farmer district location.
- **Outputs**: Temperature, humidity, rain probability, wind speed, 5-day forecast, and crop risk advisories (e.g., high humidity blight risk).
- **Data Source**: OpenWeatherMap API.

### F5. Mandi Commodity Price Tracker
- **Description**: Real-time market prices across APMC markets in Maharashtra.
- **Inputs**: Selected district and commodity (e.g., Onion, Tomato, Cotton, Soybean).
- **Outputs**: Minimum, Maximum, and Modal prices (₹/Quintal) with trend indicators.
- **Data Source**: data.gov.in (Agmarknet).

### F6. Farmer Profile & Crop Portfolio
- **Description**: Personalized farmer metadata for customized advisories.
- **Fields**: Name, District, Taluka, Village, Land Size (Acres), Soil Type, Irrigation Method, Primary Crops.

### F7. Scan & Advisory History
- **Description**: Saved records of previous disease scans and advisory conversations for progress tracking over crop cycles.

### F8. Trust & Feedback Mechanism
- **Description**: 5-star rating system and feedback comments on disease diagnoses and AI advisory answers.
- **Purpose**: Enables continuous monitoring of advisory quality and identifies weak knowledge coverage.

### F9. Progressive Web App (PWA) & Offline Resilience
- **Description**: Offline functionality for field conditions with unreliable connectivity.
- **Requirements**: Service Worker caching of static assets, weather forecasts, and recent scan history via IndexedDB.

### F10. Admin Portal & Knowledge Base Management
- **Description**: Web dashboard for agricultural officers and system admins.
- **Features**: PDF document ingest to ChromaDB, disease model threshold configuration, user feedback audit, usage analytics.

---

## 5. Non-Functional Requirements

- **Performance**: MobileNetV2 disease classification response time ≤ 1.5 seconds; RAG advisory response time ≤ 3.5 seconds.
- **Accessibility**: Tap target minimum size 48x48px; high contrast colors for daylight outdoor readability.
- **Localization**: Dual language support (`mr` Marathi and `en` English) with 100% UI translation coverage.
- **Security & Privacy**: Jwt-based farmer authentication, HTTPS encryption, privacy-compliant handling of photos and location data.
- **Reliability**: Graceful degrading when offline with clear user feedback.

---

## 6. Unresolved Requirements & Configurable Placeholders

The following parameters are deliberately configured as placeholders to allow modular adaptation:

```typescript
// Configurable Placeholders
export const SYSTEM_CONFIG = {
  DISEASE_CLASSES: 'configurable', // Placeholder array for pathology models
  KNOWLEDGE_SOURCES: 'configurable', // Vector DB collection identifiers
  VOICE_PROVIDER: 'configurable', // Web Speech API / Cloud STT provider
  MANDI_MARKETS: 'configurable', // List of monitored APMC markets
  PRODUCTION_HOSTING_PROVIDER: 'configurable' // Cloud deployment target
};
```
