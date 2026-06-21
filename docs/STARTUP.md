# MediBridge — Startup Guide

Phase 20.1 production-readiness reference for local and Docker development.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| npm | 10+ |
| Python | 3.11+ |
| MongoDB | 7+ (local install or Docker) |
| Docker + Compose | Optional, for full stack |

Copy environment files before first run:

```bash
cp server/.env.example server/.env
cp ai-service/.env.example ai-service/.env
cp client/.env.example client/.env
```

Set `OPENROUTER_API_KEY` in `ai-service/.env` for Clinical Copilot and AI recommendations.

---

## Option A — Docker Compose (recommended)

From the repository root:

```bash
docker compose up --build
```

| Service | URL | Notes |
|---------|-----|-------|
| Client (Vite) | http://localhost:5173 | SPA dev server |
| Node API | http://localhost:5000/api | REST + Socket.IO |
| AI Service | http://localhost:8000 | FastAPI; docs at `/docs` |
| MongoDB | localhost:27017 | Database `medibridge` |

Health checks:

```bash
curl http://localhost:5000/api/health
curl http://localhost:8000/docs
```

Stop:

```bash
docker compose down
```

Persistent data: MongoDB, ChromaDB vectors, and PDF uploads use named Docker volumes.

---

## Option B — Manual (three terminals)

### 1. MongoDB

Run MongoDB locally on `27017`, or start only the database container:

```bash
docker compose up mongo -d
```

### 2. Server

```bash
cd server
npm install
npm run dev
```

Expected: `MongoDB Connected` and `Server running on port 5000`.

### 3. AI Service

```bash
cd ai-service
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Expected: startup validates OpenRouter key and ChromaDB. Without a valid key, the service exits at startup.

### 4. Client

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

---

## Startup Order

```
MongoDB → Node Server → AI Service → Client
```

- **Server** requires MongoDB before accepting connections.
- **AI Service** calls Node at `NODE_API_BASE_URL` for hospital matching data; start the server first.
- **Client** calls Node (`VITE_API_URL`) and AI service directly (`VITE_AI_URL`) from the browser.

---

## Production Build (client only)

```bash
cd client
npm run build
npm run preview
```

Serve the `client/dist` output behind a static host; point env vars at production API URLs.

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| AI service won't start | `OPENROUTER_API_KEY` set in `ai-service/.env` |
| Copilot returns no documents | Upload PDFs via `POST /api/ai/upload` with matching `patient_id` |
| Hospital match fails | Server running; `NODE_API_BASE_URL` reachable from AI service |
| Socket offline | `VITE_SOCKET_URL` matches Node server origin |
| Mongo connection error | `MONGODB_URI` correct; MongoDB running |
