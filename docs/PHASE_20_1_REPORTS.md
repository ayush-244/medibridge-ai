# Phase 20.1 — Stabilization Reports

Generated: June 20, 2026

---

## 1. TypeScript Error Report (pre-fix)

| File | Error | Root Cause |
|------|-------|------------|
| `types/socket.ts` | `SocketEventPayloadMap[SocketEventName]` invalid | 9 events in `SOCKET_EVENTS` missing from payload map |
| `context/SocketContext.tsx` | Same indexing error on line 88 | Cascades from incomplete map |
| `hooks/useSocketEvent.ts` | `Type 'E' cannot be used to index SocketEventPayloadMap` | Same incomplete map |
| `services/auth.service.ts` | `RegisterDoctorPayload` not exported | Type defined in usage but missing from `types/auth.ts` |
| `features/users/hooks/useCreateUser.ts` | `'User' is declared but never used` | Unused import |

**Total:** 18 reported errors (duplicate counts across files).

### Fixes applied

1. Added payload interfaces: `HospitalRegisteredPayload`, `HospitalApprovalPayload`, `HospitalAdminEventPayload`, `DoctorRegisteredPayload`, `DoctorApprovalPayload`, `PasswordChangedPayload`.
2. Mapped all 29 `SOCKET_EVENTS` keys in `SocketEventPayloadMap`.
3. Added `RegisterDoctorPayload` to `types/auth.ts`.
4. Removed unused `User` import from `useCreateUser.ts`.

---

## 2. Build Verification Report

Run after fixes:

```bash
cd client && npm run build
```

Expected: `tsc -b && vite build` completes with exit code 0.

---

## 3. Docker Readiness Report

### Created artifacts

| File | Purpose |
|------|---------|
| `docker-compose.yml` | MongoDB + server + ai-service + client |
| `server/.env.example` | Node environment template |
| `ai-service/.env.example` | AI service environment template |
| `docs/STARTUP.md` | Manual and Docker startup instructions |

### Infrastructure note

`ai-service/app/services/medibridge_api_service.py` now reads `NODE_API_BASE_URL` (default `http://localhost:5000/api`) so the AI service can reach the Node API inside Docker (`http://server:5000/api`).

### Service matrix

| Service | Port | Depends On | Health Signal |
|---------|------|------------|---------------|
| mongo | 27017 | — | `mongosh ping` |
| server | 5000 | mongo | `GET /api/health` |
| ai-service | 8000 | server | FastAPI `/docs` |
| client | 5173 | server, ai-service | Vite dev server |

### Known Docker limitations

- AI service **requires** `OPENROUTER_API_KEY` at startup (fail-fast by design).
- First `docker compose up` runs `npm install` / `pip install` inside containers (slow cold start).
- Browser-facing URLs use `localhost`; CORS is configured for local Vite origins only.

---

## 4. Referral Schema Gap Report

### Frontend create form fields (`CreateReferralFormValues`)

| Field | Required in validation | Sent to API |
|-------|------------------------|-------------|
| `patientName` | Yes | Yes → `patientName` |
| `age` | Implicit (validated if present) | Yes → `age` |
| `gender` | No | **No** — folded into `condition` string only |
| `diagnosis` | Yes | **No** — merged into `condition` |
| `conditionSummary` | No | **No** — merged into `condition` |
| `priority` | Yes | **No** — prefix in `condition` string only |
| `fromHospital` | Yes | Yes → `fromHospital` |
| `toHospital` | Yes | Yes → `toHospital` |
| `requiredSpecialty` | Yes | **No** — appended to `condition` string only |
| `notes` | No | **No** — appended to `condition` string only |

### Frontend API payload (`CreateReferralRequest` → `POST /referrals`)

```typescript
{
  patientName: string;
  age: number;
  condition: string;      // built by buildReferralCondition()
  fromHospital: string;
  toHospital: string;
  requestedBy: string;
}
```

### Backend `Referral` model fields

| Field | Type | Required |
|-------|------|----------|
| `patientName` | String | Yes |
| `age` | Number | Yes |
| `condition` | String | Yes |
| `fromHospital` | ObjectId → Hospital | Yes |
| `toHospital` | ObjectId → Hospital | Yes |
| `requestedBy` | ObjectId → User | Yes |
| `status` | Enum (default PENDING) | Auto |

### Fields lost or degraded during `createReferral`

| Semantic field | Persisted as structured data? | Notes |
|----------------|------------------------------|-------|
| `gender` | **No** | Embedded in `condition` text via `buildReferralCondition()` |
| `diagnosis` | **No** | Primary segment of `condition` string, not queryable |
| `conditionSummary` | **No** | Appended to `condition` string |
| `priority` | **No** | Prefix keyword in `condition` (e.g. "critical priority"); `getReferralPriority()` re-derives from condition text on read |
| `requiredSpecialty` | **No** | Appended as `Specialty: …` in `condition`; doctor allocation uses `specializationMapper` on full condition text |
| `notes` | **No** | Appended as `Notes: …` in `condition` |
| `patientId` | **N/A** | Not collected on form; no model field |

### Fields successfully persisted

| Field | Path |
|-------|------|
| Patient name | `Referral.patientName` |
| Age | `Referral.age` |
| Combined clinical narrative | `Referral.condition` |
| Source / destination hospitals | `Referral.fromHospital`, `Referral.toHospital` |
| Requesting user | `Referral.requestedBy` |
| Initial status | `Referral.status` = `PENDING` |

### Phase 20.2 recommendation (no changes in 20.1)

Add first-class schema fields: `gender`, `priority`, `diagnosis`, `conditionSummary`, `requiredSpecialty`, `notes`, and optionally `patientId`. Migrate `buildReferralCondition()` to populate both structured fields and a display summary.

---

## 5. Socket.IO Payload Typing Audit

### Reconciliation result

All 29 values in `SOCKET_EVENTS` now have entries in `SocketEventPayloadMap`.

| Event | Payload type |
|-------|--------------|
| `notificationCreated` | `NotificationCreatedPayload` |
| `referralAccepted` | `ReferralAcceptedPayload` |
| `bedReserved` | `BedReservedPayload` |
| `reservationExpired` | `ReservationExpiredPayload` |
| `doctorAssigned` | `DoctorAssignedPayload` |
| `dashboardUpdated` | `DashboardUpdatedPayload` |
| `userCreated` | `UserEventPayload` |
| `userUpdated` | `UserEventPayload` |
| `doctorCreated` | `DoctorEventPayload` |
| `doctorUpdated` | `DoctorEventPayload` |
| `hospitalUpdated` | `HospitalEventPayload` |
| `reservationExtended` | `ReservationActionPayload` |
| `reservationCancelled` | `ReservationActionPayload` |
| `patientArrived` | `ReservationActionPayload` |
| `hospitalRegistered` | `HospitalRegisteredPayload` |
| `hospitalApproved` | `HospitalApprovalPayload` |
| `hospitalRejected` | `HospitalApprovalPayload` |
| `hospitalAdminApproved` | `HospitalAdminEventPayload` |
| `hospitalAdminRejected` | `HospitalAdminEventPayload` |
| `doctorRegistered` | `DoctorRegisteredPayload` |
| `doctorApproved` | `DoctorApprovalPayload` |
| `doctorRejected` | `DoctorApprovalPayload` |
| `passwordChanged` | `PasswordChangedPayload` |
| `copilotSessionStarted` | `CopilotEventPayload` |
| `copilotQuestionAsked` | `CopilotEventPayload` |
| `copilotResponseGenerated` | `CopilotEventPayload` |
| `patientSnapshotGenerated` | `CopilotEventPayload` |
| `riskAnalysisGenerated` | `CopilotEventPayload` |

Payload shapes align with server `emitEvent()` calls in `auth.controller.js`, `admin.controller.js`, `doctor.controller.js`, `copilot.controller.js`, and related services.
