<p align="center">
  <img src="https://img.shields.io/badge/status-active-success.svg" alt="Status" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
</p>

<div align="center">
  <h1>MediBridge AI</h1>
  <p><strong>AI-Powered Healthcare Referral Management Platform</strong></p>
  <p>
    A full-stack SaaS platform connecting hospitals, doctors, and patients through intelligent referral orchestration, real-time collaboration, and AI-driven clinical decision support.
  </p>
</div>

---

## Overview

MediBridge is a comprehensive healthcare referral management system that streamlines the end-to-end referral lifecycle — from triage and hospital matching to bed reservation, patient tracking, and analytics. An integrated AI layer provides clinical copilot capabilities, intelligent hospital recommendations, patient snapshots, and automated document analysis.

### Services

| Service | Tech Stack | Port | Description |
|---------|-----------|------|-------------|
| **Client** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui | `5173` | Responsive SPA with role-based dashboards |
| **Server** | Node.js, Express 5, MongoDB/Mongoose, Socket.IO | `5000` | REST API + real-time event bus |
| **AI Service** | Python, FastAPI, ChromaDB, OpenRouter (DeepSeek) | `8000` | LLM-powered clinical intelligence & RAG |

---

## Features

### Core Platform
- **Role-Based Access** — SUPER_ADMIN, HOSPITAL_ADMIN, REFERRAL_COORDINATOR, DOCTOR with granular route & action guards.
- **Hospital Management** — Directory, capacity tracking, bed availability, CRUD operations.
- **Doctor Directory & Dashboard** — Specialization filtering, availability status, hospital assignment, and dedicated doctor dashboards.
- **Referral Management** — Create, track, accept, reject, complete referrals with Kanban & Table views.
- **Bed Reservations** — Time-limited bed holds with live countdown, extend/cancel/arrive/complete lifecycle.
- **Real-Time Updates** — Socket.IO powered live dashboard, notifications, and event-driven UI refresh.
- **Reports & Analytics** — Executive summaries, hospital/doctor/referral analytics with Recharts visualizations.
- **Admin & User Management** — Full user lifecycle, registration, settings, and role adjustments.
- **Audit Logs** — Full activity trail with module filtering and search.
- **Location Intelligence (Maps)** — Interactive hospital mapping, proximity search, and routing/ETA capabilities.

### AI-Powered Features
- **Clinical Copilot** — RAG-based document Q&A over uploaded medical PDFs.
- **Patient Snapshot** — Auto-generated clinical summaries of patient history and conditions.
- **Intelligent Hospital Matching** — AI-driven hospital ranking and specialist matching based on patient needs.
- **Smart Referral Engine & Autofill** — Seamlessly extract document information to autofill referral forms and recommend the best destinations.
- **Clinical Intelligence** — AI triage for severity prediction, specialty & hospital recommendations.
- **Document Extraction & Summarization** — Automated extraction of structured data and summaries from medical documents.

---

## Tech Stack

### Frontend
| | |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build** | Vite |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui (Radix primitives) |
| **Charts** | Recharts |
| **Maps** | Leaflet + react-leaflet |
| **HTTP** | Axios |
| **Realtime** | Socket.IO client |
| **Routing** | React Router v7 |
| **Animations** | Framer Motion |

### Backend (Server)
| | |
|---|---|
| **Runtime** | Node.js (CommonJS) |
| **Framework** | Express 5 |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + bcrypt |
| **Realtime** | Socket.IO |
| **File Upload** | Multer |
| **Security** | Helmet, CORS |

### AI Service
| | |
|---|---|
| **Runtime** | Python 3.11 |
| **Framework** | FastAPI |
| **LLM Provider** | OpenRouter (DeepSeek) |
| **Vector Store** | ChromaDB |
| **Embeddings** | all-MiniLM-L6-v2 |
| **PDF Processing** | PyMuPDF |

### Infrastructure
| | |
|---|---|
| **Containerization** | Docker Compose |
| **Database** | MongoDB 7 |

---


## Architecture

```
medibridge-ai/
├── client/               # React SPA
│   └── src/
│       ├── components/   # Shared UI (common, analytics, layout, ui)
│       ├── features/     # Domain modules (admin, copilot, dashboard, maps, referrals, etc.)
│       ├── context/      # React contexts (Auth, Socket)
│       ├── hooks/        # Shared hooks
│       ├── lib/          # Utilities, constants, routes
│       ├── pages/        # Route page components
│       └── services/     # API clients
│
├── server/               # Node.js REST API
│   └── src/
│       ├── config/       # DB, socket setup
│       ├── controllers/  # Route handlers
│       ├── middleware/   # Auth, role guards, error handling
│       ├── models/       # Mongoose schemas
│       ├── routes/       # Express route definitions (referral, copilot, ai, upload, admin, etc.)
│       ├── services/     # Business logic
│       └── utils/        # Helpers
│
├── ai-service/           # Python FastAPI service
│   └── app/
│       ├── api/          # Route handlers (chat, snapshot, recommendation, extraction, etc.)
│       ├── core/         # Config, exceptions, logging
│       ├── models/       # Pydantic schemas
│       └── services/     # LLM, vector, extraction, matching
│
├── docs/                 # Documentation
└── docker-compose.yml    # Full-stack orchestration
```

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| npm | 10+ |
| Python | 3.11+ |
| MongoDB | 7+ (local or Docker) |
| Docker + Compose | Optional |

### Option A — Docker Compose (recommended)

```bash
# Clone and start all services
docker compose up --build
```

| Service | URL |
|---------|-----|
| Client | http://localhost:5173 |
| API | http://localhost:5000/api |
| AI Service | http://localhost:8000/docs |
| MongoDB | localhost:27017 |

### Option B — Manual

**1. MongoDB**
```bash
docker compose up mongo -d
```

**2. Server**
```bash
cd server
cp .env.example .env   # Configure MongoDB URI, JWT secret
npm install
npm run dev
```

**3. AI Service**
```bash
cd ai-service
cp .env.example .env             # Set OPENROUTER_API_KEY
python -m venv .venv
# Windows: .venv\Scripts\activate
# Unix:    source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**4. Client**
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173

> **Startup order:** MongoDB → Node Server → AI Service → Client

---

## Environment Variables

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:5000/api
VITE_AI_URL=http://localhost:8000/api/ai
VITE_SOCKET_URL=http://localhost:5000
```

### Server (`server/.env`)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medibridge
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### AI Service (`ai-service/.env`)
```
OPENROUTER_API_KEY=sk-...
OPENROUTER_MODEL=deepseek/deepseek-chat-v3
ENVIRONMENT=development
```

---

## API Overview

### REST Endpoints (Server)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/auth/profile` | Current user profile |
| `GET` | `/api/dashboard/stats` | System KPIs |
| `GET` | `/api/hospitals` | Hospital directory |
| `GET` | `/api/doctors` | Doctor directory |
| `GET` | `/api/referrals` | Referral list |
| `POST` | `/api/referrals` | Create referral |
| `GET` | `/api/reservations` | Bed reservations |
| `GET` | `/api/notifications` | User notifications |
| `GET` | `/api/reports/*` | Analytics reports |
| `GET` | `/api/admin/*` | Admin endpoints |
| `GET` | `/api/users/*` | User management |
| `GET` | `/api/copilot/*` | Copilot operations |

### AI Endpoints (`/api/ai/*` via AI Service)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/chat` | Clinical Copilot Q&A |
| `POST` | `/api/ai/upload` | Upload medical document |
| `POST` | `/api/ai/summary` | Document summarization |
| `POST` | `/api/ai/extraction` | Structured data extraction |
| `POST` | `/api/ai/hospital-match` | AI hospital matching |
| `POST` | `/api/ai/recommendation` | Smart referral recommendations |
| `POST` | `/api/ai/clinical-intelligence` | Severity & specialty prediction |
| `POST` | `/api/ai/snapshot` | Patient clinical snapshot |

---

## Data Models

| Model | Collection | Purpose |
|-------|-----------|---------|
| `User` | `users` | Authentication, roles, hospital assignment |
| `Hospital` | `hospitals` | Facilities, bed capacity, location |
| `Doctor` | `doctors` | Staff, specialization, availability |
| `Referral` | `referrals` | Patient referral records |
| `BedReservation` | `bedreservations` | Time-bound bed holds |
| `Notification` | `notifications` | User notifications |
| `ActivityLog` | `activitylogs` | Audit trail |
| `Document` | `documents` | Medical documents & references |

---

## License

MIT
