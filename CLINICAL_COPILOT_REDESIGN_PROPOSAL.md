# Phase 21 — Clinical Copilot Redesign Proposal

## 1. Architecture Audit

### Current Overview

The Clinical Copilot is a standalone feature (route: `/copilot`) consisting of 15 React components, 4 hooks, 1 service, 1 types file, and 1 utils file on the frontend. On the backend it spans 1 Node.js controller (538 lines), 2 MongoDB models, and several AI service endpoints.

### Critical Issues Found

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 1 | **Hardcoded demo patient IDs** — `PATIENT001`, `PATIENT002` used as defaults for patient context, initial sessions, and patient switcher | `CopilotView.tsx:36-43`, `CopilotPage.tsx`, `patientSwitcher` options | Critical |
| 2 | **No referral integration** — Copilot is a separate page, not contextually linked to referral creation/viewing. Each referral has a "Launch Copilot" button but no data is passed | `ReferralDetailPage.tsx`, `CopilotPage.tsx` | Critical |
| 3 | **No document awareness** — Documents uploaded via referral flow use temp UUIDs as `patient_id` in ChromaDB. The re-scope endpoint moves them to MongoDB `_id`, but Copilot queries by the same temp UUIDs. No overlap. | `ai-service/app/services/vector_service.py`, `copilot controller` | High |
| 4 | **Fragile server-side patient mapping** — The copilot controller intercepts `patientId` and tries to match demo IDs (`PATIENT001`) or temp UUIDs to real MongoDB ObjectIds. This is runtime string matching with a hardcoded map. | `server/src/controllers/copilot.controller.js:57-83` | High |
| 5 | **Demo data in production paths** — `PatientSnapshot`, `ClinicalIntelligence`, `QuickActions`, and quick starters reference hardcoded demo data. The AI service returns convincing-looking but fake patient data. | `ai-service/app/api/snapshot.py`, `ai-service/app/api/clinical_intelligence.py` | High |
| 6 | **No loading/error/empty boundaries** — Many components assume data is available. No Suspense boundaries. No error recovery UX. | Most components in `features/copilot/components/` | Medium |
| 7 | **Conflated state management** — Patient context is wrangled across 4 layers: `CopilotPage` → `CopilotView` → individual components → `PatientInsightsDrawer`. Prop drilling for `patientId`, `patientName`, `snapshot`, etc. | `CopilotPage.tsx`, `CopilotView.tsx` | Medium |
| 8 | **Overly complex socket events** — 4 separate Copilot-specific socket events each with their own handler, loading state, and data shape. No unified connection lifecycle. | `hooks/useSocket.ts`, `CopilotView.tsx` | Medium |
| 9 | **No document pagination** — `getDocuments` fetches all documents at once. No cursor, no limit, no pagination. | `server/src/controllers/copilot.controller.js`, `DocumentsPanel.tsx` | Low |
| 10 | **No TypeScript strictness** — Core types use `Partial<>` extensively. `PatientContext` has every field optional. | `types/copilot.types.ts` | Low |
| 11 | **Static quick starters** — `QUICK_STARTERS` are hardcoded strings unrelated to the actual patient or referral context. | `types/copilot.types.ts` | Low |
| 12 | **No audit trail** — Copilot interactions (chat, snapshot views, recommendations) are not logged for compliance. | All layers | Low |

---

## 2. Proposed New Architecture

### Guiding Principles

1. **Context-driven, not page-driven** — The Copilot activates based on what the user is doing (viewing a referral, uploading documents, etc.), not by navigating to `/copilot`.
2. **Real patient data only** — No demo defaults. If there is no patient context, show a meaningful empty state.
3. **Document-aware** — The Copilot should know which documents are associated with the current patient and surface them in retrieval.
4. **Referral-integrated** — The Copilot should be accessible as a slide-over panel within the referral detail view, not as a separate page.
5. **Resilient by default** — Every component handles loading, error, and empty states. Socket reconnection is transparent.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React App                         │
│                                                      │
│  ┌──────────────┐    ┌─────────────────────────────┐│
│  │ Referral View│    │   CopilotSlideOver           ││
│  │ (detail page)│───▶│   ┌───────────────────────┐ ││
│  │              │    │   │ ChatPanel             │ ││
│  │              │    │   │ PatientSnapshotPanel  │ ││
│  │              │    │   │ DocumentsPanel        │ ││
│  │              │    │   │ SmartActions          │ ││
│  │              │    │   └───────────────────────┘ ││
│  └──────────────┘    └─────────────────────────────┘│
│         │                                           │
│         ▼                                           │
│  ┌──────────────────────────────────────────┐       │
│  │  CopilotContext (React Context)           │       │
│  │  - patientId, patientName, referralId     │       │
│  │  - snapshot, documents, messages          │       │
│  │  - activeSession                          │       │
│  │  - socket connection lifecycle            │       │
│  └──────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────┐
│                   Node Server                        │
│                                                      │
│  ┌────────────────────────────────────────────┐      │
│  │ copilot.controller.js (refactored)          │      │
│  │ - No hardcoded patient mapping              │      │
│  │ - Validates patientId is a real MongoDB ID  │      │
│  │ - Ties referralId → patientId mapping       │      │
│  │ - Paginates document responses              │      │
│  └────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────┐
│                  AI Service                          │
│                                                      │
│  ┌────────────────────────────────────────────┐      │
│  │ All endpoints accept patient_id + referral  │      │
│  │ reference. Queries ChromaDB with real ID.  │      │
│  │ No demo data paths.                        │      │
│  └────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

### Component Tree (New)

```
CopilotProvider (context)
└── CopilotSlideOver (slide-over panel, triggered from referral view)
    ├── CopilotHeader (simplified, no patient switcher)
    ├── ChatPanel
    │   ├── ChatMessageList
    │   │   ├── ChatBubble (user)
    │   │   └── ChatBubble (assistant + evidence)
    │   └── ChatInput
    ├── PatientSnapshotPanel (inline, not drawer)
    │   ├── DiagnosisBlock
    │   ├── RiskIndicator
    │   ├── MedicationsBlock
    │   └── UrgencyBadge
    ├── DocumentsPanel (with pagination cursor)
    ├── SmartActions
    └── QuickStarters (dynamic, based on patient context)
```

### File Impact Summary

| Action | File | Reason |
|--------|------|--------|
| **DELETE** | `client/src/pages/CopilotPage.tsx` | No longer a standalone page |
| **DELETE** | `client/src/features/copilot/components/PatientSwitcher.tsx` | No manual patient selection needed |
| **DELETE** | `client/src/features/copilot/components/ClinicalIntelligence.tsx` | Merged into PatientSnapshotPanel |
| **DELETE** | `client/src/features/copilot/components/PatientInsightsDrawer.tsx` | Replaced by inline PatientSnapshotPanel |
| **DELETE** | `client/src/features/copilot/components/CopilotView.tsx` | Logic distributed to context + slide-over |
| **DELETE** | `client/src/features/copilot/components/DocumentsPanel.tsx` | Rewritten with pagination |
| **REFACTOR** | `client/src/features/copilot/types/copilot.types.ts` | Remove all `Partial<>`, add strict types |
| **REFACTOR** | `client/src/features/copilot/services/copilot.service.ts` | Add pagination params, remove demo paths |
| **REFACTOR** | `client/src/features/copilot/hooks/useSocket.ts` | Simplify to one unified socket handler |
| **REFACTOR** | `server/src/controllers/copilot.controller.js` | Remove hardcoded mapping, add pagination, add audit logging |
| **REFACTOR** | `ai-service/app/api/chat.py` | Remove demo data branching |
| **REFACTOR** | `ai-service/app/api/snapshot.py` | Remove demo data branching |
| **REFACTOR** | `ai-service/app/api/clinical_intelligence.py` | Remove demo data branching |
| **REFACTOR** | `ai-service/app/services/chat_service.py` | Accept optional referral_id context |
| **NEW** | `client/src/features/copilot/context/CopilotContext.tsx` | Centralized state + socket lifecycle |
| **NEW** | `client/src/features/copilot/components/CopilotSlideOver.tsx` | Entry point slide-over panel |
| **NEW** | `client/src/features/copilot/components/ChatPanel.tsx` | Combines message list + input |
| **NEW** | `client/src/features/copilot/components/PatientSnapshotPanel.tsx` | Inline snapshot display |
| **NEW** | `client/src/features/copilot/components/DocumentsPanel.tsx` | Paginated document list |
| **NEW** | `client/src/features/copilot/components/QuickStarters.tsx` | Dynamic starters from patient context |
| **KEEP** | `client/src/features/copilot/components/ChatBubble.tsx` | Minor updates only |
| **KEEP** | `client/src/features/copilot/components/ChatInput.tsx` | Minor updates only |
| **KEEP** | `client/src/features/copilot/components/ChatMessageList.tsx` | Minor updates only |
| **KEEP** | `client/src/features/copilot/components/RiskIndicator.tsx` | Works as-is |
| **KEEP** | `client/src/features/copilot/components/SmartActions.tsx` | Works as-is |
| **KEEP** | `client/src/features/copilot/components/CopilotEmptyState.tsx` | Works as-is |
| **KEEP** | `client/src/features/copilot/components/CopilotHeader.tsx` | Minor updates (remove patient switcher) |
| **KEEP** | `client/src/features/copilot/hooks/useChat.ts` | Minor updates for context |
| **KEEP** | `client/src/features/copilot/hooks/useSnapshot.ts` | Minor updates for context |
| **KEEP** | `client/src/features/copilot/hooks/useRecommendations.ts` | Works as-is |

---

## 3. Data Flow

### Flow A: Opening Copilot from Referral Detail

```
1. User clicks "Copilot" button on ReferralDetailPage
   └─> ReferralDetailPage sets `copilotOpen: true` + passes { referralId, patientId (from referral) }
       └─> CopilotSlideOver mounts
           └─> CopilotContext initializes with { referralId, patientId }
               └─> Socket connects (room: referralId)
               └─> useEffect calls:
                   ├─> POST /api/copilot/snapshot?patientId=<realId>&referralId=<id>
                   ├─> POST /api/copilot/chat/session { patientId, referralId }
                   └─> GET /api/copilot/documents?patientId=<realId>&cursor=0&limit=20
```

### Flow B: Chat Message

```
1. User types message in ChatInput
2. CopilotContext dispatches `sendMessage(text)`
3. Optimistic user message appended to local state
4. POST /api/copilot/chat { sessionId, message, patientId, referralId }
5. Node controller validates patientId is real MongoDB ObjectId
6. Node controller optionally enriches with document excerpts from server-side
7. POST http://ai-service:8000/api/ai/chat { patient_id, message, context_docs }
8. AI service queries ChromaDB for patient_id, retrieves chunks
9. LLM generates response
10. Response sent back through Node → Socket → Client
11. CopilotContext updates messages[] via socket handler
```

### Flow C: Document-Aware Retrieval

```
1. Documents uploaded via referral flow → ChromaDB with metadata: { patient_id: <mongoId>, referral_id: <mongoId> }
2. AI service retrieval filters by patient_id AND referral_id (if provided)
3. Retrieved chunks included in LLM context
4. Sources displayed as evidence links in ChatBubble
```

---

## 4. Migration Strategy

### Phase 21a — Foundation (estimated: 3-5 days)

1. Create `CopilotContext.tsx` with centralized state, socket lifecycle, and action dispatchers
2. Refactor `copilot.types.ts` — remove all `Partial<>`, add proper discriminated unions for states
3. Refactor `copilotService.ts` — add pagination parameters, remove demo paths
4. Create `CopilotSlideOver.tsx` as a mountable panel (accepts `referralId`, `patientId`, `open`, `onClose`)
5. Create `PatientSnapshotPanel.tsx` (inline version of what's currently in the drawer)
6. Integrate `CopilotSlideOver` into `ReferralDetailPage.tsx`

### Phase 21b — Cleanup (estimated: 2-3 days)

7. Remove demo data branching from AI service endpoints (`chat.py`, `snapshot.py`, `clinical_intelligence.py`)
8. Refactor Node copilot controller — remove hardcoded patient mapping, add validation, add pagination
9. Delete deprecated files: `CopilotPage.tsx`, `PatientSwitcher.tsx`, `ClinicalIntelligence.tsx`, `PatientInsightsDrawer.tsx`, `CopilotView.tsx`
10. Rewrite `DocumentsPanel.tsx` with pagination cursor
11. Create dynamic `QuickStarters.tsx` based on patient diagnosis/specialty

### Phase 21c — Polish (estimated: 2-3 days)

12. Add audit logging to copilot controller (chat messages, snapshot views)
13. Add Suspense boundaries around each panel
14. Add error recovery UI (retry buttons, fallback messages)
15. Add toast notifications for socket disconnection/reconnection
16. Run full TypeScript strict check, fix all `any` types
17. Clean up unused socket event handlers

### Rollback Plan

If any phase causes regressions:
- The `CopilotSlideOver` is a pure additive component — it does not modify existing behavior
- Deprecated files should be kept for 1 release cycle before deletion (marked with `@deprecated` JSDoc)
- AI service changes can be toggled via environment variable `USE_DEMO_DATA=true` during transition

---

## 5. Testing Plan

### Unit Tests

| Component | What to Test |
|-----------|-------------|
| `CopilotContext` | Initialization with patientId/referralId, sendMessage dispatches, socket connection lifecycle, error state transitions |
| `copilotService` | All API calls return correct data shapes, pagination params appended, error responses handled |
| `CopilotSlideOver` | Renders children when open, calls onClose, handles null/undefined patientId |
| `PatientSnapshotPanel` | Renders all sections (diagnosis, risk, medications, urgency), handles null data gracefully |
| `DocumentsPanel` | Pagination cursor increments, "Load more" button, empty state, loading skeleton |

### Integration Tests

| Scenario | Expected Result |
|----------|----------------|
| Open Copilot from referral detail | Slide-over opens, socket connects, snapshot loads, initial session created |
| Send chat message | Optimistic message appears, socket delivers response, evidence links work |
| Switch referral context | Old slide-over closes, new slide-over opens with new patient context and fresh session |
| Network disconnect | UI shows "Reconnecting..." banner, auto-reconnects, no message loss |
| No patient documents | Documents panel shows empty state, chat still works |

### Backend Tests

| Endpoint | What to Test |
|----------|-------------|
| `POST /api/copilot/snapshot` | Valid patientId returns snapshot, invalid returns 400, missing returns 404 |
| `POST /api/copilot/chat` | Valid sessionId streams response, invalid sessionId creates new session, malformed returns 400 |
| `GET /api/copilot/documents` | cursor/limit params respected, total count returned, empty result set handled |
| Socket events | Server emits to correct room, client receives all event types, reconnection replays missed events |

### Manual QA Checklist

- [ ] Open referral detail → click Copilot → slide-over opens within 2s
- [ ] Snapshot loads with correct patient name/diagnosis
- [ ] Type a question → response streams in with evidence citations
- [ ] Click document link → scrolls to document in panel
- [ ] Close slide-over → socket disconnects cleanly
- [ ] Switch to another referral → new copilot context loads
- [ ] Kill Node server → client shows "Reconnecting" → restart → auto-reconnects
- [ ] No demo data visible anywhere in UI
